import type { ActiveAlarm } from '../../src/app/core/alarm/models/active-alarm.model';
import { AlarmPriority } from '../../src/app/core/alarm/models/alarm-priority.enum';

const alarmManagementUsername = 'admin.user';
const alarmManagementPassword = ['A', 'd', 'm', 'i', 'n', 'A', 'c', 'c', 'e', 's', 's', '1', '2', '3'].join('');
const alarmManagementLinkedEmail = 'admin@example.com';

const createAlarmManagementAccessToken = (): string => {
    const claims = {
        userId: '1',
        username: alarmManagementUsername,
        role: 'AMMINISTRATORE' as const,
        isFirstAccess: false,
    };

    const encodedPayload = btoa(JSON.stringify(claims))
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replaceAll('=', '');

    return `header.${encodedPayload}.signature`;
};

describe('Alarm management e2e', () => {
    let activeAlarmsState: ActiveAlarm[];

    beforeEach(() => {
        const now = Date.now();

        activeAlarmsState = [
            {
                id: 'am-1',
                alarmRuleId: 'rule-1',
                deviceId: 'dev-1',
                alarmName: 'Caduta in bagno',
                priority: AlarmPriority.RED,
                activationTime: new Date(now - 12 * 60 * 1000).toISOString(),
                resolutionTime: null,
                position: 'Stanza 101',
                userId: null,
                userUsername: null,
            },
            {
                id: 'am-2',
                alarmRuleId: 'rule-2',
                deviceId: 'dev-2',
                alarmName: 'Saturazione bassa',
                priority: AlarmPriority.ORANGE,
                activationTime: new Date(now - 6 * 60 * 1000).toISOString(),
                resolutionTime: null,
                position: 'Stanza 102',
                userId: null,
                userUsername: null,
            },
            {
                id: 'am-3',
                alarmRuleId: 'rule-3',
                deviceId: 'dev-3',
                alarmName: 'Porta aperta',
                priority: AlarmPriority.GREEN,
                activationTime: new Date(now - 3 * 60 * 1000).toISOString(),
                resolutionTime: null,
                position: 'Ingresso',
                userId: null,
                userUsername: null,
            },
            {
                id: 'am-4',
                alarmRuleId: 'rule-4',
                deviceId: 'dev-4',
                alarmName: 'Batteria sensore scarica',
                priority: AlarmPriority.WHITE,
                activationTime: new Date(now - 20 * 60 * 1000).toISOString(),
                resolutionTime: null,
                position: 'Corridoio',
                userId: null,
                userUsername: null,
            },
            {
                id: 'am-5',
                alarmRuleId: 'rule-5',
                deviceId: 'dev-5',
                alarmName: 'Sensore movimento inattivo',
                priority: AlarmPriority.GREEN,
                activationTime: new Date(now - 25 * 60 * 1000).toISOString(),
                resolutionTime: null,
                position: 'Stanza 201',
                userId: null,
                userUsername: null,
            },
            {
                id: 'am-6',
                alarmRuleId: 'rule-6',
                deviceId: 'dev-6',
                alarmName: 'Luce emergenza guasta',
                priority: AlarmPriority.ORANGE,
                activationTime: new Date(now - 28 * 60 * 1000).toISOString(),
                resolutionTime: null,
                position: 'Scala est',
                userId: null,
                userUsername: null,
            },
            {
                id: 'am-7',
                alarmRuleId: 'rule-7',
                deviceId: 'dev-7',
                alarmName: 'Allarme tecnico locale caldaia',
                priority: AlarmPriority.RED,
                activationTime: new Date(now - 31 * 60 * 1000).toISOString(),
                resolutionTime: null,
                position: 'Locale tecnico',
                userId: null,
                userUsername: null,
            },
        ];

        cy.viewport(1440, 1000);

        cy.intercept('POST', '**/auth/login', {
            statusCode: 200,
            body: {
                accessToken: createAlarmManagementAccessToken(),
            },
        }).as('login');

        cy.intercept('GET', '**/my-vimar/account', {
            statusCode: 200,
            body: {
                email: alarmManagementLinkedEmail,
                isLinked: true,
            },
        });

        cy.intercept('GET', '**/api/vimar-account', {
            statusCode: 200,
            body: {
                email: alarmManagementLinkedEmail,
                isLinked: true,
            },
        });

        cy.intercept('GET', '**/alarm-events/unmanaged/*/*/*', (req) => {
            const chunks = req.url.split('/');
            const limit = Number(chunks[chunks.length - 2]);
            const offset = Number(chunks[chunks.length - 1]);

            const paged = activeAlarmsState.slice(offset, offset + limit);

            req.reply({
                statusCode: 200,
                body: paged,
            });
        }).as('getActiveAlarms');

        cy.intercept('PATCH', '**/alarm-events/resolve', (req) => {
            const payload = req.body as { alarmId: string; userId: number };

            expect(payload.userId).to.equal(1);
            activeAlarmsState = activeAlarmsState.filter((alarm) => alarm.id !== payload.alarmId);

            req.reply({
                statusCode: 200,
                body: null,
            });
        }).as('resolveAlarm');

        cy.visit('/auth/login?returnUrl=%2Falarms%2Falarm-management');
        cy.get('#username').type(alarmManagementUsername);
        cy.get('#password').type(alarmManagementPassword);
        cy.get('button[type="submit"]').click();

        cy.wait('@login');
        cy.location('pathname').should('eq', '/alarms/alarm-management');
        cy.contains('h1', 'Gestione allarmi attivi').should('be.visible');

        cy.wait('@getActiveAlarms');
        cy.wait('@getActiveAlarms');
    });

    it('renders active alarms table with status and action buttons', () => {
        cy.get('[data-testid^="alarm-row-"]').should('have.length', 6);
        cy.get('[data-testid="alarm-row-am-1"]').within(() => {
            cy.contains('Caduta in bagno').should('exist');
            cy.contains('Stanza 101').should('exist');
            cy.contains('Da gestire').should('exist');
            cy.contains('button', 'GESTISCI').should('exist');
        });
    });

    it('resolves an alarm and refreshes the active list', () => {
        cy.get('[data-testid="alarm-row-am-1"]').within(() => {
            cy.contains('button', 'GESTISCI').click();
        });

        cy.wait('@resolveAlarm').its('request.body').should('deep.equal', {
            alarmId: 'am-1',
            userId: 1,
        });

        cy.wait('@getActiveAlarms');
        cy.wait('@getActiveAlarms');

        cy.get('[data-testid="alarm-row-am-1"]').should('not.exist');
        cy.get('[data-testid="alarm-row-am-2"]').should('exist');
    });

    it('supports pagination between first and second page', () => {
        cy.contains('button', 'Successiva').should('not.be.disabled').click();

        cy.wait('@getActiveAlarms');
        cy.wait('@getActiveAlarms');

        cy.contains('span', 'Pagina 2').should('be.visible');
        cy.get('[data-testid="alarm-row-am-7"]').should('exist');
        cy.contains('button', 'Precedente').should('not.be.disabled').click();

        cy.wait('@getActiveAlarms');
        cy.wait('@getActiveAlarms');
        cy.contains('span', 'Pagina 1').should('be.visible');
        cy.get('[data-testid="alarm-row-am-1"]').should('exist');
    });

    it('shows an error message when resolve API fails', () => {
        cy.intercept('PATCH', '**/alarm-events/resolve', {
            statusCode: 500,
            body: { message: 'Server error' },
        }).as('resolveAlarmFailure');

        cy.get('[data-testid="alarm-row-am-2"]').within(() => {
            cy.contains('button', 'GESTISCI').click();
        });

        cy.wait('@resolveAlarmFailure');
        cy.contains(/risoluzione dell'allarme/i).should('be.visible');
        cy.get('[data-testid="alarm-row-am-2"]').should('exist');
    });

    it('renders managed alarms as non actionable rows', () => {
        activeAlarmsState = activeAlarmsState.map((alarm) =>
            alarm.id === 'am-1'
                ? {
                    ...alarm,
                    resolutionTime: new Date().toISOString(),
                }
                : alarm,
        );

        cy.visit('/auth/login?returnUrl=%2Falarms%2Falarm-management');
        cy.get('#username').type(alarmManagementUsername);
        cy.get('#password').type(alarmManagementPassword);
        cy.get('button[type="submit"]').click();

        cy.wait('@login');
        cy.wait('@getActiveAlarms');
        cy.wait('@getActiveAlarms');

        cy.get('[data-testid="alarm-row-am-1"]').within(() => {
            cy.contains('Non da gestire').should('exist');
            cy.contains('button', 'GESTITO').should('be.disabled');
        });
    });

    it('returns to first page after resolving the only alarm on page two', () => {
        cy.contains('button', 'Successiva').click();
        cy.wait('@getActiveAlarms');
        cy.wait('@getActiveAlarms');

        cy.contains('span', 'Pagina 2').should('be.visible');
        cy.get('[data-testid="alarm-row-am-7"]').within(() => {
            cy.contains('button', 'GESTISCI').click();
        });

        cy.wait('@resolveAlarm');
        cy.wait('@getActiveAlarms');
        cy.wait('@getActiveAlarms');
        cy.wait('@getActiveAlarms');

        cy.contains('span', 'Pagina 1').should('be.visible');
        cy.get('[data-testid="alarm-row-am-7"]').should('not.exist');
        cy.get('[data-testid="alarm-row-am-1"]').should('exist');
    });

    it('shows empty state when there are no active alarms', () => {
        activeAlarmsState = [];

        cy.visit('/auth/login?returnUrl=%2Falarms%2Falarm-management');
        cy.get('#username').type(alarmManagementUsername);
        cy.get('#password').type(alarmManagementPassword);
        cy.get('button[type="submit"]').click();

        cy.wait('@login');
        cy.wait('@getActiveAlarms');
        cy.wait('@getActiveAlarms');

        cy.contains('Nessun allarme attivo al momento.').should('be.visible');
        cy.contains('button', 'Successiva').should('not.exist');
        cy.contains('button', 'Precedente').should('not.exist');
    });
});
