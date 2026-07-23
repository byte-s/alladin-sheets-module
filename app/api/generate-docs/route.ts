import { generateLeadDocuments } from '@/lib/generateDocuments';

const FIELD_FOLDER_LINK = 399455;
const FIELD_DOC_LINK = 399457;
const FIELD_SHEET_ID = 399459;

function corsHeaders(origin: string | null) {
    const allowOrigin = origin && /^https:\/\/[a-z0-9-]+\.amocrm\.ru$/i.test(origin)
        ? origin
        : '';
    return {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Vary': 'Origin',
    };
}

async function updateLeadFields(leadId: string, folderLink: string, docLink: string, spreadsheetId: string) {
    await fetch('https://mfalladin55.amocrm.ru/api/v4/leads/' + leadId, {
        method: 'PATCH',
        headers: {
            'Authorization': 'Bearer ' + process.env.AMOCRM_API_TOKEN,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            custom_fields_values: [
                { field_id: FIELD_FOLDER_LINK, values: [{ value: folderLink }] },
                { field_id: FIELD_DOC_LINK, values: [{ value: docLink }] },
                { field_id: FIELD_SHEET_ID, values: [{ value: spreadsheetId }] },
            ],
        }),
    });
}

export async function OPTIONS(request: Request) {
    return new Response(null, {
        status: 204,
        headers: corsHeaders(request.headers.get('origin')),
    });
}

export async function POST(request: Request) {
    const headers = corsHeaders(request.headers.get('origin'));
    let leadId: string | undefined;
    try {
        const body = await request.json();
        leadId = body?.leadId?.toString();
    } catch {
        return Response.json({ text: 'Некорректное тело запроса' }, { status: 400, headers });
    }
    if (!leadId) {
        return Response.json({ text: 'Не передан ID сделки' }, { status: 400, headers });
    }
    try {
        const result = await generateLeadDocuments(leadId);
        if (!result.ok) {
            return Response.json({ text: result.message }, { status: 502, headers });
        }
        await updateLeadFields(leadId, result.folderLink, result.docLink, result.spreadsheetId);
        return Response.json({ text: 'Документы сформированы' }, { status: 200, headers });
    } catch (error) {
        console.error('generateLeadDocuments failed', error);
        return Response.json({ text: 'Внутренняя ошибка сервера' }, { status: 500, headers });
    }
}
