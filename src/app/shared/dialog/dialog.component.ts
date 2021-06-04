import { Component, OnInit, Input, Output, OnChanges, EventEmitter, HostListener } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
  animations: [
    trigger('dialog', [
      transition('void => *', [
        style({ transform: 'scale3d(.3, .3, .3)' }),
        animate(100)
      ]),
      transition('* => void', [
        animate(100, style({ transform: 'scale3d(.0, .0, .0)' }))
      ])
    ])
  ]
})
export class DialogComponent implements OnInit {
  @Input() closable = true;
  @Input() visible: boolean;
  @Input() dlgClass = 'sm';
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
   }

  close() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }
  @HostListener('window:keyup.esc') onKeyUp() {
    this.close();
  }
  // @HostListener('click', ['$event.target']) onClick(btn) {
  //   this.close();
  // }
}
