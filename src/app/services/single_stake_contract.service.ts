import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Web3 from 'web3';

import { environment } from '../../environments/environment';
import { StakeContractService } from './stake_contract.service';

declare let require: any;
declare let window: any;

const bitcoin = require('bitcoinjs-lib');
const { ethereum } = window;

// For Total Liquidity Calculation
const { ChainId, Fetcher, Route, WETH } = require('@uniswap/sdk');
const ethers = require('ethers');
const url = 'https://mainnet.infura.io/v3/6d3842b639464c1f9a0649b4044b9106';
const customHttpProvider = new ethers.providers.JsonRpcProvider(url);

const chainId = ChainId.MAINNET;

const coin1Address = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
const coin2Address = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
// Ends

let lpStakingAbi = require('../documents/stake_abi.json');
let lpAbi = require('../documents/stake_lp_abi.json');

@Injectable({
  providedIn: 'root'
})
export class SingleStakeContractService {
  stakingRewards = new EventEmitter<any>();
  stakingBalance = new EventEmitter<any>();
  totalStakingBalance = new EventEmitter<any>();
  stakingReceipt = new EventEmitter<any>();
  UnstakingReceipt = new EventEmitter<any>();
  rewardsBalance = new EventEmitter<any>();
  rewardsPerStakeToken = new EventEmitter<any>();
  duration = new EventEmitter<any>();
  stakingEndTime = new EventEmitter<any>();
  lpBalance = new EventEmitter<any>();
  totalLiquidity = new EventEmitter<any>();

  private btcpxStakingWeb3: any;
  private btcpxStakingContract: any;
  private btcpxStakingContractAddress = '0xC4d492c3e739689F800cC52681b952CabB7A391b';

  private btcpxWeb3: any;
  private btcpxContract: any;
  private btcpxContractAddress = '0x100c5aBF85e6035c02771Cb3DDC803350Da77d3c';

  private currentAccountAddress = undefined;
  private currentHexAddress = '';

  constructor(private http: HttpClient, private router: Router, private stakeContractService: StakeContractService,) {
    if (typeof window.ethereum !== 'undefined') {

      // Ethereum instance of Web3
      this.btcpxStakingWeb3 = new Web3(window.ethereum);
      this.btcpxWeb3 = new Web3(window.ethereum);

      this.createInstanceOfContracts();
    }
  }

