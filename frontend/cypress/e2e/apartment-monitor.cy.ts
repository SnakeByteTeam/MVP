const apartmentUsername = 'Mario Rossi';
const apartmentPassword = ['A', 'd', 'm', 'i', 'n', 'A', 'c', 'c', 'e', 's', 's', '1', '2', '3'].join('');
const apartmentLinkedEmail = 'admin@example.com';

const createApartmentAccessToken = (): string => {
    const claims = {
        userId: '1',
        username: apartmentUsername,
        role: 'AMMINISTRATORE' as const,
        isFirstAccess: false,
    };

    const encodedPayload = btoa(JSON.stringify(claims))
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replaceAll('=', '');

    return `header.${encodedPayload}.signature`;
};

describe('Apartment monitor e2e', () => {
    beforeEach(() => {
        cy.viewport(1440, 1000);

        cy.intercept('POST', '**/auth/login', {
            statusCode: 200,
            body: {
                accessToken: createApartmentAccessToken(),
            },
        }).as('login');

        cy.intercept('GET', '**/my-vimar/account', {
            statusCode: 200,
            body: {
                email: apartmentLinkedEmail,
                isLinked: true,
            },
        });

        cy.intercept('GET', '**/api/vimar-account', {
            statusCode: 200,
            body: {
                email: apartmentLinkedEmail,
                isLinked: true,
            },
        });

        cy.intercept('GET', '**/alarm-events/unmanaged/*/*/*', {
            statusCode: 200,
            body: [
                {
                    id: 'a-room-1',
                    alarmRuleId: 'rule-1',
                    deviceId: 'dev-lamp-1',
                    alarmName: 'Allarme stanza soggiorno',
                    priority: 4,
                    activationTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                    resolutionTime: null,
                    position: 'Soggiorno',
                    userId: null,
                    userUsername: null,
                },
            ],
        }).as('getUnmanagedAlarms');

        const plantAllBody = [
            {
                id: '301',
                name: 'Appartamento Aurora',
                wardId: 2,
                rooms: [
                    {
                        id: 'room-1',
                        name: 'Soggiorno',
                        devices: [
                            {
                                id: 'dev-lamp-1',
                                name: 'Luce soggiorno',
                                type: 'SS_AUTOMATION_ONOFF',
                                subType: 'SF_LIGHT',
                                datapoints: [
                                    {
                                        id: 'dp-light-1',
                                        name: 'Comando luce',
                                        readable: true,
                                        writable: true,
                                        valueType: 'enum',
                                        enum: ['ON', 'OFF'],
                                        sfeType: 'SF_LIGHT_CMD',
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 'room-2',
                        name: 'Camera 1',
                        devices: [
                            {
                                id: 'dev-thermo-1',
                                name: 'Termostato camera',
                                type: 'SS_THERMOSTAT',
                                subType: 'SF_TEMPERATURE',
                                datapoints: [
                                    {
                                        id: 'dp-thermo-1',
                                        name: 'Setpoint',
                                        readable: true,
                                        writable: true,
                                        valueType: 'enum',
                                        enum: ['18', '20', '22'],
                                        sfeType: 'SF_TEMPERATURE_CMD',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: '302',
                name: 'Appartamento Luna',
                wardId: 3,
                rooms: [
                    {
                        id: 'room-3',
                        name: 'Studio',
                        devices: [
                            {
                                id: 'dev-light-2',
                                name: 'Luce studio',
                                type: 'SS_AUTOMATION_ONOFF',
                                subType: 'SF_LIGHT',
                                datapoints: [
                                    {
                                        id: 'dp-light-2',
                                        name: 'Comando luce studio',
                                        readable: true,
                                        writable: true,
                                        valueType: 'enum',
                                        enum: ['ON', 'OFF'],
                                        sfeType: 'SF_LIGHT_CMD',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ];

        cy.intercept('GET', '**/plant/all', {
            statusCode: 200,
            body: plantAllBody,
        }).as('getPlantAll');

        cy.intercept('GET', /\/plant\?plantid=.*/, (req) => {
            const plantId = req.url.split('plantid=').pop() ?? '301';

            req.reply({
                statusCode: 200,
                body: plantId === '302' ? plantAllBody[1] : plantAllBody[0],
            });
        }).as('getPlantById');

        cy.intercept('GET', '**/device/*/value', (req) => {
            const deviceId = req.url.split('/').at(-2) ?? '';
            req.reply({
                statusCode: 200,
                body: {
                    deviceId,
                    values: [],
                },
            });
        }).as('getDeviceValue');

        cy.intercept('GET', '**/analytics/*', {
            statusCode: 200,
            body: [],
        });

        cy.visit('/auth/login');
        cy.get('#username').type(apartmentUsername);
        cy.get('#password').type(apartmentPassword);
        cy.get('button[type="submit"]').click();

        cy.wait('@login');
        cy.location('pathname').should('eq', '/dashboard');

        cy.get('a.sidebar-link').contains('Dispositivi').click({ force: true });
        cy.location('pathname').should('eq', '/apartment-monitor');

        cy.wait('@getPlantAll');
        cy.wait('@getPlantById');
    });

    it('RF72-OBL Utente deve poter visualizzare un appartamento del Sistema', () => {
        cy.get('section[aria-label="Monitor appartamento"]').should('be.visible');
    });

    it('RF73-OBL Visualizzazione nome appartamento del Sistema', () => {
        cy.contains('h1', 'Appartamento Aurora').should('be.visible');
    });

    it('RF74-OPL Visualizzazione mappa degli allarmi dell appartamento', () => {
        cy.get('section[aria-label="Mappa allarmi"]').should('be.visible');
        cy.contains('h2', 'Panoramica allarmi').should('be.visible');
    });

    it('RF75-OBL Visualizzazione stanze dell appartamento', () => {
        cy.contains('h3', 'Soggiorno').should('be.visible');
        cy.contains('h3', 'Camera 1').should('be.visible');
    });

    it('RF76-OBL Utente deve visualizzare una stanza nel dettaglio', () => {
        cy.contains('h3', 'Soggiorno').should('be.visible');
        cy.get('table[aria-label="Tabella endpoint Soggiorno"]').should('exist');
    });

    it('RF77-OBL Visualizzazione nome della stanza nel dettaglio', () => {
        cy.contains('h3', 'Soggiorno').should('be.visible');
    });

    it('RF78-OBL Visualizzazione elenco dispositivi della stanza', () => {
        cy.contains('table[aria-label="Tabella endpoint Soggiorno"] tbody tr', 'Luce soggiorno').should('exist');
        cy.contains('table[aria-label="Tabella endpoint Camera 1"] tbody tr', 'Termostato camera').should('exist');
    });

    it('switches the monitored apartment and reloads the detail view', () => {
        cy.get('#active-apartment').select('302');
        cy.wait('@getPlantById');

        cy.contains('h1', 'Appartamento Luna').should('be.visible');
        cy.get('table[aria-label="Tabella endpoint Studio"]').should('exist');
    });
});
