import { fieldMapping } from "./main";

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
	return dotNotatString.split('.').reduce(function(obj,i){return obj[i]},obj);
}

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
     */
    static formatDateForTogglApi(date:Date|string){
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
    static getWeekNumber(input:Date){
        let d = new Date(input.getTime());
        let dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        let yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        return Math.ceil((((+d - +yearStart) / 86400000) + 1)/7);
    }

    static formatDateForGds(date:Date|string,gdsDateType:GoogleAppsScript.Data_Studio.FieldType){
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

    static togglDurationToGdsDuration(togglDurationMs:number){
        return (togglDurationMs/1000).toString();
    }

    static gdsDateRangeDateToDay(gdsDashedDate:string){
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

    static formatCurrencyForGds(amount:null|number|string){
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
}

/**
 * Logging
 */
export class myConsole {
    static log(thing:any){
        if (typeof(thing)==='object'){
            console.log({
                message: JSON.stringify(thing)
            });
        }
        else if (typeof(thing)==='string'){
            console.log({
                message: thing
            });
        }
        else {
            if (thing && typeof(thing.toString)==='function'){
                console.log({
                    message: thing.toString()
                });
            }
            else {
                console.log(thing);
            }
        }
    }
}

/**
 * Polyfill setTimeout
 */
export function setTimeout(cb:Function,ms:number){
    Utilities.sleep(ms);
    cb();
}

export function aggregateValues(values:any[],mappings:fieldMapping[]){
    
}

export function getIsDateInDateTimeRange(dateTimeToCheck:Date,startDateTime:Date,endDateTime:Date){
    return dateTimeToCheck >= startDateTime && dateTimeToCheck <= endDateTime;
}

export function forceDateToStartOfDay(input:Date){
    let result:Date = new Date(input.getTime());
    result.setUTCHours(0,0,0,0);
    return result;
}
export function forceDateToEndOfDay(input:Date){
    let result:Date = new Date(input.getTime());
    result.setUTCHours(23,59,59,999);
    return result;
}