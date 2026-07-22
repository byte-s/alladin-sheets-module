import { syncLeadToSheet } from '@/lib/syncLead';

// amoCRM widget scripts run on the account's own *.amocrm.ru subdomain,
// which is a different origin from this app, so CORS must be handled explicitly.
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
        const result = await syncLeadToSheet(leadId);
        return Response.json({ text: result.message }, { status: result.ok ? 200 : 502, headers });
    } catch (error) {
        console.error('syncLeadToSheet failed', error);
        return Response.json({ text: 'Внутренняя ошибка сервера' }, { status: 500, headers });
    }
}
