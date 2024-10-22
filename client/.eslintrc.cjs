module.exports = {
	root: true,
	env: {
		browser: true,
		es2020: true,
		node: true
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react/recommended',
		'plugin:react/jsx-runtime',
		'plugin:react-hooks/recommended',
		'plugin:react-refresh/recommended'
	],
	ignorePatterns: ['dist', '.eslintrc.cjs'],
	parser: '@typescript-eslint/parser',
	plugins: [
		'react',
		'react-hooks',
		'react-refresh',
		'@typescript-eslint'
	],
	settings: {
		react: {
			version: 'detect'
		}
	},
	rules: {
		'react/react-in-jsx-scope': 'off',
		'react/prop-types': 'off',
		'react-refresh/only-export-components': [
			'warn',
			{ allowConstantExport: true },
		],
	}
};
