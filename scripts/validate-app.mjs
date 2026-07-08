import { access, cp, mkdir, rm, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const requiredFiles = ['index.html', 'src/main.js', 'src/styles.css'];
await Promise.all(requiredFiles.map((file) => access(file)));

const [html, app] = await Promise.all([readFile('index.html', 'utf8'), readFile('src/main.js', 'utf8')]);
if (!html.includes('src/main.js')) throw new Error('index.html must load src/main.js');
if (!app.includes('d365Tables')) throw new Error('app must include the dummy D365 F&O adapter data');
if (!app.includes('runAgentQuery')) throw new Error('app must include the local query agent');
if (!app.includes('OData')) throw new Error('app must include D365 F&O OData connection guidance');

const outputDir = 'dist';
await rm(outputDir, { recursive: true, force: true });
await mkdir(join(outputDir, 'src'), { recursive: true });

for (const file of requiredFiles) {
  await mkdir(dirname(join(outputDir, file)), { recursive: true });
  await cp(file, join(outputDir, file));
}

console.log('Static D365 F&O query agent validated and copied to dist/.');
