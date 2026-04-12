import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { AlarmPriority } from 'src/app/core/alarm/models/alarm-priority.enum';
import { AlarmPriorityIndicatorComponent } from 'src/app/shared/components/alarm-table/alarm-priority-indicator.component';

describe('AlarmPriorityIndicatorComponent', () => {
    let fixture: ComponentFixture<AlarmPriorityIndicatorComponent>;
    let component: AlarmPriorityIndicatorComponent;

    const setPriority = (priority: AlarmPriority): void => {
        fixture.componentRef.setInput('priority', priority);
        fixture.detectChanges();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AlarmPriorityIndicatorComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AlarmPriorityIndicatorComponent);
        component = fixture.componentInstance;
    });

    it('mappa la priorita rossa', () => {
        setPriority(AlarmPriority.RED);

        const nativeElement = fixture.nativeElement as HTMLElement;

        expect(component.ui().label).toBe('Alta');
        expect(nativeElement.querySelector('[aria-label]')?.getAttribute('aria-label')).toBe('Priorita Alta');
        expect(nativeElement.textContent).toContain('▲');
    });

    it('mappa la priorita arancione', () => {
        setPriority(AlarmPriority.ORANGE);

        expect(component.ui().label).toBe('Media');
        expect(fixture.nativeElement.textContent).toContain('!');
    });

    it('mappa la priorita verde', () => {
        setPriority(AlarmPriority.GREEN);

        expect(component.ui().label).toBe('Bassa');
        expect(fixture.nativeElement.textContent).toContain('•');
    });

    it('mappa la priorita bianca', () => {
        setPriority(AlarmPriority.WHITE);

        expect(component.ui().label).toBe('Informativa');
        expect(fixture.nativeElement.textContent).toContain('i');
    });
});