  async createInstanceOfContracts() {
    // Getting the account address from which we need to make transactions.
    await ethereum
      .request({ method: 'eth_accounts' })
      .then((accounts: any) => {
        // Saving the address of the currently connected account.
        if (accounts && accounts[0]) {
          this.currentAccountAddress = this.btcpxStakingWeb3.utils.toChecksumAddress(accounts[0]);
        } else {
          this.currentAccountAddress = undefined;
        }
        // Making the instance of conract from btcpxStakingWeb3 instance with all the parameters added in it.
        this.btcpxStakingContract = new this.btcpxStakingWeb3.eth.Contract(lpStakingAbi, this.btcpxStakingContractAddress, {
          from: this.currentAccountAddress
        });

        // Making the instance of conract from btcpxWeb3 instance with all the parameters added in it.
        this.btcpxContract = new this.btcpxWeb3.eth.Contract(lpAbi, this.btcpxContractAddress, {
          from: this.currentAccountAddress
        });

        if (this.currentAccountAddress && this.router.url === '/stake') {
          this.getStakingRewards();
          this.getStakingBalance();
          this.getTotalStakingBalance();
          this.getRewardsBalance();
          this.getRewardsPerStakeToken();
          this.getDuration();
          this.getStakingEndTime();
          this.getLpBalance();
          this.calculateTotalLiquidity();
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // This function is used to find whether we have MetaMaskin our browser or not.
  isMetaMaskAvailable() {
    if (ethereum && ethereum.isMetaMask) {
      return true;
    } else {
      return false;
    }
  }

  // This function will return the current Account balance.
  async getMetamaskAccountBalance() {
    return (this.currentAccountAddress ? (await this.btcpxStakingWeb3.eth.getBalance(this.currentAccountAddress) / Math.pow(10, 18)) : 0);
  }

  // This function will return the current Account address from the service variable.
  getCurrentAccountAddress() {
    return this.currentAccountAddress;
  }

  // This function will return the current Ethereum Contract address from the service variable.
  getEthereumContractAddress() {
    return this.btcpxStakingContractAddress;
  }

  // Get the remote address which will be passed in mint function.
  getBtcpxStakingContractInstance() {
    return this.btcpxStakingContract;
  }

  // Get the Total Rewards to be distributed.
  getLpBalance() {
    this.btcpxContract.methods.balanceOf(this.currentAccountAddress).call({}, function(error, amount){
      if (error) {
        console.log(error);
        this.lpBalance.emit(0);
      } else {
        amount /= Math.pow(10, 18);
        // console.log("User LP Balance: ", amount);
        this.lpBalance.emit(amount.toLocaleString('fullwide',{useGrouping:false,maximumFractionDigits:20}));
      }
    }.bind(this));
  }

  // Get the Total Rewards to be distributed.
  getStakingRewards() {
    this.btcpxStakingContract.methods.rewardToBeDistributed().call({}, function(error, amount){
      if (error) {
        console.log(error);
        this.stakingRewards.emit(0);
      } else {
        amount /= Math.pow(10, 18);
        // console.log("User Staking Rewards: ", amount);
        this.stakingRewards.emit(amount.toLocaleString('fullwide',{useGrouping:false,maximumFractionDigits:20}));
      }
    }.bind(this));
  }

  // Get the User Staking Balance.
  getStakingBalance() {
    this.btcpxStakingContract.methods.balanceOf(this.currentAccountAddress).call({}, function(error, amount){
      if (error) {
        console.log(error);
        this.stakingBalance.emit(0);
      } else {
        amount /= Math.pow(10, 18);
        // console.log("User Staking Balance: ", amount);
        this.stakingBalance.emit(amount.toLocaleString('fullwide',{useGrouping:false,maximumFractionDigits:20}));
      }
    }.bind(this));
  }

  // Get the Total Staking Balance.
  getTotalStakingBalance() {
    this.btcpxStakingContract.methods.totalSupply().call({}, function(error, amount){
      if (error) {
        console.log(error);
        this.totalStakingBalance.emit(0);
      } else {
        amount /= Math.pow(10, 18);
        // console.log("Total Staking Balance: ", amount.toLocaleString('fullwide',{useGrouping:false,maximumFractionDigits:20}));
        this.totalStakingBalance.emit(amount.toLocaleString('fullwide',{useGrouping:false,maximumFractionDigits:20}));
      }
    }.bind(this));
  }

  // Function to stake amount
  stakeAmount(amount) {
    amount *= Math.pow(10, 18);

    this.btcpxContract.methods.allowance(this.currentAccountAddress, this.btcpxStakingContractAddress).call({}, function(error, availableAmount){
      if (error) {
        console.log(error);
        this.stakingReceipt.emit(false);
      } else {
        console.log(availableAmount);
        if (availableAmount >= amount) {
          this.stakeFunction(amount);
        } else {
          this.btcpxContract.methods.approve(this.currentAccountAddress, this.btcpxStakingWeb3.utils.toWei("115792089237316195423570985008687907853269984665640564039457584007", "mwei")).send({})
          .on('receipt', function(receipt) {
            this.stakeFunction(amount);
          }.bind(this))
          .on('error', function(error) {
            this.stakingReceipt.emit(false);
          }.bind(this));
        }
        // amount /= Math.pow(10, 18);
        // // console.log("Total Staking Balance: ", amount.toLocaleString('fullwide',{useGrouping:false,maximumFractionDigits:20}));
        // this.totalStakingBalance.emit(amount.toLocaleString('fullwide',{useGrouping:false,maximumFractionDigits:20}));
      }
    }.bind(this));
  }

  stakeFunction(amount) {
    this.btcpxStakingContract.methods.stake(amount.toString()).send({})
    .on('receipt', function(receipt) {
      // console.log("receipt", receipt);
      this.getTotalStakingBalance();
      this.getLpBalance();
      this.getStakingBalance();
      this.stakingReceipt.emit(true);
    }.bind(this))
    .on('error', function(error) {
      // console.log("here11");
      this.stakingReceipt.emit(false);
    }.bind(this));
  }

  // Function to unstake amount
  unstakeAmount(amount) {
    // amount *= Math.pow(10, 18);
    this.btcpxStakingContract.methods.unstake(this.btcpxStakingWeb3.utils.toWei(amount)).send({})
    .on('receipt', function(receipt) {
      this.getTotalStakingBalance();
      this.getLpBalance();
      this.getStakingBalance();
      this.stakingReceipt.emit(true);
    }.bind(this))
    .on('error', function(error) {
      // console.log("here");
      this.stakingReceipt.emit(false);
    }.bind(this));
  }

  // Get the User Earned Rewards Balance
  getRewardsBalance() {
    this.btcpxStakingContract.methods.earned(this.currentAccountAddress).call({}, function(error, amount){
      if (error) {
        // this.burnFees.emit(0);
        console.log("User Earned Rewards Balance: ", error);
        this.rewardsBalance.emit(0);
      } else {
        // this.burnFees.emit(amount);
        amount /= Math.pow(10, 18);
        // console.log("User Earned Rewards Balance: ", amount);
        this.rewardsBalance.emit(amount.toString().match(/^-?\d+(?:\.\d{0,4})?/)[0]);
      }
    }.bind(this));
  }

  // Get the Amount of Rewards Per stake token
  getRewardsPerStakeToken() {
    this.btcpxStakingContract.methods.rewardPerToken().call({}, function(error, amount){
      if (error) {
        console.log("Amount of Rewards Per stake token: ", error);
        this.rewardsPerStakeToken.emit(0);
      } else {
        amount /= Math.pow(10, 18);
        // console.log("Amount of Rewards Per stake token: ", amount);
        this.rewardsPerStakeToken.emit(amount.toString().match(/^-?\d+(?:\.\d{0,4})?/)[0]);
      }
    }.bind(this));
  }

  // Get the Duration of Staking
  getDuration() {
    this.btcpxStakingContract.methods.DURATION().call({}, function(error, amount){
      if (error) {
        console.log("Duration of Staking: ", error);
        this.duration.emit(0);
      } else {
        amount /= 86400;
        // console.log("Duration of Staking: ", amount);
        this.duration.emit(amount);
      }
    }.bind(this));
  }

  // Get the Time when Staking will end
  getStakingEndTime() {
    this.btcpxStakingContract.methods.periodFinish().call({}, function(error, amount){
      if (error) {
        console.log("Time when Staking will end: ", error);
        this.stakingEndTime.emit(0);
      } else {
        // console.log("Time when Staking will end: ", amount);
        this.stakingEndTime.emit(amount);
      }
    }.bind(this));
  }

  // Function to claim Reward
  claimReward() {
    return this.btcpxStakingContract.methods.getReward().call({});
  }

  // Function to Calculate Total Liquidity
  async calculateTotalLiquidity() {
    const coin1 = await Fetcher.fetchTokenData(chainId, this.btcpxStakingWeb3.utils.toChecksumAddress(coin1Address));
    const coin2 = await Fetcher.fetchTokenData(chainId, this.btcpxStakingWeb3.utils.toChecksumAddress(coin2Address));

    const pair = await Fetcher.fetchPairData(coin1, coin2, customHttpProvider);

    let coin1Reserve = pair.reserveOf(coin1);
    let coin2Reserve = pair.reserveOf(coin2);

    coin1Reserve = Number(coin1Reserve.numerator / coin1Reserve.denominator);
    coin2Reserve = Number(coin2Reserve.numerator / coin2Reserve.denominator);

    let tokens = [coin1];
    const weth = WETH[chainId];
    for (const token of tokens) {
        var pairCoin1 = await Fetcher.fetchPairData(token, weth);

    }
    tokens = [coin2];
    for (const token of tokens) {
        var pairCoin2 = await Fetcher.fetchPairData(token, weth);
    }

    const route1 = new Route([pairCoin1], weth);
    const route2 = new Route([pairCoin2], weth);

    let coin1price = route1.midPrice.invert().toSignificant(6);
    let coin2price = route2.midPrice.invert().toSignificant(6);

    const totalLiquidity = (coin1Reserve * coin1price) + (coin2Reserve * coin2price);

    this.stakeContractService.getUsdEquivalentOfEth().subscribe((data: any) => {
      const totalUsd = totalLiquidity * data.ethereum.usd;
      this.totalLiquidity.emit(totalUsd.toString().match(/^-?\d+(?:\.\d{0,4})?/)[0]);
    }, (error) => {
      console.log("total liquidity in eth:", error);
    });
  }

}
