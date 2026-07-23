// Получение access token от имени реального Google-аккаунта (владельца диска),
// а не сервис-аккаунта. Нужен для создания новых файлов на Google Диске —
// у сервис-аккаунтов нет собственной квоты хранилища, поэтому spreadsheets.create
// / drive.files.create от их имени всегда возвращает "storage quota exceeded".
// Refresh token выпускается один раз вручную (см. README) и живёт в env.

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

export async function getGoogleOAuthAccessToken(): Promise<string> {
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
        return cachedToken.accessToken;
    }

    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('Не заданы GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET / GOOGLE_OAUTH_REFRESH_TOKEN');
    }

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        }),
    });

    if (!res.ok) {
        throw new Error(`Не удалось обновить Google OAuth токен: ${res.status} ${await res.text()}`);
    }

    const json = await res.json();
    cachedToken = {
        accessToken: json.access_token,
        expiresAt: Date.now() + json.expires_in * 1000,
    };
    return cachedToken.accessToken;
}
