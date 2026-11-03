import { readFileSync, readdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
const directory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temporary = mkdtempSync(join(tmpdir(), 'siwak-function-'));
try {
  for (const file of readdirSync(join(directory, 'tests/fixtures')).filter(file => file.endsWith('.json'))) {
    const fixture = JSON.parse(readFileSync(join(directory, 'tests/fixtures', file), 'utf8'));
    const input = join(temporary, 'input.json');
    writeFileSync(input, JSON.stringify(fixture.input));
    const result = JSON.parse(execFileSync('shopify', ['app', 'function', 'run', '--path', directory, '--export', 'cart_lines_discounts_generate_run', '--input', input, '--json'], { encoding: 'utf8' }));
    assert.equal(result.success, true, file);
    assert.deepEqual(result.output, fixture.expectedOutput, file);
    console.log(`PASS ${file}`);
  }
} finally { rmSync(temporary, { recursive: true, force: true }); }
