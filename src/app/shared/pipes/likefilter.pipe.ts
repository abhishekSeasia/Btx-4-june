import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'likefilter'
})
export class LikeFilterPipe implements PipeTransform {
  transform(items: any[], propName: string, searchText: string): any[] {
    if (!items) {return []; }

    if (!searchText) {return items; }

    searchText = searchText.toLowerCase();

    return items.filter( it => {
      return it[propName].toLowerCase().includes(searchText);
    });
   }
}
