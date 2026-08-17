<p align="center">
  <img src="assets/img/logo1.png" alt="RepliSketch logo" width="420" />
</p>

<p align="center"><strong>Make beautiful figures and videos of DNA replication.</strong></p>

<p align="center">
  <a href="https://fberkemeier.github.io/RepliSketch/"><strong>Launch RepliSketch →</strong></a>
</p>

RepliSketch is a lightweight, browser-based studio for drawing, exploring, and animating DNA replication. Shape replication bubbles and forks directly on the canvas, tune the molecular geometry and colours, then export publication-ready figures or a complete S-phase animation.

The **About** panel provides a concise overview and project contact details.

## Use RepliSketch

Open the [live RepliSketch app](https://fberkemeier.github.io/RepliSketch/). No installation or build step is required.

To test a local copy, serve the repository over localhost from its root directory:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/` in a current Chromium-based browser. Serving over localhost, rather than opening `index.html` directly, gives the animation encoder and file-saving APIs the most reliable browser context.

## How it works

1. **Build the replication model.** Add origins on unreplicated DNA, drag bubbles or individual forks, split bubbles, and use <kbd>Shift</kbd> to add or extend strand breaks. The bulk buttons remove every origin or break, while a small red × appears on hover for deleting one item. A fork becomes the selected, numbered object as soon as it is moved.
2. **Choose the visual language.** Switch between Standard, Straight, and Minimal; adjust length, base-pair resolution, strand dimensions, spacing, aspect, layers, colours, and fork shape. Molecules can contain up to 500 displayed base pairs. Length changes can either rescale the existing bar, which is the default, or preserve the genomic scale and extend or crop the chromosome at its right end.
3. **Colour base pairs.** Use one colour, split each rung between the colours of its connected strands, or assign separate A, T, G, and C colours to a balanced shuffled sequence of correctly complementary base pairs. The sequence is regenerated whenever genomic length or base-pair resolution changes.
4. **Refine the geometry.** Advanced options control where new DNA begins behind each fork, the phase shift between connected helical strands, crossover cutouts, end/merge smoothing, base-pair snapping, the preview grid, and whether exports include the configured background. Base pairs can appear instantly, fade at forks, or grow from both connected strands to meet at the midpoint; growth begins only after the configured New-DNA fork distance. Split-bubble clearance and merge/end smoothing use the same visual-clearance model, so fork transitions remain smooth as genomic length changes. In the Minimal model, approaching forks retain their ordinary curved transition until opposing centre-line points meet or a fork reaches a chromosome end; only then does smoothing lift the joined point gradually towards the two replicated strand levels, while **Snap** opens it immediately. When snapping is enabled, split forks, break endpoints, and unreplication regions are aligned to the base-pair lattice.
5. **Explore S phase.** Move the S-phase slider, select **Run**, or press <kbd>Space</kbd> to play and pause. Pressing Space at the completed S phase returns the molecule to the beginning and starts playback again. Discrete animation advances in base-pair steps at the same underlying fork speed as continuous playback while preserving origin firing order and manually adjusted fork timing.
6. **Keep and revisit a design.** Save a configuration file, then load it later to continue editing every parameter, colour, origin, fork adjustment, and advanced option.
7. **Navigate and reverse replication.** Drag the canvas to pan without changing the molecular controls. Hold <kbd>Ctrl</kbd>, drag across replicated DNA, and release to return that interval to an unreplicated state; Ctrl-dragging a fork instead continues to move both forks of its bubble symmetrically. Use the mouse wheel or zoom buttons to zoom from 10% to 400%. The two aspect sliders below the zoom tools independently stretch the artwork horizontally and vertically, while preserving stroke thickness, fork-transition geometry, and smooth helix sampling. Reset view restores both the camera and aspect.

The eye button opens the current SVG artwork alone in a new browser tab. **Download** exports an image or video, while **Menu** provides the About panel, links to the repository, documentation and issue tracker, and the System/Light/Dark theme control. Dark theme adapts the canvas, legend, labels, and configured background while preserving the selected molecular colours and fixed project-link colours.

## Export

- **PNG** — tightly cropped high-resolution raster image
- **SVG** — tightly cropped editable vector artwork
- **PDF** — tightly cropped print-ready vector artwork
- **MP4** — 60 fps animation of the complete configured replication timeline

PNG, SVG, and PDF exports are transparent by default. Enable **Include background in exports** in Advanced options to add the configured background while retaining the tight crop. MP4 frames always use the configured background because portable MP4/H.264 does not support an alpha channel.

Where supported, RepliSketch asks for the MP4 filename and destination before encoding begins. Browsers without the File System Access API use their standard download workflow instead. A current Chromium-based browser provides the most reliable MP4 encoding experience.

## Development

The app has no build step. Its logic tests use Node's built-in test runner:

```bash
node --test tests/replisketch.logic.test.cjs
```

## Citation

If RepliSketch supports your research, please cite the software using the metadata in [`CITATION.cff`](CITATION.cff). GitHub also exposes this through **Cite this repository**.

## Issues and suggestions

Bug reports, feature ideas, and scientific suggestions are very welcome. Please [open an issue](https://github.com/fberkemeier/RepliSketch/issues) or contact:

**Francisco Berkemeier**<br>
[fp409@cam.ac.uk](mailto:fp409@cam.ac.uk) · [github.com/fberkemeier](https://github.com/fberkemeier)

## License

RepliSketch is released under the [MIT License](LICENSE). The bundled Mediabunny library is distributed under the [Mozilla Public License 2.0](assets/vendor/MEDIABUNNY-LICENSE.txt).
