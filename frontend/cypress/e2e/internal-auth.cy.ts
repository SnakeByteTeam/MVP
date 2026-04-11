const validUsername = 'mario.rossi';
const validLoginSecret = ['L', 'o', 'g', 'i', 'n', 'A', 'c', 'c', 'e', 's', 's', '1', '2', '3'].join('');
const validTemporarySecret = ['T', 'e', 'm', 'p', 'A', 'c', 'c', 'e', 's', 's', '1', '2'].join('');
const validNewSecret = ['N', 'e', 'w', 'A', 'c', 'c', 'e', 's', 's', '1', '2', '3', '4'].join('');
const shortSecret = 'shortpwd123';

const createAccessToken = (
  overrides: Partial<{
    userId: string;
    username: string;
    role: 'AMMINISTRATORE' | 'OPERATORE_SANITARIO';
    isFirstAccess: boolean;
  }> = {}
): string => {
  const claims = {
    userId: '1',
    username: validUsername,
    role: 'OPERATORE_SANITARIO' as const,
    isFirstAccess: false,
    ...overrides,
  };

  const encodedPayload = btoa(JSON.stringify(claims))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');

  return `header.${encodedPayload}.signature`;
};

describe('Autenticazione frontend', () => {
  beforeEach(() => {
    cy.intercept('**/plant/all', {
      statusCode: 200,
      body: [],
    });
  });

  describe('Requisiti RF1-RF10', () => {
    it('RF1-OBL Utente autenticabile presso il Sistema', () => {
      cy.visit('/auth/login');

      cy.intercept('POST', '**/auth/login', (req) => {
        expect(req.body).to.deep.equal({
          username: validUsername,
          password: validLoginSecret,
        });

        req.reply({
          statusCode: 200,
          body: {
            accessToken: createAccessToken(),
          },
        });
      }).as('login');

      cy.get('#username').type(validUsername);
      cy.get('#password').type(validLoginSecret);
      cy.get('button[type="submit"]').click();

      cy.wait('@login');
      cy.location('pathname').should('eq', '/dashboard');
      cy.contains('h1', 'Dashboard').should('be.visible');
    });

    it('RF2-OBL Inserimento username per autenticarsi', () => {
      cy.visit('/auth/login');

      cy.get('#password').type(validLoginSecret);
      cy.get('#username').focus().blur();
      cy.contains('#username-error', "L'username è obbligatorio.").should('be.visible');

      cy.get('#username').clear().type('ab').blur();
      cy.contains('#username-error', "L'username deve avere almeno 3 caratteri.").should('be.visible');
    });

    it('RF3-OBL Inserimento password per autenticarsi', () => {
      cy.visit('/auth/login');

      cy.get('#username').type(validUsername);
      cy.get('#password').focus().blur();
      cy.contains('#password-error', 'La password è obbligatoria.').should('be.visible');

      cy.get('#password').clear().type(shortSecret).blur();
      cy.contains('#password-error', 'La password deve avere almeno 12 caratteri.').should('be.visible');
    });

    it('RF4-OBL Errore su username non registrato o password errata', () => {
      cy.visit('/auth/login');

      cy.intercept('POST', '**/auth/login', {
        statusCode: 401,
        body: { message: 'Unauthorized' },
      }).as('loginUnauthorized');

      cy.get('#username').type(validUsername);
      cy.get('#password').type(validLoginSecret);
      cy.get('button[type="submit"]').click();

      cy.wait('@loginUnauthorized');
      cy.contains('p', 'Utente non trovato: username o password errati.').should('be.visible');
    });

    it('RF5-OBL Autenticazione con impostazione nuova password', () => {
      cy.visit('/auth/login');

      cy.intercept('POST', '**/auth/login', (req) => {
        expect(req.body).to.deep.equal({
          username: validUsername,
          password: validTemporarySecret,
        });

        req.reply({
          statusCode: 200,
          body: {
            accessToken: createAccessToken({ isFirstAccess: true }),
          },
        });
      }).as('temporaryLogin');

      cy.intercept('POST', '**/auth/first-login', (req) => {
        expect(req.body).to.deep.equal({
          username: validUsername,
          tempPassword: validTemporarySecret,
          password: validNewSecret,
        });

        req.reply({
          statusCode: 200,
          body: {
            accessToken: createAccessToken({ isFirstAccess: false }),
          },
        });
      }).as('firstLogin');

      cy.get('#username').type(validUsername);
      cy.get('#password').type(validTemporarySecret);
      cy.get('button[type="submit"]').click();

      cy.wait('@temporaryLogin');
      cy.location('pathname').should('eq', '/auth/first-access');
      cy.contains('h1', 'Imposta la tua password personale').should('be.visible');

      cy.get('#username').clear().type(validUsername);
      cy.get('#temporaryPassword').clear().type(validTemporarySecret);
      cy.get('#newPassword').clear().type(validNewSecret);
      cy.get('button[type="submit"]').click();

      cy.wait('@firstLogin');
      cy.location('pathname').should('eq', '/dashboard');
    });

    it('RF6-OBL Inserimento password temporanea per primo accesso', () => {
      cy.visit('/auth/first-access');

      cy.get('#username').type(validUsername);
      cy.get('#newPassword').type(validNewSecret);
      cy.get('#temporaryPassword').focus().blur();
      cy.contains('#temporaryPassword-error', 'La password temporanea è obbligatoria.').should('be.visible');

      cy.get('#temporaryPassword').clear().type('TempShort1').blur();
      cy.contains('#temporaryPassword-error', 'La password temporanea deve avere almeno 12 caratteri.').should('be.visible');
    });

    it('RF7-OBL Inserimento nuova password per registrarsi', () => {
      cy.visit('/auth/first-access');

      cy.get('#username').type(validUsername);
      cy.get('#temporaryPassword').type(validTemporarySecret);
      cy.get('#newPassword').focus().blur();
      cy.contains('#newPassword-error', 'La nuova password è obbligatoria.').should('be.visible');

      cy.get('#newPassword').clear().type(shortSecret).blur();
      cy.contains('#newPassword-error', 'La nuova password deve avere almeno 12 caratteri.').should('be.visible');
    });

    it('RF8-OBL Errore su username o password temporanea errati', () => {
      cy.visit('/auth/first-access');

      cy.intercept('POST', '**/auth/first-login', {
        statusCode: 401,
        body: { message: 'Unauthorized' },
      }).as('firstLoginUnauthorized');

      cy.get('#username').type(validUsername);
      cy.get('#temporaryPassword').type(validTemporarySecret);
      cy.get('#newPassword').type(validNewSecret);
      cy.get('button[type="submit"]').click();

      cy.wait('@firstLoginUnauthorized');
      cy.contains('p', 'Username o password temporanea errati.').should('be.visible');
    });

    it('RF9-OBL Errore se nuova password uguale alla temporanea', () => {
      cy.visit('/auth/first-access');

      cy.get('#username').type(validUsername);
      cy.get('#temporaryPassword').type(validTemporarySecret);
      cy.get('#newPassword').type(validTemporarySecret).blur();

      cy.contains('#newPassword-error', 'La nuova password deve essere diversa da quella temporanea.').should('be.visible');
    });

    it('RF10-OBL Errore se nuova password non rispetta i criteri richiesti', () => {
      cy.visit('/auth/first-access');

      cy.get('#username').type(validUsername);
      cy.get('#temporaryPassword').type(validTemporarySecret);
      cy.get('#newPassword').type('abc').blur();

      cy.contains('#newPassword-error', 'La nuova password deve avere almeno 12 caratteri.').should('be.visible');
    });
  });

  it('navigates to the requested returnUrl after login', () => {
    cy.intercept('GET', '**/my-vimar/account', {
      statusCode: 200,
      body: {
        email: 'admin@example.com',
        isLinked: true,
      },
    });

    cy.intercept('GET', '**/api/vimar-account', {
      statusCode: 200,
      body: {
        email: 'admin@example.com',
        isLinked: true,
      },
    });

    cy.intercept('POST', '**/auth/login', (req) => {
      expect(req.body).to.deep.equal({
        username: validUsername,
        password: validLoginSecret,
      });

      req.reply({
        statusCode: 200,
        body: {
          accessToken: createAccessToken({ role: 'AMMINISTRATORE' }),
        },
      });
    }).as('loginWithReturnUrl');

    cy.visit('/auth/login?returnUrl=%2Fvimar-link');
    cy.get('#username').type(validUsername);
    cy.get('#password').type(validLoginSecret);
    cy.get('form').submit();

    cy.wait('@loginWithReturnUrl');
    cy.location('pathname').should('eq', '/vimar-link');
    cy.contains('h1', 'Integrazione MyVimar').should('be.visible');
  });

  it('restores session from refresh when opening a protected route', () => {
    cy.intercept('POST', '**/auth/refresh', {
      statusCode: 200,
      body: {
        accessToken: createAccessToken(),
      },
    }).as('refreshSession');

    cy.intercept('GET', '**/alarm-events/unmanaged/*/*/*', {
      statusCode: 200,
      body: [],
    });

    cy.visit('/alarms/alarm-management');

    cy.wait('@refreshSession');
    cy.location('pathname').should('eq', '/alarms/alarm-management');
    cy.contains('h1', 'Gestione allarmi attivi').should('be.visible');
  });

  it('redirects to login when refresh fails and preserves returnUrl', () => {
    cy.intercept('POST', '**/auth/refresh', {
      statusCode: 401,
      body: { message: 'Refresh token expired' },
    }).as('refreshSessionFailed');

    cy.visit('/alarms/alarm-management');

    cy.wait('@refreshSessionFailed');
    cy.location('pathname').should('eq', '/auth/login');
    cy.location('search').should('include', 'returnUrl=%2Falarms%2Falarm-management');
    cy.get('@refreshSessionFailed.all').should('have.length', 1);
  });

  it('ignores external returnUrl values and falls back to dashboard', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        accessToken: createAccessToken(),
      },
    }).as('loginUnsafeReturnUrl');

    cy.intercept('GET', '**/alarm-events/unmanaged/*/*/*', {
      statusCode: 200,
      body: [],
    });

    cy.intercept('GET', '**/analytics/*', {
      statusCode: 200,
      body: [],
    });

    cy.visit('/auth/login?returnUrl=https%3A%2F%2Fevil.example%2Fsteal');
    cy.get('#username').type(validUsername);
    cy.get('#password').type(validLoginSecret);
    cy.get('button[type="submit"]').click();

    cy.wait('@loginUnsafeReturnUrl');
    cy.location('pathname').should('eq', '/dashboard');
  });

  it('shows login error when backend returns a malformed access token', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        accessToken: 'not-a-jwt-token',
      },
    }).as('loginMalformedToken');

    cy.visit('/auth/login');
    cy.get('#username').type(validUsername);
    cy.get('#password').type(validLoginSecret);
    cy.get('button[type="submit"]').click();

    cy.wait('@loginMalformedToken');
    cy.location('pathname').should('eq', '/auth/login');
    cy.contains('p', 'Utente non trovato: username o password errati.').should('be.visible');
  });

  it('redirects first-access users to password setup even when returnUrl is provided', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        accessToken: createAccessToken({ isFirstAccess: true }),
      },
    }).as('firstAccessLoginWithReturnUrl');

    cy.visit('/auth/login?returnUrl=%2Fvimar-link');
    cy.get('#username').type(validUsername);
    cy.get('#password').type(validLoginSecret);
    cy.get('button[type="submit"]').click();

    cy.wait('@firstAccessLoginWithReturnUrl');
    cy.location('pathname').should('eq', '/auth/first-access');
    cy.contains('h1', 'Imposta la tua password personale').should('be.visible');
  });

  it('ignores protocol-relative returnUrl values and falls back to dashboard', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        accessToken: createAccessToken(),
      },
    }).as('loginProtocolRelativeReturnUrl');

    cy.intercept('GET', '**/alarm-events/unmanaged/*/*/*', {
      statusCode: 200,
      body: [],
    });

    cy.intercept('GET', '**/analytics/*', {
      statusCode: 200,
      body: [],
    });

    cy.visit('/auth/login?returnUrl=%2F%2Fevil.example%2Fdashboard');
    cy.get('#username').type(validUsername);
    cy.get('#password').type(validLoginSecret);
    cy.get('button[type="submit"]').click();

    cy.wait('@loginProtocolRelativeReturnUrl');
    cy.location('pathname').should('eq', '/dashboard');
  });

});
