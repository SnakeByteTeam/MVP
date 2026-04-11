const analyticsUsername = 'Mario Rossi';
const analyticsPassword = ['A', 'd', 'm', 'i', 'n', 'A', 'c', 'c', 'e', 's', 's', '1', '2', '3'].join('');
const analyticsLinkedEmail = 'admin@example.com';

const createAnalyticsAccessToken = (): string => {
    const claims = {
        userId: '1',
        username: analyticsUsername,
        role: 'AMMINISTRATORE' as const,
        isFirstAccess: false,
    };

    const encodedPayload = btoa(JSON.stringify(claims))
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replaceAll('=', '');

    return `header.${encodedPayload}.signature`;
};

describe('Analytics e2e', () => {
    beforeEach(() => {
        cy.viewport(1440, 1000);

        cy.intercept('POST', '**/auth/login', {
            statusCode: 200,
            body: {
                accessToken: createAnalyticsAccessToken(),
            },
        }).as('login');

        cy.intercept('GET', '**/my-vimar/account', {
            statusCode: 200,
            body: {
                email: analyticsLinkedEmail,
                isLinked: true,
            },
        });

        cy.intercept('GET', '**/api/vimar-account', {
            statusCode: 200,
            body: {
                email: analyticsLinkedEmail,
                isLinked: true,
            },
        });

        cy.intercept('GET', '**/alarm-events/unmanaged/*/*/*', {
            statusCode: 200,
            body: [],
        }).as('getUnmanagedAlarms');

        cy.intercept('GET', '**/plant/all', {
            statusCode: 200,
            body: [
                {
                    id: '301',
                    name: 'Appartamento Aurora',
                    rooms: [],
                },
                {
                    id: '302',
                    name: 'Appartamento Luna',
                    rooms: [],
                },
            ],
        }).as('getApartments');

        cy.intercept('GET', '**/analytics/*', (req) => {
            const apartmentId = req.url.split('/').pop()?.split('?')[0] ?? '301';

            const analyticsByApartment: Record<string, any[]> = {
                '301': [
                    {
                        title: 'Consumo energetico appartamento',
                        metric: 'plant-consumption',
                        unit: 'kWh',
                        labels: ['Lun', 'Mar'],
                        series: [
                            { id: 's1', name: 'Consumi', data: [18, 21] },
                        ],
                        suggestion: {
                            isSuggestion: true,
                            message: ['Ridurre il setpoint di 1 grado nelle ore notturne.'],
                        },
                    },
                    {
                        title: 'Anomalie impianto',
                        metric: 'plant-anomalies',
                        unit: 'numero',
                        labels: ['Lun', 'Mar'],
                        series: [
                            { id: 's2', name: 'Anomalie', data: [2, 1] },
                        ],
                        suggestion: {
                            isSuggestion: false,
                            message: [],
                        },
                    },
                    {
                        title: 'Rilevamento presenza',
                        metric: 'sensor-presence',
                        unit: 'rilevamenti',
                        labels: ['Lun', 'Mar'],
                        series: [
                            { id: 's3', name: 'Presenze', data: [30, 25] },
                        ],
                        suggestion: {
                            isSuggestion: false,
                            message: [],
                        },
                    },
                    {
                        title: 'Presenza prolungata ambiente',
                        metric: 'sensor-long-presence',
                        unit: 'eventi',
                        labels: ['Lun', 'Mar'],
                        series: [
                            { id: 's4', name: 'Presenza prolungata', data: [4, 3] },
                        ],
                        suggestion: {
                            isSuggestion: false,
                            message: [],
                        },
                    },
                    {
                        title: 'Variazioni temperatura',
                        metric: 'thermostat-temperature',
                        unit: '°C',
                        labels: ['Lun', 'Mar'],
                        series: [
                            { id: 's5', name: 'Temperatura', data: [20, 21] },
                        ],
                        suggestion: {
                            isSuggestion: true,
                            message: ['Ottimizzare i cicli HVAC nelle fasce serali.'],
                        },
                    },
                    {
                        title: 'Allarmi inviati e risolti',
                        metric: 'ward-resolved-alarm',
                        unit: 'numero',
                        labels: ['Settimana'],
                        series: [
                            { id: 's6', name: 'Inviati', data: [9] },
                            { id: 's7', name: 'Risolti', data: [7] },
                        ],
                        suggestion: {
                            isSuggestion: false,
                            message: [],
                        },
                    },
                    {
                        title: 'Frequenza allarmi',
                        metric: 'ward-alarms-frequency',
                        unit: 'numero',
                        labels: ['Settimana'],
                        series: [
                            { id: 's8', name: 'Frequenza', data: [9] },
                        ],
                        suggestion: {
                            isSuggestion: false,
                            message: [],
                        },
                    },
                    {
                        title: 'Frequenza cadute',
                        metric: 'ward-falls',
                        unit: 'numero',
                        labels: ['Settimana'],
                        series: [
                            { id: 's9', name: 'Cadute', data: [2] },
                        ],
                        suggestion: {
                            isSuggestion: false,
                            message: [],
                        },
                    },
                ],
                '302': [
                    {
                        title: 'Consumo energetico appartamento B',
                        metric: 'plant-consumption',
                        unit: 'kWh',
                        labels: ['Lun', 'Mar'],
                        series: [
                            { id: 's1', name: 'Consumi', data: [12, 15] },
                        ],
                        suggestion: {
                            isSuggestion: true,
                            message: ['Spostare i carichi sulle fasce meno energivore.'],
                        },
                    },
                    {
                        title: 'Anomalie impianto B',
                        metric: 'plant-anomalies',
                        unit: 'numero',
                        labels: ['Lun', 'Mar'],
                        series: [
                            { id: 's2', name: 'Anomalie', data: [1, 0] },
                        ],
                        suggestion: {
                            isSuggestion: false,
                            message: [],
                        },
                    },
                    {
                        title: 'Rilevamento presenza B',
                        metric: 'sensor-presence',
                        unit: 'rilevamenti',
                        labels: ['Lun', 'Mar'],
                        series: [
                            { id: 's3', name: 'Presenze', data: [22, 18] },
                        ],
                        suggestion: {
                            isSuggestion: false,
                            message: [],
                        },
                    },
                    {
                        title: 'Presenza prolungata ambiente B',
                        metric: 'sensor-long-presence',
                        unit: 'eventi',
                        labels: ['Lun', 'Mar'],
                        series: [
                            { id: 's4', name: 'Presenza prolungata', data: [3, 2] },
                        ],
                        suggestion: {
                            isSuggestion: false,
                            message: [],
                        },
                    },
                    {
                        title: 'Variazioni temperatura B',
                        metric: 'thermostat-temperature',
                        unit: '°C',
                        labels: ['Lun', 'Mar'],
                        series: [
                            { id: 's5', name: 'Temperatura', data: [19, 20] },
                        ],
                        suggestion: {
                            isSuggestion: true,
                            message: ['Verificare il profilo HVAC serale.'],
                        },
                    },
                    {
                        title: 'Allarmi inviati e risolti B',
                        metric: 'ward-resolved-alarm',
                        unit: 'numero',
                        labels: ['Settimana'],
                        series: [
                            { id: 's6', name: 'Inviati', data: [6] },
                            { id: 's7', name: 'Risolti', data: [5] },
                        ],
                        suggestion: {
                            isSuggestion: false,
                            message: [],
                        },
                    },
                    {
                        title: 'Frequenza allarmi B',
                        metric: 'ward-alarms-frequency',
                        unit: 'numero',
                        labels: ['Settimana'],
                        series: [
                            { id: 's8', name: 'Frequenza', data: [4] },
                        ],
                        suggestion: {
                            isSuggestion: false,
                            message: [],
                        },
                    },
                    {
                        title: 'Frequenza cadute B',
                        metric: 'ward-falls',
                        unit: 'numero',
                        labels: ['Settimana'],
                        series: [
                            { id: 's9', name: 'Cadute', data: [1] },
                        ],
                        suggestion: {
                            isSuggestion: false,
                            message: [],
                        },
                    },
                ],
            };

            req.reply({
                statusCode: 200,
                body: analyticsByApartment[apartmentId] ?? analyticsByApartment['301'],
            });
        }).as('getAnalytics');

        cy.visit('/auth/login');
        cy.get('#username').type(analyticsUsername);
        cy.get('#password').type(analyticsPassword);
        cy.get('button[type="submit"]').click();

        cy.wait('@login');
        cy.location('pathname').should('eq', '/dashboard');

        cy.get('a.sidebar-link').contains('Analytics').click({ force: true });
        cy.location('pathname').should('eq', '/analytics');

        cy.wait('@getApartments');
        cy.wait('@getAnalytics');
    });

    it('RF61-OBL Utente deve poter visualizzare le analytics', () => {
        cy.contains('h1', 'Cruscotto analitico').should('be.visible');
        cy.get('section[aria-label="Analytics reparto"]').should('be.visible');
    });

    it('RF62-OBL Visualizzazione elenco suggerimenti risparmio energetico nelle analytics', () => {
        cy.get('[data-test="suggestions-sidebar"]').should('exist');
    });

    it('RF63-OBL Visualizzazione di un suggerimento risparmio energetico', () => {
        cy.get('[data-test="suggestion-item"]').first().should('contain', 'Ridurre il setpoint');
    });

    it('RF64-OBL Visualizzazione grafico dedicato al consumo energetico', () => {
        cy.contains('h1', 'Consumo energetico appartamento').should('exist');
    });

    it('RF65-OBL Visualizzazione grafico dedicato alle anomalie dell impianto', () => {
        cy.contains('h1', 'Anomalie impianto').should('exist');
    });

    it('RF66-OBL Visualizzazione grafico relativo al rilevamento di presenza', () => {
        cy.contains('h1', 'Rilevamento presenza').should('exist');
    });

    it('RF67-OBL Visualizzazione grafico presenza prolungata nello stesso ambiente', () => {
        cy.contains('h1', 'Presenza prolungata ambiente').should('exist');
    });

    it('RF68-OBL Visualizzazione grafico relativo alle variazioni di temperatura', () => {
        cy.contains('h1', 'Variazioni temperatura').should('exist');
    });

    it('RF69-OBL Visualizzazione grafico allarmi inviati e risolti', () => {
        cy.contains('h1', 'Allarmi inviati e risolti').should('exist');
    });

    it('RF70-OPL Visualizzazione grafico frequenza degli allarmi', () => {
        cy.contains('h1', 'Frequenza allarmi').should('exist');
    });

    it('RF71-OPL Visualizzazione grafico frequenza delle cadute', () => {
        cy.contains('h1', 'Frequenza cadute').should('exist');
    });

    it('switches analytics when a different apartment is selected', () => {
        cy.get('#apartment-select').select('302');

        cy.wait('@getAnalytics');
        cy.contains('h1', 'Consumo energetico appartamento B').should('exist');
        cy.contains('h1', 'Frequenza cadute B').should('exist');
    });
});
