/** @type {import('prettier').Config} */
export default {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
  trailingComma: 'es5',
  printWidth: 100,
  arrowParens: 'avoid',
  endOfLine: 'auto',
  plugins: ['prettier'],
  overrides: [
    {
      files: '*.json',
      options: {
        tabWidth: 2,
      },
    },
  ],
}
