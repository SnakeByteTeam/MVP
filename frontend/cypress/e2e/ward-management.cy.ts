import type { User } from '../../src/app/core/models/user.model';
import { UserRole } from '../../src/app/core/models/user-role.enum';
import type { Plant } from '../../src/app/features/ward-management/models/plant.model';
import type { WardSummaryDto, WardUserDto, WardPlantDto } from '../../src/app/features/ward-management/models/ward-api.dto';

const adminUsername = 'admin.user';
const adminPassword = ['A', 'd', 'm', 'i', 'n', 'A', 'c', 'c', 'e', 's', 's', '1', '2', '3'].join('');
const linkedEmail = 'admin@example.com';

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

const openWardManagement = () => {
    cy.get('a.sidebar-link').contains('Gestione Reparti').click({ force: true });
    cy.location('pathname').should('eq', '/ward-management');
    cy.contains('h1', 'Gestione reparti').should('be.visible');
};

describe('Ward management e2e', () => {
    let wardsState: WardSummaryDto[];
    let wardDetails: Record<number, { operators: WardUserDto[]; plants: WardPlantDto[] }>;
    let usersCatalog: User[];
    let plantsCatalog: Plant[];
    let nextWardId: number;

    const replyWards = (req: any) => {
        req.reply({
            statusCode: 200,
            body: wardsState,
        });
    };

    const replyWardUsers = (req: any) => {
        const wardId = Number(req.url.split('/').pop());
        req.reply({
            statusCode: 200,
            body: wardDetails[wardId]?.operators ?? [],
        });
    };

    const replyWardPlants = (req: any) => {
        const wardId = Number(req.url.split('/').pop());
        req.reply({
            statusCode: 200,
            body: wardDetails[wardId]?.plants ?? [],
        });
    };

    const hydrateWardDetailsFromSummary = (summary: WardSummaryDto) => {
        wardDetails[summary.id] ??= { operators: [], plants: [] };
    };

    beforeEach(() => {
        nextWardId = 3;
        wardsState = [
            { id: 1, name: 'Reparto Chirurgia' },
            { id: 2, name: 'Reparto Medicina' },
        ];
        wardDetails = {
            1: {
                operators: [
                    { id: 11, username: 'm.verdi' },
                ],
                plants: [
                    { id: '101', name: 'Appartamento 101' },
                ],
            },
            2: {
                operators: [],
                plants: [],
            },
        };
        usersCatalog = [
            { id: 11, firstName: 'Marco', lastName: 'Verdi', username: 'm.verdi', role: UserRole.OPERATORE_SANITARIO },
            { id: 12, firstName: 'Laura', lastName: 'Bianchi', username: 'l.bianchi', role: UserRole.OPERATORE_SANITARIO },
            { id: 13, firstName: 'Paolo', lastName: 'Rossi', username: 'p.rossi', role: UserRole.OPERATORE_SANITARIO },
        ];
        plantsCatalog = [
            { id: '101', name: 'Appartamento 101' },
            { id: '201', name: 'Appartamento 201' },
            { id: '301', name: 'Appartamento 301' },
            { id: '302', name: 'Appartamento 302' },
        ];

        setupAdminSession();

        cy.viewport(1440, 1000);

        cy.intercept('GET', '**/wards', (req) => replyWards(req)).as('getWards');
        cy.intercept('GET', '**/wards-users-relationships/*', (req) => replyWardUsers(req));
        cy.intercept('GET', '**/wards-plants-relationships/*', (req) => replyWardPlants(req));
        cy.intercept('GET', '**/users', {
            statusCode: 200,
            body: usersCatalog,
        }).as('getUsers');
        cy.intercept('GET', '**/api/plant/all', {
            statusCode: 200,
            body: plantsCatalog,
        }).as('getPlantsCatalog');
        cy.intercept('POST', '**/wards', (req) => {
            expect(req.body).to.deep.equal({ name: 'Reparto Riabilitazione' });

            const createdWard = {
                id: nextWardId,
                name: 'Reparto Riabilitazione',
            };
            nextWardId += 1;
            wardsState = [...wardsState, createdWard];
            hydrateWardDetailsFromSummary(createdWard);

            req.reply({
                statusCode: 201,
                body: {
                    id: createdWard.id,
                    name: createdWard.name,
                    apartments: [],
                    operators: [],
                },
            });
        }).as('createWard');
        cy.intercept('PUT', '**/wards/*', (req) => {
            expect(req.body).to.deep.equal({ name: 'Reparto Riabilitazione Intensiva' });

            const wardId = Number(req.url.split('/').pop());
            wardsState = wardsState.map((ward) =>
                ward.id === wardId ? { ...ward, name: 'Reparto Riabilitazione Intensiva' } : ward,
            );

            req.reply({
                statusCode: 200,
                body: {
                    id: wardId,
                    name: 'Reparto Riabilitazione Intensiva',
                    apartments: wardDetails[wardId]?.plants ?? [],
                    operators: wardDetails[wardId]?.operators ?? [],
                },
            });
        }).as('updateWard');
        cy.intercept('DELETE', '**/wards/*', (req) => {
            const wardId = Number(req.url.split('/').pop());
            wardsState = wardsState.filter((ward) => ward.id !== wardId);
            delete wardDetails[wardId];

            req.reply({
                statusCode: 204,
                body: null,
            });
        }).as('deleteWard');

        cy.intercept('POST', '**/wards-users-relationships', (req) => {
            expect(req.body).to.deep.equal({ wardId: 2, userId: 12 });
            wardDetails[2].operators = [{ id: 12, username: 'l.bianchi' }];

            req.reply({
                statusCode: 204,
                body: null,
            });
        }).as('assignOperator');

        cy.intercept('DELETE', '**/wards-users-relationships/2/12', (req) => {
            wardDetails[2].operators = [];

            req.reply({
                statusCode: 204,
                body: null,
            });
        }).as('removeOperator');

        cy.intercept('POST', '**/wards-plants-relationships', (req) => {
            expect(req.body).to.deep.equal({ wardId: 2, plantId: '301' });
            wardDetails[2].plants = [{ id: '301', name: 'Appartamento 301' }];

            req.reply({
                statusCode: 204,
                body: null,
            });
        }).as('assignPlant');

        cy.intercept('DELETE', '**/wards-plants-relationships/301', (req) => {
            wardDetails[2].plants = [];

            req.reply({
                statusCode: 204,
                body: null,
            });
        }).as('removePlant');

    });

    it('UC9 visualizza elenco reparti e appartamenti', () => {
        openWardManagement();
        cy.wait('@getWards');

        cy.get('aside[aria-label="Elenco reparti"]').contains('Reparto Chirurgia').should('be.visible');
        cy.get('aside[aria-label="Elenco reparti"]').contains('Reparto Medicina').should('be.visible');
        cy.get('aside[aria-label="Elenco reparti"]').contains('Reparto Chirurgia').click();
        cy.get('section[aria-label="Dettagli reparto e appartamenti"]').should('contain', 'Appartamento 101');
        cy.get('section[aria-label="Operatori assegnati"]').should('contain', 'm.verdi');
    });

    it('UC10 crea reparto', () => {
        openWardManagement();
        cy.wait('@getWards');

        cy.get('button[aria-label="Nuovo reparto"]').click();
        cy.contains('h2', 'Crea reparto').should('be.visible');

        cy.get('#ward-name').focus().blur();
        cy.contains('Il nome reparto è obbligatorio.').should('be.visible');

        cy.get('#ward-name').focus();
        cy.get('#ward-name').invoke('val', 'A'.repeat(101)).trigger('input');
        cy.get('#ward-name').blur();
        cy.contains('Il nome non può superare 100 caratteri.').should('be.visible');

        cy.get('#ward-name').clear().type('Reparto Riabilitazione');
        cy.contains('button', 'Crea reparto').click();

        cy.wait('@createWard');
        cy.get('aside[aria-label="Elenco reparti"]').contains('Reparto Riabilitazione').should('be.visible');
    });

    it('UC11 modifica nome reparto', () => {
        openWardManagement();
        cy.wait('@getWards');

        cy.get('aside[aria-label="Elenco reparti"]').contains('Reparto Chirurgia').click();
        cy.get('button[aria-label="Modifica reparto"]').click();
        cy.contains('h2', 'Modifica reparto').should('be.visible');

        cy.get('#ward-name').clear().type('Reparto Riabilitazione Intensiva');
        cy.contains('button', 'Salva modifiche').click();

        cy.wait('@updateWard');
        cy.get('aside[aria-label="Elenco reparti"]').contains('Reparto Riabilitazione Intensiva').should('be.visible');
    });

    it('UC12 elimina reparto', () => {
        openWardManagement();
        cy.wait('@getWards');

        cy.get('aside[aria-label="Elenco reparti"]').contains('Reparto Medicina').click();
        cy.get('button[aria-label="Elimina reparto"]').click();
        cy.contains('p', 'Confermi l\'eliminazione del reparto?').should('be.visible');
        cy.contains('button', 'Conferma').click();

        cy.wait('@deleteWard');
        cy.get('aside[aria-label="Elenco reparti"]').contains('Reparto Medicina').should('not.exist');
    });

    it('UC13 assegna operatore al reparto', () => {
        openWardManagement();
        cy.wait('@getWards');

        cy.get('aside[aria-label="Elenco reparti"]').contains('Reparto Medicina').click();
        cy.get('button[aria-label="Aggiungi operatore"]').click();
        cy.contains('h2', 'Assegna operatore sanitario').should('be.visible');

        cy.wait('@getUsers');
        cy.get('#operator-id').then(($select) => {
            const selectElement = $select[0] as HTMLSelectElement;
            selectElement.value = selectElement.options[2].value;
            selectElement.dispatchEvent(new Event('change', { bubbles: true }));
        });
        cy.contains('button', 'Assegna').click();

        cy.wait('@assignOperator');
        cy.wait('@getWards');
        cy.get('section[aria-label="Operatori assegnati"]').should('contain', 'l.bianchi');
    });

    it('UC14 rimuove operatore dal reparto', () => {
        wardDetails[2].operators = [{ id: 12, username: 'l.bianchi' }];

        openWardManagement();
        cy.wait('@getWards');

        cy.get('aside[aria-label="Elenco reparti"]').contains('Reparto Medicina').click();
        cy.get('section[aria-label="Operatori assegnati"]').should('contain', 'l.bianchi');

        cy.get('button[aria-label^="Rimuovi operatore"]').click();
        cy.contains('p', 'Confermi la rimozione dell\'operatore dal reparto?').should('be.visible');
        cy.contains('button', 'Rimuovi').click();

        cy.wait('@removeOperator');
        cy.wait('@getWards');
        cy.get('section[aria-label="Operatori assegnati"]').should('not.contain', 'l.bianchi');
    });

    it('UC15 assegna appartamento al reparto', () => {
        openWardManagement();
        cy.wait('@getWards');

        cy.get('aside[aria-label="Elenco reparti"]').contains('Reparto Medicina').click();
        cy.get('button[aria-label="Assegna appartamento"]').click();
        cy.contains('h2', 'Assegna appartamento').should('be.visible');

        cy.wait('@getPlantsCatalog');
        cy.get('#apartment-id').then(($select) => {
            const selectElement = $select[0] as HTMLSelectElement;
            selectElement.value = selectElement.options[2].value;
            selectElement.dispatchEvent(new Event('change', { bubbles: true }));
        });
        cy.contains('button', 'Assegna').click();

        cy.wait('@assignPlant');
        cy.wait('@getWards');
        cy.get('section[aria-label="Dettagli reparto e appartamenti"]').should('contain', 'Appartamento 301');
    });

    it('UC16 rimuove appartamento dal reparto', () => {
        wardDetails[2].plants = [{ id: '301', name: 'Appartamento 301' }];

        openWardManagement();
        cy.wait('@getWards');

        cy.get('aside[aria-label="Elenco reparti"]').contains('Reparto Medicina').click();
        cy.get('button[aria-label^="Rimuovi appartamento"]').click();
        cy.contains('p', 'Confermi la rimozione dell\'appartamento dal reparto?').should('be.visible');
        cy.contains('button', 'Rimuovi').click();

        cy.wait('@removePlant');
        cy.wait('@getWards');
        cy.get('section[aria-label="Dettagli reparto e appartamenti"]').should('not.contain', 'Appartamento 301');
    });
});