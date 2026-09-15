import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	buildIcons,
	wrapSprite,
	writeIconAugmentation,
	writeIconConstants,
	writeIconTypes,
} from './generateIcons';

// ── buildIcons ────────────────────────────────────────────────────────────────

describe('buildIcons', () => {
	let tmpDir: string;

	beforeEach(() => {
		tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flarian-icons-'));
	});

	afterEach(() => {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	});

	it('возвращает пустой результат если директории нет', () => {
		const { symbols, ids } = buildIcons(path.join(tmpDir, 'nonexistent'), 'test');

		expect(symbols).toBe('');
		expect(ids).toEqual([]);
	});

	it('превращает SVG-файл в symbol с id namespace/filename', () => {
		fs.writeFileSync(
			path.join(tmpDir, 'star.svg'),
			'<svg viewBox="0 0 24 24"><path d="M12 2"/></svg>'
		);

		const { ids, symbols } = buildIcons(tmpDir, 'brand');

		expect(ids).toEqual(['brand/star']);
		expect(symbols).toContain('<symbol id="brand/star"');
		expect(symbols).not.toContain('<svg');
	});

	it('формирует id как namespace/filename без расширения', () => {
		fs.writeFileSync(path.join(tmpDir, 'arrow-right.svg'), '<svg></svg>');

		const { ids } = buildIcons(tmpDir, 'ui');

		expect(ids).toEqual(['ui/arrow-right']);
	});

	it('игнорирует не-SVG файлы', () => {
		fs.writeFileSync(path.join(tmpDir, 'icon.svg'), '<svg></svg>');
		fs.writeFileSync(path.join(tmpDir, 'README.md'), '# docs');
		fs.writeFileSync(path.join(tmpDir, 'icon.png'), '');

		const { ids } = buildIcons(tmpDir, 'ui');

		expect(ids).toEqual(['ui/icon']);
	});

	it('обрабатывает несколько файлов', () => {
		fs.writeFileSync(path.join(tmpDir, 'bell.svg'), '<svg></svg>');
		fs.writeFileSync(path.join(tmpDir, 'star.svg'), '<svg></svg>');

		const { ids } = buildIcons(tmpDir, 'ui');

		expect(ids).toHaveLength(2);
		expect(ids).toContain('ui/bell');
		expect(ids).toContain('ui/star');
	});

	it('сортирует файлы независимо от порядка readdirSync', () => {
		fs.writeFileSync(path.join(tmpDir, 'bell.svg'), '<svg></svg>');
		fs.writeFileSync(path.join(tmpDir, 'star.svg'), '<svg></svg>');

		const readdir = vi
			.spyOn(fs, 'readdirSync')
			.mockReturnValue(['star.svg', 'bell.svg'] as never);

		const { ids, symbols } = buildIcons(tmpDir, 'ui');

		readdir.mockRestore();

		expect(ids).toEqual(['ui/bell', 'ui/star']);
		expect(symbols.indexOf('ui/bell')).toBeLessThan(symbols.indexOf('ui/star'));
	});
});

// ── wrapSprite ────────────────────────────────────────────────────────────────

describe('wrapSprite', () => {
	it('оборачивает символы в корневой svg с display:none', () => {
		const result = wrapSprite('<symbol id="ui/bell"></symbol>');

		expect(result).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
		expect(result).toContain('style="display:none"');
		expect(result).toContain('<symbol id="ui/bell">');
	});
});

// ── writeIconTypes ────────────────────────────────────────────────────────────

