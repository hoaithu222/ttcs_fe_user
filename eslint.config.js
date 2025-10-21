/** @type {import('eslint').Linter.Config} */
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'react', 'react-hooks'],
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
        'plugin:prettier/recommended' // Luôn để cuối
    ],
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    settings: {
        react: {
            version: 'detect'
        },
        'import/resolver': {
            alias: {
                map: [['@', './src']],
                extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
            }
        }
    },
    rules: {
        // ✅ Cho phép không cần dấu chấm phẩy
        semi: ['error', 'never'],
        // ✅ Cho phép không import React với JSX (React 17+)
        'react/react-in-jsx-scope': 'off',
        // ✅ Cho phép dùng arrow function cho components
        'react/function-component-definition': 'off',
        // ✅ Tắt yêu cầu prop-types khi dùng TypeScript
        'react/prop-types': 'off'
    }
}
