const alarmConfigUsername = 'Mario Rossi';
const alarmConfigPassword = ['A', 'd', 'm', 'i', 'n', 'A', 'c', 'c', 'e', 's', 's', '1', '2', '3'].join('');
const alarmConfigLinkedEmail = 'admin@example.com';

const createAlarmConfigAccessToken = (): string => {
    const claims = {
        userId: '1',
        username: alarmConfigUsername,
        role: 'AMMINISTRATORE' as const,
        isFirstAccess: false,
    };

    const encodedPayload = btoa(JSON.stringify(claims))
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replaceAll('=', '');

    return `header.${encodedPayload}.signature`;
};

const openCreateRuleModal = () => {
    cy.get('button[aria-label="Crea nuova regola allarme"]').click();
    cy.get('#name').should('be.visible');
};

const fillCreateRuleForm = (ruleName = 'Regola presenza notturna') => {
    cy.get('#name').clear().type(ruleName);
    cy.get('#plantId').select('plant-1');
    cy.wait('@getPlantById');

    cy.get('#deviceId').select('dev-presence');
    cy.get('#datapointId').select('dp-presence-state');
    cy.get('#priority').select('4');
    cy.get('#thresholdOperator').select('uguale a');
    cy.get('#thresholdValue').clear().type('ON');
    cy.get('#armingTime').type('08:00');
    cy.get('#dearmingTime').type('20:00');
};

const createAlarmRuleFromModal = (ruleName = 'Regola presenza notturna') => {
    openCreateRuleModal();
    cy.wait('@getPlants');
    cy.wait('@getWards');

    fillCreateRuleForm(ruleName);
    cy.contains('button', 'CREA ALLARME').click();
    cy.wait('@createAlarmRule');
    cy.wait('@getAlarmRules');
    cy.contains('td', ruleName).should('exist');
};

const openEditRuleModal = (ruleName: string) => {
    cy.get(`button[aria-label="Modifica regola ${ruleName}"]`).click();
    cy.contains('h2', 'Modifica allarme').should('be.visible');
    cy.get('#priority').should('be.visible');
};

