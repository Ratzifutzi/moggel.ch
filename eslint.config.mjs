// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.strict,
	tseslint.configs.stylistic,
	{
		languageOptions: {
			globals: {
				...globals.browser, // Includes browser globals like `console`, `window`, etc.
				...globals.node     // Includes Node.js globals like `process`, `Buffer`, etc.
			}
		}
	}
);