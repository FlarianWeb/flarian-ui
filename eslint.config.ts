import preset from '@flarian/frontend-preset/eslint';

export default [
	...(await preset({
		ignores: [
			'pnpm-lock.yaml',
			'dist/**',
			'coverage/**',
			'.histoire/**',
			'src/generated/**',
			'histoire/generated/**',
		],
	})),
	{
		// В ожидаемых значениях тестов числа и есть смысл: вынос в константы только спрятал бы, с чем сравниваем.
		files: ['**/*.spec.ts'],
		rules: {
			'no-magic-numbers': 'off',
		},
	},
];
