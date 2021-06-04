import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { SingleStakeComponent } from './pages/single-stake/single-stake.component';
import { StakeModule } from './pages/stake/stake.module';
import { EarnModule } from './pages/earn/earn.module';

const routes: Routes = [
  {path: '', redirectTo: '/', pathMatch: 'full'},
  {path:'', component: HomeComponent},
  {path:'stake', loadChildren: () => StakeModule},
  {path:'single-stake', component: SingleStakeComponent},
  {path:'earn', loadChildren: () => EarnModule},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
