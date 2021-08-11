!function r(e,t,n){function o(u,f){if(!t[u]){if(!e[u]){var c="function"==typeof require&&require;if(!f&&c)return c(u,!0);if(i)return i(u,!0);var a=new Error("Cannot find module '"+u+"'");throw a.code="MODULE_NOT_FOUND",a}var l=t[u]={exports:{}};e[u][0].call(l.exports,function(r){var t=e[u][1][r];return o(t?t:r)},l,l.exports,r,e,t,n)}return t[u].exports}for(var i="function"==typeof require&&require,u=0;u<n.length;u++)o(n[u]);return o}({1:[function(r,e,t){"use strict";r("./index").polyfill()},{"./index":2}],2:[function(r,e,t){"use strict";function n(r,e){if(void 0===r||null===r)throw new TypeError("Cannot convert first argument to object");for(var t=Object(r),n=1;n<arguments.length;n++){var o=arguments[n];if(void 0!==o&&null!==o)for(var i=Object.keys(Object(o)),u=0,f=i.length;u<f;u++){var c=i[u],a=Object.getOwnPropertyDescriptor(o,c);void 0!==a&&a.enumerable&&(t[c]=o[c])}}return t}function o(){Object.assign||Object.defineProperty(Object,"assign",{enumerable:!1,configurable:!0,writable:!0,value:n})}e.exports={assign:n,polyfill:o}},{}]},{},[1]);

"use strict";
/**
 * @author Joshua Tzucker
 * @file gds-types.ts
 * Extending the @types/google-apps-script with some GDS specific types
 * REMINDER: DO NOT USE 'GoogleAppsScript' in a way that will force it to show up in generated JS. Should only be used as interface; does not actually exist as obj in GAS online.
 */
// https://developers.google.com/datastudio/connector/reference#defaultaggregationtype
var aggregationTypeEnum = DataStudioApp.createCommunityConnector().AggregationType;
// https://developers.google.com/datastudio/connector/reference#datatype
var DataStudioSchemaDataType;
(function (DataStudioSchemaDataType) {
    DataStudioSchemaDataType[DataStudioSchemaDataType["STRING"] = 0] = "STRING";
    DataStudioSchemaDataType[DataStudioSchemaDataType["NUMBER"] = 1] = "NUMBER";
    DataStudioSchemaDataType[DataStudioSchemaDataType["BOOLEAN"] = 2] = "BOOLEAN";
})(DataStudioSchemaDataType || (DataStudioSchemaDataType = {}));
/**
 * make sure to grab enum from DataStudioApp, not GoogleAppsScript, since that won't exist in GAS online
 */
var fieldTypeEnum = DataStudioApp.createCommunityConnector().FieldType;
// I've hardcoded this as an obj, because `export const enum` causes a LOT of issues with TS in various spots (testing, mocking, etc), because of how it get transpiled
var fieldTypeEnumObj = { "YEAR": 0, "YEAR_QUARTER": 1, "YEAR_MONTH": 2, "YEAR_WEEK": 3, "YEAR_MONTH_DAY": 4, "YEAR_MONTH_DAY_HOUR": 5, "QUARTER": 6, "MONTH": 7, "WEEK": 8, "MONTH_DAY": 9, "DAY_OF_WEEK": 10, "DAY": 11, "HOUR": 12, "MINUTE": 13, "DURATION": 14, "COUNTRY": 15, "COUNTRY_CODE": 16, "CONTINENT": 17, "CONTINENT_CODE": 18, "SUB_CONTINENT": 19, "SUB_CONTINENT_CODE": 20, "REGION": 21, "REGION_CODE": 22, "CITY": 23, "CITY_CODE": 24, "METRO": 25, "METRO_CODE": 26, "LATITUDE_LONGITUDE": 27, "NUMBER": 28, "PERCENT": 29, "TEXT": 30, "BOOLEAN": 31, "URL": 32, "HYPERLINK": 33, "IMAGE": 34, "IMAGE_LINK": 35, "CURRENCY_AED": 36, "CURRENCY_ALL": 37, "CURRENCY_ARS": 38, "CURRENCY_AUD": 39, "CURRENCY_BDT": 40, "CURRENCY_BGN": 41, "CURRENCY_BOB": 42, "CURRENCY_BRL": 43, "CURRENCY_CAD": 44, "CURRENCY_CDF": 45, "CURRENCY_CHF": 46, "CURRENCY_CLP": 47, "CURRENCY_CNY": 48, "CURRENCY_COP": 49, "CURRENCY_CRC": 50, "CURRENCY_CZK": 51, "CURRENCY_DKK": 52, "CURRENCY_DOP": 53, "CURRENCY_EGP": 54, "CURRENCY_ETB": 55, "CURRENCY_EUR": 56, "CURRENCY_GBP": 57, "CURRENCY_HKD": 58, "CURRENCY_HRK": 59, "CURRENCY_HUF": 60, "CURRENCY_IDR": 61, "CURRENCY_ILS": 62, "CURRENCY_INR": 63, "CURRENCY_IRR": 64, "CURRENCY_ISK": 65, "CURRENCY_JMD": 66, "CURRENCY_JPY": 67, "CURRENCY_KRW": 68, "CURRENCY_LKR": 69, "CURRENCY_LTL": 70, "CURRENCY_MNT": 71, "CURRENCY_MVR": 72, "CURRENCY_MXN": 73, "CURRENCY_MYR": 74, "CURRENCY_NOK": 75, "CURRENCY_NZD": 76, "CURRENCY_PAB": 77, "CURRENCY_PEN": 78, "CURRENCY_PHP": 79, "CURRENCY_PKR": 80, "CURRENCY_PLN": 81, "CURRENCY_RON": 82, "CURRENCY_RSD": 83, "CURRENCY_RUB": 84, "CURRENCY_SAR": 85, "CURRENCY_SEK": 86, "CURRENCY_SGD": 87, "CURRENCY_THB": 88, "CURRENCY_TRY": 89, "CURRENCY_TWD": 90, "CURRENCY_TZS": 91, "CURRENCY_UAH": 92, "CURRENCY_USD": 93, "CURRENCY_UYU": 94, "CURRENCY_VEF": 95, "CURRENCY_VND": 96, "CURRENCY_YER": 97, "CURRENCY_ZAR": 98 };
var DEBUG_LEVEL = 2 /* MEDIUM */;
var AUTH_HELP_URL = 'https://track.toggl.com/profile';
// Lookup key under which user-supplied API key is stored in PropertiesService.getUserProperties
var APIKEY_STORAGE = 'dscc.key';
var APP_USER_AGENT = 'https://github.com/joshuatz/gds-toggl-connector';
var VALUE_FOR_NULL = '';
/**
 * @author Joshua Tzucker
 * @file helpers.ts
 */
function leftPad(input, padWith, length) {
    var output = input;
    while (output.length < length) {
        output = padWith + output;
    }
    return output;
}
// Based on https://stackoverflow.com/a/6394168/11447682
// Returns undefined if can't find it in recursion
function recurseFromString(obj, dotNotatString) {
    return dotNotatString.split('.').reduce(function (obj, i) {
        return typeof (obj) === 'object' ? obj[i] : undefined;
    }, obj);
}
/**
 * Wrapper around various converter methods
 */
