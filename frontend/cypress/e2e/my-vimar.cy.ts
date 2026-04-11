const adminUsername = 'admin.user';
const adminPassword = ['A', 'd', 'm', 'i', 'n', 'A', 'c', 'c', 'e', 's', 's', '1', '2', '3'].join('');
const linkedEmail = 'admin@example.com';

const createMyVimarAccessToken = (
    overrides: Partial<{
        userId: string;
        username: string;
        role: 'AMMINISTRATORE' | 'OPERATORE_SANITARIO';
        isFirstAccess: boolean;
    }> = {}
): string => {
    const claims = {
        userId: '1',
        username: adminUsername,
        role: 'AMMINISTRATORE' as const,
        isFirstAccess: false,
        ...overrides,
    };

    const encodedPayload = btoa(JSON.stringify(claims))
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replaceAll('=', '');

    return `header.${encodedPayload}.signature`;
};

type MyVimarAccountState = {
    email: string;
    isLinked: boolean;
};

const loginAsAdmin = (accountState: MyVimarAccountState) => {
    cy.intercept('POST', '**/auth/login', (req) => {
        expect(req.body).to.deep.equal({
            username: adminUsername,
            password: adminPassword,
        });

        req.reply({
            statusCode: 200,
            body: {
                accessToken: createMyVimarAccessToken(),
            },
        });
    }).as('login');

    cy.intercept('GET', '**/plant/all', {
        statusCode: 200,
        body: [],
    });

    cy.intercept('GET', '**/my-vimar/account', (req) => {
        req.reply({
            statusCode: 200,
            body: accountState,
        });
    }).as('getMyVimarAccount');

    cy.intercept('GET', '**/api/vimar-account', (req) => {
        req.reply({
            statusCode: 200,
            body: accountState,
        });
    });

    cy.visit('/auth/login');
    cy.get('#username').type(adminUsername);
    cy.get('#password').type(adminPassword);
    cy.get('button[type="submit"]').click();

    cy.wait('@login');
    cy.contains('h1', 'Dashboard').should('be.visible');
};

const openMyVimarPageFromProfile = () => {
    cy.get('button[aria-label="Apri profilo"]').click();
    cy.contains('button', 'Vai a MyVimar').click();
    cy.contains('h1', 'Integrazione MyVimar').should('be.visible');
};

describe('Integrazione MyVimar', () => {
    it('RF11-OBL Visualizzazione account MyVimar configurato', () => {
        loginAsAdmin({
            email: linkedEmail,
            isLinked: true,
        });

        openMyVimarPageFromProfile();

        cy.contains('Account collegato').should('be.visible');
        cy.contains('button', 'Rimuovi account').should('be.visible');
    });

    it('RF12-OBL Visualizzazione email account MyVimar collegato', () => {
        loginAsAdmin({
            email: linkedEmail,
            isLinked: true,
        });

        openMyVimarPageFromProfile();

        cy.contains(linkedEmail).should('be.visible');
    });

    it('RF13-OBL Collegamento account MyVimar', () => {
        loginAsAdmin({
            email: '',
            isLinked: false,
        });

        openMyVimarPageFromProfile();

        cy.intercept('POST', '**/api/auth/prepare-oauth', (req) => {
            expect(req.body).to.deep.equal({});

            req.reply({
                statusCode: 200,
                body: {
                    ticket: 'ticket-123',
                },
            });
        }).as('prepareOAuth');

        cy.intercept('GET', '**/api/auth/authorize*', (req) => {
            req.reply({
                statusCode: 200,
                headers: {
                    'content-type': 'text/html; charset=utf-8',
                },
                body: '<!doctype html><html><body>OAuth redirect</body></html>',
            });
        }).as('authorizePage');

        cy.contains('button', 'Collega account MyVimar').then(($button) => {
            $button[0].click();
        });

        cy.wait('@prepareOAuth').its('response.body.ticket').should('eq', 'ticket-123');
        cy.wait('@authorizePage');
    });

    it('RF14-OBL Rimozione account MyVimar', () => {
        let accountState: MyVimarAccountState = {
            email: linkedEmail,
            isLinked: true,
        };

        loginAsAdmin(accountState);

        cy.intercept('DELETE', '**/my-vimar/account', (req) => {
            accountState.email = '';
            accountState.isLinked = false;

            req.reply({
                statusCode: 200,
                body: null,
            });
        }).as('unlinkAccount');

        openMyVimarPageFromProfile();

        cy.contains('button', 'Rimuovi account').click();
        cy.wait('@unlinkAccount');

        cy.contains('Nessun account MyVimar collegato.').should('be.visible');
        cy.contains('button', 'Collega account MyVimar').should('be.visible');
        cy.contains(linkedEmail).should('not.exist');
    });
});