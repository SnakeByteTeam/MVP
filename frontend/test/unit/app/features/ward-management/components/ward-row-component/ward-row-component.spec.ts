import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { WardRowComponent } from 'src/app/features/ward-management/components/ward-row-component/ward-row-component';

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

  it('accetta plant nullo', () => {
    fixture.componentRef.setInput('plant', null);

    fixture.detectChanges();

    expect(component.plant()).toBeNull();
  });

  it('accetta plant valorizzato con id stringa', () => {
    fixture.componentRef.setInput('plant', {
      id: '101',
      name: 'App',
    });

    fixture.detectChanges();

    expect(component.plant()).toEqual({ id: '101', name: 'App' });
  });
});
