# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Tooling and common commands

This repo is a Hugo static site configured for multilingual content (Serbian and English) with a Dart&nbsp;Sass pipeline and PicoCSS.

Prerequisites:
- Hugo **extended** (version `0.144.1` is used in CI)
- Node.js + npm (for managing the PicoCSS dependency)

### Install dependencies

```bash
npm install
```

### Run local development server

Runs `hugo server` with garbage collection and disabled fast render.

```bash
npm run dev
```

The site will be served by Hugo with the multilingual configuration under `config/_default/hugo.toml`.

### Production build

CI builds the site for GitHub Pages using:

```bash
hugo \
  --gc \
  --minify \
  --environment production
```

This writes the rendered site to `public/`. Do not edit files under `public/` manually; they are build artifacts.

### Tests and linting

There is currently no automated test or lint configuration (no `test`/`lint` npm scripts or separate tooling). If you introduce tests or linters, add their usage here.

## High-level architecture

### Hugo configuration and environments

- Global configuration lives in `config/_default/hugo.toml`.
  - Sets `defaultContentLanguage` to Serbian (`sr`) and defines both `languages.sr` and `languages.en`.
  - Top navigation (`.Site.Menus.main`) is declared per language, with language-specific URLs (e.g., `/therapies/` vs `/en/therapies/`).
- Production-only overrides are in `config/production/hugo.toml` (notably the `baseURL` for the live site).
- Pages are rendered with Hugo’s extended pipeline and the Dart&nbsp;Sass transpiler via the `dartsass` partial.

### Content, sections, and translations

- Content is split by language under `content/`:
  - `content/sr` – Serbian pages (`about.md`, `gallery.md`, `pricing.md`, `services.md`, `therapies.md`).
  - `content/en` – English equivalents of the same sections.
  - `content/_index.md` – front matter for the home page.
- `archetypes/default.md` defines the default front matter for new content entries (date, draft flag, title derived from file name).
- Copy and UI strings used across templates are centralized via Hugo’s i18n system:
  - `i18n/sr.yaml` – Serbian translations.
  - `i18n/en.yaml` – English translations.
- Layouts access translations with the `i18n` function (e.g., `{{ i18n "index_title" }}`), so new text that appears in templates should be added to both i18n files.

### Layout system

Hugo templates live under `layouts/` and are built around a shared base layout.

- `layouts/_default/baseof.html` is the root HTML skeleton:
  - Sets `<html lang>` from `.Language.Lang` and applies a `page-<slug>` body class (used by Sass for page-specific styling).
  - Includes partials: `head`, `header`, and `footer`.
  - Defines the `main` block where page-specific content is injected.
  - Contains the only JavaScript in the project: mobile navigation toggling and image gallery modal behavior.
- `layouts/index.html` defines the home page layout:
  - Sections: `splash` (hero video and headline), `therapies`, `services`, and `about`.
  - Heavy use of `i18n` keys for all headings and copy, and embeds a Google Maps iframe.
- `layouts/_default/single.html` renders generic single content pages by outputting `{{ .Content }}` into the base layout’s `main` block.
- `layouts/miscellaneous/` contains custom layouts:
  - `gallery.html` – image gallery grid plus modal overlay (hooked up to the JS in `baseof.html`).
  - `single.html` – wrapper for inner content sections with consistent padding.
- `layouts/partials/` contains reusable fragments:
  - `head.html` – meta tags, `<title>`, Google Analytics/Tag Manager, Umami analytics, and inclusion of the `dartsass` partial.
  - `header.html` – top navigation bar, mobile hamburger toggle, and language switcher logic using `.Site.Languages` and `.Page.Translations`.
  - `footer.html` – bottom navigation plus contact info and Instagram link.
  - `dartsass.html` – Hugo asset pipeline configuration that compiles `assets/sass/main.scss` to `css/main.css`, fingerprinting and adding Subresource Integrity in production.

### Styling and asset pipeline

Custom styling is built on top of PicoCSS and structured modularly via Sass in `assets/sass/`.

- Entry point: `assets/sass/main.scss`
  - Imports PicoCSS from `node_modules/@picocss/pico`.
  - Imports local utility modules (`utils/`) and base layout modules (`base/`).
- Utilities (`assets/sass/utils/`):
  - `_variables.scss` – defines core CSS custom properties for colors (background, text, buttons) that theme the site.
  - `_breakpoints.scss` – central breakpoint map plus `@include breakpoint("size")` and `@include mobile-only` mixins used throughout layout styles.
  - `_fonts.scss` – `@font-face` declarations for the Playfair Display and Roboto font families, pointing to files under `static/fonts/`.
- Base partials (`assets/sass/base/`):
  - `_header.scss` – layout and responsive behavior for the header, including mobile menu animation based on `.header__nav-menu`.
  - `_main.scss` – main page sections:
    - `.splash`, `.therapies`, `.services`, `.about` blocks for the home page.
    - `.gallery` styles, including responsive columns and modal presentation.
    - `.page-about` overrides to style bullet lists on the About page.
  - `_footer.scss` – footer layout, responsive flexbox behavior, and link styling.

Hugo’s asset pipeline (via `dartsass.html`) compiles these into a single CSS file and injects it from the `head` partial.

### Static vs build output

- Source assets intended for processing live under:
  - `assets/` – Sass entrypoint and utilities consumed by Hugo’s pipeline.
  - `static/` – raw files (fonts, images, videos) served directly at the site root without processing.
- Built HTML, CSS, and copied static assets are output to `public/` by Hugo and are committed here for GitHub Pages hosting. Treat `public/` as generated code; do not modify files there manually.

### Deployment

- GitHub Actions workflow: `.github/workflows/hugo.yaml`.
  - Triggered on pushes to the `master` branch.
  - Installs Hugo extended (version `0.144.1`), Dart Sass, and Node dependencies.
  - Runs the production `hugo` build and uploads `public/` as the artifact for GitHub Pages.
- The live site’s base URL is configured via `config/production/hugo.toml` and the `HUGO_ENVIRONMENT=production` environment used in CI.

If you change the build process (e.g., additional asset steps, new environments, or a different output directory), update both the workflow and this file to keep them in sync.
