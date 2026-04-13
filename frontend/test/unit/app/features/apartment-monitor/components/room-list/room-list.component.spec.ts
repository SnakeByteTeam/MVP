import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RoomListComponent } from 'src/app/features/apartment-monitor/components/room-list/room-list.component';

describe('RoomListComponent', () => {
  let fixture: ComponentFixture<RoomListComponent>;
  let component: RoomListComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomListComponent);
    component = fixture.componentInstance;
  });

  it('crea il componente', () => {
    expect(component).toBeTruthy();
  });

  it('onRoomSelect emette l id selezionato', () => {
    const emitSpy = vi.spyOn(component.roomSelected, 'emit');

    component.onRoomSelect('room-77');

    expect(emitSpy).toHaveBeenCalledWith('room-77');
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });
});
