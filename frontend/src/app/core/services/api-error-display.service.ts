import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface ApiErrorDisplayOptions {
    fallbackMessage: string;
    actionLabel?: string;
    forbiddenMessage?: string;
    nonHttpStrategy?: 'fallback' | 'message';
}

@Injectable({ providedIn: 'root' })
export class ApiErrorDisplayService {
    public toMessage(error: unknown, options: ApiErrorDisplayOptions): string {
        if (error instanceof HttpErrorResponse) {
            return this.mapHttpError(error, options);
        }

        if (options.nonHttpStrategy !== 'message') {
            return options.fallbackMessage;
        }

        return this.extractUnknownMessage(error) ?? options.fallbackMessage;
    }

    private mapHttpError(error: HttpErrorResponse, options: ApiErrorDisplayOptions): string {
        if (error.status === 0) {
            return options.actionLabel
                ? `Impossibile contattare il server durante ${options.actionLabel}.`
                : 'Impossibile contattare il server. Verifica la connessione e riprova.';
        }

        if (error.status === 401) {
            return options.actionLabel
                ? `Sessione scaduta o non valida. Effettua nuovamente il login per ${options.actionLabel}.`
                : 'Sessione scaduta o non valida. Effettua nuovamente il login.';
        }

        if (error.status === 403) {
            if (options.forbiddenMessage) {
                return options.forbiddenMessage;
            }

            return options.actionLabel
                ? `Non hai i permessi necessari per ${options.actionLabel}.`
                : 'Non hai i permessi necessari per questa operazione.';
        }

        if (error.status >= 500) {
            return options.actionLabel
                ? `Errore interno del server durante ${options.actionLabel}. Riprova tra poco.`
                : 'Errore interno del server. Riprova tra qualche istante.';
        }

        return this.extractHttpMessage(error) ?? options.fallbackMessage;
    }

    private extractHttpMessage(error: HttpErrorResponse): string | null {
        if (typeof error.error === 'string' && error.error.trim().length > 0) {
            return error.error;
        }

        if (typeof error.error !== 'object' || error.error === null || !('message' in error.error)) {
            return null;
        }

        const message = (error.error as { message?: unknown }).message;
        if (typeof message === 'string' && message.trim().length > 0) {
            return message;
        }

        if (Array.isArray(message) && message.every((entry) => typeof entry === 'string')) {
            return message.join('; ');
        }

        return null;
    }

    private extractUnknownMessage(error: unknown): string | null {
        if (error instanceof Error && error.message.trim().length > 0) {
            return error.message;
        }

        if (
            typeof error === 'object' &&
            error !== null &&
            'message' in error &&
            typeof error.message === 'string' &&
            error.message.trim().length > 0
        ) {
            return error.message;
        }

        return null;
    }
}
