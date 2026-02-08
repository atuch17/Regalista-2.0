
import { Person, Gift } from "../types";

export const CLIENT_ID = '946698098733-2d8q485ho33r83u9mesrj5hsrl69j3k1.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly';
const SHEETS_DISCOVERY = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const DRIVE_DISCOVERY = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

export const IS_PRODUCTION = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

let tokenClient: any;
let gapiInited = false;
let gsirInited = false;
let cachedSheetName: string | null = localStorage.getItem('google_sheet_name');

const getErrorMessage = (err: any): string => {
    try {
        if (!err) return "Error desconocido";
        if (typeof err === 'string') return err;
        if (err.status === 401) return "SESION_CADUCADA: Tu sesión de Google ha expirado. Por favor, pulsa el icono de Google para reconectar.";
        if (err.error_description) return err.error_description;
        const resultError = err.result?.error;
        if (resultError) return resultError.message || JSON.stringify(resultError);
        return err.message || JSON.stringify(err);
    } catch (e) {
        return "Error crítico de conexión";
    }
};

const getFirstSheetName = async (spreadsheetId: string): Promise<string> => {
    if (cachedSheetName) return cachedSheetName;
    const gapi = (window as any).gapi;
    try {
        const response = await gapi.client.sheets.spreadsheets.get({ spreadsheetId });
        const name = response.result.sheets[0].properties.title;
        cachedSheetName = name;
        localStorage.setItem('google_sheet_name', name);
        return name;
    } catch (err) {
        return "Sheet1";
    }
};

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMessage)), timeoutMs))
    ]);
};

export const isGoogleApiReady = () => gapiInited && gsirInited;

export const initGoogleAuth = (onReady: () => void) => {
    const gapi = (window as any).gapi;
    const google = (window as any).google;
    if (!gapi || !google || !google.accounts) {
        setTimeout(() => initGoogleAuth(onReady), 1000);
        return;
    }
    gapi.load('client', async () => {
        try {
            await gapi.client.init({ discoveryDocs: [SHEETS_DISCOVERY, DRIVE_DISCOVERY] });
            gapiInited = true;
            if (gsirInited) onReady();
        } catch (err) {
            gapiInited = true; 
            if (gsirInited) onReady();
        }
    });
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: () => {}, 
    });
    gsirInited = true;
};

export const signIn = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!tokenClient) return reject(new Error("Servicios no listos."));
        tokenClient.callback = (resp: any) => {
            if (resp.error !== undefined) return reject(new Error(getErrorMessage(resp)));
            resolve(resp.access_token);
        };
        tokenClient.requestAccessToken({ prompt: 'select_account' });
    });
};

export const findOrCreateDatabase = async (): Promise<string> => {
    const gapi = (window as any).gapi;
    const operation = async () => {
        const searchResponse = await gapi.client.drive.files.list({
            q: "name = 'Regalista_CloudData' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false",
            fields: 'files(id, name)',
            spaces: 'drive'
        });
        const existingFile = searchResponse.result.files?.[0];
        if (existingFile) return existingFile.id;
        const createResponse = await gapi.client.sheets.spreadsheets.create({
            resource: { 
                properties: { title: 'Regalista_CloudData' },
                sheets: [{ properties: { title: 'Datos_Regalista' } }]
            }
        });
        return createResponse.result.spreadsheetId;
    };
    return withTimeout(operation(), 20000, "Error de acceso a Drive.");
};

const formatGiftsForExcel = (gifts: Gift[]): string => {
    return gifts.map(g => `${g.name}${g.price ? ` (${g.price}€)` : ''} [${g.status}]`).join('; ');
};

export const syncToSheets = async (spreadsheetId: string, data: Person[]) => {
    const gapi = (window as any).gapi;
    if (!gapi?.client?.sheets) throw new Error("API de Sheets no cargada");
    
    const sheetName = await getFirstSheetName(spreadsheetId);
    const headers = ["ID_INTERNO", "NOMBRE", "CUMPLEAÑOS", "AÑO", "COLOR", "FAVORITO", "RESUMEN_REGALOS", "JSON_COMPLETO"];
    const rows = data.map(person => [
        person.id,
        person.name,
        person.birthday,
        person.birthYear || "",
        person.color,
        person.isFavorite ? "SÍ" : "NO",
        formatGiftsForExcel(person.gifts),
        JSON.stringify(person)
    ]);

    const values = [headers, ...rows];

    const operation = async () => {
        try {
            await gapi.client.sheets.spreadsheets.values.clear({
                spreadsheetId: spreadsheetId,
                range: `'${sheetName}'!A1:Z1000`,
            });

            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: spreadsheetId,
                range: `'${sheetName}'!A1`,
                valueInputOption: 'RAW',
                resource: { values: values }
            });

            await gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: spreadsheetId,
                resource: {
                    requests: [
                        {
                            repeatCell: {
                                range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1 },
                                cell: {
                                    userEnteredFormat: {
                                        backgroundColor: { red: 0.31, green: 0.27, blue: 0.9 },
                                        textFormat: { 
                                            foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 }, 
                                            bold: true 
                                        },
                                        horizontalAlignment: "CENTER"
                                    }
                                },
                                fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
                            }
                        },
                        {
                            updateSheetProperties: {
                                properties: { sheetId: 0, gridProperties: { frozenRowCount: 1 } },
                                fields: "gridProperties.frozenRowCount"
                            }
                        }
                    ]
                }
            });
        } catch (err) {
            throw new Error(getErrorMessage(err));
        }
    };

    return withTimeout(operation(), 15000, "Error al sincronizar tabla.");
};

export const loadFromSheets = async (spreadsheetId: string): Promise<Person[]> => {
    const gapi = (window as any).gapi;
    if (!gapi?.client?.sheets) return [];
    
    const sheetName = await getFirstSheetName(spreadsheetId);
    
    const operation = async () => {
        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: `'${sheetName}'!A2:H1000`,
            });
            
            const rows = response.result.values;
            if (!rows || rows.length === 0) return [];

            return rows.map((row: any[]) => {
                const jsonPart = row[7];
                if (jsonPart) {
                    try {
                        return JSON.parse(jsonPart);
                    } catch (e) {
                        return {
                            id: row[0] || crypto.randomUUID(),
                            name: row[1] || "Sin nombre",
                            birthday: row[2] || "1 de Enero",
                            birthYear: row[3] ? parseInt(row[3]) : undefined,
                            color: (row[4] as any) || "slate",
                            isFavorite: row[5] === "SÍ",
                            gifts: []
                        };
                    }
                }
                return null;
            }).filter(p => p !== null);
        } catch (err) {
            throw new Error(getErrorMessage(err));
        }
    };

    return withTimeout(operation(), 15000, "Error al descargar tabla.");
};