var Converters = /** @class */ (function () {
    function Converters() {
    }
    Converters.getQuarterFromMonth = function (month) {
        if (month <= 3) {
            return 1;
        }
        else if (month > 3 && month <= 6) {
            return 2;
        }
        else if (month > 6 && month <= 9) {
            return 3;
        }
        else if (month > 9 && month <= 12) {
            return 4;
        }
    };
    Converters.getDateParts = function (dateToFormat) {
        var year = dateToFormat.getFullYear().toString();
        var monthInt = dateToFormat.getMonth() + 1;
        var month = monthInt.toString();
        var day = (dateToFormat.getDate()).toString();
        var hours = dateToFormat.getHours();
        var quarter = Converters.getQuarterFromMonth(monthInt);
        var dateParts = {
            year: year,
            month: month,
            monthPadded: leftPad(month, '0', 2),
            quarter: quarter,
            day: day,
            dayPadded: leftPad(day, '0', 2),
            hours: hours,
            hoursPadded: leftPad(hours.toString(), '0', 2),
            isoWeek: Converters.getWeekNumber(dateToFormat)
        };
        return dateParts;
    };
    /**
     * Converts a date or date like string into the "2019-06-25" format for Toggl endpoints
     * @param date - Input date obj, or string, to format
     * @returns {string}
     */
    Converters.formatDateForTogglApi = function (date) {
        try {
            var dateToFormat = typeof (date) === 'string' ? (new Date(date)) : date;
            var dateParts = Converters.getDateParts(dateToFormat);
            var togglFormattedDate = [dateParts.year, dateParts.monthPadded, dateParts.dayPadded].join('-');
            return togglFormattedDate;
        }
        catch (e) {
            return '';
        }
    };
    // https://stackoverflow.com/a/6117889
    Converters.getWeekNumber = function (input) {
        var d = new Date(input.getTime());
        var dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((+d - +yearStart) / 86400000) + 1) / 7);
    };
    /**
     * Formats any given date (or parseable date string) into a GDS formatted date
     * See: https://developers.google.com/datastudio/connector/reference#semantictype
     * @param date {Date|string} - Date to format
     * @param gdsDateType - A GDS fieldtype enum value that corresponds to a GDS DATETIME format
     * @returns {string}
     */
    Converters.formatDateForGds = function (date, gdsDateType) {
        var fieldTypes = DataStudioApp.createCommunityConnector().FieldType;
        try {
            var dateToFormat = typeof (date) === 'string' ? (new Date(date)) : new Date(date.getTime());
            var dateParts = Converters.getDateParts(dateToFormat);
            var dateString = '';
            if (gdsDateType === fieldTypes.YEAR) {
                // 2017
                dateString = dateParts.year;
            }
            else if (gdsDateType === fieldTypes.YEAR_QUARTER) {
                // 20171
                dateString = dateParts.year + dateParts.quarter;
            }
            else if (gdsDateType === fieldTypes.YEAR_MONTH) {
                // 201703
                dateString = dateParts.year + dateParts.monthPadded;
            }
            else if (gdsDateType === fieldTypes.YEAR_WEEK) {
                // 201707
                dateString = dateParts.year + dateParts.isoWeek;
            }
            else if (gdsDateType === fieldTypes.YEAR_MONTH_DAY) {
                // 20170317
                dateString = dateParts.year + dateParts.monthPadded + dateParts.dayPadded;
            }
            else if (gdsDateType === fieldTypes.YEAR_MONTH_DAY_HOUR) {
                // 2017031400
                dateString = dateParts.year + dateParts.monthPadded + dateParts.dayPadded + dateParts.hoursPadded;
            }
            return dateString.toString();
        }
        catch (e) {
            return '';
        }
    };
    /**
     * This method is really just to remind me that the conversion is necessary; Toggl returns MS, GDS expects seconds. (and as string)
     * @param togglDurationMs {number} - The duration returned directly from a Toggl API endpoint (should be in MS)
     * @returns {string}
     */
    Converters.togglDurationToGdsDuration = function (togglDurationMs) {
        return (togglDurationMs / 1000).toString();
    };
    /**
     * Converts the date strings that GDS passes in requests, such as getData(), into true Date object
     * @param gdsDashedDate - The date passed by GDS (usually in getData())
     * @return {Date}
     */
    Converters.gdsDateRangeDateToDay = function (gdsDashedDate) {
        // GDS date range start & end are in format "2019-06-28"
        var pattern = /(\d{4})-(\d{2})-(\d{2})/;
        var match = pattern.exec(gdsDashedDate);
        if (match) {
            var year = parseInt(match[1], 10);
            var month = parseInt(match[2], 10) - 1;
            var day = parseInt(match[3], 10);
            return (new Date(year, month, day));
        }
        else {
            return new Date(gdsDashedDate);
        }
    };
    /**
     * Ensures that a {number} is always passed to GDS for a currency field.
     * @param amount - the amount of money to format into a GDS formatted amount
     * @return {number}
     */
    Converters.formatCurrencyForGds = function (amount) {
        if (amount) {
            if (typeof (amount) === 'string') {
                return parseFloat(amount);
            }
            else {
                return amount;
            }
        }
        else {
            return 0.00;
        }
    };
    Converters.forceBoolean = function (input) {
        if (typeof (input) === 'boolean') {
            return input;
        }
        else {
            return false;
        }
    };
    return Converters;
}());
/**
 * Logging
 */
var myConsole = /** @class */ (function () {
    function myConsole() {
    }
    /**
     * Formats any given input into a suitable format for StackDriver logging (e.g. wrapping in object)
     * @param thing - Thing you show in the Stackdriver log
     */
    myConsole.formatThingForConsole = function (thing) {
        var result = thing;
        if (typeof (thing) === 'object') {
            result = {
                message: JSON.stringify(thing)
            };
        }
        else if (typeof (thing) === 'string') {
            result = {
                message: thing
            };
        }
        else {
            if (thing && typeof (thing.toString) === 'function') {
                result = {
                    message: thing.toString()
                };
            }
            else {
                result = thing;
            }
        }
        return result;
    };
    myConsole.log = function (thing, level) {
        if (level === void 0) { level = 1 /* LOW */; }
        if (DEBUG_LEVEL >= level) {
            console.log(myConsole.formatThingForConsole(thing));
        }
    };
    myConsole.error = function (thing, level) {
        if (level === void 0) { level = 1 /* LOW */; }
        if (DEBUG_LEVEL >= level) {
            console.error(myConsole.formatThingForConsole(thing));
        }
    };
    return myConsole;
}());
/**
 * Polyfill setTimeout
 * !!! - DO NOT REMOVE - GLOBAL FUNC - !!!
 */
function setTimeout(cb, ms) {
    Utilities.sleep(ms);
    cb();
}
/**
 * Wrapper class around a bunch of date methods. Probably should have just import moment.js instead of hand coding ¯\_(ツ)_/¯
 */
var DateUtils = /** @class */ (function () {
    function DateUtils() {
    }
    DateUtils.getIsDateInDateTimeRange = function (dateTimeToCheck, startDateTime, endDateTime) {
        return dateTimeToCheck >= startDateTime && dateTimeToCheck <= endDateTime;
    };
    DateUtils.getIsDateWithinXDaysOf = function (dateTimeToCheck, dateToSetRangeAround, xDaysAround) {
        xDaysAround = Math.abs(xDaysAround);
        var rangeStart = DateUtils.offsetDateByDays(dateToSetRangeAround, (-1 * xDaysAround));
        var rangeEnd = DateUtils.offsetDateByDays(dateToSetRangeAround, xDaysAround);
        return DateUtils.getIsDateInDateTimeRange(dateTimeToCheck, rangeStart, rangeEnd);
    };
    DateUtils.offsetDateByDays = function (input, offsetDays) {
        var offsetMs = offsetDays * 24 * 60 * 60 * 1000;
        var resultDate = new Date(input.getTime() + offsetMs);
        return resultDate;
    };
    DateUtils.forceDateToStartOfDay = function (input) {
        var result = new Date(input.getTime());
        result.setUTCHours(0, 0, 0, 0);
        return result;
    };
    DateUtils.forceDateToEndOfDay = function (input) {
        var result = new Date(input.getTime());
        result.setUTCHours(23, 59, 59, 999);
        return result;
    };
    return DateUtils;
}());
/**
 * Wrapper around some generic exceptions
 */
