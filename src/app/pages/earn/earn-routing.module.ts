import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EarnComponent } from './earn.component';

const routes: Routes = [
  {path:'', component: EarnComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EarnRoutingModule { }