import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(value: any, propName: string, filterString: string, isNot = false): any {
    if (value.length === 0 || filterString === '') {
      return value;
    }
    const resultArray = [];
    for (const item of value) {
      if (isNot) {
        if (item[propName] != filterString || item[propName] != +filterString) {
          resultArray.push(item);
        }
      } else if (item[propName] === filterString || item[propName] == +filterString) {
        resultArray.push(item);
      }
    }
    return resultArray;
  }
}