var Exceptions = /** @class */ (function () {
    function Exceptions() {
    }
    Exceptions.throwGenericApiErr = function () {
        cc.newUserError()
            .setDebugText('Something wrong with result from API')
            .setText('API responded, but something went wrong')
            .throwException();
        return false;
    };
    return Exceptions;
}());
/**
 * Wrapper around using the GoogleAppsScript.Cache
 */
var CacheWrapper = /** @class */ (function () {
    function CacheWrapper() {
    }
    /**
     * Generates a key of pipe-separated values - should look like "123|{'user':'joshua'}|ABC"
     * @param inputs Array of anything to use for composite key
     */
    CacheWrapper.generateKeyFromInputs = function (inputs) {
        var key = (new Date()).getTime().toString();
        if (inputs.length > 0) {
            key = '';
            for (var x = 0; x < inputs.length; x++) {
                key += (x > 0 ? '|' : '') + myStringifer(inputs[x]);
            }
        }
        return key;
    };
    /**
     * Check if the cache contains a value for a set of inputs
     * @param cache - An instance of the GAS Cache
     * @param inputs - An array of parameters that can be combined to form a composite storage key
     */
    CacheWrapper.queryCacheForInputs = function (cache, inputs) {
        var key = CacheWrapper.generateKeyFromInputs(inputs);
        return cache.get(key);
    };
    return CacheWrapper;
}());
/**
 * Helper function to stringify {any}
 * @param input - Anything to stringify
 */
