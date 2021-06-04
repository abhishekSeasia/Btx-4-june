import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterPipe } from './filter.pipe';
import { SortPipe } from './sort.pipe';
import { UniquePipe } from './unique.pipe';
import { LikeFilterPipe } from './likefilter.pipe';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
      FilterPipe, SortPipe, UniquePipe, LikeFilterPipe
    ],
    exports: [FilterPipe, SortPipe, UniquePipe, LikeFilterPipe]
})
export class SharedPipesModule { }
