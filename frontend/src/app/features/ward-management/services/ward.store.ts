import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import type { Plant } from '../models/plant.model';
import type { WardManagementState } from '../models/ward-management-state.model';
import type { Ward } from '../models/ward.model';

const INITIAL_STATE: WardManagementState = {
  wards: [],
  isLoading: false,
  error: null,
};

@Injectable()
export class WardStore {
  private readonly state$ = new BehaviorSubject<WardManagementState>(INITIAL_STATE);

  public readonly wards$: Observable<Ward[]> = this.state$.pipe(map((state) => state.wards));
  public readonly isLoading$: Observable<boolean> = this.state$.pipe(
    map((state) => state.isLoading),
  );
  public readonly error$: Observable<string | null> = this.state$.pipe(map((state) => state.error));


  private setState(partial: Partial<WardManagementState>): void {
    this.state$.next({ ...this.state$.value, ...partial });
  }

  public setWards(wards: Ward[]): void {
    this.setState({ wards });
  }

  public addWard(ward: Ward): void {
    const current = this.state$.value;
    this.setState({
      wards: [...current.wards, ward],
      isLoading: false, error: null
    });
  }

  public replaceWard(ward: Ward): void {
    const current = this.state$.value;
    this.setState({
      wards: current.wards.map((currentWard) => (currentWard.id === ward.id ? ward : currentWard)),
      isLoading: false,
      error: null,
    });
  }

  public removeWard(wardId: number): void {
    const current = this.state$.value;
    this.setState({
      wards: current.wards.filter((ward) => ward.id !== wardId),
      isLoading: false,
      error: null,
    });
  }

  public patchPlant(plantId: number, patch: Partial<Plant>): void {
    const current = this.state$.value;
    const wards = current.wards.map((ward) => ({
      ...ward,
      apartments: ward.apartments.map((apartment) =>
        apartment.id === plantId ? { ...apartment, ...patch } : apartment,
      ),
    }));

    this.setState({
      wards,
      isLoading: false,
      error: null
    });
  }

  public setLoading(value: boolean): void {
    this.setState({ isLoading: value });
  }

  public setError(message: string | null): void {
    this.setState({ error: message, isLoading: false });
  }


}
