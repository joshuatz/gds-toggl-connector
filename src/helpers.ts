import { debugLevels, DEBUG_LEVEL } from "./main";

/**
 * @author Joshua Tzucker
 * @file helpers.ts
 */

export function leftPad(input:string,padWith:string,length:number){
    let output:string = input;
    while (output.length < length){
        output = padWith + output;
    }
    return output;
}

// Based on https://stackoverflow.com/a/6394168/11447682
// Returns undefined if can't find it in recursion
export function recurseFromString(obj:any,dotNotatString:string){
	return dotNotatString.split('.').reduce(function(obj,i){
        return typeof(obj)==='object' ? obj[i] : undefined;
    },obj);
}

/**
 * Wrapper around various converter methods
 */
export class Converters {
    static getQuarterFromMonth(month:number){
        if (month <= 3){
            return 1;
        }
        else if (month > 3 && month <= 6){
            return 2;
        }
        else if (month > 6 && month <= 9){
            return 3;
        }
        else if (month > 9 && month <= 12){
            return 4;
        }
    }
    static getDateParts(dateToFormat:Date){
        let year = dateToFormat.getFullYear().toString();
        let monthInt:number = dateToFormat.getMonth() + 1;
        let month = monthInt.toString();
        let day = (dateToFormat.getDate()).toString();
        let hours = dateToFormat.getHours();
        let quarter = Converters.getQuarterFromMonth(monthInt);
        let dateParts = {
            year : year,
            month : month,
            monthPadded : leftPad(month,'0',2),
            quarter: quarter,
            day : day,
            dayPadded : leftPad(day,'0',2),
            hours: hours,
            hoursPadded: leftPad(hours.toString(),'0',2),
            isoWeek: Converters.getWeekNumber(dateToFormat)
        }
        return dateParts;
    }
    /**
     * Converts a date or date like string into the "2019-06-25" format for Toggl endpoints
     * @param date - Input date obj, or string, to format
     * @returns {string}
     */
    static formatDateForTogglApi(date:Date|string):string {
        try {
            let dateToFormat:Date = typeof(date)==='string' ? (new Date(date)) : date;
            let dateParts = Converters.getDateParts(dateToFormat);
            let togglFormattedDate:string = [dateParts.year,dateParts.monthPadded,dateParts.dayPadded].join('-');
            return togglFormattedDate;
        }
        catch (e){
            return '';
        }
    }

    // https://stackoverflow.com/a/6117889
    static getWeekNumber(input:Date): number{
        let d = new Date(input.getTime());
        let dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        let yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        return Math.ceil((((+d - +yearStart) / 86400000) + 1)/7);
    }

    /**
     * Formats any given date (or parseable date string) into a GDS formatted date
     * See: https://developers.google.com/datastudio/connector/reference#semantictype
     * @param date {Date|string} - Date to format
     * @param gdsDateType - A GDS fieldtype enum value that corresponds to a GDS DATETIME format
     * @returns {string}
     */
    static formatDateForGds(date:Date|string,gdsDateType:GoogleAppsScript.Data_Studio.FieldType): string {
        let fieldTypes = DataStudioApp.createCommunityConnector().FieldType;
        try {
            let dateToFormat:Date = typeof(date)==='string' ? (new Date(date)) : new Date(date.getTime());
            let dateParts = Converters.getDateParts(dateToFormat);
            let dateString:string = '';
            if (gdsDateType === fieldTypes.YEAR){
                // 2017
                dateString = dateParts.year;
            }
            else if (gdsDateType === fieldTypes.YEAR_QUARTER){
                // 20171
                dateString = dateParts.year + dateParts.quarter;
            }
            else if (gdsDateType === fieldTypes.YEAR_MONTH){
                // 201703
                dateString = dateParts.year + dateParts.monthPadded;
            }
            else if (gdsDateType === fieldTypes.YEAR_WEEK){
                // 201707
                dateString = dateParts.year + dateParts.isoWeek;
            }
            else if (gdsDateType === fieldTypes.YEAR_MONTH_DAY){
                // 20170317
                dateString = dateParts.year + dateParts.monthPadded + dateParts.dayPadded;
            }
            else if (gdsDateType === fieldTypes.YEAR_MONTH_DAY_HOUR){
                // 2017031400
                dateString = dateParts.year + dateParts.monthPadded + dateParts.dayPadded + dateParts.hoursPadded;
            }
            return dateString.toString();
        }
        catch (e){
            return '';
        }
    }

    /**
     * This method is really just to remind me that the conversion is necessary; Toggl returns MS, GDS expects seconds. (and as string)
     * @param togglDurationMs {number} - The duration returned directly from a Toggl API endpoint (should be in MS)
     * @returns {string}
     */
    static togglDurationToGdsDuration(togglDurationMs:number): string{
        return (togglDurationMs/1000).toString();
    }

    /**
     * Converts the date strings that GDS passes in requests, such as getData(), into true Date object
     * @param gdsDashedDate - The date passed by GDS (usually in getData())
     * @return {Date}
     */
    static gdsDateRangeDateToDay(gdsDashedDate:string): Date{
        // GDS date range start & end are in format "2019-06-28"
        let pattern:RegExp = /(\d{4})-(\d{2})-(\d{2})/;
        let match:RegExpMatchArray|null = pattern.exec(gdsDashedDate);
        if (match){
            let year:number = parseInt(match[1],10);
            let month:number = parseInt(match[2],10)-1;
            let day:number = parseInt(match[3],10);
            return (new Date(year,month,day));
        }
        else {
            return new Date(gdsDashedDate);
        }   
    }