function myStringifer(input) {
    var result = '';
    if (typeof (input) === 'object') {
        result = JSON.stringify(input);
    }
    else if (typeof (input) === 'string') {
        result = input;
    }
    else if (typeof (input.toString) === 'function') {
        result = input.toString();
    }
    return result;
}
var usedTogglResponseTypes;
(function (usedTogglResponseTypes) {
    usedTogglResponseTypes[usedTogglResponseTypes["TogglDetailedReportResponse"] = 0] = "TogglDetailedReportResponse";
    usedTogglResponseTypes[usedTogglResponseTypes["TogglWeeklyReportResponse"] = 1] = "TogglWeeklyReportResponse";
    usedTogglResponseTypes[usedTogglResponseTypes["TogglSummaryReportResponse"] = 2] = "TogglSummaryReportResponse";
})(usedTogglResponseTypes || (usedTogglResponseTypes = {}));
var usedToggleResponseEntriesTypes;
(function (usedToggleResponseEntriesTypes) {
    usedToggleResponseEntriesTypes[usedToggleResponseEntriesTypes["TogglDetailedEntry"] = 0] = "TogglDetailedEntry";
    usedToggleResponseEntriesTypes[usedToggleResponseEntriesTypes["TogglWeeklyProjectGroupedEntry"] = 1] = "TogglWeeklyProjectGroupedEntry";
    usedToggleResponseEntriesTypes[usedToggleResponseEntriesTypes["TogglWeeklyUserGroupedEntry"] = 2] = "TogglWeeklyUserGroupedEntry";
    usedToggleResponseEntriesTypes[usedToggleResponseEntriesTypes["TogglSummaryEntry"] = 3] = "TogglSummaryEntry";
})(usedToggleResponseEntriesTypes || (usedToggleResponseEntriesTypes = {}));
var TogglApi = /** @class */ (function () {
    function TogglApi(authToken, userAgent) {
        if (authToken === void 0) { authToken = ''; }
        if (userAgent === void 0) { userAgent = APP_USER_AGENT; }
        this._userApiBase = 'https://api.track.toggl.com/api/v8';
        this._reportApiBase = 'https://api.track.toggl.com/reports/api/v2';
        // From docs: Limits will and can change during time, but a safe window will be 1 request per second.
        this._stepOffDelay = 1100;
        this._authToken = (authToken || '');
        this._userAgent = (userAgent || APP_USER_AGENT);
    }
    TogglApi.getResponseTemplate = function (success, raw) {
        if (success === void 0) { success = false; }
        if (raw === void 0) { raw = {}; }
        var response = {
            success: success,
            raw: raw
        };
        return response;
    };
    TogglApi.delaySync = function (ms) {
        // This should be blocking/sync by default - no need to wrap in promise or callback
        Utilities.sleep(ms);
    };
    /**
     * Assemble the headers object for use with UrlFetchApp
     */
    TogglApi.prototype._getAuthHeaders = function () {
        return {
            "headers": {
                "Content-Type": 'application/json',
                "Authorization": this.assembleAuthHeader()
            }
        };
    };
    TogglApi.prototype.getBasicAcctInfo = function () {
        var url = this._userApiBase + TogglApi.endpoints.user.me_simple;
        try {
            var apiResponse = UrlFetchApp.fetch(url, this._getAuthHeaders());
            return TogglApi.parseJsonResponse(apiResponse);
        }
        catch (e) {
            myConsole.error(e, 1 /* LOW */);
            return TogglApi.getResponseTemplate(false);
        }
    };
    TogglApi.prototype.getDetailsReportAllPages = function (workspaceId, since, until, filterToBillable, startPage) {
        var MAX_PAGES = 30;
        filterToBillable = typeof (filterToBillable) === 'boolean' ? filterToBillable : false;
        // @TODO limit number of pages requested? Return userError if exceeded?
        var currPage = (startPage || 1);
        var done = false;
        try {
            var startResult = this.getDetailedReport(workspaceId, since, until, currPage, filterToBillable);
            // Need to check for pagination...
            if (startResult.success && startResult.raw['per_page'] && startResult.raw['total_count']) {
                var numPerPage = startResult.raw['per_page'];
                var fetchedNum = numPerPage * currPage;
                var totalCount = startResult.raw['total_count'];
                var totalPages = totalCount / numPerPage;
                var resultArr = startResult.raw['data'];
                // Limit API calls - this should only trigger on a huge date range
                if (totalPages > MAX_PAGES) {
                    // Return early with error
                    cc.newUserError()
                        .setText('Too many entries requested. Please narrow your date range')
                        .throwException();
                    return TogglApi.getResponseTemplate(false);
                }
                if (fetchedNum < totalCount) {
                    // Need to make request for next page.
                    // make sure to be aware of toggl 1 req/sec advice
                    var finalResult = startResult;
                    myConsole.log('getDetailsReportAllPages - starting pagination', 3 /* HIGH */);
                    while (!done) {
                        TogglApi.delaySync(this._stepOffDelay);
                        currPage++;
                        myConsole.log('Current Page = ' + currPage, 3 /* HIGH */);
                        var currResult = this.getDetailedReport(workspaceId, since, until, currPage, filterToBillable);
                        if (currResult.success && Array.isArray(currResult.raw['data'])) {
                            fetchedNum = numPerPage * currPage;
                            done = (fetchedNum < totalCount);
                            // Concat arrays
                            resultArr = resultArr.concat(currResult.raw['data']);
                        }
                        else {
                            done = true;
                        }
                    }
                    // Return result with array modified to include concatenated results from pages
                    finalResult.raw['data'] = resultArr;
                    return finalResult;
                }
                else {
                    done = true;
                    myConsole.log('Detailed Report - only single page of results', 3 /* HIGH */);
                    return startResult;
                }
            }
            else {
                done = true;
                return startResult;
            }
        }
        catch (e) {
            myConsole.error(e, 1 /* LOW */);
            throw (e);
        }
    };
    TogglApi.prototype.getDetailedReport = function (workspaceId, since, until, page, filterToBillable) {
        filterToBillable = typeof (filterToBillable) === 'boolean' ? filterToBillable : false;
        var filterToBillableString = filterToBillable == true ? 'yes' : 'both';
        var currPage = (page || 1);
        var requestParams = {
            workspace_id: workspaceId,
            user_agent: this._userAgent,
            since: since,
            until: until,
            page: currPage,
            billable: filterToBillableString
        };
        var url = this._reportApiBase + TogglApi.endpoints.reports.detailed;
        url = TogglApi.requestParamsToQueryString(requestParams, url);
        try {
            var apiResponse = UrlFetchApp.fetch(url, this._getAuthHeaders());
            var result = TogglApi.parseJsonResponse(apiResponse);
            return result;
        }
        catch (e) {
            myConsole.error(e, 1 /* LOW */);
            throw (e);
        }
    };
    TogglApi.prototype.getSummaryReport = function (workspaceId, since, until, grouping, subgrouping, filterToBillable) {
        if (grouping === void 0) { grouping = 'projects'; }
        if (subgrouping === void 0) { subgrouping = 'time_entries'; }
        filterToBillable = typeof (filterToBillable) === 'boolean' ? filterToBillable : false;
        var filterToBillableString = filterToBillable == true ? 'yes' : 'both';
        var requestParams = {
            workspace_id: workspaceId,
            user_agent: this._userAgent,
            since: since,
            until: until,
            grouping: grouping,
            subgrouping: subgrouping,
            billable: filterToBillableString
        };
        // Check for valid combinations - subgrouping cannot be same as grouping
        if (grouping === subgrouping) {
            cc.newDebugError()
                .setText('Invalid combination of grouping and subgrouping in getSummaryReport request')
                .throwException();
            return TogglApi.getResponseTemplate(false);
        }
        var url = this._reportApiBase + TogglApi.endpoints.reports.summary;
        url = TogglApi.requestParamsToQueryString(requestParams, url);
        try {
            var apiResponse = UrlFetchApp.fetch(url, this._getAuthHeaders());
            var result = TogglApi.parseJsonResponse(apiResponse);
            return result;
        }
        catch (e) {
            myConsole.error(e, 1 /* LOW */);
            throw (e);
        }
    };
    TogglApi.prototype.getWeeklyReport = function () {
        // @TODO ? - not really necessary for GDS implementation
    };
    TogglApi.prototype.getWorkspaceIds = function () {
        var url = this._userApiBase + TogglApi.endpoints.user.workspaces;
        try {
            var apiResponse = UrlFetchApp.fetch(url, this._getAuthHeaders());
            var result = TogglApi.parseJsonResponse(apiResponse);
            return result;
        }
        catch (e) {
            myConsole.error(e, 1 /* LOW */);
            throw (e);
        }
    };
    TogglApi.prototype.assembleAuthHeader = function () {
        return 'Basic ' + Utilities.base64Encode(this._authToken + ':api_token');
    };
    TogglApi.prototype.setAuthToken = function (authToken) {
        this._authToken = authToken;
    };
    /**
     * Tries to determine if a HTTP response is valid, and if not, determine why (auth vs rate limit)
     * @param response {GoogleAppsScript.URL_Fetch.HTTPResponse} - A response from UrlFetchApp
     * @returns {{[index:string]:any}}
     */
    TogglApi.checkResponseValid = function (response) {
        var validResponse = true;
        var validAuth = true;
        var rateLimited = false;
        if (typeof (response.getResponseCode) !== 'function') {
            validResponse = false;
        }
        else {
            if (response.getResponseCode() !== 200) {
                validResponse = false;
                if (response.getResponseCode() === 403) {
                    // Forbidden
                    validAuth = false;
                }
                else if (response.getResponseCode() === 429) {
                    // Rate limited
                    rateLimited = true;
                    // @TODO start back-off procedure and delay/sleep until ready
                }
            }
        }
        if (typeof (response.getContentText) !== 'function') {
            validResponse = false;
        }
        else {
            if (response.getContentText().length < 3) {
                validResponse = false;
            }
        }
        return {
            valid: validResponse,
            auth: validAuth,
            rateLimited: rateLimited
        };
    };
    /**
     * Simple wrapper around parsing JSON response from API with try/catch
     * @param response {object} - {success:bool, data: responseJson}
     */
    TogglApi.parseJsonResponse = function (response) {
        var parsed = TogglApi.getResponseTemplate();
        var json = {};
        var valid = this.checkResponseValid(response).valid;
        if (valid) {
            try {
                json = JSON.parse(response.getContentText('utf-8'));
            }
            catch (e) {
                valid = false;
            }
        }
        parsed.success = valid;
        parsed.raw = json;
        return parsed;
    };
    /**
     * A helper function to turn key/value pairs object into stringified query string for GET endpoint
     * @param requestParams A set of key/value pairs that correspond to a given toggl endpoint and are accepted as querystring params to control the response.
     */
    TogglApi.requestParamsToQueryString = function (requestParams, urlToAppendTo) {
        var finalQueryString = '';
        var finalResult = '';
        var index = 0;
        for (var key in requestParams) {
            var val = requestParams[key];
            var stringifiedVal = '';
            // Date
            if (typeof (val.getTime) === 'function') {
                stringifiedVal = Converters.formatDateForTogglApi(val);
            }
            // Array
            else if (Array.isArray(val)) {
                // Toggl uses comma sep vals, to calling Array.toString() should be fine.
                stringifiedVal = val.toString();
            }
            // boolean
            else if (typeof (val) === 'boolean') {
                // Toggl accepts boolean as string, not binary, so keep to "true" or "false"
                stringifiedVal = val.toString();
            }
            else if (typeof (val) === 'number') {
                stringifiedVal = val.toString();
            }
            else if (typeof (val) === 'string') {
                stringifiedVal = val;
            }
            else {
                // This should not get hit, but just in case...
                stringifiedVal = val.toString();
            }
            // Actually join together
            if (index > 0) {
                finalQueryString += '&';
            }
            finalQueryString += key + '=' + encodeURI(stringifiedVal);
            index++;
        }
        if (urlToAppendTo) {
            if (/\?/.test(urlToAppendTo)) {
                finalResult = urlToAppendTo + '&' + finalQueryString;
            }
            else {
                finalResult = urlToAppendTo + '?' + finalQueryString;
            }
        }
        else {
            finalResult = finalQueryString;
        }
        return finalResult;
    };
    TogglApi.endpoints = {
        user: {
            me_simple: "/me?with_related_data=false",
            me_full: "/me?with_related_data=true",
            workspaces: "/workspaces"
        },
        reports: {
            weekly: "/weekly",
            detailed: "/details",
            summary: "/summary"
        }
    };
    return TogglApi;
}());
/**
 * @author Joshua Tzucker
 * @file main.ts
 * Note: @override is used to denote function that is required and expected by connector implementation
 * REMINDER: DO NOT USE 'GoogleAppsScript' in a way that will force it to show up in generated JS. Should only be used as interface; does not actually exist as obj in GAS online.
 *      - That is why I have called some enums at the start and stored as var, so they can be referenced instead
 * @TODO - How to deal with currency?
 *      - I could always return USD, and leave it up to user to know what their Toggl setting is and convert on their own...
 *      - I have to tell GDS the currency in advance, so if I wanted it to be dynamic based on Toggl setting, I would have to make double API calls...
 *      - Messy but reliable option: make a field for every single currency Toggl might return, and then map based on response
 * @TODO - handle "alltime" query?
 */
