# Frontend Integration Tests

Questa suite copre flussi di integrazione frontend (componenti + servizi + stato + orchestrazione), separata dai test unitari e dagli e2e Cypress.

## Scope

- Include: interazioni cross-layer dentro una feature Angular.
- Include: provider override solo ai boundary esterni (API, auth, gateway).
- Esclude: flussi browser completi end-to-end (coperti da Cypress).

## Esecuzione

- `npm run test:integration`
- `npm run test:integration:ci`
- `npm run test:integration:junit`
- `npm run test:integration:sonar`

## Struttura Cartelle

La struttura replica `src/` sotto `test/integration/`.

Esempio:
- `src/app/features/alarm-management/...`
- `test/integration/app/features/alarm-management/...`

## Convenzioni Naming

- File: `use-case-name.integration.spec.ts`
- `describe`: nome feature + contesto (es. `AlarmManagement feature integration`)
- `it`: preferire riferimento requisito quando disponibile (es. `RF43-OBL ...`)

## Tracciamento Requisiti

Usare il file `test/integration/requirements-traceability.md` per mappare ogni requisito ai test integration.
