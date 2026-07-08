import { access, readFile } from 'node:fs/promises';

const requiredFiles = ['index.html', 'src/main.js', 'src/styles.css'];
await Promise.all(requiredFiles.map((file) => access(file)));

const [html, app] = await Promise.all([readFile('index.html', 'utf8'), readFile('src/main.js', 'utf8')]);
if (!html.includes('src/main.js')) throw new Error('index.html must load src/main.js');
if (!app.includes('dummyKpis')) throw new Error('app must include the dummy KPI adapter data');
if (!app.includes('Azure SQL')) throw new Error('app must include Azure SQL connection guidance');

console.log('Static PowerApps KPI dashboard validated.');
