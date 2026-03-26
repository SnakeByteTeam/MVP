import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WardRowComponent } from './ward-row-component';

describe('WardRowComponent', () => {
  let component: WardRowComponent;
  let fixture: ComponentFixture<WardRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WardRowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WardRowComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('non dovrebbe emettere se plant null', () => {

    //arrange
    const enableSpy = vi.spyOn(component.enable, 'emit');
    const disableSpy = vi.spyOn(component.disable, 'emit');
    fixture.componentRef.setInput('plant', null);

    //act
    component.onToggle();

    //assert
    expect(enableSpy).not.toHaveBeenCalled();
    expect(disableSpy).not.toHaveBeenCalled();
  });

  it('dovrebbe emmetere disable con id se plant e abilitato', () => {
    const enableSpy = vi.spyOn(component.enable, 'emit');
    const disableSpy = vi.spyOn(component.disable, 'emit');
    fixture.componentRef.setInput('plant', {
      id: 101,
      name: 'App',
      isEnabled: true,
    });

    //act
    component.onToggle();

    //assert
    expect(disableSpy).toHaveBeenCalledWith(101);
    expect(disableSpy).toHaveBeenCalledTimes(1);
    expect(enableSpy).not.toHaveBeenCalled();
  });

  it('dovrebbe emmetere enable con id se plant e disabilitato', () => {
    const enableSpy = vi.spyOn(component.enable, 'emit');
    const disableSpy = vi.spyOn(component.disable, 'emit');
    fixture.componentRef.setInput('plant', {
      id: 101,
      name: 'App',
      isEnabled: false,
    });

    //act
    component.onToggle();

    //assert
    expect(enableSpy).toHaveBeenCalledWith(101);
    expect(enableSpy).toHaveBeenCalledTimes(1);
    expect(disableSpy).not.toHaveBeenCalled();
  });

});
