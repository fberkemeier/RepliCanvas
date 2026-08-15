<p align="center">
  <img src="assets/img/replisketch_logo.png" alt="RepliSketch logo" width="150" />
</p>

<h1 align="center">RepliSketch</h1>

<p align="center"><strong>Make beautiful figures and videos of DNA replication.</strong></p>

RepliSketch is a lightweight, browser-based studio for drawing, exploring, and animating DNA replication. Shape replication bubbles and forks directly on the canvas, tune the molecular geometry and colours, then export publication-ready figures or a complete S-phase animation.

## Run locally

RepliSketch is a static HTML/CSS/JavaScript application: there is no installation or build step.

```bash
git clone https://github.com/fberkemeier/RepliSketch.git
cd RepliSketch
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000). On Windows, `py -m http.server 8000` works as an alternative.

## How it works

1. **Build the replication model.** Add origins on unreplicated DNA, drag bubbles or individual forks, split bubbles, and use <kbd>Shift</kbd> to add or extend strand breaks.
2. **Choose the visual language.** Switch between Standard, Schematic duplex, and Minimal lines; adjust length, base-pair resolution, strand dimensions, spacing, layers, colours, and fork shape.
3. **Explore S phase.** Move the S-phase slider or select **Run**. RepliSketch preserves origin firing order and manually adjusted fork timing as forks merge and reach chromosome ends.
4. **Navigate the canvas.** Hold <kbd>Ctrl</kbd> while dragging to pan, use the mouse wheel to zoom, and use undo, redo, or reset whenever needed.

## Export

- **PNG** — high-resolution raster image
- **SVG** — editable vector artwork
- **PDF** — print-ready vector output
- **MP4** — 60 fps animation of the complete configured replication timeline

A current Chromium-based browser provides the most reliable MP4 encoding experience.

## Development

The logic tests use Node's built-in test runner:

```bash
node --test tests/replisketch.logic.test.cjs
```

## Citation

If RepliSketch supports your research, please cite the software using the metadata in [`CITATION.cff`](CITATION.cff). GitHub also exposes this through **Cite this repository**.

## Issues and suggestions

Bug reports, feature ideas, and scientific suggestions are very welcome. Please [open an issue](https://github.com/fberkemeier/RepliSketch/issues) or contact:

**Francisco Berkemeier**  
[francisco.berkemeier@gmail.com](mailto:francisco.berkemeier@gmail.com) · [github.com/fberkemeier](https://github.com/fberkemeier)

## License

RepliSketch is released under the [MIT License](LICENSE). The bundled Mediabunny library is distributed under the [Mozilla Public License 2.0](assets/vendor/MEDIABUNNY-LICENSE.txt).
