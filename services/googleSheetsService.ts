
import { Person } from "../types";

// Note: In a real production environment, you would use a Client ID from Google Cloud Console.
// For this prototype, we'll assume the environment provides one or we use a placeholder.
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';

let tokenClient: any;
let gapiInited = false;
let gsirInited = false;

export const initGoogleAuth = (onReady: () => void) => {
    const gapi = (window as any).gapi;
    const google = (window as any).google;

    if (!gapi || !google) return;

    gapi.load('client', async () => {
        await gapi.client.init({
            discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        maybeReady(onReady);
    });

    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined at request time
    });
    gsirInited = true;
    maybeReady(onReady);
};

const maybeReady = (onReady: () => void) => {
    if (gapiInited && gsirInited) onReady();
};

export const signIn = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        tokenClient.callback = async (resp: any) => {
            if (resp.error !== undefined) {
                reject(resp);
            }
            resolve(resp.access_token);
        };
        if ((window as any).gapi.client.getToken() === null) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            tokenClient.requestAccessToken({ prompt: '' });
        }
    });
};

export const findOrCreateDatabase = async (): Promise<string> => {
    const gapi = (window as any).gapi;
    const response = await gapi.client.sheets.spreadsheets.create({
        properties: {
            title: 'RegalistaDB_AppData'
        }
    });
    return response.result.spreadsheetId;
};

// Simplified storage: We'll store the entire JSON in the first cell A1 of the first sheet
export const syncToSheets = async (spreadsheetId: string, data: Person[]) => {
    const gapi = (window as any).gapi;
    const json = JSON.stringify(data);
    await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: 'Sheet1!A1',
        valueInputOption: 'RAW',
        resource: {
            values: [[json]]
        }
    });
};

export const loadFromSheets = async (spreadsheetId: string): Promise<Person[]> => {
    const gapi = (window as any).gapi;
    const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: 'Sheet1!A1',
    });
    const content = response.result.values?.[0]?.[0];
    return content ? JSON.parse(content) : [];
};
