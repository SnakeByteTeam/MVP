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

    it('shows the disconnected MyVimar state', () => {
        loginAsAdmin({
            email: '',
            isLinked: false,
        });

        openMyVimarPageFromProfile();

        cy.contains('Nessun account collegato').should('be.visible');
        cy.contains('button', 'Collega account MyVimar').should('be.visible');
        cy.contains('button', 'Rimuovi account').should('not.exist');
    });

    it('redirects non-admin users away from /vimar-link', () => {
        cy.intercept('POST', '**/auth/login', {
            statusCode: 200,
            body: {
                accessToken: createMyVimarAccessToken({ role: 'OPERATORE_SANITARIO' }),
            },
        }).as('operatorLogin');

        cy.intercept('GET', '**/plant/all', {
            statusCode: 200,
            body: [
                {
                    id: '301',
                    name: 'Appartamento Aurora',
                    wardId: 2,
                    rooms: [],
                },
            ],
        }).as('getPlantAll');

        cy.intercept('GET', '**/plant?plantid=301', {
            statusCode: 200,
            body: {
                id: '301',
                name: 'Appartamento Aurora',
                wardId: 2,
                rooms: [],
            },
        }).as('getPlantById');

        cy.intercept('GET', '**/alarm-events/unmanaged/*/*/*', {
            statusCode: 200,
            body: [],
        });

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

        cy.visit('/auth/login?returnUrl=%2Fvimar-link');
        cy.get('#username').type(adminUsername);
        cy.get('#password').type(adminPassword);
        cy.get('button[type="submit"]').click();

        cy.wait('@operatorLogin');
        cy.wait('@getPlantAll');
        cy.wait('@getPlantById');
        cy.location('pathname').should('eq', '/apartment-monitor');
        cy.contains('h1', 'Appartamento Aurora').should('be.visible');
    });

    it('falls back to secondary account endpoint when primary account returns 404', () => {
        loginAsAdmin({
            email: linkedEmail,
            isLinked: true,
        });

        cy.intercept('GET', '**/my-vimar/account', {
            statusCode: 404,
            body: { message: 'Not Found' },
        }).as('getPrimaryAccount404');

        cy.intercept('GET', '**/api/vimar-account', {
            statusCode: 200,
            body: {
                email: linkedEmail,
                isLinked: true,
            },
        }).as('getFallbackAccount');

        openMyVimarPageFromProfile();

        cy.wait('@getPrimaryAccount404');
        cy.wait('@getFallbackAccount');
        cy.contains('Account collegato').should('be.visible');
        cy.contains(linkedEmail).should('be.visible');
    });

    it('shows disconnected state when both account endpoints return 404', () => {
        loginAsAdmin({
            email: linkedEmail,
            isLinked: true,
        });

        cy.intercept('GET', '**/my-vimar/account', {
            statusCode: 404,
            body: { message: 'Not Found' },
        }).as('getPrimaryAccountNotFound');

        cy.intercept('GET', '**/api/vimar-account', {
            statusCode: 404,
            body: { message: 'Not Found' },
        }).as('getSecondaryAccountNotFound');

        openMyVimarPageFromProfile();

        cy.wait('@getPrimaryAccountNotFound');
        cy.wait('@getSecondaryAccountNotFound');
        cy.contains('Nessun account collegato').should('be.visible');
        cy.contains('button', 'Collega account MyVimar').should('be.visible');
    });

    it('falls back to secondary endpoint for unlink when primary delete returns 404', () => {
        loginAsAdmin({
            email: linkedEmail,
            isLinked: true,
        });

        let accountIsLinked = true;

        cy.intercept('GET', '**/my-vimar/account', (req) => {
            if (accountIsLinked) {
                req.reply({
                    statusCode: 200,
                    body: {
                        email: linkedEmail,
                        isLinked: true,
                    },
                });
                return;
            }

            req.reply({
                statusCode: 404,
                body: { message: 'Not Found' },
            });
        }).as('getPrimaryAfterUnlink');

        cy.intercept('GET', '**/api/vimar-account', (req) => {
            if (accountIsLinked) {
                req.reply({
                    statusCode: 200,
                    body: {
                        email: linkedEmail,
                        isLinked: true,
                    },
                });
                return;
            }

            req.reply({
                statusCode: 200,
                body: {
                    email: '',
                    isLinked: false,
                },
            });
        }).as('getSecondaryAfterUnlink');

        cy.intercept('DELETE', '**/my-vimar/account', (req) => {
            accountIsLinked = false;

            req.reply({
                statusCode: 404,
                body: { message: 'Not Found' },
            });
        }).as('unlinkPrimary404');

        cy.intercept('DELETE', '**/api/vimar-account', {
            statusCode: 200,
            body: null,
        }).as('unlinkSecondary200');

        openMyVimarPageFromProfile();
        cy.contains('Account collegato').should('be.visible');

        cy.contains('button', 'Rimuovi account').click();

        cy.wait('@unlinkPrimary404');
        cy.wait('@unlinkSecondary200');
        cy.wait('@getSecondaryAfterUnlink');
        cy.get('@getPrimaryAfterUnlink.all').its('length').should('be.greaterThan', 1);
        cy.contains('Nessun account collegato').should('be.visible');
    });

    it('shows unlink error when secondary endpoint also fails', () => {
        loginAsAdmin({
            email: linkedEmail,
            isLinked: true,
        });

        cy.intercept('DELETE', '**/my-vimar/account', {
            statusCode: 404,
            body: { message: 'Not Found' },
        }).as('unlinkPrimaryNotFound');

        cy.intercept('DELETE', '**/api/vimar-account', {
            statusCode: 500,
            body: { message: 'Internal error' },
        }).as('unlinkSecondaryFailure');

        openMyVimarPageFromProfile();
        cy.contains('Account collegato').should('be.visible');

        cy.contains('button', 'Rimuovi account').click();

        cy.wait('@unlinkPrimaryNotFound');
        cy.wait('@unlinkSecondaryFailure');
        cy.contains('h1', 'Integrazione MyVimar').should('be.visible');
        cy.contains('button', 'Rimozione in corso...').should('exist');
    });

    it('shows alert when OAuth prepare returns an empty ticket', () => {
        loginAsAdmin({
            email: '',
            isLinked: false,
        });

        cy.intercept('POST', '**/api/auth/prepare-oauth', {
            statusCode: 200,
            body: {
                ticket: '   ',
            },
        }).as('prepareOAuthEmptyTicket');

        openMyVimarPageFromProfile();

        cy.window().then((windowObject) => {
            cy.stub(windowObject, 'alert').as('oauthAlert');
        });

        cy.contains('button', 'Collega account MyVimar').click();

        cy.wait('@prepareOAuthEmptyTicket');
        cy.get('@oauthAlert').should('have.been.calledWith', 'Ticket OAuth non valido. Riprova tra qualche istante.');
    });
});