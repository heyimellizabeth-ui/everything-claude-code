const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
    {
        ignores: [
            '.opencode/dist/**',
            '.cursor/**',
            'node_modules/**',
            'projects/sockwave/dist/**',
            'projects/sockwave/.astro/**'
        ]
    },
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
                ...globals.es2022
            }
        },
        rules: {
            'no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_'
            }],
            'no-undef': 'error',
            'eqeqeq': 'warn'
        }
    },
    {
        files: ['**/*.mjs'],
        languageOptions: {
            sourceType: 'module'
        }
    },
    {
        // Sockwave's engine is a browser ES module.
        files: ['projects/sockwave/src/**/*.mjs'],
        languageOptions: {
            globals: {
                ...globals.browser
            }
        }
    },
    {
        // Service workers run in the ServiceWorkerGlobalScope, not Node.
        files: ['**/service-worker.js'],
        languageOptions: {
            globals: {
                ...globals.serviceworker,
                ...globals.browser
            }
        }
    }
];