    /**
     * Ensures that a {number} is always passed to GDS for a currency field.
     * @param amount - the amount of money to format into a GDS formatted amount
     * @return {number}
     */
    static formatCurrencyForGds(amount:undefined|null|number|string){
        if (amount){
            if (typeof(amount)==='string'){
                return parseFloat(amount);
            }
            else {
                return amount;
            }
        }
        else {
            return 0.00;
        }
    }

    static forceBoolean(input:any){
        if (typeof(input)==='boolean'){
            return input;
        }
        else {
            return false;
        }
    }
}

/**
 * Logging
 */
export class myConsole {
    /**
     * Formats any given input into a suitable format for StackDriver logging (e.g. wrapping in object)
     * @param thing - Thing you show in the Stackdriver log
     */
    static formatThingForConsole(thing:any){
        let result:any = thing;
        if (typeof(thing)==='object'){
            result = {
                message: JSON.stringify(thing)
            };
        }
        else if (typeof(thing)==='string'){
            result = {
                message: thing
            };
        }
        else {
            if (thing && typeof(thing.toString)==='function'){
                result = {
                    message: thing.toString()
                };
            }
            else {
                result = thing;
            }
        }
        return result;
    }
    static log(thing:any,level:debugLevels=debugLevels.LOW){
        if (DEBUG_LEVEL >= level){
            console.log(myConsole.formatThingForConsole(thing))
        }
    }
    static error(thing:any,level:debugLevels=debugLevels.LOW){
        if (DEBUG_LEVEL >= level){
            console.error(myConsole.formatThingForConsole(thing));
        }
    }
}

/**
 * Polyfill setTimeout
 * !!! - DO NOT REMOVE - GLOBAL FUNC - !!!
 */
export function setTimeout(cb:Function,ms:number){
    Utilities.sleep(ms);
    cb();
}

/**
 * Wrapper class around a bunch of date methods. Probably should have just import moment.js instead of hand coding ¯\_(ツ)_/¯
 */
export class DateUtils {
    static getIsDateInDateTimeRange(dateTimeToCheck:Date,startDateTime:Date,endDateTime:Date){
        return dateTimeToCheck >= startDateTime && dateTimeToCheck <= endDateTime;
    }
    static getIsDateWithinXDaysOf(dateTimeToCheck:Date,dateToSetRangeAround:Date,xDaysAround:number){
        xDaysAround = Math.abs(xDaysAround);
        let rangeStart:Date = DateUtils.offsetDateByDays(dateToSetRangeAround,(-1 * xDaysAround));
        let rangeEnd:Date = DateUtils.offsetDateByDays(dateToSetRangeAround,xDaysAround);
        return DateUtils.getIsDateInDateTimeRange(dateTimeToCheck,rangeStart,rangeEnd);
    }
    static offsetDateByDays(input:Date,offsetDays:number){
        let offsetMs = offsetDays * 24 * 60 * 60 * 1000;
        let resultDate:Date = new Date(input.getTime() + offsetMs);
        return resultDate;
    }
    static forceDateToStartOfDay(input:Date){
        let result:Date = new Date(input.getTime());
        result.setUTCHours(0,0,0,0);
        return result;
    }
    static forceDateToEndOfDay(input:Date){
        let result:Date = new Date(input.getTime());
        result.setUTCHours(23,59,59,999);
        return result;
    }
}

/**
 * Wrapper around some generic exceptions
 */
export class Exceptions {
    static throwGenericApiErr(){
        cc.newUserError()
            .setDebugText('Something wrong with result from API')
            .setText('API responded, but something went wrong')
            .throwException();
        return false;
    }
}

/**
 * Wrapper around using the GoogleAppsScript.Cache
 */
export class CacheWrapper {
    /**
     * Generates a key of pipe-separated values - should look like "123|{'user':'joshua'}|ABC"
     * @param inputs Array of anything to use for composite key
     */
    static generateKeyFromInputs(inputs:any[]){
        let key:string = (new Date()).getTime().toString();
        if (inputs.length > 0){
            key = '';
            for (let x=0; x<inputs.length; x++){
                key += (x>0 ? '|' : '') + myStringifer(inputs[x])
            }
        }
        return key;
    }

    /**
     * Check if the cache contains a value for a set of inputs
     * @param cache - An instance of the GAS Cache
     * @param inputs - An array of parameters that can be combined to form a composite storage key
     */
    static queryCacheForInputs(cache:GoogleAppsScript.Cache.Cache,inputs:any[]){
        let key:string = CacheWrapper.generateKeyFromInputs(inputs);
        return cache.get(key);
    }
}

/**
 * Helper function to stringify {any}
 * @param input - Anything to stringify
 */
export function myStringifer(input:any){
    let result:string = '';
    if (typeof(input)==='object'){
        result = JSON.stringify(input);
    }
    else if (typeof(input)==='string'){
        result = input;
    }
    else if (typeof(input.toString)==='function'){
        result = input.toString();
    }
    return result;
}