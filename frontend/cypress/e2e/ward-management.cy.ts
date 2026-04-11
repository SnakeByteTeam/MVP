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

const pickSelectOptionByText = (selector: string, optionText: string) => {
    cy.get(`${selector} option`).then(($options) => {
        const target = Array.from($options).find((option) =>
            option.textContent?.trim().includes(optionText),
        );

        expect(target, `Option containing "${optionText}" should exist`).to.exist;
        cy.get(selector).select((target as HTMLOptionElement).value, { force: true });
    });
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
            const payload = req.body as { name: string };

            if (payload.name === 'Reparto Chirurgia') {
                req.reply({
                    statusCode: 409,
                    body: { message: 'Ward name already in use' },
                });
                return;
            }

            const createdWard = {
                id: nextWardId,
                name: payload.name,
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
            const payload = req.body as { name: string };

            const wardId = Number(req.url.split('/').pop());
            wardsState = wardsState.map((ward) =>
                ward.id === wardId ? { ...ward, name: payload.name } : ward,
            );

            req.reply({
                statusCode: 200,
                body: {
                    id: wardId,
                    name: payload.name,
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
            const payload = req.body as { wardId: number; userId: number };
            const selectedUser = usersCatalog.find((user) => user.id === payload.userId);

            expect(selectedUser, 'Selected user must exist in users catalog').to.exist;

            wardDetails[payload.wardId] ??= { operators: [], plants: [] };
            wardDetails[payload.wardId].operators = [{ id: payload.userId, username: selectedUser!.username }];

            req.reply({
                statusCode: 204,
                body: null,
            });
        }).as('assignOperator');

        cy.intercept('DELETE', '**/wards-users-relationships/*/*', (req) => {
            const urlParts = req.url.split('/');
            const userId = Number(urlParts.pop());
            const wardId = Number(urlParts.pop());

            wardDetails[wardId] ??= { operators: [], plants: [] };
            wardDetails[wardId].operators = wardDetails[wardId].operators.filter((operator) => operator.id !== userId);

            req.reply({
                statusCode: 204,
                body: null,
            });
        }).as('removeOperator');

        cy.intercept('POST', '**/wards-plants-relationships', (req) => {
            const payload = req.body as { wardId: number; plantId: string };
            const selectedPlant = plantsCatalog.find((plant) => plant.id === payload.plantId);

            expect(selectedPlant, 'Selected plant must exist in plants catalog').to.exist;

            wardDetails[payload.wardId] ??= { operators: [], plants: [] };
            wardDetails[payload.wardId].plants = [{ id: payload.plantId, name: selectedPlant!.name }];

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

    it('RF27-OBL Visualizzazione di tutti i reparti del Sistema', () => {
        openWardManagement();
        cy.wait('@getWards');

        cy.get('aside[aria-label="Elenco reparti"]').contains('Reparto Chirurgia').should('be.visible');
        cy.get('aside[aria-label="Elenco reparti"]').contains('Reparto Medicina').should('be.visible');
    });

    it('RF28-OBL Visualizzazione reparto del Sistema nel dettaglio', () => {
        openWardManagement();
        cy.wait('@getWards');

        cy.get('aside[aria-label="Elenco reparti"]').contains('Reparto Chirurgia').click();

        cy.get('section[aria-label="Dettagli reparto e appartamenti"]').should('be.visible');
        cy.get('section[aria-label="Operatori assegnati"]').should('be.visible');
    });

    it('RF29-OBL Visualizzazione nome reparto nel dettaglio', () => {
        openWardManagement();
        cy.wait('@getWards');

        cy.get('aside[aria-label="Elenco reparti"]').contains('Reparto Chirurgia').click();
        cy.get('section[aria-label="Dettagli reparto e appartamenti"]').find('h2').should('contain', 'Reparto Chirurgia');
    });

    it('RF30-OBL Creazione nuovo reparto nel Sistema', () => {
        openWardManagement();
        cy.wait('@getWards');

        cy.get('button[aria-label="Nuovo reparto"]').click();
        cy.contains('h2', 'Crea reparto').should('be.visible');

        cy.get('#ward-name').clear().type('Reparto Riabilitazione');
        cy.contains('button', 'Crea reparto').click();

        cy.wait('@createWard');
        cy.get('aside[aria-label="Elenco reparti"]').contains('Reparto Riabilitazione').should('be.visible');
    });

    it('RF31-OBL Inserimento nome nuovo reparto per creazione', () => {
        openWardManagement();
        cy.wait('@getWards');

        cy.get('button[aria-label="Nuovo reparto"]').click();
        cy.contains('h2', 'Crea reparto').should('be.visible');

        cy.get('#ward-name').focus().blur();
        cy.contains('Il nome reparto è obbligatorio.').should('be.visible');
    });

    it('RF32-OBL Errore se nome nuovo reparto già in uso', () => {
        openWardManagement();
        cy.wait('@getWards');

        cy.get('button[aria-label="Nuovo reparto"]').click();
        cy.contains('h2', 'Crea reparto').should('be.visible');

        cy.get('#ward-name').clear().type('Reparto Chirurgia');
        cy.contains('button', 'Crea reparto').click();

        cy.wait('@createWard');
        cy.contains('[role="alert"]', 'Esiste gia un reparto con questo nome.').should('be.visible');
    });

    it('RF33-OBL Modifica nome reparto del Sistema', () => {
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

    it('RF34-OBL Eliminazione reparto del Sistema', () => {
        openWardManagement();
        cy.wait('@getWards');

        cy.get('aside[aria-label="Elenco reparti"]').contains('Reparto Medicina').click();
        cy.get('button[aria-label="Elimina reparto"]').click();
        cy.contains('p', 'Confermi l\'eliminazione del reparto?').should('be.visible');
        cy.contains('button', 'Conferma').click();

        cy.wait('@deleteWard');
        cy.get('aside[aria-label="Elenco reparti"]').contains('Reparto Medicina').should('not.exist');
    });

    it('RF35-OBL Assegnazione reparto a utente Operatore Sanitario', () => {
        openWardManagement();
        cy.wait('@getWards');

        cy.get('aside[aria-label="Elenco reparti"]').contains('Reparto Medicina').click();
        cy.get('button[aria-label="Aggiungi operatore"]').click();
        cy.contains('h2', 'Assegna operatore sanitario').should('be.visible');

        cy.get('dialog[aria-labelledby="assign-operator-title"]').should('be.visible').within(() => {
            cy.wait('@getUsers');
            pickSelectOptionByText('#operator-id', 'l.bianchi');
            cy.contains('button', 'Assegna').click();
        });

        cy.wait('@assignOperator').its('request.body').should('deep.equal', { wardId: 2, userId: 12 });
        cy.wait('@getWards');
        cy.get('section[aria-label="Operatori assegnati"]').should('contain', 'l.bianchi');
    });

    it('RF36-OBL Selezione utente Operatore Sanitario per assegnazione reparto', () => {
        openWardManagement();
        cy.wait('@getWards');

        cy.get('aside[aria-label="Elenco reparti"]').contains('Reparto Medicina').click();
        cy.get('button[aria-label="Aggiungi operatore"]').click();
        cy.contains('h2', 'Assegna operatore sanitario').should('be.visible');

        cy.get('dialog[aria-labelledby="assign-operator-title"]').should('be.visible').within(() => {
            cy.contains('button', 'Assegna').should('be.disabled');

            cy.wait('@getUsers');
            pickSelectOptionByText('#operator-id', 'l.bianchi');
            cy.contains('button', 'Assegna').should('not.be.disabled');
        });
    });

    it('RF37-OBL Selezione reparto per assegnazione reparto a utente Operatore Sanitario', () => {
        openWardManagement();
        cy.wait('@getWards');

        cy.get('aside[aria-label="Elenco reparti"]').contains('Reparto Chirurgia').click();
        cy.get('button[aria-label="Aggiungi operatore"]').click();
        cy.contains('h2', 'Assegna operatore sanitario').should('be.visible');
        cy.contains('Reparto:').should('contain', '1');

        cy.get('dialog[aria-labelledby="assign-operator-title"]').should('be.visible').within(() => {
            cy.wait('@getUsers');
            pickSelectOptionByText('#operator-id', 'l.bianchi');
            cy.contains('button', 'Assegna').click();
        });

        cy.wait('@assignOperator').its('request.body').should('deep.equal', { wardId: 1, userId: 12 });
    });

    it('RF38-OBL Eliminazione assegnazione utente Operatore Sanitario-reparto', () => {
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

    it('RF39-OBL Assegnazione reparto a appartamento', () => {
        openWardManagement();
        cy.wait('@getWards');

        cy.get('aside[aria-label="Elenco reparti"]').contains('Reparto Medicina').click();
        cy.get('button[aria-label="Assegna appartamento"]').click();
        cy.contains('h2', 'Assegna appartamento').should('be.visible');

        cy.get('dialog[aria-labelledby="assign-apartment-title"]').should('be.visible').within(() => {
            cy.wait('@getPlantsCatalog');
            pickSelectOptionByText('#apartment-id', 'Appartamento 301');
            cy.contains('button', 'Assegna').click();
        });

        cy.wait('@assignPlant').its('request.body').should('deep.equal', { wardId: 2, plantId: '301' });
        cy.wait('@getWards');
        cy.get('section[aria-label="Dettagli reparto e appartamenti"]').should('contain', 'Appartamento 301');
    });

    it('RF40-OBL Selezione appartamento per assegnazione reparto a appartamento', () => {
        openWardManagement();
        cy.wait('@getWards');

        cy.get('aside[aria-label="Elenco reparti"]').contains('Reparto Medicina').click();
        cy.get('button[aria-label="Assegna appartamento"]').click();
        cy.contains('h2', 'Assegna appartamento').should('be.visible');

        cy.get('dialog[aria-labelledby="assign-apartment-title"]').should('be.visible').within(() => {
            cy.contains('button', 'Assegna').should('be.disabled');

            cy.wait('@getPlantsCatalog');
            pickSelectOptionByText('#apartment-id', 'Appartamento 301');
            cy.contains('button', 'Assegna').should('not.be.disabled');
        });
    });
});