import { Component, InjectionToken, ChangeDetectorRef } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

import { StakeContractService } from './services/stake_contract.service';
import { SingleStakeContractService } from './services/single_stake_contract.service';
declare const window: any;
const { ethereum } = window;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'kryptoin';
  metaMaskConnected = false;
  isMetaMaskAccountConnected = false;
  connectToNetwork: any = undefined;
  connectingMetaMask = false;
  closeResult = '';
  currentAccountAddress = undefined;
  isLandingGroupPage = false;
  landingPages = ['/team','/'];
  totalPendingTransactions = 0;

  constructor(
    public stakeContractService: StakeContractService,
    public singleStakeContractService: SingleStakeContractService,
    private ngbModal: NgbModal,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.metaMaskConnected = this.stakeContractService.isMetaMaskAvailable();
    this.router.events.subscribe((res) => { 
      this.isLandingGroupPage = this.landingPages.includes(this.router.url);
    });
    
    this.stakeContractService.cartData.subscribe(
      async (data: any) => {
        await this.checkMetaMaskConnection();
      }
    );
  }

  async checkMetaMaskConnection() {
    if (this.metaMaskConnected) {
      this.isMetaMaskAccountConnected = await this.stakeContractService.checkMetaMaskAccountConnected();
      this.currentAccountAddress = this.stakeContractService.getCurrentAccountAddress();
      if (this.isMetaMaskAccountConnected) {
        this.connectToNetwork = await this.stakeContractService.checkNetwork();
        this.cdr.detectChanges();
      }
    }
  }

  async ngOnInit() {
    await this.checkMetaMaskConnection();
  }

  connectMetaMask = async () => {
    this.connectingMetaMask = true;
    await this.stakeContractService.connectMetaMask();
    this.connectingMetaMask = false;
  };

  toggleSidebar() {
    document.body.classList.toggle('sidebar-opened');
  }

  async open(exampleModal) {
    await this.checkMetaMaskConnection();

    this.ngbModal.open(exampleModal, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
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
