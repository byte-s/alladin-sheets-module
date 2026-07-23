import { AmoExport } from '@/lib/db.d';
import { buildLeadRow } from '@/lib/syncLead';
import { getGoogleOAuthAccessToken } from '@/lib/googleOAuth';

const ROOT_FOLDER_ID = '1tDrlAxZJYi0CTl3LieZwyocNj6BZ3p6J';

// Шаблоны документов (Договор заказа и т.д.) живут в отдельной таблице —
// в боевой их нет. Это специально не совпадает с syncLead.SHEET_ID (боевая таблица,
// куда пишутся строки сделок): источники разные, путать их нельзя.
const TEMPLATE_SHEET_ID = '1d254aRG3bxuUSsL9JrSqPhOzqewI78jAxr384JepP_M';

const TEMPLATE_TABS = [
    'Договор заказ',
    'Договор витрина',
    'Договор перетяжка',
    'Маркировки',
    'Талон доставки',
    'акт приема передачи',
] as const;

// Ячейки-плейсхолдеры в шаблонах — это формулы вида "=Data!AG2", которые в исходной
// таблице подтягивают значение из служебного листа "Data" (= зеркало листа "Исходные").
// Лист "Data" в скопированный документ не переносится, поэтому такие формулы всегда
// дают #REF!, если их не заменить на литеральное значение. Карта ниже восстановлена
// прямым разбором формул всех 6 вкладок исходной таблицы (сверка Data!<ячейка> ->
// заголовок листа "Исходные" -> ключ AmoExport), а не подбором вручную.
const TEMPLATE_FIELD_MAP: Record<string, Record<string, keyof AmoExport>> = {
    'Договор заказ': {
        F1: 'contract_number', I4: 'pay_date', G7: 'client_name', D28: 'deal_place',
        H213: 'client_name', H214: 'delivery_address', H216: 'phone', H217: 'client_email',
        B227: 'manager', E259: 'contract_number', G259: 'pay_date', E265: 'sofa_model',
        E266: 'corner', E267: 'mechanism', E268: 'seat_base', E269: 'compaion',
        E270: 'armrests', E271: 'inserts', E272: 'pillows', E273: 'piping_color',
        E274: 'stitching_color', E275: 'client_name', E276: 'delivery_address', E277: 'phone',
        E278: 'budget', E279: 'prepayment_amount', E280: 'balance', E281: 'delivery_date',
        E282: 'delivery_cost', E283: 'rise_price', E284: 'floor', H290: 'pay_date',
    },
    'Договор витрина': {
        F1: 'contract_number', I4: 'pay_date', G7: 'client_name', D28: 'deal_place',
        H213: 'client_name', H214: 'delivery_address', H216: 'phone', H217: 'client_email',
        B227: 'manager', I238: 'contract_number', I239: 'pay_date', C243: 'client_name',
        H243: 'phone', C245: 'delivery_address', H245: 'delivery_date', D247: 'delivery_cost',
        G247: 'rise_price', I247: 'floor', D252: 'sofa_model', H252: 'budget', D253: 'corner',
        D254: 'mechanism', D255: 'seat_base', D256: 'compaion', B261: 'pay_date',
        D261: 'prepayment_amount', F261: 'balance', E263: 'manager',
    },
    'Договор перетяжка': {
        G1: 'contract_number', J3: 'pay_date', B7: 'client_name', H30: 'budget',
        F34: 'prepayment_amount', H140: 'client_name', H141: 'delivery_address',
        H143: 'phone', H144: 'client_email', B154: 'manager',
    },
    'Маркировки': {
        C2: 'sofa_model', C4: 'stitching_color', C6: 'seat_base', C8: 'sofa_number',
        C10: 'remark', C12: 'delivery_address', C14: 'wholesaler', F14: 'seats_quantity',
        D102: 'sofa_model', D104: 'expected_sofa_done', D105: 'sofa_number',
    },
    'Талон доставки': {
        G9: 'application_number', G11: 'delivery_date', G13: 'pay_date', G15: 'delivery_address',
        G18: 'phone', G20: 'sofa_number', G22: 'sofa_model', G24: 'stitching_color',
        G26: 'corner', G28: 'mechanism', G30: 'seat_base', G32: 'compaion',
        G34: 'prepayment_amount', G36: 'balance', G38: 'delivery_cost', G40: 'rise_price',
        G42: 'floor', G44: 'client_name',
    },
    'акт приема передачи': {
        B3: 'pay_date', B5: 'client_name', B7: 'delivery_address', B9: 'phone',
        A16: 'sofa_model', E16: 'stitching_color',
    },
};

async function driveFetch(url: string, token: string, init?: RequestInit) {
    const res = await fetch(url, {
        ...init,
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
        },
    });
    if (!res.ok) {
        throw new Error(`Drive/Sheets API ${res.status}: ${await res.text()}`);
    }
    return res.json();
}

async function findOrCreateFolder(name: string, parentId: string, token: string): Promise<string> {
    const q = encodeURIComponent(`name='${name.replace(/'/g, "\\'")}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`);
    const list = await driveFetch(
        `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&supportsAllDrives=true&includeItemsFromAllDrives=true`,
        token
    );
    if (list.files && list.files.length > 0) {
        return list.files[0].id;
    }
    const created = await driveFetch('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true', token, {
        method: 'POST',
        body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] }),
    });
    return created.id;
}

