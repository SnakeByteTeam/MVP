import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssingnOperatorDialogComponent } from './assingn-operator-dialog-component';

describe('AssingnOperatorDialogComponent', () => {
  let component: AssingnOperatorDialogComponent;
  let fixture: ComponentFixture<AssingnOperatorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssingnOperatorDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssingnOperatorDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
