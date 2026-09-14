describe('runtime store', () => {
	beforeEach(() => {
		vi.resetModules();
		document.getElementById('flarian-ui-sprite')?.remove();
		document.getElementById('flarian-ui-style')?.remove();
	});

	const load = async () => await import('./index');

	describe('getConfig / provideConfig', () => {
		it('возвращает дефолтный конфиг без provideConfig', async () => {
			const { getConfig } = await load();
			const config = getConfig();

			expect(config.theme.attribute).toBe('data-theme');
			expect(config.theme.list).toEqual(['base']);
			expect(config.surface.attribute).toBe('data-surface');
			expect(config.surface.list).toEqual(['base']);
			expect(config.surface.default).toBe('base');
			expect(config.scheme.default).toBe('auto');
			expect(config.a11y).toEqual({ motion: true, transparency: true });
			expect(config.components.button).toBeDefined();
		});

		it('provideConfig переопределяет переданные зоны, не трогая остальные', async () => {
			const { getConfig, provideConfig } = await load();

			provideConfig({
				theme: { attribute: 'data-theme', list: ['ocean'], default: 'ocean' } as never,
			});

			expect(getConfig().theme.list).toEqual(['ocean']);
			expect(getConfig().scheme.default).toBe('auto');
		});

		it('getConfig отражает изменения после provideConfig (живой объект)', async () => {
			const { getConfig, provideConfig } = await load();
			const before = getConfig();

			provideConfig({ a11y: { motion: false, transparency: true } });

			expect(before.a11y.motion).toBe(false);
		});
	});

	describe('provideSprite / getSpriteUrl', () => {
		it('пустой URL по умолчанию', async () => {
			const { getSpriteUrl } = await load();

			expect(getSpriteUrl()).toBe('');
		});

		it('режим url — сохраняет URL спрайта', async () => {
			const { getSpriteUrl, provideSprite } = await load();

			provideSprite({ url: '/assets/sprite.svg' });

			expect(getSpriteUrl()).toBe('/assets/sprite.svg');
		});

		it('режим inline — монтирует спрайт в DOM и сбрасывает URL', async () => {
			const { getSpriteUrl, provideSprite } = await load();

			provideSprite({ url: '/old.svg' });
			provideSprite({ inline: '<svg><symbol id="ui/x"></symbol></svg>' });

			expect(getSpriteUrl()).toBe('');

			const container = document.getElementById('flarian-ui-sprite');

			expect(container).not.toBeNull();
			expect(container?.innerHTML).toContain('ui/x');
			expect(container?.style.display).toBe('none');
		});

		it('повторный inline переиспользует контейнер', async () => {
			const { provideSprite } = await load();

			provideSprite({ inline: '<svg><symbol id="a"></symbol></svg>' });
			provideSprite({ inline: '<svg><symbol id="b"></symbol></svg>' });

			expect(document.querySelectorAll('#flarian-ui-sprite')).toHaveLength(1);
			expect(document.getElementById('flarian-ui-sprite')?.innerHTML).toContain('"b"');
		});

		it('SSR: без document не бросает исключение и не монтирует спрайт', async () => {
			vi.stubGlobal('document', undefined);

			const { provideSprite } = await load();

			expect(() =>
				provideSprite({ inline: '<svg><symbol id="a"></symbol></svg>' })
			).not.toThrow();

			vi.unstubAllGlobals();
		});

		it('document.body ещё не готов — монтирует спрайт по DOMContentLoaded', async () => {
			const { provideSprite } = await load();

			const bodySpy = vi.spyOn(document, 'body', 'get').mockReturnValue(null as never);

			provideSprite({ inline: '<svg><symbol id="deferred"></symbol></svg>' });

			expect(document.getElementById('flarian-ui-sprite')).toBeNull();

			bodySpy.mockRestore();
			document.dispatchEvent(new Event('DOMContentLoaded'));

			const container = document.getElementById('flarian-ui-sprite');

			expect(container).not.toBeNull();
			expect(container?.innerHTML).toContain('deferred');
		});
	});

	describe('provideStyle', () => {
		it('добавляет <style> в head', async () => {
			const { provideStyle } = await load();

			provideStyle(':root { --ui-color-base: red; }');

			const style = document.getElementById('flarian-ui-style');

			expect(style?.tagName).toBe('STYLE');
			expect(style?.textContent).toContain('--ui-color-base');
		});

		it('повторный вызов заменяет содержимое, не плодя элементы', async () => {
			const { provideStyle } = await load();

			provideStyle('a {}');
			provideStyle('b {}');

			expect(document.querySelectorAll('#flarian-ui-style')).toHaveLength(1);
			expect(document.getElementById('flarian-ui-style')?.textContent).toBe('b {}');
		});

		it('SSR: без document не бросает исключение', async () => {
			vi.stubGlobal('document', undefined);

			const { provideStyle } = await load();

			expect(() => provideStyle(':root {}')).not.toThrow();

			vi.unstubAllGlobals();
		});
	});
});

describe('MF: DOM-id из storagePrefix', () => {
	beforeEach(() => {
		vi.resetModules();
		document.getElementById('my-app-sprite')?.remove();
		document.getElementById('my-app-style')?.remove();
	});

	it('provideSprite/provideStyle используют префикс из конфига', async () => {
		const { provideConfig, provideSprite, provideStyle } = await import('./index');

		provideConfig({ storagePrefix: 'my-app' });
		provideSprite({ inline: '<svg id="s"></svg>' });
		provideStyle('a {}');

		expect(document.getElementById('my-app-sprite')).not.toBeNull();
		expect(document.getElementById('my-app-style')).not.toBeNull();
		expect(document.getElementById('flarian-ui-sprite')).toBeNull();
		expect(document.getElementById('flarian-ui-style')).toBeNull();

		document.getElementById('my-app-sprite')?.remove();
		document.getElementById('my-app-style')?.remove();
	});
});
