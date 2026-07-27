import { syncLeadToSheet } from '@/lib/syncLead';

export const config = {
    api: {
        bodyParser: false, // Disable Next.js's default body parser
    },
};

export async function POST(request: Request) {
    const formData = await request.formData();

    const formDataValues: string[] = [];
    for (const value of formData.values()) {
        formDataValues.push(value.toString());
    }

    try {
        const result = await syncLeadToSheet(formDataValues[0]);
        return Response.json({ text: result.message });
    } catch (err) {
        // Этот эндпоинт дёргает amoCRM-автоматизация по вебхуку — если отдать сюда
        // голый 500 (например, из-за временного 429 от Google Sheets при всплеске
        // запросов), amoCRM начинает ретраить и только усиливает всплеск. Отвечаем
        // 200 в любом случае, ошибку просто логируем.
        console.error('syncLeadToSheet failed', err);
        return Response.json({ text: 'Ошибка синхронизации, см. логи сервера' });
    }
}
