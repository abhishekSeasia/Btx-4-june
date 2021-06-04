import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleStakeComponent } from './single-stake.component';

describe('SingleStakeComponent', () => {
  let component: SingleStakeComponent;
  let fixture: ComponentFixture<SingleStakeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SingleStakeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleStakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
