import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { StakeContractService } from '../../services/stake_contract.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-stake',
  templateUrl: './stake.component.html',
  styleUrls: ['./stake.component.css']
})
export class StakeComponent implements OnInit {
  @ViewChild ("exampleModal")
  exampleModal: TemplateRef <any>;

  canEditForm = false;
  showEditForm = false;
  stakeFormData = {
    headerText: 'Create BTCpx-WBTC UNI-V2 LP Tokens',
    headerSmallText: 'Provide liquidity in Uniswap to get LP Tokens',
    btnUrl: 'https://google.com'
  };
  editRow: any = {};
  closeResult = '';

  metaMaskConnected = false;
  isMetaMaskAccountConnected = false;
  connectToNetwork: any = undefined;
  stakingRewards = 0;
  stakingBalance = 0;
  totalStakingBalance = 0;
  rewardsBalance = 0;
  rewardsPerStakeToken = 0;
  duration = 0;
  stakingEndTime: Date;
  lpUserBalance = 0;
  connectingMetaMask = false;
  percentageRewardPool:any = 0;
  stakeSwitch = true;
  amountToBeStakedOrUnstaked = 0;
  stakingStarted = false;
  totalLiquidity = 0;
  APYforYear:any = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private ngbModal: NgbModal,
    private stakeContractService: StakeContractService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {
    this.metaMaskConnected = this.stakeContractService.isMetaMaskAvailable();
  	this.activatedRoute.queryParams.subscribe(params => {
        this.canEditForm = params['canEdit'] == 'yes';
    });

    // Get the User LP Balance.
    this.stakeContractService.lpBalance.subscribe(
      (amount: any) => {
        this.lpUserBalance = amount;
        this.cdr.detectChanges();
        // console.log(this.stakingBalance);
      }
    );

    // Get the Total Rewards to be distributed.
    this.stakeContractService.stakingRewards.subscribe(
      (amount: any) => {
        if (amount) {
          this.stakingRewards = amount;
          // console.log(this.stakingRewards);
          this.calculateAPYforYear();
        }
      }
    );

    // Get the User Staking Balance.
    this.stakeContractService.stakingBalance.subscribe(
      (amount: any) => {
        this.stakingBalance = amount;
        this.calculatePercentageRewardPool();
        // console.log(this.stakingBalance);
      }
    );

    // Get the Total Staking Balance.
    this.stakeContractService.totalStakingBalance.subscribe(
      (amount: any) => {
        this.totalStakingBalance = amount;
        this.calculatePercentageRewardPool();
        // console.log(this.totalStakingBalance);
      }
    );

    // Get the User Earned Rewards Balance
    this.stakeContractService.rewardsBalance.subscribe(
      (amount: any) => {
        if (amount) {
          this.rewardsBalance = amount;
          // console.log(this.rewardsBalance);
        }
      }
    );

    // Get the Amount of Rewards Per stake token
    this.stakeContractService.rewardsPerStakeToken.subscribe(
      (amount: any) => {
        if (amount) {
          this.rewardsPerStakeToken = amount;
          // console.log(this.rewardsPerStakeToken);
        }
      }
    );

    // Get the Duration of Staking
    this.stakeContractService.duration.subscribe(
      (time: any) => {
        if (time) {
          this.duration = time;
          // console.log(this.duration);
          this.calculateAPYforYear();
        }
      }
    );

    // Get the Time when Staking will end
    this.stakeContractService.stakingEndTime.subscribe(
      (time: any) => {
        // if (time) {
          this.stakingEndTime = new Date(0); // The 0 there is the key, which sets the date to the epoch
          this.stakingEndTime.setUTCSeconds(time);          
          // console.log(this.stakingEndTime);
        // }
      }
    );

    // Get the Staking/Unstaking Receipt
    this.stakeContractService.stakingReceipt.subscribe(
      (result: any) => {
        this.stakingStarted = false;
        this.cdr.detectChanges();
      }
    );

    // Get the Total Liquidity (TVL)
    this.stakeContractService.totalLiquidity.subscribe(
      (result: any) => {
        if (result) {
          this.totalLiquidity = result;
          this.calculateAPYforYear();
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
      this.open();
    } else {
      this.stakeContractService.getStakingRewards();
      this.stakeContractService.getStakingBalance();
      this.stakeContractService.getTotalStakingBalance();
      this.stakeContractService.getRewardsBalance();
      this.stakeContractService.getRewardsPerStakeToken();
      this.stakeContractService.getDuration();
      this.stakeContractService.getStakingEndTime();
      this.stakeContractService.getLpBalance();
      this.stakeContractService.calculateTotalLiquidity();
    }
  }

  // Function to connect MetaMask
  connectMetaMask = async () => {
    this.connectingMetaMask = true;
    await this.stakeContractService.connectMetaMask();
    this.connectingMetaMask = false;
  };

  // Function to get MetaMask Account Balance
  async getMetamaskAccountBalance() {
    // if (this.lpUserBalance > 0) {
      // this.amountToBeStakedOrUnstaked = this.lpUserBalance;
      if (this.stakeSwitch) {
        this.amountToBeStakedOrUnstaked = this.lpUserBalance;
      } else {
        this.amountToBeStakedOrUnstaked = this.stakingBalance;
      }
      // this.stakeAmount();
    // }
  }

  // Function to stake amount
  stakeAmount() {
    if (!this.metaMaskConnected || !this.isMetaMaskAccountConnected || this.connectToNetwork) {
      this.open();
    } else {
      if (this.amountToBeStakedOrUnstaked > this.lpUserBalance) {
        this.toastr.warning("You cannot stake amount greater then Tokens Available." , 'Stake');
        return;
      }
      this.stakingStarted = true;
      this.stakeContractService.stakeAmount(this.amountToBeStakedOrUnstaked);
    }
  }

  // Function to unstake amount
  unstakeAmount() {
    if (!this.metaMaskConnected || !this.isMetaMaskAccountConnected || this.connectToNetwork) {
      this.open();
    } else {
      if (this.amountToBeStakedOrUnstaked > this.stakingBalance) {
        this.toastr.warning("You cannot unstake amount greater then Tokens You Staked." , 'Unstake');
        return;
      }
      this.stakingStarted = true;
      this.stakeContractService.unstakeAmount(this.amountToBeStakedOrUnstaked);
    }
  }

  // Function to Claim Reward
  claimReward() {
    if (!this.metaMaskConnected || !this.isMetaMaskAccountConnected || this.connectToNetwork) {
      this.open();
    } else {
      this.stakeContractService.claimReward()
      .then(function(amount) {
        this.stakeContractService.getRewardsBalance();
      }.bind(this))
      .catch(function(error){
        this.toastr.error(error.message.split("\n", 1)[0], 'Error');
      }.bind(this));
    }
  }

  editForm(){
    this.editRow = {
      headerText: this.stakeFormData.headerText,
      headerSmallText: this.stakeFormData.headerSmallText,
      btnUrl: this.stakeFormData.btnUrl
    };
    this.showEditForm = true;
  }

  saveEditForm(){
    if( !confirm('Are you sure?') ) return false;

    this.stakeFormData = {
      headerText: this.editRow.headerText,
      headerSmallText: this.editRow.headerSmallText,
      btnUrl: this.editRow.btnUrl
    };
    this.showEditForm = false;
  }

  // Function to calculate % of Reward Pool
  calculatePercentageRewardPool() {
    if (Number(this.stakingBalance) && Number(this.totalStakingBalance)) {
      this.percentageRewardPool = (this.stakingBalance / this.totalStakingBalance) * 100;
      this.percentageRewardPool = this.percentageRewardPool.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
    }
    this.cdr.detectChanges();
  }

  // Function to calculate APY for the year
  calculateAPYforYear() {
    if (Number(this.stakingRewards) && Number(this.duration) && Number(this.totalLiquidity)) {
      let rewardPerMonth = this.stakingRewards / this.duration * 30;
      this.APYforYear = rewardPerMonth / this.totalLiquidity * 12 * 100;
      this.APYforYear = this.APYforYear.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
      this.cdr.detectChanges();
    }
  }

  // Model Functions
  open() {
    this.ngbModal.open(this.exampleModal, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

}
