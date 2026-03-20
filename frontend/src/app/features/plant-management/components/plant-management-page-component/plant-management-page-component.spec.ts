import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantManagementPageComponent } from './plant-management-page-component';

describe('PlantManagementPageComponent', () => {
  let component: PlantManagementPageComponent;
  let fixture: ComponentFixture<PlantManagementPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantManagementPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlantManagementPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
