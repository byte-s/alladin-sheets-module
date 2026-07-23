import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import { AmoExport, Lead } from '@/lib/db.d';
import { getContact, getPipeline, getStatus, getUser } from '@/lib/db';
import { fromUnixTime, format } from 'date-fns';
import { TZDate } from '@date-fns/tz';

// Боевая таблица (реальный учёт, с зарплатными и другими вкладками).
export const SHEET_ID = '1XHC6r7sFo-yDCq6RPKJzI4OMsoR6USy9MTimAefPzWw';

// В проде ключ приходит из переменной окружения (не коммитим секреты в git).
// Локально для удобства разработки можно держать файл quiet-dryad-creds.json
// в корне проекта — он в .gitignore и никогда не попадёт в репозиторий.
export function loadGoogleCredentials(): { client_email: string; private_key: string } {
    const envJson = process.env.GOOGLE_SHEETS_CREDS_JSON;
    if (envJson) {
        return JSON.parse(envJson);
    }

    const localPath = path.join(process.cwd(), 'quiet-dryad-creds.json');
    return JSON.parse(fs.readFileSync(localPath, 'utf8'));
}

function emptyRow(): AmoExport {
    return {
        link: '', ID: 0, created_at: '', lead_month: '', manager: '', client_name: '',
        lead_name: '', status: '', phone: '', budget: 0, sync_date: '', funnel_stage: '',
        ad_source: '', lead_source: '', communication: '', note_1: '', expected_visit_date: '',
        wholesaler: '', application_date: '', sofa_model: '', sofa_form: '', completeness: '',
        mechanism: '', seat_base: '', base_textile_cost: '', compaion: '', companion_textile_cost: '',
        corner: '', armrests: '', inserts: '', pillows: '', stitching_color: '', additional_options: '',
        deal_place: '', know_source: '', textile_stock: '', textile_order: '', expected_textile_delivery: '',
        textile_footage: '', textile_delivery: '', sofa_number: '', fio_sawer: '', saw_date: '', sawing: '',
        saw_work_cost: '', fio_framer: '', frame_date: '', frame: '', frame_work_cost: '', fio_cutter: '',
        cut_date: '', cutters: '', cut_work_cost: '', fio_sewer: '', sewer_date: '', sewers: '',
        sewer_work_cost: '', fio_upholsterer: '', upholsterer_date: '', upholsterers: '',
        upholsterer_work_cost: '', expected_sofa_done: '', expected_frame_done: '', expected_sewing_done: '',
        seats_quantity: '', otk_accepted: '', remark: '', rise_to_floor: '', rise_price: '', floor: '',
        delivery_variant: '', delivery_cost: '', delivery_address: '', delivery_date: '', pickup_date: '',
        drivers: '', movers: '', pay_date: '', contract_number: '', payment_method: '', bank_loan: '',
        prepayment_received: '', prepayment_amount: '', full_payment: '', balance: '',
        additional_payment_method: '', additional_payment_date: '', saw_link: '', frame_link: '',
        cutter_link: '', sewer_link: '', upholsterer_link: '', boss_link: '', accountant_link: '',
        driver_link: '', saw_work_cost_b: '', frame_work_cost_b: '', cut_work_cost_b: '',
        sewer_work_cost_b: '', upholsterer_work_cost_b: '', note_sawer: '', note_framer: '',
        note_cutter: '', note_sewer: '', note_upholsterer: '', note_otk: '', note_driver: '',
        work_paid_sawer: '', work_paid_framer: '', work_paid_cutter: '', work_paid_sewer: '',
        work_paid_upholsterer: '', accepted: '', cutter: '', issued: '', textile_link: '',
        textile_issued: '', supplier_base: '', supplier_comp: '', textile_order_link: '',
        textile_order_date: '', supplier_base_ext: '', supplier_comp_ext: '', footage_ordered_base: '',
        footage_ordered_comp: '', expected_footage_delivery_base: '', expected_footage_delivery_comp: '',
        footage_received_base: '', footage_received_comp: '', cutting_sequence: '', upholstery_sequence: '',
        pp_invoice_number: '', entry_made: '', dds_article: '', operation_type: '', pl_articles: '',
        payment_type: '', operation_date: '', accural_date: '', sum: '', comment: '', employee: '',
        textile_issued_2: '', wholesaler_accontert: '', virtual_number: '', fio_pickup_driver: '',
        removal_date: '', surcharge_amount: '', otk_date: '', passport_data: '', notes: '',
        fio_accountant: '', return_date: '', return_notes: '', textile_footage_comp: '',
        surcharge_comment: '', return_formula: '', client_email: '', application_number: '',
        piping_color: '',
    };
}