/**
 * MAIN - Setup globals
 */
// init connector
var cc = DataStudioApp.createCommunityConnector();
// Create global instance of toggl api class
var togglApiInst = new TogglApi(getUserApiKey());
/**
 * @override
 * This is used by Data Studio to build the configuration UI screen that the user enters settings on first run
 */
function getConfig() {
    // Get config obj provided by gds-connector
    var config = cc.getConfig();
    // Get list of workspace IDs that the user has access to
    var foundWorkspaces = false;
    try {
        var workspaceResponse = togglApiInst.getWorkspaceIds();
        if (workspaceResponse.success && Array.isArray(workspaceResponse.raw)) {
            var workspaceArr = workspaceResponse.raw;
            var workspaceSelectConfigField = config.newSelectSingle()
                .setId('workspaceId')
                .setName('Toggl Workspace')
                .setHelpText('Select the Workspace to pull data from')
                .setAllowOverride(false);
            for (var x = 0; x < workspaceArr.length; x++) {
                var currWorkspace = workspaceArr[x];
                workspaceSelectConfigField.addOption(config.newOptionBuilder().setLabel(currWorkspace.name).setValue(currWorkspace.id.toString()));
            }
            foundWorkspaces = true;
        }
    }
    catch (e) {
        foundWorkspaces = false;
    }
    if (!foundWorkspaces) {
        // Fallback to plain text field
        config.newTextInput()
            .setId('workspaceId')
            .setName('Toggl Workspace ID')
            .setHelpText('Numerical ID for your workspace')
            .setPlaceholder('123456');
    }
    // Set config general info
    config.newInfo()
        .setId('instructions')
        .setText('Configure the connector for Toggl');
    // Require workspace ID (necessary for all report API calls)
    // Allow pre-filtering to just billable time
    config.newCheckbox()
        .setId('prefilterBillable')
        .setName('Pre-filter Billable')
        .setHelpText('Pre-filter all reports to just "billable" time (as configured in Toggl)');
    // Require date range to be sent with every data request
    config.setDateRangeRequired(true);
    // Make sure to return the built config
    return config.build();
}
/**
 * Add a custom field to a connector
 * @param fieldsObj  - an existing group of fields, generated through connector.getFields();
 * @param fieldToAdd - New field to add to connector, following internal syntax
 */
function addField(fieldsObj, fieldToAdd) {
    var chain;
    // Dimension vs Metric
    if (fieldToAdd.semantics.conceptType === 'DIMENSION') {
        chain = fieldsObj.newDimension();
    }
    else {
        chain = fieldsObj.newMetric();
    }
    // Field ID and Name
    chain.setId(fieldToAdd.id);
    chain.setName(fieldToAdd.name);
    // OPT: Description
    if (typeof (fieldToAdd.description) === 'string') {
        chain.setDescription(fieldToAdd.description);
    }
    // Semantics
    chain.setType(fieldToAdd.semantics.semanticType);
    if (fieldToAdd.semantics.isReaggregatable && typeof (fieldToAdd.semantics.aggregationType) !== 'undefined') {
        chain.setIsReaggregatable(true);
        chain.setAggregation(fieldToAdd.semantics.aggregationType);
    }
    // Custom Formula / Calculated Field
    if (fieldToAdd.formula && fieldToAdd.formula.length > 0) {
        chain.setFormula(fieldToAdd.formula);
    }
    // Return the whole field object
    return chain;
}
/**
 * @override
 * Kept as separate function from getSchema, so it can be reused with getData()
 * https://developers.google.com/datastudio/connector/reference#getschema
 * List of types: https://developers.google.com/datastudio/connector/reference#datatype
 */
function getFields() {
    var fields = cc.getFields();
    var fieldKeys = Object.keys(myFields);
    for (var x = 0; x < fieldKeys.length; x++) {
        addField(fields, myFields[fieldKeys[x]]);
    }
    return fields;
}
/**
 * @override
 */
function getSchema(request) {
    return { schema: getFields().build() };
}
/**
 * @override
 * https://developers.google.com/datastudio/connector/reference#getdata
 * Should return: https://developers.google.com/datastudio/connector/reference#response_3
 *   - Schema and rows should match in length (one should be the dimension used)
 *   - Response should match what was requested {request.fields}
 *   - Data types - https://developers.google.com/datastudio/connector/reference#semantictype
 * Notes:
 *   - Badly documented, but the array of field names [{name:"foobar"}] is misleading - they are not names, they are the original IDs of the fields...
 *        - Furthermore, schema should be the result of Fields.build(), which has specialized output that looks like this:
 *               // [{
 *               //     "dataType": "STRING",
 *               //     "name": "day",
 *               //     "label": "Date",
 *               //     "semantics": {
 *               //         "conceptType": "DIMENSION",
 *               //         "semanticType": "YEAR_MONTH_DAY"
 *               //     }
 *               // }, {
 *               //     "dataType": "STRING",
 *               //     "name": "time",
 *               //     "description": "Logged Time",
 *               //     "label": "Time",
 *               //     "semantics": {
 *               //         "isReaggregatable": true,
 *               //         "conceptType": "METRIC",
 *               //         "semanticType": "DURATION"
 *               //     }
 *               // }]
 *   - Rows is also confusing - instead of each column (dimension|metric) being an object with a values array that contains rows, it is that each row is an object with a values array that contains columns.
 */
