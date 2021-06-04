import { NgModule } from '@angular/core';
import { DialogComponent } from './dialog/dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedPipesModule } from './pipes/shared-pipes.module';

@NgModule({
  declarations: [ DialogComponent],
imports: [CommonModule, FormsModule, SharedPipesModule]
  , exports: [DialogComponent]
})
export class SharedModule {}
