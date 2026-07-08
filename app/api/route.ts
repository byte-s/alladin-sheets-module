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

    const result = await syncLeadToSheet(formDataValues[0]);

    return Response.json({ text: result.message });
}