const CUSTOM_FIELD_MAP: Record<string, keyof AmoExport> = {
    'Источник сделки': 'lead_source',
    'Коммуникация': 'communication',
    'Оптовик': 'wholesaler',
    'Модель дивана': 'sofa_model',
    'Форма дивана': 'sofa_form',
    'Комплектность': 'completeness',
    'Механизм': 'mechanism',
    'Основа (сиденье)': 'seat_base',
    'Стоимость ткани (основа)': 'base_textile_cost',
    'Компаньон': 'compaion',
    'Стоимость ткани (компаньон)': 'companion_textile_cost',
    'Угол': 'corner',
    'Подлокотники': 'armrests',
    'Вставки': 'inserts',
    'Подушки': 'pillows',
    'Доп. опции': 'stitching_color',
    'Место сделки': 'deal_place',
    'Откуда узнали?': 'know_source',
    'Ткань в наличии': 'textile_stock',
    'Ткань заказана': 'textile_order',
    'Метраж ткани': 'textile_footage',
    'Номер дивана': 'sofa_number',
    'ФИО распил': 'fio_sawer',
    'Распиловка': 'sawing',
    'Стоимость работы (распил)(Р)': 'saw_work_cost',
    'ФИО каркасчики': 'fio_framer',
    'Каркас': 'frame',
    'Стоимость работы (каркас)(Р)': 'frame_work_cost',
    'ФИО закройщицы': 'fio_cutter',
    'Закройщики': 'cutters',
    'Стоимость работы (закройщик)(Р)': 'cut_work_cost',
    'ФИО швеи': 'fio_sewer',
    'Швеи': 'sewers',
    'Стоимость работы (швея)(Р)': 'sewer_work_cost',
    'ФИО обивщики': 'fio_upholsterer',
    'Обивщики': 'upholsterers',
    'Стоимость работы (обивщик)(Р)': 'upholsterer_work_cost',
    'Кол-во мест': 'seats_quantity',
    'Принял ОТК': 'otk_accepted',
    'Номер заявки': 'application_number',
    'Отстрочка (цвет)': 'piping_color',
    'Примечание': 'remark',
    'Подъем на этаж': 'rise_to_floor',
    'Этаж': 'floor',
    'Стоимость подъема': 'rise_price',
    'Варианты доставки': 'delivery_variant',
    'Сумма доставки': 'delivery_cost',
    'Адрес доставки': 'delivery_address',
    'Водители': 'drivers',
    'Грузчики': 'movers',
    'Номер договора': 'contract_number',
    'Способ оплаты': 'payment_method',
    'Кредит через банк': 'bank_loan',
    'Предоплата получена': 'prepayment_received',
    'Сумма предоплаты': 'prepayment_amount',
    'Оплачено полностью': 'full_payment',
    'Остаток': 'balance',
    'Доплата способ': 'additional_payment_method',
    'Ссылка распил': 'saw_link',
    'Ссылка каркас': 'frame_link',
    'Ссылка закройщик': 'cutter_link',
    'Ссылка швеи': 'sewer_link',
    'Ссылка обивщик': 'upholsterer_link',
    'Ссылка нач. производства': 'boss_link',
    'Ссылка бухгалтер': 'accountant_link',
    'Ссылка водитель': 'driver_link',
    'Стоимость работы распил Б': 'saw_work_cost_b',
    'Стоимость работы каркас Б': 'frame_work_cost_b',
    'Стоимость работы закройщик Б': 'cut_work_cost_b',
    'Стоимость работы швея Б': 'sewer_work_cost_b',
    'Стоимость работы обивщик Б': 'upholsterer_work_cost_b',
    'Примечание (распил)': 'note_sawer',
    'Примечание (каркас)': 'note_framer',
    'Примечание (закройщик)': 'note_cutter',
    'Примечание (швея)': 'note_sewer',
    'Примечание (обивщик)': 'note_upholsterer',
    'Примечание (ОТК)': 'note_otk',
    'Примечание для водителей': 'note_driver',
    'Работа оплачена распил': 'work_paid_sawer',
    'Работа оплачена каркас': 'work_paid_framer',
    'Работа оплачена закройщик': 'work_paid_cutter',
    'Работа оплачена швея': 'work_paid_sewer',
    'Работа оплачена обивщик': 'work_paid_upholsterer',
    'Принят Закройщик': 'accepted',
    'Выдал': 'cutter',
    'Ссылка ткани': 'textile_link',
    'Ткань выдана': 'textile_issued',
    'Поставщик (основ)': 'supplier_base',
    'Поставщик (комп)': 'supplier_comp',
    'Ссылка заказ ткани': 'textile_order_link',
    'Поставщик основа': 'supplier_base_ext',
    'Поставщик комп': 'supplier_comp_ext',
    'Заказан метраж основа': 'footage_ordered_base',
    'Заказан метраж комп': 'footage_ordered_comp',
    'Очередность закрой': 'cutting_sequence',
    'Очередность обивка': 'upholstery_sequence',
    'N счета ПП': 'pp_invoice_number',
    'Внес запись': 'entry_made',
    'Статья ДДС': 'dds_article',
    'Тип операции': 'operation_type',
    'Статьи PL': 'pl_articles',
    'Тип оплаты': 'payment_type',
    'Сумма': 'sum',
    'Комментарий': 'comment',
    'Сотрудник': 'employee',
    'Ткань выдана 2': 'textile_issued_2',
    'Оптовик бух': 'wholesaler_accontert',
    'Виртуальный номер': 'virtual_number',
    'Забрал ФИО водителя': 'fio_pickup_driver',
    'Сумма доплаты': 'surcharge_amount',
    'Серия № паспорта': 'passport_data',
    'Заметки': 'notes',
    'ФИО отв витр': 'fio_accountant',
    'Примечание возврат': 'return_notes',
    'Метраж ткани комп': 'textile_footage_comp',
    'Коментарий по доплате': 'surcharge_comment',
    'Тут зашита формула по метражу': 'return_formula',
};

