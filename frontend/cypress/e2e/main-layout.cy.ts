import type { CyHttpMessages } from 'cypress/types/net-stubbing';

const mainLayoutUsername = 'layout.user';
const mainLayoutPassword = ['L', 'a', 'y', 'o', 'u', 't', 'A', 'c', 'c', 'e', 's', 's', '1', '2', '3'].join('');

const createAccessToken = (role: 'AMMINISTRATORE' | 'OPERATORE_SANITARIO'): string => {
    const claims = {
        userId: '1',
        username: mainLayoutUsername,
        role,
        isFirstAccess: false,
    };

    const encodedPayload = btoa(JSON.stringify(claims))
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replaceAll('=', '');

    return `header.${encodedPayload}.signature`;
};

const stubMainLayoutApis = (options?: {
    isLinked?: boolean;
    analyticsHandler?: (req: CyHttpMessages.IncomingHttpRequest) => void;
    managedNotifications?: Array<{
        id: string;
        activationTime: string;
        resolutionTime: string | null;
        alarmName: string;
        priority: number;
    }>;
    unmanagedNotifications?: Array<{
        id: string;
        activationTime: string;
        resolutionTime: string | null;
        alarmName: string;
        priority: number;
    }>;
}) => {
    const isLinked = options?.isLinked ?? true;

    const vimarAccountBody = {
        email: 'layout@example.com',
        isLinked,
    };

    cy.intercept('GET', '**/my-vimar/account', {
        statusCode: 200,
        body: vimarAccountBody,
    }).as('getMyVimarAccountMainLayout');

    cy.intercept('GET', '**/api/vimar-account', {
        statusCode: 200,
        body: vimarAccountBody,
    }).as('getApiVimarAccountMainLayout');

    cy.intercept('GET', '**/alarm-events/managed/*/*/*', {
        statusCode: 200,
        body: options?.managedNotifications ?? [],
    }).as('getManagedMainLayout');

    cy.intercept('GET', '**/alarm-events/unmanaged/*/*/*', {
        statusCode: 200,
        body: options?.unmanagedNotifications ?? [],
    }).as('getUnmanagedMainLayout');

    const plantBody = [
        {
            id: '301',
            name: 'Appartamento Main Layout',
            wardId: 2,
            rooms: [
                {
                    id: 'room-1',
                    name: 'Soggiorno',
                    devices: [
                        {
                            id: 'dev-1',
                            name: 'Luce soggiorno',
                            type: 'SS_AUTOMATION_ONOFF',
                            subType: 'SF_LIGHT',
                            datapoints: [],
                        },
                    ],
                },
            ],
        },
    ];

    cy.intercept('GET', '**/plant/all', {
        statusCode: 200,
        body: plantBody,
    }).as('getPlantAllMainLayout');

    cy.intercept('GET', /\/plant\?plantid=.*/, {
        statusCode: 200,
        body: plantBody[0],
    }).as('getPlantByIdMainLayout');

    cy.intercept('GET', '**/device/*/value', (req) => {
        const deviceId = req.url.split('/').at(-2) ?? '';
        req.reply({
            statusCode: 200,
            body: {
                deviceId,
                values: [],
            },
        });
    });

    if (options?.analyticsHandler) {
        cy.intercept('GET', '**/analytics/*', options.analyticsHandler).as('getAnalyticsMainLayout');
    } else {
        cy.intercept('GET', '**/analytics/*', {
            statusCode: 200,
            body: [],
        }).as('getAnalyticsMainLayout');
    }
};

