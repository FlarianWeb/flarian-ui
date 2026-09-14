import type { ResolvedUIConfig } from '../config/resolveUIConfig';

/**
 * Генерирует блокирующий inline-скрипт против FOUC.
 *
 * Применяет схему (localStorage → prefers-color-scheme при `auto` → дефолт),
 * тему (localStorage → theme.default) и поверхность (localStorage →
 * surface.default, всегда валидный ключ — в отличие от темы, без null-ветки)
 * на `<html>` до первой отрисовки.
 *
 * Атрибут `data-theme`/`data-surface` ставится только когда активное значение
 * **отличается** от `default` — сам `default` уже полностью покрыт `:root` в
 * `generateThemeCSS`/`generateSurfaceCSS`, дублирующий атрибут на `<html>`
 * не нужен (CSS-блок `[data-x='default']` при этом остаётся — он всё ещё
 * нужен, чтобы явный `data-theme="base"` во вложенном scope мог сбросить
 * унаследованную от родителя тему).
 *
 * Vite-плагин вставляет его в `<head>` автоматически (`transformIndexHtml`),
 * Nuxt-модуль — через `app.head.script`. Для бандлеров без HTML-пайплайна
 * (webpack) скрипт экспортируется — вставьте в шаблон вручную, передав
 * `resolveUIConfig(options)`.
 */
export const generateFoucScript = (resolved: ResolvedUIConfig): string => {
	const { scheme, theme, surface, storagePrefix: prefix } = resolved;
	const themeList = Object.keys(theme.list);
	const surfaceList = Object.keys(surface.list);

	const schemeFallback =
		scheme.default === 'auto'
			? "s=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';"
			: `s='${scheme.default}';`;

	const themePart =
		themeList.length > 0
			? [
					`var t=localStorage.getItem('${prefix}-theme');`,
					`if(${JSON.stringify(themeList)}.indexOf(t)<0){t=${
						theme.default ? `'${theme.default}'` : 'null'
					};}`,
					`if(t${theme.default ? `&&t!=='${theme.default}'` : ''}){d.setAttribute('${theme.attribute}',t);}`,
				].join('')
			: '';

	const surfacePart = [
		`var sf=localStorage.getItem('${prefix}-surface');`,
		`if(${JSON.stringify(surfaceList)}.indexOf(sf)<0){sf='${surface.default}';}`,
		`if(sf!=='${surface.default}'){d.setAttribute('${surface.attribute}',sf);}`,
	].join('');

	return [
		'(function(){try{',
		'var d=document.documentElement;',
		`var s=localStorage.getItem('${prefix}-scheme');`,
		`if(s!=='dark'&&s!=='light'){${schemeFallback}}`,
		`d.setAttribute('${scheme.attribute}',s==='dark'?'${scheme.dark}':'${scheme.light}');`,
		themePart,
		surfacePart,
		'}catch(e){}})();',
	].join('');
};
