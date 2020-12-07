import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'yearConversion' })
export class YearFormatPipe implements PipeTransform {
    transform(date: any): any {
        let year = new Date(date).getFullYear();
        return year;
    }
}