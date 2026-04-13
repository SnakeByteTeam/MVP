#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const lcovPathArg = process.argv[2] ?? 'coverage/frontend/lcov.info';
const lcovPath = path.resolve(process.cwd(), lcovPathArg);

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
let excludedHtmlFiles = 0;

for (const record of records) {
  const sfLine = record.split('\n').find((line) => line.startsWith('SF:'));
  if (!sfLine) {
    continue;
  }

  const sourceFile = sfLine.slice(3).trim();
  if (sourceFile.endsWith('.html')) {
    excludedHtmlFiles += 1;
    continue;
  }

  keptRecords.push(record);
}

const rewritten = `${keptRecords.map((record) => `${record}\nend_of_record`).join('\n')}\n`;
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

console.log('Filtered integration LCOV (excluding .html templates)');
console.log(`Source files kept: ${sourceFiles}`);
console.log(`HTML files excluded: ${excludedHtmlFiles}`);
console.log(`Statements: ${pct(lh, lf)}% (${lh}/${lf})`);
console.log(`Branches: ${pct(brh, brf)}% (${brh}/${brf})`);
console.log(`Functions: ${pct(fnh, fnf)}% (${fnh}/${fnf})`);
console.log(`Lines: ${pct(lh, lf)}% (${lh}/${lf})`);