describe('writeIconTypes', () => {
	let tmpFile: string;

	beforeEach(() => {
		tmpFile = path.join(os.tmpdir(), `icons-${Date.now()}.ts`);
	});

	afterEach(() => {
		fs.rmSync(tmpFile, { force: true });
	});

	it('snapshot', () => {
		writeIconTypes(['ui/bell', 'ui/calendar-check'], tmpFile);

		expect(fs.readFileSync(tmpFile, 'utf-8')).toMatchSnapshot();
	});

	it('конвертирует id в camelCase ключи', () => {
		writeIconTypes(['ui/bell', 'ui/calendar-check'], tmpFile);

		const content = fs.readFileSync(tmpFile, 'utf-8');

		expect(content).toContain('uiBell:');
		expect(content).toContain('uiCalendarCheck:');
	});

	it('экспортирует тип BuiltInIcon', () => {
		writeIconTypes(['ui/bell'], tmpFile);

		expect(fs.readFileSync(tmpFile, 'utf-8')).toContain('export type BuiltInIcon =');
	});

	it('создаёт директорию если её нет', () => {
		const nested = path.join(os.tmpdir(), `flarian-nested-${Date.now()}`, 'icons.ts');

		try {
			writeIconTypes(['ui/bell'], nested);
			expect(fs.existsSync(nested)).toBe(true);
		} finally {
			fs.rmSync(path.dirname(nested), { recursive: true, force: true });
		}
	});
});

// ── writeIconAugmentation ─────────────────────────────────────────────────────

describe('writeIconAugmentation', () => {
	let tmpFile: string;

	beforeEach(() => {
		tmpFile = path.join(os.tmpdir(), `aug-${Date.now()}.d.ts`);
	});

	afterEach(() => {
		fs.rmSync(tmpFile, { force: true });
	});

	it('snapshot', () => {
		writeIconAugmentation(['brand/star', 'brand/logo'], tmpFile, '@flarian/ui');

		expect(fs.readFileSync(tmpFile, 'utf-8')).toMatchSnapshot();
	});

	it('объявляет augmentation с переданным именем пакета', () => {
		writeIconAugmentation(['brand/star'], tmpFile, '@flarian/ui');

		expect(fs.readFileSync(tmpFile, 'utf-8')).toContain("declare module '@flarian/ui'");
	});

	it('не содержит declare module с другими именами', () => {
		writeIconAugmentation(['brand/star'], tmpFile, '@flarian/ui');

		const content = fs.readFileSync(tmpFile, 'utf-8');

		expect(content).not.toContain("declare module '.'");
		expect(content).not.toContain("declare module '@flarian'");
	});

	it('расширяет RegistryIcon переданными id', () => {
		writeIconAugmentation(['brand/star', 'brand/logo'], tmpFile, '@flarian/ui');

		const content = fs.readFileSync(tmpFile, 'utf-8');

		expect(content).toContain('interface RegistryIcon');
		expect(content).toContain("'brand/star': true;");
		expect(content).toContain("'brand/logo': true;");
	});

	it('содержит export {} для корректного module augmentation', () => {
		writeIconAugmentation(['brand/star'], tmpFile, '@flarian/ui');

		expect(fs.readFileSync(tmpFile, 'utf-8')).toContain('export {};');
	});
});

// ── writeIconConstants ────────────────────────────────────────────────────────

describe('writeIconConstants', () => {
	let tmpFile: string;

	beforeEach(() => {
		tmpFile = path.join(os.tmpdir(), `consts-${Date.now()}.ts`);
	});

	afterEach(() => {
		fs.rmSync(tmpFile, { force: true });
	});

	it('snapshot', () => {
		writeIconConstants({ brand: ['brand/star', 'brand/logo'] }, tmpFile);

		expect(fs.readFileSync(tmpFile, 'utf-8')).toMatchSnapshot();
	});

	it('генерирует константу ${namespace}Icon', () => {
		writeIconConstants({ brand: ['brand/star', 'brand/logo'] }, tmpFile);

		const content = fs.readFileSync(tmpFile, 'utf-8');

		expect(content).toContain('export const brandIcon =');
		expect(content).toContain("brandStar: 'brand/star'");
		expect(content).toContain("brandLogo: 'brand/logo'");
	});

	it('генерирует блоки для нескольких namespace', () => {
		writeIconConstants({ brand: ['brand/star'], social: ['social/twitter'] }, tmpFile);

		const content = fs.readFileSync(tmpFile, 'utf-8');

		expect(content).toContain('export const brandIcon =');
		expect(content).toContain('export const socialIcon =');
	});
});
