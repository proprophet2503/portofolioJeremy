# portofolioJeremy

Personal portfolio for Jeremy Mattathias Mboe, ML Engineer.
Static site, no build step, deployed on GitHub Pages.

Live: https://proprophet2503.github.io/portofolioJeremy/

## Structure

```
index.html            Single page, all content
css/tokens.css        Design tokens (colour, type, spacing, motion)
css/base.css          Reset, typography, layout primitives, reveal animation
css/components.css    Nav, hero, project cards, timeline, footer
css/viz.css           Shared styling for the figures
js/main.js            Bootstrap: reveal, nav spy, repo grid, lazy viz mounting
js/data/repos.js      Secondary project list (edit here to add a repo)
js/viz/utils.js       Canvas, animation loop, seeded RNG, toggle binding
js/viz/*.js           One module per project figure
assets/               CV PDF and placeholder images
```

## Figures

Six project figures are drawn in the browser on canvas. They are **schematics of
the method**, generated from seeded synthetic data. They are not plots of measured
run output, and the page says so in two places.

| Module | Project | Shows |
| --- | --- | --- |
| `flow-matching.js` | SwaraTTS | Transport path from prior noise to the speech latent, flow matching against reverse diffusion |
| `modality-fusion.js` | AVID-MM | Which encoder branch stays active under each modality-dropout state |
| `beer-lambert.js` | PINN lung reconstruction | Ray integration through a thorax phantom and the resulting detector profile |
| `spiking.js` | Neuromorphic vision | Izhikevich membrane trace plus the derivative backprop receives, Heaviside against surrogate |
| `cough-lstm.js` | TB cough screening | Log-mel surface consumed frame by frame by an unrolled LSTM |
| `eeg-subbands.js` | EEG ALS screening | Delta through gamma decomposition with MAV, variance, and standard deviation per band |

Each figure mounts lazily when it approaches the viewport, pauses its animation
loop when scrolled off screen, and renders a single static frame under
`prefers-reduced-motion`.

## Placeholders to replace

| File | Used for | What to supply |
| --- | --- | --- |
| `assets/placeholders/og-image.svg` | Social preview card | A real 1200x630 PNG or JPG. Update the `og:image` meta tag in `index.html` to the new filename |
| `assets/placeholders/favicon.svg` | Browser tab icon | A real favicon. Update the `<link rel="icon">` tag |
| `assets/placeholders/portrait.svg` | Optional headshot | Not wired into the page yet. Add a photo here and place it in the hero if you want one |
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
