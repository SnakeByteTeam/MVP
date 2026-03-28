import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { UserRole } from '../../../core/models/user-role.enum';
import type { Ward } from '../models/ward.model';
import { WardStore } from './ward.store';

describe('WardStore', () => {
    let store: WardStore;

    const wardA: Ward = {
        id: 1,
        name: 'Cardiologia',
        apartments: [{ id: '101', name: 'App. 101' }],
        operators: [
            {
                id: 'user-1',
                firstName: 'Mario',
                lastName: 'Rossi',
                username: 'mrossi',
                role: UserRole.OPERATORE_SANITARIO,
            },
        ],
    };

    const wardB: Ward = {
        id: 2,
        name: 'Neurologia',
        apartments: [{ id: '102', name: 'App. 102' }],
        operators: [],
    };

    beforeEach(() => {
        store = new WardStore();
    });


    it('inizializza stato vuoto', async () => {
        expect(await firstValueFrom(store.wards$)).toEqual([]);
        expect(await firstValueFrom(store.isLoading$)).toBe(false);
        expect(await firstValueFrom(store.error$)).toBeNull();
    });

    it('setWards sovrascrive i wards', async () => {
        store.setWards([wardA, wardB]);

        const wards = await firstValueFrom(store.wards$);
        expect(wards).toEqual([wardA, wardB]);
        expect(wards).toHaveLength(2);
    });

    it('addWard aggiunge il reparto e resetta error/loading', async () => {
        store.setLoading(true);
        store.setError('errore');

        store.addWard(wardA);

        const wards = await firstValueFrom(store.wards$);
        expect(wards).toEqual([wardA]);
        expect(wards).toHaveLength(1);
        expect(await firstValueFrom(store.isLoading$)).toBe(false);
        expect(await firstValueFrom(store.error$)).toBeNull();
    });

    it('replaceWard aggiorna il reparto target', async () => {
        store.setWards([wardA, wardB]);

        const renamed = { ...wardB, name: 'Neuro A' };
        store.replaceWard(renamed);

        const wards = await firstValueFrom(store.wards$);
        expect(wards).toEqual([wardA, renamed]);
        expect(wards).toHaveLength(2);
    });

    it('removeWard elimina il reparto target', async () => {
        store.setWards([wardA, wardB]);

        store.removeWard(1);

        const wards = await firstValueFrom(store.wards$);
        expect(wards).toEqual([wardB]);
        expect(wards).toHaveLength(1);
    });

    it('patchPlant aggiorna solo l appartamento richiesto', async () => {
        store.setWards([wardA, wardB]);

        store.patchPlant('102', { name: 'App. 102A' });

        const wards = await firstValueFrom(store.wards$);
        expect(wards).toHaveLength(2);
        expect(wards[0].apartments[0]).toEqual(wardA.apartments[0]);
        expect(wards[1].apartments[0]).toEqual({ id: '102', name: 'App. 102A' });
    });
});
