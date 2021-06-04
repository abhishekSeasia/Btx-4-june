import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Web3 from 'web3';

import { environment } from '../../environments/environment';

let network = '';
// This functionality will keep the api's working for localhost as well as app-stagings server.
if (environment.production) {
  network = '0x5';
} else {
  network = '0x5';
}

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
export class StakeContractService {
  cartData = new EventEmitter<any>();
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

  ethEuivalentInUsdUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';

  private lpStakingWeb3: any;
  private lpStakingContract: any;
  private lpStakingContractAddress = '0x7346cd828D89de5b8C86F1bf40f3Bcdfd441e5Bc';

  private lpWeb3: any;
  private lpContract: any;
  private lpContractAddress = '0x0bE4EFf509e943b22535b72fd982d736548126b8';

  private currentAccountAddress = undefined;
  private currentHexAddress = '';

  constructor(private http: HttpClient, private router: Router) {
    if (typeof window.ethereum !== 'undefined') {

      // Ethereum instance of Web3
      this.lpStakingWeb3 = new Web3(window.ethereum);
      this.lpWeb3 = new Web3(window.ethereum);

      this.createInstanceOfContracts();

      // Callback function called when there is any network change in MetaMask.
      ethereum.on('chainChanged', this.handleChainChanged.bind(this));

      // Callback function called when there is any account change in MetaMask.
      ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
    }
  }

