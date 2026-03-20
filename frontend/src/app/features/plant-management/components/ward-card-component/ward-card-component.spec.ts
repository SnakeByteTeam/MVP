import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '../../../../core/models/user-role.enum';

import { WardCardComponent } from './ward-card-component';

describe('WardCardComponent', () => {
  let component: WardCardComponent;
  let fixture: ComponentFixture<WardCardComponent>;

  const ward = {
    id: 'ward-1',
    name: 'Cardiologia',
    apartments: [{ id: 'apt-1', name: 'App. 101', isEnabled: true }],
    operators: [
      {
        id: 'user-1',
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

    expect(deleteWardSpy).toHaveBeenCalledWith('ward-1');
    expect(deleteWardSpy).toHaveBeenCalledTimes(1);
  });

  it('onAssignOperatorClick dovrebbe emettere assignOperator con ward.id', () => {
    const assignOperatorSpy = vi.spyOn(component.assignOperator, 'emit');
    fixture.componentRef.setInput('ward', ward);

    component.onAssignOperatorClick();

    expect(assignOperatorSpy).toHaveBeenCalledWith('ward-1');
    expect(assignOperatorSpy).toHaveBeenCalledTimes(1);
  });

  it('onRemoveOperatorClick dovrebbe emettere payload completo', () => {
    const removeOperatorSpy = vi.spyOn(component.removeOperator, 'emit');
    fixture.componentRef.setInput('ward', ward);

    component.onRemoveOperatorClick('user-2');

    expect(removeOperatorSpy).toHaveBeenCalledWith({
      wardId: 'ward-1',
      userId: 'user-2',
    });
    expect(removeOperatorSpy).toHaveBeenCalledTimes(1);
  });

  it('onAssignApartmentClick dovrebbe emettere assignApartment con ward.id', () => {
    const assignApartmentSpy = vi.spyOn(component.assignApartment, 'emit');
    fixture.componentRef.setInput('ward', ward);

    component.onAssignApartmentClick();

    expect(assignApartmentSpy).toHaveBeenCalledWith('ward-1');
    expect(assignApartmentSpy).toHaveBeenCalledTimes(1);
  });

  it('onRemoveApartmentClick dovrebbe emettere payload completo', () => {
    const removeApartmentSpy = vi.spyOn(component.removeApartment, 'emit');
    fixture.componentRef.setInput('ward', ward);

    component.onRemoveApartmentClick('apt-2');

    expect(removeApartmentSpy).toHaveBeenCalledWith({
      wardId: 'ward-1',
      apartmentId: 'apt-2',
    });
    expect(removeApartmentSpy).toHaveBeenCalledTimes(1);
  });

  it('onEnableApartment dovrebbe inoltrare l id appartamento', () => {
    const enableApartmentSpy = vi.spyOn(component.enableApartment, 'emit');

    component.onEnableApartment('apt-10');

    expect(enableApartmentSpy).toHaveBeenCalledWith('apt-10');
    expect(enableApartmentSpy).toHaveBeenCalledTimes(1);
  });

  it('onDisableApartment dovrebbe inoltrare l id appartamento', () => {
    const disableApartmentSpy = vi.spyOn(component.disableApartment, 'emit');

    component.onDisableApartment('apt-11');

    expect(disableApartmentSpy).toHaveBeenCalledWith('apt-11');
    expect(disableApartmentSpy).toHaveBeenCalledTimes(1);
  });

  it('non dovrebbe emettere eventi legati al ward quando ward e null', () => {
    const editWardSpy = vi.spyOn(component.editWard, 'emit');
    const deleteWardSpy = vi.spyOn(component.deleteWard, 'emit');
    const assignOperatorSpy = vi.spyOn(component.assignOperator, 'emit');
    const removeOperatorSpy = vi.spyOn(component.removeOperator, 'emit');
    const assignApartmentSpy = vi.spyOn(component.assignApartment, 'emit');
    const removeApartmentSpy = vi.spyOn(component.removeApartment, 'emit');

    fixture.componentRef.setInput('ward', null);

    component.onEditWardClick();
    component.onDeleteWardClick();
    component.onAssignOperatorClick();
    component.onRemoveOperatorClick('user-1');
    component.onAssignApartmentClick();
    component.onRemoveApartmentClick('apt-1');

    expect(editWardSpy).not.toHaveBeenCalled();
    expect(deleteWardSpy).not.toHaveBeenCalled();
    expect(assignOperatorSpy).not.toHaveBeenCalled();
    expect(removeOperatorSpy).not.toHaveBeenCalled();
    expect(assignApartmentSpy).not.toHaveBeenCalled();
    expect(removeApartmentSpy).not.toHaveBeenCalled();
  });
});
