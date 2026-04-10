import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
  });


  it('mostra un link per ogni navItem con indirizzi corretti', () => {
    component.navItems = [
      { label: 'test1', route: 'path1', icon: '' },
      { label: 'test2', route: 'path2', icon: '' }
    ];
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll('a');
    expect(links.length).toBe(3);
    expect(links[0].textContent).toContain('test1');
    expect(links[0].getAttribute('href')).toBe('/path1');
    expect(links[1].textContent).toContain('test2');
    expect(links[1].getAttribute('href')).toBe('/path2');
  });

  it('mostra messaggio se navItems è vuoto', () => {
    component.navItems = [];
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Menu di navigazione vuoto!');
  });

  it('non mostra controllo di chiusura sidebar', () => {
    component.navItems = [{ label: 'test', route: 'path', icon: '' }];
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button).toBeNull();
  });

  it('emette navItemSelected con la route selezionata', () => {
    const spy = vi.spyOn(component.navItemSelected, 'emit');
    component.navItemSelected.emit('alarms/alarm-management');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('alarms/alarm-management');
  });
});
