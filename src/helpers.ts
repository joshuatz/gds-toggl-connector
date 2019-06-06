export function leftPad(input:string,padWith:string,length:number){
    let output:string = input;
    while (output.length < length){
        output = padWith + output;
    }
    return output;
}

export function formatDateAsGds(date:Date|string){
    let dateToFormat:Date = typeof(date)==='string' ? (new Date(date)) : date;
    let year:string = dateToFormat.getFullYear().toString();
    let month: string = (dateToFormat.getMonth()+1).toString();
    let day:string = (dateToFormat.getDate()).toString();
    let gdsFormattedDate:string = year + leftPad(month,'0',2) + leftPad(day,'0',2);
    return gdsFormattedDate;
}