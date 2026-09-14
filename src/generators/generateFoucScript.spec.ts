import { resolveUIConfig } from '../config/resolveUIConfig';
import type { UIPluginOptions } from '../plugin/types';

import { generateFoucScript } from './generateFoucScript';

/**
 * Генератор принимает resolved-конфиг — резолвим опции как это делает плагин.
 */
const fouc = (options?: UIPluginOptions): string => generateFoucScript(resolveUIConfig(options));

describe('generateFoucScript', () => {
	it('дефолтные опции (snapshot)', () => {
		expect(fouc()).toMatchSnapshot();
	});

	it('auto: определяет схему через prefers-color-scheme', () => {
		const script = fouc({ scheme: { default: 'auto' } });

		expect(script).toContain('prefers-color-scheme:dark');
		expect(script).toContain("localStorage.getItem('flarian-ui-scheme')");
		expect(script).toContain("d.setAttribute('data-scheme'");
	});

	it('явный дефолт: без matchMedia', () => {
		const script = fouc({ scheme: { default: 'dark' } });

		expect(script).not.toContain('matchMedia');
		expect(script).toContain("s='dark';");
	});

	it('кастомные значения атрибута схемы', () => {
		const script = fouc({
			scheme: { attribute: 'data-mode', dark: 'night', light: 'day' },
		});

		expect(script).toContain("d.setAttribute('data-mode',s==='dark'?'night':'day')");
	});

	it('темы: восстанавливает из localStorage с валидацией по списку', () => {
		const script = fouc({
			theme: { list: { ocean: { base: '#0ea5e9' } }, default: 'ocean' },
		});

		expect(script).toContain("localStorage.getItem('flarian-ui-theme')");
		expect(script).toContain('["ocean"].indexOf(t)<0');
		expect(script).toContain("t='ocean';");
		expect(script).toContain("d.setAttribute('data-theme',t)");
	});

	it('без тем — тема в скрипт не попадает', () => {
		const script = fouc({ theme: { list: {} } });

		expect(script).not.toContain('data-theme');
	});

	it('использует storagePrefix для ключей', () => {
		const script = fouc({
			storagePrefix: 'my-app',
			theme: { list: { ocean: { base: '#0ea5e9' } } },
		});

		expect(script).toContain("localStorage.getItem('my-app-scheme')");
		expect(script).toContain("localStorage.getItem('my-app-theme')");
		expect(script).toContain("localStorage.getItem('my-app-surface')");
	});

	it('поверхность: восстанавливает из localStorage с валидацией по списку', () => {
		const script = fouc({
			surface: { list: { warm: { 500: '#a08968' } } },
		});

		expect(script).toContain("localStorage.getItem('flarian-ui-surface')");
		expect(script).toContain('["warm"].indexOf(sf)<0');
		expect(script).toContain("sf='warm';");
		expect(script).toContain("d.setAttribute('data-surface',sf)");
	});

	it('явный default: null — тема опциональна, t сравнивается только на truthy', () => {
		const script = fouc({
			theme: { list: { ocean: { base: '#0ea5e9' } }, default: null },
		});

		expect(script).toContain('t=null;');
		expect(script).toContain('if(t){d.setAttribute(');
		expect(script).not.toContain("t!=='");
	});

	it('default: null — без localStorage атрибут не ставится, с localStorage ставится', () => {
		const script = fouc({
			scheme: { default: 'light' },
			theme: { list: { ocean: { base: '#0ea5e9' } }, default: null },
		});

		eval(script);
		expect(document.documentElement.hasAttribute('data-theme')).toBe(false);

		localStorage.setItem('flarian-ui-theme', 'ocean');
		eval(script);
		expect(document.documentElement.getAttribute('data-theme')).toBe('ocean');

		localStorage.clear();
		document.documentElement.removeAttribute('data-scheme');
		document.documentElement.removeAttribute('data-theme');
	});

	it('без переопределений — тема/поверхность равны default, атрибуты не ставятся (уже покрыты :root)', () => {
		const script = fouc({
			theme: { list: { ocean: { base: '#0ea5e9' } } },
			surface: { list: { warm: { 500: '#a08968' } } },
		});

		eval(script);

		expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
		expect(document.documentElement.hasAttribute('data-surface')).toBe(false);

		document.documentElement.removeAttribute('data-scheme');
	});

	it('исполняется в браузерной среде и применяет атрибуты для значений, отличных от default', () => {
		localStorage.setItem('flarian-ui-scheme', 'dark');
		localStorage.setItem('flarian-ui-theme', 'forest');
		localStorage.setItem('flarian-ui-surface', 'cool');

		const script = fouc({
			theme: { list: { ocean: { base: '#0ea5e9' }, forest: { base: '#22c55e' } } },
			surface: { list: { warm: { 500: '#a08968' }, cool: { 500: '#6899a0' } } },
		});

		eval(script);

		expect(document.documentElement.getAttribute('data-scheme')).toBe('dark');
		expect(document.documentElement.getAttribute('data-theme')).toBe('forest');
		expect(document.documentElement.getAttribute('data-surface')).toBe('cool');

		localStorage.clear();
		document.documentElement.removeAttribute('data-scheme');
		document.documentElement.removeAttribute('data-theme');
		document.documentElement.removeAttribute('data-surface');
	});

	it('localStorage совпадает с default — атрибуты не ставятся при исполнении', () => {
		localStorage.setItem('flarian-ui-theme', 'ocean');
		localStorage.setItem('flarian-ui-surface', 'warm');

		const script = fouc({
			theme: { list: { ocean: { base: '#0ea5e9' }, forest: { base: '#22c55e' } } },
			surface: { list: { warm: { 500: '#a08968' }, cool: { 500: '#6899a0' } } },
		});

		eval(script);

		expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
		expect(document.documentElement.hasAttribute('data-surface')).toBe(false);

		localStorage.clear();
		document.documentElement.removeAttribute('data-scheme');
	});
});