const DATE_FIELD_MAP: Record<string, keyof AmoExport> = {
    'Прогноз. дата визита': 'expected_visit_date',
    'Дата заявки': 'application_date',
    'Дата выдачи ткани': 'textile_delivery',
    'Дата распил': 'saw_date',
    'Дата каркас': 'frame_date',
    'Дата закрой': 'cut_date',
    'Дата швея': 'sewer_date',
    'Дата обивщик': 'upholsterer_date',
    'Ор-тир. дата готов.дивана': 'expected_sofa_done',
    'Ор-тир. дата готов.каркаса': 'expected_frame_done',
    'Ор-тир. дата готов.шитья': 'expected_sewing_done',
    'Дата доставки': 'delivery_date',
    'Дата самовывоза': 'pickup_date',
    'Дата оплаты': 'pay_date',
    'Дата доплаты': 'additional_payment_date',
    'Дата заказ ткани': 'textile_order_date',
    'Ор дата прих ОСНОВА': 'expected_footage_delivery_base',
    'Ор дата прих КОМП': 'expected_footage_delivery_comp',
    'Дата прихода КОМП': 'footage_received_comp',
    'Дата прихода ОСНОВА': 'footage_received_base',
    'Дата операции': 'operation_date',
    'Дата начисления': 'accural_date',
    'Дата вывоза с адреса': 'removal_date',
    'Дата ОТК': 'otk_date',
    'Дата возврата': 'return_date',
};

// Основные (не кастомные) поля сделки — их русские подписи в боевой таблице.
const CORE_FIELD_LABELS: Record<string, keyof AmoExport> = {
    'Ссылка на сделку': 'link',
    'Дата создания': 'created_at',
    'Месяц сделки': 'lead_month',
    'Менеджер': 'manager',
    'Имя клиента': 'client_name',
    'Наименование сделки': 'lead_name',
    'Статус': 'status',
    'Телефон': 'phone',
    'Бюджет': 'budget',
    'Дата синхр': 'sync_date',
    'Воронка': 'funnel_stage',
};

function normalizeHeader(s: string): string {
    return (s || '').replace(/\s+/g, ' ').trim();
}

// Заголовок таблицы — источник истины для того, в какую колонку что писать.
// Строится один раз: английские ключи (для служебной/тестовой таблицы, где
// заголовки — это сами ключи AmoExport) + русские подписи (для боевой таблицы).
const REVERSE_FIELD_MAP: Record<string, keyof AmoExport> = (() => {
    const map: Record<string, keyof AmoExport> = {};
    for (const key of Object.keys(emptyRow()) as (keyof AmoExport)[]) {
        map[key] = key;
    }
    for (const [label, key] of Object.entries(CUSTOM_FIELD_MAP)) {
        map[normalizeHeader(label)] = key;
    }
    for (const [label, key] of Object.entries(DATE_FIELD_MAP)) {
        map[normalizeHeader(label)] = key;
    }
    for (const [label, key] of Object.entries(CORE_FIELD_LABELS)) {
        map[normalizeHeader(label)] = key;
    }
    return map;
})();

