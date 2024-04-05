export default {
  plugins: ['prettier-plugin-astro'],
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: false,
  printWidth: 120,
  arrowParens: 'avoid',
  overrides: [
    {
      files: "*.astro",
      options: { parser: "astro" }
    }
  ]
};