const loginFromUi = (role: 'AMMINISTRATORE' | 'OPERATORE_SANITARIO', returnUrl = '/dashboard') => {
    cy.intercept('POST', '**/auth/login', (req) => {
        expect(req.body).to.deep.equal({
            username: mainLayoutUsername,
            password: mainLayoutPassword,
        });

        req.reply({
            statusCode: 200,
            body: {
                accessToken: createAccessToken(role),
            },
        });
    }).as('loginMainLayout');

    cy.visit(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    cy.get('#username').type(mainLayoutUsername);
    cy.get('#password').type(mainLayoutPassword);
    cy.get('button[type="submit"]').click();
    cy.wait('@loginMainLayout');
};

describe('Main layout and core integration e2e', () => {
    it('shows admin navigation entries in sidebar', () => {
        stubMainLayoutApis({ isLinked: true });
        loginFromUi('AMMINISTRATORE', '/dashboard');

        cy.location('pathname').should('eq', '/dashboard');
        cy.contains('a.sidebar-link', 'Configurazione Allarmi').should('be.visible');
        cy.contains('a.sidebar-link', 'Gestione Reparti').should('be.visible');
        cy.contains('a.sidebar-link', 'Gestione Utenti').should('be.visible');
    });

    it('hides admin-only navigation entries for operators', () => {
        stubMainLayoutApis({ isLinked: true });
        loginFromUi('OPERATORE_SANITARIO', '/dashboard');

        cy.location('pathname').should('eq', '/dashboard');
        cy.contains('a.sidebar-link', 'Configurazione Allarmi').should('not.exist');
        cy.contains('a.sidebar-link', 'Gestione Reparti').should('not.exist');
        cy.contains('a.sidebar-link', 'Gestione Utenti').should('not.exist');
    });

    it('redirects operator away from admin route via role guard', () => {
        stubMainLayoutApis({ isLinked: true });
        loginFromUi('OPERATORE_SANITARIO', '/user-management');

        cy.location('pathname').should('eq', '/apartment-monitor');
        cy.get('section[aria-label="Monitor appartamento"]').should('be.visible');
    });

    it('shows MyVimar warning banner for unlinked admin accounts', () => {
        stubMainLayoutApis({ isLinked: false });
        loginFromUi('AMMINISTRATORE', '/dashboard');

        cy.location('pathname').should('eq', '/dashboard');
        cy.contains('output', 'Account da associare a MyVimar').should('be.visible');
    });

    it('keeps profile panel and notification panel mutually exclusive', () => {
        stubMainLayoutApis({ isLinked: true });
        loginFromUi('AMMINISTRATORE', '/dashboard');

        cy.get('button[aria-label="Apri profilo"]').click();
        cy.contains('p', 'Area Utente').should('be.visible');

        cy.get('button[aria-label="Visualizza notifiche"]').click();
        cy.get('section[aria-label="Notifiche recenti"]').should('be.visible');
        cy.contains('p', 'Area Utente').should('not.exist');

        cy.get('button[aria-label="Apri profilo"]').click();
        cy.contains('p', 'Area Utente').should('be.visible');
        cy.get('section[aria-label="Notifiche recenti"]').should('not.exist');
    });

    it('requires a second bell click to close the notification panel', () => {
        stubMainLayoutApis({
            isLinked: true,
        });

        loginFromUi('AMMINISTRATORE', '/dashboard');

        cy.get('section[aria-label="Notifiche recenti"]').should('not.exist');

        cy.get('button[aria-label="Visualizza notifiche"]').click();
        cy.get('section[aria-label="Notifiche recenti"]').should('be.visible');
        cy.contains('Nessuna notifica disponibile.').should('be.visible');

        cy.get('button[aria-label="Visualizza notifiche"]').click();
        cy.get('section[aria-label="Notifiche recenti"]').should('not.exist');
    });

    it('logs out and returns to login even when logout endpoint fails', () => {
        stubMainLayoutApis({ isLinked: true });
        loginFromUi('AMMINISTRATORE', '/dashboard');

        cy.intercept('POST', '**/auth/logout', {
            statusCode: 500,
            body: { message: 'Server error' },
        }).as('logoutFailure');

        cy.get('button[aria-label="Apri profilo"]').click();
        cy.contains('button', 'Esci').click();

        cy.wait('@logoutFailure');
        cy.location('pathname').should('eq', '/auth/login');
    });

    it('updates topbar breadcrumb after sidebar navigation', () => {
        stubMainLayoutApis({ isLinked: true });
        loginFromUi('AMMINISTRATORE', '/dashboard');

        cy.get('nav[aria-label="Breadcrumb"]').should('contain', 'Dashboard');

        cy.get('a.sidebar-link').contains('Notifiche').click({ force: true });
        cy.location('pathname').should('eq', '/notifications');
        cy.get('nav[aria-label="Breadcrumb"]').should('contain', 'Notifiche');

        cy.get('a.sidebar-link').contains('Analytics').click({ force: true });
        cy.location('pathname').should('eq', '/analytics');
        cy.get('nav[aria-label="Breadcrumb"]').should('contain', 'Analytics');
    });

    it('refreshes token and retries request after 401 from a protected API call', () => {
        let analyticsCalls = 0;

        stubMainLayoutApis({
            isLinked: true,
            analyticsHandler: (req) => {
                analyticsCalls += 1;

                if (analyticsCalls === 1) {
                    req.reply({
                        statusCode: 401,
                        body: { message: 'Expired access token' },
                    });
                    return;
                }

                req.reply({
                    statusCode: 200,
                    body: [],
                });
            },
        });

        cy.intercept('POST', '**/auth/refresh', {
            statusCode: 200,
            body: {
                accessToken: createAccessToken('AMMINISTRATORE'),
            },
        }).as('refreshAfter401');

        loginFromUi('AMMINISTRATORE', '/analytics');

        cy.wait('@refreshAfter401');
        cy.location('pathname').should('eq', '/analytics');
        cy.get('@getAnalyticsMainLayout.all').should('have.length.at.least', 2);
    });
});