export async function buildLeadRow(leadId: string): Promise<{ tableRow: AmoExport; resBody: Lead } | null> {
    const tableRow = emptyRow();

    const response = await fetch('https://mfalladin55.amocrm.ru/api/v4/leads/' + leadId + '?with=contacts', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + process.env.AMOCRM_API_TOKEN,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    if (!response.ok) {
        return null;
    }

    const resBody: Lead = await response.json();

    let username = '';
    let contactname = null;
    let statusname = '';
    let piplinename = '';

    if (resBody.responsible_user_id) {
        username = await getUser(resBody.responsible_user_id.toString());
    }
    if (resBody._embedded.contacts[0]) {
        contactname = await getContact(resBody._embedded.contacts[0].id.toString());
    }
    if (resBody.pipeline_id && resBody.status_id) {
        statusname = await getStatus(resBody.pipeline_id.toString(), resBody.status_id.toString());
    }
    if (resBody.pipeline_id) {
        piplinename = await getPipeline(resBody.pipeline_id.toString());
    }

    let phoneNumber;
    let emailAddress;
    if (contactname != null) {
        contactname.custom_fields_values.map((a) => {
            if (a.field_code == 'PHONE') {
                a.values.map((c) => {
                    phoneNumber = c.value;
                });
            }
            if (a.field_code == 'EMAIL') {
                a.values.map((c) => {
                    emailAddress = c.value;
                });
            }
        });
    }

    tableRow.link = '=ГИПЕРССЫЛКА("https://mfalladin55.amocrm.ru/leads/detail/' + resBody.id + '"; "Перейти")';
    tableRow.ID = resBody.id;
    tableRow.created_at = format(new TZDate(Number(resBody.created_at) * 1000).withTimeZone('Asia/Omsk'), 'dd/MM/yyyy');
    tableRow.lead_month = format(new Date(fromUnixTime(resBody.created_at).getFullYear(), fromUnixTime(resBody.created_at).getMonth(), 1).toLocaleDateString('ru-RU'), 'dd/MM/yyyy');
    tableRow.manager = username || '';
    tableRow.client_name = contactname ? contactname.name : '';
    tableRow.lead_name = resBody.name;
    tableRow.status = statusname || '';
    tableRow.phone = phoneNumber || '';
    tableRow.client_email = emailAddress || '';
    tableRow.budget = resBody.price;
    tableRow.sync_date = format(new Date(), 'dd/MM/yyyy');
    tableRow.funnel_stage = piplinename || '';

    resBody.custom_fields_values.map((a) => {
        const dateKey = DATE_FIELD_MAP[a.field_name];
        if (dateKey) {
            a.values.map((c) => {
                (tableRow[dateKey] as string) = format(new TZDate(Number(c.value) * 1000).withTimeZone('Asia/Omsk'), 'dd/MM/yyyy');
            });
            return;
        }
        const fieldKey = CUSTOM_FIELD_MAP[a.field_name];
        if (fieldKey) {
            a.values.map((c) => {
                (tableRow[fieldKey] as string) = c.value;
            });
        }
    });

    return { tableRow, resBody };
}

export async function syncLeadToSheet(leadId: string): Promise<{ ok: boolean; message: string }> {
    if (!leadId) {
        return { ok: false, message: 'Не передан ID сделки' };
    }

    const built = await buildLeadRow(leadId);
    if (!built) {
        return { ok: false, message: 'Не успех' };
    }
    const { tableRow, resBody } = built;

    const SCOPES = [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
    ];

    const creds = loadGoogleCredentials();

    const jwt = new JWT({
        email: creds.client_email,
        key: creds.private_key,
        scopes: SCOPES,
    });

    const doc = new GoogleSpreadsheet(SHEET_ID, jwt);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    // Заголовок таблицы никогда не перезаписываем — в боевой таблице от порядка
    // и текста колонок зависят формулы в других вкладках. Читаем его как есть
    // и по нему сопоставляем поля с колонками, а не по фиксированной позиции.
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();

    const rowByHeader: Record<string, string | number> = {};
    for (const header of sheet.headerValues) {
        const fieldKey = REVERSE_FIELD_MAP[normalizeHeader(header)];
        if (!fieldKey) continue;
        rowByHeader[header] = tableRow[fieldKey] ?? '';
    }

    let isExist = false;

    for (const f of rows) {
        if (f.get('ID') == resBody.id) {
            isExist = true;
            for (const [header, value] of Object.entries(rowByHeader)) {
                f.set(header, value);
            }
            await f.save();
        }
    }

    if (!isExist) {
        const addRow = await sheet.addRow(rowByHeader);
        return addRow
            ? { ok: true, message: 'Успех' }
            : { ok: false, message: 'Не успех' };
    }

    return { ok: true, message: 'Успех, значение обновлено' };
}
