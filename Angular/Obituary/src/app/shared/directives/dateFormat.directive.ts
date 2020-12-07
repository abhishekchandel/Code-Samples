import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'dateConversion' })
export class DateFormatPipe implements PipeTransform {
    transform(date: any): any {
        let servicedate = new Date(date).getDate();
        return servicedate;
    }
}