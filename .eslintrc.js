module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es2021: true,
        mocha: true,
    },
    extends: [
        'airbnb-base',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
    },
    rules: {
        indent: ['error', 4],
        'no-use-before-define': ['error', { functions: false }],
        'no-await-in-loop': 0,
        'max-len': ['error', 120],
    },
};
