import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PlantOverviewComponent } from 'src/app/features/dashboard/components/plant-overview/plant-overview.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('PlantOverviewComponent', () => {
  let component: PlantOverviewComponent;
  let fixture: ComponentFixture<PlantOverviewComponent>;

  const mockData = {
    id: '1',
    name: 'Casa Test',
    rooms: [
      { id: 'r1', name: 'Soggiorno', devices: [{ id: 'd1', name: 'Luce' }] },
      { id: 'r2', name: 'Camera', devices: [] }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantOverviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlantOverviewComponent);
    component = fixture.componentInstance;
  });

  it('1. Dovrebbe mostrare il nome dell impianto', () => {
    component.apartment = mockData;
    fixture.detectChanges();
    
    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Casa Test');
  });

  it('2. Dovrebbe mostrare i nomi delle stanze', () => {
    component.apartment = mockData;
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Soggiorno');
    expect(html.textContent).toContain('Camera');
  });

  it('3. Dovrebbe gestire il caso senza dispositivi', () => {
    component.apartment = mockData;
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Nessun dispositivo configurato');
  });

  it('4. Non dovrebbe mostrare nulla se apartment è null', () => {
    component.apartment = null;
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    
    expect(html.querySelector('header')).toBeNull();
  });
});