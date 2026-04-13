import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ApiErrorDisplayService } from 'src/app/core/services/api-error-display.service';

describe('ApiErrorDisplayService', () => {
    let service: ApiErrorDisplayService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ApiErrorDisplayService],
        });

        service = TestBed.inject(ApiErrorDisplayService);
    });

    it('usa fallback per errori non HTTP quando nonHttpStrategy non e message', () => {
        const message = service.toMessage(new Error('runtime failure'), {
            fallbackMessage: 'Messaggio fallback',
        });

        expect(message).toBe('Messaggio fallback');
    });

    it('usa il messaggio degli errori non HTTP quando nonHttpStrategy e message', () => {
        const message = service.toMessage(new Error('runtime failure'), {
            fallbackMessage: 'Messaggio fallback',
            nonHttpStrategy: 'message',
        });

        expect(message).toBe('runtime failure');
    });

    it('mappa status 0 con actionLabel', () => {
        const error = new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' });

        const message = service.toMessage(error, {
            fallbackMessage: 'Messaggio fallback',
            actionLabel: 'caricare gli allarmi',
        });

        expect(message).toBe('Impossibile contattare il server durante caricare gli allarmi.');
    });

    it('mappa status 0 senza actionLabel', () => {
        const error = new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' });

        const message = service.toMessage(error, {
            fallbackMessage: 'Messaggio fallback',
        });

        expect(message).toBe('Impossibile contattare il server. Verifica la connessione e riprova.');
    });

    it('mappa status 401 con actionLabel', () => {
        const error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });

        const message = service.toMessage(error, {
            fallbackMessage: 'Messaggio fallback',
            actionLabel: 'aggiornare la vista',
        });

        expect(message).toBe('Sessione scaduta o non valida. Effettua nuovamente il login per aggiornare la vista.');
    });

    it('mappa status 401 senza actionLabel', () => {
        const error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });

        const message = service.toMessage(error, {
            fallbackMessage: 'Messaggio fallback',
        });

        expect(message).toBe('Sessione scaduta o non valida. Effettua nuovamente il login.');
    });

    it('mappa status 403 con forbiddenMessage custom se presente', () => {
        const error = new HttpErrorResponse({ status: 403, statusText: 'Forbidden' });

        const message = service.toMessage(error, {
            fallbackMessage: 'Messaggio fallback',
            forbiddenMessage: 'Accesso negato dalla policy applicativa.',
            actionLabel: 'eseguire l operazione',
        });

        expect(message).toBe('Accesso negato dalla policy applicativa.');
    });

    it('mappa status 403 usando actionLabel quando forbiddenMessage non e presente', () => {
        const error = new HttpErrorResponse({ status: 403, statusText: 'Forbidden' });

        const message = service.toMessage(error, {
            fallbackMessage: 'Messaggio fallback',
            actionLabel: 'eseguire l operazione',
        });

        expect(message).toBe('Non hai i permessi necessari per eseguire l operazione.');
    });

    it('mappa status 403 senza actionLabel', () => {
        const error = new HttpErrorResponse({ status: 403, statusText: 'Forbidden' });

        const message = service.toMessage(error, {
            fallbackMessage: 'Messaggio fallback',
        });

        expect(message).toBe('Non hai i permessi necessari per questa operazione.');
    });

    it('mappa status 500 con actionLabel', () => {
        const error = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });

        const message = service.toMessage(error, {
            fallbackMessage: 'Messaggio fallback',
            actionLabel: 'completare la richiesta',
        });

        expect(message).toBe('Errore interno del server durante completare la richiesta. Riprova tra poco.');
    });

    it('mappa status 500 senza actionLabel', () => {
        const error = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });

        const message = service.toMessage(error, {
            fallbackMessage: 'Messaggio fallback',
        });

        expect(message).toBe('Errore interno del server. Riprova tra qualche istante.');
    });

    it('usa error.error string quando disponibile per status non speciali', () => {
        const error = new HttpErrorResponse({
            status: 400,
            statusText: 'Bad Request',
            error: 'Payload non valido',
        });

        const message = service.toMessage(error, {
            fallbackMessage: 'Messaggio fallback',
        });

        expect(message).toBe('Payload non valido');
    });

    it('usa error.error.message array quando disponibile per status non speciali', () => {
        const error = new HttpErrorResponse({
            status: 422,
            statusText: 'Unprocessable Entity',
            error: { message: ['campo obbligatorio', 'formato non valido'] },
        });

        const message = service.toMessage(error, {
            fallbackMessage: 'Messaggio fallback',
        });

        expect(message).toBe('campo obbligatorio; formato non valido');
    });

    it('usa fallback quando payload HTTP non contiene messaggi utili', () => {
        const error = new HttpErrorResponse({
            status: 409,
            statusText: 'Conflict',
            error: { reason: 'conflict' },
        });

        const message = service.toMessage(error, {
            fallbackMessage: 'Messaggio fallback',
        });

        expect(message).toBe('Messaggio fallback');
    });

    it('usa error.message di oggetti plain quando nonHttpStrategy e message', () => {
        const message = service.toMessage({ message: 'errore applicativo' }, {
            fallbackMessage: 'Messaggio fallback',
            nonHttpStrategy: 'message',
        });

        expect(message).toBe('errore applicativo');
    });
});
