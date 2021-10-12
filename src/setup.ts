/**
 * Some app-wide constants
 */
export const enum debugLevels {
    OFF = 0,
    LOW,
    MEDIUM,
    HIGH
}
export const DEBUG_LEVEL: debugLevels = debugLevels.MEDIUM;
const AUTH_HELP_URL: string = 'https://track.toggl.com/profile';
// Lookup key under which user-supplied API key is stored in PropertiesService.getUserProperties
const APIKEY_STORAGE: string = 'dscc.key';
const APP_USER_AGENT: string = 'https://github.com/joshuatz/gds-toggl-connector';
const VALUE_FOR_NULL: any = '';
