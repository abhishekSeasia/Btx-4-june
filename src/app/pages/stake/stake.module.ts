import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { StakeComponent } from './stake.component';
import { FaucetComponent } from './faucet/faucet.component';
import { StakeRoutingModule } from './stake-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [StakeComponent, FaucetComponent],
  imports: [
    CommonModule, FormsModule, SharedModule, StakeRoutingModule, NgbModule
  ]
})
export class StakeModule { }
