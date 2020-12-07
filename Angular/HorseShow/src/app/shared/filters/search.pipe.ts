import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (!args) {
      return value;
    }
    // return value.filter((val) => {
    //   debugger;
    //   let rVal = (val.ExhibitorId.includes(Number(args))) || (val.ExhibitorName.toLocaleLowerCase().includes(args));
    //   return rVal;
    // })

    return value.filter(function(item){
      return (JSON.stringify(item).toLowerCase().includes(args.toLowerCase()));
  });
  

  }

  }


