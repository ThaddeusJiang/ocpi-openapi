import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const summaryPath = 'coverage/coverage-summary.json';
const badgePath = 'docs/coverage.svg';

const summary = JSON.parse(await readFile(summaryPath, 'utf8'));
const pct = Number(summary.total.lines.pct);

if (!Number.isFinite(pct)) {
  throw new Error(`Unable to read total line coverage from ${summaryPath}`);
}

const color =
  pct >= 90 ? '#2ea043' : pct >= 80 ? '#1f883d' : pct >= 70 ? '#bf8700' : '#cf222e';
const value = `${pct.toFixed(2).replace(/\.00$/, '')}%`;
const label = 'coverage';
const labelWidth = 72;
const valueWidth = Math.max(58, value.length * 7 + 16);
const width = labelWidth + valueWidth;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${width}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
    <rect width="${width}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${labelWidth / 2}" y="14">${label}</text>
    <text x="${labelWidth + valueWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${value}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14">${value}</text>
  </g>
</svg>
`;

await mkdir(dirname(badgePath), { recursive: true });
await writeFile(badgePath, svg);