function getData(request) {
    myConsole.log(request, 2 /* MEDIUM */);
    var now = new Date();
    var userCache = CacheService.getUserCache();
    // Grab fields off incoming request
    var unorderedRequestedFieldIds = request.fields.map(function (field) { return field.name; }); // ['day','time','cost',...]
    var requestedFields = getFields().forIds(unorderedRequestedFieldIds);
    var orderedRequestedFieldIds = requestedFields.asArray().map(function (field) { return field.getId() || ''; });
    // What the final result should look like
    var returnData = {
        "cachedData": false,
        "schema": requestedFields.build(),
        "rows": []
    };
    // FLAG - request is missing required info
    var blocker = false;
    var blockerReason = '';
    // FLAG - is there a reason to avoid using cache?
    var avoidCache = false;
    var foundInCache = false;
    // Grab date stuff off incoming request
    var lastRefreshedTime;
    if (typeof (request.scriptParams) === 'object' && typeof (request.scriptParams.lastRefresh) === 'string') {
        lastRefreshedTime = new Date(request.scriptParams.lastRefresh);
    }
    else {
        lastRefreshedTime = new Date(new Date().getTime() - (12 * 60 * 60 * 1000));
    }
    var dateRangeStart = DateUtils.forceDateToStartOfDay(Converters.gdsDateRangeDateToDay(request.dateRange.startDate));
    var dateRangeEnd = DateUtils.forceDateToEndOfDay(Converters.gdsDateRangeDateToDay(request.dateRange.endDate));
    // Avoid cache if either end of range is within 2 days of today - since users are more likely to have recently edited entries within that span
    if (DateUtils.getIsDateWithinXDaysOf(dateRangeStart, now, 2) || DateUtils.getIsDateWithinXDaysOf(dateRangeEnd, now, 2)) {
        avoidCache = true;
    }
    // Certain things in what is requested can change how route used to retrieve data...
    var canUseDetailedReport = true;
    var canUseWeeklyProjectReport = true;
    var canUseWeeklyUserReport = true;
    var canUseSummaryReport = true;
    for (var x = 0; x < orderedRequestedFieldIds.length; x++) {
        var fieldId = orderedRequestedFieldIds[x];
        canUseDetailedReport = !canUseDetailedReport ? canUseDetailedReport : getIsFieldInResponseEntryType(fieldId, 'TogglDetailedEntry');
        canUseWeeklyProjectReport = !canUseWeeklyProjectReport ? canUseWeeklyProjectReport : getIsFieldInResponseEntryType(fieldId, 'TogglWeeklyProjectGroupedEntry');
        canUseWeeklyUserReport = !canUseWeeklyUserReport ? canUseWeeklyUserReport : getIsFieldInResponseEntryType(fieldId, 'TogglWeeklyUserGroupedEntry');
        canUseSummaryReport = !canUseSummaryReport ? canUseSummaryReport : getIsFieldInResponseEntryType(fieldId, 'TogglSummaryEntry');
    }
    var dateDimensionRequired = orderedRequestedFieldIds.indexOf('day') !== -1;
    var projectDimensionRequired = (orderedRequestedFieldIds.indexOf('projectId') !== -1 || orderedRequestedFieldIds.indexOf('projectName') !== -1);
    // Config options
    var workspaceId = -1;
    var prefilterBillable = false;
    // Extract config configParams
    if (request.configParams && typeof (request.configParams) === 'object') {
        if (typeof (request.configParams['workspaceId']) !== 'undefined') {
            try {
                workspaceId = parseInt(request.configParams['workspaceId'], 10);
            }
            catch (e) {
                blocker = true;
                blockerReason = 'Workspace ID is required for all requests!';
            }
        }
        else {
            blocker = true;
            blockerReason = 'Workspace ID is required for all requests!';
        }
        prefilterBillable = request.configParams['prefilterBillable'] == true;
    }
    // Early return if anything is missing
    if (blocker) {
        cc.newUserError()
            .setDebugText(blockerReason)
            .setText(blockerReason)
            .throwException();
        return false;
    }
    try {
        if (!dateDimensionRequired && canUseSummaryReport) {
            // If dateDimensionRequired is false, and uses has requested project or client details, we can query the summary endpoint and group by project|client
            var grouping = (projectDimensionRequired ? 'projects' : 'clients');
            var res = TogglApi.getResponseTemplate(false);
            var cacheKey = CacheWrapper.generateKeyFromInputs([workspaceId, dateRangeStart, dateRangeEnd, grouping, 'time_entries', prefilterBillable]);
            if (!avoidCache) {
                try {
                    var cacheValue = userCache.get(cacheKey);
                    if (cacheValue) {
                        res = JSON.parse(cacheValue);
                        foundInCache = true;
                        myConsole.log('Used Cache!', 3 /* HIGH */);
                    }
                }
                catch (e) {
                    foundInCache = false;
                }
            }
            if (!foundInCache) {
                res = togglApiInst.getSummaryReport(workspaceId, dateRangeStart, dateRangeEnd, grouping, 'time_entries', prefilterBillable);
                myConsole.log('No cache used for response', 3 /* HIGH */);
            }
            if (res.success) {
                // Map to getData rows
                returnData.rows = mapTogglResponseToGdsFields(requestedFields, orderedRequestedFieldIds, dateRangeStart, dateRangeEnd, res.raw, usedTogglResponseTypes.TogglSummaryReportResponse, usedToggleResponseEntriesTypes.TogglSummaryEntry, grouping);
                if (!foundInCache && returnData.rows.length > 0) {
                    // Cache results
                    userCache.put(cacheKey, JSON.stringify(res));
                }
                returnData.cachedData = foundInCache;
                return returnData;
            }
            else {
                return Exceptions.throwGenericApiErr();
            }
        }
        else if (!dateDimensionRequired && (canUseWeeklyProjectReport || canUseWeeklyUserReport)) {
            // @TODO
            cc.newDebugError()
                .setText('getData request resulted in trying to use getWeeklyReport, which has not been built yet')
                .throwException();
        }
        else if (dateDimensionRequired || canUseDetailedReport) {
            myConsole.log('dateDimensionRequired', 3 /* HIGH */);
            // The only request type that a date dimension is the detailed report
            var res = TogglApi.getResponseTemplate(false);
            var cacheKey = CacheWrapper.generateKeyFromInputs([workspaceId, dateRangeStart, dateRangeEnd, prefilterBillable]);
            if (!avoidCache) {
                try {
                    var cacheValue = userCache.get(cacheKey);
                    if (cacheValue) {
                        res = JSON.parse(cacheValue);
                        foundInCache = true;
                        myConsole.log('Used Cache!', 3 /* HIGH */);
                    }
                }
                catch (e) {
                    foundInCache = false;
                }
            }
            if (!foundInCache) {
                res = togglApiInst.getDetailsReportAllPages(workspaceId, dateRangeStart, dateRangeEnd, prefilterBillable);
                myConsole.log('No cache used for response', 3 /* HIGH */);
            }
            if (res.success) {
                // Map to getData rows
                returnData.rows = mapTogglResponseToGdsFields(requestedFields, orderedRequestedFieldIds, dateRangeStart, dateRangeEnd, res.raw, usedTogglResponseTypes.TogglDetailedReportResponse, usedToggleResponseEntriesTypes.TogglDetailedEntry);
                if (!foundInCache && returnData.rows.length > 0) {
                    // Cache results
                    userCache.put(cacheKey, JSON.stringify(res));
                }
                returnData.cachedData = foundInCache;
                myConsole.log(returnData, 3 /* HIGH */);
                return returnData;
            }
            else {
                return Exceptions.throwGenericApiErr();
            }
        }
        else {
            cc.newUserError()
                .setDebugText('No API call was made, could not determine endpoint based on dimensions requested')
                .setText('Invalid combination of dimensions')
                .throwException();
            myConsole.error('No API call was made, could not determine endpoint based on dimensions requested', 1 /* LOW */);
        }
    }
    catch (err) {
        cc.newUserError()
            .setDebugText(err.toString())
            .setText('Something went wrong fetching from Toggl')
            .throwException();
        myConsole.error(err, 1 /* LOW */);
    }
}
/**
 * @override
 */
function isAdminUser() {
    // No spam please :)
    var email = 'am9zaHVhLnR6QGdtYWlsLmNvbQ==';
    return Utilities.base64EncodeWebSafe(Session.getEffectiveUser().getEmail(), Utilities.Charset.UTF_8) === email;
}
/**
 * Maps a Toggl API response to GDS formatted rows to return inside getData()
 * Things to note:
 *      - Everything needs to be aggregated by dimension and # needs to match; e.g. if GDS requests two dimensions (columns), only two data points per row should be returned
 * @param requestedFields
 * @param requestedFieldIds
 * @param requestedStart
 * @param requestedEnd
 * @param response
 * @param responseType
 * @param entryType
 * @param requestedGrouping
 */
