import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';


export function runSharedChartTests(componentType: any) {
    let component: any;
    let fixture: ComponentFixture<any>;

    beforeEach(async () => {
        fixture = TestBed.createComponent(componentType);
        component = fixture.componentInstance;;
    });

    describe('con suggerimenti attivi', () => {
        beforeEach(() => {
        component.chartInfo = {
            title: 'title',
            metric: "metric",
            unit: "unit",
            labels: ["l1","l2"],
            datasets: [{id:"id", name:"name", data:[1,1]}],
            suggestions: { isSuggestion: true, messages: ['Sugg 1', 'Sugg 2'] }
            };
        fixture.detectChanges();
    });

    it('dovrebbe restringere il grafico al 70% su schermi grandi', () => {
      const chartDiv = fixture.debugElement.query(By.css('.lg\\:w-\\[70\\%\\]'));
      expect(chartDiv).not.toBeNull();
    });

    it('dovrebbe mostrare la colonna laterale dei suggerimenti', () => {
      const suggestionColumn = fixture.debugElement.query(By.css('.lg\\:w-\\[30\\%\\]'));
      expect(suggestionColumn).not.toBeNull();
    });

    it('dovrebbe renderizzare il contenuto esatto dei suggerimenti', () => {
        const items = fixture.debugElement.queryAll(By.css('li'));
        expect(items.length).toBe(2);
        expect(items[0].nativeElement.textContent).toContain('Sugg 1');
    });

  });

  describe('senza suggerimenti', () => {
    beforeEach(() => {
      component.chartInfo = {
            title: 'title',
            metric: "metric",
            unit: "unit",
            labels: ["l1","l2"],
            datasets: [{id:"id", name:"name", data:[1,1]}],
            suggestions: { isSuggestion: false, messages: [] }
        };
        fixture.detectChanges();
    });

    it('dovrebbe espandere il grafico al 100% della larghezza', () => {
      const chartDiv = fixture.debugElement.query(By.css('.w-full'));
      expect(chartDiv).not.toBeNull();
    });

    it('NON dovrebbe esistere la colonna dei suggerimenti nel DOM', () => {
      const suggestionColumn = fixture.debugElement.query(By.css('.lg\\:w-\\[30\\%\\]'));
      expect(suggestionColumn).toBeNull();
    });

  });

    
}