describe('Alarm configuration e2e', () => {
    let rulesState: Array<{
        id: string;
        name: string;
        thresholdOperator: string;
        thresholdValue: string;
        priority: number;
        armingTime: string;
        dearmingTime: string;
        isArmed: boolean;
        deviceId: string;
        datapointId?: string;
        position: string;
    }>;

    beforeEach(() => {
        rulesState = [];

        cy.viewport(1440, 1000);

        cy.intercept('POST', '**/auth/login', {
            statusCode: 200,
            body: {
                accessToken: createAlarmConfigAccessToken(),
            },
        }).as('login');

        cy.intercept('GET', '**/my-vimar/account', {
            statusCode: 200,
            body: {
                email: alarmConfigLinkedEmail,
                isLinked: true,
            },
        });

        cy.intercept('GET', '**/api/vimar-account', {
            statusCode: 200,
            body: {
                email: alarmConfigLinkedEmail,
                isLinked: true,
            },
        });

        cy.intercept('GET', '**/alarm-events/unmanaged/*/*/*', {
            statusCode: 200,
            body: [],
        });

        cy.intercept('GET', '**/alarm-rules', (req) => {
            req.reply({
                statusCode: 200,
                body: rulesState,
            });
        }).as('getAlarmRules');

        cy.intercept('GET', '**/plant/all', {
            statusCode: 200,
            body: [
                {
                    id: 'plant-1',
                    name: 'Appartamento Aurora',
                    rooms: [],
                },
            ],
        }).as('getPlants');

        cy.intercept('GET', '**/wards', {
            statusCode: 200,
            body: [],
        }).as('getWards');

        cy.intercept('GET', '**/plant?plantid=plant-1', {
            statusCode: 200,
            body: {
                id: 'plant-1',
                name: 'Appartamento Aurora',
                rooms: [
                    {
                        id: 'room-1',
                        name: 'Camera',
                        devices: [
                            {
                                id: 'dev-presence',
                                name: 'Sensore presenza camera',
                                type: 'PRESENCE_SENSOR_DEVICE',
                                datapoints: [
                                    {
                                        id: 'dp-presence-state',
                                        name: 'Stato presenza',
                                        readable: true,
                                        writable: true,
                                        valueType: 'enum',
                                        enum: ['ON', 'OFF'],
                                        sfeType: 'SFE_STATE_PRESENCE',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        }).as('getPlantById');

        cy.intercept('POST', '**/alarm-rules', (req) => {
            const payload = req.body as {
                name: string;
                deviceId: string;
                datapointId: string;
                plantId: string;
                priority: number;
                thresholdOperator: string;
                thresholdValue: string;
                armingTime: string;
                dearmingTime: string;
            };

            rulesState = [
                ...rulesState,
                {
                    id: 'rule-1',
                    name: payload.name,
                    thresholdOperator: payload.thresholdOperator,
                    thresholdValue: payload.thresholdValue,
                    priority: payload.priority,
                    armingTime: payload.armingTime,
                    dearmingTime: payload.dearmingTime,
                    isArmed: true,
                    deviceId: payload.deviceId,
                    datapointId: payload.datapointId,
                    position: 'Camera - Sensore presenza camera',
                },
            ];

            req.reply({
                statusCode: 201,
                body: rulesState.at(-1),
            });
        }).as('createAlarmRule');

        cy.intercept('PUT', '**/alarm-rules/*', (req) => {
            const payload = req.body as {
                name: string;
                priority: number;
                thresholdOperator: string;
                thresholdValue: string;
                armingTime: string;
                dearmingTime: string;
                isArmed: boolean;
            };

            const encodedRuleId = req.url.split('/').pop()?.split('?')[0] ?? '';
            const ruleId = decodeURIComponent(encodedRuleId);
            const currentRule = rulesState.find((rule) => rule.id === ruleId);

            if (!currentRule) {
                req.reply({
                    statusCode: 404,
                    body: null,
                });
                return;
            }

            const updatedRule = {
                ...currentRule,
                name: payload.name,
                priority: payload.priority,
                thresholdOperator: payload.thresholdOperator,
                thresholdValue: payload.thresholdValue,
                armingTime: payload.armingTime,
                dearmingTime: payload.dearmingTime,
                isArmed: payload.isArmed,
            };

            rulesState = rulesState.map((rule) =>
                rule.id === ruleId ? updatedRule : rule,
            );

            req.reply({
                statusCode: 200,
                body: updatedRule,
            });
        }).as('updateAlarmRule');

        cy.intercept('DELETE', '**/alarm-rules/*', (req) => {
            const encodedRuleId = req.url.split('/').pop()?.split('?')[0] ?? '';
            const ruleId = decodeURIComponent(encodedRuleId);

            rulesState = rulesState.filter((rule) => rule.id !== ruleId);

            req.reply({
                statusCode: 204,
                body: null,
            });
        }).as('deleteAlarmRule');

        cy.visit('/auth/login');
        cy.get('#username').type(alarmConfigUsername);
        cy.get('#password').type(alarmConfigPassword);
        cy.get('button[type="submit"]').click();

        cy.wait('@login');
        cy.get('a.sidebar-link').contains('Configurazione Allarmi').click({ force: true });
        cy.location('pathname').should('eq', '/alarms/alarm-configuration');
        cy.contains('h1', 'Configurazione allarmi').should('be.visible');
        cy.wait('@getAlarmRules');
    });

    it('RF85-OBL Amministratore deve poter creare un allarme nel Sistema', () => {
        openCreateRuleModal();
        cy.wait('@getPlants');
        cy.wait('@getWards');

        fillCreateRuleForm();
        cy.contains('button', 'CREA ALLARME').click();

        cy.wait('@createAlarmRule').its('request.body').should('deep.equal', {
            name: 'Regola presenza notturna',
            deviceId: 'dev-presence',
            datapointId: 'dp-presence-state',
            plantId: 'plant-1',
            priority: 4,
            thresholdOperator: '=',
            thresholdValue: 'on',
            armingTime: '08:00',
            dearmingTime: '20:00',
        });

        cy.wait('@getAlarmRules');
        cy.contains('td', 'Regola presenza notturna').should('exist');
    });

    it('RF86-OBL Amministratore deve selezionare l appartamento per creare un allarme', () => {
        openCreateRuleModal();
        cy.wait('@getPlants');
        cy.wait('@getWards');

        cy.get('#deviceId').should('be.disabled');
        cy.get('#plantId').select('plant-1');
        cy.wait('@getPlantById');
        cy.get('#deviceId').should('not.be.disabled');
    });

    it('RF87-OBL Amministratore deve selezionare il sensore per creare un allarme', () => {
        openCreateRuleModal();
        cy.wait('@getPlants');
        cy.wait('@getWards');

        cy.get('#plantId').select('plant-1');
        cy.wait('@getPlantById');
        cy.get('#deviceId').select('dev-presence');

        cy.get('#datapointId option').contains('Stato presenza').should('exist');
    });

    it('RF88-OBL Amministratore deve selezionare il livello di priorità 1-4', () => {
        openCreateRuleModal();

        cy.get('#priority option').then(($options) => {
            const labels = Array.from($options).map((option) => option.textContent?.trim() ?? '');
            expect(labels).to.include.members(['1', '2', '3', '4']);
        });
    });

    it('RF89-OBL Amministratore deve selezionare una soglia di intervento', () => {
        openCreateRuleModal();
        cy.wait('@getPlants');
        cy.wait('@getWards');

        fillCreateRuleForm();
        cy.get('#thresholdValue').clear();
        cy.contains('button', 'CREA ALLARME').click();

        cy.contains('La soglia è obbligatoria.').should('be.visible');
    });

    it('RF90-OBL Amministratore deve selezionare un orario di attivazione', () => {
        openCreateRuleModal();
        cy.wait('@getPlants');
        cy.wait('@getWards');

        fillCreateRuleForm();
        cy.get('#armingTime').clear();
        cy.contains('button', 'CREA ALLARME').click();

        cy.contains("L'orario di attivazione è obbligatorio.").should('be.visible');
    });

    it('RF91-OBL Amministratore deve selezionare un orario di disattivazione', () => {
        openCreateRuleModal();
        cy.wait('@getPlants');
        cy.wait('@getWards');

        fillCreateRuleForm();
        cy.get('#dearmingTime').clear();
        cy.contains('button', 'CREA ALLARME').click();

        cy.contains("L'orario di disattivazione è obbligatorio.").should('be.visible');
    });

    it('RF92-OBL Errore se non è stato selezionato alcun sensore', () => {
        openCreateRuleModal();
        cy.wait('@getPlants');
        cy.wait('@getWards');

        cy.get('#name').clear().type('Regola senza sensore');
        cy.get('#plantId').select('plant-1');
        cy.wait('@getPlantById');
        cy.get('#priority').select('3');
        cy.get('#thresholdOperator').select('uguale a');
        cy.get('#thresholdValue').clear().type('ON');
        cy.get('#armingTime').type('08:00');
        cy.get('#dearmingTime').type('20:00');

        cy.contains('button', 'CREA ALLARME').click();
        cy.contains('Il dispositivo è obbligatorio.').should('be.visible');
    });

    it('RF93-OBL Errore se non è stato selezionato alcun livello di priorità', () => {
        openCreateRuleModal();
        cy.wait('@getPlants');
        cy.wait('@getWards');

        cy.get('#name').clear().type('Regola senza priorita');
        cy.get('#plantId').select('plant-1');
        cy.wait('@getPlantById');
        cy.get('#deviceId').select('dev-presence');
        cy.get('#datapointId').select('dp-presence-state');
        cy.get('#thresholdOperator').select('uguale a');
        cy.get('#thresholdValue').clear().type('ON');
        cy.get('#armingTime').type('08:00');
        cy.get('#dearmingTime').type('20:00');

        cy.contains('button', 'CREA ALLARME').click();
        cy.contains('La priorità è obbligatoria.').should('be.visible');
    });

    it('RF94-OBL Amministratore deve ricevere un errore se non ha selezionato alcuna soglia di intervento', () => {
        const ruleName = 'Regola edit senza soglia';
        createAlarmRuleFromModal(ruleName);
        openEditRuleModal(ruleName);

        cy.get('#thresholdValue').clear();
        cy.contains('button', 'APPLICA MODIFICHE').click();

        cy.contains('La soglia è obbligatoria.').should('be.visible');
        cy.get('@updateAlarmRule.all').should('have.length', 0);
    });

    it('RF95-OBL Amministratore deve poter modificare la priorità di un allarme del Sistema', () => {
        const ruleName = 'Regola priorita modificabile';
        createAlarmRuleFromModal(ruleName);
        openEditRuleModal(ruleName);

        cy.get('#priority').select('1');
        cy.contains('button', 'APPLICA MODIFICHE').click();

        cy.wait('@updateAlarmRule').its('request.body').should('include', {
            name: ruleName,
            priority: 1,
        });

        cy.wait('@getAlarmRules');
    });

    it('RF96-OBL Amministratore deve poter modificare la soglia d intervento di un allarme del Sistema', () => {
        const ruleName = 'Regola soglia modificabile';
        createAlarmRuleFromModal(ruleName);
        openEditRuleModal(ruleName);

        cy.get('#thresholdValue').clear().type('OFF');
        cy.contains('button', 'APPLICA MODIFICHE').click();

        cy.wait('@updateAlarmRule').its('request.body').should('include', {
            name: ruleName,
            thresholdValue: 'off',
        });

        cy.wait('@getAlarmRules');
        cy.contains('tr', ruleName).should('contain', '= off');
    });

    it('RF97-OBL Amministratore deve poter modificare l orario di attivazione di un allarme del Sistema', () => {
        const ruleName = 'Regola orario attivazione';
        createAlarmRuleFromModal(ruleName);
        openEditRuleModal(ruleName);

        cy.get('#armingTime').clear().type('09:30');
        cy.contains('button', 'APPLICA MODIFICHE').click();

        cy.wait('@updateAlarmRule').its('request.body').should('include', {
            name: ruleName,
            armingTime: '09:30',
        });

        cy.wait('@getAlarmRules');
        cy.contains('tr', ruleName).should('contain', '09:30');
    });

    it('RF98-OBL Amministratore deve poter modificare l orario di disattivazione di un allarme del Sistema', () => {
        const ruleName = 'Regola orario disattivazione';
        createAlarmRuleFromModal(ruleName);
        openEditRuleModal(ruleName);

        cy.get('#dearmingTime').clear().type('21:15');
        cy.contains('button', 'APPLICA MODIFICHE').click();

        cy.wait('@updateAlarmRule').its('request.body').should('include', {
            name: ruleName,
            dearmingTime: '21:15',
        });

        cy.wait('@getAlarmRules');
        cy.contains('tr', ruleName).should('contain', '21:15');
    });

    it('RF99-OBL Amministratore deve poter abilitare un allarme del Sistema', () => {
        const ruleName = 'Regola abilita';
        createAlarmRuleFromModal(ruleName);

        cy.get(`button[aria-label="Abilita regola ${ruleName}"]`).click();
        cy.wait('@updateAlarmRule').its('request.body').should('include', {
            name: ruleName,
            isArmed: false,
        });

        cy.wait('@getAlarmRules');
        cy.get(`button[aria-label="Abilita regola ${ruleName}"]`).click();
        cy.wait('@updateAlarmRule').its('request.body').should('include', {
            name: ruleName,
            isArmed: true,
        });

        cy.wait('@getAlarmRules');
    });

    it('RF100-OBL Amministratore deve poter disabilitare un allarme del Sistema', () => {
        const ruleName = 'Regola disabilita';
        createAlarmRuleFromModal(ruleName);

        cy.get(`button[aria-label="Abilita regola ${ruleName}"]`).click();
        cy.wait('@updateAlarmRule').its('request.body').should('include', {
            name: ruleName,
            isArmed: false,
        });
        cy.wait('@getAlarmRules');
    });

    it('RF101-OBL Amministratore deve poter eliminare un allarme nel Sistema', () => {
        const ruleName = 'Regola elimina';
        createAlarmRuleFromModal(ruleName);

        cy.get(`button[aria-label="Elimina regola ${ruleName}"]`).click();
        cy.contains('button', 'Elimina').click();

        cy.wait('@deleteAlarmRule');
        cy.contains('tr', ruleName).should('not.exist');
    });
});
