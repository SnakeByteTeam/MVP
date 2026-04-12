#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const lcovPathArg = process.argv[2] ?? 'coverage/e2e/lcov.info';
const lcovPath = path.resolve(process.cwd(), lcovPathArg);

const excludedSourceSuffixes = [
    'src/app/features/notification/components/notification-topbar-panel-component/notification-topbar-panel-component.ts',
    'src/app/shared/pipes/elapsed-time.pipe.ts',
];

if (!fs.existsSync(lcovPath)) {
    console.error(`LCOV file not found: ${lcovPath}`);
    process.exit(1);
}

const raw = fs.readFileSync(lcovPath, 'utf8');
const records = raw
    .split('end_of_record')
    .map((record) => record.trim())
    .filter((record) => record.length > 0);

const keptRecords = [];
const excludedSources = [];

for (const record of records) {
    const sfLine = record.split('\n').find((line) => line.startsWith('SF:'));
    if (!sfLine) {
        continue;
    }

    const sourceFile = sfLine.slice(3).trim();
    const normalizedSourceFile = sourceFile.replaceAll('\\', '/');
    const mustExclude = excludedSourceSuffixes.some((suffix) =>
        normalizedSourceFile.endsWith(suffix)
    );

    if (mustExclude) {
        excludedSources.push(sourceFile);
        continue;
    }

    keptRecords.push(record);
}

const rewrittenRecords = keptRecords.map((record) => `${record}\nend_of_record`);
const rewritten = `${rewrittenRecords.join('\n')}\n`;
fs.writeFileSync(lcovPath, rewritten, 'utf8');

let lf = 0;
let lh = 0;
let brf = 0;
let brh = 0;
let fnf = 0;
let fnh = 0;
let sourceFiles = 0;

for (const record of keptRecords) {
    sourceFiles += 1;
    for (const line of record.split('\n')) {
        if (line.startsWith('LF:')) lf += Number(line.slice(3));
        else if (line.startsWith('LH:')) lh += Number(line.slice(3));
        else if (line.startsWith('BRF:')) brf += Number(line.slice(4));
        else if (line.startsWith('BRH:')) brh += Number(line.slice(4));
        else if (line.startsWith('FNF:')) fnf += Number(line.slice(4));
        else if (line.startsWith('FNH:')) fnh += Number(line.slice(4));
    }
}

const pct = (num, den) => (den > 0 ? ((num / den) * 100).toFixed(2) : '100.00');

console.log('Filtered e2e LCOV (targeted source exclusions)');
console.log(`Source files kept: ${sourceFiles}`);
console.log(`Excluded files: ${excludedSources.length}`);
for (const excludedSource of excludedSources) {
    console.log(`- ${excludedSource}`);
}
console.log(`Statements: ${pct(lh, lf)}% (${lh}/${lf})`);
console.log(`Branches: ${pct(brh, brf)}% (${brh}/${brf})`);
console.log(`Functions: ${pct(fnh, fnf)}% (${fnh}/${fnf})`);
console.log(`Lines: ${pct(lh, lf)}% (${lh}/${lf})`);
