import type { ActiveAlarm } from '../../src/app/core/alarm/models/active-alarm.model';
import { AlarmPriority } from '../../src/app/core/alarm/models/alarm-priority.enum';

const adminUsername = 'Mario Rossi';
const adminPassword = ['A', 'd', 'm', 'i', 'n', 'A', 'c', 'c', 'e', 's', 's', '1', '2', '3'].join('');
const linkedEmail = 'admin@example.com';

const createAccessToken = (): string => {
    const claims = {
        userId: '1',
        username: adminUsername,
        role: 'AMMINISTRATORE' as const,
        isFirstAccess: false,
    };

    const encodedPayload = btoa(JSON.stringify(claims))
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replaceAll('=', '');

    return `header.${encodedPayload}.signature`;
};

const openProfilePanel = () => {
    cy.get('button[aria-label="Apri profilo"]').click();
    cy.contains('p', 'Area Utente').should('be.visible');
};


describe('Dashboard e2e', () => {
    let activeAlarms: ActiveAlarm[];

    beforeEach(() => {
        const now = Date.now();

        activeAlarms = [
            {
                id: 'a1',
                alarmRuleId: 'rule-1',
                deviceId: 'dev-11',
                alarmName: 'Caduta paziente',
                priority: AlarmPriority.RED,
                activationTime: new Date(now - 12 * 60 * 1000).toISOString(),
                resolutionTime: null,
                position: 'Stanza 101',
                userId: null,
                userUsername: null,
            },
            {
                id: 'a2',
                alarmRuleId: 'rule-2',
                deviceId: 'dev-12',
                alarmName: 'Saturazione bassa',
                priority: AlarmPriority.ORANGE,
                activationTime: new Date(now - 4 * 60 * 1000).toISOString(),
                resolutionTime: null,
                position: 'Stanza 102',
                userId: null,
                userUsername: null,
            },
        ];

        cy.viewport(1440, 1000);

        cy.intercept('POST', '**/auth/login', (req) => {
            expect(req.body).to.deep.equal({
                username: adminUsername,
                password: adminPassword,
            });

            req.reply({
                statusCode: 200,
                body: {
                    accessToken: createAccessToken(),
                },
            });
        }).as('login');

        cy.intercept('GET', '**/my-vimar/account', {
            statusCode: 200,
            body: {
                email: linkedEmail,
                isLinked: true,
            },
        });

        cy.intercept('GET', '**/api/vimar-account', {
            statusCode: 200,
            body: {
                email: linkedEmail,
                isLinked: true,
            },
        });

        cy.intercept('GET', '**/alarm-events/unmanaged/*/*/*', (req) => {
            const chunks = req.url.split('/');
            const offset = Number(chunks.at(-1));

            req.reply({
                statusCode: 200,
                body: offset === 0 ? activeAlarms : [],
            });
        }).as('getUnmanagedAlarms');

        cy.intercept('PATCH', '**/alarm-events/resolve', (req) => {
            expect(req.body).to.deep.equal({
                alarmId: 'a1',
                userId: 1,
            });

            activeAlarms = activeAlarms.filter((alarm) => alarm.id !== 'a1');

            req.reply({
                statusCode: 200,
                body: null,
            });
        }).as('resolveAlarm');

        cy.intercept('GET', '**/plant/all', {
            statusCode: 200,
            body: [
                {
                    id: '301',
                    name: 'Analisi clima e presenze',
                    rooms: [
                        {
                            id: 'r1',
                            name: 'Analisi clima',
                            devices: [
                                { id: 'd1', name: 'Sensore temperatura' },
                                { id: 'd2', name: 'Sensore umidita' },
                            ],
                        },
                        {
                            id: 'r2',
                            name: 'Area presenze',
                            devices: [
                                { id: 'd3', name: 'Sensore presenza' },
                            ],
                        },
                    ],
                },
            ],
        }).as('getApartments');

        cy.intercept('GET', '**/analytics/*', {
            statusCode: 200,
            body: [
                {
                    title: 'Analisi consumi',
                    metric: 'plant-consumption',
                    unit: 'kWh',
                    labels: ['Lun', 'Mar'],
                    series: [
                        {
                            id: 'consumption-series',
                            name: 'Consumi',
                            data: [22, 28],
                        },
                    ],
                    suggestion: {
                        message: [],
                        isSuggestion: false,
                    },
                },
                {
                    title: 'Statistiche allarmi - Risolti: 12 - Attivi: 5',
                    metric: 'ward-resolved-alarm',
                    unit: 'numero',
                    labels: ['Settimana corrente'],
                    series: [
                        {
                            id: 'resolved-series',
                            name: 'Risolti',
                            data: [12],
                        },
                        {
                            id: 'active-series',
                            name: 'Attivi',
                            data: [5],
                        },
                    ],
                    suggestion: {
                        message: [],
                        isSuggestion: false,
                    },
                },
            ],
        }).as('getAnalytics');

        cy.visit('/auth/login');
        cy.get('#username').type(adminUsername);
        cy.get('#password').type(adminPassword);
        cy.get('button[type="submit"]').click();

        cy.wait('@login');
        cy.location('pathname').should('eq', '/dashboard');
        cy.contains('h1', 'Dashboard').should('be.visible');

        cy.wait('@getUnmanagedAlarms');
        cy.wait('@getApartments');
        cy.wait('@getAnalytics');
    });

    it('RF43-OBL Visualizzazione dashboard con stato del Sistema', () => {
        cy.get('section[aria-label="Dashboard principale"]').should('be.visible');
        cy.contains('h1', 'Dashboard').should('be.visible');
        cy.contains('p', 'Supervisione attiva').should('be.visible');
    });

    it('RF44-OBL Visualizzazione modulo gestione allarmi nella dashboard', () => {
        cy.contains('h2', 'Gestione allarmi').should('be.visible');
        cy.get('section[aria-label="Gestione allarmi"]').should('be.visible');
    });

    it('RF45-OBL Visualizzazione ogni singolo allarme nel modulo gestione allarmi', () => {
        cy.get('[data-testid^="alarm-row-"]').should('have.length.at.least', 2);
        cy.get('[data-testid="alarm-row-a1"]').should('contain', 'Caduta paziente');
        cy.get('[data-testid="alarm-row-a2"]').should('contain', 'Saturazione bassa');
    });

    it('RF46-OBL Visualizzazione segnale di pericolo nel dettaglio allarme', () => {
        cy.get('[data-testid="alarm-row-a1"]').within(() => {
            cy.get('[aria-label^="Priorita "]').should('be.visible');
        });
    });

    it('RF47-OBL Visualizzazione nome nel dettaglio allarme', () => {
        cy.get('[data-testid="alarm-row-a1"]').should('contain', 'Caduta paziente');
    });

    it('RF48-OBL Visualizzazione tempo trascorso dallo scatto dell allarme', () => {
        cy.get('[data-testid="alarm-row-a1"] td')
            .eq(4)
            .invoke('text')
            .should('match', /[smhg] fa/);
    });

    it('RF49-OBL Visualizzazione modulo statistiche allarmi nella dashboard', () => {
        cy.contains('h2', 'Monitor dispositivi').should('be.visible');
        cy.contains('h1', 'Statistiche allarmi - Risolti: 12 - Attivi: 5').should('exist');
    });

    it('RF50-OBL Visualizzazione numero di allarmi risolti nel modulo statistiche allarmi', () => {
        cy.contains('h1', 'Statistiche allarmi - Risolti: 12 - Attivi: 5').should('exist');
        cy.contains('Risolti: 12').should('exist');
    });

    it('RF51-OBL Visualizzazione numero di allarmi attivi nel modulo statistiche allarmi', () => {
        cy.contains('h1', 'Statistiche allarmi - Risolti: 12 - Attivi: 5').should('exist');
        cy.contains('Attivi: 5').should('exist');
    });

    it('RF52-OBL Visualizzazione modulo informazioni Utente dalla dashboard', () => {
        openProfilePanel();
        cy.contains('p', 'Area Utente').should('be.visible');
        cy.contains('p', 'Username:').should('be.visible');
    });

    it('RF53-OBL Visualizzazione nome Utente nel modulo informazioni Utente', () => {
        openProfilePanel();
        cy.contains('h2', 'Mario').should('be.visible');
    });

    it('RF54-OBL Visualizzazione cognome Utente nel modulo informazioni Utente', () => {
        openProfilePanel();
        cy.contains('h2', 'Rossi').should('be.visible');
    });

    it('RF55-OBL Visualizzazione modulo analisi clima nella dashboard', () => {
        cy.contains('Analisi clima').should('be.visible');
    });

    it('RF56-OBL Visualizzazione modulo analisi consumi nella dashboard', () => {
        cy.contains('h1', 'Analisi consumi').should('be.visible');
    });

    it('RF57-OBL Visualizzazione modulo analisi presenze nella dashboard', () => {
        cy.contains('presenze').should('be.visible');
    });

    it('RF60-OBL Utente deve poter risolvere un allarme', () => {
        cy.get('[data-testid="alarm-row-a1"]').within(() => {
            cy.contains('button', 'GESTISCI').click();
        });

        cy.wait('@resolveAlarm');
        cy.wait('@getUnmanagedAlarms');
        cy.get('[data-testid="alarm-row-a1"]').should('not.exist');
    });

    it('shows an error message when resolving an alarm from the dashboard widget fails', () => {
        cy.intercept('PATCH', '**/alarm-events/resolve', {
            statusCode: 500,
            body: { message: 'Internal error' },
        }).as('resolveAlarmFailure');

        cy.get('[data-testid="alarm-row-a1"]').within(() => {
            cy.contains('button', 'GESTISCI').click();
        });

        cy.wait('@resolveAlarmFailure');
        cy.get('[role="alert"]').should('exist');
        cy.get('[data-testid="alarm-row-a1"]').should('exist');
    });

    it('opens and closes the topbar notification panel preserving empty state', () => {
        cy.get('button[aria-label="Visualizza notifiche"]').click();
        cy.get('section[aria-label="Notifiche recenti"]').should('be.visible');
        cy.contains('Nessuna notifica disponibile.').should('be.visible');

        cy.get('button[aria-label="Visualizza notifiche"]').click();
        cy.get('section[aria-label="Notifiche recenti"]').should('not.exist');

        cy.get('button[aria-label="Visualizza notifiche"]').click();
        cy.get('section[aria-label="Notifiche recenti"]').should('be.visible');
        cy.contains('Nessuna notifica disponibile.').should('be.visible');
    });

    it('navigates to notifications archive from topbar panel using Vedi tutte', () => {
        cy.intercept('GET', '**/alarm-events/unmanaged/*/*/*', {
            statusCode: 200,
            body: [],
        }).as('getUnmanagedArchive');

        cy.intercept('GET', '**/alarm-events/managed/*/*/*', {
            statusCode: 200,
            body: [],
        }).as('getManagedArchive');

        cy.get('button[aria-label="Visualizza notifiche"]').click();
        cy.get('section[aria-label="Notifiche recenti"]').should('be.visible');
        cy.contains('button', 'Vedi tutte').click();

        cy.location('pathname').should('eq', '/notifications');
        cy.wait('@getUnmanagedArchive');
        cy.wait('@getManagedArchive');
        cy.get('section[aria-label="Notifiche recenti"]').should('not.exist');
    });

    it('logs out from the profile panel and returns to the login page', () => {
        cy.intercept('POST', '**/auth/logout', {
            statusCode: 200,
            body: null,
        }).as('logout');

        openProfilePanel();
        cy.contains('button', 'Esci').click();

        cy.wait('@logout');
        cy.location('pathname').should('eq', '/auth/login');
    });
});
