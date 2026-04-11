const deviceInteractionUsername = 'Mario Rossi';
const deviceInteractionPassword = ['A', 'd', 'm', 'i', 'n', 'A', 'c', 'c', 'e', 's', 's', '1', '2', '3'].join('');
const deviceInteractionLinkedEmail = 'admin@example.com';

const createDeviceInteractionAccessToken = (): string => {
    const claims = {
        userId: '1',
        username: deviceInteractionUsername,
        role: 'AMMINISTRATORE' as const,
        isFirstAccess: false,
    };

    const encodedPayload = btoa(JSON.stringify(claims))
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replaceAll('=', '');

    return `header.${encodedPayload}.signature`;
};

describe('Device interaction e2e', () => {
    beforeEach(() => {
        cy.viewport(1440, 1000);
        cy.clearLocalStorage('activePlantId');

        cy.intercept('POST', '**/auth/login', {
            statusCode: 200,
            body: {
                accessToken: createDeviceInteractionAccessToken(),
            },
        }).as('login');

        cy.intercept('GET', '**/my-vimar/account', {
            statusCode: 200,
            body: {
                email: deviceInteractionLinkedEmail,
                isLinked: true,
            },
        });

        cy.intercept('GET', '**/api/vimar-account', {
            statusCode: 200,
            body: {
                email: deviceInteractionLinkedEmail,
                isLinked: true,
            },
        });

        cy.intercept('GET', '**/alarm-events/unmanaged/*/*/*', {
            statusCode: 200,
            body: [],
        });

        const plantBody = {
            id: 'plant-1',
            name: 'Appartamento Aurora',
            rooms: [
                {
                    id: 'room-main',
                    name: 'Suite principale',
                    devices: [
                        {
                            id: 'dev-thermostat',
                            name: 'Termostato Suite',
                            type: 'THERMOSTAT_DEVICE',
                            datapoints: [
                                {
                                    id: 'dp-thermostat',
                                    name: 'Setpoint',
                                    readable: true,
                                    writable: true,
                                    valueType: 'enum',
                                    enum: ['18', '20', '22'],
                                    sfeType: 'SFE_CMD_HVACMODE',
                                },
                            ],
                        },
                        {
                            id: 'dev-fall',
                            name: 'Sensore Caduta Letto',
                            type: 'FALL_SENSOR_DEVICE',
                            datapoints: [
                                {
                                    id: 'dp-fall',
                                    name: 'Stato caduta',
                                    readable: true,
                                    writable: true,
                                    valueType: 'enum',
                                    enum: ['OFF', 'ON'],
                                    sfeType: 'SFE_STATE_FALL',
                                },
                            ],
                        },
                        {
                            id: 'dev-presence',
                            name: 'Sensore Presenza Camera',
                            type: 'PRESENCE_SENSOR_DEVICE',
                            datapoints: [
                                {
                                    id: 'dp-presence',
                                    name: 'Stato presenza',
                                    readable: true,
                                    writable: true,
                                    valueType: 'enum',
                                    enum: ['OFF', 'ON'],
                                    sfeType: 'SFE_STATE_PRESENCE',
                                },
                            ],
                        },
                        {
                            id: 'dev-light',
                            name: 'Punto Luce Ingresso',
                            type: 'LIGHT_DEVICE',
                            datapoints: [
                                {
                                    id: 'dp-light',
                                    name: 'Comando luce',
                                    readable: true,
                                    writable: true,
                                    valueType: 'enum',
                                    enum: ['OFF', 'ON'],
                                    sfeType: 'SFE_CMD_ONOFF',
                                },
                            ],
                        },
                        {
                            id: 'dev-alarm-button',
                            name: 'Pulsante Allarme Bagno',
                            type: 'ALARM_BUTTON_DEVICE',
                            datapoints: [
                                {
                                    id: 'dp-alarm-button',
                                    name: 'Comando SOS',
                                    readable: true,
                                    writable: true,
                                    valueType: 'enum',
                                    enum: ['OFF', 'ON'],
                                    sfeType: 'SFE_CMD_DOWNKEY_ACTIVESCENE',
                                },
                            ],
                        },
                        {
                            id: 'dev-door',
                            name: 'Porta di Ingresso Principale',
                            type: 'DOOR_CONTROL_DEVICE',
                            datapoints: [
                                {
                                    id: 'dp-door',
                                    name: 'Comando porta',
                                    readable: true,
                                    writable: true,
                                    valueType: 'enum',
                                    enum: ['LOCK', 'UNLOCK'],
                                    sfeType: 'SFE_CMD_ONOFF',
                                },
                            ],
                        },
                        {
                            id: 'dev-blind',
                            name: 'Tapparella Salone',
                            type: 'BLIND_CONTROL_DEVICE',
                            datapoints: [
                                {
                                    id: 'dp-blind',
                                    name: 'Comando tapparella',
                                    readable: true,
                                    writable: true,
                                    valueType: 'enum',
                                    enum: ['UP', 'DOWN'],
                                    sfeType: 'SFE_CMD_BLIND',
                                },
                            ],
                        },
                    ],
                },
            ],
        };

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

        cy.intercept('GET', '**/plant?plantid=*', {
            statusCode: 200,
            body: plantBody,
        }).as('getPlantById');

        cy.intercept('GET', '**/device/*/value', (req) => {
            const deviceId = req.url.split('/').at(-2) ?? '';
            const valuesMap: Record<string, { datapointId: string; name: string; value: string }[]> = {
                'dev-thermostat': [{ datapointId: 'dp-thermostat', name: 'Setpoint', value: '20' }],
                'dev-fall': [{ datapointId: 'dp-fall', name: 'Stato caduta', value: 'OFF' }],
                'dev-presence': [{ datapointId: 'dp-presence', name: 'Stato presenza', value: 'ON' }],
                'dev-light': [{ datapointId: 'dp-light', name: 'Comando luce', value: 'OFF' }],
                'dev-alarm-button': [{ datapointId: 'dp-alarm-button', name: 'Comando SOS', value: 'OFF' }],
                'dev-door': [{ datapointId: 'dp-door', name: 'Comando porta', value: 'LOCK' }],
                'dev-blind': [{ datapointId: 'dp-blind', name: 'Comando tapparella', value: 'UP' }],
            };

            req.reply({
                statusCode: 200,
                body: {
                    deviceId,
                    values: valuesMap[deviceId] ?? [],
                },
            });
        }).as('getDeviceValue');

        cy.intercept('POST', '**/device', {
            statusCode: 202,
            body: {
                message: 'Datapoint value updated successfully',
                statusCode: 202,
            },
        }).as('writeDatapoint');

        cy.visit('/auth/login?returnUrl=%2Fdevice-interaction');
        cy.get('#username').type(deviceInteractionUsername);
        cy.get('#password').type(deviceInteractionPassword);
        cy.get('button[type="submit"]').click();

        cy.wait('@login');
        cy.location('pathname').should('eq', '/device-interaction');
        cy.wait('@getPlants');
        cy.wait('@getPlantById');
    });

    it('RF79-OBL Visualizzazione singolo dispositivo dei tipi previsti', () => {
        cy.contains('td', 'Termostato').should('exist');
        cy.contains('td', 'Sensore caduta').should('exist');
        cy.contains('td', 'Sensore presenza').should('exist');
        cy.contains('td', 'Luce').should('exist');
        cy.contains('td', 'Pulsante allarme').should('exist');
        cy.contains('td', 'Controllo accesso').should('exist');
        cy.contains('td', 'Tapparella').should('exist');
    });

    it('RF80-OBL Utente visualizzando un dispositivo deve vedere il nome', () => {
        cy.contains('table[aria-label="Tabella endpoint Suite principale"] tbody tr', 'Termostato Suite').should('exist');
        cy.contains('table[aria-label="Tabella endpoint Suite principale"] tbody tr', 'Porta di Ingresso Principale').should('exist');
        cy.contains('table[aria-label="Tabella endpoint Suite principale"] tbody tr', 'Tapparella Salone').should('exist');
    });

    it('RF81-OBL Utente visualizzando un dispositivo deve vedere lo stato', () => {
        cy.contains('table[aria-label="Tabella endpoint Suite principale"] tbody tr', 'Termostato Suite').should('contain', '20');
        cy.contains('table[aria-label="Tabella endpoint Suite principale"] tbody tr', 'Porta di Ingresso Principale').should('contain', 'LOCK');
    });

    it('RF82-OPL Utente visualizzando un dispositivo deve vedere le azioni eseguibili', () => {
        cy.contains('table[aria-label="Tabella endpoint Suite principale"] tbody tr', 'Termostato Suite').within(() => {
            cy.contains('button', 'Scrivi').should('exist');
        });

        cy.contains('table[aria-label="Tabella endpoint Suite principale"] tbody tr', 'Termostato Suite').within(() => {
            cy.get('select').select('22');
            cy.contains('button', 'Scrivi').click();
        });

        cy.wait('@writeDatapoint').its('request.body').should('deep.equal', {
            datapointId: 'dp-thermostat',
            value: '22',
        });
    });

    it('writes a command for another device row', () => {
        cy.contains('table[aria-label="Tabella endpoint Suite principale"] tbody tr', 'Porta di Ingresso Principale').within(() => {
            cy.get('select').select('UNLOCK');
            cy.contains('button', 'Scrivi').click();
        });

        cy.wait('@writeDatapoint').its('request.body').should('deep.equal', {
            datapointId: 'dp-door',
            value: 'UNLOCK',
        });
    });

});
