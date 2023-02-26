module.exports = {
  singleQuote: true,
  semi: false,
  plugins: [require('prettier-plugin-tailwindcss')],
  overrides: [
    {
      files: ['./pages/articles/**/*.mdx', './pages/articles/*.mdx'],
      options: {
        parser: 'mdx',
        proseWrap: 'preserve',
        'html-whitespace-sensitivity': 'ignore',
      },
    },
  ],
}
