import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from 'src/app/core/models/user-role.enum';
import { By } from '@angular/platform-browser';

import { WardCardComponent } from 'src/app/features/ward-management/components/ward-card-component/ward-card-component';

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

  const emptyWard = {
    id: 2,
    name: 'Empty Ward',
    apartments: [],
    operators: [],
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

  it('toggleExpanded dovrebbe alternare lo stato espanso e riflettersi nel DOM', () => {
    fixture.componentRef.setInput('ward', ward);
    fixture.detectChanges();
    
    expect(component.isExpanded()).toBe(false);
    expect(fixture.debugElement.query(By.css('.grid.gap-3'))).toBeNull(); // Expanded detail not visible

    // Trigger expand from button
    const expandBtn = fixture.debugElement.queryAll(By.css('button'))[0];
    expandBtn.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.isExpanded()).toBe(true);
    
    // Expanded detail should be visible
    expect(fixture.debugElement.query(By.css('.grid.gap-3'))).toBeTruthy();
  });

  it('should render ward properties and handle clicking edit/delete', () => {
    const editWardSpy = vi.spyOn(component.editWard, 'emit');
    const deleteWardSpy = vi.spyOn(component.deleteWard, 'emit');
    
    fixture.componentRef.setInput('ward', ward);
    fixture.detectChanges();

    // Verify template rendering
    const nameStr = fixture.debugElement.query(By.css('h2')).nativeElement.textContent;
    expect(nameStr).toContain('Cardiologia');

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    // buttons[1] is edit, buttons[2] is delete
    buttons[1].triggerEventHandler('click', null);
    expect(editWardSpy).toHaveBeenCalledWith(ward);
    
    buttons[2].triggerEventHandler('click', null);
    expect(deleteWardSpy).toHaveBeenCalledWith(1);
  });

  it('should render expanded operators and apartments list', () => {
    fixture.componentRef.setInput('ward', ward);
    component.toggleExpanded();
    fixture.detectChanges();

    // Verify operator listed
    const opElement = fixture.debugElement.query(By.css('section[aria-label="Operatori assegnati"] span'));
    expect(opElement.nativeElement.textContent).toContain('Mario Rossi');
    
    // Verify apartment listed
    const aptSection = fixture.debugElement.query(By.css('section[aria-label="Appartamenti assegnati"]'));
    expect(aptSection).toBeTruthy();
  });

  it('should render empty states when operators/apartments are empty', () => {
    fixture.componentRef.setInput('ward', emptyWard);
    component.toggleExpanded();
    fixture.detectChanges();

    const emptyOpText = fixture.debugElement.query(By.css('section[aria-label="Operatori assegnati"] p')).nativeElement.textContent;
    expect(emptyOpText).toContain('Nessun operatore assegnato');

    const emptyAptText = fixture.debugElement.query(By.css('section[aria-label="Appartamenti assegnati"] p')).nativeElement.textContent;
    expect(emptyAptText).toContain('Nessun appartamento assegnato');
  });

  it('should trigger operator assignment/removal from DOM', () => {
    const assignOperatorSpy = vi.spyOn(component.assignOperator, 'emit');
    const removeOperatorSpy = vi.spyOn(component.removeOperator, 'emit');
    
    fixture.componentRef.setInput('ward', ward);
    component.toggleExpanded();
    fixture.detectChanges();

    const opSection = fixture.debugElement.query(By.css('section[aria-label="Operatori assegnati"]'));
    const buttons = opSection.queryAll(By.css('button'));
    
    // assign
    buttons[0].triggerEventHandler('click', null);
    expect(assignOperatorSpy).toHaveBeenCalledWith(1);
    
    // remove (the red x button)
    buttons[1].triggerEventHandler('click', null);
    expect(removeOperatorSpy).toHaveBeenCalledWith({ wardId: 1, userId: 1 });
  });

  it('should trigger apartment assignment/removal from DOM', () => {
    const assignPlantSpy = vi.spyOn(component.assignPlant, 'emit');
    const removePlantSpy = vi.spyOn(component.removePlant, 'emit');
    
    fixture.componentRef.setInput('ward', ward);
    component.toggleExpanded();
    fixture.detectChanges();

    const aptSection = fixture.debugElement.query(By.css('section[aria-label="Appartamenti assegnati"]'));
    const buttons = aptSection.queryAll(By.css('button'));
    
    // assign
    buttons[0].triggerEventHandler('click', null);
    expect(assignPlantSpy).toHaveBeenCalledWith(1);
    
    // remove
    buttons[1].triggerEventHandler('click', null);
    expect(removePlantSpy).toHaveBeenCalledWith({ wardId: 1, plantId: '101' });
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
