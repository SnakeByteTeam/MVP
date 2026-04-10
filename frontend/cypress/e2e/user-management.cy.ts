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

describe('User management e2e', () => {
    let usersState: UserDto[];

    beforeEach(() => {
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
            expect(req.body).to.deep.equal({
                name: 'Giulia',
                surname: 'Ferri',
                username: 'giulia.ferri',
            });

            usersState = [
                ...usersState,
                {
                    id: 3,
                    name: 'Giulia',
                    surname: 'Ferri',
                    username: 'giulia.ferri',
                    role: UserRole.OPERATORE_SANITARIO,
                },
            ];

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

    it('UC6 visualizza elenco utenti con nome, cognome e username', () => {
        cy.contains('th', 'Username').should('be.visible');
        cy.contains('th', 'Nome').should('be.visible');
        cy.contains('th', 'Cognome').should('be.visible');

        cy.contains('td', '@m.verdi').should('be.visible');
        cy.contains('td', 'Marco').should('be.visible');
        cy.contains('td', 'Verdi').should('be.visible');
        cy.contains('td', '@l.bianchi').should('be.visible');
        cy.contains('td', 'Laura').should('be.visible');
        cy.contains('td', 'Bianchi').should('be.visible');
    });

    it('UC7 crea un nuovo operatore sanitario e mostra la password temporanea', () => {
        cy.contains('button', 'Inserisci Nuovo Operatore').click();

        cy.get('#name').focus().blur();
        cy.contains('Il nome è obbligatorio.').should('be.visible');

        cy.get('#name').clear().type('G').blur();
        cy.contains('Il nome deve essere di almeno 2 caratteri.').should('be.visible');

        cy.get('#surname').focus().blur();
        cy.contains('Il cognome è obbligatorio.').should('be.visible');

        cy.get('#surname').clear().type('F').blur();
        cy.contains('Il cognome deve essere di almeno 2 caratteri.').should('be.visible');

        cy.get('#username').focus().blur();
        cy.contains("L'username è obbligatorio.").should('be.visible');

        cy.get('#username').clear().type('abc').blur();
        cy.contains("L'username deve essere di almeno 4 caratteri.").should('be.visible');

        cy.get('#name').clear().type('Giulia');
        cy.get('#surname').clear().type('Ferri');
        cy.get('#username').clear().type('giulia.ferri');

        cy.contains('button', 'Crea utente').click();

        cy.wait('@createUser');
        cy.wait('@getUsers');
        cy.contains('Utente creato con successo').should('be.visible');
        cy.contains('code', decodedTempPassword).should('be.visible');
        cy.contains('Giulia Ferri').should('be.visible');
        cy.contains('button', 'Ho comunicato la password').click();

        cy.get('table').should('contain', '@giulia.ferri');
        cy.get('table').should('contain', 'Giulia');
        cy.get('table').should('contain', 'Ferri');
    });

    it('UC8 elimina un operatore sanitario', () => {
        cy.contains('tr', '@m.verdi').within(() => {
            cy.contains('button', 'Elimina').click();
        });

        cy.contains('dialog', 'Conferma eliminazione').should('be.visible');
        cy.contains('strong', 'Marco Verdi').should('be.visible');
        cy.contains('span', '@m.verdi').should('be.visible');
        cy.contains('button', 'Elimina operatore').click();

        cy.wait('@deleteUser');
        cy.wait('@getUsers');
        cy.contains('td', '@m.verdi').should('not.exist');
    });
});