function mapTogglResponseToGdsFields(requestedFields, requestedFieldIds, requestedStart, requestedEnd, response, responseType, entryType, requestedGrouping) {
    // Need to get literal string key from enum
    var entryTypeStringIndex = usedToggleResponseEntriesTypes[entryType];
    var mappedData = [];
    response.data = Array.isArray(response.data) ? response.data : [];
    var entryArr = response.data;
    if (responseType === usedTogglResponseTypes.TogglSummaryReportResponse) {
        // Each summary entry also contains a sub-array of entries that are grouped to that summary item. I am going to copy up and reaggregate certain values off that subarray, adding them to the parent entry
        // For example, one entry with three sub items would stay one entry, but have the averages of those three subitems added as new props
        for (var x = 0; x < entryArr.length; x++) {
            var entryBase = entryArr[x];
            if (Array.isArray(entryBase['items']) && entryBase.items.length > 0) {
                var cBillingRate = 0;
                var totalBillingSum = 0;
                var totalBillingTime = 0;
                for (var s = 0; s < entryBase.items.length; s++) {
                    var subItem = entryBase.items[s];
                    cBillingRate += typeof (subItem.rate) === 'number' ? subItem.rate : 0;
                    var subItemBillingSum = typeof (subItem.sum) === 'number' ? subItem.sum : 0;
                    totalBillingSum += subItemBillingSum;
                    if (subItemBillingSum > 0) {
                        // Time was billable
                        totalBillingTime += subItem.time;
                    }
                }
                // Add calculated
                entryBase['avgBillingRate'] = cBillingRate / entryBase.items.length;
                entryBase['totalBillingSum'] = totalBillingSum;
                entryBase['totalBillingTime'] = totalBillingTime;
            }
        }
    }
    var suppressedRowCount = 0;
    // Loop over response entries - [ROWS]
    for (var x = 0; x < entryArr.length; x++) {
        // Flag - suppress row being passed to GDS
        var suppressRow = false;
        var entry = entryArr[x];
        var row = {
            values: []
        };
        // lets do some pre-processing, per entry
        if (responseType === usedTogglResponseTypes.TogglDetailedReportResponse) {
            // If billable, copy time amount as new prop
            if (entry.isBillable === true) {
                entry['billableTime'] = entry.dur;
            }
        }
        else if (responseType === usedTogglResponseTypes.TogglSummaryReportResponse) {
            // Summary reports can be grouped - and the ID field in response changes to match
            if (requestedGrouping === 'projects') {
                entry['pid'] = entry.id;
            }
            else if (requestedGrouping === 'clients') {
                entry['cid'] = entry.id;
            }
            else if (requestedGrouping === 'users') {
                entry['uid'] = entry.id;
            }
        }
        else if (responseType === usedTogglResponseTypes.TogglWeeklyReportResponse) {
            // @TODO ?
        }
        // Iterate over requested fields [COLUMNS]
        for (var x_1 = 0; x_1 < requestedFieldIds.length; x_1++) {
            var fieldMapping = myFields[requestedFieldIds[x_1]];
            // Make sure to pass *something* to GDS for every requested field!
            var valueToPass = null;
            if (fieldMapping) {
                valueToPass = extractValueFromEntryWithMapping(entry, fieldMapping, entryTypeStringIndex);
            }
            if (fieldMapping.id === 'day' && fieldMapping.semantics.conceptType === 'DIMENSION') {
                // !!! - Special - !!!
                // Sometimes Toggl will return entries that overlap days. This can lead to the dreaded "number of columns returned don't match requested" error from GDS if blinding returning a date that GDS did not actually request.
                if (typeof (fieldMapping.togglMapping) === 'object') {
                    // Take care to make copy so not modifying reference
                    var augmentedMapping = {
                        id: fieldMapping.id,
                        name: fieldMapping.name,
                        semantics: fieldMapping.semantics,
                        togglMapping: {
                            fields: fieldMapping.togglMapping.fields,
                            formatter: function (date) {
                                // Convert Toggl date to true Date Obj
                                // Note - Toggl includes Timezone with date ("start":"2019-06-28T18:54:50-07:00"), so remove it to make compatible with checking date range (with uses GMT)
                                var convertedDate = new Date(date.replace(/(\d{4}-\d{2}-\d{2}T[^-]+-).*/, '$100:00'));
                                return convertedDate;
                            }
                        }
                    };
                    var fieldDate = extractValueFromEntryWithMapping(entry, augmentedMapping, entryTypeStringIndex);
                    if (!DateUtils.getIsDateInDateTimeRange(fieldDate, requestedStart, requestedEnd)) {
                        suppressRow = true;
                        suppressedRowCount++;
                    }
                }
            }
            row.values.push(valueToPass);
        }
        // Push the entire entry row to results
        if (!suppressRow) {
            mappedData.push(row);
        }
    }
    if (suppressedRowCount > 0) {
        myConsole.log('Suppressed ' + suppressedRowCount.toString() + ' rows based on misaligned date', 3 /* HIGH */);
    }
    return mappedData;
}
/**
 * Extracts the value from a Toggl API response entry, and converts it based on the destination GDS column
 * @param entry {object} - An entry off a Toggl API response
 * @param fieldMapping {fieldMapping} - My stored mapping of fields. Should contain semantics
 * @param entryTypeStringIndex {string} - Toggl entry type enum, converted to string
 * @return {any} - always returns a value, with VALUE_FOR_NULL global being the placeholder if no mapping was found. GDS always expects a value in column
 */
function extractValueFromEntryWithMapping(entry, fieldMapping, entryTypeStringIndex) {
    var extractedValue = VALUE_FOR_NULL;
    var togglMapping = fieldMapping.togglMapping;
    if (togglMapping) {
        // Look up the individual field mappings
        var fields = togglMapping.fields[entryTypeStringIndex];
        if (fields) {
            // Iterate over field keys
            var foundVals = [];
            for (var x = 0; x < fields.length; x++) {
                var val = recurseFromString(entry, fields[x]);
                if (typeof (val) !== 'undefined') {
                    foundVals.push(val);
                }
            }
            if (foundVals.length > 0) {
                if ('formatter' in togglMapping && typeof (togglMapping['formatter']) === 'function') {
                    extractedValue = togglMapping.formatter.apply(entry, foundVals);
                }
                else {
                    // Assume we only want first val
                    extractedValue = foundVals[0];
                }
            }
            else {
                Logger.log('No required fields were found for mapping of "' + fieldMapping.id + '"');
            }
        }
    }
    extractedValue = typeof (extractedValue) !== 'undefined' ? extractedValue : VALUE_FOR_NULL;
    return extractedValue;
}
function testDateString() {
    var startString = '2019-06-28';
    var startDate = new Date(startString);
    var forcedEnd = DateUtils.forceDateToEndOfDay(startDate);
    var forcedStart = DateUtils.forceDateToStartOfDay(startDate);
    var test = {
        input: startString,
        toString: startDate.toString(),
        toUTCString: startDate.toUTCString(),
        forceDateToStartOfDay: {
            toString: forcedStart.toString(),
            toUTCString: forcedStart.toUTCString()
        },
        forceDateToEndOfDay: {
            toString: forcedEnd.toString(),
            toUTCString: forcedEnd.toUTCString()
        }
    };
    myConsole.log(test);
}
/**
 * Check if a given field can be found in the interface for the given response entry type (from the API)
 * @param fieldId {string} - The ID of a field to check
 * @param entryTypeStringIndex {string} - The string representation of a Toggl entry type (should correspond to usedToggleResponseEntriesTypes enum)
 * @returns {boolean}
 */
