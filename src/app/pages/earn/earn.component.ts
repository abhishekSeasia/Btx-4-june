import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';

import { StakeContractService } from '../../services/stake_contract.service';
import { SingleStakeContractService } from '../../services/single_stake_contract.service';

@Component({
  selector: 'app-earn',
  templateUrl: './earn.component.html',
  styleUrls: ['./earn.component.css']
})
export class EarnComponent implements OnInit {
	metaMaskConnected = false;
	isMetaMaskAccountConnected = false;
  connectToNetwork: any = undefined;

  canEditForm = false;
  showEditForm = false;
  lpStakeFormData = {
    headerText: 'Create BTCpx-WBTC UNI-V2 LP Tokens',
    headerSmallText: 'Provide liquidity in Uniswap to get LP Tokens',
    btnUrl: 'https://google.com',
    type: 'LP'
  };
  btcpxStakeFormData = {
    headerText: 'Create BTCpx-WBTC UNI-V2 LP Tokens',
    headerSmallText: 'Provide liquidity in Uniswap to get LP Tokens',
    btnUrl: 'https://google.com',
    type: 'BTCpx'
  };
  editRow: any = {};
  closeResult = '';

  lpTotalLiquidity = 0;
  lpAPYforYear:any = 0;
  lpDuration = 0;
  lpStakingRewards = 0;

  btcpxTotalLiquidity = 0;
  btcpxAPYforYear:any = 0;
  btcpxDuration = 0;
  btcpxStakingRewards = 0;

  constructor(
  	private stakeContractService: StakeContractService,
  	private singleStakeContractService: SingleStakeContractService,
  	private activatedRoute: ActivatedRoute,
  	private cdr: ChangeDetectorRef,
  ) {
  	this.metaMaskConnected = this.stakeContractService.isMetaMaskAvailable();
  	this.activatedRoute.queryParams.subscribe(params => {
        this.canEditForm = params['canEdit'] == 'yes';
    });

    // Get the Total LP Rewards to be distributed.
    this.stakeContractService.stakingRewards.subscribe(
      (amount: any) => {
        if (amount) {
          this.lpStakingRewards = amount;
          this.calculateLpAPYforYear();
        }
      }
    );

    // Get the Duration of LP Staking
    this.stakeContractService.duration.subscribe(
      (time: any) => {
        if (time) {
          this.lpDuration = time;
          this.calculateLpAPYforYear();
        }
      }
    );

    // Get the Total LP Liquidity (TVL)
    this.stakeContractService.totalLiquidity.subscribe(
      (result: any) => {
        if (result) {
          this.lpTotalLiquidity = result;
          this.calculateLpAPYforYear();
        }
      }
    );

    // Get the Duration of BTCpx Staking
    this.singleStakeContractService.duration.subscribe(
      (time: any) => {
        if (time) {
          this.btcpxDuration = time;
          this.calculateBtcpxAPYforYear();
        }
      }
    );

    // Get the Total BTCpx Rewards to be distributed.
    this.singleStakeContractService.stakingRewards.subscribe(
      (amount: any) => {
        if (amount) {
          this.btcpxStakingRewards = amount;
          this.calculateBtcpxAPYforYear();
        }
      }
    );

    // Get the Total BTCp Liquidity (TVL)
    this.stakeContractService.totalLiquidity.subscribe(
      (result: any) => {
        if (result) {
          this.btcpxTotalLiquidity = result;
          this.calculateBtcpxAPYforYear();
        }
      }
    );
  }

  async ngOnInit() {
  	if (this.metaMaskConnected) {
      this.isMetaMaskAccountConnected = await this.stakeContractService.checkMetaMaskAccountConnected();
      if (this.isMetaMaskAccountConnected) {
        this.connectToNetwork = this.stakeContractService.checkNetwork();
      }
    }
    if (!this.metaMaskConnected || !this.isMetaMaskAccountConnected || this.connectToNetwork) {
      // this.open();
    } else {
      this.stakeContractService.getStakingRewards();
      this.stakeContractService.getDuration();
      this.stakeContractService.calculateTotalLiquidity();

      this.singleStakeContractService.getStakingRewards();
      this.singleStakeContractService.getDuration();
      this.singleStakeContractService.calculateTotalLiquidity();
    }
  }

  // Funtion to open the form to edit Pool Information
  editForm(formData){
  	console.log(formData);
    this.editRow = {
      headerText: formData.headerText,
      headerSmallText: formData.headerSmallText,
      btnUrl: formData.btnUrl,
      type: formData.type
    };
    this.showEditForm = true;
    console.log(this.editRow);
    this.cdr.detectChanges();
  }

  // Funtion to update the Pool Information
  saveEditForm(){
    if( !confirm('Are you sure?') ) return false;

    if (this.editRow.type === 'BTCpx') {
    	this.btcpxStakeFormData = {
	      headerText: this.editRow.headerText,
	      headerSmallText: this.editRow.headerSmallText,
	      btnUrl: this.editRow.btnUrl,
	      type: 'BTCpx'
	    };
    } else {
	    this.lpStakeFormData = {
	      headerText: this.editRow.headerText,
	      headerSmallText: this.editRow.headerSmallText,
	      btnUrl: this.editRow.btnUrl,
	      type: 'LP'
	    };
	  }
    this.showEditForm = false;
  }

  // Function to calculate LP APY for the year
  calculateLpAPYforYear() {
    if (Number(this.lpStakingRewards) && Number(this.lpDuration) && Number(this.lpTotalLiquidity)) {
      let rewardPerMonth = this.lpStakingRewards / this.lpDuration * 30;
      this.lpAPYforYear = rewardPerMonth / this.lpTotalLiquidity * 12 * 100;
      this.lpAPYforYear = this.lpAPYforYear.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
      this.cdr.detectChanges();
    }
  }

  // Function to calculate BTCpx APY for the year
  calculateBtcpxAPYforYear() {
    if (Number(this.btcpxStakingRewards) && Number(this.btcpxDuration) && Number(this.btcpxTotalLiquidity)) {
      let rewardPerMonth = this.btcpxStakingRewards / this.btcpxDuration * 30;
      this.btcpxAPYforYear = rewardPerMonth / this.btcpxTotalLiquidity * 12 * 100;
      this.btcpxAPYforYear = this.btcpxAPYforYear.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
      this.cdr.detectChanges();
    }
  }

}
