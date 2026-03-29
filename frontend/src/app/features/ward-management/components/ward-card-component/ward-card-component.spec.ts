import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '../../../../core/models/user-role.enum';

import { WardCardComponent } from './ward-card-component';

describe('WardCardComponent', () => {
  let component: WardCardComponent;
  let fixture: ComponentFixture<WardCardComponent>;

  const ward = {
    id: 1,
    name: 'Cardiologia',
    apartments: [{ id: '101', name: 'App. 101' }],
    operators: [
      {
        id: 1,
        firstName: 'Mario',
        lastName: 'Rossi',
        username: 'mrossi',
        role: UserRole.OPERATORE_SANITARIO,
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WardCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WardCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggleExpanded dovrebbe alternare lo stato espanso', () => {
    expect(component.isExpanded()).toBe(false);

    component.toggleExpanded();
    expect(component.isExpanded()).toBe(true);

    component.toggleExpanded();
    expect(component.isExpanded()).toBe(false);
  });

  it('onEditWardClick dovrebbe emettere editWard con il ward corrente', () => {
    const editWardSpy = vi.spyOn(component.editWard, 'emit');
    fixture.componentRef.setInput('ward', ward);

    component.onEditWardClick();

    expect(editWardSpy).toHaveBeenCalledWith(ward);
    expect(editWardSpy).toHaveBeenCalledTimes(1);
  });

  it('onDeleteWardClick dovrebbe emettere deleteWard con ward.id', () => {
    const deleteWardSpy = vi.spyOn(component.deleteWard, 'emit');
    fixture.componentRef.setInput('ward', ward);

    component.onDeleteWardClick();

    expect(deleteWardSpy).toHaveBeenCalledWith(1);
    expect(deleteWardSpy).toHaveBeenCalledTimes(1);
  });

  it('onAssignOperatorClick dovrebbe emettere assignOperator con ward.id', () => {
    const assignOperatorSpy = vi.spyOn(component.assignOperator, 'emit');
    fixture.componentRef.setInput('ward', ward);

    component.onAssignOperatorClick();

    expect(assignOperatorSpy).toHaveBeenCalledWith(1);
    expect(assignOperatorSpy).toHaveBeenCalledTimes(1);
  });

  it('onRemoveOperatorClick dovrebbe emettere payload completo', () => {
    const removeOperatorSpy = vi.spyOn(component.removeOperator, 'emit');
    fixture.componentRef.setInput('ward', ward);

    component.onRemoveOperatorClick(2);

    expect(removeOperatorSpy).toHaveBeenCalledWith({
      wardId: 1,
      userId: 2,
    });
    expect(removeOperatorSpy).toHaveBeenCalledTimes(1);
  });

  it('onAssignPlantClick dovrebbe emettere assignPlant con ward.id', () => {
    const assignPlantSpy = vi.spyOn(component.assignPlant, 'emit');
    fixture.componentRef.setInput('ward', ward);

    component.onAssignPlantClick();

    expect(assignPlantSpy).toHaveBeenCalledWith(1);
    expect(assignPlantSpy).toHaveBeenCalledTimes(1);
  });

  it('onRemovePlantClick dovrebbe emettere payload completo', () => {
    const removePlantSpy = vi.spyOn(component.removePlant, 'emit');
    fixture.componentRef.setInput('ward', ward);

    component.onRemovePlantClick('102');

    expect(removePlantSpy).toHaveBeenCalledWith({
      wardId: 1,
      plantId: '102',
    });
    expect(removePlantSpy).toHaveBeenCalledTimes(1);
  });

  it('non dovrebbe emettere eventi legati al ward quando ward e null', () => {
    const editWardSpy = vi.spyOn(component.editWard, 'emit');
    const deleteWardSpy = vi.spyOn(component.deleteWard, 'emit');
    const assignOperatorSpy = vi.spyOn(component.assignOperator, 'emit');
    const removeOperatorSpy = vi.spyOn(component.removeOperator, 'emit');
    const assignPlantSpy = vi.spyOn(component.assignPlant, 'emit');
    const removePlantSpy = vi.spyOn(component.removePlant, 'emit');

    fixture.componentRef.setInput('ward', null);

    component.onEditWardClick();
    component.onDeleteWardClick();
    component.onAssignOperatorClick();
    component.onRemoveOperatorClick(1);
    component.onAssignPlantClick();
    component.onRemovePlantClick('101');

    expect(editWardSpy).not.toHaveBeenCalled();
    expect(deleteWardSpy).not.toHaveBeenCalled();
    expect(assignOperatorSpy).not.toHaveBeenCalled();
    expect(removeOperatorSpy).not.toHaveBeenCalled();
    expect(assignPlantSpy).not.toHaveBeenCalled();
    expect(removePlantSpy).not.toHaveBeenCalled();
  });
});
