<p align="center">
  <img src="assets/img/logo1.png" alt="RepliSketch logo" width="420" />
</p>

<p align="center"><strong>Make beautiful figures and videos of DNA replication.</strong></p>

<p align="center">
  <a href="https://fberkemeier.github.io/RepliSketch/"><strong>Launch RepliSketch →</strong></a>
</p>

RepliSketch is a lightweight, browser-based studio for drawing, exploring, and animating DNA replication. Shape replication bubbles and forks directly on the canvas, tune the molecular geometry and colours, then export publication-ready figures or a complete S-phase animation.

## Use RepliSketch

Open the [live RepliSketch app](https://fberkemeier.github.io/RepliSketch/). No installation or build step is required.

## How it works

1. **Build the replication model.** Add origins on unreplicated DNA, drag bubbles or individual forks, split bubbles, and use <kbd>Shift</kbd> to add or extend strand breaks.
2. **Choose the visual language.** Switch between Standard, Schematic duplex, and Minimal lines; adjust length, base-pair resolution, strand dimensions, spacing, aspect, layers, colours, and fork shape.
3. **Explore S phase.** Move the S-phase slider or select **Run**. Choose discrete animation to advance one base pair at a time; RepliSketch preserves origin firing order and manually adjusted fork timing.
4. **Keep and revisit a design.** Save a configuration file, then load it later to continue editing every parameter and origin.
5. **Navigate the canvas.** Hold <kbd>Ctrl</kbd> while dragging to pan, use the mouse wheel to zoom, and use undo, redo, or reset whenever needed.

## Export

- **PNG** — transparent high-resolution raster image
- **SVG** — transparent editable vector artwork
- **PDF** — transparent print-ready vector artwork
- **MP4** — 60 fps animation of the complete configured replication timeline

A current Chromium-based browser provides the most reliable MP4 encoding experience. Portable MP4/H.264 does not support an alpha channel, so video frames use the configured preview background; the static formats remain transparent.

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
[fp409@cam.ac.uk](mailto:fp409@cam.ac.uk) · [github.com/fberkemeier](https://github.com/fberkemeier)

## License

RepliSketch is released under the [MIT License](LICENSE). The bundled Mediabunny library is distributed under the [Mozilla Public License 2.0](assets/vendor/MEDIABUNNY-LICENSE.txt).
