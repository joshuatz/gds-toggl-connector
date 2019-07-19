import {leftPad,Converters} from '../src/helpers';

test('helpers->leftPad',()=>{
    expect(leftPad('20','@',4)).toBe('@@20');
    expect(leftPad('hello','123',-1)).toBe('hello');
});

test('helpers->Converters',()=>{
    // Converters should only contain static methods, so no need to instantiate
    // Quarter of the year
    expect(Converters.getQuarterFromMonth(11)).toBe(4);
    // GDS date converter
    let gdsConvertedDate = Converters.gdsDateRangeDateToDay('2019-06-28');
    expect(gdsConvertedDate.getFullYear()).toBe(2019);
    expect(gdsConvertedDate.getMonth()).toBe(5);
    expect(gdsConvertedDate.getDate()).toBe(28);
    // @TODO add more
});