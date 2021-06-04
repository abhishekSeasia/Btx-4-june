import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SingleStakeComponent } from './single-stake.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [SingleStakeComponent],
  imports: [
    CommonModule, FormsModule, SharedModule, NgbModule
  ]
})
export class SingleStakeModule { }