export async function generateLeadDocuments(leadId: string): Promise<
    | { ok: true; folderLink: string; docLink: string; spreadsheetId: string }
    | { ok: false; message: string }
> {
    if (!leadId) {
        return { ok: false, message: 'Не передан ID сделки' };
    }

    const built = await buildLeadRow(leadId);
    if (!built) {
        return { ok: false, message: 'Не удалось получить данные сделки' };
    }
    const { tableRow } = built;

    // Файлы создаются от имени реального Google-аккаунта (OAuth), а не сервис-аккаунта —
    // у сервис-аккаунтов нет собственной квоты диска для создания новых файлов.
    const token = await getGoogleOAuthAccessToken();

    const leadFolderId = await findOrCreateFolder(leadId, ROOT_FOLDER_ID, token);
    const docsFolderId = await findOrCreateFolder('Документы', leadFolderId, token);

    // Повторная генерация по той же сделке обновляет уже существующий файл, а не
    // плодит дубликаты — ищем "Документы <leadId>" в папке сделки по имени.
    const docName = `Документы ${leadId}`;
    const existingQ = encodeURIComponent(
        `name='${docName.replace(/'/g, "\\'")}' and '${docsFolderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`
    );
    const existing = await driveFetch(
        `https://www.googleapis.com/drive/v3/files?q=${existingQ}&fields=files(id)&supportsAllDrives=true&includeItemsFromAllDrives=true`,
        token
    );

    let newSpreadsheetId: string;

    if (existing.files && existing.files.length > 0) {
        newSpreadsheetId = existing.files[0].id;
    } else {
        const mainMeta = await driveFetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${TEMPLATE_SHEET_ID}?fields=sheets(properties(sheetId,title))`,
            token
        );
        const sheetIdByTitle: Record<string, number> = {};
        for (const s of mainMeta.sheets) {
            sheetIdByTitle[s.properties.title] = s.properties.sheetId;
        }

        // Сервис-аккаунт не имеет собственной квоты диска, поэтому spreadsheets.create
        // (создающий файл в "личном" Drive аккаунта) вернёт 403. Создаём файл сразу
        // внутри расшаренной папки через Drive API — тогда используется её квота.
        const created = await driveFetch('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true', token, {
            method: 'POST',
            body: JSON.stringify({
                name: docName,
                mimeType: 'application/vnd.google-apps.spreadsheet',
                parents: [docsFolderId],
            }),
        });
        newSpreadsheetId = created.id;
        const newMeta = await driveFetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${newSpreadsheetId}?fields=sheets(properties(sheetId))`,
            token
        );
        const placeholderSheetId: number = newMeta.sheets[0].properties.sheetId;

        const copiedSheetIds: { title: string; sheetId: number }[] = [];
        for (const tab of TEMPLATE_TABS) {
            const sourceSheetId = sheetIdByTitle[tab];
            if (sourceSheetId === undefined) continue;
            const copyResult = await driveFetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${TEMPLATE_SHEET_ID}/sheets/${sourceSheetId}:copyTo`,
                token,
                { method: 'POST', body: JSON.stringify({ destinationSpreadsheetId: newSpreadsheetId }) }
            );
            copiedSheetIds.push({ title: tab, sheetId: copyResult.sheetId });
        }

        await driveFetch(`https://sheets.googleapis.com/v4/spreadsheets/${newSpreadsheetId}:batchUpdate`, token, {
            method: 'POST',
            body: JSON.stringify({
                requests: [
                    ...copiedSheetIds.map((s) => ({
                        updateSheetProperties: {
                            properties: { sheetId: s.sheetId, title: s.title },
                            fields: 'title',
                        },
                    })),
                    { deleteSheet: { sheetId: placeholderSheetId } },
                ],
            }),
        });
    }

    const valueRanges = [] as { range: string; values: string[][] }[];
    for (const tab of TEMPLATE_TABS) {
        const cellMap = TEMPLATE_FIELD_MAP[tab];
        if (!cellMap) continue;
        for (const [cell, field] of Object.entries(cellMap)) {
            // Каждая из этих ячеек в шаблоне — формула "=Data!..." (см. комментарий у
            // TEMPLATE_FIELD_MAP). Лист Data не копируется, поэтому пишем сюда всегда,
            // даже пустую строку — иначе при пустом значении поля формула-ссылка
            // останется как есть и превратится в #REF!.
            const value = tableRow[field];
            const stringValue = value === undefined || value === null ? '' : String(value);
            valueRanges.push({ range: `'${tab}'!${cell}`, values: [[stringValue]] });
        }
    }

    if (valueRanges.length > 0) {
        await driveFetch(`https://sheets.googleapis.com/v4/spreadsheets/${newSpreadsheetId}/values:batchUpdate`, token, {
            method: 'POST',
            body: JSON.stringify({ valueInputOption: 'USER_ENTERED', data: valueRanges }),
        });
    }

    return {
        ok: true,
        folderLink: `https://drive.google.com/drive/folders/${leadFolderId}`,
        docLink: `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}/edit`,
        spreadsheetId: newSpreadsheetId,
    };
}
