import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EarnComponent } from './earn.component';
import { EarnRoutingModule } from './earn-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [EarnComponent],
  imports: [
    CommonModule,
    EarnRoutingModule,
    SharedModule,
  ]
})
export class EarnModule { }
