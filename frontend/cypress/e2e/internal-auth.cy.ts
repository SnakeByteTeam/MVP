const validUsername = 'mario.rossi';
const validLoginSecret = ['L', 'o', 'g', 'i', 'n', 'A', 'c', 'c', 'e', 's', 's', '1', '2', '3'].join('');
const validTemporarySecret = ['T', 'e', 'm', 'p', 'A', 'c', 'c', 'e', 's', 's', '1', '2'].join('');
const validNewSecret = ['N', 'e', 'w', 'A', 'c', 'c', 'e', 's', 's', '1', '2', '3', '4'].join('');

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

  describe('Login standard', () => {
    beforeEach(() => {
      cy.visit('/auth/login');
    });

    it('UC1 Autenticazione: permette l accesso con credenziali valide', () => {
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

    it('UC1.1 Inserimento username: segnala username mancante o troppo corto', () => {
      cy.get('#password').type(validLoginSecret);
      cy.get('#username').focus().blur();
      cy.contains('#username-error', "L'username è obbligatorio.").should('be.visible');

      cy.get('#username').clear().type('ab').blur();
      cy.contains('#username-error', "L'username deve avere almeno 3 caratteri.").should('be.visible');
    });

    it('UC1.2 Inserimento password: segnala password mancante o troppo corta', () => {
      cy.get('#username').type(validUsername);
      cy.get('#password').focus().blur();
      cy.contains('#password-error', 'La password è obbligatoria.').should('be.visible');

      cy.get('#password').clear().type('shortpwd123').blur();
      cy.contains('#password-error', 'La password deve avere almeno 12 caratteri.').should('be.visible');
    });

    it('UC2 Autenticazione con cambio password: il login temporaneo apre il primo accesso', () => {
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

      cy.get('#username').type(validUsername);
      cy.get('#password').type(validTemporarySecret);
      cy.get('button[type="submit"]').click();

      cy.wait('@temporaryLogin');
      cy.location('pathname').should('eq', '/auth/first-access');
      cy.contains('h1', 'Imposta la tua password personale').should('be.visible');
    });
  });

  describe('Primo accesso', () => {
    beforeEach(() => {
      cy.visit('/auth/first-access');
    });

    it('UC2.1 Inserimento username: segnala username mancante o troppo corto', () => {
      cy.get('#temporaryPassword').type(validTemporarySecret);
      cy.get('#newPassword').type(validNewSecret);
      cy.get('#username').focus().blur();
      cy.contains('#username-error', "L'username è obbligatorio.").should('be.visible');

      cy.get('#username').clear().type('ab').blur();
      cy.contains('#username-error', "L'username deve avere almeno 3 caratteri.").should('be.visible');
    });

    it('UC2.2 Inserimento password temporanea: segnala password mancante o troppo corta', () => {
      cy.get('#username').type(validUsername);
      cy.get('#newPassword').type(validNewSecret);
      cy.get('#temporaryPassword').focus().blur();
      cy.contains('#temporaryPassword-error', 'La password temporanea è obbligatoria.').should('be.visible');

      cy.get('#temporaryPassword').clear().type('TempShort1').blur();
      cy.contains('#temporaryPassword-error', 'La password temporanea deve avere almeno 12 caratteri.').should('be.visible');
    });

    it('UC2.3 Inserimento nuova password: deve essere diversa dalla temporanea e completa il cambio', () => {
      cy.get('#username').type(validUsername);
      cy.get('#temporaryPassword').type(validTemporarySecret);
      cy.get('#newPassword').type(validTemporarySecret).blur();

      cy.contains('#newPassword-error', 'La nuova password deve essere diversa da quella temporanea.').should('be.visible');

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

      cy.get('#newPassword').clear().type(validNewSecret);
      cy.get('button[type="submit"]').click();

      cy.wait('@firstLogin');
      cy.location('pathname').should('eq', '/dashboard');
      cy.contains('h1', 'Dashboard').should('be.visible');
    });
  });
});
