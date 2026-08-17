(() => {
  "use strict";

  const BASE_VIEW = Object.freeze({
    width: 1200,
    height: 640,
    x0: 48,
    x1: 1152,
    centerY: 310,
  });
  const BASE_MOLECULE_WIDTH = BASE_VIEW.x1 - BASE_VIEW.x0;
  const VIEW = {
    ...BASE_VIEW,
    moleculeWidth: BASE_MOLECULE_WIDTH,
  };

  const EPSILON = 0.0001;
  const APP_VERSION = "1.0.0";
  const CONFIG_FORMAT = "RepliSketch";
  const CONFIG_SCHEMA_VERSION = 1;
  const MAX_CONFIG_FILE_BYTES = 2 * 1024 * 1024;
  const HEX_COLOUR = /^#[\da-f]{6}$/i;
  const BASE_PAIRS_PER_TURN = 10;
  const BASE_PLAYBACK_SPEED = 2.75;
  const SPEED_MULTIPLIER_RANGE = Object.freeze({ min: 0.25, max: 3 });
  const CONTROL_RANGES = Object.freeze({
    progress: { min: 0, max: 100 },
    speed: {
      min: BASE_PLAYBACK_SPEED * SPEED_MULTIPLIER_RANGE.min,
      max: BASE_PLAYBACK_SPEED * SPEED_MULTIPLIER_RANGE.max,
    },
    length: { min: 10, max: 1250 },
    pairResolution: { min: 1, max: 10 },
    basePairWidth: { min: 0.2, max: 16 },
    weight: { min: 1, max: 20 },
    daughterSpacing: { min: 64, max: 800 },
    doubleStrandHeight: { min: 8, max: 160 },
    transitionTightness: { min: -100, max: 100 },
    terminalSmoothing: { min: 0, max: 6 },
    newDnaStartDistance: { min: 0, max: 20 },
    strandPhaseShift: { min: -5, max: 5 },
    aspectX: { min: 0.1, max: 10 },
    aspectY: { min: 0.1, max: 10 },
  });
  const MIN_PAIR_RESOLUTION = CONTROL_RANGES.pairResolution.min;
  const MAX_BASE_PAIR_COUNT = 500;
  const GRID_COLUMN_COUNT = 12;
  const BASE_PAIR_COLOR_MODES = new Set(["single", "strand", "bases"]);
  const BASE_PAIR_TRANSITION_MODES = new Set(["fade", "grow", "instant"]);
  const LENGTH_MODES = new Set(["scale", "extend"]);
  const BASE_PAIR_VARIANTS = Object.freeze([
    Object.freeze(["A", "T"]),
    Object.freeze(["T", "A"]),
    Object.freeze(["G", "C"]),
    Object.freeze(["C", "G"]),
  ]);
  const BASE_PAIR_VARIATION_BLOCK_SIZE = 8;
  const CROSSOVER_REFERENCE_LENGTH = 50;
  const MAX_PAIR_RESOLUTION = CONTROL_RANGES.pairResolution.max;
  const NASCENT_PROFILE_THRESHOLD = 0.38;
  const PARENTAL_PAIR_FADE_END = 0.12;
  const BASE_PAIR_MAX_SPACING_RATIO = 1 / 3;
  const HISTORY_LIMIT = 30;
  const EXPORT_PADDING = 12;
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 4;
  const FORK_COLLAPSE_PX = 8;
  // Raw replication intervals are compared before the display model resolves
  // colliding forks. Keep this tolerance far below a screen pixel so bubbles
  // must genuinely touch or overlap before they are consumed.
  const RAW_BUBBLE_MERGE_EPSILON = 1e-8;
  const FORK_TERMINAL_BLEND_PX = 28;
  const SCHEMATIC_NASCENT_MIN_GAP_PX = 6;
  const SCHEMATIC_NASCENT_CONNECTION_PX = 12;
  const CUT_DRAG_THRESHOLD_PX = 4;
  const PAN_DRAG_THRESHOLD_PX = 4;
  const ASPECT_SLIDER_LIMIT = 100;
  const MAX_PATH_SAMPLE_POINTS = 12000;
  const VIDEO_FRAME_RATE = 60;
  const VIDEO_BITS_PER_SECOND = 5_000_000;
  const PROGRESS_PER_MILLISECOND = 0.006;
  // Match the former default four-fork pace, then keep that world-space speed
  // constant as forks merge or reach chromosome ends.
  const FORK_TRAVEL_PER_MILLISECOND = PROGRESS_PER_MILLISECOND / 400;
  const DEFAULT_ORIGIN_OFFSET = 0;
  const DEFAULT_ORIGINS = Object.freeze([
    Object.freeze({
      id: "origin-6",
      position: 0.3,
      startPosition: 0.3,
      leftOffset: DEFAULT_ORIGIN_OFFSET,
      rightOffset: DEFAULT_ORIGIN_OFFSET,
    }),
    Object.freeze({
      id: "origin-5",
      position: 0.7,
      startPosition: 0.7,
      leftOffset: DEFAULT_ORIGIN_OFFSET,
      rightOffset: DEFAULT_ORIGIN_OFFSET,
    }),
  ]);

  const DEFAULTS = {
    length: 50,
    progress: 0,
    forkTravel: 0,
    pairResolution: 3,
    basePairWidth: 5,
    weight: 6,
    doubleStrandHeight: 46,
    daughterSpacing: 160,
    speed: BASE_PLAYBACK_SPEED,
    discreteAnimation: false,
    basePairColorMode: "single",
    basePairSeed: 3815474507,
    colors: {
      templateA: "#067e94",
      templateB: "#022851",
      newDna: "#8b1e2d",
      basePair: "#022851",
      adenine: "#d1495b",
      thymine: "#edae49",
      guanine: "#00798c",
      cytosine: "#30638e",
    },
    layers: {
      pairs: true,
      newDna: true,
      labels: true,
    },
    advanced: {
      strandModel: "standard",
      transitionTightness: 0,
      terminalSmoothing: 1.5,
      crossoverGaps: false,
      grid: true,
      alwaysShowControls: true,
      snapToBasePairs: false,
      basePairTransition: "fade",
      lengthMode: "scale",
      includeExportBackground: false,
      newDnaStartDistance: 0,
      strandPhaseShift: 0,
      aspectX: 1,
      aspectY: 1,
      backgroundColor: "#f8faf9",
    },
  };

  const elements = {};
  const history = [];
  const redoHistory = [];
  let state;
  let nextOriginId = 1;
  let dragState = null;
  let animationFrame = 0;
  let previousAnimationTime = 0;
  let isVideoExporting = false;
  let videoDownloadUrl = "";
  let pendingControlSnapshot = null;
  let viewState = { zoom: 1, panX: 0, panY: 0 };
  let hoverState = null;
  let modifierState = { shift: false, special: false };
  let themeMode = "system";
  let artworkStrokeScale = 1;
  let aboutReturnFocus = null;
  const forkPlaybackClocks = new WeakMap();

  const byId = (id) => document.getElementById(id);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const boundedControlValue = (name, value, fallback = DEFAULTS[name]) => {
    const range = CONTROL_RANGES[name];
    const configured = Number(value);
    const resolved = Number.isFinite(configured) ? configured : fallback;
    return clamp(resolved, range.min, range.max);
  };
  const playbackSpeed = (sourceState = state) => {
    const configured = Number(sourceState?.speed);
    return boundedControlValue(
      "speed",
      Number.isFinite(configured) && configured > 0 ? configured : DEFAULTS.speed,
      DEFAULTS.speed
    );
  };
  const speedMultiplier = (sourceState = state) =>
    clamp(
      playbackSpeed(sourceState) / BASE_PLAYBACK_SPEED,
      SPEED_MULTIPLIER_RANGE.min,
      SPEED_MULTIPLIER_RANGE.max
    );
  const playbackSpeedFromMultiplier = (value) => {
    const configured = Number(value);
    const multiplier = clamp(
      Number.isFinite(configured) ? configured : 1,
      SPEED_MULTIPLIER_RANGE.min,
      SPEED_MULTIPLIER_RANGE.max
    );
    return boundedControlValue("speed", multiplier * BASE_PLAYBACK_SPEED, DEFAULTS.speed);
  };
  const speedMultiplierLabel = (sourceState = state) => {
    const value = speedMultiplier(sourceState);
    return `${Number(value.toFixed(2))}x`;
  };
  const fixed = (value) => Number(value).toFixed(1);
  const precise = (value) => Number(value).toFixed(4);
  const fixedUiTransform = (x, y) => {
    const scaleX = 1 / (viewState.zoom * artworkScaleX());
    const scaleY = 1 / (viewState.zoom * artworkAspectY());
    const scale = Math.abs(scaleX - scaleY) < 1e-9
      ? `scale(${precise(scaleX)})`
      : `scale(${precise(scaleX)} ${precise(scaleY)})`;
    return `translate(${fixed(x)} ${fixed(y)}) ${scale}`;
  };
  const smoothstep = (value) => {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  };

  function withArtworkStrokeScale(scale, callback) {
    const previous = artworkStrokeScale;
    artworkStrokeScale = Math.max(EPSILON, Number(scale) || 1);
    try {
      return callback();
    } finally {
      artworkStrokeScale = previous;
    }
  }

  function artworkStrokeAttributes(width) {
    const baseWidth = Math.max(0, Number(width) || 0);
    return `stroke-width="${fixed(baseWidth * artworkStrokeScale)}" data-rs-stroke-width="${fixed(
      baseWidth
    )}" vector-effect="non-scaling-stroke"`;
  }

  function normaliseExportStrokeWidths(root) {
    root?.querySelectorAll?.("[data-rs-stroke-width]").forEach((element) => {
      const width = element.getAttribute("data-rs-stroke-width");
      if (width !== null) element.setAttribute("stroke-width", width);
      element.removeAttribute("data-rs-stroke-width");
    });
    return root;
  }

  function randomBasePairSeed() {
    try {
      const values = new Uint32Array(1);
      globalThis.crypto?.getRandomValues?.(values);
      if (values[0]) return values[0] >>> 0;
    } catch {
      // Restricted contexts can fall back to the local pseudorandom generator.
    }
    return Math.floor(Math.random() * 0x1_0000_0000) >>> 0;
  }


  function reseedBasePairSequence(sourceState = state, seed = randomBasePairSeed()) {
    if (!sourceState || typeof sourceState !== "object") return 0;
    const current = Math.trunc(Number(sourceState.basePairSeed) || 0) >>> 0;
    let next = Math.trunc(Number(seed) || 0) >>> 0;
    if (next === current) next = (current + 0x9e3779b9) >>> 0;
    sourceState.basePairSeed = next;
    return next;
  }

  function invertHexColour(colour) {
    const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(String(colour || ""));
    if (!match) return colour;
    const inverted = match
      .slice(1)
      .map((channel) => (255 - Number.parseInt(channel, 16)).toString(16).padStart(2, "0"))
      .join("");
    return `#${inverted}`;
  }

  function darkArtworkEnabled() {
    return resolvedTheme(themeMode) === "dark";
  }

  // User-selected molecular colours are literal artwork settings and remain
  // unchanged across interface themes. Dark mode only adapts the surrounding
  // canvas, labels, grid, and application chrome.
  function artworkColour(colour) {
    return colour;
  }

  function stateArtworkColour(key, sourceState = state) {
    return sourceState?.colors?.[key] ?? DEFAULTS.colors[key];
  }

  function canvasBackgroundColor(sourceState = state) {
    const colour = sourceState?.advanced?.backgroundColor || DEFAULTS.advanced.backgroundColor;
    return darkArtworkEnabled() ? invertHexColour(colour) : colour;
  }

  function backgroundControlColor(sourceState = state) {
    return canvasBackgroundColor(sourceState);
  }

  function configuredBackgroundColor(displayedColour) {
    return darkArtworkEnabled() ? invertHexColour(displayedColour) : displayedColour;
  }

  function strandModel(sourceState = state) {
    const configured = sourceState?.advanced?.strandModel;
    if (["standard", "elegant", "minimal"].includes(configured)) return configured;
    return sourceState?.advanced?.simplified ? "elegant" : "standard";
  }

  function transitionTightness(sourceState = state) {
    return (
      boundedControlValue(
        "transitionTightness",
        sourceState?.advanced?.transitionTightness,
        DEFAULTS.advanced.transitionTightness
      ) / 100
    );
  }

  function transitionTightnessLabel(sourceState = state) {
    const value = Math.round(transitionTightness(sourceState) * 100);
    if (value === -100) return "Circular";
    if (value < 0) return `Rounded ${Math.abs(value)}%`;
    if (value === 0) return "Smooth";
    if (value === 100) return "Sharp";
    return `${value}%`;
  }

  function terminalSmoothing(sourceState = state) {
    return boundedControlValue(
      "terminalSmoothing",
      sourceState?.advanced?.terminalSmoothing,
      DEFAULTS.advanced.terminalSmoothing
    );
  }

  function terminalSmoothingLabel(sourceState = state) {
    const value = terminalSmoothing(sourceState);
    if (value <= EPSILON) return "Snap";
    const effectiveBasePairs = effectiveTerminalSmoothing(sourceState);
    return `${Number(effectiveBasePairs.toFixed(2))} bp`;
  }

  function transitionProfile(value, sourceState = state) {
    const progress = clamp(value, 0, 1);
    const tightness = transitionTightness(sourceState);
    if (tightness >= 0) return smoothstep(progress);
    const circular = Math.sqrt(Math.max(0, 1 - (1 - progress) ** 2));
    return smoothstep(progress) * (1 + tightness) + circular * -tightness;
  }

  function doubleStrandHalfHeight(sourceState = state) {
    return boundedControlValue("doubleStrandHeight", sourceState?.doubleStrandHeight) / 2;
  }

  function modelSupportsDoubleStrandDetails(sourceState = state) {
    return strandModel(sourceState) !== "minimal";
  }

  function basePairResolution(sourceState = state) {
    const configured = Number(sourceState?.pairResolution);
    return clamp(
      Number.isFinite(configured) ? Math.round(configured) : DEFAULTS.pairResolution,
      MIN_PAIR_RESOLUTION,
      MAX_PAIR_RESOLUTION
    );
  }

  function maximumLengthForBasePairCount(sourceState = state) {
    const resolution = basePairResolution(sourceState);
    const edgeOffset = resolution % 2 === 0 ? 0.5 : 0;
    const maximumCrossovers = Math.max(
      1,
      Math.floor((MAX_BASE_PAIR_COUNT + edgeOffset * 2) / (resolution + 1))
    );
    return clamp(
      maximumCrossovers * (BASE_PAIRS_PER_TURN / 2),
      CONTROL_RANGES.length.min,
      CONTROL_RANGES.length.max
    );
  }

  function boundedLengthValue(value, sourceState = state) {
    const configured = Number(value);
    const configuredFallback = Number(sourceState?.length);
    const fallback = Number.isFinite(configuredFallback) ? configuredFallback : DEFAULTS.length;
    const resolved = Number.isFinite(configured) ? configured : fallback;
    return clamp(
      resolved,
      CONTROL_RANGES.length.min,
      maximumLengthForBasePairCount(sourceState)
    );
  }

  function lengthMode(sourceState = state) {
    const configured = sourceState?.advanced?.lengthMode;
    return LENGTH_MODES.has(configured) ? configured : DEFAULTS.advanced.lengthMode;
  }

  function referenceCrossoverCount() {
    return Math.max(
      1,
      Math.round((CROSSOVER_REFERENCE_LENGTH / BASE_PAIRS_PER_TURN) * 2)
    );
  }

  function moleculeWidthForState(sourceState = state) {
    if (lengthMode(sourceState) !== "extend") return BASE_MOLECULE_WIDTH;
    const currentCrossovers = Math.max(1, crossoverCount(sourceState));
    return BASE_MOLECULE_WIDTH * (currentCrossovers / referenceCrossoverCount());
  }

  function syncViewGeometry(sourceState = state) {
    const width = Math.max(1, moleculeWidthForState(sourceState));
    VIEW.x0 = BASE_VIEW.x0;
    VIEW.moleculeWidth = width;
    VIEW.x1 = VIEW.x0 + width;
    return VIEW;
  }

  function genomeDistanceScale(sourceState = state) {
    if (lengthMode(sourceState) !== "extend") return 1;
    return BASE_MOLECULE_WIDTH / Math.max(EPSILON, moleculeWidthForState(sourceState));
  }

  function gridColumnCount(sourceState = state) {
    if (lengthMode(sourceState) !== "extend") return GRID_COLUMN_COUNT;
    const fixedStep = BASE_MOLECULE_WIDTH / GRID_COLUMN_COUNT;
    return Math.max(1, Math.ceil(moleculeWidthForState(sourceState) / fixedStep - EPSILON));
  }

  function gridWorldStep(sourceState = state) {
    // A right-extending genome adds columns without changing the existing grid.
    // Scale-within-bar mode continues to derive the grid from the current bar.
    return lengthMode(sourceState) === "extend"
      ? BASE_MOLECULE_WIDTH / GRID_COLUMN_COUNT
      : moleculeWidthForState(sourceState) / GRID_COLUMN_COUNT;
  }

  function resizeGenomeLength(value, sourceState = state) {
    const configuredPreviousLength = Number(sourceState?.length);
    const previousLength = clamp(
      Number.isFinite(configuredPreviousLength) ? configuredPreviousLength : DEFAULTS.length,
      CONTROL_RANGES.length.min,
      CONTROL_RANGES.length.max
    );
    const nextLength = boundedLengthValue(value, { ...sourceState, length: previousLength });
    if (Math.abs(nextLength - previousLength) <= EPSILON) {
      sourceState.length = nextLength;
      syncViewGeometry(sourceState);
      return nextLength;
    }

    if (lengthMode(sourceState) === "extend" && previousLength > EPSILON) {
      // Extension mode anchors genomic coordinates to the left end. Scaling
      // every fractional coordinate by old/new preserves the absolute positions
      // of origins, forks, replicated regions, and breaks while new genome is
      // appended on the right. Shrinking crops objects beyond the new end.
      const fractionScale = previousLength / nextLength;
      const scaleDistance = (valueToScale) =>
        clamp((Number(valueToScale) || 0) * fractionScale, -2, 2);

      sourceState.forkTravel = scaleDistance(sourceState.forkTravel);
      sourceState.origins = (sourceState.origins || [])
        .map((origin) => {
          const startPosition = (Number(origin.startPosition) || 0) * fractionScale;
          if (startPosition > 1 + EPSILON) return null;
          const position = clamp(startPosition, 0, 1);
          return {
            ...origin,
            startPosition: position,
            position,
            leftOffset: scaleDistance(origin.leftOffset),
            rightOffset: scaleDistance(origin.rightOffset),
          };
        })
        .filter(Boolean);

      sourceState.cuts = normaliseCutRegions(
        (sourceState.cuts || [])
          .map((cut) => {
            const range = cutRange(cut);
            return {
              start: range.start * fractionScale,
              end: range.end * fractionScale,
            };
          })
          .filter((cut) => cut.start <= 1 + EPSILON && cut.end >= -EPSILON)
          .map((cut) => ({
            start: clamp(cut.start, 0, 1),
            end: clamp(cut.end, 0, 1),
          }))
      );

      const remainingOriginIds = new Set(sourceState.origins.map((origin) => origin.id));
      if (!remainingOriginIds.has(sourceState.selectedOriginId)) sourceState.selectedOriginId = null;
      if (!remainingOriginIds.has(sourceState.selectedFork?.originId)) sourceState.selectedFork = null;
      if (!sourceState.origins.length) {
        sourceState.forkTravel = 0;
        sourceState.progress = 0;
      }
    }

    sourceState.length = nextLength;
    syncViewGeometry(sourceState);
    resetForkPlaybackClock(sourceState);
    return nextLength;
  }

  function basePairColorMode(sourceState = state) {
    const configured = sourceState?.basePairColorMode;
    return BASE_PAIR_COLOR_MODES.has(configured) ? configured : DEFAULTS.basePairColorMode;
  }

  function basePairTransitionMode(sourceState = state) {
    const configured = sourceState?.advanced?.basePairTransition;
    return BASE_PAIR_TRANSITION_MODES.has(configured)
      ? configured
      : DEFAULTS.advanced.basePairTransition;
  }

  function newDnaStartDistance(sourceState = state) {
    return boundedControlValue(
      "newDnaStartDistance",
      sourceState?.advanced?.newDnaStartDistance,
      DEFAULTS.advanced.newDnaStartDistance
    );
  }

  function newDnaStartDistanceLabel(sourceState = state) {
    const value = newDnaStartDistance(sourceState);
    return `${Number(value.toFixed(2))} bp`;
  }

  function strandPhaseShift(sourceState = state) {
    return boundedControlValue(
      "strandPhaseShift",
      sourceState?.advanced?.strandPhaseShift,
      DEFAULTS.advanced.strandPhaseShift
    );
  }

  function strandPhaseShiftLabel(sourceState = state) {
    const value = strandPhaseShift(sourceState);
    if (Math.abs(value) <= EPSILON) return "0 bp";
    return `${value > 0 ? "+" : ""}${Number(value.toFixed(2))} bp`;
  }

  function artworkAspectX(sourceState = state) {
    return boundedControlValue("aspectX", sourceState?.advanced?.aspectX, DEFAULTS.advanced.aspectX);
  }

  function artworkAspectY(sourceState = state) {
    return boundedControlValue("aspectY", sourceState?.advanced?.aspectY, DEFAULTS.advanced.aspectY);
  }

  function artworkScaleX(sourceState = state) {
    return artworkAspectX(sourceState);
  }

  function artworkTransformComponents(sourceState = state) {
    const scaleX = artworkAspectX(sourceState);
    const scaleY = artworkAspectY(sourceState);
    // A fixed-scale genome grows from the left chromosome end, so horizontal
    // aspect must use that same anchor or extending the right end would shift
    // all existing genomic features. Scale-changing bars retain the familiar
    // centred aspect transform.
    const pivotX = lengthMode(sourceState) === "extend"
      ? BASE_VIEW.x0
      : BASE_VIEW.x0 + moleculeWidthForState(sourceState) / 2;
    return {
      scaleX,
      scaleY,
      translateX: pivotX * (1 - scaleX),
      translateY: VIEW.centerY * (1 - scaleY),
    };
  }

  function transformedArtworkPoint(x, y, sourceState = state) {
    const transform = artworkTransformComponents(sourceState);
    return {
      x: transform.scaleX * x + transform.translateX,
      y: transform.scaleY * y + transform.translateY,
    };
  }

  function aspectKey(axis) {
    return axis === "y" ? "aspectY" : "aspectX";
  }

  function aspectSliderValue(axis, sourceState = state) {
    const key = aspectKey(axis);
    const factor = key === "aspectY" ? artworkAspectY(sourceState) : artworkAspectX(sourceState);
    const range = CONTROL_RANGES[key];
    if (Math.abs(factor - 1) <= EPSILON) return 0;
    if (factor > 1) {
      return clamp(
        (Math.log(factor) / Math.log(range.max)) * ASPECT_SLIDER_LIMIT,
        0,
        ASPECT_SLIDER_LIMIT
      );
    }
    return clamp(
      -(Math.log(factor) / Math.log(range.min)) * ASPECT_SLIDER_LIMIT,
      -ASPECT_SLIDER_LIMIT,
      0
    );
  }

  function aspectFactorFromSlider(axis, sliderValue) {
    const key = aspectKey(axis);
    const range = CONTROL_RANGES[key];
    const configured = Number(sliderValue);
    const value = clamp(
      Number.isFinite(configured) ? configured : 0,
      -ASPECT_SLIDER_LIMIT,
      ASPECT_SLIDER_LIMIT
    );
    const factor = value >= 0
      ? range.max ** (value / ASPECT_SLIDER_LIMIT)
      : range.min ** (-value / ASPECT_SLIDER_LIMIT);
    return boundedControlValue(key, factor, DEFAULTS.advanced[key]);
  }

  function artworkAspectTransform(sourceState = state) {
    const transform = artworkTransformComponents(sourceState);
    return `matrix(${precise(transform.scaleX)} 0 0 ${precise(transform.scaleY)} ${precise(
      transform.translateX
    )} ${precise(transform.translateY)})`;
  }

  function normaliseStateSchema(sourceState) {
    sourceState.colors = { ...DEFAULTS.colors, ...(sourceState.colors || {}) };
    sourceState.layers = { ...DEFAULTS.layers, ...(sourceState.layers || {}) };
    sourceState.basePairColorMode = basePairColorMode(sourceState);
    const configuredSeed = Number(sourceState.basePairSeed);
    sourceState.basePairSeed = Number.isFinite(configuredSeed)
      ? Math.trunc(configuredSeed) >>> 0
      : DEFAULTS.basePairSeed;
    const configuredModel = sourceState.advanced?.strandModel;
    const legacySimplified = Boolean(sourceState.advanced?.simplified);
    sourceState.advanced = { ...DEFAULTS.advanced, ...(sourceState.advanced || {}) };
    if (!["standard", "elegant", "minimal"].includes(configuredModel)) {
      sourceState.advanced.strandModel = legacySimplified ? "elegant" : DEFAULTS.advanced.strandModel;
    }
    delete sourceState.advanced.simplified;
    sourceState.advanced.transitionTightness = boundedControlValue(
      "transitionTightness",
      sourceState.advanced.transitionTightness,
      DEFAULTS.advanced.transitionTightness
    );
    sourceState.advanced.terminalSmoothing = boundedControlValue(
      "terminalSmoothing",
      sourceState.advanced.terminalSmoothing,
      DEFAULTS.advanced.terminalSmoothing
    );
    sourceState.advanced.newDnaStartDistance = newDnaStartDistance(sourceState);
    sourceState.advanced.strandPhaseShift = strandPhaseShift(sourceState);
    sourceState.advanced.aspectX = artworkAspectX(sourceState);
    sourceState.advanced.aspectY = artworkAspectY(sourceState);
    sourceState.advanced.crossoverGaps = sourceState.advanced.crossoverGaps === true;
    sourceState.advanced.grid = sourceState.advanced.grid !== false;
    sourceState.advanced.alwaysShowControls = sourceState.advanced.alwaysShowControls !== false;
    sourceState.advanced.snapToBasePairs = sourceState.advanced.snapToBasePairs === true;
    sourceState.advanced.basePairTransition = basePairTransitionMode(sourceState);
    sourceState.advanced.lengthMode = lengthMode(sourceState);
    sourceState.advanced.includeExportBackground = sourceState.advanced.includeExportBackground === true;
    sourceState.discreteAnimation = sourceState.discreteAnimation === true;
    sourceState.pairResolution = basePairResolution(sourceState);
    sourceState.length = boundedLengthValue(sourceState.length, sourceState);
    sourceState.progress = boundedControlValue("progress", sourceState.progress);
    sourceState.basePairWidth = boundedControlValue("basePairWidth", sourceState.basePairWidth);
    sourceState.weight = boundedControlValue("weight", sourceState.weight);
    sourceState.doubleStrandHeight = boundedControlValue("doubleStrandHeight", sourceState.doubleStrandHeight);
    sourceState.daughterSpacing = boundedControlValue("daughterSpacing", sourceState.daughterSpacing);
    sourceState.speed = playbackSpeed(sourceState);
    sourceState.selectedFork = isPlainRecord(sourceState.selectedFork)
      && typeof sourceState.selectedFork.originId === "string"
      && ["left", "right"].includes(sourceState.selectedFork.side)
      ? { originId: sourceState.selectedFork.originId, side: sourceState.selectedFork.side }
      : null;
    return sourceState;
  }

  function isPlainRecord(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
  }

  function invalidConfiguration(message = "invalid or damaged file") {
    const error = new Error(message);
    error.name = "RepliSketchConfigurationError";
    return error;
  }

  function configurationNumber(value, path, minimum = -Infinity, maximum = Infinity) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < minimum || value > maximum) {
      throw invalidConfiguration(`${path} is invalid`);
    }
    return value;
  }

  function sanitiseConfigurationSettings(source, defaults, path) {
    const supplied = source === undefined ? {} : source;
    if (!isPlainRecord(supplied)) throw invalidConfiguration(`${path} is invalid`);

    const result = {};
    Object.entries(defaults).forEach(([key, fallback]) => {
      const value = Object.prototype.hasOwnProperty.call(supplied, key) ? supplied[key] : fallback;
      const valuePath = `${path}.${key}`;
      if (isPlainRecord(fallback)) {
        result[key] = sanitiseConfigurationSettings(value, fallback, valuePath);
      } else if (typeof fallback === "number") {
        result[key] = configurationNumber(value, valuePath);
      } else if (typeof fallback === "boolean") {
        if (typeof value !== "boolean") throw invalidConfiguration(`${valuePath} is invalid`);
        result[key] = value;
      } else if (typeof fallback === "string") {
        if (typeof value !== "string" || value.length > 128 || /[\u0000-\u001f]/.test(value)) {
          throw invalidConfiguration(`${valuePath} is invalid`);
        }
        if (HEX_COLOUR.test(fallback) && !HEX_COLOUR.test(value)) {
          throw invalidConfiguration(`${valuePath} must be a six-digit hexadecimal colour`);
        }
        if (key === "strandModel" && !["standard", "elegant", "minimal"].includes(value)) {
          throw invalidConfiguration(`${valuePath} is invalid`);
        }
        if (key === "basePairColorMode" && !BASE_PAIR_COLOR_MODES.has(value)) {
          throw invalidConfiguration(`${valuePath} is invalid`);
        }
        if (key === "basePairTransition" && !BASE_PAIR_TRANSITION_MODES.has(value)) {
          throw invalidConfiguration(`${valuePath} is invalid`);
        }
        if (key === "lengthMode" && !LENGTH_MODES.has(value)) {
          throw invalidConfiguration(`${valuePath} is invalid`);
        }
        result[key] = value;
      } else {
        throw invalidConfiguration(`${valuePath} uses an unsupported value`);
      }
    });
    return result;
  }

  function sanitiseConfigurationState(sourceState) {
    if (!isPlainRecord(sourceState)) throw invalidConfiguration("state is missing or invalid");

    const candidate = sanitiseConfigurationSettings(sourceState, DEFAULTS, "state");
    if (Math.abs(candidate.forkTravel) > 2) throw invalidConfiguration("state.forkTravel is invalid");
    if (!Array.isArray(sourceState.origins)) throw invalidConfiguration("state.origins is invalid");

    const originIds = new Set();
    candidate.origins = sourceState.origins.map((origin, index) => {
      const path = `state.origins[${index}]`;
      if (!isPlainRecord(origin)) throw invalidConfiguration(`${path} is invalid`);
      if (typeof origin.id !== "string" || !/^[a-z\d][a-z\d_-]{0,63}$/i.test(origin.id)) {
        throw invalidConfiguration(`${path}.id is invalid`);
      }
      if (originIds.has(origin.id)) throw invalidConfiguration(`${path}.id is duplicated`);
      originIds.add(origin.id);
      const startPosition = configurationNumber(
        origin.startPosition ?? origin.position,
        `${path}.startPosition`,
        0,
        1
      );
      const position = configurationNumber(origin.position ?? startPosition, `${path}.position`, 0, 1);
      return {
        id: origin.id,
        position,
        startPosition,
        leftOffset: configurationNumber(origin.leftOffset, `${path}.leftOffset`, -2, 2),
        rightOffset: configurationNumber(origin.rightOffset, `${path}.rightOffset`, -2, 2),
      };
    });
    candidate.origins.sort((first, second) => first.startPosition - second.startPosition);

    if (!Array.isArray(sourceState.cuts) || sourceState.cuts.length > 10) {
      throw invalidConfiguration("state.cuts is invalid");
    }
    candidate.cuts = normaliseCutRegions(
      sourceState.cuts.map((cut, index) => {
        const path = `state.cuts[${index}]`;
        if (!isPlainRecord(cut)) throw invalidConfiguration(`${path} is invalid`);
        return {
          start: configurationNumber(cut.start, `${path}.start`, 0, 1),
          end: configurationNumber(cut.end, `${path}.end`, 0, 1),
        };
      })
    );

    const selectedOriginId = sourceState.selectedOriginId;
    if (selectedOriginId !== undefined && selectedOriginId !== null && !originIds.has(selectedOriginId)) {
      throw invalidConfiguration("state.selectedOriginId is invalid");
    }
    candidate.selectedOriginId = selectedOriginId ?? null;

    const selectedFork = sourceState.selectedFork;
    if (selectedFork !== undefined && selectedFork !== null) {
      if (
        !isPlainRecord(selectedFork) ||
        !originIds.has(selectedFork.originId) ||
        !["left", "right"].includes(selectedFork.side)
      ) {
        throw invalidConfiguration("state.selectedFork is invalid");
      }
      candidate.selectedFork = { originId: selectedFork.originId, side: selectedFork.side };
      candidate.selectedOriginId = null;
    } else {
      candidate.selectedFork = null;
    }
    candidate.playing = false;
    return normaliseStateSchema(candidate);
  }

  function configurationDocument() {
    return {
      format: CONFIG_FORMAT,
      schemaVersion: CONFIG_SCHEMA_VERSION,
      appVersion: APP_VERSION,
      savedAt: new Date().toISOString(),
      state: serializableState(),
    };
  }

  function parseConfigurationText(text) {
    if (typeof text !== "string" || text.length > MAX_CONFIG_FILE_BYTES) {
      throw invalidConfiguration("file is too large");
    }

    let documentState;
    try {
      documentState = JSON.parse(text);
    } catch {
      throw invalidConfiguration();
    }
    if (!isPlainRecord(documentState) || documentState.format !== CONFIG_FORMAT) {
      throw invalidConfiguration("not a RepliSketch configuration");
    }
    if (!Number.isInteger(documentState.schemaVersion)) throw invalidConfiguration("schema version is missing");
    if (documentState.schemaVersion > CONFIG_SCHEMA_VERSION) {
      throw invalidConfiguration("this configuration was created by a newer RepliSketch version");
    }
    if (documentState.schemaVersion !== CONFIG_SCHEMA_VERSION) {
      throw invalidConfiguration("unsupported configuration version");
    }
    if (
      documentState.appVersion !== undefined &&
      (typeof documentState.appVersion !== "string" || documentState.appVersion.length > 32)
    ) {
      throw invalidConfiguration("app version is invalid");
    }
    return sanitiseConfigurationState(documentState.state);
  }

  function backgroundLuminance(sourceState = state) {
    const hex = canvasBackgroundColor(sourceState);
    const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
    if (!match) return 1;
    const linear = match.slice(1).map((channel) => {
      const value = Number.parseInt(channel, 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  }

  function canvasInkColor(sourceState = state) {
    return backgroundLuminance(sourceState) < 0.34 ? "#eef5f3" : "#43545a";
  }

  function canvasGridColor(sourceState = state) {
    return backgroundLuminance(sourceState) < 0.34 ? "rgba(255, 255, 255, 0.16)" : "rgba(82, 105, 100, 0.14)";
  }

  const inverseSmoothstep = (value) => {
    const target = clamp(value, 0, 1);
    let lower = 0;
    let upper = 1;
    for (let iteration = 0; iteration < 24; iteration += 1) {
      const midpoint = (lower + upper) / 2;
      if (smoothstep(midpoint) < target) lower = midpoint;
      else upper = midpoint;
    }
    return (lower + upper) / 2;
  };

  const inverseTransitionProfile = (value, sourceState = state) => {
    const target = clamp(value, 0, 1);
    let lower = 0;
    let upper = 1;
    for (let iteration = 0; iteration < 30; iteration += 1) {
      const midpoint = (lower + upper) / 2;
      if (transitionProfile(midpoint, sourceState) < target) lower = midpoint;
      else upper = midpoint;
    }
    return (lower + upper) / 2;
  };

  function latticeSpanFraction(basePairSpan, sourceState = state) {
    const configuredSpan = Number(basePairSpan);
    const span = Number.isFinite(configuredSpan) ? Math.max(0, configuredSpan) : 0;
    return span / Math.max(1, basePairLattice(sourceState).subdivisionCount);
  }

  function referenceBasePairSubdivisionCount() {
    const referenceCrossoverCount = Math.max(
      1,
      Math.round((CROSSOVER_REFERENCE_LENGTH / BASE_PAIRS_PER_TURN) * 2)
    );
    return referenceCrossoverCount * (DEFAULTS.pairResolution + 1);
  }

  function referenceBasePairSpacingPx() {
    return BASE_MOLECULE_WIDTH / referenceBasePairSubdivisionCount();
  }

  function terminalPullScreenSpan(sourceState = state) {
    return terminalSmoothing(sourceState) * referenceBasePairSpacingPx();
  }

  function terminalPullSpan(terminalPosition, direction, sourceState = state) {
    // The model stores transition distances before the artwork's horizontal
    // aspect transform. Divide by aspectX so the rendered fork curvature and
    // terminal pull retain the same on-screen shape at every aspect ratio.
    return terminalPullScreenSpan(sourceState) / Math.max(EPSILON, artworkAspectX(sourceState));
  }

  function effectiveTerminalSmoothing(sourceState = state) {
    const currentPairSpacingScreen =
      (VIEW.moleculeWidth * artworkAspectX(sourceState)) /
      Math.max(1, basePairLattice(sourceState).subdivisionCount);
    return terminalPullScreenSpan(sourceState) / currentPairSpacingScreen;
  }

  function terminalEdgeBlend(distance, pullSpan = FORK_TERMINAL_BLEND_PX) {
    if (pullSpan <= EPSILON) {
      return distance <= EPSILON ? 1 : 0;
    }
    return 1 - smoothstep(distance / Math.max(EPSILON, pullSpan));
  }

  function terminalClosureBlend(distanceInPixels, sourceState = state) {
    if (terminalSmoothing(sourceState) <= EPSILON) return 1;
    const pullSpan = terminalPullSpan(0.5, "right", sourceState);
    return smoothstep(Math.max(0, Number(distanceInPixels) || 0) / Math.max(EPSILON, pullSpan));
  }

  function rawForkTravelAt(travel, offset) {
    return Math.max(0, (Number(travel) || 0) + (Number(offset) || 0));
  }

  function minimalEndClosureBlend(rawTravel, contactTravel, sourceState = state) {
    // Chromosome ends follow the same post-contact rule as fork mergers: they
    // first reach the centre line, then the two endpoint strands separate
    // gradually according to Merge/end smoothing (or immediately for Snap).
    if (rawTravel < contactTravel - EPSILON) return 0;
    if (strandModel(sourceState) !== "minimal") return 1;
    const overshoot =
      Math.max(0, rawTravel - contactTravel) * moleculeWidthForState(sourceState);
    return terminalClosureBlend(overshoot, sourceState);
  }

  function minimalMergeClosureMetrics(leftOrigin, rightOrigin, travel, sourceState = state) {
    const leftRawEnd =
      leftOrigin.startPosition + rawForkTravelAt(travel, leftOrigin.rightOffset);
    const rightRawStart =
      rightOrigin.startPosition - rawForkTravelAt(travel, rightOrigin.leftOffset);
    const gapFraction = rightRawStart - leftRawEnd;
    const contacted = gapFraction <= EPSILON;
    const postContactDistance =
      Math.max(0, -gapFraction) * moleculeWidthForState(sourceState) / 2;
    return {
      contacted,
      gapFraction,
      postContactDistance,
      blend:
        contacted && strandModel(sourceState) === "minimal"
          ? terminalClosureBlend(postContactDistance, sourceState)
          : Number(contacted),
    };
  }
  const daughterDetailFade = (profile) => smoothstep((profile - NASCENT_PROFILE_THRESHOLD) / 0.18);
  // Retained for configuration/test compatibility. Parental rungs are now
  // faded on the unreplicated side of a fork and removed immediately once the
  // fork crosses their genomic position.
  const parentalPairFade = (profile) => 1 - smoothstep(profile / PARENTAL_PAIR_FADE_END);

  function parentalPairApproachFade(x, model, sourceState = state) {
    if (!model?.regions?.length) return 1;
    const position = (x - VIEW.x0) / VIEW.moleculeWidth;
    if (
      model.regions.some(
        (region) => position >= region.start - EPSILON && position <= region.end + EPSILON
      )
    ) {
      return 0;
    }

    let nearestForkDistance = Infinity;
    model.regions.forEach((region) => {
      if (!region.openStart && position < region.start) {
        nearestForkDistance = Math.min(
          nearestForkDistance,
          (region.start - position) * VIEW.moleculeWidth
        );
      }
      if (!region.openEnd && position > region.end) {
        nearestForkDistance = Math.min(
          nearestForkDistance,
          (position - region.end) * VIEW.moleculeWidth
        );
      }
    });
    if (!Number.isFinite(nearestForkDistance)) return 1;

    const aspectX = Math.max(EPSILON, artworkAspectX(sourceState));
    const pairSpacingScreen =
      (VIEW.moleculeWidth * aspectX) /
      Math.max(1, basePairLattice(sourceState).subdivisionCount);
    const fadeDistanceScreen = clamp(pairSpacingScreen * 2, 18, 52);
    return smoothstep((nearestForkDistance * aspectX) / fadeDistanceScreen);
  }

  function basePairDistanceFade(firstY, secondY, sourceState = state) {
    // Physical component of the fork-local distance gate. Stable duplexes can
    // legitimately exceed this distance; basePairForkDistanceFade decides how
    // strongly to apply it from the local replication envelope.
    const maximumDistance = Math.max(EPSILON, sourceState.daughterSpacing * BASE_PAIR_MAX_SPACING_RATIO);
    const fadeWidth = Math.min(18, Math.max(4, maximumDistance * 0.18));
    const fadeStart = Math.max(0, maximumDistance - fadeWidth);
    return 1 - smoothstep((Math.abs(secondY - firstY) - fadeStart) / Math.max(EPSILON, fadeWidth));
  }

  function basePairTransitionInfluence(profile) {
    const progress = clamp(profile, 0, 1);
    const edgeFraction = 0.25;
    const entering = smoothstep(progress / edgeFraction);
    const leaving = 1 - smoothstep((progress - (1 - edgeFraction)) / edgeFraction);
    return entering * leaving;
  }

  function basePairTerminalEdgeInfluence(x, region, side, model) {
    const open = side === "start" ? region.openStart : region.openEnd;
    const edgeBlend = clamp(side === "start" ? region.startBlend || 0 : region.endBlend || 0, 0, 1);
    if (open || edgeBlend <= EPSILON) return 0;

    const edgeX = VIEW.x0 + (side === "start" ? region.start : region.end) * VIEW.moleculeWidth;
    const width = regionEdgeTransitionWidth(region, side, model);
    const inwardDistance = side === "start" ? x - edgeX : edgeX - x;
    if (inwardDistance < -EPSILON || inwardDistance > width + EPSILON) return 0;

    const inwardProgress = clamp(inwardDistance / Math.max(EPSILON, width), 0, 1);
    const bridgeStrength = smoothstep(edgeBlend / NASCENT_PROFILE_THRESHOLD);
    return bridgeStrength * (1 - smoothstep(inwardProgress));
  }

  function basePairForkInfluence(x, model, replication = replicationAt(x, model)) {
    if (!replication.region) {
      const visualReplication = visualReplicationAt(x, model);
      return visualReplication.visualBridge
        ? smoothstep(visualReplication.profile / NASCENT_PROFILE_THRESHOLD)
        : 0;
    }

    const region = replication.region;
    return clamp(
      Math.max(
        basePairTransitionInfluence(replication.profile),
        basePairTerminalEdgeInfluence(x, region, "start", model),
        basePairTerminalEdgeInfluence(x, region, "end", model)
      ),
      0,
      1
    );
  }

  function basePairForkDistanceFade(x, firstY, secondY, model, replication = replicationAt(x, model)) {
    const influence = basePairForkInfluence(x, model, replication);
    const distanceFade = basePairDistanceFade(firstY, secondY);
    return 1 - influence * (1 - distanceFade);
  }

  function reseedNextOriginId(sourceState = state) {
    const usedIds = new Set((sourceState?.origins || []).map((origin) => origin.id));
    let largestNumericId = 0;
    usedIds.forEach((id) => {
      const match = /^origin-(\d+)$/.exec(id);
      if (match) largestNumericId = Math.max(largestNumericId, Number(match[1]));
    });
    nextOriginId = Math.max(nextOriginId, largestNumericId + 1);
    while (usedIds.has(`origin-${nextOriginId}`)) nextOriginId += 1;
    return nextOriginId;
  }

  function nextAvailableOriginId(sourceState = state) {
    reseedNextOriginId(sourceState);
    return `origin-${nextOriginId++}`;
  }

  function makeOrigins(count, sourceState = DEFAULTS) {
    return Array.from({ length: count }, (_, index) => {
      const idealPosition = (index + 1) / (count + 1);
      const position = snapFractionToBasePair(idealPosition, sourceState) ?? idealPosition;
      return {
        id: nextAvailableOriginId(sourceState),
        position,
        startPosition: position,
        leftOffset: 0,
        rightOffset: 0,
      };
    });
  }

  function makeDefaultState() {
    const origins = DEFAULT_ORIGINS.map((origin) => ({ ...origin }));
    const defaultState = normaliseStateSchema({
      ...DEFAULTS,
      basePairSeed: DEFAULTS.basePairSeed,
      colors: { ...DEFAULTS.colors },
      layers: { ...DEFAULTS.layers },
      advanced: { ...DEFAULTS.advanced },
      origins,
      cuts: [],
      selectedOriginId: DEFAULT_ORIGINS[0].id,
      selectedFork: null,
      playing: false,
    });
    syncViewGeometry(defaultState);
    return defaultState;
  }

  function serializableState() {
    return {
      ...state,
      colors: { ...state.colors },
      layers: { ...state.layers },
      advanced: { ...state.advanced },
      origins: state.origins.map((origin) => ({ ...origin })),
      cuts: state.cuts.map((cut) => ({ ...cutRange(cut) })),
      selectedFork: state.selectedFork ? { ...state.selectedFork } : null,
      playing: false,
    };
  }

  function snapshot() {
    return JSON.stringify(serializableState());
  }

  function pushBounded(stack, value) {
    if (stack.at(-1) === value) return;
    stack.push(value);
    if (stack.length > HISTORY_LIMIT) stack.shift();
  }

  function updateHistoryButtons() {
    elements.undoButton.disabled = history.length === 0;
    elements.redoButton.disabled = redoHistory.length === 0;
  }

  function pushSnapshot(value = snapshot()) {
    pushBounded(history, value);
    redoHistory.length = 0;
    updateHistoryButtons();
  }

  function restoreSnapshot(value) {
    stopAnimation();
    state = normaliseStateSchema(JSON.parse(value));
    state.playing = false;
    reseedNextOriginId(state);
    syncControls();
    render();
  }

  function undo() {
    const previous = history.pop();
    if (!previous) return;
    pushBounded(redoHistory, snapshot());
    restoreSnapshot(previous);
    updateHistoryButtons();
    setStatus("Previous state restored");
  }

  function redo() {
    const next = redoHistory.pop();
    if (!next) return;
    pushBounded(history, snapshot());
    restoreSnapshot(next);
    updateHistoryButtons();
    setStatus("Next state restored");
  }

  function reset() {
    pushSnapshot();
    stopAnimation();
    pendingControlSnapshot = null;
    state = makeDefaultState();
    viewState = { zoom: 1, panX: 0, panY: 0 };
    syncControls();
    render();
    setStatus("Molecule reset");
  }

  function forkFlags() {
    return {
      left: true,
      right: true,
    };
  }

  function buildRegions(origins, sourceState = state) {
    const minimal = strandModel(sourceState) === "minimal";
    const intervals = origins
      .map((origin) => ({
        start: origin.flags.left ? origin.leftPosition : origin.startPosition,
        end: origin.flags.right ? origin.rightPosition : origin.startPosition,
        startBlend: origin.flags.left ? origin.leftEdgeBlend : 1,
        endBlend: origin.flags.right ? origin.rightEdgeBlend : 1,
        startClosureBlend: origin.flags.left ? origin.leftClosureBlend || 0 : 1,
        endClosureBlend: origin.flags.right ? origin.rightClosureBlend || 0 : 1,
        originIds: [origin.id],
      }))
      .filter((interval) => interval.end - interval.start > EPSILON)
      .sort((a, b) => a.start - b.start);

    const regions = [];
    intervals.forEach((interval) => {
      const current = regions.at(-1);
      if (current && interval.start <= current.end + EPSILON) {
        if (interval.end > current.end + EPSILON) {
          current.end = interval.end;
          current.endBlend = interval.endBlend;
          current.endClosureBlend = interval.endClosureBlend;
        } else if (Math.abs(interval.end - current.end) <= EPSILON) {
          current.endBlend = Math.max(current.endBlend, interval.endBlend);
          current.endClosureBlend = Math.max(
            current.endClosureBlend,
            interval.endClosureBlend
          );
        }
        current.originIds.push(...interval.originIds);
      } else {
        regions.push({ ...interval });
      }
    });

    return regions.map((region) => ({
      ...region,
      openStart: region.start <= EPSILON,
      openEnd: region.end >= 1 - EPSILON,
      startBlend: region.start <= EPSILON ? 1 : region.startBlend,
      endBlend: region.end >= 1 - EPSILON ? 1 : region.endBlend,
      startClosureBlend:
        region.start <= EPSILON
          ? minimal
            ? clamp(region.startClosureBlend || 0, 0, 1)
            : 1
          : 0,
      endClosureBlend:
        region.end >= 1 - EPSILON
          ? minimal
            ? clamp(region.endClosureBlend || 0, 0, 1)
            : 1
          : 0,
    }));
  }

  function getReplicationModelAtTravel(travel, sourceState = state) {
    const minimalClosures = [];
    const origins = [...sourceState.origins]
      .sort((a, b) => a.startPosition - b.startPosition)
      .map((origin, index) => {
        const flags = forkFlags(index);
        const rawLeftTravel = Math.max(0, travel + origin.leftOffset);
        const rawRightTravel = Math.max(0, travel + origin.rightOffset);
        const leftTravel = effectiveForkTravel(travel, origin.leftOffset, sourceState);
        const rightTravel = effectiveForkTravel(travel, origin.rightOffset, sourceState);
        const leftPosition = flags.left
          ? rawLeftTravel >= origin.startPosition - EPSILON
            ? 0
            : Math.max(0, origin.startPosition - leftTravel)
          : origin.startPosition;
        const rightPosition = flags.right
          ? rawRightTravel >= 1 - origin.startPosition - EPSILON
            ? 1
            : Math.min(1, origin.startPosition + rightTravel)
          : origin.startPosition;

        return {
          ...origin,
          position: origin.startPosition,
          index,
          flags,
          leftPosition,
          rightPosition,
          leftActive: flags.left && leftPosition > EPSILON,
          rightActive: flags.right && rightPosition < 1 - EPSILON,
          leftReason: flags.left && leftPosition <= EPSILON ? "end" : null,
          rightReason: flags.right && rightPosition >= 1 - EPSILON ? "end" : null,
          leftEdgeBlend:
            index === 0 && flags.left
              ? terminalEdgeBlend(leftPosition * VIEW.moleculeWidth, terminalPullSpan(0, "left", sourceState))
              : 0,
          rightEdgeBlend:
            index === sourceState.origins.length - 1 && flags.right
              ? terminalEdgeBlend(
                  (1 - rightPosition) * VIEW.moleculeWidth,
                  terminalPullSpan(1, "right", sourceState)
                )
              : 0,
          leftClosureBlend:
            index === 0 && flags.left
              ? minimalEndClosureBlend(rawLeftTravel, origin.startPosition, sourceState)
              : 0,
          rightClosureBlend:
            index === sourceState.origins.length - 1 && flags.right
              ? minimalEndClosureBlend(
                  rawRightTravel,
                  1 - origin.startPosition,
                  sourceState
                )
              : 0,
        };
      });

    for (let index = 0; index < origins.length - 1; index += 1) {
      const leftOrigin = origins[index];
      const rightOrigin = origins[index + 1];

      if (leftOrigin.flags.right && rightOrigin.flags.left) {
        const closureMetrics = minimalMergeClosureMetrics(
          leftOrigin,
          rightOrigin,
          travel,
          sourceState
        );
        const meetingPoint = clamp(
          (leftOrigin.startPosition + rightOrigin.startPosition + leftOrigin.rightOffset - rightOrigin.leftOffset) / 2,
          leftOrigin.startPosition,
          rightOrigin.startPosition
        );
        const symmetricRemaining =
          (Math.max(0, rightOrigin.leftPosition - leftOrigin.rightPosition) * VIEW.moleculeWidth) / 2;
        const sharedPullSpan = terminalPullSpan(meetingPoint, "right", sourceState);
        const leftIntervalVisible = leftOrigin.rightPosition - leftOrigin.leftPosition > EPSILON;
        const rightIntervalVisible = rightOrigin.rightPosition - rightOrigin.leftPosition > EPSILON;
        if (leftIntervalVisible && rightIntervalVisible) {
          const mergeBlend = terminalEdgeBlend(symmetricRemaining, sharedPullSpan);
          leftOrigin.rightEdgeBlend = Math.max(leftOrigin.rightEdgeBlend, mergeBlend);
          rightOrigin.leftEdgeBlend = Math.max(rightOrigin.leftEdgeBlend, mergeBlend);
        }
        if (leftOrigin.rightPosition >= rightOrigin.leftPosition - EPSILON) {
          leftOrigin.rightPosition = meetingPoint;
          rightOrigin.leftPosition = meetingPoint;
          leftOrigin.rightActive = false;
          rightOrigin.leftActive = false;
          leftOrigin.rightReason = "merge";
          rightOrigin.leftReason = "merge";
          leftOrigin.rightClosureBlend = closureMetrics.blend;
          rightOrigin.leftClosureBlend = closureMetrics.blend;
          if (strandModel(sourceState) === "minimal") {
            const closureWidths = minimalMergeClosureWidths(
              leftOrigin,
              rightOrigin,
              meetingPoint,
              sourceState
            );
            minimalClosures.push({
              position: meetingPoint,
              blend: closureMetrics.blend,
              leftWidth: closureWidths.left,
              rightWidth: closureWidths.right,
              leftOriginId: leftOrigin.id,
              rightOriginId: rightOrigin.id,
            });
          }
        }
      } else if (leftOrigin.flags.right && !rightOrigin.flags.left) {
        if (leftOrigin.rightPosition >= rightOrigin.startPosition - EPSILON) {
          leftOrigin.rightPosition = rightOrigin.startPosition;
          leftOrigin.rightActive = false;
          leftOrigin.rightReason = "merge";
        }
      } else if (!leftOrigin.flags.right && rightOrigin.flags.left) {
        if (rightOrigin.leftPosition <= leftOrigin.startPosition + EPSILON) {
          rightOrigin.leftPosition = leftOrigin.startPosition;
          rightOrigin.leftActive = false;
          rightOrigin.leftReason = "merge";
        }
      }
    }

    const minimal = strandModel(sourceState) === "minimal";
    origins.forEach((origin) => {
      // In the minimal model, merge/end smoothing is strictly post-contact.
      // Keep active fork controls fully visible while the centre-line points
      // are still approaching one another or a chromosome end.
      origin.leftTerminalOpacity = minimal ? Number(origin.leftActive) : 1 - origin.leftEdgeBlend;
      origin.rightTerminalOpacity = minimal ? Number(origin.rightActive) : 1 - origin.rightEdgeBlend;
    });

    return {
      origins,
      regions: buildRegions(origins, sourceState),
      minimalClosures,
      activeForkCount: origins.reduce((count, origin) => count + Number(origin.leftActive) + Number(origin.rightActive), 0),
    };
  }

  function pairForkOverlapAtTravel(leftOrigin, rightOrigin, travel) {
    return (
      rawForkTravelAt(travel, leftOrigin.rightOffset) +
      rawForkTravelAt(travel, rightOrigin.leftOffset) -
      (rightOrigin.startPosition - leftOrigin.startPosition)
    );
  }

  function pairTravelForOverlap(
    leftOrigin,
    rightOrigin,
    targetOverlap,
    lowerBound,
    initialUpperBound
  ) {
    let lower = lowerBound;
    let upper = Math.max(initialUpperBound, lower + Math.max(targetOverlap, 0.01));
    let expansion = Math.max(targetOverlap, 0.01);
    for (
      let iteration = 0;
      iteration < 24 &&
      pairForkOverlapAtTravel(leftOrigin, rightOrigin, upper) < targetOverlap;
      iteration += 1
    ) {
      upper += expansion;
      expansion *= 2;
    }

    for (let iteration = 0; iteration < 56; iteration += 1) {
      const midpoint = (lower + upper) / 2;
      if (pairForkOverlapAtTravel(leftOrigin, rightOrigin, midpoint) >= targetOverlap) {
        upper = midpoint;
      } else {
        lower = midpoint;
      }
    }
    return upper;
  }

  function geometricForkTravelBounds(sourceState = state) {
    if (!sourceState.origins.length) return { zero: 0, full: 0 };
    const offsets = sourceState.origins.flatMap((origin) => [origin.leftOffset, origin.rightOffset]);
    const zero = -Math.max(...offsets);
    const naiveFull = Math.max(
      ...sourceState.origins.map((origin) =>
        Math.max(origin.startPosition - origin.leftOffset, 1 - origin.startPosition - origin.rightOffset)
      )
    );
    const origins = [...sourceState.origins].sort(
      (first, second) => first.startPosition - second.startPosition
    );
    let full = Math.max(
      zero,
      origins[0].startPosition - origins[0].leftOffset,
      1 - origins.at(-1).startPosition - origins.at(-1).rightOffset
    );
    for (let index = 0; index < origins.length - 1; index += 1) {
      full = Math.max(
        full,
        pairTravelForOverlap(
          origins[index],
          origins[index + 1],
          0,
          zero,
          naiveFull
        )
      );
    }
    return { zero, full: Math.max(zero, full) };
  }

  function minimalPairClosureCompletionTravel(
    leftOrigin,
    rightOrigin,
    sourceState,
    geometricBounds
  ) {
    const moleculeWidth = Math.max(EPSILON, moleculeWidthForState(sourceState));
    const pullFraction = terminalPullSpan(0.5, "right", sourceState) / moleculeWidth;
    if (pullFraction <= EPSILON) return geometricBounds.full;

    return pairTravelForOverlap(
      leftOrigin,
      rightOrigin,
      pullFraction * 2,
      geometricBounds.zero,
      geometricBounds.full
    );
  }

  function forkTravelBounds(sourceState = state) {
    const geometricBounds = geometricForkTravelBounds(sourceState);
    if (
      !sourceState.origins.length ||
      strandModel(sourceState) !== "minimal" ||
      terminalSmoothing(sourceState) <= EPSILON
    ) {
      return geometricBounds;
    }

    const moleculeWidth = Math.max(EPSILON, moleculeWidthForState(sourceState));
    const pullFraction = terminalPullSpan(0.5, "right", sourceState) / moleculeWidth;
    const origins = [...sourceState.origins].sort(
      (first, second) => first.startPosition - second.startPosition
    );
    let full = geometricBounds.full;

    const firstOrigin = origins[0];
    const lastOrigin = origins.at(-1);
    full = Math.max(
      full,
      firstOrigin.startPosition - firstOrigin.leftOffset + pullFraction,
      1 - lastOrigin.startPosition - lastOrigin.rightOffset + pullFraction
    );

    for (let index = 0; index < origins.length - 1; index += 1) {
      full = Math.max(
        full,
        minimalPairClosureCompletionTravel(
          origins[index],
          origins[index + 1],
          sourceState,
          geometricBounds
        )
      );
    }

    return { zero: geometricBounds.zero, full: Math.max(geometricBounds.zero, full) };
  }

  function findForkTravelForReplicatedFraction(percentage, sourceState = state) {
    if (!sourceState.origins.length) return 0;
    const target = clamp(percentage, 0, 100);
    const bounds = forkTravelBounds(sourceState);
    if (target <= EPSILON) return bounds.zero;
    if (target >= 100 - EPSILON) return bounds.full;

    let lower = bounds.zero;
    let upper = bounds.full;
    for (let iteration = 0; iteration < 40; iteration += 1) {
      const midpoint = (lower + upper) / 2;
      const replicated = replicatedFraction(getReplicationModelAtTravel(midpoint, sourceState));
      if (replicated < target) lower = midpoint;
      else upper = midpoint;
    }
    return (lower + upper) / 2;
  }

  function getReplicationModel() {
    return getReplicationModelAtTravel(state.forkTravel);
  }

  function replicationModelForPercentage(percentage, sourceState = state) {
    return getReplicationModelAtTravel(findForkTravelForReplicatedFraction(percentage, sourceState), sourceState);
  }

  function synchroniseOriginPositions(sourceState = state) {
    let changed = false;
    sourceState.origins.forEach((origin) => {
      if (Math.abs(origin.position - origin.startPosition) > EPSILON) {
        origin.position = origin.startPosition;
        changed = true;
      }
    });
    return changed;
  }

  function replicationAt(x, model) {
    const position = (x - VIEW.x0) / VIEW.moleculeWidth;
    const region = model.regions.find((item) => position >= item.start - EPSILON && position <= item.end + EPSILON);
    if (!region) return { amount: 0, profile: 0, region: null };

    const startX = VIEW.x0 + region.start * VIEW.moleculeWidth;
    const endX = VIEW.x0 + region.end * VIEW.moleculeWidth;
    const startTransitionWidth = regionEdgeTransitionWidth(region, "start", model);
    const endTransitionWidth = regionEdgeTransitionWidth(region, "end", model);
    const leftEdgeBlend = region.openStart ? 1 : region.startBlend || 0;
    const rightEdgeBlend = region.openEnd ? 1 : region.endBlend || 0;
    const leftProfile =
      leftEdgeBlend + (1 - leftEdgeBlend) * transitionProfile((x - startX) / startTransitionWidth);
    const rightProfile =
      rightEdgeBlend + (1 - rightEdgeBlend) * transitionProfile((endX - x) / endTransitionWidth);
    const profile = Math.min(leftProfile, rightProfile);

    return {
      amount: (state.daughterSpacing / 2) * profile,
      profile,
      region,
    };
  }

  function minimalReplicationAt(x, model, sourceState = state) {
    const position = (x - VIEW.x0) / VIEW.moleculeWidth;
    const region = model.regions.find((item) => position >= item.start - EPSILON && position <= item.end + EPSILON);
    if (!region) return { amount: 0, profile: 0, region: null };

    const startX = VIEW.x0 + region.start * VIEW.moleculeWidth;
    const endX = VIEW.x0 + region.end * VIEW.moleculeWidth;
    const leftBlend = region.openStart
      ? clamp(region.startClosureBlend ?? 1, 0, 1)
      : 0;
    const rightBlend = region.openEnd
      ? clamp(region.endClosureBlend ?? 1, 0, 1)
      : 0;
    const leftProfile =
      leftBlend +
      (1 - leftBlend) *
        transitionProfile(
          (x - startX) /
            minimalRegionEdgeTransitionWidth(region, "start", model, sourceState),
          sourceState
        );
    const rightProfile =
      rightBlend +
      (1 - rightBlend) *
        transitionProfile(
          (endX - x) /
            minimalRegionEdgeTransitionWidth(region, "end", model, sourceState),
          sourceState
        );
    let profile = Math.min(leftProfile, rightProfile);

    (model.minimalClosures || []).forEach((closure) => {
      if (
        closure.position < region.start - EPSILON ||
        closure.position > region.end + EPSILON ||
        closure.blend >= 1 - EPSILON
      ) {
        return;
      }
      const closureX = VIEW.x0 + closure.position * VIEW.moleculeWidth;
      const closureBlend = clamp(closure.blend || 0, 0, 1);
      const closureWidth =
        x <= closureX
          ? closure.leftWidth ?? closure.width
          : closure.rightWidth ?? closure.width;
      const closureProfile =
        closureBlend +
        (1 - closureBlend) *
          transitionProfile(
            Math.abs(x - closureX) / Math.max(EPSILON, closureWidth),
            sourceState
          );
      profile = Math.min(profile, closureProfile);
    });

    return {
      amount: (sourceState.daughterSpacing / 2) * profile,
      profile,
      region,
    };
  }

  function visualReplicationAt(x, model) {
    if (strandModel() === "minimal") return minimalReplicationAt(x, model);
    const replication = replicationAt(x, model);
    if (replication.region || !model.regions.length) return replication;

    const position = (x - VIEW.x0) / VIEW.moleculeWidth;
    const nextIndex = model.regions.findIndex((region) => position < region.start - EPSILON);
    const previousRegion = nextIndex < 0 ? model.regions.at(-1) : model.regions[nextIndex - 1];
    const nextRegion = nextIndex < 0 ? null : model.regions[nextIndex];
    let profile = 0;

    if (!previousRegion && nextRegion) {
      profile = nextRegion.startBlend || 0;
    } else if (previousRegion && !nextRegion) {
      profile = previousRegion.endBlend || 0;
    } else if (previousRegion && nextRegion) {
      const gapWidth = Math.max(EPSILON, nextRegion.start - previousRegion.end);
      const gapProgress = clamp((position - previousRegion.end) / gapWidth, 0, 1);
      const previousBlend = previousRegion.endBlend || 0;
      const nextBlend = nextRegion.startBlend || 0;
      profile = previousBlend + (nextBlend - previousBlend) * smoothstep(gapProgress);
    }

    if (profile <= EPSILON) return replication;
    return {
      amount: (state.daughterSpacing / 2) * profile,
      profile,
      region: null,
      visualBridge: true,
    };
  }

  function connectedStrandShiftFraction(sourceState = state) {
    return strandPhaseShift(sourceState) / Math.max(1, basePairLattice(sourceState).subdivisionCount);
  }

  function helixWave(x, track = "a", sourceState = state) {
    if (strandModel(sourceState) !== "standard") return 0;
    const fraction = (x - VIEW.x0) / VIEW.moleculeWidth;
    const turns = sourceState.length / BASE_PAIRS_PER_TURN;
    const partnerTrack = track === "b" || track === "top";
    const phase =
      (fraction + (partnerTrack ? connectedStrandShiftFraction(sourceState) : 0)) *
        turns *
        Math.PI *
        2 +
      (partnerTrack ? Math.PI : 0);
    return Math.cos(phase) * doubleStrandHalfHeight(sourceState);
  }

  function crossoverCount(sourceState = state) {
    return Math.max(1, Math.round((sourceState.length / BASE_PAIRS_PER_TURN) * 2));
  }

  function basePairLattice(sourceState = state) {
    const resolution = basePairResolution(sourceState);
    const subdivisionCount = crossoverCount(sourceState) * (resolution + 1);
    // The helix begins and ends halfway between crossovers. When the number of
    // subdivisions per crossover is odd (an even resolution), the crossover-
    // anchored lattice therefore begins half a base-pair step inside each end.
    const edgeOffset = resolution % 2 === 0 ? 0.5 : 0;
    return {
      subdivisionCount,
      edgeOffset,
      count: subdivisionCount - edgeOffset * 2,
    };
  }

  function basePairCount(sourceState = state) {
    return basePairLattice(sourceState).count;
  }

  function basePairFraction(index, sourceState = state) {
    const lattice = basePairLattice(sourceState);
    const position = clamp(Math.round(Number(index) || 0), 0, lattice.count);
    return (lattice.edgeOffset + position) / lattice.subdivisionCount;
  }

  function basePairStepFraction(sourceState = state) {
    return 1 / basePairLattice(sourceState).subdivisionCount;
  }

  function genomicPositionAtFraction(fraction, sourceState = state) {
    const lattice = basePairLattice(sourceState);
    const moleculeFraction = clamp(Number(fraction) || 0, 0, 1);
    return clamp(
      Math.round(moleculeFraction * lattice.subdivisionCount - lattice.edgeOffset),
      0,
      lattice.count
    );
  }

  function snapFractionToBasePair(
    fraction,
    sourceState = state,
    { min = 0, max = 1 } = {}
  ) {
    const lattice = basePairLattice(sourceState);
    const configuredFraction = Number(fraction);
    const target = clamp(Number.isFinite(configuredFraction) ? configuredFraction : 0, 0, 1);
    const configuredMin = Number(min);
    const configuredMax = Number(max);
    const firstBoundary = clamp(Number.isFinite(configuredMin) ? configuredMin : 0, 0, 1);
    const secondBoundary = clamp(Number.isFinite(configuredMax) ? configuredMax : 1, 0, 1);
    const lower = Math.min(firstBoundary, secondBoundary);
    const upper = Math.max(firstBoundary, secondBoundary);
    const latticeEpsilon = 1e-10;
    const rawFirstIndex = Math.ceil(lower * lattice.subdivisionCount - lattice.edgeOffset - latticeEpsilon);
    const rawLastIndex = Math.floor(upper * lattice.subdivisionCount - lattice.edgeOffset + latticeEpsilon);
    const firstIndex = clamp(rawFirstIndex, 0, lattice.count);
    const lastIndex = clamp(rawLastIndex, 0, lattice.count);
    if (
      rawFirstIndex > rawLastIndex ||
      rawLastIndex < 0 ||
      rawFirstIndex > lattice.count ||
      firstIndex > lastIndex
    ) {
      return null;
    }
    const nearestIndex = clamp(
      Math.round(target * lattice.subdivisionCount - lattice.edgeOffset),
      firstIndex,
      lastIndex
    );
    return basePairFraction(nearestIndex, sourceState);
  }

  function snapEditingEnabled(sourceState = state) {
    return sourceState?.advanced?.snapToBasePairs === true;
  }

  function interactionFraction(fraction, sourceState = state, bounds = {}) {
    const configured = Number(fraction);
    const continuous = clamp(Number.isFinite(configured) ? configured : 0, 0, 1);
    if (!snapEditingEnabled(sourceState)) return continuous;
    return snapFractionToBasePair(continuous, sourceState, bounds);
  }

  function discreteAnimationEnabled(sourceState = state) {
    return sourceState?.discreteAnimation === true;
  }

  function effectiveForkTravel(travel, offset, sourceState = state) {
    const configuredTravel = Number(travel);
    const configuredOffset = Number(offset);
    const rawTravel = Math.max(
      0,
      (Number.isFinite(configuredTravel) ? configuredTravel : 0) +
        (Number.isFinite(configuredOffset) ? configuredOffset : 0)
    );
    if (!discreteAnimationEnabled(sourceState)) return rawTravel;
    if (rawTravel <= EPSILON) return 0;

    const step = basePairStepFraction(sourceState);
    return Math.floor(rawTravel / step + 1e-10) * step;
  }

  function snapForkTravel(
    travel,
    sourceState = state,
    { anchor = forkTravelBounds(sourceState).zero, mode = "nearest" } = {}
  ) {
    const bounds = forkTravelBounds(sourceState);
    const configuredTravel = Number(travel);
    const candidate = clamp(
      Number.isFinite(configuredTravel) ? configuredTravel : bounds.zero,
      bounds.zero,
      bounds.full
    );
    if (candidate <= bounds.zero + Number.EPSILON) return bounds.zero;
    if (candidate >= bounds.full - Number.EPSILON) return bounds.full;
    const configuredAnchor = Number(anchor);
    const origin = clamp(
      Number.isFinite(configuredAnchor) ? configuredAnchor : bounds.zero,
      bounds.zero,
      bounds.full
    );
    const rawSteps = (candidate - origin) / basePairStepFraction(sourceState);
    const roundedSteps =
      mode === "floor"
        ? Math.floor(rawSteps + 1e-10)
        : mode === "ceil"
          ? Math.ceil(rawSteps - 1e-10)
          : Math.round(rawSteps);
    return clamp(
      origin + roundedSteps * basePairStepFraction(sourceState),
      bounds.zero,
      bounds.full
    );
  }

  function resetForkPlaybackClock(sourceState = state) {
    if (sourceState && typeof sourceState === "object") forkPlaybackClocks.delete(sourceState);
  }

  function basePairDisplayStep() {
    // Each rendered rung represents one base pair on the ruler's shared lattice.
    return 1;
  }

  function displayedBasePairPositions(sourceState = state) {
    const count = basePairCount(sourceState);
    const step = basePairDisplayStep(sourceState);
    const positions = [];
    for (let position = 0; position < count; position += step) positions.push(position);
    positions.push(count);
    return positions;
  }

  function crossoverSites(sourceState = state) {
    const count = crossoverCount(sourceState);
    const relativeShift = connectedStrandShiftFraction(sourceState) / 2;
    return Array.from({ length: count }, (_, index) => {
      const rawFraction = (index + 0.5) / count - relativeShift;
      const fraction = ((rawFraction % 1) + 1) % 1;
      return {
        index,
        fraction,
        x: VIEW.x0 + fraction * VIEW.moleculeWidth,
      };
    }).sort((first, second) => first.x - second.x);
  }

  function crossoverClipHalfWidth(multiplier = 1.15, minimum = 3.5, sourceState = state) {
    const aspect = Math.max(EPSILON, artworkScaleX(sourceState));
    const configuredLength = Math.max(
      CONTROL_RANGES.length.min,
      Number(sourceState?.length) || DEFAULTS.length
    );
    const lengthScale = CROSSOVER_REFERENCE_LENGTH / configuredLength;
    const nominalScreenHalfWidth = Math.max(minimum, sourceState.weight * multiplier) * lengthScale;
    const crossoverSpacingScreen = (VIEW.moleculeWidth / crossoverCount(sourceState)) * aspect;
    const spacingLimitedHalfWidth = crossoverSpacingScreen * 0.42;
    const strandSafeHalfWidth = sourceState.weight / 2 + 0.5;
    const screenHalfWidth = Math.max(
      strandSafeHalfWidth,
      Math.min(nominalScreenHalfWidth, spacingLimitedHalfWidth)
    );
    return screenHalfWidth / aspect;
  }

  function crossoverNear(x, sourceState = state) {
    const site = crossoverSites(sourceState).reduce((nearest, candidate) => {
      const distance = Math.abs(x - candidate.x);
      return !nearest || distance < nearest.distance ? { ...candidate, distance } : nearest;
    }, null);
    const halfGap = crossoverClipHalfWidth(1.15, 3.5, sourceState);
    return site && site.distance <= halfGap ? site : null;
  }

  function isUnderpassGap(x, strand, model) {
    if (!state.advanced.crossoverGaps || strandModel() !== "standard") return false;
    const crossover = crossoverNear(x);
    if (!crossover) return false;
    const replication = replicationAt(crossover.x, model);
    const even = crossover.index % 2 === 0;

    if (!replication.region || replication.profile < NASCENT_PROFILE_THRESHOLD) {
      if (strand === "a") return !even;
      if (strand === "b") return even;
      return false;
    }

    if (!state.layers.newDna) return false;
    if (strand === "a") return !even;
    if (strand === "top") return even;
    if (strand === "b") return even;
    if (strand === "bottom") return !even;
    return false;
  }

  function templateY(x, strand, model) {
    const modelName = strandModel();
    const replication = visualReplicationAt(x, model);
    if (modelName === "elegant") {
      const halfHeight = doubleStrandHalfHeight();
      return strand === "a"
        ? VIEW.centerY - replication.amount - halfHeight
        : VIEW.centerY + replication.amount + halfHeight;
    }
    if (modelName === "minimal") {
      return strand === "a" ? VIEW.centerY - replication.amount : VIEW.centerY + replication.amount;
    }
    return strand === "a"
      ? VIEW.centerY - replication.amount + helixWave(x, "a")
      : VIEW.centerY + replication.amount + helixWave(x, "b");
  }

  function nascentY(x, daughter, model = getReplicationModel()) {
    const daughterOffset = state.daughterSpacing / 2;
    const modelName = strandModel();
    if (modelName === "minimal") {
      const replication = replicationAt(x, model);
      return daughter === "top" ? VIEW.centerY - replication.amount : VIEW.centerY + replication.amount;
    }
    if (modelName === "elegant") {
      const replication = replicationAt(x, model);
      const halfHeight = doubleStrandHalfHeight();
      return daughter === "top"
        ? VIEW.centerY - replication.amount + halfHeight
        : VIEW.centerY + replication.amount - halfHeight;
    }
    return daughter === "top"
      ? VIEW.centerY - daughterOffset + helixWave(x, "top")
      : VIEW.centerY + daughterOffset + helixWave(x, "bottom");
  }

  function regionTransitionWidth(region, sourceState = state) {
    const width = Math.max(1, (region.end - region.start) * VIEW.moleculeWidth);
    const tightness = transitionTightness(sourceState);
    const smoothWidth = 52;
    const maximumScreenWidth =
      tightness < 0
        ? smoothWidth + (sourceState.daughterSpacing / 2 - smoothWidth) * -tightness
        : 0.75 + 51.25 * (1 - tightness) ** 2;
    const maximumWorldWidth =
      maximumScreenWidth / Math.max(EPSILON, artworkAspectX(sourceState));
    return Math.min(maximumWorldWidth, width / 2);
  }

  function minimalMergeClosureWidths(
    leftOrigin,
    rightOrigin,
    meetingPoint,
    sourceState = state
  ) {
    // Preserve the limiting shape of each approaching fork at the contact
    // frame. Unequal bubbles can legitimately have different transition
    // widths, so the post-contact closure uses one width on each side rather
    // than snapping both sides to the narrower transition.
    const leftRegion = {
      start: Math.min(leftOrigin.leftPosition, meetingPoint),
      end: Math.max(leftOrigin.leftPosition, meetingPoint),
    };
    const rightRegion = {
      start: Math.min(meetingPoint, rightOrigin.rightPosition),
      end: Math.max(meetingPoint, rightOrigin.rightPosition),
    };
    return {
      left: Math.max(EPSILON, regionTransitionWidth(leftRegion, sourceState)),
      right: Math.max(EPSILON, regionTransitionWidth(rightRegion, sourceState)),
    };
  }

  function facingMergeBlend(region, side, model) {
    if (!model) return 0;
    const regionIndex = model.regions.indexOf(region);
    if (regionIndex < 0) return 0;
    const facingRegion = side === "start" ? model.regions[regionIndex - 1] : model.regions[regionIndex + 1];
    if (!facingRegion) return 0;
    const ownBlend = clamp(side === "start" ? region.startBlend || 0 : region.endBlend || 0, 0, 1);
    const opposingBlend = clamp(
      side === "start" ? facingRegion.endBlend || 0 : facingRegion.startBlend || 0,
      0,
      1
    );
    return Math.min(ownBlend, opposingBlend);
  }

  function facingMergeCoupling(region, side, model) {
    // Outside the explicit terminal-pull zone each bubble is independent.
    // Ease into the shared width during the first half of that zone, then lock
    // both sides together so the final approach remains exactly symmetric.
    return smoothstep(facingMergeBlend(region, side, model) / 0.5);
  }

  function regionEdgeTransitionWidth(region, side, model, sourceState = state) {
    const ownWidth = regionTransitionWidth(region, sourceState);
    if (!model) return ownWidth;

    const regionIndex = model.regions.indexOf(region);
    const facingRegion = side === "start" ? model.regions[regionIndex - 1] : model.regions[regionIndex + 1];
    if (!facingRegion) return ownWidth;

    const coupling = facingMergeCoupling(region, side, model);
    if (coupling <= EPSILON) return ownWidth;

    // Only approaching forks share a radius. Before the terminal pull begins,
    // a neighbouring region's size must have no effect on this edge.
    const sharedWidth = Math.min(ownWidth, regionTransitionWidth(facingRegion, sourceState));
    return ownWidth + (sharedWidth - ownWidth) * coupling;
  }

  function minimalRegionEdgeTransitionWidth(region, side, model, sourceState = state) {
    // Minimal-line forks retain their own ordinary transition width until
    // physical contact. Do not couple or narrow that width as another fork or
    // chromosome end approaches: merge/end smoothing begins only after the
    // centre-line points have actually met.
    return regionTransitionWidth(region, sourceState);
  }

  function visualRegionEdgeTransitionWidth(region, side, model, sourceState = state) {
    return strandModel(sourceState) === "minimal"
      ? minimalRegionEdgeTransitionWidth(region, side, model, sourceState)
      : regionEdgeTransitionWidth(region, side, model, sourceState);
  }

  function newDnaDistanceInset(region, side, sourceState = state) {
    const open = side === "start" ? region.openStart : region.openEnd;
    if (open) return 0;
    const edgeBlend = clamp(side === "start" ? region.startBlend || 0 : region.endBlend || 0, 0, 1);
    const distance =
      (newDnaStartDistance(sourceState) * VIEW.moleculeWidth) /
      Math.max(1, basePairLattice(sourceState).subdivisionCount);
    return distance * (1 - edgeBlend);
  }

  function nascentEdgeInset(region, side, model) {
    const edgeBlend = side === "start" ? region.startBlend || 0 : region.endBlend || 0;
    if ((side === "start" ? region.openStart : region.openEnd) || edgeBlend >= NASCENT_PROFILE_THRESHOLD) return 0;
    const residualThreshold = (NASCENT_PROFILE_THRESHOLD - edgeBlend) / (1 - edgeBlend);
    return regionEdgeTransitionWidth(region, side, model) * inverseSmoothstep(residualThreshold);
  }

  function schematicNascentStartProfile(sourceState = state) {
    const daughterOffset = Math.max(EPSILON, sourceState.daughterSpacing / 2);
    return clamp((doubleStrandHalfHeight(sourceState) * 2) / daughterOffset, 0, 1);
  }

  function schematicNascentEdgeInset(region, side, model, sourceState = state) {
    if (side === "start" ? region.openStart : region.openEnd) return 0;
    const edgeBlend = side === "start" ? region.startBlend || 0 : region.endBlend || 0;
    const startProfile = schematicNascentStartProfile(sourceState);
    const minimumActiveGap =
      (SCHEMATIC_NASCENT_MIN_GAP_PX / Math.max(EPSILON, artworkAspectX(sourceState))) *
      (1 - clamp(edgeBlend, 0, 1));
    if (edgeBlend >= startProfile - EPSILON) return minimumActiveGap;
    const residualProfile = (startProfile - edgeBlend) / Math.max(EPSILON, 1 - edgeBlend);
    const profileInset =
      regionEdgeTransitionWidth(region, side, model, sourceState) *
      inverseTransitionProfile(residualProfile, sourceState);
    return Math.max(profileInset, minimumActiveGap);
  }

  function schematicNascentEndpointY(x, daughter, region, side, model, sourceState = state) {
    const naturalY = nascentY(x, daughter, model);
    const edgeBlend = clamp(side === "start" ? region.startBlend || 0 : region.endBlend || 0, 0, 1);
    const startProfile = schematicNascentStartProfile(sourceState);
    const terminalProgress = smoothstep((edgeBlend - startProfile) / Math.max(EPSILON, 1 - startProfile));
    const unreplicatedY =
      daughter === "top"
        ? VIEW.centerY - doubleStrandHalfHeight(sourceState)
        : VIEW.centerY + doubleStrandHalfHeight(sourceState);
    return unreplicatedY + (naturalY - unreplicatedY) * terminalProgress;
  }

  function schematicNascentPathY(x, daughter, region, span, model, sourceState = state) {
    const naturalY = nascentY(x, daughter, model);
    if (strandModel(sourceState) !== "elegant") return naturalY;

    const startY = schematicNascentEndpointY(span.fromX, daughter, region, "start", model, sourceState);
    const endY = schematicNascentEndpointY(span.toX, daughter, region, "end", model, sourceState);
    const connectionWidth =
      SCHEMATIC_NASCENT_CONNECTION_PX / Math.max(EPSILON, artworkAspectX(sourceState));
    const startWeight = region.openStart
      ? 0
      : 1 - smoothstep((x - span.fromX) / connectionWidth);
    const endWeight = region.openEnd
      ? 0
      : 1 - smoothstep((span.toX - x) / connectionWidth);
    const totalWeight = startWeight + endWeight;
    if (totalWeight <= EPSILON) return naturalY;
    const normaliser = Math.max(1, totalWeight);
    const correction =
      ((startY - nascentY(span.fromX, daughter, model)) * startWeight +
        (endY - nascentY(span.toX, daughter, model)) * endWeight) /
      normaliser;
    return naturalY + correction;
  }

  function nascentSpan(region, model = getReplicationModel(), sourceState = state) {
    const regionStart = VIEW.x0 + region.start * VIEW.moleculeWidth;
    const regionEnd = VIEW.x0 + region.end * VIEW.moleculeWidth;
    const distanceStartInset = newDnaDistanceInset(region, "start", sourceState);
    const distanceEndInset = newDnaDistanceInset(region, "end", sourceState);
    let startInset = distanceStartInset;
    let endInset = distanceEndInset;

    if (strandModel(sourceState) === "elegant") {
      startInset = Math.max(
        startInset,
        schematicNascentEdgeInset(region, "start", model, sourceState)
      );
      endInset = Math.max(endInset, schematicNascentEdgeInset(region, "end", model, sourceState));
    } else if (strandModel(sourceState) === "standard") {
      startInset = Math.max(startInset, nascentEdgeInset(region, "start", model));
      endInset = Math.max(endInset, nascentEdgeInset(region, "end", model));
    }

    return {
      fromX: Math.min(regionEnd, regionStart + startInset),
      toX: Math.max(regionStart, regionEnd - endInset),
    };
  }

  function newDnaVisibleAt(x, replication, model, sourceState = state) {
    if (!replication?.region || replication.profile < NASCENT_PROFILE_THRESHOLD) return false;
    const span = nascentSpan(replication.region, model, sourceState);
    return x >= span.fromX - EPSILON && x <= span.toX + EPSILON;
  }

  function newDnaBasePairGrowthAt(x, replication, model, sourceState = state) {
    if (!newDnaVisibleAt(x, replication, model, sourceState)) return 0;
    const region = replication.region;
    const span = nascentSpan(region, model, sourceState);
    const pairSpacing =
      VIEW.moleculeWidth / Math.max(1, basePairLattice(sourceState).subdivisionCount);
    const growthDistance = Math.max(EPSILON, pairSpacing * 2);
    const startGrowth = region.openStart
      ? 1
      : smoothstep((x - span.fromX) / growthDistance);
    const endGrowth = region.openEnd
      ? 1
      : smoothstep((span.toX - x) / growthDistance);

    // The nascent span begins only after the configured New-DNA fork distance.
    // Rung growth is therefore anchored to that moving boundary and reaches a
    // complete midpoint join over two base-pair lattice intervals.
    return clamp(Math.min(startGrowth, endGrowth), 0, 1);
  }

  function replicationTransitionAnchors(model) {
    const anchors = [];
    model.regions.forEach((region) => {
      const startX = VIEW.x0 + region.start * VIEW.moleculeWidth;
      const endX = VIEW.x0 + region.end * VIEW.moleculeWidth;
      const startWidth = visualRegionEdgeTransitionWidth(region, "start", model);
      const endWidth = visualRegionEdgeTransitionWidth(region, "end", model);
      anchors.push(startX, Math.min(endX, startX + startWidth), Math.max(startX, endX - endWidth), endX);
    });
    (model.minimalClosures || []).forEach((closure) => {
      if (closure.blend >= 1 - EPSILON) return;
      const centerX = VIEW.x0 + closure.position * VIEW.moleculeWidth;
      anchors.push(
        Math.max(VIEW.x0, centerX - (closure.leftWidth ?? closure.width)),
        centerX,
        Math.min(VIEW.x1, centerX + (closure.rightWidth ?? closure.width))
      );
    });
    return anchors
      .sort((first, second) => first - second)
      .filter((value, index, values) => index === 0 || Math.abs(value - values[index - 1]) > EPSILON);
  }

  function adaptivePathSampleStep(requestedStep = 3, sourceState = state) {
    const aspectX = Math.max(EPSILON, artworkAspectX(sourceState));
    const requestedScreenStep = Math.max(0.5, Math.abs(Number(requestedStep) || 3));
    const screenLimitedWorldStep = requestedScreenStep / aspectX;
    const budgetLimitedWorldStep = VIEW.moleculeWidth / MAX_PATH_SAMPLE_POINTS;
    let resolved = screenLimitedWorldStep;

    if (strandModel(sourceState) === "standard") {
      const turns = Math.max(
        1,
        (Number(sourceState?.length) || DEFAULTS.length) / BASE_PAIRS_PER_TURN
      );
      const turnWidth = VIEW.moleculeWidth / turns;
      // Keep at least 24 samples per helix turn. This prevents long, dense
      // genomes from developing flat shoulders or angular crossover segments,
      // particularly when horizontal aspect magnifies the sampled path.
      resolved = Math.min(resolved, turnWidth / 24);
    }

    return Math.max(0.02, budgetLimitedWorldStep, resolved);
  }

  function replicationPathSampling(model, sampleStep = 3) {
    const anchorXs = [];
    const localWindows = [];
    const step = adaptivePathSampleStep(sampleStep);
    const addWindow = (firstX, secondX) => {
      const fromX = Math.min(firstX, secondX);
      const toX = Math.max(firstX, secondX);
      if (toX - fromX <= EPSILON) {
        anchorXs.push(fromX);
        return;
      }
      const segmentCount = Math.max(1, Math.ceil((toX - fromX) / step));
      for (let index = 0; index <= segmentCount; index += 1) {
        anchorXs.push(fromX + ((toX - fromX) * index) / segmentCount);
      }
      localWindows.push({ fromX, toX });
    };

    model.regions.forEach((region) => {
      const startX = VIEW.x0 + region.start * VIEW.moleculeWidth;
      const endX = VIEW.x0 + region.end * VIEW.moleculeWidth;
      const startWidth = visualRegionEdgeTransitionWidth(region, "start", model);
      const endWidth = visualRegionEdgeTransitionWidth(region, "end", model);
      addWindow(startX, Math.min(endX, startX + startWidth));
      addWindow(Math.max(startX, endX - endWidth), endX);
    });

    (model.minimalClosures || []).forEach((closure) => {
      if (closure.blend >= 1 - EPSILON) return;
      const centerX = VIEW.x0 + closure.position * VIEW.moleculeWidth;
      addWindow(
        Math.max(VIEW.x0, centerX - (closure.leftWidth ?? closure.width)),
        Math.min(VIEW.x1, centerX + (closure.rightWidth ?? closure.width))
      );
    });

    // A gap gets its own endpoint-to-endpoint lattice. Because that lattice is
    // centred on the two forks, its cubic controls remain exact mirror images
    // while the gap contracts, regardless of the global molecule grid phase.
    if (strandModel() !== "standard") {
      for (let index = 0; index < model.regions.length - 1; index += 1) {
        const leftRegion = model.regions[index];
        if (facingMergeCoupling(leftRegion, "end", model) <= EPSILON) continue;
        const leftX = VIEW.x0 + leftRegion.end * VIEW.moleculeWidth;
        const rightX = VIEW.x0 + model.regions[index + 1].start * VIEW.moleculeWidth;
        addWindow(leftX, rightX);
      }
    }

    return {
      anchorXs: anchorXs
        .sort((first, second) => first - second)
        .filter((value, index, values) => index === 0 || Math.abs(value - values[index - 1]) > EPSILON),
      localWindows,
    };
  }

  function cutRange(cut) {
    const first = typeof cut === "number" ? cut : cut.start;
    const second = typeof cut === "number" ? cut : cut.end;
    return {
      start: clamp(Math.min(first, second), 0, 1),
      end: clamp(Math.max(first, second), 0, 1),
    };
  }

  function cutInteractionFraction(fraction, sourceState = state) {
    const configured = Number(fraction);
    const continuous = clamp(Number.isFinite(configured) ? configured : 0, 0, 1);
    if (!snapEditingEnabled(sourceState)) return continuous;
    return snapFractionToBasePair(continuous, sourceState) ?? continuous;
  }

  function cutInteractionRange(start, end, sourceState = state) {
    return cutRange({
      start: cutInteractionFraction(start, sourceState),
      end: cutInteractionFraction(end, sourceState),
    });
  }

  function normaliseCutRegions(cuts) {
    const ranges = cuts.map(cutRange).sort((first, second) => first.start - second.start);
    const merged = [];
    ranges.forEach((range) => {
      const current = merged.at(-1);
      if (current && range.start <= current.end + EPSILON) current.end = Math.max(current.end, range.end);
      else merged.push({ ...range });
    });
    return merged;
  }

  function subtractCutRange(cuts, repairedRange) {
    const repair = cutRange(repairedRange);
    return normaliseCutRegions(
      cuts.flatMap((cut) => {
        const range = cutRange(cut);
        if (repair.end < range.start - EPSILON || repair.start > range.end + EPSILON) {
          return [range];
        }
        const remaining = [];
        if (repair.start > range.start + EPSILON) {
          remaining.push({ start: range.start, end: Math.min(range.end, repair.start) });
        }
        if (repair.end < range.end - EPSILON) {
          remaining.push({ start: Math.max(range.start, repair.end), end: range.end });
        }
        return remaining;
      })
    );
  }

  function cutIndexAtFraction(fraction, sourceState = state, tolerancePx = 24) {
    const position = clamp(Number(fraction) || 0, 0, 1);
    const tolerance = Math.max(0, Number(tolerancePx) || 0) / VIEW.moleculeWidth;
    return (sourceState?.cuts || []).findIndex((cut) => {
      const range = cutRange(cut);
      return position >= range.start - tolerance && position <= range.end + tolerance;
    });
  }

  function previewCutRange() {
    if (dragState?.role !== "cut-range" || !dragState.moved) return null;
    return cutRange({ start: dragState.anchor, end: dragState.current });
  }

  function previewUnreplicateRange() {
    if (dragState?.role !== "unreplicate-range" || !dragState.moved) return null;
    return unreplicateInteractionRange(dragState.anchor, dragState.current);
  }

  function activeCutRanges() {
    const preview = previewCutRange();
    return preview ? normaliseCutRegions([...state.cuts, preview]) : state.cuts.map(cutRange);
  }

  function isCutGap(x, padding = 0) {
    const halfGap = 9 + state.weight + padding;
    return activeCutRanges().some((cut) => {
      const startX = VIEW.x0 + cut.start * VIEW.moleculeWidth;
      const endX = VIEW.x0 + cut.end * VIEW.moleculeWidth;
      return x >= startX - halfGap && x <= endX + halfGap;
    });
  }

  function smoothRunPath(points) {
    if (!points.length) return "";
    if (points.length === 1) return `M${precise(points[0].x)} ${precise(points[0].y)}`;

    const segmentWidths = [];
    const secants = [];
    for (let index = 0; index < points.length - 1; index += 1) {
      const width = Math.max(EPSILON, points[index + 1].x - points[index].x);
      segmentWidths.push(width);
      secants.push((points[index + 1].y - points[index].y) / width);
    }

    // A shape-preserving Hermite slope keeps sharp fork transitions monotonic,
    // while retaining a continuously smooth curve through the sampled helix.
    const slopes = new Array(points.length);
    slopes[0] = Number.isFinite(points[0].slope) ? points[0].slope : secants[0];
    slopes[points.length - 1] = Number.isFinite(points.at(-1).slope) ? points.at(-1).slope : secants.at(-1);
    for (let index = 1; index < points.length - 1; index += 1) {
      if (Number.isFinite(points[index].slope)) {
        slopes[index] = points[index].slope;
        continue;
      }
      const previous = secants[index - 1];
      const next = secants[index];
      if (Math.abs(previous) <= EPSILON || Math.abs(next) <= EPSILON || previous * next <= 0) {
        slopes[index] = 0;
        continue;
      }
      const previousWidth = segmentWidths[index - 1];
      const nextWidth = segmentWidths[index];
      const firstWeight = 2 * nextWidth + previousWidth;
      const secondWeight = nextWidth + 2 * previousWidth;
      slopes[index] = (firstWeight + secondWeight) / (firstWeight / previous + secondWeight / next);
    }

    // Limit supplied analytical/numerical tangents with the same monotonicity
    // guarantee as the fallback Hermite slopes. This prevents tight or round
    // forks from producing a hook without making their tangent depend on the
    // accidental distance to the next global sample.
    for (let index = 0; index < secants.length; index += 1) {
      const secant = secants[index];
      if (Math.abs(secant) <= EPSILON) {
        slopes[index] = 0;
        slopes[index + 1] = 0;
        continue;
      }
      if (slopes[index] * secant <= 0) slopes[index] = 0;
      if (slopes[index + 1] * secant <= 0) slopes[index + 1] = 0;
      const firstRatio = slopes[index] / secant;
      const secondRatio = slopes[index + 1] / secant;
      const magnitude = Math.hypot(firstRatio, secondRatio);
      if (magnitude > 3) {
        const scale = 3 / magnitude;
        slopes[index] = scale * firstRatio * secant;
        slopes[index + 1] = scale * secondRatio * secant;
      }
    }

    let path = `M${precise(points[0].x)} ${precise(points[0].y)}`;
    for (let index = 0; index < points.length - 1; index += 1) {
      const current = points[index];
      const next = points[index + 1];
      const width = segmentWidths[index];
      const control1 = {
        x: current.x + width / 3,
        y: current.y + (slopes[index] * width) / 3,
      };
      const control2 = {
        x: next.x - width / 3,
        y: next.y - (slopes[index + 1] * width) / 3,
      };
      path += ` C${precise(control1.x)} ${precise(control1.y)} ${precise(control2.x)} ${precise(control2.y)} ${precise(
        next.x
      )} ${precise(next.y)}`;
    }
    return path;
  }

  function numericalPathTangent(pointForX, x, fromX, toX) {
    const aspectX = Math.max(EPSILON, artworkAspectX());
    const turns = Math.max(1, (Number(state?.length) || DEFAULTS.length) / BASE_PAIRS_PER_TURN);
    const turnWidth = VIEW.moleculeWidth / turns;
    const delta = Math.max(0.02, Math.min(0.25 / aspectX, turnWidth / 96));
    const leftX = Math.max(fromX, x - delta);
    const rightX = Math.min(toX, x + delta);
    if (rightX - leftX <= EPSILON) return 0;
    return (pointForX(rightX) - pointForX(leftX)) / (rightX - leftX);
  }

  function sampledPath(
    fromX,
    toX,
    pointForX,
    sampleStep = 3,
    extraGapForX = null,
    anchorXs = [],
    localWindows = [],
    tangentForX = null
  ) {
    const runs = [];
    let currentRun = [];
    const addPoint = (x) => {
      if (isCutGap(x) || extraGapForX?.(x)) {
        if (currentRun.length) runs.push(currentRun);
        currentRun = [];
        return;
      }
      const slope = tangentForX?.(x);
      currentRun.push({ x, y: pointForX(x), ...(Number.isFinite(slope) ? { slope } : {}) });
    };

    const step = adaptivePathSampleStep(sampleStep);
    addPoint(fromX);
    const firstInteriorIndex = Math.floor((fromX - VIEW.x0) / step + EPSILON) + 1;
    const interiorXs = anchorXs.filter((x) => x > fromX + EPSILON && x < toX - EPSILON);
    for (let index = firstInteriorIndex; ; index += 1) {
      const x = VIEW.x0 + index * step;
      if (x >= toX - EPSILON) break;
      const inLocalWindow = localWindows.some(
        (window) => x > window.fromX + EPSILON && x < window.toX - EPSILON
      );
      if (!inLocalWindow) interiorXs.push(x);
    }
    interiorXs
      .sort((first, second) => first - second)
      .filter((value, index, values) => index === 0 || Math.abs(value - values[index - 1]) > EPSILON)
      .forEach(addPoint);
    if (toX - fromX > EPSILON) addPoint(toX);
    if (currentRun.length) runs.push(currentRun);
    return runs.map(smoothRunPath).join(" ");
  }

  function insetBasePairSegment(firstY, secondY, width = state.basePairWidth) {
    const distance = Math.abs(secondY - firstY);
    const aspectY = Math.max(EPSILON, artworkAspectY());
    const inset = width / (2 * aspectY);
    if (distance <= inset * 2 + EPSILON) return null;
    const direction = Math.sign(secondY - firstY);
    return {
      firstY: firstY + direction * inset,
      secondY: secondY - direction * inset,
    };
  }

  function mixedBasePairValue(index, sourceState = state) {
    const position = Math.trunc(Number(index) || 0) + 1;
    const lengthKey = Math.round((Number(sourceState?.length) || DEFAULTS.length) * 100);
    const resolutionKey = basePairResolution(sourceState);
    let value = (
      (sourceState.basePairSeed >>> 0) ^
      Math.imul(position, 0x9e3779b1) ^
      Math.imul(lengthKey, 0x85ebca6b) ^
      Math.imul(resolutionKey, 0xc2b2ae35)
    ) >>> 0;
    value ^= value >>> 16;
    value = Math.imul(value, 0x7feb352d) >>> 0;
    value ^= value >>> 15;
    value = Math.imul(value, 0x846ca68b) >>> 0;
    value ^= value >>> 16;
    return value >>> 0;
  }

  function basePairIdentity(index, sourceState = state) {
    const position = Math.max(0, Math.trunc(Number(index) || 0));
    const block = Math.floor(position / BASE_PAIR_VARIATION_BLOCK_SIZE);
    const offset = position % BASE_PAIR_VARIATION_BLOCK_SIZE;
    const shuffled = Array.from(
      { length: BASE_PAIR_VARIATION_BLOCK_SIZE },
      (_, itemIndex) => itemIndex % BASE_PAIR_VARIANTS.length
    );
    for (let itemIndex = shuffled.length - 1; itemIndex > 0; itemIndex -= 1) {
      const randomValue = mixedBasePairValue(
        block * BASE_PAIR_VARIATION_BLOCK_SIZE + itemIndex,
        sourceState
      );
      const swapIndex = randomValue % (itemIndex + 1);
      [shuffled[itemIndex], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[itemIndex]];
    }
    const pair = BASE_PAIR_VARIANTS[shuffled[offset]];
    return { first: pair[0], second: pair[1], label: `${pair[0]}-${pair[1]}` };
  }

  function nucleotideColor(base, sourceState = state) {
    const keys = { A: "adenine", T: "thymine", G: "guanine", C: "cytosine" };
    return stateArtworkColour(keys[base] || "basePair", sourceState);
  }

  function connectedStrandColor(role, sourceState = state) {
    if (role === "a") return stateArtworkColour("templateA", sourceState);
    if (role === "b") return stateArtworkColour("templateB", sourceState);
    return stateArtworkColour("newDna", sourceState);
  }

  function basePairLineColors(firstRole, secondRole, firstBase, secondBase, sourceState = state) {
    const mode = basePairColorMode(sourceState);
    if (mode === "strand") {
      return [connectedStrandColor(firstRole, sourceState), connectedStrandColor(secondRole, sourceState)];
    }
    if (mode === "bases") {
      return [nucleotideColor(firstBase, sourceState), nucleotideColor(secondBase, sourceState)];
    }
    const colour = stateArtworkColour("basePair", sourceState);
    return [colour, colour];
  }

  function renderBasePairLine(
    x,
    firstY,
    secondY,
    visibility,
    { firstRole = "a", secondRole = "b", firstBase = "A", secondBase = "T" } = {}
  ) {
    const segment = insetBasePairSegment(firstY, secondY);
    if (!segment) return "";
    const transition = clamp(Number(visibility) || 0, 0, 1);
    if (transition <= EPSILON) return "";
    const transitionMode = basePairTransitionMode();
    const grows = transitionMode === "grow";
    const instant = transitionMode === "instant";
    const pairOpacity = grows || instant ? 1 : transition;
    const growth = grows ? transition : 1;
    const [firstColor, secondColor] = basePairLineColors(
      firstRole,
      secondRole,
      firstBase,
      secondBase
    );
    const width = state.basePairWidth;
    const strokeAttributes = artworkStrokeAttributes(width);
    const midpoint = (segment.firstY + segment.secondY) / 2;
    const firstInnerY = segment.firstY + (midpoint - segment.firstY) * growth;
    const secondInnerY = segment.secondY + (midpoint - segment.secondY) * growth;
    const direction = Math.sign(segment.secondY - segment.firstY) || 1;
    const capNudge = 0.001 * direction;

    if (!grows && firstColor === secondColor) {
      return `<line x1="${fixed(x)}" y1="${precise(
        segment.firstY
      )}" x2="${fixed(x)}" y2="${precise(
        segment.secondY
      )}" data-pair="${firstBase}-${secondBase}" data-transition="${transitionMode}" stroke="${firstColor}" ${strokeAttributes} opacity="${precise(
        pairOpacity
      )}" stroke-linecap="round"/>`;
    }

    // Draw each half from its connected strand towards the midpoint. Butt caps
    // preserve an exact, flat colour boundary where the halves meet. Separate
    // zero-length round-capped strokes restore rounded outer ends while keeping
    // stroke thickness independent of horizontal or vertical aspect scaling.
    return `<g data-pair="${firstBase}-${secondBase}" data-transition="${transitionMode}" opacity="${precise(pairOpacity)}">
      <line x1="${fixed(x)}" y1="${precise(segment.firstY)}" x2="${fixed(x)}" y2="${precise(
        firstInnerY
      )}" data-half="first" stroke="${firstColor}" ${strokeAttributes} stroke-linecap="butt"/>
      <line x1="${fixed(x)}" y1="${precise(secondInnerY)}" x2="${fixed(x)}" y2="${precise(
        segment.secondY
      )}" data-half="second" stroke="${secondColor}" ${strokeAttributes} stroke-linecap="butt"/>
      <line data-cap="first" x1="${fixed(x)}" y1="${precise(segment.firstY)}" x2="${fixed(
        x
      )}" y2="${precise(segment.firstY + capNudge)}" stroke="${firstColor}" ${strokeAttributes} stroke-linecap="round"/>
      <line data-cap="second" x1="${fixed(x)}" y1="${precise(segment.secondY)}" x2="${fixed(
        x
      )}" y2="${precise(segment.secondY - capNudge)}" stroke="${secondColor}" ${strokeAttributes} stroke-linecap="round"/>
    </g>`;
  }

  function renderBasePairs(model) {
    if (!state.layers.pairs || !modelSupportsDoubleStrandDetails()) return "";

    const pairs = [];
    const transitionMode = basePairTransitionMode();

    displayedBasePairPositions().forEach((index) => {
      const x = VIEW.x0 + basePairFraction(index) * VIEW.moleculeWidth;
      if (isCutGap(x, 3)) return;
      const identity = basePairIdentity(index);
      const replication = replicationAt(x, model);
      const yA = templateY(x, "a", model);
      const yB = templateY(x, "b", model);

      // A parental rung belongs only to unreplicated DNA. Fade or open it as a
      // fork approaches, or keep it fully opaque until the crossing frame in
      // Instant mode.
      if (!replication.region) {
        const parentalVisibility = transitionMode === "instant"
          ? 1
          : parentalPairApproachFade(x, model) *
            basePairForkDistanceFade(x, yA, yB, model, replication);
        const pair = renderBasePairLine(x, yA, yB, parentalVisibility, {
          firstRole: "a",
          secondRole: "b",
          firstBase: identity.first,
          secondBase: identity.second,
        });
        if (pair && parentalVisibility > EPSILON) pairs.push(pair);
      }

      if (state.layers.newDna && newDnaVisibleAt(x, replication, model)) {
        const topNewY = nascentY(x, "top", model);
        const bottomNewY = nascentY(x, "bottom", model);
        let topVisibility = 1;
        let bottomVisibility = 1;

        if (transitionMode !== "instant") {
          const daughterTransition = transitionMode === "grow"
            ? newDnaBasePairGrowthAt(x, replication, model)
            : daughterDetailFade(replication.profile);
          topVisibility =
            daughterTransition * basePairForkDistanceFade(x, yA, topNewY, model, replication);
          bottomVisibility =
            daughterTransition * basePairForkDistanceFade(x, yB, bottomNewY, model, replication);
        }

        const topPair = renderBasePairLine(x, yA, topNewY, topVisibility, {
          firstRole: "a",
          secondRole: "top",
          firstBase: identity.first,
          secondBase: identity.second,
        });
        const bottomPair = renderBasePairLine(x, yB, bottomNewY, bottomVisibility, {
          firstRole: "b",
          secondRole: "bottom",
          firstBase: identity.second,
          secondBase: identity.first,
        });
        if (topPair && topVisibility > EPSILON) pairs.push(topPair);
        if (bottomPair && bottomVisibility > EPSILON) pairs.push(bottomPair);
      }
    });

    return `<g aria-label="Base pairs">${pairs.join("")}</g>`;
  }

  function renderNascentDna(model) {
    if (!state.layers.newDna || strandModel() === "minimal") return "";
    const strands = [];
    const sampling = replicationPathSampling(model);

    model.regions.forEach((region) => {
      const span = nascentSpan(region, model);
      const { fromX, toX } = span;
      const spanWidth = toX - fromX;
      if (spanWidth <= EPSILON) return;
      const topYForX = (x) => schematicNascentPathY(x, "top", region, span, model);
      const bottomYForX = (x) => schematicNascentPathY(x, "bottom", region, span, model);
      const topPath = sampledPath(
        fromX,
        toX,
        topYForX,
        3,
        (x) => isUnderpassGap(x, "top", model),
        sampling.anchorXs,
        sampling.localWindows,
        (x) => numericalPathTangent(topYForX, x, fromX, toX)
      );
      const bottomPath = sampledPath(
        fromX,
        toX,
        bottomYForX,
        3,
        (x) => isUnderpassGap(x, "bottom", model),
        sampling.anchorXs,
        sampling.localWindows,
        (x) => numericalPathTangent(bottomYForX, x, fromX, toX)
      );
      const width = Math.max(2, state.weight * 0.9);
      const strokeAttributes = artworkStrokeAttributes(width);
      const opacity = precise(smoothstep(spanWidth / 18));
      strands.push(
        `<path d="${topPath}" fill="none" stroke="${stateArtworkColour("newDna")}" ${strokeAttributes} stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"/>`,
        `<path d="${bottomPath}" fill="none" stroke="${stateArtworkColour("newDna")}" ${strokeAttributes} stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"/>`
      );
    });

    return `<g aria-label="Newly synthesised DNA">${strands.join("")}</g>`;
  }

  function renderCrossoverOverpasses(model) {
    if (strandModel() !== "standard" || state.advanced.crossoverGaps) return "";
    const overpasses = [];
    const halfWidth = crossoverClipHalfWidth(1.8, 7);
    const sampling = replicationPathSampling(model);

    const addOverpass = (x, strand, color, opacity = 1) => {
      if (opacity <= EPSILON) return;
      const fromX = Math.max(VIEW.x0, x - halfWidth);
      const toX = Math.min(VIEW.x1, x + halfWidth);
      const nascent = strand === "top" || strand === "bottom";
      const yForX = nascent
        ? (sampleX) => nascentY(sampleX, strand, model)
        : (sampleX) => templateY(sampleX, strand, model);
      const path = sampledPath(
        fromX,
        toX,
        yForX,
        3,
        nascent
          ? (sampleX) => {
              const replication = replicationAt(sampleX, model);
              return !newDnaVisibleAt(sampleX, replication, model);
            }
          : null,
        sampling.anchorXs,
        sampling.localWindows,
        (sampleX) => numericalPathTangent(yForX, sampleX, VIEW.x0, VIEW.x1)
      );
      if (!path) return;
      const width = strand === "a" || strand === "b" ? state.weight : Math.max(2, state.weight * 0.9);
      overpasses.push(
        `<path d="${path}" fill="none" stroke="${color}" ${artworkStrokeAttributes(
          width
        )} stroke-linecap="round" stroke-linejoin="round" opacity="${precise(opacity)}"/>`
      );
    };

    crossoverSites().forEach(({ index, x }) => {
      const replication = replicationAt(x, model);
      const even = index % 2 === 0;

      if (!replication.region || !state.layers.newDna) {
        addOverpass(x, even ? "a" : "b", even ? stateArtworkColour("templateA") : stateArtworkColour("templateB"));
        return;
      }

      const daughterMix = newDnaVisibleAt(x, replication, model)
        ? daughterDetailFade(replication.profile)
        : 0;
      addOverpass(x, even ? "a" : "b", even ? stateArtworkColour("templateA") : stateArtworkColour("templateB"));
      addOverpass(x, even ? "bottom" : "top", stateArtworkColour("newDna"), daughterMix);
    });

    return `<g aria-label="Alternating strand overpasses">${overpasses.join("")}</g>`;
  }

  function interactionHalfHeight() {
    return state.daughterSpacing / 2;
  }

  function toolGuideBounds(sourceState = state) {
    const aspectY = Math.max(EPSILON, artworkAspectY(sourceState));
    const zoom = Math.max(EPSILON, viewState.zoom);
    const margin = 18 / (zoom * aspectY);
    const halfExtent =
      sourceState.daughterSpacing / 2 + doubleStrandHalfHeight(sourceState) + margin;
    return {
      top: VIEW.centerY - halfExtent,
      bottom: VIEW.centerY + halfExtent,
    };
  }

  function renderItemDeleteControl(x, y, role, dataAttributes, label) {
    return `<g class="rs-item-delete-control rs-ui-only" data-role="${role}" ${dataAttributes} transform="${fixedUiTransform(
      x,
      y
    )}" role="button" tabindex="0" aria-label="${label}">
      <circle class="rs-item-delete-disc" cx="0" cy="0" r="8"/>
      <path class="rs-item-delete-cross" d="M-3-3L3 3M3-3L-3 3"/>
      <circle cx="0" cy="0" r="13" fill="transparent"/>
    </g>`;
  }

  function renderLocalItemDeleteControl(offsetX, offsetY, role, dataAttributes, label) {
    return `<g class="rs-item-delete-control rs-ui-only" data-role="${role}" ${dataAttributes} transform="translate(${fixed(
      offsetX
    )} ${fixed(offsetY)})" role="button" tabindex="0" aria-label="${label}">
      <circle class="rs-item-delete-disc" cx="0" cy="0" r="8"/>
      <path class="rs-item-delete-cross" d="M-3-3L3 3M3-3L-3 3"/>
      <circle cx="0" cy="0" r="13" fill="transparent"/>
    </g>`;
  }

  function renderOrigins(model) {
    return model.origins
      .map((origin) => {
        const selected = state.selectedOriginId === origin.id && !state.selectedFork;
        const dragged = dragState?.originId === origin.id && dragState.role === "origin";
        const x = VIEW.x0 + origin.position * VIEW.moleculeWidth;
        const leftX = VIEW.x0 + origin.leftPosition * VIEW.moleculeWidth;
        const rightX = VIEW.x0 + origin.rightPosition * VIEW.moleculeWidth;
        const bubbleWidth = rightX - leftX;
        const hitWidth = Math.max(48, bubbleWidth);
        const hitX = leftX - x - Math.max(0, (48 - bubbleWidth) / 2);
        const hitHalfHeight = interactionHalfHeight();
        const replication = replicationAt(x, model);
        const labelY = clamp(VIEW.centerY + replication.amount + 42, 370, 500);
        const selectionRing = selected
          ? `<circle class="rs-ui-only" cx="0" cy="0" r="17" fill="none" stroke="${stateArtworkColour("templateA")}" stroke-width="3" opacity="0.55"/>`
          : "";
        const label = state.layers.labels
          ? `<g class="rs-ui-only" transform="${fixedUiTransform(x, labelY)}"><text x="0" y="4" fill="${canvasInkColor()}" font-family="Inter, Segoe UI, sans-serif" font-size="13" font-weight="700" text-anchor="middle">O${
              origin.index + 1
            }</text></g>`
          : "";
        const deleteControl = renderLocalItemDeleteControl(
          21,
          -21,
          "delete-origin",
          `data-origin-id="${origin.id}"`,
          `Delete origin O${origin.index + 1}`
        );

        return `<g class="rs-origin-marker${dragged ? " is-dragged" : ""}" data-origin-id="${origin.id}">
          <rect class="rs-origin-hover-zone rs-ui-only" data-role="bubble-hover" data-origin-id="${origin.id}" x="${fixed(
            x + hitX
          )}" y="${fixed(VIEW.centerY - hitHalfHeight)}" width="${fixed(hitWidth)}" height="${fixed(
            hitHalfHeight * 2
          )}" fill="transparent"/>
          <g class="rs-origin-control-cluster" transform="${fixedUiTransform(x, VIEW.centerY)}">
            <g class="rs-origin-visual">
              ${selectionRing}
              <circle cx="0" cy="0" r="10" fill="${canvasBackgroundColor()}" stroke="${canvasInkColor()}" stroke-width="2.5"/>
              <path d="M-1.5-4.5L-6 0l4.5 4.5M1.5-4.5L6 0 1.5 4.5" fill="none" stroke="${canvasInkColor()}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            <circle class="rs-origin-control-hit rs-ui-only" data-role="origin" data-origin-id="${origin.id}" cx="0" cy="0" r="24" fill="transparent"/>
            ${deleteControl}
          </g>
          ${label}
        </g>`;
      })
      .join("");
  }

  function renderFork(origin, side, forkNumber) {
    const isLeft = side === "left";
    const position = isLeft ? origin.leftPosition : origin.rightPosition;
    const x = VIEW.x0 + position * VIEW.moleculeWidth;
    const direction = isLeft ? -1 : 1;
    const arrow = state.layers.labels
      ? `<line x1="${direction * 10}" y1="-30" x2="${direction * 36}" y2="-30" stroke="${canvasInkColor()}" stroke-width="2" marker-end="url(#rs-arrow-neutral)"/>`
      : "";
    const label = state.layers.labels
      ? `<text x="${direction * 23}" y="-45" fill="${canvasInkColor()}" font-family="Inter, Segoe UI, sans-serif" font-size="13" font-weight="700" text-anchor="middle">F${forkNumber}</text>`
      : "";
    const chevron = isLeft ? "M 3 -5 L -3 0 L 3 5" : "M -3 -5 L 3 0 L -3 5";
    const dragged = dragState?.role === "fork" && dragState.originId === origin.id && dragState.side === side;
    const selected = state.selectedFork?.originId === origin.id && state.selectedFork?.side === side;
    const selectionRing = selected
      ? `<circle class="rs-fork-selection-ring" cx="0" cy="0" r="16" fill="none" stroke="${stateArtworkColour("templateA")}" stroke-width="3" opacity="0.58"/>`
      : "";
    const terminalOpacity = clamp(isLeft ? origin.leftTerminalOpacity ?? 1 : origin.rightTerminalOpacity ?? 1, 0, 1);

    return `<g transform="${fixedUiTransform(x, VIEW.centerY)}" style="--rs-fork-terminal-opacity:${precise(
      terminalOpacity
    )}"><g class="rs-fork-terminal-indicator">${arrow}${label}</g><g class="rs-fork-handle rs-ui-only${
      dragged ? " is-dragged" : ""
    }" data-role="fork" data-origin-id="${
      origin.id
    }" data-side="${side}">
        <g class="rs-fork-control-visual">
          ${selectionRing}
          <circle cx="0" cy="0" r="11" fill="${canvasBackgroundColor()}" stroke="${canvasInkColor()}" stroke-width="2"/>
          <path d="${chevron}" fill="none" stroke="${canvasInkColor()}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <circle cx="0" cy="0" r="24" fill="transparent"/>
      </g>
    </g>`;
  }

  function forkDescriptors(model) {
    let forkNumber = 1;
    const descriptors = [];
    model.origins.forEach((origin) => {
      if (origin.leftActive) descriptors.push({ origin, side: "left", number: forkNumber++ });
      if (origin.rightActive) descriptors.push({ origin, side: "right", number: forkNumber++ });
    });
    return descriptors;
  }

  function selectedForkDescriptor(model) {
    if (!state.selectedFork) return null;
    return (
      forkDescriptors(model).find(
        ({ origin, side }) => origin.id === state.selectedFork.originId && side === state.selectedFork.side
      ) || null
    );
  }

  function renderForks(model) {
    const forks = forkDescriptors(model).map(({ origin, side, number }) => renderFork(origin, side, number));
    return `<g aria-label="Active replication forks">${forks.join("")}</g>`;
  }

  function renderCuts() {
    const cuts = state.cuts.map((cut, index) => ({
      range: cutRange(cut),
      index,
      preview: false,
    }));
    const preview = previewCutRange();
    const cutColor = artworkColour("#b8384b");
    if (preview) cuts.push({ range: preview, index: "preview", preview: true });
    const guideBounds = toolGuideBounds();
    const guideTop = clamp(guideBounds.top, 70, VIEW.height - 70);
    const guideBottom = clamp(guideBounds.bottom, 70, VIEW.height - 70);
    const guideHeight = Math.max(1, guideBottom - guideTop);
    const iconOffset = 16 / Math.max(EPSILON, viewState.zoom * artworkAspectY());
    const iconY = clamp(guideTop - iconOffset, 46, VIEW.height - 46);

    return cuts
      .map(({ range, index, preview: isPreview }) => {
        const gapPadding = 9 + state.weight;
        const startX = VIEW.x0 + range.start * VIEW.moleculeWidth;
        const endX = VIEW.x0 + range.end * VIEW.moleculeWidth;
        const leftX = startX - gapPadding;
        const rightX = endX + gapPadding;
        const centerX = (startX + endX) / 2;
        const wide = endX - startX > 2;
        const guide = wide
          ? `<rect x="${fixed(leftX)}" y="${fixed(guideTop)}" width="${fixed(
              rightX - leftX
            )}" height="${fixed(guideHeight)}" fill="${cutColor}" opacity="0.08"/>
             <line x1="${fixed(leftX)}" y1="${fixed(guideTop)}" x2="${fixed(leftX)}" y2="${fixed(
              guideBottom
            )}" stroke="${cutColor}" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.62" vector-effect="non-scaling-stroke"/>
             <line x1="${fixed(rightX)}" y1="${fixed(guideTop)}" x2="${fixed(rightX)}" y2="${fixed(
              guideBottom
            )}" stroke="${cutColor}" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.62" vector-effect="non-scaling-stroke"/>`
          : `<line x1="${fixed(centerX)}" y1="${fixed(guideTop)}" x2="${fixed(centerX)}" y2="${fixed(
              guideBottom
            )}" stroke="${cutColor}" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.55" vector-effect="non-scaling-stroke"/>`;
        const deleteControl = isPreview
          ? ""
          : renderItemDeleteControl(
              centerX + 27 / Math.max(EPSILON, viewState.zoom * artworkScaleX()),
              iconY,
              "delete-cut",
              `data-cut-index="${index}"`,
              `Delete break ${Number(index) + 1}`
            );

        return `<g class="rs-cut-marker${isPreview ? " is-preview" : ""}" data-role="cut" data-cut-index="${index}">
          ${guide}
          <rect class="rs-ui-only" x="${fixed(leftX - 12)}" y="${fixed(
            guideTop - iconOffset * 2
          )}" width="${fixed(rightX - leftX + 24)}" height="${fixed(
            guideHeight + iconOffset * 4
          )}" fill="transparent"/>
          <g class="rs-ui-only" transform="${fixedUiTransform(centerX, iconY)}">
            <circle cx="0" cy="0" r="17" fill="${canvasBackgroundColor()}" stroke="${cutColor}" stroke-width="2"/>
            <text x="0" y="6" fill="${cutColor}" font-family="Segoe UI Symbol, sans-serif" font-size="18" text-anchor="middle">&#9986;</text>
          </g>
          ${deleteControl}
        </g>`;
      })
      .join("");
  }

  function renderUnreplicatePreview() {
    const range = previewUnreplicateRange();
    if (!range) return "";
    const guideBounds = toolGuideBounds();
    const guideTop = clamp(guideBounds.top, 70, VIEW.height - 70);
    const guideBottom = clamp(guideBounds.bottom, 70, VIEW.height - 70);
    const guideHeight = Math.max(1, guideBottom - guideTop);
    const firstX = VIEW.x0 + range.start * VIEW.moleculeWidth;
    const secondX = VIEW.x0 + range.end * VIEW.moleculeWidth;
    const leftX = Math.min(firstX, secondX);
    const rightX = Math.max(firstX, secondX);
    const width = rightX - leftX;
    const color = artworkColour("#b8384b");
    const lines = width > 2
      ? `<line x1="${fixed(leftX)}" y1="${fixed(guideTop)}" x2="${fixed(
          leftX
        )}" y2="${fixed(guideBottom)}" stroke="${color}" stroke-width="1.5" stroke-dasharray="5 6" opacity="0.72" vector-effect="non-scaling-stroke"/>
         <line x1="${fixed(rightX)}" y1="${fixed(guideTop)}" x2="${fixed(
          rightX
        )}" y2="${fixed(guideBottom)}" stroke="${color}" stroke-width="1.5" stroke-dasharray="5 6" opacity="0.72" vector-effect="non-scaling-stroke"/>`
      : `<line x1="${fixed(leftX)}" y1="${fixed(guideTop)}" x2="${fixed(
          leftX
        )}" y2="${fixed(guideBottom)}" stroke="${color}" stroke-width="1.5" stroke-dasharray="5 6" opacity="0.72" vector-effect="non-scaling-stroke"/>`;
    return `<g class="rs-unreplicate-preview rs-ui-only" aria-label="Unreplicate preview">
      ${width > 2 ? `<rect x="${fixed(leftX)}" y="${fixed(guideTop)}" width="${fixed(width)}" height="${fixed(guideHeight)}" fill="${color}" opacity="0.055"/>` : ""}
      ${lines}
    </g>`;
  }

  function transformedSvgPoint(x, y, matrix) {
    const point = elements.canvas.createSVGPoint();
    point.x = x;
    point.y = y;
    return point.matrixTransform(matrix);
  }

  function niceIntegerCeiling(value) {
    if (value <= 1) return 1;
    const power = 10 ** Math.floor(Math.log10(value));
    const normalised = value / power;
    const multiplier = normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 5 ? 5 : 10;
    return multiplier * power;
  }

  function rulerMajorEvery(pairSpacing, sourceState = state) {
    const pairCount = basePairCount(sourceState);
    const minimumStep = Math.max(1, Math.ceil(82 / Math.max(pairSpacing, EPSILON)));
    return Math.min(pairCount, niceIntegerCeiling(minimumStep));
  }

  function rulerBasePairPosition(index, sourceState = state) {
    return clamp(Math.round(index), 0, basePairCount(sourceState));
  }

  function rulerTickPosition(basePairPosition, start, end, sourceState = state) {
    return start + basePairFraction(rulerBasePairPosition(basePairPosition, sourceState), sourceState) * (end - start);
  }

  function rulerTickIndices(majorEvery, sourceState = state) {
    const pairCount = basePairCount(sourceState);
    const step = Math.max(1, Math.round(Number(majorEvery) || 1));
    const indices = [];
    for (let index = 0; index <= pairCount; index += step) indices.push(index);
    if (indices.at(-1) !== pairCount) indices.push(pairCount);
    return indices;
  }

  function updateGrid() {
    const frame = elements.canvasFrame;
    const background = canvasBackgroundColor();
    const ink = canvasInkColor();
    frame.style.setProperty("--rs-canvas-background", background);
    frame.style.setProperty("--rs-canvas-ink", ink);
    frame.style.setProperty("--rs-grid-line", canvasGridColor());
    document.documentElement?.style?.setProperty("--rs-guide-canvas", background);
    document.documentElement?.style?.setProperty("--rs-guide-ink", ink);
    document.documentElement?.style?.setProperty(
      "--rs-guide-base-pair",
      stateArtworkColour("basePair")
    );
    frame.classList.toggle("is-grid-hidden", !state.advanced.grid);
    if (!state.advanced.grid) return;

    const matrix = elements.canvas.querySelector("#rs-artwork-aspect")?.getScreenCTM();
    if (!matrix) return;
    const bounds = frame.getBoundingClientRect();
    const originX = bounds.left + frame.clientLeft;
    const originY = bounds.top + frame.clientTop;
    const anchor = transformedSvgPoint(VIEW.x0, VIEW.centerY, matrix);
    // Scale-within-bar mode keeps the grid tied to the bar endpoints. In
    // right-extension mode the original grid spacing remains exactly fixed and
    // new columns simply continue to the right with the added genome.
    const xStep = transformedSvgPoint(
      VIEW.x0 + gridWorldStep(state),
      VIEW.centerY,
      matrix
    );
    const yStep = transformedSvgPoint(VIEW.x0, VIEW.centerY + 80, matrix);
    const spacingX = Math.max(4, Math.hypot(xStep.x - anchor.x, xStep.y - anchor.y));
    const spacingY = Math.max(4, Math.hypot(yStep.x - anchor.x, yStep.y - anchor.y));

    frame.style.setProperty("--rs-grid-x", `${fixed(spacingX)}px`);
    frame.style.setProperty("--rs-grid-y", `${fixed(spacingY)}px`);
    frame.style.setProperty("--rs-grid-pos-x", `${fixed(anchor.x - originX)}px`);
    frame.style.setProperty("--rs-grid-pos-y", `${fixed(anchor.y - originY)}px`);
  }

  function updateChromosomeRuler() {
    const ruler = elements.chromosomeRuler;
    const matrix = elements.canvas.querySelector("#rs-artwork-aspect")?.getScreenCTM();
    if (!ruler || !matrix) return;

    const bounds = ruler.getBoundingClientRect();
    const start = transformedSvgPoint(VIEW.x0, VIEW.centerY, matrix).x - bounds.left;
    const end = transformedSvgPoint(VIEW.x1, VIEW.centerY, matrix).x - bounds.left;
    const lattice = basePairLattice();
    const pairCount = basePairCount();
    const pairSpacing = (end - start) / lattice.subdivisionCount;
    if (!Number.isFinite(pairSpacing) || pairSpacing <= 0) return;

    const firstTick = start + lattice.edgeOffset * pairSpacing;
    const firstVisible = clamp(Math.ceil((0 - firstTick) / pairSpacing), 0, pairCount);
    const lastVisible = clamp(Math.floor((ruler.clientWidth - firstTick) / pairSpacing), 0, pairCount);
    const majorEvery = rulerMajorEvery(pairSpacing);
    const ticks = [];

    rulerTickIndices(majorEvery).forEach((index) => {
      if (index < firstVisible || index > lastVisible) return;
      const position = rulerTickPosition(index, start, end);
      const endpointClass = index === 0 ? " is-start" : index === pairCount ? " is-end" : "";
      const label = String(rulerBasePairPosition(index));
      ticks.push(
        `<span class="rs-ruler-tick is-labelled${endpointClass}" style="left:${fixed(
          position
        )}px"><output>${label}</output></span>`
      );
    });

    ruler.innerHTML = `<div class="rs-ruler-title">Genomic position (bp)</div><div class="rs-ruler-track"><span class="rs-ruler-axis"></span>${ticks.join(
      ""
    )}</div>`;
  }

  function contextGlyphMarkup(actionName, color) {
    if (actionName === "split") {
      return `<circle cx="0" cy="0" r="3.8" fill="${stateArtworkColour("basePair")}"/>`;
    }
    if (actionName === "add") {
      return `<path d="M-5 0H5M0-5V5" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>`;
    }
    if (actionName === "unreplicate") {
      return `<text x="0" y="5" fill="${color}" font-family="Inter, Segoe UI Symbol, sans-serif" font-size="17" font-weight="700" text-anchor="middle">&#8634;</text>`;
    }
    return `<text x="0" y="5" fill="${color}" font-family="Inter, Segoe UI Symbol, sans-serif" font-size="16" font-weight="700" text-anchor="middle">&#9986;</text>`;
  }

  function renderContextAction() {
    const bounds = toolGuideBounds();
    return `<g id="rs-context-action" class="rs-context-action rs-ui-only" data-action="add" visibility="hidden">
      <line x1="0" y1="${fixed(bounds.top)}" x2="0" y2="${fixed(
        bounds.bottom
      )}" fill="none" stroke="${canvasInkColor()}" stroke-width="1.6" stroke-dasharray="5 5" vector-effect="non-scaling-stroke"/>
      <g id="rs-context-symbol" transform="${fixedUiTransform(0, VIEW.centerY)}">
        <circle id="rs-context-ring" cx="0" cy="0" r="16" fill="${
          canvasBackgroundColor()
        }" stroke="${canvasInkColor()}" stroke-width="1.8"/>
        <g id="rs-context-glyph"></g>
      </g>
    </g>`;
  }
  function updateCanvasLegend() {
    const items = [
      [stateArtworkColour("templateA"), "Template A"],
      [stateArtworkColour("templateB"), "Template B"],
    ];
    if (state.layers.newDna && strandModel() !== "minimal") {
      items.push([stateArtworkColour("newDna"), "New strands"]);
    }
    elements.canvasLegend.hidden = !state.layers.labels;
    elements.canvasLegend.innerHTML = state.layers.labels
      ? items
          .map(
            ([color, label]) => `<span class="rs-legend-item"><span class="rs-legend-swatch" style="background:${color}"></span>${label}</span>`
          )
          .join("")
      : "";
  }

  function renderEndLabels(model) {
    if (!state.layers.labels) return "";
    const separate = (first, second) => {
      if (Math.abs(first - second) >= 28) return [first, second];
      const middle = (first + second) / 2;
      return first >= second ? [middle + 14, middle - 14] : [middle - 14, middle + 14];
    };
    const [leftA, leftB] = separate(templateY(VIEW.x0, "a", model), templateY(VIEW.x0, "b", model));
    const [rightA, rightB] = separate(templateY(VIEW.x1, "a", model), templateY(VIEW.x1, "b", model));
    return `<g class="rs-ui-only" fill="${canvasInkColor()}" font-family="Inter, Segoe UI, sans-serif" font-size="14" font-weight="700">
      <g transform="${fixedUiTransform(VIEW.x0, leftA)}"><text x="-22" y="4" text-anchor="end">5'</text></g>
      <g transform="${fixedUiTransform(VIEW.x0, leftB)}"><text x="-22" y="4" text-anchor="end">3'</text></g>
      <g transform="${fixedUiTransform(VIEW.x1, rightA)}"><text x="22" y="4">3'</text></g>
      <g transform="${fixedUiTransform(VIEW.x1, rightB)}"><text x="22" y="4">5'</text></g>
    </g>`;
  }

  function artworkMarkup(model) {
    const sampling = replicationPathSampling(model);
    const templateAYForX = (x) => templateY(x, "a", model);
    const templateBYForX = (x) => templateY(x, "b", model);
    const pathA = sampledPath(
      VIEW.x0,
      VIEW.x1,
      templateAYForX,
      3,
      (x) => isUnderpassGap(x, "a", model),
      sampling.anchorXs,
      sampling.localWindows,
      (x) => numericalPathTangent(templateAYForX, x, VIEW.x0, VIEW.x1)
    );
    const pathB = sampledPath(
      VIEW.x0,
      VIEW.x1,
      templateBYForX,
      3,
      (x) => isUnderpassGap(x, "b", model),
      sampling.anchorXs,
      sampling.localWindows,
      (x) => numericalPathTangent(templateBYForX, x, VIEW.x0, VIEW.x1)
    );

    return `${renderBasePairs(model)}
      <path d="${pathA}" fill="none" stroke="${stateArtworkColour("templateA")}" ${artworkStrokeAttributes(
        state.weight
      )} stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${pathB}" fill="none" stroke="${stateArtworkColour("templateB")}" ${artworkStrokeAttributes(
        state.weight
      )} stroke-linecap="round" stroke-linejoin="round"/>
      ${renderNascentDna(model)}
      ${renderCrossoverOverpasses(model)}`;
  }

  function replicatedFraction(model) {
    return clamp(model.regions.reduce((total, region) => total + region.end - region.start, 0) * 100, 0, 100);
  }

  function synchroniseSPhaseFromGeometry(model = getReplicationModel(), sourceState = state) {
    const replicated = sourceState.origins.length ? replicatedFraction(model) : 0;
    sourceState.progress = Math.abs(replicated - Math.round(replicated)) < 1e-9 ? Math.round(replicated) : replicated;
    return sourceState.progress;
  }

  function setSPhaseTime(percentage, sourceState = state) {
    const target = sourceState.origins.length ? boundedControlValue("progress", percentage) : 0;
    const desiredTravel = findForkTravelForReplicatedFraction(target, sourceState);
    sourceState.forkTravel = discreteAnimationEnabled(sourceState)
      ? snapForkTravel(desiredTravel, sourceState)
      : desiredTravel;
    resetForkPlaybackClock(sourceState);
    const model = getReplicationModelAtTravel(sourceState.forkTravel, sourceState);
    synchroniseSPhaseFromGeometry(model, sourceState);
    synchroniseOriginPositions(sourceState);
    return model;
  }

  function advanceForkPlayback(elapsedMilliseconds, sourceState = state) {
    const elapsed = Math.max(0, Number(elapsedMilliseconds) || 0);
    const speed = playbackSpeed(sourceState);
    const bounds = forkTravelBounds(sourceState);
    const travelIncrement =
      elapsed * FORK_TRAVEL_PER_MILLISECOND * speed * genomeDistanceScale(sourceState);
    if (discreteAnimationEnabled(sourceState)) {
      const step = basePairStepFraction(sourceState);
      let clock = forkPlaybackClocks.get(sourceState);
      if (!clock || Math.abs(clock.lastTravel - sourceState.forkTravel) > 1e-10) {
        clock = { lastTravel: sourceState.forkTravel, remainder: 0 };
      }
      const accumulated = clock.remainder + travelIncrement;
      const completedSteps = Math.floor(accumulated / step + 1e-10);
      const steppedTravel = sourceState.forkTravel + completedSteps * step;
      sourceState.forkTravel = clamp(steppedTravel, bounds.zero, bounds.full);
      clock.remainder = sourceState.forkTravel >= bounds.full - Number.EPSILON
        ? 0
        : accumulated - completedSteps * step;
      clock.lastTravel = sourceState.forkTravel;
      forkPlaybackClocks.set(sourceState, clock);
    } else {
      resetForkPlaybackClock(sourceState);
      sourceState.forkTravel = clamp(sourceState.forkTravel + travelIncrement, bounds.zero, bounds.full);
    }
    const model = getReplicationModelAtTravel(sourceState.forkTravel, sourceState);
    synchroniseSPhaseFromGeometry(model, sourceState);
    synchroniseOriginPositions(sourceState);
    return model;
  }

  function worldTransform() {
    return `translate(${fixed(VIEW.width / 2 + viewState.panX)} ${fixed(VIEW.centerY + viewState.panY)}) scale(${precise(viewState.zoom)}) translate(${
      -VIEW.width / 2
    } ${-VIEW.centerY})`;
  }

  function render() {
    syncViewGeometry(state);
    let model = getReplicationModel();
    if (synchroniseOriginPositions()) model = getReplicationModel();
    synchroniseSPhaseFromGeometry(model);
    const selectedFork = selectedForkDescriptor(model);
    if (state.selectedFork && !selectedFork) state.selectedFork = null;
    const selectedOrigin = !state.selectedFork
      ? model.origins.find((origin) => origin.id === state.selectedOriginId)
      : null;
    elements.canvas.classList.toggle("rs-show-all-controls", state.advanced.alwaysShowControls);
    const liveArtwork = withArtworkStrokeScale(viewState.zoom, () => artworkMarkup(model));

    elements.canvas.innerHTML = `
      <title id="dnaCanvasTitle">RepliSketch DNA replication diagram</title>
      <desc id="dnaCanvasDescription">A vector diagram of a ${basePairCount()} base-pair DNA molecule with ${
        state.origins.length
      } replication origins, ${model.activeForkCount} active forks, and ${state.cuts.length} strand breaks.</desc>
      <defs>
        <marker id="rs-arrow-neutral" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 8 4 L 0 8 z" fill="${canvasInkColor()}"/>
        </marker>
      </defs>
      <rect class="rs-canvas-hit-plane rs-ui-only" width="1200" height="640" fill="transparent"/>
      <g id="rs-world" transform="${worldTransform()}">
        <g id="rs-export-artwork" aria-label="DNA molecule">
          <g id="rs-artwork-aspect" transform="${artworkAspectTransform()}">
            ${liveArtwork}
          </g>
        </g>
        <g id="rs-ui-aspect" transform="${artworkAspectTransform()}">
          ${renderEndLabels(model)}
          <g class="rs-ui-only" aria-label="Replication origins">${renderOrigins(model)}</g>
          ${renderForks(model)}
          <g aria-label="DNA breaks">${renderCuts()}</g>
          ${renderUnreplicatePreview()}
          ${renderContextAction()}
        </g>
      </g>
    `;

    updateReadouts(model);
    updateCanvasLegend();
    if (selectedFork) {
      const position = selectedFork.side === "left"
        ? selectedFork.origin.leftPosition
        : selectedFork.origin.rightPosition;
      elements.selectionMessage.textContent = `F${selectedFork.number} (${selectedFork.side}) at ${genomicPositionAtFraction(
        position
      )} bp`;
    } else {
      elements.selectionMessage.textContent = selectedOrigin
        ? `O${selectedOrigin.index + 1} at ${genomicPositionAtFraction(selectedOrigin.position)} bp`
        : "No selection";
    }
    updateGrid();
    updateChromosomeRuler();
    refreshContextAction();
    return model;
  }

  function updateReadouts(model = getReplicationModel()) {
    const replicated = Math.round(replicatedFraction(model));
    elements.lengthOutput.textContent = `${basePairCount()} bp`;
    elements.progressOutput.textContent = `${Math.round(state.progress)}%`;
    elements.pairResolutionOutput.textContent = `${basePairResolution()} between crossovers`;
    elements.basePairWidthOutput.textContent = `${state.basePairWidth.toFixed(1)} px`;
    elements.weightOutput.textContent = `${state.weight} px`;
    if (elements.doubleStrandHeightOutput) {
      elements.doubleStrandHeightOutput.textContent = `${state.doubleStrandHeight} px`;
    }
    elements.daughterSpacingOutput.textContent = `${state.daughterSpacing} px`;
    if (elements.newDnaStartDistanceOutput) {
      elements.newDnaStartDistanceOutput.textContent = newDnaStartDistanceLabel();
    }
    if (elements.strandPhaseShiftOutput) {
      elements.strandPhaseShiftOutput.textContent = strandPhaseShiftLabel();
    }
    if (elements.transitionTightnessOutput) {
      elements.transitionTightnessOutput.textContent = transitionTightnessLabel();
    }
    if (elements.terminalSmoothingOutput) {
      elements.terminalSmoothingOutput.textContent = terminalSmoothingLabel();
    }
    elements.speedOutput.textContent = speedMultiplierLabel();
    elements.zoomOutput.textContent = `${Math.round(viewState.zoom * 100)}%`;
    elements.lengthStat.textContent = `${basePairCount()} bp`;
    elements.originStat.textContent = state.origins.length;
    elements.forkStat.textContent = model.activeForkCount;
    elements.replicatedStat.textContent = `${replicated}%`;
    elements.progressControl.value = state.progress;
    elements.lengthControl.max = maximumLengthForBasePairCount(state);
    elements.deleteBreaksButton.disabled = state.cuts.length === 0;
    elements.deleteOriginsButton.disabled = state.origins.length === 0;
    elements.playButton.disabled = state.origins.length === 0;
    updateHistoryButtons();
  }

  function syncControls() {
    synchroniseSPhaseFromGeometry();
    const modelName = strandModel();
    const doubleStrandDetails = modelSupportsDoubleStrandDetails();
    const pairMode = basePairColorMode();
    if (elements.modelControl) elements.modelControl.value = modelName;
    if (elements.lengthModeControl) elements.lengthModeControl.value = lengthMode();
    elements.lengthControl.max = maximumLengthForBasePairCount(state);
    elements.lengthControl.value = state.length;
    elements.progressControl.value = state.progress;
    elements.progressControl.disabled = state.origins.length === 0;
    elements.pairResolutionControl.value = basePairResolution();
    elements.basePairWidthControl.value = state.basePairWidth;
    elements.weightControl.value = state.weight;
    if (elements.doubleStrandHeightControl) elements.doubleStrandHeightControl.value = state.doubleStrandHeight;
    elements.daughterSpacingControl.value = state.daughterSpacing;
    if (elements.newDnaStartDistanceControl) {
      elements.newDnaStartDistanceControl.value = newDnaStartDistance();
    }
    if (elements.strandPhaseShiftControl) {
      elements.strandPhaseShiftControl.value = strandPhaseShift();
    }
    if (elements.transitionTightnessControl) {
      elements.transitionTightnessControl.value = state.advanced.transitionTightness;
    }
    if (elements.terminalSmoothingControl) {
      elements.terminalSmoothingControl.value = terminalSmoothing();
    }
    elements.speedControl.value = speedMultiplier();
    elements.basePairColorModeControl.value = pairMode;
    elements.basePairTransitionControl.value = basePairTransitionMode();
    elements.templateAColor.value = state.colors.templateA;
    elements.templateBColor.value = state.colors.templateB;
    elements.newDnaColor.value = state.colors.newDna;
    elements.basePairColor.value = state.colors.basePair;
    elements.adenineColor.value = state.colors.adenine;
    elements.thymineColor.value = state.colors.thymine;
    elements.guanineColor.value = state.colors.guanine;
    elements.cytosineColor.value = state.colors.cytosine;
    elements.basePairSingleColorOption.hidden = pairMode !== "single";
    elements.baseIdentityColors.hidden = pairMode !== "bases";
    elements.pairsToggle.checked = state.layers.pairs;
    elements.newDnaToggle.checked = state.layers.newDna;
    elements.labelsToggle.checked = state.layers.labels;
    elements.crossoverGapsToggle.checked = state.advanced.crossoverGaps;
    elements.gridToggle.checked = state.advanced.grid;
    elements.alwaysShowControlsToggle.checked = state.advanced.alwaysShowControls;
    elements.snapToBasePairsToggle.checked = snapEditingEnabled();
    elements.includeExportBackgroundToggle.checked = state.advanced.includeExportBackground;
    elements.discreteAnimationToggle.checked = discreteAnimationEnabled();
    elements.aspectXControl.value = Math.round(aspectSliderValue("x"));
    elements.aspectYControl.value = Math.round(aspectSliderValue("y"));
    elements.backgroundColorControl.value = backgroundControlColor();
    elements.pairResolutionControl.disabled = !doubleStrandDetails;
    elements.basePairWidthControl.disabled = !doubleStrandDetails;
    if (elements.doubleStrandHeightControl) elements.doubleStrandHeightControl.disabled = !doubleStrandDetails;
    elements.pairsToggle.disabled = !doubleStrandDetails;
    elements.newDnaToggle.disabled = modelName === "minimal";
    elements.basePairColorModeControl.disabled = !doubleStrandDetails;
    elements.basePairTransitionControl.disabled = !doubleStrandDetails;
    elements.basePairColor.disabled = !doubleStrandDetails || pairMode !== "single";
    [elements.adenineColor, elements.thymineColor, elements.guanineColor, elements.cytosineColor].forEach(
      (control) => { control.disabled = !doubleStrandDetails || pairMode !== "bases"; }
    );
    elements.newDnaColor.disabled = modelName === "minimal";
    elements.crossoverGapsToggle.disabled = modelName !== "standard";
    elements.newDnaStartDistanceControl.disabled = modelName === "minimal";
    elements.strandPhaseShiftControl.disabled = modelName !== "standard";
    updatePlayButton();
    updateReadouts();
  }

  function setStatus(message) {
    elements.statusMessage.textContent = message;
  }

  function clearForkOffsets() {
    state.origins.forEach((origin) => {
      origin.leftOffset = 0;
      origin.rightOffset = 0;
    });
  }

  function pointFromEvent(event) {
    const point = elements.canvas.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const matrix = elements.canvas.getScreenCTM();
    return matrix ? point.matrixTransform(matrix.inverse()) : { x: 0, y: 0 };
  }

  function screenToWorld(point) {
    const transform = artworkTransformComponents();
    const aspectX = VIEW.width / 2 +
      (point.x - VIEW.width / 2 - viewState.panX) / Math.max(EPSILON, viewState.zoom);
    const aspectY = VIEW.centerY +
      (point.y - VIEW.centerY - viewState.panY) / Math.max(EPSILON, viewState.zoom);
    return {
      x: (aspectX - transform.translateX) / Math.max(EPSILON, transform.scaleX),
      y: (aspectY - transform.translateY) / Math.max(EPSILON, transform.scaleY),
    };
  }

  function hideContextAction() {
    const action = elements.canvas.querySelector("#rs-context-action");
    if (action) {
      action.setAttribute("visibility", "hidden");
      action.style.display = "none";
      action.removeAttribute("transform");
      const glyph = action.querySelector("#rs-context-glyph");
      if (glyph) glyph.replaceChildren();
    }
    delete elements.canvas.dataset.contextAction;
  }
  function canvasActionAtPoint(point, role = null, model = getReplicationModel()) {
    if (!point || ["origin", "fork", "cut", "delete-origin", "delete-cut"].includes(role)) return null;
    const halfHeight = interactionHalfHeight();
    if (
      point.x < VIEW.x0 ||
      point.x > VIEW.x1 ||
      point.y < 120 ||
      point.y > 500 ||
      Math.abs(point.y - VIEW.centerY) > halfHeight
    ) {
      return null;
    }
    return replicationAt(point.x, model).region ? "split" : "add";
  }

  function refreshContextAction() {
    const action = elements.canvas.querySelector("#rs-context-action");
    if (!hoverState || dragState) {
      elements.canvas.classList.remove("is-pan-ready");
      hideContextAction();
      return;
    }

    const point = screenToWorld(hoverState.point);
    const halfHeight = interactionHalfHeight();
    const withinChromosome = point.x >= VIEW.x0 && point.x <= VIEW.x1;
    const withinEditingBand =
      withinChromosome &&
      point.y >= 120 &&
      point.y <= 500 &&
      Math.abs(point.y - VIEW.centerY) <= halfHeight;
    const directControl = ["origin", "fork", "delete-origin", "delete-cut"].includes(hoverState.role);
    const unreplicateBlocked = ["fork", "delete-origin", "delete-cut"].includes(hoverState.role);
    const ordinaryAction = canvasActionAtPoint(point, hoverState.role);
    const unreplicateAvailable =
      modifierState.special &&
      withinEditingBand &&
      !unreplicateBlocked &&
      Boolean(replicationAt(point.x, getReplicationModel()).region);
    const actionName = unreplicateAvailable
      ? "unreplicate"
      : modifierState.special
        ? null
        : modifierState.shift && (withinEditingBand || hoverState.role === "cut")
          ? "cut"
          : ordinaryAction;
    const panReady =
      !modifierState.shift &&
      !modifierState.special &&
      !directControl &&
      !ordinaryAction;
    elements.canvas.classList.toggle("is-pan-ready", panReady);

    if (!action || !actionName) {
      hideContextAction();
      return;
    }

    // Clear the previous symbol before switching between contextual actions.
    // This prevents a stale plus or scissors glyph from surviving one pointer
    // frame while the replacement SVG fragment is installed.
    hideContextAction();

    const color = ["cut", "unreplicate"].includes(actionName) ? artworkColour("#b8384b") : canvasInkColor();
    const labels = {
      add: "Add origin",
      split: "Split bubble",
      cut: "Break region",
      unreplicate: "Unreplicate region",
    };
    const line = action.querySelector("line");
    const symbolGroup = action.querySelector("#rs-context-symbol");
    const ring = action.querySelector("#rs-context-ring");
    const glyph = action.querySelector("#rs-context-glyph");
    const symbolY = clamp(point.y, VIEW.centerY - halfHeight + 18, VIEW.centerY + halfHeight - 18);
    const guideBounds = toolGuideBounds();

    action.dataset.action = actionName;
    action.setAttribute("aria-label", labels[actionName]);
    action.setAttribute("transform", `translate(${fixed(point.x)} 0)`);
    line.setAttribute("y1", fixed(guideBounds.top));
    line.setAttribute("y2", fixed(guideBounds.bottom));
    line.setAttribute("stroke", color);
    symbolGroup.setAttribute("transform", fixedUiTransform(0, symbolY));
    ring.setAttribute("r", "16");
    ring.setAttribute("stroke-width", "1.8");
    ring.setAttribute("stroke", color);
    glyph.innerHTML = contextGlyphMarkup(actionName, color);
    elements.canvas.dataset.contextAction = actionName;
    action.style.display = "";
    action.setAttribute("visibility", "visible");
  }
  function rememberPointer(event) {
    const target = event.target.closest?.("[data-role]");
    hoverState = {
      point: pointFromEvent(event),
      role: target?.dataset.role || null,
    };
    modifierState.shift = event.shiftKey;
    modifierState.special = event.ctrlKey || event.metaKey;
    refreshContextAction();
  }

  function clearPointerHover() {
    hoverState = null;
    elements.canvas.classList.remove("is-pan-ready");
    hideContextAction();
  }

  function setZoom(zoom, focus = { x: VIEW.width / 2, y: VIEW.centerY }) {
    const nextZoom = clamp(zoom, MIN_ZOOM, MAX_ZOOM);
    const worldPoint = screenToWorld(focus);
    const aspectPoint = transformedArtworkPoint(worldPoint.x, worldPoint.y);
    viewState.panX =
      focus.x - VIEW.width / 2 - (aspectPoint.x - VIEW.width / 2) * nextZoom;
    viewState.panY =
      focus.y - VIEW.centerY - (aspectPoint.y - VIEW.centerY) * nextZoom;
    viewState.zoom = nextZoom;
    render();
  }

  function fittedViewState(sourceState = state) {
    if (lengthMode(sourceState) !== "extend") {
      return { zoom: 1, panX: 0, panY: 0 };
    }

    const genomeWidth = Math.max(EPSILON, moleculeWidthForState(sourceState));
    const zoom = clamp(BASE_MOLECULE_WIDTH / genomeWidth, MIN_ZOOM, MAX_ZOOM);
    const genomeCenterX = BASE_VIEW.x0 + genomeWidth / 2;
    return {
      zoom,
      panX: -zoom * (genomeCenterX - BASE_VIEW.width / 2),
      panY: 0,
    };
  }

  function resetView() {
    const aspectChanged =
      Math.abs(artworkAspectX() - 1) >= EPSILON || Math.abs(artworkAspectY() - 1) >= EPSILON;
    if (aspectChanged) pushSnapshot();
    state.advanced.aspectX = 1;
    state.advanced.aspectY = 1;
    syncViewGeometry(state);
    viewState = fittedViewState(state);
    syncControls();
    render();
    setStatus(lengthMode(state) === "extend" ? "Genome fitted to view" : "View and aspect reset");
  }

  function setArtworkAspectFromSlider(axis, sliderValue) {
    const key = aspectKey(axis);
    state.advanced[key] = aspectFactorFromSlider(axis, sliderValue);
    render();
    setStatus(axis === "y" ? "Vertical aspect adjusted" : "Horizontal aspect adjusted");
  }

  function resetArtworkAspect() {
    if (Math.abs(artworkAspectX() - 1) < EPSILON && Math.abs(artworkAspectY() - 1) < EPSILON) return;
    pushSnapshot();
    state.advanced.aspectX = 1;
    state.advanced.aspectY = 1;
    syncControls();
    render();
    setStatus("Aspect reset");
  }

  function normalisedX(x) {
    return clamp((x - VIEW.x0) / VIEW.moleculeWidth, 0, 1);
  }

  function forksShouldCollapse(side, desiredPosition, oppositePosition) {
    const screenDistance =
      Math.abs(desiredPosition - oppositePosition) * VIEW.moleculeWidth * viewState.zoom * artworkScaleX();
    const crossedPartner = side === "left" ? desiredPosition >= oppositePosition : desiredPosition <= oppositePosition;
    return crossedPartner || screenDistance <= FORK_COLLAPSE_PX;
  }

  function addOrRepairCut(x) {
    const position = cutInteractionFraction(normalisedX(x));
    const tolerance = 24 / VIEW.moleculeWidth;
    const existingIndex = state.cuts.findIndex((cut) => {
      const range = cutRange(cut);
      return position >= range.start - tolerance && position <= range.end + tolerance;
    });

    if (existingIndex >= 0) {
      pushSnapshot();
      state.cuts.splice(existingIndex, 1);
      setStatus("Break repaired");
    } else if (state.cuts.length < 10) {
      pushSnapshot();
      state.cuts = normaliseCutRegions([...state.cuts, { start: position, end: position }]);
      setStatus(`Break added at ${genomicPositionAtFraction(position)} bp`);
    } else {
      setStatus("Break limit reached");
    }
    render();
  }

  function commitCutRange(start, end, startSnapshot) {
    const range = cutInteractionRange(start, end);
    const nextCuts = normaliseCutRegions([...state.cuts, range]);
    if (nextCuts.length > 10) {
      setStatus("Break limit reached");
      render();
      return;
    }

    pushSnapshot(startSnapshot);
    state.cuts = nextCuts;
    const startBp = genomicPositionAtFraction(range.start);
    const endBp = genomicPositionAtFraction(range.end);
    setStatus(`Region removed from ${startBp}\u2013${endBp} bp`);
    render();
  }

  function unreplicateInteractionRange(start, end, sourceState = state) {
    let range = cutInteractionRange(start, end, sourceState);
    const pairStep = basePairStepFraction(sourceState);
    const minimumSpan = snapEditingEnabled(sourceState)
      ? splitBubbleGapSteps(sourceState) * pairStep
      : splitBubbleClearancePx(sourceState) / VIEW.moleculeWidth;
    if (range.end - range.start >= minimumSpan - EPSILON) return range;

    const targetCenter = (range.start + range.end) / 2;
    if (snapEditingEnabled(sourceState)) {
      const gapSteps = splitBubbleGapSteps(sourceState);
      const halfSpan = (gapSteps * pairStep) / 2;
      const center = splitCompatibleCenterFraction(targetCenter, gapSteps, sourceState, {
        min: halfSpan,
        max: 1 - halfSpan,
      });
      if (center !== null) {
        return { start: center - halfSpan, end: center + halfSpan };
      }
    }

    let startPosition = targetCenter - minimumSpan / 2;
    let endPosition = targetCenter + minimumSpan / 2;
    if (startPosition < 0) {
      endPosition -= startPosition;
      startPosition = 0;
    }
    if (endPosition > 1) {
      startPosition -= endPosition - 1;
      endPosition = 1;
    }
    return cutRange({ start: startPosition, end: endPosition });
  }

  function unreplicateRangePlan(start, end, sourceState = state) {
    const range = unreplicateInteractionRange(start, end, sourceState);
    const model = getReplicationModelAtTravel(sourceState.forkTravel, sourceState);
    const affectedRegions = model.regions.filter(
      (region) => Math.min(region.end, range.end) - Math.max(region.start, range.start) > EPSILON
    );
    const removedOriginIds = new Set();
    const remainingSegments = [];
    const removedFraction = affectedRegions.reduce(
      (total, region) =>
        total + Math.max(0, Math.min(region.end, range.end) - Math.max(region.start, range.start)),
      0
    );

    affectedRegions.forEach((region) => {
      region.originIds.forEach((originId) => removedOriginIds.add(originId));
      if (range.start > region.start + EPSILON) {
        remainingSegments.push({
          start: region.start,
          end: Math.min(region.end, range.start),
        });
      }
      if (range.end < region.end - EPSILON) {
        remainingSegments.push({
          start: Math.max(region.start, range.end),
          end: region.end,
        });
      }
    });

    return {
      range,
      affectedRegions,
      removedOriginIds: [...removedOriginIds],
      removedFraction,
      remainingSegments: remainingSegments.filter(
        (segment) => segment.end - segment.start > EPSILON
      ),
    };
  }

  function applyUnreplicateRange(start, end, sourceState = state) {
    const plan = unreplicateRangePlan(start, end, sourceState);
    if (!plan.affectedRegions.length) return { ...plan, changed: false, replacements: [] };

    const removedOriginIds = new Set(plan.removedOriginIds);
    sourceState.origins = sourceState.origins.filter(
      (origin) => !removedOriginIds.has(origin.id)
    );
    const replacements = plan.remainingSegments.map((segment) =>
      bubbleFromBounds(segment.start, segment.end, sourceState)
    );
    sourceState.origins.push(...replacements);
    sourceState.origins.sort((first, second) => first.startPosition - second.startPosition);
    sourceState.selectedOriginId = null;
    sourceState.selectedFork = null;
    if (!sourceState.origins.length) {
      sourceState.forkTravel = 0;
      sourceState.progress = 0;
    }
    synchroniseOriginPositions(sourceState);
    resetForkPlaybackClock(sourceState);
    synchroniseSPhaseFromGeometry(
      getReplicationModelAtTravel(sourceState.forkTravel, sourceState),
      sourceState
    );
    return { ...plan, changed: true, replacements };
  }

  function unreplicateRange(start, end, sourceState = state) {
    return applyUnreplicateRange(start, end, sourceState);
  }

  function commitUnreplicateRange(start, end, startSnapshot) {
    const plan = unreplicateRangePlan(start, end, state);
    if (!plan.affectedRegions.length) {
      render();
      setStatus("No replicated DNA lies within that region");
      return false;
    }

    pushSnapshot(startSnapshot);
    stopAnimation();
    const result = applyUnreplicateRange(start, end, state);
    syncControls();
    render();
    const startBp = genomicPositionAtFraction(result.range.start);
    const endBp = genomicPositionAtFraction(result.range.end);
    setStatus(`DNA returned to unreplicated from ${startBp}–${endBp} bp`);
    return true;
  }

  function addOrigin(x) {
    const position = interactionFraction(normalisedX(x));
    if (position === null) return;
    const nearby = state.origins.find((origin) => Math.abs(origin.position - position) * VIEW.moleculeWidth < 28);
    if (nearby) {
      state.selectedFork = null;
      state.selectedOriginId = nearby.id;
      render();
      setStatus("Origin selected");
      return;
    }
    if (getReplicationModel().regions.some((region) => position > region.start && position < region.end)) {
      setStatus("Use Split inside a replication bubble");
      return;
    }
    pushSnapshot();
    const initialOffset = -state.forkTravel;
    const origin = {
      id: nextAvailableOriginId(state),
      position,
      startPosition: position,
      leftOffset: initialOffset,
      rightOffset: initialOffset,
    };
    state.origins.push(origin);
    state.origins.sort((a, b) => a.startPosition - b.startPosition);
    state.selectedFork = null;
    state.selectedOriginId = origin.id;
    synchroniseOriginPositions();
    syncControls();
    render();
    setStatus(`Origin added at ${genomicPositionAtFraction(origin.position)} bp`);
  }

  function bubbleFromBounds(start, end, sourceState = state) {
    const lower = clamp(Math.min(start, end), 0, 1);
    const upper = clamp(Math.max(start, end), 0, 1);
    const midpoint = (lower + upper) / 2;
    const center = snapEditingEnabled(sourceState)
      ? snapFractionToBasePair(midpoint, sourceState, { min: lower, max: upper }) ?? midpoint
      : midpoint;
    return {
      id: nextAvailableOriginId(sourceState),
      position: center,
      startPosition: center,
      leftOffset: center - lower - sourceState.forkTravel,
      rightOffset: upper - center - sourceState.forkTravel,
    };
  }

  function rawBubbleBounds(origin, sourceState = state) {
    const leftTravel = Math.max(0, sourceState.forkTravel + origin.leftOffset);
    const rightTravel = Math.max(0, sourceState.forkTravel + origin.rightOffset);
    return {
      start: Math.max(0, origin.startPosition - leftTravel),
      end: Math.min(1, origin.startPosition + rightTravel),
    };
  }

  function overlappingBubbleCluster(
    originId,
    sourceState = state,
    contactTolerance = RAW_BUBBLE_MERGE_EPSILON
  ) {
    const overlapTolerance = Math.max(0, Number(contactTolerance) || 0);
    const intervals = sourceState.origins.map((origin) => ({
      id: origin.id,
      ...rawBubbleBounds(origin, sourceState),
    }));
    const seed = intervals.find((interval) => interval.id === originId);
    if (!seed) return null;

    const originIds = new Set([seed.id]);
    let start = seed.start;
    let end = seed.end;
    let expanded = true;
    while (expanded) {
      expanded = false;
      intervals.forEach((interval) => {
        if (originIds.has(interval.id)) return;
        const overlaps =
          interval.start <= end + overlapTolerance && interval.end >= start - overlapTolerance;
        if (!overlaps) return;
        originIds.add(interval.id);
        start = Math.min(start, interval.start);
        end = Math.max(end, interval.end);
        expanded = true;
      });
    }

    return { start, end, originIds: [...originIds] };
  }

  function mergeOverlappingBubbleState(
    originId,
    sourceState = state,
    contactTolerance = RAW_BUBBLE_MERGE_EPSILON
  ) {
    const cluster = overlappingBubbleCluster(originId, sourceState, contactTolerance);
    if (!cluster || cluster.originIds.length < 2) return null;

    const mergedIds = new Set(cluster.originIds);
    const merged = bubbleFromBounds(cluster.start, cluster.end, sourceState);
    sourceState.origins = sourceState.origins.filter((origin) => !mergedIds.has(origin.id));
    sourceState.origins.push(merged);
    sourceState.origins.sort((a, b) => a.startPosition - b.startPosition);
    sourceState.selectedFork = null;
    sourceState.selectedOriginId = merged.id;
    synchroniseOriginPositions(sourceState);
    return { merged, ...cluster };
  }

  function rebaseOriginDragAfterMerge(activeDrag, mergedOrigin, pointerPosition, sourceState = state) {
    if (activeDrag?.role !== "origin" || !mergedOrigin) return null;
    const bounds = rawBubbleBounds(mergedOrigin, sourceState);
    activeDrag.originId = mergedOrigin.id;
    activeDrag.startPointerPosition = pointerPosition;
    activeDrag.originStartPosition = mergedOrigin.startPosition;
    activeDrag.originLeftOffset = mergedOrigin.leftOffset;
    activeDrag.originRightOffset = mergedOrigin.rightOffset;
    activeDrag.minimumTranslation = -bounds.start;
    activeDrag.maximumTranslation = 1 - bounds.end;
    activeDrag.consumedOriginCount = (activeDrag.consumedOriginCount || 0) + 1;
    return bounds;
  }

  function mergeOverlappingBubbleDuringDrag(activeDrag, pointerPosition, sourceState = state) {
    // Whole-bubble drags are safe to rebase because both outer forks continue
    // with the same translation. A single-fork drag keeps its original release
    // behaviour so consuming a neighbour cannot unexpectedly change the handle
    // currently under the pointer.
    if (activeDrag?.role !== "origin" || !activeDrag.moved) return null;
    // The display model resolves fork contact at EPSILON. Consume within that
    // same sub-pixel tolerance during a live whole-bubble drag so there is no
    // frame where the renderer has joined forks but the raw state has not.
    const result = mergeOverlappingBubbleState(activeDrag.originId, sourceState, EPSILON);
    if (!result) return null;
    const bounds = rebaseOriginDragAfterMerge(activeDrag, result.merged, pointerPosition, sourceState);
    return { ...result, bounds };
  }

  function applyOriginDragPosition(activeDrag, pointerPosition, sourceState = state) {
    if (activeDrag?.role !== "origin") return null;
    const origin = sourceState.origins.find((item) => item.id === activeDrag.originId);
    if (!origin) return null;
    const desiredTranslation = pointerPosition - activeDrag.startPointerPosition;
    const continuousTranslation = clamp(
      desiredTranslation,
      activeDrag.minimumTranslation,
      activeDrag.maximumTranslation
    );
    const minimumPosition = activeDrag.originStartPosition + activeDrag.minimumTranslation;
    const maximumPosition = activeDrag.originStartPosition + activeDrag.maximumTranslation;
    const snappedPosition = snapEditingEnabled(sourceState)
      ? snapFractionToBasePair(activeDrag.originStartPosition + continuousTranslation, sourceState, {
          min: minimumPosition,
          max: maximumPosition,
        })
      : activeDrag.originStartPosition + continuousTranslation;
    if (snappedPosition === null) return null;
    const translation = snappedPosition - activeDrag.originStartPosition;
    origin.startPosition = clamp(snappedPosition, 0, 1);
    origin.position = origin.startPosition;
    origin.leftOffset = activeDrag.originLeftOffset;
    origin.rightOffset = activeDrag.originRightOffset;
    const consumed = mergeOverlappingBubbleDuringDrag(activeDrag, pointerPosition, sourceState);
    return {
      origin: consumed?.merged || origin,
      translation,
      consumed,
    };
  }

  function terminalClosureForFork(geometry, side) {
    if (!geometry || !["left", "right"].includes(side)) return null;
    const closesIntoLeftEnd =
      side === "right" && geometry.rightActive && !geometry.leftActive && geometry.leftReason === "end";
    if (closesIntoLeftEnd) return { replicatedBoundary: 0, completionBoundary: 0 };

    const closesIntoRightEnd =
      side === "left" && geometry.leftActive && !geometry.rightActive && geometry.rightReason === "end";
    if (closesIntoRightEnd) return { replicatedBoundary: 1, completionBoundary: 1 };
    return null;
  }

  function terminalClosureBoundaryForFork(geometry, side) {
    return terminalClosureForFork(geometry, side)?.completionBoundary ?? null;
  }

  function forkReachedChromosomeEnd(desiredPosition, completionBoundary) {
    const screenDistance =
      Math.abs(desiredPosition - completionBoundary) * VIEW.moleculeWidth * viewState.zoom * artworkScaleX();
    const crossedBoundary = completionBoundary <= EPSILON
      ? desiredPosition <= completionBoundary
      : desiredPosition >= completionBoundary;
    return crossedBoundary || screenDistance <= FORK_COLLAPSE_PX;
  }

  function applyForkDragPosition(activeDrag, pointerPosition, sourceState = state) {
    if (activeDrag?.role !== "fork" || !["left", "right"].includes(activeDrag.side)) return null;
    const origin = sourceState.origins.find((item) => item.id === activeDrag.originId);
    const replicationModel = getReplicationModelAtTravel(sourceState.forkTravel, sourceState);
    const geometry = replicationModel.origins.find((item) => item.id === activeDrag.originId);
    if (!origin || !geometry) return null;

    const desiredPosition = clamp(Number(pointerPosition) || 0, 0, 1);
    const globalTravel = sourceState.forkTravel;
    const detectedTerminalClosure = terminalClosureForFork(geometry, activeDrag.side);
    const completionBoundary = Number.isFinite(activeDrag.terminalClosureBoundary)
      ? activeDrag.terminalClosureBoundary
      : detectedTerminalClosure?.completionBoundary;
    const replicatedBoundary = Number.isFinite(activeDrag.terminalReplicatedBoundary)
      ? activeDrag.terminalReplicatedBoundary
      : detectedTerminalClosure?.replicatedBoundary;
    let movingPosition = desiredPosition;
    let collapsePending = false;

    if (activeDrag.mirroredForks && activeDrag.pairedForks) {
      const center = clamp(activeDrag.originStartPosition, 0, 1);
      const maximumHalfWidth = Math.min(center, 1 - center);
      const rawHalfWidth = activeDrag.side === "left"
        ? center - desiredPosition
        : desiredPosition - center;
      let halfWidth = clamp(rawHalfWidth, 0, maximumHalfWidth);

      if (snapEditingEnabled(sourceState) && halfWidth > EPSILON) {
        const sidePosition = activeDrag.side === "left" ? center - halfWidth : center + halfWidth;
        const snappedPosition = snapFractionToBasePair(sidePosition, sourceState, {
          min: activeDrag.side === "left" ? center - maximumHalfWidth : center,
          max: activeDrag.side === "left" ? center : center + maximumHalfWidth,
        });
        if (snappedPosition === null) return null;
        halfWidth = Math.abs(snappedPosition - center);
      }

      const forkGapPx =
        halfWidth * 2 * VIEW.moleculeWidth * viewState.zoom * artworkScaleX(sourceState);
      collapsePending = rawHalfWidth <= 0 || forkGapPx <= FORK_COLLAPSE_PX;
      if (collapsePending) halfWidth = 0;

      const leftPosition = center - halfWidth;
      const rightPosition = center + halfWidth;
      origin.startPosition = center;
      origin.position = center;
      origin.leftOffset = halfWidth - globalTravel;
      origin.rightOffset = halfWidth - globalTravel;
      movingPosition = activeDrag.side === "left" ? leftPosition : rightPosition;
    } else if (Number.isFinite(completionBoundary) && Number.isFinite(replicatedBoundary)) {
      collapsePending = forkReachedChromosomeEnd(desiredPosition, completionBoundary);
      movingPosition = collapsePending
        ? completionBoundary
        : snapEditingEnabled(sourceState)
          ? snapFractionToBasePair(desiredPosition, sourceState, { min: 0, max: 1 })
          : desiredPosition;
      if (movingPosition === null) return null;
      const leftPosition = activeDrag.side === "left" ? movingPosition : replicatedBoundary;
      const rightPosition = activeDrag.side === "right" ? movingPosition : replicatedBoundary;
      const center = (leftPosition + rightPosition) / 2;
      origin.startPosition = center;
      origin.position = center;
      origin.leftOffset = center - leftPosition - globalTravel;
      origin.rightOffset = rightPosition - center - globalTravel;
      activeDrag.terminalClosureBoundary = completionBoundary;
      activeDrag.terminalReplicatedBoundary = replicatedBoundary;
    } else if (activeDrag.pairedForks) {
      const oppositePosition = activeDrag.side === "left" ? activeDrag.rightPosition : activeDrag.leftPosition;
      collapsePending = forksShouldCollapse(activeDrag.side, desiredPosition, oppositePosition);
      if (collapsePending) {
        movingPosition = oppositePosition;
      } else {
        const minimum = activeDrag.side === "left" ? 0 : oppositePosition;
        const maximum = activeDrag.side === "left" ? oppositePosition : 1;
        movingPosition = snapEditingEnabled(sourceState)
          ? snapFractionToBasePair(desiredPosition, sourceState, { min: minimum, max: maximum })
          : clamp(desiredPosition, minimum, maximum);
        if (movingPosition === null) return null;
      }

      const leftPosition = activeDrag.side === "left" ? movingPosition : oppositePosition;
      const rightPosition = activeDrag.side === "right" ? movingPosition : oppositePosition;
      if (snapEditingEnabled(sourceState) && !collapsePending) {
        const snappedOrigin = snapFractionToBasePair(origin.startPosition, sourceState, {
          min: leftPosition,
          max: rightPosition,
        });
        if (snappedOrigin === null) return null;
        origin.startPosition = snappedOrigin;
        origin.position = snappedOrigin;
        origin.leftOffset = snappedOrigin - leftPosition - globalTravel;
        origin.rightOffset = rightPosition - snappedOrigin - globalTravel;
      } else {
        const center = (leftPosition + rightPosition) / 2;
        const halfWidth = (rightPosition - leftPosition) / 2;
        origin.startPosition = center;
        origin.position = center;
        origin.leftOffset = halfWidth - globalTravel;
        origin.rightOffset = halfWidth - globalTravel;
      }
    } else if (activeDrag.side === "left" && geometry.leftActive) {
      movingPosition = snapEditingEnabled(sourceState)
        ? snapFractionToBasePair(desiredPosition, sourceState, { min: 0, max: geometry.startPosition })
        : clamp(desiredPosition, 0, geometry.startPosition);
      if (movingPosition === null) return null;
      origin.leftOffset = geometry.startPosition - movingPosition - globalTravel;
    } else if (activeDrag.side === "right" && geometry.rightActive) {
      movingPosition = snapEditingEnabled(sourceState)
        ? snapFractionToBasePair(desiredPosition, sourceState, { min: geometry.startPosition, max: 1 })
        : clamp(desiredPosition, geometry.startPosition, 1);
      if (movingPosition === null) return null;
      origin.rightOffset = movingPosition - geometry.startPosition - globalTravel;
    } else {
      return null;
    }

    activeDrag.collapsePending = collapsePending;
    sourceState.selectedOriginId = null;
    sourceState.selectedFork = { originId: origin.id, side: activeDrag.side };
    synchroniseOriginPositions(sourceState);
    return {
      origin,
      geometry,
      movingPosition,
      collapsePending,
      mirrored: Boolean(activeDrag.mirroredForks && activeDrag.pairedForks),
      terminalClosure: Number.isFinite(completionBoundary) && Number.isFinite(replicatedBoundary),
    };
  }

  function mergeTouchingBubbles(originId) {
    const result = mergeOverlappingBubbleState(originId);
    if (!result) return false;
    syncControls();
    return true;
  }

  function splitBubbleClearancePx(sourceState = state) {
    const configuredWeight = Number(sourceState?.weight);
    const strandWeight = Number.isFinite(configuredWeight)
      ? boundedControlValue("weight", configuredWeight, DEFAULTS.weight)
      : DEFAULTS.weight;
    const strokeClearance = Math.max(12, strandWeight * 2 + 4);
    const smoothingClearance = 2 * terminalPullSpan(0.5, "right", sourceState);
    return Math.max(strokeClearance, smoothingClearance);
  }

  function splitBubbleGapSteps(sourceState = state) {
    const pairSpacingPx = basePairStepFraction(sourceState) * VIEW.moleculeWidth;
    return Math.max(1, Math.ceil(splitBubbleClearancePx(sourceState) / pairSpacingPx - 1e-10));
  }

  function splitCompatibleCenterFraction(
    fraction,
    gapSteps,
    sourceState = state,
    { min = 0, max = 1 } = {}
  ) {
    const lattice = basePairLattice(sourceState);
    const phase = gapSteps % 2 === 0 ? 0 : 0.5;
    const lowerFraction = clamp(Math.min(Number(min) || 0, Number(max) || 0), 0, 1);
    const upperFraction = clamp(Math.max(Number(min) || 0, Number(max) || 0), 0, 1);
    const lowerCoordinate = lowerFraction * lattice.subdivisionCount - lattice.edgeOffset;
    const upperCoordinate = upperFraction * lattice.subdivisionCount - lattice.edgeOffset;
    const firstCoordinate = Math.ceil(lowerCoordinate - phase - 1e-10) + phase;
    const lastCoordinate = Math.floor(upperCoordinate - phase + 1e-10) + phase;
    if (firstCoordinate > lastCoordinate) return null;

    const targetCoordinate =
      clamp(Number(fraction) || 0, 0, 1) * lattice.subdivisionCount - lattice.edgeOffset;
    const snappedCoordinate = clamp(
      Math.round(targetCoordinate - phase) + phase,
      firstCoordinate,
      lastCoordinate
    );
    return (lattice.edgeOffset + snappedCoordinate) / lattice.subdivisionCount;
  }

  function splitBubbleDimensions(region, sourceState = state) {
    const regionWidth = Math.max(0, Number(region?.end) - Number(region?.start));
    const pairStep = basePairStepFraction(sourceState);
    const targetGapPx = splitBubbleClearancePx(sourceState);
    const targetGap = targetGapPx / VIEW.moleculeWidth;
    const gapSteps = splitBubbleGapSteps(sourceState);
    // In continuous editing, preserve the exact visual clearance required by
    // the fork smoothing. With snapping enabled, round that clearance outward
    // to the nearest whole lattice interval so both new fork endpoints remain
    // valid discrete sites and never receive less room than the smooth merge.
    const gap = snapEditingEnabled(sourceState) ? gapSteps * pairStep : targetGap;
    const minimumWidth = Math.max(pairStep * 2, gap / 2);
    return {
      gap,
      gapSteps,
      targetGap,
      targetGapPx,
      minimumWidth,
      requiredWidth: minimumWidth * 2 + gap,
      regionWidth,
    };
  }

  function splitBubble(x) {
    const position = normalisedX(x);
    const model = getReplicationModel();
    const region = model.regions.find((item) => position >= item.start && position <= item.end);
    if (!region) {
      setStatus("Choose a wider replication bubble");
      return;
    }
    const { gap, gapSteps, minimumWidth, requiredWidth } = splitBubbleDimensions(region);
    if (region.end - region.start < requiredWidth - EPSILON) {
      setStatus("Choose a wider replication bubble");
      return;
    }
    const minimumSplit = region.start + minimumWidth + gap / 2;
    const maximumSplit = region.end - minimumWidth - gap / 2;
    const continuousSplit = clamp(position, minimumSplit, maximumSplit);
    const split = snapEditingEnabled()
      ? splitCompatibleCenterFraction(continuousSplit, gapSteps, state, {
          min: minimumSplit,
          max: maximumSplit,
        })
      : continuousSplit;
    if (split === null) {
      setStatus("Choose a wider replication bubble");
      return;
    }
    const leftEnd = split - gap / 2;
    const rightStart = split + gap / 2;
    const left = bubbleFromBounds(region.start, leftEnd);
    const right = bubbleFromBounds(rightStart, region.end);
    const replacedIds = new Set(region.originIds);
    pushSnapshot();
    state.origins = state.origins.filter((origin) => !replacedIds.has(origin.id));
    state.origins.push(left, right);
    state.origins.sort((a, b) => a.startPosition - b.startPosition);
    state.selectedFork = null;
    state.selectedOriginId = position <= split ? left.id : right.id;
    synchroniseOriginPositions();
    syncControls();
    render();
    setStatus("Replication bubble split");
  }

  function deleteOriginById(originId) {
    const index = state.origins.findIndex((origin) => origin.id === originId);
    if (index < 0) return;
    pushSnapshot();
    state.origins.splice(index, 1);
    if (state.selectedOriginId === originId) state.selectedOriginId = null;
    if (state.selectedFork?.originId === originId) state.selectedFork = null;
    synchroniseOriginPositions();
    syncControls();
    render();
    setStatus("Origin deleted");
  }

  function deleteSelectedOrigin() {
    if (!state.selectedOriginId) return;
    deleteOriginById(state.selectedOriginId);
  }

  function deleteAllOrigins() {
    if (!state.origins.length) return;
    pushSnapshot();
    stopAnimation();
    state.origins = [];
    state.selectedOriginId = null;
    state.selectedFork = null;
    state.forkTravel = 0;
    state.progress = 0;
    resetForkPlaybackClock();
    syncControls();
    render();
    setStatus("All origins deleted");
  }

  function deleteCutByIndex(index) {
    const cutIndex = Number(index);
    if (!Number.isInteger(cutIndex) || cutIndex < 0 || cutIndex >= state.cuts.length) return;
    pushSnapshot();
    state.cuts.splice(cutIndex, 1);
    render();
    setStatus("Break deleted");
  }

  function deleteAllBreaks() {
    if (!state.cuts.length) return;
    pushSnapshot();
    state.cuts = [];
    render();
    setStatus("All breaks deleted");
  }

  function beginPan(event, screenPoint) {
    dragState = {
      pointerId: event.pointerId,
      role: "pan",
      startX: screenPoint.x,
      startY: screenPoint.y,
      startPanX: viewState.panX,
      startPanY: viewState.panY,
      moved: false,
    };
    hideContextAction();
    elements.canvas.setPointerCapture(event.pointerId);
    elements.canvas.classList.add("is-panning");
    event.preventDefault();
  }

  function beginCanvasGesture(event, screenPoint, worldPoint, action = "deselect") {
    dragState = {
      pointerId: event.pointerId,
      role: "canvas-gesture",
      startX: screenPoint.x,
      startY: screenPoint.y,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startPanX: viewState.panX,
      startPanY: viewState.panY,
      action,
      actionX: worldPoint.x,
      moved: false,
    };
    hideContextAction();
    elements.canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function performCanvasClick(action, x) {
    if (action === "split") {
      splitBubble(x);
      return;
    }
    if (action === "add") {
      addOrigin(x);
      return;
    }
    state.selectedOriginId = null;
    state.selectedFork = null;
    render();
  }

  function beginCutRange(event, x) {
    const position = cutInteractionFraction(normalisedX(x));
    dragState = {
      pointerId: event.pointerId,
      role: "cut-range",
      anchor: position,
      current: position,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startSnapshot: snapshot(),
      moved: false,
    };
    hideContextAction();
    elements.canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function beginUnreplicateRange(event, x) {
    const position = cutInteractionFraction(normalisedX(x));
    stopAnimation();
    dragState = {
      pointerId: event.pointerId,
      role: "unreplicate-range",
      anchor: position,
      current: position,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startSnapshot: snapshot(),
      moved: false,
    };
    hideContextAction();
    elements.canvas.setPointerCapture(event.pointerId);
    elements.canvas.classList.add("is-unreplicating");
    event.preventDefault();
  }

  function handleCanvasControlKeydown(event) {
    if (!['Enter', ' '].includes(event.key)) return;
    const target = event.target.closest?.("[data-role]");
    const role = target?.dataset.role;
    if (role === "delete-origin") {
      event.preventDefault();
      deleteOriginById(target.dataset.originId);
    } else if (role === "delete-cut") {
      event.preventDefault();
      deleteCutByIndex(Number(target.dataset.cutIndex));
    }
  }

  function handlePointerDown(event) {
    const screenPoint = pointFromEvent(event);
    const target = event.target.closest("[data-role]");
    const role = target?.dataset.role || null;
    if (event.button === 0 || event.pointerType === "touch") {
      if (role === "delete-origin") {
        deleteOriginById(target.dataset.originId);
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (role === "delete-cut") {
        deleteCutByIndex(Number(target.dataset.cutIndex));
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    }
    if (event.button === 1) {
      beginPan(event, screenPoint);
      return;
    }
    if (event.button !== 0 && event.pointerType !== "touch") return;

    const point = screenToWorld(screenPoint);
    const halfHeight = interactionHalfHeight();
    const specialControl = event.ctrlKey || event.metaKey;

    if (specialControl && role !== "fork") {
      const unreplicateAvailable =
        point.x >= VIEW.x0 &&
        point.x <= VIEW.x1 &&
        Math.abs(point.y - VIEW.centerY) <= halfHeight &&
        Boolean(replicationAt(point.x, getReplicationModel()).region);
      if (!unreplicateAvailable) {
        setStatus("Start on replicated DNA to unreplicate a region");
        return;
      }
      beginUnreplicateRange(event, point.x);
      return;
    }

    if (event.shiftKey) {
      const breakAvailable =
        point.x >= VIEW.x0 &&
        point.x <= VIEW.x1 &&
        Math.abs(point.y - VIEW.centerY) <= halfHeight;
      if (role !== "cut" && !breakAvailable) return;
      beginCutRange(event, point.x);
      return;
    }

    if (role === "cut") {
      setStatus("Use the red delete control to remove this break");
      return;
    }

    if (role !== "origin" && role !== "fork") {
      // A click keeps the molecular edit implied by the cursor, while a drag
      // pans the preview. Direct origin/fork controls are handled below and
      // therefore always take precedence over default panning.
      const action = canvasActionAtPoint(point, role) || "deselect";
      beginCanvasGesture(event, screenPoint, point, action);
      return;
    }

    const originId = target.dataset.originId;
    const origin = state.origins.find((item) => item.id === originId);
    const model = getReplicationModel();
    const geometry = model.origins.find((item) => item.id === originId);
    if (!origin || !geometry) return;

    if (role === "fork") {
      state.selectedOriginId = null;
      state.selectedFork = { originId, side: target.dataset.side };
    } else {
      state.selectedFork = null;
      state.selectedOriginId = originId;
    }
    dragState = {
      pointerId: event.pointerId,
      role,
      side: target.dataset.side || null,
      originId,
      startX: point.x,
      startPointerPosition: normalisedX(point.x),
      originStartPosition: origin.startPosition,
      originLeftOffset: origin.leftOffset,
      originRightOffset: origin.rightOffset,
      leftPosition: geometry.leftPosition,
      rightPosition: geometry.rightPosition,
      pairedForks: geometry.leftActive && geometry.rightActive,
      mirroredForks: role === "fork" && specialControl && geometry.leftActive && geometry.rightActive,
      terminalClosureBoundary: role === "fork"
        ? terminalClosureForFork(geometry, target.dataset.side)?.completionBoundary ?? null
        : null,
      terminalReplicatedBoundary: role === "fork"
        ? terminalClosureForFork(geometry, target.dataset.side)?.replicatedBoundary ?? null
        : null,
      collapsePending: false,
      minimumTranslation: -geometry.leftPosition,
      maximumTranslation: 1 - geometry.rightPosition,
      startSnapshot: snapshot(),
      moved: false,
    };
    elements.canvas.setPointerCapture(event.pointerId);
    render();
    event.preventDefault();
  }

  function handlePointerMove(event) {
    if (!dragState) {
      rememberPointer(event);
      return;
    }
    if (dragState.pointerId !== event.pointerId) return;
    const screenPoint = pointFromEvent(event);
    if (dragState.role === "canvas-gesture") {
      const distance = Math.hypot(
        event.clientX - dragState.startClientX,
        event.clientY - dragState.startClientY
      );
      if (distance < PAN_DRAG_THRESHOLD_PX) return;
      dragState.role = "pan";
      dragState.moved = true;
      elements.canvas.classList.add("is-panning");
      hideContextAction();
    }
    if (dragState.role === "cut-range") {
      const point = screenToWorld(screenPoint);
      dragState.current = cutInteractionFraction(normalisedX(point.x));
      const distance = Math.hypot(event.clientX - dragState.startClientX, event.clientY - dragState.startClientY);
      if (!dragState.moved && distance >= CUT_DRAG_THRESHOLD_PX) {
        dragState.moved = true;
        elements.canvas.classList.add("is-cutting");
      }
      if (dragState.moved) render();
      event.preventDefault();
      return;
    }
    if (dragState.role === "unreplicate-range") {
      const point = screenToWorld(screenPoint);
      dragState.current = cutInteractionFraction(normalisedX(point.x));
      const distance = Math.hypot(
        event.clientX - dragState.startClientX,
        event.clientY - dragState.startClientY
      );
      if (!dragState.moved && distance >= CUT_DRAG_THRESHOLD_PX) {
        dragState.moved = true;
      }
      if (dragState.moved) render();
      event.preventDefault();
      return;
    }
    if (dragState.role === "pan") {
      viewState.panX = dragState.startPanX + screenPoint.x - dragState.startX;
      viewState.panY = dragState.startPanY + screenPoint.y - dragState.startY;
      dragState.moved = true;
      render();
      event.preventDefault();
      return;
    }

    const point = screenToWorld(screenPoint);
    if (!dragState.moved && Math.abs(point.x - dragState.startX) < 2) return;

    if (!dragState.moved) {
      pushSnapshot(dragState.startSnapshot);
      dragState.moved = true;
      elements.canvas.classList.add("is-dragging");
      stopAnimation();
    }

    const origin = state.origins.find((item) => item.id === dragState.originId);
    const geometry = getReplicationModel().origins.find((item) => item.id === dragState.originId);
    if (!origin || !geometry) return;

    if (dragState.role === "origin") {
      state.selectedFork = null;
      state.selectedOriginId = dragState.originId;
      const dragResult = applyOriginDragPosition(dragState, normalisedX(point.x));
      if (!dragResult) return;
      setStatus(
        dragResult.consumed
          ? "Overlapping origin and its forks were consumed"
          : `Replication bubble moved to ${genomicPositionAtFraction(dragResult.origin.position)} bp`
      );
    } else {
      state.selectedOriginId = null;
      state.selectedFork = { originId: dragState.originId, side: dragState.side };
      const dragResult = applyForkDragPosition(dragState, normalisedX(point.x));
      if (!dragResult) return;
      setStatus(
        dragState.mirroredForks
          ? "Both forks adjusted symmetrically"
          : `${dragState.side === "left" ? "Left" : "Right"} fork adjusted`
      );
    }

    render();
    event.preventDefault();
  }

  function shouldMergeCompletedBubbleDrag(completedDrag, eventType) {
    return (
      eventType !== "pointercancel" &&
      completedDrag.moved &&
      (completedDrag.role === "fork" || completedDrag.role === "origin")
    );
  }

  function endPointerDrag(event) {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    const completedDrag = dragState;
    if (elements.canvas.hasPointerCapture(event.pointerId)) elements.canvas.releasePointerCapture(event.pointerId);
    elements.canvas.classList.remove("is-dragging");
    elements.canvas.classList.remove("is-panning");
    elements.canvas.classList.remove("is-cutting");
    elements.canvas.classList.remove("is-unreplicating");
    dragState = null;

    if (completedDrag.role === "cut-range") {
      if (event.type === "pointercancel") {
        render();
        clearPointerHover();
      } else if (completedDrag.moved) {
        commitCutRange(completedDrag.anchor, completedDrag.current, completedDrag.startSnapshot);
        rememberPointer(event);
      } else {
        addOrRepairCut(VIEW.x0 + completedDrag.current * VIEW.moleculeWidth);
        rememberPointer(event);
      }
      return;
    }

    if (completedDrag.role === "unreplicate-range") {
      if (event.type === "pointercancel") {
        render();
        clearPointerHover();
      } else if (completedDrag.moved) {
        commitUnreplicateRange(
          completedDrag.anchor,
          completedDrag.current,
          completedDrag.startSnapshot
        );
        rememberPointer(event);
      } else {
        render();
        setStatus("Drag across replicated DNA to unreplicate a region");
        rememberPointer(event);
      }
      return;
    }

    if (completedDrag.role === "canvas-gesture") {
      if (event.type === "pointercancel") clearPointerHover();
      else {
        performCanvasClick(completedDrag.action, completedDrag.actionX);
        rememberPointer(event);
      }
      return;
    }

    if (completedDrag.role === "pan") {
      if (event.type === "pointercancel") clearPointerHover();
      else {
        if (completedDrag.moved) setStatus("View moved");
        rememberPointer(event);
      }
      return;
    }

    let collapsed = false;
    if (event.type !== "pointercancel" && completedDrag.moved && completedDrag.role === "fork" && completedDrag.collapsePending) {
      const index = state.origins.findIndex((origin) => origin.id === completedDrag.originId);
      if (index >= 0) {
        state.origins.splice(index, 1);
        state.selectedOriginId = null;
        state.selectedFork = null;
        collapsed = true;
        syncControls();
      }
    }
    const merged =
      !collapsed &&
      shouldMergeCompletedBubbleDrag(completedDrag, event.type) &&
      mergeTouchingBubbles(completedDrag.originId);
    render();
    if (collapsed) {
      setStatus(
        Number.isFinite(completedDrag.terminalClosureBoundary)
          ? "The opposing fork reached the chromosome end and the terminal bubble was removed"
          : "Overlapping forks snapped together and the bubble was removed"
      );
    }
    if (merged) {
      setStatus(
        completedDrag.role === "origin"
          ? "Overlapping bubble and its forks were consumed"
          : "Touching forks merged into one bubble"
      );
    } else if (completedDrag.role === "origin" && completedDrag.consumedOriginCount) {
      setStatus("Overlapping origin and its forks were consumed");
    }
    if (event.type === "pointercancel") clearPointerHover();
    else rememberPointer(event);
  }

  function handleWheel(event) {
    event.preventDefault();
    const focus = pointFromEvent(event);
    const factor = Math.exp(-event.deltaY * 0.0015);
    setZoom(viewState.zoom * factor, focus);
  }

  function updatePlayButton() {
    elements.playButton.setAttribute("aria-pressed", String(state.playing));
    elements.playIcon.innerHTML = state.playing ? "&#10074;&#10074;" : "&#9654;";
    elements.playLabel.textContent = state.playing ? "Pause" : "Run";
  }

  function stopAnimation() {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    previousAnimationTime = 0;
    resetForkPlaybackClock();
    if (state) state.playing = false;
    if (elements.playButton) updatePlayButton();
  }

  function playbackComplete(sourceState = state) {
    const bounds = forkTravelBounds(sourceState);
    return sourceState.forkTravel >= bounds.full - Number.EPSILON;
  }

  function animateForks(time) {
    if (!state.playing) return;
    if (!previousAnimationTime) previousAnimationTime = time;
    const elapsed = Math.min(64, time - previousAnimationTime);
    previousAnimationTime = time;
    advanceForkPlayback(elapsed);
    const model = render();

    if (playbackComplete()) {
      stopAnimation();
      setStatus("All active forks have merged or reached an end");
      return;
    }
    animationFrame = requestAnimationFrame(animateForks);
  }

  function toggleAnimation() {
    if (state.playing) {
      stopAnimation();
      setStatus("Forks paused");
      return;
    }
    if (!state.origins.length) return;

    pushSnapshot();
    if (playbackComplete()) {
      clearForkOffsets();
      state.forkTravel = 0;
      state.progress = 0;
      synchroniseOriginPositions();
    }
    state.playing = true;
    updatePlayButton();
    setStatus("Forks running");
    animationFrame = requestAnimationFrame(animateForks);
  }

  function isPlaybackSpaceShortcut(event) {
    if (!event || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return false;
    if (event.code !== "Space" && event.key !== " ") return false;
    const target = event.target || document.activeElement;
    if (target?.isContentEditable) return false;
    return !["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(target?.tagName);
  }

  function cleanSvgElement() {
    const namespace = "http://www.w3.org/2000/svg";
    const artwork = elements.canvas.querySelector("#rs-export-artwork");
    const measured = artwork?.getBBox();
    const halfHeight = doubleStrandHalfHeight();
    const fallback = {
      x: VIEW.x0,
      y: VIEW.centerY - halfHeight,
      width: VIEW.moleculeWidth,
      height: halfHeight * 2,
    };
    const bounds = measured && measured.width > 0 && measured.height > 0 ? measured : fallback;
    const x = bounds.x - EXPORT_PADDING;
    const y = bounds.y - EXPORT_PADDING;
    const width = Math.max(1, bounds.width + EXPORT_PADDING * 2);
    const height = Math.max(1, bounds.height + EXPORT_PADDING * 2);
    const svg = document.createElementNS(namespace, "svg");
    const title = document.createElementNS(namespace, "title");
    title.textContent = "DNA replication diagram created with RepliSketch";
    svg.setAttribute("xmlns", namespace);
    svg.setAttribute("viewBox", `${fixed(x)} ${fixed(y)} ${fixed(width)} ${fixed(height)}`);
    svg.setAttribute("width", fixed(width));
    svg.setAttribute("height", fixed(height));
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.append(title);
    if (state.advanced.includeExportBackground) {
      const background = document.createElementNS(namespace, "rect");
      background.setAttribute("x", fixed(x));
      background.setAttribute("y", fixed(y));
      background.setAttribute("width", fixed(width));
      background.setAttribute("height", fixed(height));
      background.setAttribute("fill", canvasBackgroundColor());
      background.setAttribute("data-export-background", "true");
      svg.append(background);
    }
    const clonedArtwork = artwork.cloneNode(true);
    normaliseExportStrokeWidths(clonedArtwork);
    svg.append(clonedArtwork);
    svg.querySelector("#rs-export-artwork")?.removeAttribute("id");
    return { element: svg, width, height };
  }

  function svgSource() {
    const exported = cleanSvgElement();
    return {
      ...exported,
      source: `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(exported.element)}`,
    };
  }

  function previewSvg() {
    const exported = svgSource();
    const url = URL.createObjectURL(new Blob([exported.source], { type: "image/svg+xml;charset=utf-8" }));
    const previewWindow = typeof window.open === "function" ? window.open(url, "_blank") : null;
    if (!previewWindow) {
      URL.revokeObjectURL(url);
      setStatus("SVG preview was blocked by the browser");
      return false;
    }
    try {
      previewWindow.opener = null;
    } catch {
      // The preview itself is already open; opener isolation is best-effort.
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    setStatus("SVG preview opened in a new tab");
    return true;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  function exportFilename(extension) {
    return `replisketch-${basePairCount()}bp-${state.origins.length}-origins.${extension}`;
  }

  function saveConfiguration() {
    const source = `${JSON.stringify(configurationDocument(), null, 2)}\n`;
    downloadBlob(
      new Blob([source], { type: "application/json;charset=utf-8" }),
      exportFilename("replisketch.json")
    );
    setStatus("Configuration saved");
  }

  function applyConfigurationState(candidate) {
    const previousState = state;
    const previousSnapshot = snapshot();
    stopAnimation();
    pendingControlSnapshot = null;
    dragState = null;
    state = candidate;
    state.playing = false;

    try {
      reseedNextOriginId(state);
      syncControls();
      render();
    } catch (error) {
      state = previousState;
      syncControls();
      render();
      throw error;
    }

    pushBounded(history, previousSnapshot);
    redoHistory.length = 0;
    updateHistoryButtons();
  }

  async function loadConfigurationFile(file) {
    if (!file) return false;
    try {
      if (!Number.isFinite(file.size) || file.size > MAX_CONFIG_FILE_BYTES) {
        throw invalidConfiguration("file is too large");
      }
      const candidate = parseConfigurationText(await file.text());
      applyConfigurationState(candidate);
      setStatus("Configuration loaded");
      return true;
    } catch (error) {
      const reason = error instanceof Error ? error.message : "invalid or damaged file";
      setStatus(`Could not load configuration: ${reason}`);
      return false;
    }
  }

  function exportSvg() {
    const exported = svgSource();
    downloadBlob(new Blob([exported.source], { type: "image/svg+xml;charset=utf-8" }), exportFilename("svg"));
    setStatus("SVG exported");
  }

  async function exportPng() {
    const exported = svgSource();
    const url = URL.createObjectURL(new Blob([exported.source], { type: "image/svg+xml;charset=utf-8" }));
    const image = new Image();
    try {
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(exported.width * 2);
      canvas.height = Math.ceil(exported.height * 2);
      const context = canvas.getContext("2d", { alpha: true });
      if (!context) throw new Error("Canvas rendering is unavailable");
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("PNG encoding failed");
      downloadBlob(blob, exportFilename("png"));
      setStatus("PNG exported at 2x resolution");
    } catch {
      setStatus("PNG export failed");
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function exportPdf() {
    const exported = cleanSvgElement();
    const frame = document.createElement("iframe");
    const pageWidth = Math.ceil(exported.width);
    const pageHeight = Math.ceil(exported.height);
    frame.className = "rs-print-frame";
    frame.title = "RepliSketch PDF export";
    document.body.appendChild(frame);

    const documentForPrint = frame.contentDocument;
    documentForPrint.open();
    documentForPrint.write(
      `<!doctype html><html><head><title>${exportFilename(
        "pdf"
      )}</title><style>@page{size:${pageWidth}px ${pageHeight}px;margin:0}html,body{width:${pageWidth}px;height:${pageHeight}px;margin:0;overflow:hidden;background:transparent}svg{display:block;width:100%;height:100%;background:transparent}</style></head><body>${new XMLSerializer().serializeToString(
        exported.element
      )}</body></html>`
    );
    documentForPrint.close();

    const cleanup = () => frame.remove();
    frame.contentWindow.addEventListener("afterprint", cleanup, { once: true });
    setTimeout(() => {
      frame.contentWindow.focus();
      frame.contentWindow.print();
      setTimeout(cleanup, 60000);
    }, 120);
    setStatus("PDF print dialog opened");
  }

  function supportedMp4MimeType() {
    if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") return "";
    return nativeMp4MimeTypes()[0] || "";
  }

  function nativeMp4MimeTypes() {
    if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") return [];
    return ["video/mp4", "video/mp4;codecs=avc1", "video/mp4;codecs=avc1.42E01E"].filter((type) =>
      MediaRecorder.isTypeSupported(type)
    );
  }

  function nativeWebmMimeTypes() {
    if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") return [];
    return ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].filter((type) =>
      MediaRecorder.isTypeSupported(type)
    );
  }

  function makeVideoExportState() {
    const exportState = JSON.parse(snapshot());
    exportState.playing = false;
    exportState.origins.forEach((origin) => {
      origin.position = origin.startPosition;
    });
    // Fork offsets are the model's firing schedule: their differences encode
    // delayed origins and asymmetric manual fork adjustments. Rebase only the
    // shared travel clock to the first firing event so the export begins at 0%
    // without erasing that schedule.
    exportState.forkTravel = forkTravelBounds(exportState).zero;
    synchroniseSPhaseFromGeometry(
      getReplicationModelAtTravel(exportState.forkTravel, exportState),
      exportState
    );
    return exportState;
  }

  function withVideoRenderState(videoState, callback) {
    const liveState = state;
    const liveDragState = dragState;
    state = videoState;
    dragState = null;
    syncViewGeometry(videoState);
    try {
      return callback();
    } finally {
      state = liveState;
      dragState = liveDragState;
      syncViewGeometry(liveState);
    }
  }

  function fixedVideoSvgSource(videoState, forkTravel) {
    return withVideoRenderState(videoState, () => {
      const model = getReplicationModelAtTravel(forkTravel, videoState);
      const maxStroke = Math.max(videoState.weight, videoState.basePairWidth);
      const contentHalfExtent = Math.max(
        80,
        videoState.daughterSpacing / 2 + doubleStrandHalfHeight(videoState) + maxStroke
      );
      const transform = artworkTransformComponents(videoState);
      const transformedLeft = transform.scaleX * VIEW.x0 + transform.translateX;
      const transformedRight = transform.scaleX * VIEW.x1 + transform.translateX;
      const transformedTop =
        transform.scaleY * (VIEW.centerY - contentHalfExtent) + transform.translateY;
      const transformedBottom =
        transform.scaleY * (VIEW.centerY + contentHalfExtent) + transform.translateY;
      const x = Math.min(transformedLeft, transformedRight) - EXPORT_PADDING;
      const y = Math.min(transformedTop, transformedBottom) - EXPORT_PADDING;
      const width = Math.abs(transformedRight - transformedLeft) + EXPORT_PADDING * 2;
      const height = Math.abs(transformedBottom - transformedTop) + EXPORT_PADDING * 2;
      const videoArtwork = withArtworkStrokeScale(1, () => artworkMarkup(model));
      const source = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${fixed(x)} ${fixed(y)} ${fixed(width)} ${fixed(height)}" width="${fixed(
        width
      )}" height="${fixed(height)}" preserveAspectRatio="xMidYMid meet">
  <title>Animated DNA replication diagram created with RepliSketch</title>
  <g aria-label="DNA molecule" transform="${artworkAspectTransform(videoState)}">${videoArtwork}</g>
</svg>`;
      return { source, width, height, model };
    });
  }

  async function drawVideoFrame(canvas, context, videoState, forkTravel) {
    const exported = fixedVideoSvgSource(videoState, forkTravel);
    const blob = new Blob([exported.source], { type: "image/svg+xml;charset=utf-8" });
    let image = null;
    let imageUrl = "";

    try {
      if (typeof createImageBitmap === "function") {
        try {
          image = await createImageBitmap(blob);
        } catch {
          image = null;
        }
      }
      if (!image) {
        imageUrl = URL.createObjectURL(blob);
        image = new Image();
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
          image.src = imageUrl;
        });
      }

      context.fillStyle = canvasBackgroundColor(videoState);
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    } finally {
      if (typeof image?.close === "function") image.close();
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    }
    return exported.model;
  }

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  function clearReadyVideoDownload() {
    if (videoDownloadUrl) URL.revokeObjectURL(videoDownloadUrl);
    videoDownloadUrl = "";
    elements.videoSaveLink.hidden = true;
    elements.videoSaveLink.removeAttribute("href");
    elements.videoSaveLink.removeAttribute("download");
  }

  function publishVideoDownload(blob, filename) {
    clearReadyVideoDownload();
    videoDownloadUrl = URL.createObjectURL(blob);
    elements.videoSaveLink.href = videoDownloadUrl;
    elements.videoSaveLink.download = filename;
    elements.videoSaveLink.hidden = false;
    try {
      elements.videoSaveLink.click();
    } catch {
      // The persistent link remains available for a trusted user click.
    }
  }

  async function requestAnimationSaveHandle(filename) {
    if (typeof window?.showSaveFilePicker !== "function") {
      return { handle: null, cancelled: false, supported: false };
    }
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: "MP4 animation",
            accept: { "video/mp4": [".mp4"] },
          },
        ],
      });
      return { handle, cancelled: false, supported: true };
    } catch (error) {
      if (error?.name === "AbortError") return { handle: null, cancelled: true, supported: true };
      throw error;
    }
  }

  async function saveMp4ToHandle(blob, fileHandle) {
    const writable = await fileHandle.createWritable();
    try {
      await writable.write(blob);
      await writable.close();
    } catch (error) {
      try {
        await writable.abort?.();
      } catch {
        // Preserve the original file-write error.
      }
      throw error;
    }
    clearReadyVideoDownload();
    return "file";
  }

  function saveMp4Blob(blob, filename, fileHandle = null) {
    if (fileHandle) return saveMp4ToHandle(blob, fileHandle);
    publishVideoDownload(blob, filename);
    return "download";
  }

  function forkCompletionTravel(sourceState = state) {
    if (!sourceState.origins.length) return forkTravelBounds(sourceState).zero;
    const bounds = forkTravelBounds(sourceState);
    if (
      strandModel(sourceState) === "minimal" &&
      terminalSmoothing(sourceState) > EPSILON
    ) {
      return bounds.full;
    }
    if (replicatedFraction(getReplicationModelAtTravel(bounds.zero, sourceState)) >= 100) return bounds.zero;

    let lower = bounds.zero;
    let upper = bounds.full;
    for (let iteration = 0; iteration < 56; iteration += 1) {
      const midpoint = (lower + upper) / 2;
      if (replicatedFraction(getReplicationModelAtTravel(midpoint, sourceState)) >= 100) upper = midpoint;
      else lower = midpoint;
    }
    return upper;
  }

  function videoFramePlan(videoState) {
    // Legacy snapshots may contain zero, negative, or invalid speed values.
    // Export must still cover the complete phase instead of producing one 0%
    // frame; supported positive speeds retain their configured timing.
    const speed = playbackSpeed(videoState);
    const startTravel = forkTravelBounds(videoState).zero;
    const completionTravel = forkCompletionTravel(videoState);
    const travelPerFrame =
      FORK_TRAVEL_PER_MILLISECOND *
      (1000 / VIDEO_FRAME_RATE) *
      speed *
      genomeDistanceScale(videoState);
    const travelSpan = Math.max(0, completionTravel - startTravel);
    return {
      startTravel,
      completionTravel,
      travelPerFrame,
      discreteStep: discreteAnimationEnabled(videoState) ? basePairStepFraction(videoState) : 0,
      lastFrameIndex: travelPerFrame > 0 ? Math.ceil(travelSpan / travelPerFrame) : 0,
      frameDurationSeconds: 1 / VIDEO_FRAME_RATE,
    };
  }

  function videoTravelAtFrame(plan, frameIndex) {
    const continuousTravel = clamp(
      plan.startTravel + Math.max(0, frameIndex) * plan.travelPerFrame,
      plan.startTravel,
      plan.completionTravel
    );
    if (!plan.discreteStep || continuousTravel >= plan.completionTravel - Number.EPSILON) {
      return continuousTravel;
    }
    const completedSteps = Math.floor(
      (continuousTravel - plan.startTravel) / plan.discreteStep + 1e-10
    );
    return clamp(
      plan.startTravel + completedSteps * plan.discreteStep,
      plan.startTravel,
      plan.completionTravel
    );
  }

  async function encodeMp4WithMediabunnyCodec(videoState, canvas, context, codec) {
    if (
      typeof Mediabunny === "undefined" ||
      !Mediabunny.Output ||
      !Mediabunny.Mp4OutputFormat ||
      !Mediabunny.CanvasSource
    ) {
      throw new Error("The MP4 encoder did not load");
    }

    const target = new Mediabunny.BufferTarget();
    const output = new Mediabunny.Output({ format: new Mediabunny.Mp4OutputFormat(), target });
    const source = new Mediabunny.CanvasSource(canvas, {
      codec,
      bitrate: VIDEO_BITS_PER_SECOND,
      latencyMode: "quality",
      keyFrameInterval: 2,
    });
    output.addVideoTrack(source, { frameRate: VIDEO_FRAME_RATE });
    const plan = videoFramePlan(videoState);

    try {
      await output.start();
      for (let frameIndex = 0; frameIndex <= plan.lastFrameIndex; frameIndex += 1) {
        const forkTravel = videoTravelAtFrame(plan, frameIndex);
        const model = await drawVideoFrame(canvas, context, videoState, forkTravel);
        await source.add(frameIndex * plan.frameDurationSeconds, plan.frameDurationSeconds, {
          keyFrame: frameIndex % (VIDEO_FRAME_RATE * 2) === 0,
        });
        if (frameIndex % VIDEO_FRAME_RATE === 0 || frameIndex === plan.lastFrameIndex) {
          setStatus(`Encoding 60 fps MP4... ${Math.round(replicatedFraction(model))}%`);
        }
      }
      source.close();
      await output.finalize();
      if (!target.buffer?.byteLength) throw new Error("The MP4 encoder returned an empty file");
      return new Blob([target.buffer], { type: "video/mp4" });
    } catch (error) {
      try {
        await output.cancel();
      } catch {
        // Preserve the original encoding error.
      }
      throw error;
    }
  }

  async function encodeMp4WithMediabunny(videoState, canvas, context) {
    let lastError = null;
    for (const codec of ["avc", "vp9"]) {
      try {
        return await encodeMp4WithMediabunnyCodec(videoState, canvas, context, codec);
      } catch (error) {
        lastError = error;
        console.warn(`${codec.toUpperCase()} MP4 encoding failed`, error);
      }
    }
    throw lastError || new Error("No browser video encoder could create an MP4");
  }

  function captureVideoStream(canvas) {
    try {
      const manualStream = canvas.captureStream(0);
      const manualTrack = manualStream.getVideoTracks()[0];
      if (manualTrack && typeof manualTrack.requestFrame === "function") {
        return { stream: manualStream, requestFrame: () => manualTrack.requestFrame() };
      }
      manualStream.getTracks().forEach((track) => track.stop());
    } catch {
      // Fall back to the browser-managed 60 fps canvas stream below.
    }
    return { stream: canvas.captureStream(VIDEO_FRAME_RATE), requestFrame: null };
  }

  function createNativeRecorder(stream, mimeType) {
    try {
      return new MediaRecorder(stream, { mimeType, videoBitsPerSecond: VIDEO_BITS_PER_SECOND });
    } catch {
      return new MediaRecorder(stream, { mimeType });
    }
  }

  async function encodeNativeCanvasCandidate(videoState, canvas, context, mimeType) {
    const chunks = [];
    let recorder = null;
    let stream = null;
    let stopped = null;

    try {
      const plan = videoFramePlan(videoState);
      await drawVideoFrame(canvas, context, videoState, plan.startTravel);
      const captured = captureVideoStream(canvas);
      stream = captured.stream;
      recorder = createNativeRecorder(stream, mimeType);
      let recorderError = null;
      let signalRecorderError;
      const failed = new Promise((resolve) => {
        signalRecorderError = resolve;
      });
      const started = new Promise((resolve) => recorder.addEventListener("start", resolve, { once: true }));
      stopped = new Promise((resolve) => recorder.addEventListener("stop", resolve, { once: true }));
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data?.size) chunks.push(event.data);
      });
      recorder.addEventListener(
        "error",
        (event) => {
          recorderError = event.error || new Error("Native MP4 recording failed");
          signalRecorderError();
        },
        { once: true }
      );

      recorder.start();
      const startResult = await Promise.race([
        started.then(() => "started"),
        failed.then(() => "failed"),
        wait(5000).then(() => "timeout"),
      ]);
      if (startResult === "failed") throw recorderError;
      if (startResult === "timeout") throw new Error("Native MP4 recorder did not start");

      const startedAt = performance.now();
      for (let frameIndex = 0; frameIndex <= plan.lastFrameIndex; frameIndex += 1) {
        if (recorderError) throw recorderError;
        const forkTravel = videoTravelAtFrame(plan, frameIndex);
        const model = await drawVideoFrame(canvas, context, videoState, forkTravel);
        captured.requestFrame?.();
        if (frameIndex % VIDEO_FRAME_RATE === 0 || frameIndex === plan.lastFrameIndex) {
          const format = mimeType.startsWith("video/webm") ? "intermediate video" : "fallback MP4";
          setStatus(`Recording ${format}... ${Math.round(replicatedFraction(model))}%`);
        }
        const targetTime = startedAt + ((frameIndex + 1) * 1000) / VIDEO_FRAME_RATE;
        const interrupted = await Promise.race([
          wait(Math.max(0, targetTime - performance.now())).then(() => false),
          failed.then(() => true),
        ]);
        if (interrupted) throw recorderError;
      }

      await wait(100);
      if (recorder.state !== "inactive") recorder.stop();
      const didStop = await Promise.race([stopped.then(() => true), wait(5000).then(() => false)]);
      if (!didStop) throw new Error("Native MP4 recorder did not finish");
      if (recorderError) throw recorderError;
      const video = new Blob(chunks, { type: recorder.mimeType || mimeType });
      if (!video.size) throw new Error("Native MP4 recorder returned no data");
      return video;
    } finally {
      if (recorder && recorder.state !== "inactive") {
        try {
          recorder.stop();
        } catch {
          // It may already be stopping after an asynchronous failure.
        }
      }
      if (stopped) await Promise.race([stopped, wait(2000)]);
      stream?.getTracks().forEach((track) => track.stop());
    }
  }

  async function encodeMp4WithNativeRecorder(videoState, canvas, context) {
    const candidates = nativeMp4MimeTypes();
    if (!candidates.length || typeof HTMLCanvasElement.prototype.captureStream !== "function") {
      throw new Error("Native MP4 recording is unavailable");
    }
    let lastError = null;
    for (const mimeType of candidates) {
      try {
        return await encodeNativeCanvasCandidate(videoState, canvas, context, mimeType);
      } catch (error) {
        lastError = error;
        console.warn(`Native ${mimeType} recording failed`, error);
      }
    }
    throw lastError || new Error("Native MP4 recording failed");
  }

  async function encodeWebmForRemux(videoState, canvas, context) {
    const candidates = nativeWebmMimeTypes();
    if (!candidates.length || typeof HTMLCanvasElement.prototype.captureStream !== "function") {
      throw new Error("WebM recording is unavailable");
    }
    let lastError = null;
    for (const mimeType of candidates) {
      try {
        return await encodeNativeCanvasCandidate(videoState, canvas, context, mimeType);
      } catch (error) {
        lastError = error;
        console.warn(`Intermediate ${mimeType} recording failed`, error);
      }
    }
    throw lastError || new Error("WebM recording failed");
  }

  async function remuxWebmToMp4(webm) {
    if (
      typeof Mediabunny === "undefined" ||
      !Mediabunny.Input ||
      !Mediabunny.BlobSource ||
      !Mediabunny.Conversion ||
      !Mediabunny.Output ||
      !Mediabunny.Mp4OutputFormat ||
      !Mediabunny.BufferTarget
    ) {
      throw new Error("The MP4 remuxer did not load");
    }

    const input = new Mediabunny.Input({ formats: Mediabunny.ALL_FORMATS, source: new Mediabunny.BlobSource(webm) });
    const target = new Mediabunny.BufferTarget();
    const output = new Mediabunny.Output({ format: new Mediabunny.Mp4OutputFormat(), target });

    try {
      const conversion = await Mediabunny.Conversion.init({
        input,
        output,
        tracks: "primary",
        showWarnings: false,
      });
      if (!conversion.isValid) throw new Error("The recorded browser video cannot be stored in an MP4 container");
      conversion.onProgress = (progress) => setStatus(`Building MP4 file... ${Math.round(progress * 100)}%`);
      await conversion.execute();
      if (!target.buffer?.byteLength) throw new Error("The MP4 remuxer returned an empty file");
      return new Blob([target.buffer], { type: "video/mp4" });
    } finally {
      input.dispose();
    }
  }

  async function encodeMp4WithRecordedFallback(videoState, canvas, context) {
    try {
      return await encodeMp4WithNativeRecorder(videoState, canvas, context);
    } catch (nativeMp4Error) {
      console.warn("Native MP4 recording failed; recording a compatible intermediate", nativeMp4Error);
      setStatus("Recording a browser-compatible intermediate for MP4...");
      const webm = await encodeWebmForRemux(videoState, canvas, context);
      return remuxWebmToMp4(webm);
    }
  }

  function setVideoExportBusy(busy) {
    isVideoExporting = busy;
    elements.exportMp4Button.disabled = busy;
    elements.downloadButton.disabled = busy;
    elements.downloadButtonLabel.textContent = busy ? "Generating..." : "Download";
    if (elements.downloadButtonSpinner) elements.downloadButtonSpinner.hidden = !busy;
    elements.downloadButton.setAttribute("aria-busy", String(busy));
    elements.canvasFrame.toggleAttribute("aria-busy", busy);
  }

  async function exportMp4() {
    if (isVideoExporting) return;
    if (!state.origins.length) {
      setStatus("Add an origin before exporting an animation");
      return;
    }

    if (typeof HTMLCanvasElement === "undefined") {
      setStatus("MP4 export is unavailable in this browser");
      return;
    }

    const videoState = makeVideoExportState();
    const filename = exportFilename("mp4");
    let destination;
    try {
      destination = await requestAnimationSaveHandle(filename);
    } catch (error) {
      setStatus(`Could not choose an animation destination: ${error instanceof Error ? error.message : "unknown error"}`);
      return;
    }
    if (destination.cancelled) {
      setStatus("Animation export cancelled");
      return;
    }

    clearReadyVideoDownload();
    setVideoExportBusy(true);

    try {
      const dimensions = fixedVideoSvgSource(videoState, videoState.forkTravel);
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = Math.max(2, Math.round((canvas.width * dimensions.height) / dimensions.width / 2) * 2);
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("Canvas rendering is unavailable");

      let video;
      try {
        video = await encodeMp4WithMediabunny(videoState, canvas, context);
      } catch (primaryError) {
        console.warn("Direct MP4 encoding failed; trying recorded fallbacks", primaryError);
        setStatus("Direct encoding unavailable; trying browser recording...");
        video = await encodeMp4WithRecordedFallback(videoState, canvas, context);
      }

      let saveMethod;
      try {
        saveMethod = await saveMp4Blob(video, filename, destination.handle);
      } catch (fileError) {
        console.warn("Saving to the selected file failed; falling back to a browser download", fileError);
        saveMethod = saveMp4Blob(video, filename);
        setStatus("The selected file could not be written; a browser download was prepared instead");
      }
      if (saveMethod === "file") {
        setStatus("MP4 animation saved to the selected file");
      } else if (!elements.videoSaveLink.hidden) {
        setStatus("MP4 download started — click Save MP4 if the browser did not show it");
      }
    } catch (error) {
      console.error("MP4 export failed", error);
      setStatus(`MP4 export failed: ${error instanceof Error ? error.message : "no compatible encoder was available"}`);
    } finally {
      setVideoExportBusy(false);
    }
  }

  function storedThemeMode() {
    try {
      const stored = typeof localStorage !== "undefined" ? localStorage.getItem("replisketch-theme") : null;
      return ["system", "light", "dark"].includes(stored) ? stored : "system";
    } catch {
      return "system";
    }
  }

  function resolvedTheme(mode = themeMode) {
    if (mode !== "system") return mode;
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(mode, { persist = false } = {}) {
    themeMode = ["system", "light", "dark"].includes(mode) ? mode : "system";
    const resolved = resolvedTheme(themeMode);
    if (document.documentElement) document.documentElement.dataset.theme = resolved;
    const themeMeta = document.querySelector?.('meta[name="theme-color"]');
    themeMeta?.setAttribute("content", resolved === "dark" ? "#101719" : "#f4f7f6");
    if (elements.themeMenuValue) {
      elements.themeMenuValue.textContent = themeMode[0].toUpperCase() + themeMode.slice(1);
    }
    if (elements.themeMenuIcon) {
      const iconPaths = {
        system: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
        light: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/>',
        dark: '<path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z"/>',
      };
      elements.themeMenuIcon.innerHTML = iconPaths[themeMode];
    }
    if (persist) {
      try {
        localStorage.setItem("replisketch-theme", themeMode);
      } catch {
        // Theme persistence is optional in restricted browsing contexts.
      }
    }
    if (state && elements.backgroundColorControl) {
      elements.backgroundColorControl.value = backgroundControlColor(state);
    }
    if (state && elements.canvas) render();
  }

  function cycleTheme() {
    const modes = ["system", "light", "dark"];
    applyTheme(modes[(modes.indexOf(themeMode) + 1) % modes.length], { persist: true });
    setStatus(`Theme set to ${themeMode}`);
  }

  function aboutDialogOpen() {
    return Boolean(elements.aboutDialog && !elements.aboutDialog.hidden);
  }

  function openAboutDialog() {
    if (!elements.aboutDialog) return;
    aboutReturnFocus = document.activeElement || elements.projectMenuButton;
    closeProjectMenu();
    closeDownloadMenu();
    elements.aboutDialog.hidden = false;
    elements.aboutDialog.setAttribute("aria-hidden", "false");
    elements.aboutMenuButton?.setAttribute("aria-expanded", "true");
    document.body?.classList?.add("rs-modal-open");
    requestAnimationFrame(() => elements.aboutCloseButton?.focus());
  }

  function closeAboutDialog({ restoreFocus = true } = {}) {
    if (!elements.aboutDialog || elements.aboutDialog.hidden) return;
    elements.aboutDialog.hidden = true;
    elements.aboutDialog.setAttribute("aria-hidden", "true");
    elements.aboutMenuButton?.setAttribute("aria-expanded", "false");
    document.body?.classList?.remove("rs-modal-open");
    const returnFocus = aboutReturnFocus;
    aboutReturnFocus = null;
    if (restoreFocus) returnFocus?.focus?.();
  }

  function setProjectMenu(open, focusFirst = false) {
    elements.projectMenu.hidden = !open;
    elements.projectMenuControl.classList.toggle("is-open", open);
    elements.projectMenuButton.setAttribute("aria-expanded", String(open));
    if (open) closeDownloadMenu();
    if (open && focusFirst) elements.projectMenu.querySelector('[role="menuitem"]')?.focus();
  }

  function closeProjectMenu() {
    setProjectMenu(false);
  }

  function setDownloadMenu(open, focusFirst = false) {
    elements.downloadMenu.hidden = !open;
    if (open) closeProjectMenu();
    elements.downloadControl.classList.toggle("is-open", open);
    elements.downloadButton.setAttribute("aria-expanded", String(open));
    if (open && focusFirst) elements.downloadMenu.querySelector("button")?.focus();
  }

  function closeDownloadMenu() {
    setDownloadMenu(false);
  }

  function runDownload(action) {
    closeDownloadMenu();
    action();
  }

  function beginControlChange() {
    if (!pendingControlSnapshot) pendingControlSnapshot = snapshot();
  }

  function finishControlChange() {
    if (pendingControlSnapshot && pendingControlSnapshot !== snapshot()) pushSnapshot(pendingControlSnapshot);
    pendingControlSnapshot = null;
  }

  function bindContinuousControl(control, handler) {
    control.addEventListener("pointerdown", beginControlChange);
    control.addEventListener("keydown", beginControlChange);
    control.addEventListener("input", () => handler(control.value));
    control.addEventListener("change", finishControlChange);
    control.addEventListener("blur", finishControlChange);
  }

  function bindControls() {
    if (elements.modelControl) {
      elements.modelControl.addEventListener("change", () => {
        pushSnapshot();
        state.advanced.strandModel = elements.modelControl.value;
        delete state.advanced.simplified;
        syncControls();
        render();
      });
    }
    bindContinuousControl(elements.lengthControl, (value) => {
      const nextLength = boundedLengthValue(value, state);
      if (Math.abs(nextLength - state.length) > EPSILON) reseedBasePairSequence(state);
      resizeGenomeLength(nextLength, state);
      render();
    });
    if (elements.lengthModeControl) {
      elements.lengthModeControl.addEventListener("change", () => {
        pushSnapshot();
        state.advanced.lengthMode = LENGTH_MODES.has(elements.lengthModeControl.value)
          ? elements.lengthModeControl.value
          : DEFAULTS.advanced.lengthMode;
        syncViewGeometry(state);
        syncControls();
        render();
        setStatus(
          lengthMode() === "extend"
            ? "Genome resizing will extend the right end"
            : "Genome resizing will rescale the chromosome"
        );
      });
    }
    bindContinuousControl(elements.progressControl, (value) => {
      stopAnimation();
      setSPhaseTime(boundedControlValue("progress", value));
      render();
    });
    bindContinuousControl(elements.pairResolutionControl, (value) => {
      const nextResolution = basePairResolution({ pairResolution: value });
      if (nextResolution !== state.pairResolution) reseedBasePairSequence(state);
      const previousLength = state.length;
      state.pairResolution = nextResolution;
      const nextLength = boundedLengthValue(previousLength, state);
      if (Math.abs(nextLength - previousLength) > EPSILON) {
        resizeGenomeLength(nextLength, state);
      } else {
        syncViewGeometry(state);
      }
      resetForkPlaybackClock();
      syncControls();
      render();
    });
    bindContinuousControl(elements.basePairWidthControl, (value) => {
      state.basePairWidth = boundedControlValue("basePairWidth", value);
      render();
    });
    bindContinuousControl(elements.weightControl, (value) => {
      state.weight = boundedControlValue("weight", value);
      render();
    });
    if (elements.doubleStrandHeightControl) {
      bindContinuousControl(elements.doubleStrandHeightControl, (value) => {
        state.doubleStrandHeight = boundedControlValue("doubleStrandHeight", value);
        render();
      });
    }
    bindContinuousControl(elements.daughterSpacingControl, (value) => {
      state.daughterSpacing = boundedControlValue("daughterSpacing", value);
      render();
    });
    bindContinuousControl(elements.speedControl, (value) => {
      state.speed = playbackSpeedFromMultiplier(value);
      updateReadouts();
    });
    if (elements.newDnaStartDistanceControl) {
      bindContinuousControl(elements.newDnaStartDistanceControl, (value) => {
        state.advanced.newDnaStartDistance = boundedControlValue(
          "newDnaStartDistance",
          value,
          DEFAULTS.advanced.newDnaStartDistance
        );
        render();
      });
    }
    if (elements.strandPhaseShiftControl) {
      bindContinuousControl(elements.strandPhaseShiftControl, (value) => {
        state.advanced.strandPhaseShift = boundedControlValue(
          "strandPhaseShift",
          value,
          DEFAULTS.advanced.strandPhaseShift
        );
        render();
      });
    }

    if (elements.transitionTightnessControl) {
      bindContinuousControl(elements.transitionTightnessControl, (value) => {
        state.advanced.transitionTightness = boundedControlValue(
          "transitionTightness",
          value,
          DEFAULTS.advanced.transitionTightness
        );
        render();
      });
    }
    if (elements.terminalSmoothingControl) {
      bindContinuousControl(elements.terminalSmoothingControl, (value) => {
        state.advanced.terminalSmoothing = boundedControlValue(
          "terminalSmoothing",
          value,
          DEFAULTS.advanced.terminalSmoothing
        );
        render();
      });
    }

    elements.basePairColorModeControl.addEventListener("change", () => {
      pushSnapshot();
      state.basePairColorMode = BASE_PAIR_COLOR_MODES.has(elements.basePairColorModeControl.value)
        ? elements.basePairColorModeControl.value
        : DEFAULTS.basePairColorMode;
      syncControls();
      render();
    });

    elements.basePairTransitionControl.addEventListener("change", () => {
      pushSnapshot();
      state.advanced.basePairTransition = BASE_PAIR_TRANSITION_MODES.has(
        elements.basePairTransitionControl.value
      )
        ? elements.basePairTransitionControl.value
        : DEFAULTS.advanced.basePairTransition;
      syncControls();
      render();
    });

    [
      [elements.templateAColor, "templateA"],
      [elements.templateBColor, "templateB"],
      [elements.newDnaColor, "newDna"],
      [elements.basePairColor, "basePair"],
      [elements.adenineColor, "adenine"],
      [elements.thymineColor, "thymine"],
      [elements.guanineColor, "guanine"],
      [elements.cytosineColor, "cytosine"],
    ].forEach(([control, key]) => {
      control.addEventListener("pointerdown", beginControlChange);
      control.addEventListener("input", () => {
        state.colors[key] = control.value;
        render();
      });
      control.addEventListener("change", finishControlChange);
    });

    [
      [elements.crossoverGapsToggle, "crossoverGaps"],
      [elements.gridToggle, "grid"],
      [elements.alwaysShowControlsToggle, "alwaysShowControls"],
      [elements.snapToBasePairsToggle, "snapToBasePairs"],
      [elements.includeExportBackgroundToggle, "includeExportBackground"],
    ].forEach(([control, key]) => {
      control.addEventListener("change", () => {
        pushSnapshot();
        state.advanced[key] = control.checked;
        render();
      });
    });

    elements.discreteAnimationToggle.addEventListener("change", () => {
      stopAnimation();
      pushSnapshot();
      state.discreteAnimation = elements.discreteAnimationToggle.checked;
      resetForkPlaybackClock();
      syncControls();
      render();
    });

    [
      [elements.pairsToggle, "pairs"],
      [elements.newDnaToggle, "newDna"],
      [elements.labelsToggle, "labels"],
    ].forEach(([control, key]) => {
      control.addEventListener("change", () => {
        pushSnapshot();
        state.layers[key] = control.checked;
        render();
      });
    });

    elements.backgroundColorControl.addEventListener("pointerdown", beginControlChange);
    elements.backgroundColorControl.addEventListener("input", () => {
      state.advanced.backgroundColor = configuredBackgroundColor(elements.backgroundColorControl.value);
      render();
    });
    elements.backgroundColorControl.addEventListener("change", finishControlChange);

    elements.undoButton.addEventListener("click", undo);
    elements.redoButton.addEventListener("click", redo);
    elements.resetButton.addEventListener("click", reset);
    elements.saveConfigButton.addEventListener("click", saveConfiguration);
    elements.loadConfigButton.addEventListener("click", () => {
      elements.configFileInput.value = "";
      elements.configFileInput.click();
    });
    elements.configFileInput.addEventListener("change", async () => {
      const file = elements.configFileInput.files?.[0];
      await loadConfigurationFile(file);
      elements.configFileInput.value = "";
    });
    elements.previewButton.addEventListener("click", previewSvg);
    elements.downloadButton.addEventListener("click", () => {
      setDownloadMenu(elements.downloadMenu.hidden, !elements.downloadMenu.hidden);
    });
    elements.downloadButton.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowDown") return;
      event.preventDefault();
      setDownloadMenu(true, true);
    });
    elements.projectMenuButton.addEventListener("click", () => {
      setProjectMenu(elements.projectMenu.hidden, !elements.projectMenu.hidden);
    });
    elements.projectMenuButton.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowDown") return;
      event.preventDefault();
      setProjectMenu(true, true);
    });
    elements.aboutMenuButton.addEventListener("click", openAboutDialog);
    elements.aboutCloseButton.addEventListener("click", () => closeAboutDialog());
    elements.aboutDialog.addEventListener("pointerdown", (event) => {
      if (event.target === elements.aboutDialog) closeAboutDialog();
    });
    elements.themeMenuButton.addEventListener("click", cycleTheme);
    elements.projectMenu.querySelectorAll('a[role="menuitem"]').forEach((link) => {
      link.addEventListener("click", closeProjectMenu);
    });

    elements.exportPngButton.addEventListener("click", () => runDownload(exportPng));
    elements.exportSvgButton.addEventListener("click", () => runDownload(exportSvg));
    elements.exportPdfButton.addEventListener("click", () => runDownload(exportPdf));
    elements.exportMp4Button.addEventListener("click", () => runDownload(exportMp4));
    elements.playButton.addEventListener("click", toggleAnimation);
    elements.deleteOriginsButton.addEventListener("click", deleteAllOrigins);
    elements.deleteBreaksButton.addEventListener("click", deleteAllBreaks);
    elements.canvas.addEventListener("pointerdown", handlePointerDown);
    elements.canvas.addEventListener("keydown", handleCanvasControlKeydown);
    elements.canvas.addEventListener("pointermove", handlePointerMove);
    elements.canvas.addEventListener("pointerup", endPointerDrag);
    elements.canvas.addEventListener("pointercancel", endPointerDrag);
    elements.canvas.addEventListener("pointerleave", () => {
      if (!dragState) clearPointerHover();
    });
    elements.canvas.addEventListener("wheel", handleWheel, { passive: false });
    elements.canvas.addEventListener("auxclick", (event) => {
      if (event.button === 1) event.preventDefault();
    });
    elements.zoomOutButton.addEventListener("click", () => setZoom(viewState.zoom / 1.25));
    elements.zoomInButton.addEventListener("click", () => setZoom(viewState.zoom * 1.25));
    elements.fitViewButton.addEventListener("click", resetView);
    bindContinuousControl(elements.aspectXControl, (value) => setArtworkAspectFromSlider("x", value));
    bindContinuousControl(elements.aspectYControl, (value) => setArtworkAspectFromSlider("y", value));

    document.addEventListener("pointerdown", (event) => {
      if (!elements.downloadControl.contains(event.target)) closeDownloadMenu();
      if (!elements.projectMenuControl.contains(event.target)) closeProjectMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (aboutDialogOpen()) {
        if (event.key === "Escape") {
          event.preventDefault();
          closeAboutDialog();
        }
        return;
      }
      const modifier = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      if (event.key === "Shift") {
        modifierState.shift = true;
        refreshContextAction();
      }
      if (event.key === "Control" || event.key === "Meta") {
        modifierState.special = true;
        refreshContextAction();
      }
      if (isPlaybackSpaceShortcut(event)) {
        event.preventDefault();
        toggleAnimation();
        return;
      }
      if (modifier && ((key === "z" && event.shiftKey) || key === "y")) {
        event.preventDefault();
        redo();
        return;
      }
      if (modifier && key === "z") {
        event.preventDefault();
        undo();
        return;
      }
      if (event.key === "Escape" && !elements.downloadMenu.hidden) {
        closeDownloadMenu();
        elements.downloadButton.focus();
        return;
      }
      if (event.key === "Escape" && !elements.projectMenu.hidden) {
        closeProjectMenu();
        elements.projectMenuButton.focus();
        return;
      }
      if ((event.key === "Delete" || event.key === "Backspace") && state.selectedOriginId) {
        if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
        event.preventDefault();
        deleteSelectedOrigin();
      }
    });

    document.addEventListener("keyup", (event) => {
      if (event.key === "Shift") modifierState.shift = false;
      if (event.key === "Control" || event.key === "Meta") modifierState.special = false;
      refreshContextAction();
    });

    window.addEventListener("blur", () => {
      modifierState = { shift: false, special: false };
      refreshContextAction();
    });
    window.addEventListener("beforeunload", () => {
      if (videoDownloadUrl) URL.revokeObjectURL(videoDownloadUrl);
    });
    window.matchMedia?.("(prefers-color-scheme: dark)")?.addEventListener?.("change", () => {
      if (themeMode === "system") applyTheme("system");
    });
    window.addEventListener("resize", render);
  }

  function collectElements() {
    [
      "replisketch-app",
      "dnaCanvas",
      "canvasFrame",
      "canvasLegend",
      "chromosomeRuler",
      "undoButton",
      "redoButton",
      "resetButton",
      "saveConfigButton",
      "loadConfigButton",
      "configFileInput",
      "previewButton",
      "downloadControl",
      "downloadButton",
      "downloadButtonLabel",
      "downloadButtonSpinner",
      "downloadMenu",
      "projectMenuControl",
      "projectMenuButton",
      "projectMenu",
      "aboutMenuButton",
      "aboutDialog",
      "aboutCloseButton",
      "themeMenuButton",
      "themeMenuIcon",
      "themeMenuValue",
      "exportPngButton",
      "exportSvgButton",
      "exportPdfButton",
      "exportMp4Button",
      "deleteOriginsButton",
      "deleteBreaksButton",
      "playButton",
      "playIcon",
      "playLabel",
      "statusMessage",
      "videoSaveLink",
      "selectionMessage",
      "modelControl",
      "lengthControl",
      "lengthModeControl",
      "progressControl",
      "pairResolutionControl",
      "basePairWidthControl",
      "weightControl",
      "doubleStrandHeightControl",
      "daughterSpacingControl",
      "newDnaStartDistanceControl",
      "strandPhaseShiftControl",
      "transitionTightnessControl",
      "terminalSmoothingControl",
      "speedControl",
      "discreteAnimationToggle",
      "lengthOutput",
      "progressOutput",
      "pairResolutionOutput",
      "basePairWidthOutput",
      "weightOutput",
      "doubleStrandHeightOutput",
      "daughterSpacingOutput",
      "newDnaStartDistanceOutput",
      "strandPhaseShiftOutput",
      "transitionTightnessOutput",
      "terminalSmoothingOutput",
      "speedOutput",
      "zoomOutButton",
      "zoomInButton",
      "fitViewButton",
      "zoomOutput",
      "aspectControls",
      "aspectXControl",
      "aspectYControl",
      "lengthStat",
      "originStat",
      "forkStat",
      "replicatedStat",
      "basePairColorModeControl",
      "basePairTransitionControl",
      "basePairSingleColorOption",
      "baseIdentityColors",
      "templateAColor",
      "templateBColor",
      "newDnaColor",
      "basePairColor",
      "adenineColor",
      "thymineColor",
      "guanineColor",
      "cytosineColor",
      "backgroundColorControl",
      "pairsToggle",
      "newDnaToggle",
      "labelsToggle",
      "crossoverGapsToggle",
      "gridToggle",
      "alwaysShowControlsToggle",
      "snapToBasePairsToggle",
      "includeExportBackgroundToggle",
    ].forEach((id) => {
      const key = id === "dnaCanvas" ? "canvas" : id === "replisketch-app" ? "app" : id;
      elements[key] = byId(id);
    });
  }

  function initialise() {
    collectElements();
    applyTheme(storedThemeMode());
    state = makeDefaultState();
    bindControls();
    syncControls();
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialise, { once: true });
  } else {
    initialise();
  }
})();
