import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssignOperatorDialogComponent } from './assign-operator-dialog-component';
import { UserRole } from '../../../../core/models/user-role.enum';

describe('AssignOperatorDialogComponent', () => {
  let component: AssignOperatorDialogComponent;
  let fixture: ComponentFixture<AssignOperatorDialogComponent>;

  const users = [
    {
      id: 1,
      firstName: 'Mario',
      lastName: 'Rossi',
      username: 'mrossi',
      role: UserRole.OPERATORE_SANITARIO,
    },
  ];

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [AssignOperatorDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignOperatorDialogComponent);
    fixture.componentRef.setInput('availableOperators', users);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('dovrebbe resettare userId in ngOnInit', () => {
    component.form.controls.userId.setValue(99);
    fixture.detectChanges();

    expect(component.form.controls.userId.value).toBeNull();
  });

  it('getOperatorLabel usa nome completo e fallback su username', () => {
    expect(component.getOperatorLabel(users[0])).toBe('Mario Rossi');
    expect(
      component.getOperatorLabel({
        id: 2,
        firstName: '',
        lastName: '',
        username: 'lverdi',
        role: UserRole.OPERATORE_SANITARIO,
      }),
    ).toBe('lverdi');
  });

  it('non dovrebbe emettere submitted se il form e invalido', () => {
    // Arrange
    fixture.detectChanges();
    const submittedSpy = vi.spyOn(component.submitted, 'emit');
    component.form.controls.userId.setValue(null);

    // Act
    component.onSubmit();

    // Assert
    expect(component.form.invalid).toBe(true);
    expect(component.form.controls.userId.touched).toBe(true);
    expect(submittedSpy).not.toHaveBeenCalled();
  });

  it('dovrebbe emettere submitted con userId quando il form e valido', () => {
    // Arrange
    fixture.detectChanges();
    const submittedSpy = vi.spyOn(component.submitted, 'emit');
    component.form.controls.userId.setValue(1);

    // Act
    component.onSubmit();

    // Assert
    expect(submittedSpy).toHaveBeenCalledWith({ userId: 1 });
    expect(submittedSpy).toHaveBeenCalledTimes(1);
  });

  it('dovrebbe emettere cancelled quando onCancel viene chiamato', () => {
    // Arrange
    const cancelledSpy = vi.spyOn(component.cancelled, 'emit');

    // Act
    component.onCancel();

    // Assert
    expect(cancelledSpy).toHaveBeenCalledTimes(1);
  });
});
