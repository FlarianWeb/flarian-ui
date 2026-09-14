import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { writeRegistryAugmentation } from './generateRegistry';

describe('writeRegistryAugmentation', () => {
	let tmpFile: string;

	beforeEach(() => {
		tmpFile = path.join(os.tmpdir(), `registry-${Date.now()}.d.ts`);
	});

	afterEach(() => {
		fs.rmSync(tmpFile, { force: true });
	});

	it('snapshot', () => {
		writeRegistryAugmentation('RegistryTheme', ['ocean', 'forest'], tmpFile, '@flarian/ui');

		expect(fs.readFileSync(tmpFile, 'utf-8')).toMatchSnapshot();
	});

	it('объявляет переданный интерфейс с переданным именем пакета', () => {
		writeRegistryAugmentation('RegistrySurface', ['warm'], tmpFile, '@flarian/ui');

		const content = fs.readFileSync(tmpFile, 'utf-8');

		expect(content).toContain("declare module '@flarian/ui'");
		expect(content).toContain('interface RegistrySurface {');
		expect(content).toContain("'warm': true;");
	});

	it('не содержит declare module с другими именами', () => {
		writeRegistryAugmentation('RegistryTheme', ['ocean'], tmpFile, '@flarian/ui');

		const content = fs.readFileSync(tmpFile, 'utf-8');

		expect(content).not.toContain("declare module '.'");
		expect(content).not.toContain("declare module '@flarian'");
	});

	it('создаёт недостающие директории', () => {
		const nestedFile = path.join(os.tmpdir(), `registry-nested-${Date.now()}`, 'out.d.ts');

		writeRegistryAugmentation('RegistryTheme', ['ocean'], nestedFile, '@flarian/ui');

		expect(fs.existsSync(nestedFile)).toBe(true);

		fs.rmSync(path.dirname(nestedFile), { recursive: true, force: true });
	});
});
