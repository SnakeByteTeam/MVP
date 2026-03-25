import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { provideRouter } from '@angular/router';
import { vi, describe, it, expect, beforeEach } from 'vitest';

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
    expect(links.length).toBe(2);
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

  it('emettere evento collapsed', () => {
    const spy = vi.spyOn(component.collapsed, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    
    button.click();
    
    expect(spy).toHaveBeenCalled();
  });
});