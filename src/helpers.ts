export function leftPad(input:string,padWith:string,length:number){
    let output:string = input;
    while (output.length < length){
        output = padWith + output;
    }
    return output;
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
        let monthInt:number  = dateToFormat.getMonth();
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
            let togglFormattedDate:string = dateParts.year + dateParts.monthPadded + dateParts.dayPadded;
            return togglFormattedDate;
        }
        catch (e){
            return '';
        }
    }

    // https://stackoverflow.com/a/6117889
    static getWeekNumber(d:Date){
        let dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        let yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        return Math.ceil((((+d - +yearStart) / 86400000) + 1)/7);
    }

    static formatDateForGds(date:Date|string,gdsDateType:GoogleAppsScript.Data_Studio.FieldType){
        let fieldTypes = GoogleAppsScript.Data_Studio.FieldType;
        try {
            let dateToFormat:Date = typeof(date)==='string' ? (new Date(date)) : date;
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
}