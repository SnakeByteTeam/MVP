const notificationUsername = 'Operatore Demo';
const notificationPassword = ['O', 'p', 'e', 'r', 'a', 't', 'o', 'r', 'e', '1', '2', '3'].join('');
const notificationLinkedEmail = 'operatore@example.com';

const createNotificationAccessToken = (): string => {
    const claims = {
        userId: '1',
        username: notificationUsername,
        role: 'OPERATORE_SANITARIO' as const,
        isFirstAccess: false,
    };

    const encodedPayload = btoa(JSON.stringify(claims))
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replaceAll('=', '');

    return `header.${encodedPayload}.signature`;
};

describe('Notification e2e', () => {
    beforeEach(() => {
        const now = Date.now();
        const unmanagedHistory = [
            {
                id: 'evt-triggered-1',
                activationTime: new Date(now - 5 * 60 * 1000).toISOString(),
                resolutionTime: null,
                alarmName: 'Caduta paziente camera 2',
                priority: 4,
            },
        ];

        const managedHistory = [
            {
                id: 'evt-resolved-1',
                activationTime: new Date(now - 40 * 60 * 1000).toISOString(),
                resolutionTime: new Date(now - 3 * 60 * 1000).toISOString(),
                alarmName: 'Pulsante bagno',
                priority: 2,
            },
        ];

        cy.viewport(1440, 1000);

        cy.intercept('POST', '**/auth/login', {
            statusCode: 200,
            body: {
                accessToken: createNotificationAccessToken(),
            },
        }).as('login');

        cy.intercept('GET', '**/my-vimar/account', {
            statusCode: 200,
            body: {
                email: notificationLinkedEmail,
                isLinked: true,
            },
        });

        cy.intercept('GET', '**/api/vimar-account', {
            statusCode: 200,
            body: {
                email: notificationLinkedEmail,
                isLinked: true,
            },
        });

        cy.intercept('GET', '**/alarm-events/unmanaged/*/*/*', (req) => {
            if (req.url.includes('/alarm-events/unmanaged/1/100/0')) {
                req.reply({
                    statusCode: 200,
                    body: unmanagedHistory,
                });
                return;
            }

            req.reply({
                statusCode: 200,
                body: [],
            });
        }).as('getUnmanagedNotificationHistory');

        cy.intercept('GET', '**/alarm-events/managed/*/*/*', (req) => {
            if (req.url.includes('/alarm-events/managed/1/100/0')) {
                req.reply({
                    statusCode: 200,
                    body: managedHistory,
                });
                return;
            }

            req.reply({
                statusCode: 200,
                body: [],
            });
        }).as('getManagedNotificationHistory');

        cy.visit('/auth/login?returnUrl=%2Fnotifications%3Ffocus%3Dalarm-triggered-evt-triggered-1');
        cy.get('#username').type(notificationUsername);
        cy.get('#password').type(notificationPassword);
        cy.get('button[type="submit"]').click();

        cy.wait('@login');
        cy.location('pathname').should('eq', '/notifications');
        cy.contains('h1', 'Notifiche').should('be.visible');
        cy.wait('@getUnmanagedNotificationHistory');
        cy.wait('@getManagedNotificationHistory');
    });

    it('RF102-OPL Utente deve poter visualizzare le notifiche inviate dal Sistema', () => {
        cy.get('ul[aria-label="Elenco notifiche"] li').should('have.length', 2);
        cy.contains('h2', 'Caduta paziente camera 2').should('be.visible');
        cy.contains('h2', 'Allarme risolto').should('be.visible');
    });

    it('RF103-OPL Utente visualizzando le notifiche deve poter visualizzare una notifica nel dettaglio', () => {
        cy.get('#notification-alarm-triggered-evt-triggered-1').within(() => {
            cy.contains('Notifica di sistema registrata nel feed del reparto.').should('be.visible');
            cy.get('time.notification-item__time').should('exist');
        });
    });

    it('RF104-OPL Utente visualizzando una notifica deve poter visualizzare il titolo della notifica', () => {
        cy.get('#notification-alarm-triggered-evt-triggered-1 .notification-item__title')
            .should('contain', 'Caduta paziente camera 2');
    });

    it('RF105-OPL Utente visualizzando una notifica deve poter visualizzare il tempo trascorso dall invio della notifica', () => {
        cy.get('#notification-alarm-triggered-evt-triggered-1 .notification-item__time')
            .invoke('text')
            .should('match', /fa|tra poco/);
    });

    it('highlights the notification selected through focus query param', () => {
        cy.get('#notification-alarm-triggered-evt-triggered-1')
            .should('have.class', 'notification-card--highlighted');
    });

    it('removes a single notification from the archive list', () => {
        cy.get('#notification-alarm-triggered-evt-triggered-1')
            .find('button[aria-label="Rimuovi notifica"]')
            .click();

        cy.get('ul[aria-label="Elenco notifiche"] li').should('have.length', 1);
        cy.get('#notification-alarm-triggered-evt-triggered-1').should('not.exist');
        cy.get('#notification-alarm-resolved-evt-resolved-1').should('exist');
    });

    it('clears all notifications and shows the empty state', () => {
        cy.contains('button', 'Cancella tutte').click();

        cy.contains('Nessuna notifica disponibile').should('be.visible');
        cy.get('ul[aria-label="Elenco notifiche"]').should('not.exist');
        cy.contains('button', 'Cancella tutte').should('not.exist');
    });
});
