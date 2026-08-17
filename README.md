<p align="center">
  <img src="assets/img/logo1.png" alt="RepliCanvas logo" width="420" />
</p>

<p align="center"><strong>Make beautiful figures and videos of DNA replication.</strong></p>

<p align="center">
  <a href="https://fberkemeier.github.io/RepliCanvas/"><strong>Launch RepliCanvas →</strong></a>
</p>

RepliCanvas is a lightweight, browser-based studio for creating publication-ready DNA replication diagrams and animations. Build replication programmes directly on the canvas, shape origins, bubbles and forks, customise molecular geometry and colours, and export the result as a figure or complete S-phase animation.

## Features

- Draw and edit replication origins, bubbles, forks and strand breaks interactively.
- Choose between Standard, Straight and Minimal DNA representations.
- Control base-pair resolution, strand geometry, replication spacing, colours, handedness, crossover behaviour and fork transitions.
- Animate S phase continuously or in discrete base-pair steps.
- Save and reload configurations, with automatic browser persistence between sessions.
- Preview artwork independently and export tightly cropped **PNG**, **SVG**, **PDF** and **MP4** files.
- Optional advanced styling includes multicolour base pairs, animated base-pair formation, dark mode, backgrounds and cartoon contours.

## Run locally

RepliCanvas has no build step. From the repository root:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/` in a modern Chromium-based browser.

## Development

Run the regression tests with:

```bash
node --test tests/replicanvas.logic.test.cjs
```

## Citation

If RepliCanvas supports your research, please cite the software using [`CITATION.cff`](CITATION.cff).

## Issues

Bug reports, suggestions and feature requests are welcome through the [GitHub issue tracker](https://github.com/fberkemeier/RepliCanvas/issues).

**Francisco Berkemeier**  
[fp409@cam.ac.uk](mailto:fp409@cam.ac.uk) · [github.com/fberkemeier](https://github.com/fberkemeier)

## License

RepliCanvas is released under the [MIT License](LICENSE). The bundled Mediabunny library is distributed under the [Mozilla Public License 2.0](assets/vendor/MEDIABUNNY-LICENSE.txt).
