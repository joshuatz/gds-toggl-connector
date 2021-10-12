/**
 * @author Joshua Tzucker
 * @file gds-types.ts
 * Extending the @types/google-apps-script with some GDS specific types
 * REMINDER: DO NOT USE 'GoogleAppsScript' in a way that will force it to show up in generated JS. Should only be used as interface; does not actually exist as obj in GAS online.
 */

// https://developers.google.com/datastudio/connector/reference#defaultaggregationtype
export const aggregationTypeEnum = DataStudioApp.createCommunityConnector().AggregationType;

export interface SchemaRequest {
    configParams: object;
    scriptParams: object;
}

export interface FieldObjNameOnly {
    name: string;
}

/**
 * https://developers.google.com/datastudio/connector/reference#request_example_3
 * Note: Fields correspond to names provided by getSchema/getFields
 */
export interface GetDataRequest {
    configParams?: {
        [index: string]: any;
    };
    scriptParams?: {
        sampleExtraction?: boolean;
        lastRefresh?: string;
    };
    dateRange: {
        startDate: string;
        endDate: string;
    };
    fields: Array<FieldObjNameOnly>;
}

export interface DataReturnObjRow {
    values: Array<any>;
}

export interface GetDataReturnObj {
    schema: Array<{}> | Array<DataStudioFieldBuilt>;
    rows: Array<DataReturnObjRow>;
    cachedData: boolean;
}

// https://developers.google.com/datastudio/connector/reference#datatype
export enum DataStudioSchemaDataType {
    'STRING',
    'NUMBER',
    'BOOLEAN'
}

// https://developers.google.com/datastudio/connector/semantics
// This should be an obj output, per field, as result of Fields.build()
interface DataStudioFieldBuilt {
    dataType: DataStudioSchemaDataType;
    name: string;
    label: string;
    descrption?: string;
    isDefault?: boolean;
    semantics: {
        conceptType: 'DIMENSION' | 'METRIC';
        semanticType: GoogleAppsScript.Data_Studio.FieldType;
        semanticGroup?: GoogleAppsScript.Data_Studio.FieldType;
        isReaggregatable?: boolean;
    };
}

/**
 * make sure to grab enum from DataStudioApp, not GoogleAppsScript, since that won't exist in GAS online
 */
export const fieldTypeEnum = DataStudioApp.createCommunityConnector().FieldType;

// I've hardcoded this as an obj, because `export const enum` causes a LOT of issues with TS in various spots (testing, mocking, etc), because of how it get transpiled
export const fieldTypeEnumObj: { [index: string]: GoogleAppsScript.Data_Studio.FieldType } = {
    YEAR: 0,
    YEAR_QUARTER: 1,
    YEAR_MONTH: 2,
    YEAR_WEEK: 3,
    YEAR_MONTH_DAY: 4,
    YEAR_MONTH_DAY_HOUR: 5,
    QUARTER: 6,
    MONTH: 7,
    WEEK: 8,
    MONTH_DAY: 9,
    DAY_OF_WEEK: 10,
    DAY: 11,
    HOUR: 12,
    MINUTE: 13,
    DURATION: 14,
    COUNTRY: 15,
    COUNTRY_CODE: 16,
    CONTINENT: 17,
    CONTINENT_CODE: 18,
    SUB_CONTINENT: 19,
    SUB_CONTINENT_CODE: 20,
    REGION: 21,
    REGION_CODE: 22,
    CITY: 23,
    CITY_CODE: 24,
    METRO: 25,
    METRO_CODE: 26,
    LATITUDE_LONGITUDE: 27,
    NUMBER: 28,
    PERCENT: 29,
    TEXT: 30,
    BOOLEAN: 31,
    URL: 32,
    HYPERLINK: 33,
    IMAGE: 34,
    IMAGE_LINK: 35,
    CURRENCY_AED: 36,
    CURRENCY_ALL: 37,
    CURRENCY_ARS: 38,
    CURRENCY_AUD: 39,
    CURRENCY_BDT: 40,
    CURRENCY_BGN: 41,
    CURRENCY_BOB: 42,
    CURRENCY_BRL: 43,
    CURRENCY_CAD: 44,
    CURRENCY_CDF: 45,
    CURRENCY_CHF: 46,
    CURRENCY_CLP: 47,
    CURRENCY_CNY: 48,
    CURRENCY_COP: 49,
    CURRENCY_CRC: 50,
    CURRENCY_CZK: 51,
    CURRENCY_DKK: 52,
    CURRENCY_DOP: 53,
    CURRENCY_EGP: 54,
    CURRENCY_ETB: 55,
    CURRENCY_EUR: 56,
    CURRENCY_GBP: 57,
    CURRENCY_HKD: 58,
    CURRENCY_HRK: 59,
    CURRENCY_HUF: 60,
    CURRENCY_IDR: 61,
    CURRENCY_ILS: 62,
    CURRENCY_INR: 63,
    CURRENCY_IRR: 64,
    CURRENCY_ISK: 65,
    CURRENCY_JMD: 66,
    CURRENCY_JPY: 67,
    CURRENCY_KRW: 68,
    CURRENCY_LKR: 69,
    CURRENCY_LTL: 70,
    CURRENCY_MNT: 71,
    CURRENCY_MVR: 72,
    CURRENCY_MXN: 73,
    CURRENCY_MYR: 74,
    CURRENCY_NOK: 75,
    CURRENCY_NZD: 76,
    CURRENCY_PAB: 77,
    CURRENCY_PEN: 78,
    CURRENCY_PHP: 79,
    CURRENCY_PKR: 80,
    CURRENCY_PLN: 81,
    CURRENCY_RON: 82,
    CURRENCY_RSD: 83,
    CURRENCY_RUB: 84,
    CURRENCY_SAR: 85,
    CURRENCY_SEK: 86,
    CURRENCY_SGD: 87,
    CURRENCY_THB: 88,
    CURRENCY_TRY: 89,
    CURRENCY_TWD: 90,
    CURRENCY_TZS: 91,
    CURRENCY_UAH: 92,
    CURRENCY_USD: 93,
    CURRENCY_UYU: 94,
    CURRENCY_VEF: 95,
    CURRENCY_VND: 96,
    CURRENCY_YER: 97,
    CURRENCY_ZAR: 98
};
