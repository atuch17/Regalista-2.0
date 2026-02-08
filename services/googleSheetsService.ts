
import { Person } from "../types";

// Client ID público y seguro
export const CLIENT_ID = '946698098733-2d8q485ho33r83u9mesrj5hsrl69j3k1.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';

// Lógica de entorno para pruebas vs producción
const IS_PRODUCTION = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

/**
 * Nota sobre Redirect URI:
 * Para el flujo actual de "Popup" (Identity Services), Google utiliza el "JavaScript Origin".
 * Si decidieras cambiar a un flujo de redirección manual, usarías la lógica de abajo:
 */
export const REDIRECT_URI = IS_PRODUCTION 
    ? "https://regalista-946698098733.us-west1.run.app/oauth2callback" 
    : "http://localhost:3000/oauth2callback";

let tokenClient: any;
let gapiInited = false;
let gsirInited = false;

export const isGoogleApiReady = () => gapiInited && gsirInited;

export const initGoogleAuth = (onReady: () => void) => {
    const gapi = (window as any).gapi;
    const google = (window as any).google;

    if (!gapi || !google || !google.accounts) {
        setTimeout(() => initGoogleAuth(onReady), 500);
        return;
    }

    try {
        gapi.load('client', async () => {
            try {
                await gapi.client.init({
                    discoveryDocs: [DISCOVERY_DOC],
                });
                gapiInited = true;
                if (gsirInited) onReady();
            } catch (err) {
                console.error("Error GAPI:", err);
            }
        });

        // El tokenClient se inicializa para el flujo de popup (más cómodo para el usuario)
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '', // Se define en el momento del signIn
        });
        
        console.log(`[Regalista] Entorno: ${IS_PRODUCTION ? 'PRODUCCIÓN' : 'LOCAL'}`);
        console.log(`[Regalista] Origin: ${window.location.origin}`);
        
        gsirInited = true;
        if (gapiInited) onReady();
    } catch (err) {
        console.error("Error inicialización Google:", err);
    }
};

export const signIn = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!tokenClient) {
            return reject(new Error("Los servicios de Google no están listos."));
        }

        let isDone = false;

        const cleanup = () => {
            isDone = true;
            window.removeEventListener('focus', handleFocusCheck);
            clearTimeout(timeout);
        };

        const timeout = setTimeout(() => {
            if (!isDone) {
                cleanup();
                reject(new Error("timeout_reached"));
            }
        }, 60000);

        const handleFocusCheck = () => {
            setTimeout(() => {
                if (!isDone) {
                    cleanup();
                    reject(new Error("popup_closed_by_user"));
                }
            }, 1200);
        };

        window.addEventListener('focus', handleFocusCheck);

        tokenClient.callback = (resp: any) => {
            if (isDone) return;
            cleanup();

            if (resp.error !== undefined) {
                reject(new Error(resp.error));
                return;
            }
            resolve(resp.access_token);
        };
        
        try {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } catch (err) {
            cleanup();
            reject(err);
        }
    });
};

export const findOrCreateDatabase = async (): Promise<string> => {
    const gapi = (window as any).gapi;
    if (!gapi?.client?.sheets) throw new Error("API de Sheets no disponible");
    
    try {
        const response = await gapi.client.sheets.spreadsheets.create({
            resource: { properties: { title: 'RegalistaDB_AppData' } }
        });
        return response.result.spreadsheetId;
    } catch (err) {
        throw new Error("No se pudo crear el archivo. Comprueba los permisos.");
    }
};

export const syncToSheets = async (spreadsheetId: string, data: Person[]) => {
    const gapi = (window as any).gapi;
    if (!gapi?.client?.sheets) return;
    try {
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheetId,
            range: 'Sheet1!A1',
            valueInputOption: 'RAW',
            resource: { values: [[JSON.stringify(data)]] }
        });
    } catch (error) {
        console.error("Sync error:", error);
        throw error;
    }
};

export const loadFromSheets = async (spreadsheetId: string): Promise<Person[]> => {
    const gapi = (window as any).gapi;
    if (!gapi?.client?.sheets) return [];
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: 'Sheet1!A1',
        });
        const content = response.result.values?.[0]?.[0];
        return content ? JSON.parse(content) : [];
    } catch (error) {
        return [];
    }
};
