/** Hex-записи: короткие #rgb/#rgba (группа 1) и полные #rrggbb/#rrggbbaa (группа 2) */
const HEX_PATTERN = /^#(?:([0-9a-f]{3,4})|([0-9a-f]{6}|[0-9a-f]{8}))$/;
const SHORT_HEX_CHUNK = 1;
const LONG_HEX_CHUNK = 2;
const HEX_RADIX = 16;
const CHANNEL_MAX = 255;
const RED = 0;
const GREEN = 1;
const BLUE = 2;

/**
 * Разбирает CSS-цвет в RGB-компоненты 0–255.
 * Поддерживает hex (#rgb, #rrggbb, с альфой) и rgb()/rgba() с числами 0–255.
 * Прочие форматы (oklch, hsl, var()…) не парсим — для них `onBase: 'auto'`
 * не сработает и поведение откатится к 'scheme' (см. generateThemeCSS).
 */
export const parseColor = (value: string): [number, number, number] | null => {
	const color = value.trim().toLowerCase();

	const hexMatch = HEX_PATTERN.exec(color);

	if (hexMatch) {
		const [, shortHex, longHex] = hexMatch;
		const hex = shortHex ?? longHex;
		const chunk = shortHex ? SHORT_HEX_CHUNK : LONG_HEX_CHUNK;
		const read = (i: number) => {
			const raw = hex.slice(i * chunk, i * chunk + chunk);

			return parseInt(shortHex ? raw + raw : raw, HEX_RADIX);
		};

		return [read(RED), read(GREEN), read(BLUE)];
	}

	const rgb = /^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/.exec(color);

	if (rgb) {
		const [r, g, b] = [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];

		if ([r, g, b].every(c => c <= CHANNEL_MAX)) {
			return [r, g, b];
		}
	}

	return null;
};

/** Константы sRGB-линеаризации и веса каналов из определения WCAG relative luminance */
const SRGB_LINEAR_THRESHOLD = 0.04045;
const SRGB_LINEAR_DIVISOR = 12.92;
const SRGB_GAMMA_OFFSET = 0.055;
const SRGB_GAMMA_SCALE = 1.055;
const SRGB_GAMMA = 2.4;
const LUMA_RED = 0.2126;
const LUMA_GREEN = 0.7152;
const LUMA_BLUE = 0.0722;

/**
 * WCAG relative luminance (0 — чёрный, 1 — белый).
 */
export const relativeLuminance = ([r, g, b]: [number, number, number]): number => {
	const linear = (channel: number): number => {
		const c = channel / CHANNEL_MAX;

		return c <= SRGB_LINEAR_THRESHOLD
			? c / SRGB_LINEAR_DIVISOR
			: ((c + SRGB_GAMMA_OFFSET) / SRGB_GAMMA_SCALE) ** SRGB_GAMMA;
	};

	return LUMA_RED * linear(r) + LUMA_GREEN * linear(g) + LUMA_BLUE * linear(b);
};

/**
 * Порог светлоты для выбора on-цвета.
 * Строгая WCAG-математика (≈0.179) на mid-tone цветах выбирает чёрный текст там,
 * где перцептивно лучше белый (зелёный #2eb82e, L≈0.40) — берём практический
 * порог: темнее 0.45 → светлый текст, светлее → тёмный (жёлтый #facc15, L≈0.63).
 * Спорные цвета задаются явно через `onBase: '<цвет>'`.
 */
const LUMINANCE_THRESHOLD = 0.45;

/**
 * Выбирает контрастный on-цвет для произвольного CSS-цвета.
 * `null` — цвет не распарсился, автоматика невозможна.
 */
export const pickOnColor = (value: string): 'black' | 'white' | null => {
	const rgb = parseColor(value);

	if (!rgb) {
		return null;
	}

	return relativeLuminance(rgb) < LUMINANCE_THRESHOLD ? 'white' : 'black';
};
