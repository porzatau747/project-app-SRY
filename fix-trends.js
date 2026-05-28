const fs = require('fs');
const path = require('path');

const trendsPath = path.join(__dirname, 'src', 'services', 'trends.ts');
let code = fs.readFileSync(trendsPath, 'utf8');

code = code.replace('export async function getCurrentTrendSnapshot() {', 'export async function getCurrentTrendSnapshot(): Promise<TrendSnapshot> {');
code = code.replace('generatedFrom: "web",', 'generatedFrom: "web" as const,');

fs.writeFileSync(trendsPath, code);
console.log('Fixed trends.ts type!');
