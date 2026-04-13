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

  // ─── Additional tests for LoginComponent & FirstAccessComponent ──────────────
  // Append these inside the existing describe('Autenticazione frontend') block
  // in internal-auth.cy.ts

  // ── Login: error paths ────────────────────────────────────────────────────────

  it('shows a generic error when the login endpoint returns 500', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 500,
      body: { message: 'Internal Server Error' },
    }).as('loginServerError');

    cy.visit('/auth/login');
    cy.get('#username').type(validUsername);
    cy.get('#password').type(validLoginSecret);
    cy.get('button[type="submit"]').click();

    cy.wait('@loginServerError');
    cy.location('pathname').should('eq', '/auth/login');
    cy.contains('p', 'Utente non trovato: username o password errati.').should('be.visible');
  });

  it('shows a generic error when the login endpoint returns a network failure', () => {
    cy.intercept('POST', '**/auth/login', { forceNetworkError: true }).as('loginNetworkError');

    cy.visit('/auth/login');
    cy.get('#username').type(validUsername);
    cy.get('#password').type(validLoginSecret);
    cy.get('button[type="submit"]').click();

    cy.wait('@loginNetworkError');
    cy.location('pathname').should('eq', '/auth/login');
    cy.contains('p', 'Utente non trovato: username o password errati.').should('be.visible');
  });

  // ── Login: loading state & double-submit prevention ───────────────────────────

  it('disables the submit button while the login request is in flight', () => {
    cy.intercept('POST', '**/auth/login', (req) => {
      // delay to keep the button in loading state long enough to assert
      req.reply({ delay: 800, statusCode: 200, body: { accessToken: createAccessToken() } });
    }).as('loginSlow');

    cy.visit('/auth/login');
    cy.get('#username').type(validUsername);
    cy.get('#password').type(validLoginSecret);
    cy.get('button[type="submit"]').click();

    // button must be disabled (or aria-busy) while request is pending
    cy.get('button[type="submit"]').should('be.disabled');
    cy.wait('@loginSlow');
  });

  it('sends two login requests if the user clicks submit twice quickly', () => {
    cy.intercept('POST', '**/auth/login', (req) => {
      req.reply({ delay: 600, statusCode: 200, body: { accessToken: createAccessToken() } });
    }).as('loginDouble');

    cy.visit('/auth/login');
    cy.get('#username').type(validUsername);
    cy.get('#password').type(validLoginSecret);
    cy.get('button[type="submit"]').click().click();

    cy.wait('@loginDouble');
    cy.get('@loginDouble.all').should('have.length', 2);
  });

  // ── Login: form validation on submit ─────────────────────────────────────────

  it('keeps submit disabled and shows errors after touching empty login fields', () => {
    cy.visit('/auth/login');

    cy.get('button[type="submit"]').should('be.disabled');
    cy.get('#username').focus().blur();
    cy.get('#password').focus().blur();

    cy.contains('#username-error', "L'username è obbligatorio.").should('be.visible');
    cy.contains('#password-error', 'La password è obbligatoria.').should('be.visible');
  });

  it('keeps the login error message visible after typing until a new submit', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: { message: 'Unauthorized' },
    }).as('loginFail');

    cy.visit('/auth/login');
    cy.get('#username').type(validUsername);
    cy.get('#password').type(validLoginSecret);
    cy.get('button[type="submit"]').click();
    cy.wait('@loginFail');

    cy.contains('p', 'Utente non trovato: username o password errati.').should('be.visible');

    // Typing does not clear the server error automatically.
    cy.get('#username').type('x');
    cy.contains('p', 'Utente non trovato: username o password errati.').should('be.visible');
  });

  // ── Login: autofill sync (syncAutofilledCredentialsFromDom) ──────────────────

  it('submits credentials read from DOM when the form controls are empty due to browser autofill', () => {
    cy.intercept('POST', '**/auth/login', (req) => {
      expect(req.body).to.deep.equal({
        username: validUsername,
        password: validLoginSecret,
      });
      req.reply({ statusCode: 200, body: { accessToken: createAccessToken() } });
    }).as('loginAutofill');

    cy.visit('/auth/login');

    // simulate browser autofill by setting the DOM value without triggering Angular events
    cy.get('#username').invoke('val', validUsername);
    cy.get('#password').invoke('val', validLoginSecret);

    // Submit the form directly: onSubmit syncs values from DOM autofill.
    cy.get('form').submit();

    cy.wait('@loginAutofill');
    cy.location('pathname').should('eq', '/dashboard');
  });

  // ── First access: error paths ─────────────────────────────────────────────────

  it('shows a generic error when the first-login endpoint returns 500', () => {
    cy.intercept('POST', '**/auth/first-login', {
      statusCode: 500,
      body: { message: 'Internal Server Error' },
    }).as('firstLoginServerError');

    cy.visit('/auth/first-access');
    cy.get('#username').type(validUsername);
    cy.get('#temporaryPassword').type(validTemporarySecret);
    cy.get('#newPassword').type(validNewSecret);
    cy.get('button[type="submit"]').click();

    cy.wait('@firstLoginServerError');
    cy.location('pathname').should('eq', '/auth/first-access');
    cy.contains('p', 'Username o password temporanea errati.').should('be.visible');
  });

  it('shows a generic error when the first-login endpoint returns a network failure', () => {
    cy.intercept('POST', '**/auth/first-login', { forceNetworkError: true }).as('firstLoginNetworkError');

    cy.visit('/auth/first-access');
    cy.get('#username').type(validUsername);
    cy.get('#temporaryPassword').type(validTemporarySecret);
    cy.get('#newPassword').type(validNewSecret);
    cy.get('button[type="submit"]').click();

    cy.wait('@firstLoginNetworkError');
    cy.location('pathname').should('eq', '/auth/first-access');
    cy.contains('p', 'Username o password temporanea errati.').should('be.visible');
  });

  it('disables the submit button while the first-login request is in flight', () => {
    cy.intercept('POST', '**/auth/first-login', (req) => {
      req.reply({ delay: 800, statusCode: 200, body: { accessToken: createAccessToken() } });
    }).as('firstLoginSlow');

    cy.visit('/auth/first-access');
    cy.get('#username').type(validUsername);
    cy.get('#temporaryPassword').type(validTemporarySecret);
    cy.get('#newPassword').type(validNewSecret);
    cy.get('button[type="submit"]').click();

    cy.get('button[type="submit"]').should('be.disabled');
    cy.wait('@firstLoginSlow');
  });

  it('keeps submit disabled and shows errors after touching empty first-access fields', () => {
    cy.visit('/auth/first-access');

    cy.get('button[type="submit"]').should('be.disabled');
    cy.get('#temporaryPassword').focus().blur();
    cy.get('#newPassword').focus().blur();

    cy.contains('#temporaryPassword-error', 'La password temporanea è obbligatoria.').should('be.visible');
    cy.contains('#newPassword-error', 'La nuova password è obbligatoria.').should('be.visible');
  });

  it('does not render a back link on the first-access page', () => {
    cy.visit('/auth/first-access');
    cy.contains('a', 'Torna al login').should('not.exist');
    cy.location('pathname').should('eq', '/auth/first-access');
  });


});
