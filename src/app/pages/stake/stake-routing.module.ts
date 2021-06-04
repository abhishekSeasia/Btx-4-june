import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StakeComponent } from './stake.component';
import { FaucetComponent } from './faucet/faucet.component';


const routes: Routes = [
  {path:'', component: StakeComponent},
  {path:'faucet/:id', component: FaucetComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StakeRoutingModule { }