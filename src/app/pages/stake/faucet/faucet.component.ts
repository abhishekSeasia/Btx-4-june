import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ParamMap, Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-faucet',
  templateUrl: './faucet.component.html',
  styleUrls: ['./faucet.component.css']
})
export class FaucetComponent implements OnInit {
@ViewChild ("exampleModal")
  exampleModal: TemplateRef <any>;

  presentView = 1;
  showText = false;
  isCopied = false;
  sliderNumber = 1;
  moneyReceived = false;
  isMetaMaskAccountConnected = false;
  redeemPage =  {
    btcAddress : '',
    btcAmount : null,
    btcpxAmount : null,
    availableBtcpxBalance : 0.01245,
    availableBtcpxSupply: 0,
    availableBtcCustodyBalance: 0,
    usdEquivalentOfBtcAmount : 0,
    usdEquivalentOfBtcpxAmount : 0,
    usdEquivalentOfBtcSupply : 0,
    usdEquivalentOfBtcpxSupply : 0,
    usdEquivalentOfBtcpxBalance : 0,
    usdEquivalentOfBtcCustodyBalance : 0
  };
  closeResult = '';
  metaMaskConnected = false;
  connectToNetwork: any = undefined;
  connectingMetaMask = false;
  usdEquivalentOfBtc: any = 0;
  networkFees: any = 0;
  gotNetworkFees = false;
  burnFees: any = 0;
  burnFeesPercentage: any = 0;
  oldBtcpxAmount = 0;
  transactions: any = [];
  burningStarted = false;
  burningEnded = false;
  burnedAmount = 0;
  pendingTime = 0;
  pendingTimeInMin = false;
  param1: string;

  constructor(private route: ActivatedRoute) {
    this.param1 = this.route.snapshot.params.id;
    console.log(this.param1);
  }

  async ngOnInit() {
  }
}