  async createInstanceOfContracts() {
    // Getting the account address from which we need to make transactions.
    await ethereum
      .request({ method: 'eth_accounts' })
      .then((accounts: any) => {
        // Saving the address of the currently connected account.
        if (accounts && accounts[0]) {
          this.currentAccountAddress = this.lpStakingWeb3.utils.toChecksumAddress(accounts[0]);
        } else {
          this.currentAccountAddress = undefined;
        }
        // Making the instance of conract from lpStakingWeb3 instance with all the parameters added in it.
        this.lpStakingContract = new this.lpStakingWeb3.eth.Contract(lpStakingAbi, this.lpStakingContractAddress, {
          from: this.currentAccountAddress
        });

        // Making the instance of conract from lpWeb3 instance with all the parameters added in it.
        this.lpContract = new this.lpWeb3.eth.Contract(lpAbi, this.lpContractAddress, {
          from: this.currentAccountAddress
        });

        this.cartData.emit(true);
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

  // This function is used to connect MetaMaskto our application.
  connectMetaMask = async () => {
    try {
      //Will Start the MetaMask Extension
      await ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error) {
      console.error(error);
    }
  };

  // This function will be called when there is any network change occur on metamask.
  handleChainChanged(chainId: string) {
    if (chainId === '0x1') {
      console.log("User connected to Main Net");
      this.cartData.emit(false);
    } else if(chainId === '0x2') {
      console.log("User connected to Ropsten Test Net");
      this.cartData.emit(false);
    } else if(chainId === '0x3') {
      console.log("User connected to Kovan Test Net");
      this.cartData.emit(false);
    } else if(chainId === '0x4') {
      console.log("User connected to Rinkeby Test Net");
      this.cartData.emit(false);
    } else if(chainId === '0x5') {
      console.log("User connected to Goerli Test Net");
      this.cartData.emit(true);
    }
    window.location.reload();
  }

  // This function will be called when the metamask account is changed.
  handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      this.currentAccountAddress = undefined;
    } else {
      this.currentAccountAddress = this.lpStakingWeb3.utils.toChecksumAddress(accounts[0]);
    }
    // console.log("reload");
    window.location.reload();
  }

  // This function is used to check whether we have any metamask account connected to our application or not.
  async checkMetaMaskAccountConnected() {
    if (ethereum && ethereum.isMetaMask) {
      let currentChainId = ethereum.chainId;
      let testNetwork = false;
      // Getting the account address of the metamask account which is connected.
      await ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts: any) => {
          if (accounts && accounts[0] ) {
            this.currentAccountAddress = this.lpStakingWeb3.utils.toChecksumAddress(accounts[0]);
            if (currentChainId === '0x5') {
              testNetwork = true;
            }
          } else {
            this.currentAccountAddress = undefined;
          }
        })
        .catch((error) => {
          this.currentAccountAddress = undefined;
          console.log(error);
        });
      if (this.currentAccountAddress) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  // This function is used to check whether we have any metamask account connected to our application or not.
  checkNetwork() {
    let currentChainId = ethereum.chainId;
    if (currentChainId !== network) {
      return network;
    } else {
      return undefined;
    }
  }

  // This function will return the current Account balance.
  async getMetamaskAccountBalance() {
    return (this.currentAccountAddress ? (await this.lpStakingWeb3.eth.getBalance(this.currentAccountAddress) / Math.pow(10, 18)) : 0);
  }

  // This function will return the current Account address from the service variable.
  getCurrentAccountAddress() {
    return this.currentAccountAddress;
  }

  // This function will return the current Ethereum Contract address from the service variable.
  getEthereumContractAddress() {
    return this.lpStakingContractAddress;
  }

  // Get the remote address which will be passed in mint function.
  getLpStakingContractInstance() {
    return this.lpStakingContract;
  }

  // Get the Total Rewards to be distributed.
  getLpBalance() {
    this.lpContract.methods.balanceOf(this.currentAccountAddress).call({}, function(error, amount){
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
    this.lpStakingContract.methods.rewardToBeDistributed().call({}, function(error, amount){
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
    this.lpStakingContract.methods.balanceOf(this.currentAccountAddress).call({}, function(error, amount){
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
    this.lpStakingContract.methods.totalSupply().call({}, function(error, amount){
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

    this.lpContract.methods.allowance(this.currentAccountAddress, this.lpStakingContractAddress).call({}, function(error, availableAmount){
      if (error) {
        console.log(error);
        this.stakingReceipt.emit(false);
      } else {
        if (availableAmount >= amount) {
          this.stakeFunction(amount);
        } else {
          this.lpContract.methods.approve(this.currentAccountAddress, this.lpStakingWeb3.utils.toWei("115792089237316195423570985008687907853269984665640564039457584007", "mwei")).send({})
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
    this.lpStakingContract.methods.stake(amount.toString()).send({})
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
    this.lpStakingContract.methods.unstake(this.lpStakingWeb3.utils.toWei(amount)).send({})
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
    this.lpStakingContract.methods.earned(this.currentAccountAddress).call({}, function(error, amount){
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
    this.lpStakingContract.methods.rewardPerToken().call({}, function(error, amount){
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
    this.lpStakingContract.methods.DURATION().call({}, function(error, amount){
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
    this.lpStakingContract.methods.periodFinish().call({}, function(error, amount){
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
    return this.lpStakingContract.methods.getReward().call({});
  }

  // Function to Calculate Total Liquidity
  async calculateTotalLiquidity() {
    const coin1 = await Fetcher.fetchTokenData(chainId, this.lpStakingWeb3.utils.toChecksumAddress(coin1Address));
    const coin2 = await Fetcher.fetchTokenData(chainId, this.lpStakingWeb3.utils.toChecksumAddress(coin2Address));

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

    this.getUsdEquivalentOfEth().subscribe((data: any) => {
      const totalUsd = totalLiquidity * data.ethereum.usd;
      this.totalLiquidity.emit(totalUsd.toString().match(/^-?\d+(?:\.\d{0,4})?/)[0]);
    }, (error) => {
      console.log("total liquidity in eth:", error);
    });
  }

  /***
    * This function is called from Stake Contract Service.
    * This function is used to get the USD amount of 1 ETH.
    * Will be used to show USD equivalent of the amount entered by user.
  ***/
  getUsdEquivalentOfEth() {
    return this.http.get(this.ethEuivalentInUsdUrl);
  }

}
