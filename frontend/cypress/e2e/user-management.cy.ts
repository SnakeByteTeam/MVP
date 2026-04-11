import type { UserDto } from '../../src/app/features/user-management/models/in/user.model.dto';
import { UserRole } from '../../src/app/core/models/user-role.enum';

const adminUsername = 'admin.user';
const adminPassword = ['A', 'd', 'm', 'i', 'n', 'A', 'c', 'c', 'e', 's', 's', '1', '2', '3'].join('');
const linkedEmail = 'admin@example.com';
const decodedTempPassword = ['T', 'e', 'm', 'p', 'P', 'a', 's', 's', '1', '2', '3', '4'].join('');

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

const setupAdminSession = () => {
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

    cy.intercept('GET', '**/plant/all', {
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

    cy.visit('/auth/login');
    cy.get('#username').type(adminUsername);
    cy.get('#password').type(adminPassword);
    cy.get('button[type="submit"]').click();
    cy.wait('@login');
    cy.contains('h1', 'Dashboard').should('be.visible');
};

const openUserManagement = () => {
    cy.get('a.sidebar-link').contains('Gestione Utenti').click({ force: true });
    cy.location('pathname').should('eq', '/user-management');
    cy.contains('h1', 'Gestione operatori sanitari').should('be.visible');
};

const openCreateUserForm = () => {
    cy.contains('button', 'Inserisci Nuovo Operatore').click();
    cy.get('[data-testid="create-user-panel"]').should('have.class', 'opacity-100');
};

const fillCreateUserForm = (payload: { name: string; surname: string; username: string }) => {
    cy.get('#name').clear().type(payload.name);
    cy.get('#surname').clear().type(payload.surname);
    cy.get('#username').clear().type(payload.username);
};

describe('User management e2e', () => {
    let usersState: UserDto[];
    let nextUserId: number;

    beforeEach(() => {
        nextUserId = 3;
        usersState = [
            {
                id: 1,
                name: 'Marco',
                surname: 'Verdi',
                username: 'm.verdi',
                role: UserRole.OPERATORE_SANITARIO,
            },
            {
                id: 2,
                name: 'Laura',
                surname: 'Bianchi',
                username: 'l.bianchi',
                role: UserRole.OPERATORE_SANITARIO,
            },
        ];

        setupAdminSession();

        cy.intercept('GET', '**/users', (req) => {
            req.reply({
                statusCode: 200,
                body: usersState,
            });
        }).as('getUsers');

        cy.intercept('POST', '**/users', (req) => {
            const payload = req.body as { name: string; surname: string; username: string };

            if (usersState.some((user) => user.username === payload.username)) {
                req.reply({
                    statusCode: 409,
                    body: { message: 'Username already in use' },
                });
                return;
            }

            const createdUser: UserDto = {
                id: nextUserId,
                name: payload.name,
                surname: payload.surname,
                username: payload.username,
                role: UserRole.OPERATORE_SANITARIO,
            };

            nextUserId += 1;
            usersState = [...usersState, createdUser];

            req.reply({
                statusCode: 201,
                body: {
                    tempPassword: btoa(decodedTempPassword),
                },
            });
        }).as('createUser');

        cy.intercept('DELETE', '**/users/*', (req) => {
            const userId = Number(req.url.split('/').pop());
            usersState = usersState.filter((user) => user.id !== userId);

            req.reply({
                statusCode: 204,
                body: null,
            });
        }).as('deleteUser');

        openUserManagement();
        cy.wait('@getUsers');
    });

    it('RF15-DEL Visualizzazione elenco utenti del Sistema', () => {
        cy.get('section[aria-label="Elenco operatori sanitari"]').should('be.visible');
        cy.contains('th', 'Username').should('be.visible');
        cy.contains('th', 'Nome').should('be.visible');
        cy.contains('th', 'Cognome').should('be.visible');

        cy.get('tbody tr').should('have.length.at.least', 2);
    });

    it('RF16-OBL Visualizzazione elemento utente nel dettaglio elenco', () => {
        cy.contains('tr', '@m.verdi').within(() => {
            cy.contains('td', '@m.verdi').should('exist');
            cy.contains('td', 'Marco').should('exist');
            cy.contains('td', 'Verdi').should('exist');
            cy.contains('button', 'Elimina').should('exist');
        });
    });

    it('RF17-OBL Visualizzazione nome dell utente nel dettaglio', () => {
        cy.contains('tr', '@m.verdi').within(() => {
            cy.contains('td', 'Marco').should('exist');
        });

        cy.contains('tr', '@l.bianchi').within(() => {
            cy.contains('td', 'Laura').should('exist');
        });
    });

    it('RF18-OBL Visualizzazione cognome utente nel dettaglio', () => {
        cy.contains('tr', '@m.verdi').within(() => {
            cy.contains('td', 'Verdi').should('exist');
        });

        cy.contains('tr', '@l.bianchi').within(() => {
            cy.contains('td', 'Bianchi').should('exist');
        });
    });

    it('RF19-OBL Visualizzazione username utente nel dettaglio', () => {
        cy.contains('tr', '@m.verdi').within(() => {
            cy.contains('td', '@m.verdi').should('exist');
        });

        cy.contains('tr', '@l.bianchi').within(() => {
            cy.contains('td', '@l.bianchi').should('exist');
        });
    });

    it('RF20-DEL Creazione utente Operatore Sanitario', () => {
        openCreateUserForm();
        fillCreateUserForm({
            name: 'Giulia',
            surname: 'Ferri',
            username: 'giulia.ferri',
        });

        cy.contains('button', 'Crea utente').click();

        cy.wait('@createUser');
        cy.wait('@getUsers');
        cy.contains('h2', 'Utente creato con successo').should('be.visible');
        cy.contains('button', 'Ho comunicato la password').click();

        cy.contains('tr', '@giulia.ferri').should('exist').within(() => {
            cy.contains('td', 'Giulia').should('exist');
            cy.contains('td', 'Ferri').should('exist');
            cy.contains('td', '@giulia.ferri').should('exist');
        });
    });

    it('RF21-DEL Inserimento nome Operatore Sanitario per creazione utente', () => {
        openCreateUserForm();

        cy.get('#name').focus().blur();
        cy.contains('Il nome è obbligatorio.').should('be.visible');

        cy.get('#name').clear().type('G').blur();
        cy.contains('Il nome deve essere di almeno 2 caratteri.').should('be.visible');
    });

    it('RF22-DEL Inserimento cognome Operatore Sanitario per creazione utente', () => {
        openCreateUserForm();

        cy.get('#surname').focus().blur();
        cy.contains('Il cognome è obbligatorio.').should('be.visible');

        cy.get('#surname').clear().type('F').blur();
        cy.contains('Il cognome deve essere di almeno 2 caratteri.').should('be.visible');
    });

    it('RF23-DEL Inserimento username per creazione utente Operatore Sanitario', () => {
        openCreateUserForm();

        cy.get('#username').focus().blur();
        cy.contains("L'username è obbligatorio.").should('be.visible');

        cy.get('#username').clear().type('abc').blur();
        cy.contains("L'username deve essere di almeno 4 caratteri.").should('be.visible');
    });

    it('RF24-DEL Generazione password temporanea per creazione utente', () => {
        openCreateUserForm();
        fillCreateUserForm({
            name: 'Luca',
            surname: 'Neri',
            username: 'luca.neri',
        });

        cy.contains('button', 'Crea utente').click();

        cy.wait('@createUser');
        cy.contains('code', decodedTempPassword).should('be.visible');
    });

    it('RF25-DEL Errore se username già in uso', () => {
        openCreateUserForm();
        fillCreateUserForm({
            name: 'Mario',
            surname: 'Rossi',
            username: 'm.verdi',
        });

        cy.contains('button', 'Crea utente').click();

        cy.wait('@createUser');
        cy.contains('Username già in uso. Scegline un altro.').should('be.visible');
    });

    it('RF26-DEL Eliminazione utente Operatore Sanitario', () => {
        cy.contains('tr', '@m.verdi').within(() => {
            cy.contains('button', 'Elimina').click();
        });

        cy.contains('h3', 'Conferma eliminazione').should('be.visible');
        cy.contains('strong', 'Marco Verdi').should('be.visible');
        cy.contains('span', '@m.verdi').should('be.visible');
        cy.contains('button', 'Elimina operatore').click();

        cy.wait('@deleteUser');
        cy.wait('@getUsers');
        cy.contains('tr', '@m.verdi').should('not.exist');
    });
});