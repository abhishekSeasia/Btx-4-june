import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
  name: 'unique',
  pure: false
})
export class UniquePipe implements PipeTransform {
  transform(array: any[], field: any): any {

    if (array !== undefined && array !== null) {
        return _.uniqBy(array, field);
    }
    return array;
}

// transform(value: any): any {
//   if (value !== undefined && value !== null) {
//       return _.uniqBy(value, 'name');
//   }
//   return value;
// }
}
