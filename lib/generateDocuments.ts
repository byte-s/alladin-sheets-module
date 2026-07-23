import { AmoExport } from '@/lib/db.d';
import { buildLeadRow } from '@/lib/syncLead';
import { getGoogleOAuthAccessToken } from '@/lib/googleOAuth';

const ROOT_FOLDER_ID = '1tDrlAxZJYi0CTl3LieZwyocNj6BZ3p6J';

// Шаблоны документов (Договор заказа и т.д.) живут в отдельной, старой таблице —
// в боевой их нет. Это специально не совпадает с syncLead.SHEET_ID (боевая таблица,
// куда пишутся строки сделок): источники разные, путать их нельзя.
const TEMPLATE_SHEET_ID = '1TRevNsY_rlLxJf4pUqAFTKOuT1esw4ogpY6Os-bknNw';

const TEMPLATE_TABS = [
    'Договор заказ',
    'Договор витрина',
    'Договор перетяжка',
    'Маркировки',
    'Талон доставки',
    'акт приема передачи',
] as const;

// Ячейки-плейсхолдеры восстановлены сверкой пустых шаблонов с уже сгенерированными
// документами по реальным сделкам. Часть редких/неоднозначных ячеек (например,
// разбивка платежей по разным датам) не покрыта и остаётся пустой в новых документах.
const TEMPLATE_FIELD_MAP: Record<string, Record<string, keyof AmoExport>> = {
    'Договор заказ': {
        F1: 'contract_number', I4: 'created_at', G7: 'client_name', D28: 'deal_place',
        H213: 'client_name', H214: 'delivery_address', H216: 'phone', B227: 'manager',
        E259: 'contract_number', G259: 'created_at', E265: 'sofa_model', E266: 'corner',
        E267: 'mechanism', E268: 'seat_base', E269: 'compaion', E270: 'armrests',
        E271: 'inserts', E272: 'pillows', E273: 'stitching_color', E274: 'additional_options',
        E275: 'client_name', E276: 'delivery_address', E277: 'phone', E278: 'budget',
        E279: 'prepayment_amount', E280: 'balance', E283: 'rise_price', E284: 'floor',
        H290: 'created_at',
    },
    'Договор витрина': {
        F1: 'contract_number', I4: 'created_at', G7: 'client_name', D28: 'deal_place',
        H213: 'client_name', H214: 'delivery_address', H216: 'phone', B227: 'manager',
        I238: 'contract_number', I239: 'created_at', C243: 'client_name', H243: 'phone',
        C245: 'delivery_address', G247: 'rise_price', I247: 'floor', D252: 'sofa_model',
        H252: 'budget', D253: 'corner', D254: 'mechanism', D255: 'seat_base', D256: 'compaion',
        B261: 'created_at', D261: 'prepayment_amount', F261: 'balance', E263: 'manager',
    },
    'Договор перетяжка': {
        G1: 'contract_number', J3: 'created_at', B7: 'client_name', H30: 'budget',
        F34: 'prepayment_amount', H140: 'client_name', H141: 'delivery_address',
        H143: 'phone', B154: 'manager',
    },
    'Маркировки': {
        C2: 'sofa_model', H2: 'sofa_model', C4: 'additional_options', H4: 'additional_options',
        C6: 'seat_base', H6: 'seat_base', C12: 'delivery_address', H12: 'delivery_address',
        C16: 'sofa_model', H16: 'sofa_model', C18: 'additional_options', H18: 'additional_options',
        C20: 'seat_base', H20: 'seat_base', C26: 'delivery_address', H26: 'delivery_address',
        C30: 'sofa_model', H30: 'sofa_model', C32: 'additional_options', H32: 'additional_options',
        C34: 'seat_base', H34: 'seat_base', C40: 'delivery_address', H40: 'delivery_address',
        C44: 'sofa_model', H44: 'sofa_model', C46: 'additional_options', H46: 'additional_options',
        C48: 'seat_base', H48: 'seat_base', C54: 'delivery_address', H54: 'delivery_address',
        C67: 'sofa_model', H67: 'sofa_model', C69: 'additional_options', H69: 'additional_options',
        C71: 'seat_base', H71: 'seat_base', C77: 'delivery_address', H77: 'delivery_address',
        C81: 'sofa_model', H81: 'sofa_model', C83: 'additional_options', H83: 'additional_options',
        C85: 'seat_base', H85: 'seat_base', C91: 'delivery_address', H91: 'delivery_address',
        D102: 'sofa_model',
    },
    'Талон доставки': {
        G9: 'application_date', G13: 'created_at', G15: 'delivery_address', G18: 'phone',
        G22: 'sofa_model', G24: 'additional_options', G26: 'corner', G28: 'mechanism',
        G30: 'seat_base', G32: 'compaion', G34: 'prepayment_amount', G36: 'balance',
        G40: 'rise_price', G42: 'floor', G44: 'client_name',
    },
    'акт приема передачи': {
        B3: 'created_at', B5: 'client_name', B7: 'delivery_address', B9: 'phone',
        A16: 'sofa_model', E16: 'additional_options',
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
            name: `Документы ${leadId}`,
            mimeType: 'application/vnd.google-apps.spreadsheet',
            parents: [docsFolderId],
        }),
    });
    const newSpreadsheetId: string = created.id;
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

    const valueRanges = [] as { range: string; values: string[][] }[];
    for (const tab of TEMPLATE_TABS) {
        const cellMap = TEMPLATE_FIELD_MAP[tab];
        if (!cellMap) continue;
        for (const [cell, field] of Object.entries(cellMap)) {
            const value = tableRow[field];
            if (value === undefined || value === null || value === '') continue;
            valueRanges.push({ range: `'${tab}'!${cell}`, values: [[String(value)]] });
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
