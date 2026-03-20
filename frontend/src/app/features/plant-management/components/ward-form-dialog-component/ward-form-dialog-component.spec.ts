import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WardFormDialogComponent } from './ward-form-dialog-component';

describe('WardFormDialogComponent', () => {
  let component: WardFormDialogComponent;
  let fixture: ComponentFixture<WardFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WardFormDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WardFormDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
