import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'timeConversion' })
export class TimeFormatPipe implements PipeTransform {
    transform(time: any): any {
        let hour = (time.split(':'))[0]
        let min = (time.split(':'))[1]
        let part = hour > 12 ? 'pm' : 'am';
        min = (min + '').length == 1 ? `${min}` : min;
        hour = hour > 12 ? hour - 12 : hour;
        hour = (hour + '').length == 1 ? `${hour}` : hour;
        return `${hour}:${min} ${part}`
    }
}