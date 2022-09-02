/* eslint-disable max-len */
const configs = require('@bluebase/code-standards/.eslintrc');

module.exports = {
	...configs,
	env: {
		...configs.env,
		jest: true,
	},
	settings: {
		react: {
			version: 'detect',
		},
	},
	rules: {
		...configs.rules,
		// '@typescript-eslint/interface-name-prefix': 0,
		// 'prefer-arrow/prefer-arrow-functions': 0,
	},
};
