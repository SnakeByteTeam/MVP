import { ComponentFixture, TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssignOperatorDialogComponent } from './assign-operator-dialog-component';
import { UserRole } from '../../../../core/models/user-role.enum';
import { UserApiService } from '../../../../core/services/user-api.service';

describe('AssignOperatorDialogComponent', () => {
  let component: AssignOperatorDialogComponent;
  let fixture: ComponentFixture<AssignOperatorDialogComponent>;

  const users = [
    {
      id: 'u-1',
      firstName: 'Mario',
      lastName: 'Rossi',
      username: 'mrossi',
      role: UserRole.OPERATORE_SANITARIO,
    },
  ];

  const userApiStub = {
    getUsers: vi.fn(),
  };



  beforeEach(async () => {
    //pulisco mocks
    vi.clearAllMocks();
    userApiStub.getUsers.mockReturnValue(of(users));

    await TestBed.configureTestingModule({
      imports: [AssignOperatorDialogComponent],
      providers: [{ provide: UserApiService, useValue: userApiStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignOperatorDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('dovrebbe caricare gli operatori in ngOnInit chiamando UserApiService', async () => {
    fixture.detectChanges();
    expect(userApiStub.getUsers).toHaveBeenCalledTimes(1);

    const result = await firstValueFrom(component.operators$);
    expect(result).toEqual(users);
    expect(result).toHaveLength(1);
  });

  it('non dovrebbe emettere submitted se il form e invalido', () => {
    // Arrange
    fixture.detectChanges();
    const submittedSpy = vi.spyOn(component.submitted, 'emit');
    component.form.controls.userId.setValue('');

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
    component.form.controls.userId.setValue('u-1');

    // Act
    component.onSubmit();

    // Assert
    expect(submittedSpy).toHaveBeenCalledWith({ userId: 'u-1' });
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
