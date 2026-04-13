import { describe, expect, it } from 'vitest';
import { AlarmPriority } from 'src/app/core/alarm/models/alarm-priority.enum';
import {
    extractPriorityFromNotificationTitle,
    stripPriorityFromNotificationTitle,
} from 'src/app/core/notification/utils/notification-priority-display.util';

describe('notification-priority-display util integration', () => {
    it('estrae la priorita dai simboli notifica supportati', () => {
        expect(extractPriorityFromNotificationTitle('i Messaggio informativo')).toBe(AlarmPriority.WHITE);
        expect(extractPriorityFromNotificationTitle('• Messaggio positivo')).toBe(AlarmPriority.GREEN);
        expect(extractPriorityFromNotificationTitle('! Messaggio di attenzione')).toBe(AlarmPriority.ORANGE);
        expect(extractPriorityFromNotificationTitle('▲ Messaggio critico')).toBe(AlarmPriority.RED);
    });

    it('restituisce null per titoli non riconosciuti o non stringa', () => {
        expect(extractPriorityFromNotificationTitle('Messaggio senza prefisso')).toBeNull();
        expect(extractPriorityFromNotificationTitle('')).toBeNull();
        expect(extractPriorityFromNotificationTitle(null)).toBeNull();
        expect(extractPriorityFromNotificationTitle(42)).toBeNull();
    });

    it('rimuove il prefisso priorita e normalizza gli spazi', () => {
        expect(stripPriorityFromNotificationTitle('  ▲   Allarme   molto   grave  ')).toBe('Allarme molto grave');
        expect(stripPriorityFromNotificationTitle('i Messaggio informativo')).toBe('Messaggio informativo');
    });

    it('restituisce stringa vuota per valori non stringa', () => {
        expect(stripPriorityFromNotificationTitle(undefined)).toBe('');
        expect(stripPriorityFromNotificationTitle({})).toBe('');
    });
});