function getIsFieldInResponseEntryType(fieldId, entryTypeStringIndex) {
    var fieldMapping = myFields[fieldId].togglMapping;
    if (fieldMapping) {
        return Array.isArray(fieldMapping.fields[entryTypeStringIndex]);
    }
    return false;
}
var myFields = {
    // Default date/time dimensions
    day: {
        id: 'day',
        name: 'Date',
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['start']
            },
            formatter: function (date) {
                return Converters.formatDateForGds(date, fieldTypeEnum.YEAR_MONTH_DAY);
            }
        },
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.YEAR_MONTH_DAY
        }
    },
    startedAtHour: {
        id: 'startedAtHour',
        name: 'Started At - Hour',
        description: 'The hour / time at which the time entry was started at',
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['start']
            },
            formatter: function (date) {
                return Converters.formatDateForGds(date, fieldTypeEnum.YEAR_MONTH_DAY_HOUR);
            }
        },
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.YEAR_MONTH_DAY_HOUR
        }
    },
    endedAtHour: {
        id: 'endedAtHour',
        name: 'Ended At - Hour',
        description: 'The hour / time at which the time entry ended',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.YEAR_MONTH_DAY_HOUR
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['end']
            },
            formatter: function (date) {
                return Converters.formatDateForGds(date, fieldTypeEnum.YEAR_MONTH_DAY_HOUR);
            }
        }
    },
    // Main Time Entry stuff (title, id, etc.)
    entryId: {
        id: 'entryId',
        name: 'Entry ID',
        description: 'Numerical ID auto-generated by Toggl per entry',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.NUMBER,
            isReaggregatable: false
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['id']
            }
        }
    },
    entryCount: {
        id: 'entryCount',
        name: 'Entry Count',
        description: 'Sum of all (unique) time entries',
        formula: 'COUNT_DISTINCT($entryId)',
        semantics: {
            conceptType: 'METRIC',
            semanticType: fieldTypeEnum.NUMBER
        }
    },
    entryDescription: {
        id: 'entryDescription',
        name: 'Entry Description / Title',
        description: 'Entry Description / Title. Not required by Toggl',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.TEXT
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['description']
            }
        }
    },
    // Task Entry
    taskId: {
        id: 'taskId',
        name: 'Task ID',
        description: 'Task ID, only available on paid accounts',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.NUMBER
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['tid']
            }
        }
    },
    // Projects
    projectId: {
        id: 'projectId',
        name: 'Project ID',
        description: 'Numerical ID generated by Toggl for each project',
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['pid'],
                TogglWeeklyProjectGroupedEntry: ['pid'],
                TogglWeeklyUserGroupedEntry: ['details.pid'],
                TogglSummaryEntry: ['pid']
            }
        },
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.NUMBER
        }
    },
    projectCount: {
        id: 'projectCount',
        name: 'Project Count',
        description: 'Count of Unique Projects',
        formula: 'COUNT_DISTINCT($projectId)',
        semantics: {
            conceptType: 'METRIC',
            semanticType: fieldTypeEnum.NUMBER
        }
    },
    projectName: {
        id: 'projectName',
        name: 'Project Name',
        description: 'Your project name',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.TEXT
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['project'],
                TogglWeeklyProjectGroupedEntry: ['title.project'],
                TogglSummaryEntry: ['title.project']
            }
        }
    },
    // Clients
    clientId: {
        id: 'clientId',
        name: 'Client ID',
        description: 'Numerical ID generated by Toggl for each client',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.NUMBER
        },
        togglMapping: {
            fields: {
                // Client ID is only returned in reports explicitly grouped by client - e.g. summary
                TogglSummaryEntry: ['cid']
            }
        }
    },
    clientName: {
        id: 'clientName',
        name: 'Client Name',
        description: 'Client Name',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.TEXT
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['client'],
                TogglWeeklyProjectGroupedEntry: ['title.client'],
                TogglSummaryEntry: ['title.client']
            }
        }
    },
    // Billing Info
    billableMoneyTotal: {
        id: 'billableMoneyTotal',
        name: 'Total Billable Amount',
        description: 'Total Billable Amount in Configured Currency',
        semantics: {
            conceptType: 'METRIC',
            semanticType: fieldTypeEnum.CURRENCY_USD
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['billable'],
                TogglSummaryEntry: ['totalBillingSum']
            },
            formatter: Converters.formatCurrencyForGds
        }
    },
    billableTimeTotal: {
        id: 'billableTimeTotal',
        name: 'Total Billable Hours',
        description: 'Total Billable Time, as configured in Toggl',
        semantics: {
            conceptType: 'METRIC',
            semanticType: fieldTypeEnum.DURATION
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['billableTime'],
                TogglSummaryEntry: ['totalBillingTime']
            },
            formatter: function (duration) {
                return Converters.togglDurationToGdsDuration(duration);
            }
        }
    },
    isBillable: {
        id: 'isBillable',
        name: 'Is Billable',
        description: 'Whether given entry was marked as billable',
        semantics: {
            conceptType: 'METRIC',
            semanticType: fieldTypeEnum.BOOLEAN
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['is_billable']
            },
            formatter: Converters.forceBoolean
        }
    },
    billingRate: {
        id: 'billingRate',
        name: 'Billing Rate',
        description: 'Billing Rate',
        semantics: {
            conceptType: 'METRIC',
            semanticType: fieldTypeEnum.CURRENCY_USD,
            isReaggregatable: true,
            aggregationType: aggregationTypeEnum.AVG
        },
        togglMapping: {
            fields: {
                TogglSummaryEntry: ['avgBillingRate']
            },
            formatter: Converters.formatCurrencyForGds
        }
    },
    // !!! - Time Field - !!!
    time: {
        id: 'time',
        name: 'Time',
        description: 'Logged Time',
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['dur'],
                TogglSummaryEntry: ['time']
            },
            formatter: function (duration) {
                return Converters.togglDurationToGdsDuration(duration);
            }
        },
        semantics: {
            conceptType: 'METRIC',
            semanticType: fieldTypeEnum.DURATION
        }
    },
    // User Info
    userId: {
        id: 'userId',
        name: 'User ID',
        description: 'Numerical User ID, autogenerated by Toggl',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.NUMBER,
            isReaggregatable: false
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['uid']
            }
        }
    },
    userName: {
        id: 'userName',
        name: 'User Name',
        description: 'Your Toggl User Name',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.TEXT,
            isReaggregatable: false
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['user']
            }
        }
    },
    // Meta info
    updatedAt: {
        id: 'updatedAt',
        name: 'Updated At - Hour',
        description: 'When the time entry was last edited',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.YEAR_MONTH_DAY_HOUR,
            isReaggregatable: false
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['updated']
            },
            formatter: function (date) {
                return Converters.formatDateForGds(date, fieldTypeEnum.YEAR_MONTH_DAY_HOUR);
            }
        }
    },
    useStop: {
        id: 'useStop',
        name: 'Use Stop',
        description: 'If the stop time is saved on the entry',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.BOOLEAN,
            isReaggregatable: false
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['use_stop']
            }
        }
    }
    // @TODO - Add "tags"
};
/**
 * @override - https://developers.google.com/datastudio/connector/auth#getauthtype
 */
function getAuthType() {
    // Enum
    var authTypes = cc.AuthType;
    // Return auth AuthType
    return cc
        .newAuthTypeResponse()
        .setAuthType(authTypes.KEY)
        .setHelpUrl(AUTH_HELP_URL)
        .build();
}
/**
 * @override - https://developers.google.com/datastudio/connector/auth#resetauth
 */
function resetAuth() {
    PropertiesService.getUserProperties().deleteProperty(APIKEY_STORAGE);
}
function getUserApiKey() {
    var key = PropertiesService.getUserProperties().getProperty(APIKEY_STORAGE);
    return key;
}
/**
 * @override - https://developers.google.com/datastudio/connector/auth#isauthvalid
 */
function isAuthValid() {
    return validateKey(getUserApiKey());
}
function validateKey(authKey) {
    if (authKey) {
        Logger.log(authKey);
        var tempInst = new TogglApi(authKey);
        // Make a call to /me as simple test of auth authValidity
        var response = tempInst.getBasicAcctInfo();
        return response.success;
    }
    return false;
}
/**
 * @override - https://developers.google.com/datastudio/connector/auth#setcredentials
 * NOTE: This is very special func - is a callback that gets triggered once user saves credential through UI
 */
function setCredentials(request) {
    var key = request.key;
    if (!validateKey(key)) {
        return {
            errorCode: 'INVALID_CREDENTIALS'
        };
    }
    PropertiesService.getUserProperties().setProperty(APIKEY_STORAGE, key);
    // Update global
    togglApiInst.setAuthToken(key);
    return {
        errorCode: 'NONE'
    };
}
