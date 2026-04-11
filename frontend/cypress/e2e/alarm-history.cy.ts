import type { ActiveAlarm } from '../../src/app/core/alarm/models/active-alarm.model';
import { AlarmPriority } from '../../src/app/core/alarm/models/alarm-priority.enum';

const alarmHistoryUsername = 'admin.user';
const alarmHistoryPassword = ['A', 'd', 'm', 'i', 'n', 'A', 'c', 'c', 'e', 's', 's', '1', '2', '3'].join('');
const alarmHistoryLinkedEmail = 'admin@example.com';

const createAlarmHistoryAccessToken = (): string => {
    const claims = {
        userId: '1',
        username: alarmHistoryUsername,
        role: 'AMMINISTRATORE' as const,
        isFirstAccess: false,
    };

    const encodedPayload = btoa(JSON.stringify(claims))
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replaceAll('=', '');

    return `header.${encodedPayload}.signature`;
};

describe('Alarm history e2e', () => {
    let resolvedAlarmsState: ActiveAlarm[];

    beforeEach(() => {
        const now = Date.now();

        resolvedAlarmsState = [
            {
                id: 'rh-1',
                alarmRuleId: 'rule-1',
                deviceId: 'dev-1',
                alarmName: 'Caduta reparto nord',
                priority: AlarmPriority.RED,
                activationTime: new Date(now - 90 * 60 * 1000).toISOString(),
                resolutionTime: new Date(now - 65 * 60 * 1000).toISOString(),
                position: 'Reparto nord',
                userId: 8,
                userUsername: 'oss.nord',
            },
            {
                id: 'rh-2',
                alarmRuleId: 'rule-2',
                deviceId: 'dev-2',
                alarmName: 'Saturazione bassa stanza 5',
                priority: AlarmPriority.ORANGE,
                activationTime: new Date(now - 45 * 60 * 1000).toISOString(),
                resolutionTime: new Date(now - 20 * 60 * 1000).toISOString(),
                position: 'Stanza 5',
                userId: 9,
                userUsername: 'oss.turnoA',
            },
            {
                id: 'rh-3',
                alarmRuleId: 'rule-3',
                deviceId: 'dev-3',
                alarmName: 'Porta emergenza aperta',
                priority: AlarmPriority.GREEN,
                activationTime: new Date(now - 40 * 60 * 1000).toISOString(),
                resolutionTime: new Date(now - 25 * 60 * 1000).toISOString(),
                position: 'Piano 1',
                userId: 10,
                userUsername: 'oss.turnoB',
            },
            {
                id: 'rh-4',
                alarmRuleId: 'rule-4',
                deviceId: 'dev-4',
                alarmName: 'Pulsante bagno premuto',
                priority: AlarmPriority.RED,
                activationTime: new Date(now - 150 * 60 * 1000).toISOString(),
                resolutionTime: new Date(now - 120 * 60 * 1000).toISOString(),
                position: 'Stanza 12',
                userId: 11,
                userUsername: 'oss.notte',
            },
            {
                id: 'rh-5',
                alarmRuleId: 'rule-5',
                deviceId: 'dev-5',
                alarmName: 'Sensore presenza guasto',
                priority: AlarmPriority.WHITE,
                activationTime: new Date(now - 200 * 60 * 1000).toISOString(),
                resolutionTime: new Date(now - 180 * 60 * 1000).toISOString(),
                position: 'Corridoio est',
                userId: 12,
                userUsername: 'oss.tecnico',
            },
            {
                id: 'rh-6',
                alarmRuleId: 'rule-6',
                deviceId: 'dev-6',
                alarmName: 'Luce emergenza non raggiungibile',
                priority: AlarmPriority.ORANGE,
                activationTime: new Date(now - 210 * 60 * 1000).toISOString(),
                resolutionTime: new Date(now - 185 * 60 * 1000).toISOString(),
                position: 'Scala antincendio',
                userId: 13,
                userUsername: 'oss.turnoC',
            },
            {
                id: 'rh-7',
                alarmRuleId: 'rule-7',
                deviceId: 'dev-7',
                alarmName: 'Allarme tecnico locale termico',
                priority: AlarmPriority.GREEN,
                activationTime: new Date(now - 260 * 60 * 1000).toISOString(),
                resolutionTime: new Date(now - 240 * 60 * 1000).toISOString(),
                position: 'Locale termico',
                userId: 14,
                userUsername: 'oss.tecnico2',
            },
            {
                id: 'rh-8',
                alarmRuleId: 'rule-8',
                deviceId: 'dev-8',
                alarmName: 'Assenza segnale sensore letto',
                priority: AlarmPriority.WHITE,
                activationTime: new Date(now - 300 * 60 * 1000).toISOString(),
                resolutionTime: new Date(now - 280 * 60 * 1000).toISOString(),
                position: 'Stanza 22',
                userId: 15,
                userUsername: 'oss.turnoD',
            },
        ];

        cy.viewport(1440, 1000);

        cy.intercept('POST', '**/auth/login', {
            statusCode: 200,
            body: {
                accessToken: createAlarmHistoryAccessToken(),
            },
        }).as('login');

        cy.intercept('GET', '**/my-vimar/account', {
            statusCode: 200,
            body: {
                email: alarmHistoryLinkedEmail,
                isLinked: true,
            },
        });

        cy.intercept('GET', '**/api/vimar-account', {
            statusCode: 200,
            body: {
                email: alarmHistoryLinkedEmail,
                isLinked: true,
            },
        });

        cy.intercept('GET', '**/alarm-events/unmanaged/*/*/*', {
            statusCode: 200,
            body: [],
        }).as('getUnmanagedForLayout');

        cy.intercept('GET', '**/alarm-events/managed/*/*/*', (req) => {
            const chunks = req.url.split('/');
            const limit = Number(chunks[chunks.length - 2]);
            const offset = Number(chunks[chunks.length - 1]);

            req.reply({
                statusCode: 200,
                body: resolvedAlarmsState.slice(offset, offset + limit),
            });
        }).as('getResolvedHistory');

        cy.visit('/auth/login?returnUrl=%2Falarms%2Falarm-history');
        cy.get('#username').type(alarmHistoryUsername);
        cy.get('#password').type(alarmHistoryPassword);
        cy.get('button[type="submit"]').click();

        cy.wait('@login');
        cy.location('pathname').should('eq', '/alarms/alarm-history');
        cy.contains('h1', 'Storico allarmi').should('be.visible');
        cy.wait('@getResolvedHistory');
    });

    it('renders resolved alarms with operator and status columns', () => {
        cy.get('[data-testid^="alarm-row-"]').should('have.length', 6);
        cy.get('[data-testid="alarm-row-rh-2"]').within(() => {
            cy.contains('Saturazione bassa stanza 5').should('exist');
            cy.contains('Stanza 5').should('exist');
            cy.contains('Gestito').should('exist');
            cy.contains('oss.turnoA').should('exist');
        });
    });

    it('sorts rows by resolution date descending in current page', () => {
        cy.get('[data-testid^="alarm-row-"]').first()
            .should('have.attr', 'data-testid', 'alarm-row-rh-2');
    });

    it('supports navigation between history pages', () => {
        cy.contains('button', 'Successiva').should('not.be.disabled').click();
        cy.wait('@getResolvedHistory');

        cy.contains('span', 'Pagina 2').should('be.visible');
        cy.get('[data-testid="alarm-row-rh-7"]').should('exist');
        cy.get('[data-testid="alarm-row-rh-8"]').should('exist');

        cy.contains('button', 'Precedente').click();
        cy.wait('@getResolvedHistory');
        cy.contains('span', 'Pagina 1').should('be.visible');
    });

    it('shows empty state when there is no history data', () => {
        resolvedAlarmsState = [];

        cy.get('a.sidebar-link').contains('Gestione Allarmi').click({ force: true });
        cy.location('pathname').should('eq', '/alarms/alarm-management');
        cy.wait('@getUnmanagedForLayout');

        cy.get('a.sidebar-link').contains('Storico Allarmi').click({ force: true });
        cy.location('pathname').should('eq', '/alarms/alarm-history');
        cy.wait('@getResolvedHistory');

        cy.contains('Nessun storico allarme disponibile al momento.').should('be.visible');
        cy.contains('button', 'Successiva').should('not.exist');
        cy.contains('button', 'Precedente').should('not.exist');
    });
});
