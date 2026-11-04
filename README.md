# portofolioJeremy

Personal portfolio for Jeremy Mattathias Mboe, ML Engineer.
Static site, no build step, deployed on GitHub Pages.

Live: https://proprophet2503.github.io/portofolioJeremy/

## Structure

```
index.html            Single page, all content
css/tokens.css        Design tokens (colour, type, spacing)
css/base.css          Reset, typography, layout primitives
css/components.css    Nav, hero, project cards, timeline, skills, footer
js/main.js            Nav highlighting, mobile menu, further-projects list, footer year
js/data/repos.js      Further projects list (edit here to add a project)
assets/               CV PDF and placeholder images
```

## Design

Light theme only (`color-scheme: light`), plain and text-first. Layout follows two
references: the hero, "learn more about my" buttons, alternating timeline and skills
grid come from a classic one-page academic portfolio; the project cards
(Highlights, Tags, Summary) and the "Further projects" list grouped by area follow
a Jekyll ML portfolio. No generated figures or scroll animations.

Fonts: Montserrat for headings, Source Sans 3 for body text. One accent colour,
`--accent` in `css/tokens.css`.

## Placeholders to replace

| File | Used for | What to supply |
| --- | --- | --- |
| `assets/placeholders/og-image.svg` | Social preview card | A real 1200x630 PNG or JPG. Update the `og:image` meta tag in `index.html` to the new filename |
| `assets/placeholders/favicon.svg` | Browser tab icon | A real favicon. Update the `<link rel="icon">` tag |
| `assets/placeholders/portrait.svg` | Optional headshot | Not wired in. Add `assets/portrait.jpg` (square) and uncomment the `hero-avatar` image at the top of the hero in `index.html` |
| `assets/Jeremy_Mattathias_Mboe_CV.pdf` | CV download | Current copy of `CV_TERBARU.pdf`. Replace whenever the CV is updated |

Two content values are worth revisiting as the work lands:

- SwaraTTS has no public repository link yet. Add one to the `project-links` block for project 01 when it exists.
- The PINN lung reconstruction section links to the programme, not to code. Same applies.

## Local preview

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. A plain `file://` open will not work because the
page uses ES modules.

## Deployment

Pushing to `main` publishes the site, once GitHub Pages is pointed at that branch
under Settings, Pages, Build and deployment, Deploy from a branch, `main` / root.
`.nojekyll` is present so Jekyll does not touch the directory.
