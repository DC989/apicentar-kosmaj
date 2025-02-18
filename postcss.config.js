const purgecss = require("@fullhuman/postcss-purgecss");

module.exports = {
  plugins: [
    require("postcss-preset-env")(),
    require("autoprefixer")(),
    require("cssnano")(),
    purgecss({
      content: ["layouts/**/*.html", "content/**/*.md", "public/**/*.html"],
      safelist: {
        standard: [/is-/, /has-/, /navbar/, /button/, /card/], // Keep common Bulma classes
      },
      defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
    }),
  ],
};
