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
  const APP_VERSION = "1.3.5";
  const CONFIG_FORMAT = "RepliCanvas";
  const LEGACY_CONFIG_FORMAT = ["Repli", "Sketch"].join("");
  const CONFIG_SCHEMA_VERSION = 1;
  const MAX_CONFIG_FILE_BYTES = 2 * 1024 * 1024;
  const TEMPLATE_CACHE_KEY = "replicanvas-template-v1";
  const LEGACY_TEMPLATE_CACHE_KEY = ["repli", "sketch-template-v1"].join("");
  const THEME_CACHE_KEY = "replicanvas-theme";
  const LEGACY_THEME_CACHE_KEY = ["repli", "sketch-theme"].join("");
  const APP_SETTINGS_KEY = "replicanvas-app-settings-v1";
  const TEMPLATE_CACHE_DELAY_MS = 300;
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
    basePairTranslation: { min: -5, max: 5 },
    basePairAngle: { min: -60, max: 60 },
    contourThickness: { min: 0.5, max: 10 },
    aspectX: { min: 0.1, max: 10 },
    aspectY: { min: 0.1, max: 5 },
  });
  const MIN_PAIR_RESOLUTION = CONTROL_RANGES.pairResolution.min;
  const MAX_BASE_PAIR_COUNT = 500;
  const GRID_COLUMN_COUNT = 12;
  const BASE_PAIR_COLOR_MODES = new Set(["single", "strand", "bases"]);
  const BASE_PAIR_TRANSITION_MODES = new Set(["fade", "grow", "instant"]);
  const LENGTH_MODES = new Set(["scale", "extend"]);
  const DNA_HANDEDNESS_MODES = new Set(["right", "left"]);
  const GEOMETRY_MODES = new Set(["linear", "circular", "freeform"]);
  const GRID_STYLES = new Set(["square", "centric"]);
  const CIRCULAR_START_ANGLE = -Math.PI / 2;
  const CIRCULAR_GRID_STEP = 80;
  // Below this radius the configured helix amplitude reads as a rosette
  // instead of a circular duplex. Compress layouts that cannot fit their
  // requested spacing while preserving a legible inner daughter circle.
  const CIRCULAR_MIN_RENDERED_RADIUS_FRACTION = 0.4;
  const CIRCULAR_RADIUS_SOFT_CLAMP_FRACTION = 0.14;
  const FREEFORM_TOOLS = new Set(["edit", "select", "draw", "erase"]);
  const FREEFORM_DRAW_POINT_SPACING = 3.5;
  const FREEFORM_DRAW_RELATIVE_TOLERANCE = 0.0035;
  const FREEFORM_DRAW_MIN_TOLERANCE_PX = 1.1;
  const FREEFORM_DRAW_MAX_TOLERANCE_PX = 5;
  const FREEFORM_DRAW_MIN_SAMPLE_PX = 2.5;
  const FREEFORM_DRAW_MAX_SAMPLE_PX = 8;
  const FREEFORM_PATH_SAMPLE_SPACING = 2.5;
  const FREEFORM_SHAPE_HANDLE_SPACING = 84;
  const FREEFORM_SHAPE_CONTROL_SPACING = 28;
  const FREEFORM_MAX_SHAPE_HANDLES = 24;
  const FREEFORM_MAX_SHAPE_CONTROL_POINTS = 160;
  const FREEFORM_MIN_PATH_LENGTH = 22;
  const FREEFORM_MIN_GENOMIC_LENGTH = 1;
  const FREEFORM_MAX_GENOMIC_LENGTH = 1_000_000;
  const FREEFORM_ERASER_RADIUS = 30;
  const FREEFORM_ERASER_RADIUS_MIN = 6;
  const FREEFORM_ERASER_RADIUS_MAX = 64;
  const FREEFORM_ENDPOINT_HIT_RADIUS = 18;
  const FREEFORM_DRAW_CLOSE_SNAP_PX = 24;
  const FREEFORM_CONNECTION_EPSILON = 0.5;
  const FREEFORM_OFFSET_CURVATURE_ONSET = 0.42;
  const FREEFORM_OFFSET_CURVATURE_LIMIT = 0.78;
  const FREEFORM_DEFORMATION_TURN_LIMIT = 0.55;
  const FREEFORM_PERIODIC_DUPLEX_TURN_LIMIT = 0.8;
  const FREEFORM_PATH_HIT_WIDTH = 24;
  const FREEFORM_MAX_POINTS = 6000;
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
  const VIDEO_FRAME_RATES = new Set([24, 30, 60]);
  const VIDEO_RESOLUTIONS = new Set([1280, 1920, 2560, 3840]);
  const VIDEO_QUALITY_MODES = new Set(["balanced", "high", "maximum"]);
  const PREVIEW_DETAIL_MODES = new Set(["auto", "full", "fast"]);
  const APP_SETTINGS_DEFAULTS = Object.freeze({
    frameRate: VIDEO_FRAME_RATE,
    videoWidth: 1280,
    videoQuality: "high",
    previewDetail: "auto",
    pauseWhenHidden: true,
    rememberProject: true,
  });
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
    geometry: "linear",
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
      gridStyle: "square",
      scaleBar: true,
      alwaysShowControls: true,
      snapToBasePairs: false,
      dnaHandedness: "right",
      circularHelixPhase: 0,
      circularHelixAnchor: 0.5,
      basePairTransition: "fade",
      lengthMode: "scale",
      includeExportBackground: false,
      contour: false,
      contourThickness: 2,
      contourColor: "#000000",
      newDnaStartDistance: 0,
      strandPhaseShift: 0,
      basePairTranslation: 0,
      basePairAngle: 0,
      depthAwareBasePairSplit: false,
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
  let scheduledRenderFrame = 0;
  let previousAnimationTime = 0;
  let isVideoExporting = false;
  let videoExportProgress = 0;
  let pendingControlSnapshot = null;
  let viewState = { zoom: 1, panX: 0, panY: 0 };
  let hoverState = null;
  let modifierState = { shift: false, special: false };
  let themeMode = "system";
  let aboutReturnFocus = null;
  let settingsReturnFocus = null;
  let templateCacheTimer = 0;
  let templateCacheSuspended = false;
  let artworkStrokeScale = 1;
  let artworkViewportScale = 1;
  let renderDetailOverride = null;
  let appSettings = { ...APP_SETTINGS_DEFAULTS };
  let nextFreeformPathId = 1;
  let freeformEditor = {
    tool: "draw",
    selectedPathId: null,
    draftPoints: [],
    eraserPoints: [],
    eraserRadius: FREEFORM_ERASER_RADIUS,
    hoverPoint: null,
    hoverEndpoint: null,
  };
  const forkPlaybackClocks = new WeakMap();
  const basePairIdentityCache = new Map();
  const freeformMetricsCache = new WeakMap();
  const freeformHelixCache = new WeakMap();
  const freeformFrameCache = new WeakMap();
  const freeformStrokeSamplers = new WeakMap();
  let artworkComputationCache = null;

  function withArtworkComputationCache(model, sourceState, callback) {
    const previous = artworkComputationCache;
    const reusable =
      previous?.model === model && previous?.sourceState === sourceState;
    if (!reusable) {
      artworkComputationCache = {
        model,
        sourceState,
        lattices: new WeakMap(),
        crossoverSites: new WeakMap(),
        replicationRegions: new Map(),
        replication: new Map(),
        minimalReplication: new Map(),
        visualReplication: new Map(),
        regionTransitionWidths: new WeakMap(),
        regionEdgeWidths: new WeakMap(),
      };
    }
    try {
      return callback();
    } finally {
      if (!reusable) artworkComputationCache = previous;
    }
  }

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

  function normaliseAppSettings(candidate = {}) {
    const source = candidate && typeof candidate === "object" ? candidate : {};
    const configuredFrameRate = Math.round(Number(source.frameRate));
    const configuredWidth = Math.round(Number(source.videoWidth));
    return {
      frameRate: VIDEO_FRAME_RATES.has(configuredFrameRate)
        ? configuredFrameRate
        : APP_SETTINGS_DEFAULTS.frameRate,
      videoWidth: VIDEO_RESOLUTIONS.has(configuredWidth)
        ? configuredWidth
        : APP_SETTINGS_DEFAULTS.videoWidth,
      videoQuality: VIDEO_QUALITY_MODES.has(source.videoQuality)
        ? source.videoQuality
        : APP_SETTINGS_DEFAULTS.videoQuality,
      previewDetail: PREVIEW_DETAIL_MODES.has(source.previewDetail)
        ? source.previewDetail
        : APP_SETTINGS_DEFAULTS.previewDetail,
      pauseWhenHidden: source.pauseWhenHidden !== false,
      rememberProject: source.rememberProject !== false,
    };
  }

  function storedAppSettings() {
    try {
      if (typeof localStorage === "undefined") return { ...APP_SETTINGS_DEFAULTS };
      const stored = localStorage.getItem(APP_SETTINGS_KEY);
      return stored ? normaliseAppSettings(JSON.parse(stored)) : { ...APP_SETTINGS_DEFAULTS };
    } catch {
      return { ...APP_SETTINGS_DEFAULTS };
    }
  }

  function persistAppSettings() {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(normaliseAppSettings(appSettings)));
      }
    } catch {
      // Application settings remain usable for the current session when
      // storage is unavailable or blocked.
    }
  }

  function animationFrameRate(settings = appSettings) {
    return normaliseAppSettings(settings).frameRate;
  }

  function animationResolution(settings = appSettings) {
    return normaliseAppSettings(settings).videoWidth;
  }

  function videoBitsPerSecond(settings = appSettings) {
    const resolved = normaliseAppSettings(settings);
    const qualityBase = {
      balanced: 3_000_000,
      high: VIDEO_BITS_PER_SECOND,
      maximum: 9_000_000,
    }[resolved.videoQuality];
    const resolutionScale = (resolved.videoWidth / APP_SETTINGS_DEFAULTS.videoWidth) ** 1.25;
    const frameScale = Math.sqrt(resolved.frameRate / VIDEO_FRAME_RATE);
    return Math.round(clamp(qualityBase * resolutionScale * frameScale, 1_500_000, 48_000_000));
  }

  function previewDetailMode(settings = appSettings) {
    return normaliseAppSettings(settings).previewDetail;
  }

  function withRenderDetail(mode, callback) {
    const previous = renderDetailOverride;
    renderDetailOverride = mode;
    try {
      return callback();
    } finally {
      renderDetailOverride = previous;
    }
  }

  const fixed = (value) => Number(value).toFixed(1);
  const precise = (value) => Number(value).toFixed(4);
  const fixedUiTransform = (x, y, rotationDegrees = 0) => {
    const scaleX = 1 / (viewState.zoom * artworkScaleX());
    const scaleY = 1 / (viewState.zoom * artworkAspectY());
    const point = geometryPoint(x, y);
    const configuredRotation = Number(rotationDegrees) || 0;
    if (circularGeometry() || Math.abs(configuredRotation) > EPSILON) {
      const angle = (configuredRotation * Math.PI) / 180;
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      return `matrix(${precise(cosine * scaleX)} ${precise(sine * scaleY)} ${precise(
        -sine * scaleX
      )} ${precise(cosine * scaleY)} ${fixed(point.x)} ${fixed(point.y)})`;
    }
    const scale = Math.abs(scaleX - scaleY) < 1e-9
      ? `scale(${precise(scaleX)})`
      : `scale(${precise(scaleX)} ${precise(scaleY)})`;
    return `translate(${fixed(point.x)} ${fixed(point.y)}) ${scale}`;
  };

  const fixedCanvasUiTransform = (x, y, rotationDegrees = 0) => {
    const scaleX = 1 / (viewState.zoom * artworkScaleX());
    const scaleY = 1 / (viewState.zoom * artworkAspectY());
    const angle = ((Number(rotationDegrees) || 0) * Math.PI) / 180;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    return `matrix(${precise(cosine * scaleX)} ${precise(sine * scaleY)} ${precise(
      -sine * scaleX
    )} ${precise(cosine * scaleY)} ${fixed(x)} ${fixed(y)})`;
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

  function withArtworkViewportScale(scale, callback) {
    const previous = artworkViewportScale;
    artworkViewportScale = Math.max(EPSILON, Number(scale) || 1);
    try {
      return callback();
    } finally {
      artworkViewportScale = previous;
    }
  }

  function canvasViewportScale() {
    const bounds = elements.canvas?.getBoundingClientRect?.();
    const width = Number(elements.canvas?.clientWidth) || Number(bounds?.width);
    const height = Number(elements.canvas?.clientHeight) || Number(bounds?.height);
    if (!(width > 0) || !(height > 0)) return 1;
    return Math.max(EPSILON, Math.min(width / VIEW.width, height / VIEW.height));
  }

  function artworkStrokeAttributes(width) {
    const baseWidth = Math.max(0, Number(width) || 0);
    return `stroke-width="${fixed(baseWidth * artworkStrokeScale)}" data-rs-stroke-width="${fixed(
      baseWidth
    )}" vector-effect="non-scaling-stroke"`;
  }

  function contourStrokeWidth(baseWidth, sourceState = state) {
    return Math.max(0, Number(baseWidth) || 0) + contourThickness(sourceState) * 2;
  }

  function renderArtworkPath(
    path,
    colour,
    width,
    { opacity = 1, linecap = "round", linejoin = "round", extra = "" } = {}
  ) {
    if (!path) return "";
    const alpha = precise(clamp(Number(opacity) || 0, 0, 1));
    const shared = `d="${path}" fill="none" stroke-linecap="${linecap}" stroke-linejoin="${linejoin}" opacity="${alpha}" ${extra}`;
    const contour = contourEnabled()
      ? `<path ${shared} stroke="${contourColor()}" ${artworkStrokeAttributes(
          contourStrokeWidth(width)
        )} data-rs-contour="true"/>`
      : "";
    return `${contour}<path ${shared} stroke="${colour}" ${artworkStrokeAttributes(width)}/>`;
  }

  function crossoverBridgeContourInset(width, sourceState = state) {
    if (!contourEnabled(sourceState)) return 0;
    const screenInset = contourThickness(sourceState) + Math.max(0.75, (Number(width) || 0) * 0.12);
    return screenInset / Math.max(EPSILON, artworkScaleX(sourceState));
  }

  function renderCrossoverBridgePath(
    path,
    contourPath,
    colour,
    width,
    { opacity = 1 } = {}
  ) {
    if (!path) return "";
    if (!contourEnabled()) return renderArtworkPath(path, colour, width, { opacity });
    const alpha = precise(clamp(Number(opacity) || 0, 0, 1));
    const contour = contourPath
      ? `<path d="${contourPath}" fill="none" stroke="${contourColor()}" ${artworkStrokeAttributes(
          contourStrokeWidth(width)
        )} data-rs-contour="true" data-rs-crossover-bridge="contour" stroke-linecap="butt" stroke-linejoin="round" opacity="${alpha}"/>`
      : "";
    // The coloured bridge extends beyond the shortened butt-capped contour.
    // It therefore merges into the already-rendered strand without exposing
    // the contour segment's end caps as dark transverse seams.
    const fill = `<path d="${path}" fill="none" stroke="${colour}" ${artworkStrokeAttributes(
      width
    )} data-rs-crossover-bridge="fill" stroke-linecap="round" stroke-linejoin="round" opacity="${alpha}"/>`;
    return `${contour}${fill}`;
  }

  function normaliseExportStrokeWidths(root) {
    root?.querySelectorAll?.("[data-rs-stroke-width]").forEach((element) => {
      const width = element.getAttribute("data-rs-stroke-width");
      if (width !== null) element.setAttribute("stroke-width", width);
      element.removeAttribute("data-rs-stroke-width");
    });
    root?.querySelectorAll?.("[data-rs-separator-center-x][data-rs-separator-native-half-width]")
      .forEach((element) => {
        const centerX = Number(element.getAttribute("data-rs-separator-center-x"));
        const centerY = Number(element.getAttribute("data-rs-separator-center-y"));
        const halfWidth = Number(element.getAttribute("data-rs-separator-native-half-width"));
        const separatorGeometry = element.getAttribute("data-rs-separator-geometry");
        if (Number.isFinite(centerX) && Number.isFinite(halfWidth)) {
          if (separatorGeometry === "circular" && Number.isFinite(centerY)) {
            const firstPoint = geometryPoint(centerX - halfWidth, centerY);
            const secondPoint = geometryPoint(centerX + halfWidth, centerY);
            element.setAttribute("x1", precise(firstPoint.x));
            element.setAttribute("y1", precise(firstPoint.y));
            element.setAttribute("x2", precise(secondPoint.x));
            element.setAttribute("y2", precise(secondPoint.y));
          } else {
            element.setAttribute("x1", precise(centerX - halfWidth));
            element.setAttribute("x2", precise(centerX + halfWidth));
          }
        }
        element.removeAttribute("data-rs-separator-center-x");
        element.removeAttribute("data-rs-separator-center-y");
        element.removeAttribute("data-rs-separator-native-half-width");
        element.removeAttribute("data-rs-separator-geometry");
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

  function geometryMode(sourceState = state) {
    const configured = sourceState?.geometry;
    return GEOMETRY_MODES.has(configured) ? configured : DEFAULTS.geometry;
  }

  function circularGeometry(sourceState = state) {
    return geometryMode(sourceState) === "circular";
  }

  function freeformGeometry(sourceState = state) {
    return geometryMode(sourceState) === "freeform";
  }

  function nonlinearGeometry(sourceState = state) {
    return circularGeometry(sourceState) || freeformGeometry(sourceState);
  }

  function freeformPoint(point) {
    const x = Number(point?.x);
    const y = Number(point?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return {
      x: clamp(x, -10000, 10000),
      y: clamp(y, -10000, 10000),
    };
  }

  function freeformPathLength(points, closed = false) {
    if (!Array.isArray(points) || points.length < 2) return 0;
    let length = 0;
    for (let index = 0; index < points.length - 1; index += 1) {
      length += Math.hypot(points[index + 1].x - points[index].x, points[index + 1].y - points[index].y);
    }
    if (closed && points.length > 2) {
      length += Math.hypot(points[0].x - points.at(-1).x, points[0].y - points.at(-1).y);
    }
    return length;
  }

  function nextAvailableFreeformPathId(sourceState = state) {
    const used = new Set((sourceState?.freeform?.paths || []).map((path) => path.id));
    let largest = 0;
    used.forEach((id) => {
      const match = /^path-(\d+)$/.exec(String(id));
      if (match) largest = Math.max(largest, Number(match[1]));
    });
    nextFreeformPathId = Math.max(nextFreeformPathId, largest + 1);
    while (used.has(`path-${nextFreeformPathId}`)) nextFreeformPathId += 1;
    return `path-${nextFreeformPathId++}`;
  }


  function normaliseFreeformState(candidate, sourceState = state) {
    const supplied = candidate && typeof candidate === "object" ? candidate : {};
    const ids = new Set();
    const paths = [];
    if (Array.isArray(supplied.paths)) {
      supplied.paths.slice(0, 128).forEach((path, index) => {
        if (!path || typeof path !== "object" || !Array.isArray(path.points)) return;
        const points = path.points
          .slice(0, FREEFORM_MAX_POINTS)
          .map(freeformPoint)
          .filter(Boolean);
        const closed = Boolean(path.closed) && points.length > 2;
        const arcLength = freeformPathLength(points, closed);
        if (points.length < 2 || arcLength < FREEFORM_MIN_PATH_LENGTH) return;
        let id = typeof path.id === "string" && /^[a-z\d][a-z\d_-]{0,63}$/i.test(path.id)
          ? path.id
          : `path-${index + 1}`;
        if (ids.has(id)) id = `${id}-${index + 1}`;
        ids.add(id);
        const configuredLength = Number(path.genomicLength);
        paths.push({
          id,
          points,
          closed,
          arcLength,
          genomicLength:
            Number.isFinite(configuredLength) && configuredLength > EPSILON
              ? configuredLength
              : null,
        });
      });
    }

    // Each free-form component owns its genomic length. Legacy projects did
    // not store this field, so distribute their total length once according to
    // physical arc length. From then on, adding or deleting another component
    // cannot rephase, resample, or otherwise alter an existing DNA piece.
    const totalArcLength = paths.reduce((total, path) => total + path.arcLength, 0);
    const configuredTotal = Number(sourceState?.length);
    const legacyTotal = Number.isFinite(configuredTotal) && configuredTotal > EPSILON
      ? configuredTotal
      : DEFAULTS.length;
    const explicitLengths = paths.filter((path) => path.genomicLength !== null);
    const missing = paths.filter((path) => path.genomicLength === null);
    const explicitTotal = explicitLengths.reduce((total, path) => total + path.genomicLength, 0);
    const remainingLegacyLength = Math.max(
      EPSILON,
      missing.length === paths.length ? legacyTotal : legacyTotal - explicitTotal
    );
    const missingArcLength = missing.reduce((total, path) => total + path.arcLength, 0);
    missing.forEach((path) => {
      path.genomicLength = missingArcLength > EPSILON
        ? remainingLegacyLength * (path.arcLength / missingArcLength)
        : remainingLegacyLength / Math.max(1, missing.length);
    });
    paths.forEach((path) => {
      delete path.arcLength;
      path.genomicLength = Math.max(EPSILON, Number(path.genomicLength) || EPSILON);
    });

    const selectedPathId = ids.has(supplied.selectedPathId) ? supplied.selectedPathId : paths[0]?.id || null;
    const result = {
      paths,
      selectedPathId,
      snapToStart: supplied.snapToStart === true,
      workspace: isPlainRecord(supplied.workspace) ? supplied.workspace : null,
    };
    freeformMetricsCache.delete(sourceState);
    return result;
  }

  function freeformPathGenomicLength(path, sourceState = state) {
    const configured = Number(path?.genomicLength);
    if (Number.isFinite(configured) && configured > EPSILON) return configured;
    const paths = sourceState?.freeform?.paths || [];
    const totalArc = paths.reduce(
      (total, candidate) => total + freeformPathLength(candidate.points, candidate.closed),
      0
    );
    const arc = freeformPathLength(path?.points || [], Boolean(path?.closed));
    const totalGenomic = Math.max(EPSILON, Number(sourceState?.length) || DEFAULTS.length);
    return totalArc > EPSILON ? totalGenomic * (arc / totalArc) : totalGenomic;
  }

  function freeformComponentLength(metricOrPath, sourceState = state) {
    const path = metricOrPath?.path || metricOrPath;
    return Math.max(EPSILON, freeformPathGenomicLength(path, sourceState));
  }

  function synchroniseFreeformLengthFromPaths(sourceState = state) {
    if (!sourceState || !freeformGeometry(sourceState)) return sourceState?.length;
    const paths = sourceState.freeform?.paths || [];
    const total = paths.reduce(
      (sum, path) => sum + Math.max(EPSILON, Number(path.genomicLength) || 0),
      0
    );
    sourceState.length = paths.length
      ? Math.max(FREEFORM_MIN_GENOMIC_LENGTH, total)
      : DEFAULTS.length;
    invalidateFreeformMetrics(sourceState);
    syncViewGeometry(sourceState);
    return sourceState.length;
  }

  function cloneReplicationOrigin(origin) {
    if (!origin || typeof origin !== "object") return null;
    const startPosition = Number(origin.startPosition ?? origin.position);
    const position = Number(origin.position ?? startPosition);
    const leftOffset = Number(origin.leftOffset);
    const rightOffset = Number(origin.rightOffset);
    if (
      typeof origin.id !== "string" ||
      !Number.isFinite(startPosition) ||
      !Number.isFinite(position) ||
      !Number.isFinite(leftOffset) ||
      !Number.isFinite(rightOffset)
    ) {
      return null;
    }
    const moleculeId =
      typeof origin.moleculeId === "string" && /^[a-z\d][a-z\d_-]{0,63}$/i.test(origin.moleculeId)
        ? origin.moleculeId
        : undefined;
    const localPosition = Number(origin.localPosition);
    return {
      id: origin.id,
      position: clamp(position, 0, 1),
      startPosition: clamp(startPosition, 0, 1),
      leftOffset: clamp(leftOffset, -2, 2),
      rightOffset: clamp(rightOffset, -2, 2),
      ...(moleculeId ? { moleculeId } : {}),
      ...(Number.isFinite(localPosition) ? { localPosition: clamp(localPosition, 0, 1) } : {}),
    };
  }

  function cloneReplicationCut(cut) {
    if (!cut || typeof cut !== "object") return null;
    const start = Number(cut.start);
    const end = Number(cut.end);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
    const componentId = cut.componentId ?? cut.moleculeId ?? cut.pathId;
    return {
      start: clamp(Math.min(start, end), 0, 1),
      end: clamp(Math.max(start, end), 0, 1),
      ...(typeof componentId === "string" && /^[a-z\d][a-z\d_-]{0,63}$/i.test(componentId)
        ? { componentId }
        : {}),
    };
  }

  function defaultStructuredWorkspace() {
    return {
      length: DEFAULTS.length,
      basePairSeed: DEFAULTS.basePairSeed,
      progress: DEFAULTS.progress,
      forkTravel: DEFAULTS.forkTravel,
      origins: DEFAULT_ORIGINS.map((origin) => ({ ...origin })),
      cuts: [],
      selectedOriginId: DEFAULT_ORIGINS[0]?.id || null,
      selectedFork: null,
      scaleBar: true,
    };
  }

  function defaultFreeformWorkspace() {
    return {
      length: DEFAULTS.length,
      basePairSeed: DEFAULTS.basePairSeed,
      progress: 0,
      forkTravel: 0,
      origins: [],
      cuts: [],
      selectedOriginId: null,
      selectedFork: null,
      scaleBar: false,
    };
  }

  function normaliseReplicationWorkspace(
    candidate,
    { kind = "structured", sourceState = state } = {}
  ) {
    const fallback = kind === "freeform" ? defaultFreeformWorkspace() : defaultStructuredWorkspace();
    const supplied = isPlainRecord(candidate) ? candidate : {};
    const origins = (Array.isArray(supplied.origins) ? supplied.origins : fallback.origins)
      .map(cloneReplicationOrigin)
      .filter(Boolean)
      .sort((first, second) => first.startPosition - second.startPosition);
    const originIds = new Set(origins.map((origin) => origin.id));
    const cuts = normaliseCutRegions(
      (Array.isArray(supplied.cuts) ? supplied.cuts : fallback.cuts)
        .map(cloneReplicationCut)
        .filter(Boolean)
    ).slice(0, 10);
    const hasSelectedOrigin = Object.prototype.hasOwnProperty.call(supplied, "selectedOriginId");
    const selectedOriginId = hasSelectedOrigin
      ? originIds.has(supplied.selectedOriginId)
        ? supplied.selectedOriginId
        : null
      : originIds.has(fallback.selectedOriginId)
        ? fallback.selectedOriginId
        : null;
    const selectedFork =
      isPlainRecord(supplied.selectedFork) &&
      originIds.has(supplied.selectedFork.originId) &&
      ["left", "right"].includes(supplied.selectedFork.side)
        ? { originId: supplied.selectedFork.originId, side: supplied.selectedFork.side }
        : null;
    const configuredSeed = Number(supplied.basePairSeed);
    const configuredTravel = Number(supplied.forkTravel);
    return {
      length: boundedLengthValue(supplied.length ?? fallback.length, {
        ...DEFAULTS,
        length: fallback.length,
        pairResolution: sourceState?.pairResolution ?? DEFAULTS.pairResolution,
      }),
      basePairSeed: Number.isFinite(configuredSeed)
        ? Math.trunc(configuredSeed) >>> 0
        : fallback.basePairSeed,
      progress: boundedControlValue("progress", supplied.progress, fallback.progress),
      forkTravel: clamp(
        Number.isFinite(configuredTravel) ? configuredTravel : fallback.forkTravel,
        -2,
        2
      ),
      origins,
      cuts,
      selectedOriginId: selectedFork ? null : selectedOriginId,
      selectedFork,
      scaleBar: typeof supplied.scaleBar === "boolean" ? supplied.scaleBar : fallback.scaleBar,
    };
  }

  function captureActiveReplicationWorkspace(sourceState = state) {
    const configuredSeed = Number(sourceState?.basePairSeed);
    return normaliseReplicationWorkspace(
      {
        length: sourceState?.length,
        basePairSeed: Number.isFinite(configuredSeed)
          ? Math.trunc(configuredSeed) >>> 0
          : DEFAULTS.basePairSeed,
        progress: sourceState?.progress,
        forkTravel: sourceState?.forkTravel,
        origins: (sourceState?.origins || []).map((origin) => ({ ...origin })),
        cuts: (sourceState?.cuts || []).map((cut) => ({ ...cut })),
        selectedOriginId: sourceState?.selectedOriginId ?? null,
        selectedFork: sourceState?.selectedFork ? { ...sourceState.selectedFork } : null,
        scaleBar: sourceState?.advanced?.scaleBar !== false,
      },
      {
        kind: freeformGeometry(sourceState) ? "freeform" : "structured",
        sourceState,
      }
    );
  }

  function applyReplicationWorkspace(sourceState, workspace, { kind = "structured" } = {}) {
    const resolved = normaliseReplicationWorkspace(workspace, { kind, sourceState });
    sourceState.length = resolved.length;
    sourceState.basePairSeed = resolved.basePairSeed;
    sourceState.progress = resolved.progress;
    sourceState.forkTravel = resolved.forkTravel;
    sourceState.origins = resolved.origins.map((origin) => ({ ...origin }));
    sourceState.cuts = resolved.cuts.map((cut) => ({ ...cut }));
    sourceState.selectedOriginId = resolved.selectedOriginId;
    sourceState.selectedFork = resolved.selectedFork ? { ...resolved.selectedFork } : null;
    sourceState.advanced = {
      ...DEFAULTS.advanced,
      ...(sourceState.advanced || {}),
      scaleBar: resolved.scaleBar,
    };
    resetForkPlaybackClock(sourceState);
    return resolved;
  }

  function persistActiveReplicationWorkspace(sourceState = state) {
    const workspace = captureActiveReplicationWorkspace(sourceState);
    if (freeformGeometry(sourceState)) {
      sourceState.freeform = sourceState.freeform || { paths: [], selectedPathId: null };
      sourceState.freeform.workspace = workspace;
    } else {
      sourceState.structuredWorkspace = workspace;
    }
    return workspace;
  }

  function switchGeometryWorkspace(nextGeometry, sourceState = state) {
    const resolvedGeometry = GEOMETRY_MODES.has(nextGeometry) ? nextGeometry : DEFAULTS.geometry;
    const previousGeometry = geometryMode(sourceState);
    if (resolvedGeometry === previousGeometry) return false;
    const previousFreeform = previousGeometry === "freeform";
    const nextFreeform = resolvedGeometry === "freeform";

    if (previousFreeform !== nextFreeform) {
      persistActiveReplicationWorkspace(sourceState);
      sourceState.geometry = resolvedGeometry;
      const storedWorkspace = nextFreeform
        ? sourceState.freeform?.workspace
        : sourceState.structuredWorkspace;
      applyReplicationWorkspace(sourceState, storedWorkspace, {
        kind: nextFreeform ? "freeform" : "structured",
      });
    } else {
      sourceState.geometry = resolvedGeometry;
    }

    if (nextFreeform) {
      sourceState.advanced.lengthMode = "scale";
      // Free-form drawings start without a ruler, while an explicit user choice
      // stored in the independent free-form workspace remains respected.
      sourceState.advanced.scaleBar = sourceState.freeform?.workspace?.scaleBar === true;
    }
    normaliseStateSchema(sourceState);
    reseedNextOriginId(sourceState);
    return true;
  }

  function cubicFreeformPoint(curve, amount) {
    const t = clamp(Number(amount) || 0, 0, 1);
    const inverse = 1 - t;
    const firstWeight = inverse ** 3;
    const firstControlWeight = 3 * inverse ** 2 * t;
    const secondControlWeight = 3 * inverse * t ** 2;
    const secondWeight = t ** 3;
    return {
      x:
        curve.first.x * firstWeight +
        curve.control1.x * firstControlWeight +
        curve.control2.x * secondControlWeight +
        curve.second.x * secondWeight,
      y:
        curve.first.y * firstWeight +
        curve.control1.y * firstControlWeight +
        curve.control2.y * secondControlWeight +
        curve.second.y * secondWeight,
    };
  }

  function cubicFreeformDerivative(curve, amount) {
    const t = clamp(Number(amount) || 0, 0, 1);
    const inverse = 1 - t;
    return {
      x:
        3 * inverse ** 2 * (curve.control1.x - curve.first.x) +
        6 * inverse * t * (curve.control2.x - curve.control1.x) +
        3 * t ** 2 * (curve.second.x - curve.control2.x),
      y:
        3 * inverse ** 2 * (curve.control1.y - curve.first.y) +
        6 * inverse * t * (curve.control2.y - curve.control1.y) +
        3 * t ** 2 * (curve.second.y - curve.control2.y),
    };
  }

  function cubicFreeformSecondDerivative(curve, amount) {
    const t = clamp(Number(amount) || 0, 0, 1);
    const inverse = 1 - t;
    return {
      x:
        6 * inverse * (curve.control2.x - 2 * curve.control1.x + curve.first.x) +
        6 * t * (curve.second.x - 2 * curve.control2.x + curve.control1.x),
      y:
        6 * inverse * (curve.control2.y - 2 * curve.control1.y + curve.first.y) +
        6 * t * (curve.second.y - 2 * curve.control2.y + curve.control1.y),
    };
  }

  function cubicFreeformCurvature(curve, amount) {
    const derivative = cubicFreeformDerivative(curve, amount);
    const secondDerivative = cubicFreeformSecondDerivative(curve, amount);
    const derivativeLength = Math.hypot(derivative.x, derivative.y);
    if (derivativeLength <= EPSILON) return 0;
    const curvature =
      (derivative.x * secondDerivative.y - derivative.y * secondDerivative.x) /
      derivativeLength ** 3;
    return Number.isFinite(curvature) ? curvature : 0;
  }

  function freeformCentripetalInterval(first, second) {
    return Math.max(
      Math.sqrt(Math.max(EPSILON, Math.hypot(second.x - first.x, second.y - first.y))),
      Math.sqrt(EPSILON)
    );
  }

  function freeformCentripetalTangent(previous, current, following, previousInterval, nextInterval) {
    const before = Math.max(Math.sqrt(EPSILON), previousInterval);
    const after = Math.max(Math.sqrt(EPSILON), nextInterval);
    const span = before + after;
    return {
      x:
        (current.x - previous.x) / before -
        (following.x - previous.x) / span +
        (following.x - current.x) / after,
      y:
        (current.y - previous.y) / before -
        (following.y - previous.y) / span +
        (following.y - current.y) / after,
    };
  }

  function freeformCenterlineCurves(path, tension = 1) {
    const supplied = (path?.points || []).map(freeformPoint).filter(Boolean);
    const points = [];
    supplied.forEach((point) => {
      const previous = points.at(-1);
      if (!previous || Math.hypot(point.x - previous.x, point.y - previous.y) > EPSILON) {
        points.push(point);
      }
    });
    if (
      Boolean(path?.closed) &&
      points.length > 2 &&
      Math.hypot(points[0].x - points.at(-1).x, points[0].y - points.at(-1).y) <= EPSILON
    ) {
      points.pop();
    }
    if (points.length < 2) return { points, curves: [], closed: false };

    const closed = Boolean(path?.closed) && points.length > 2;
    const resolvedTension = clamp(Number(tension) || 0, 0, 1);
    const segmentCount = closed ? points.length : points.length - 1;
    const curves = [];
    for (let index = 0; index < segmentCount; index += 1) {
      const current = points[index];
      const next = points[(index + 1) % points.length];
      const previous = closed
        ? points[(index - 1 + points.length) % points.length]
        : index > 0
          ? points[index - 1]
          : { x: current.x * 2 - next.x, y: current.y * 2 - next.y };
      const following = closed
        ? points[(index + 2) % points.length]
        : index + 2 < points.length
          ? points[index + 2]
          : { x: next.x * 2 - current.x, y: next.y * 2 - current.y };
      const previousInterval = freeformCentripetalInterval(previous, current);
      const interval = freeformCentripetalInterval(current, next);
      const nextInterval = freeformCentripetalInterval(next, following);
      const firstTangent = freeformCentripetalTangent(
        previous,
        current,
        next,
        previousInterval,
        interval
      );
      const secondTangent = freeformCentripetalTangent(
        current,
        next,
        following,
        interval,
        nextInterval
      );
      const control1 = {
        x: current.x + (firstTangent.x * interval * resolvedTension) / 3,
        y: current.y + (firstTangent.y * interval * resolvedTension) / 3,
      };
      const control2 = {
        x: next.x - (secondTangent.x * interval * resolvedTension) / 3,
        y: next.y - (secondTangent.y * interval * resolvedTension) / 3,
      };
      const controlHull = [current, control1, control2, next];
      const controlLength =
        Math.hypot(control1.x - current.x, control1.y - current.y) +
        Math.hypot(control2.x - control1.x, control2.y - control1.y) +
        Math.hypot(next.x - control2.x, next.y - control2.y);
      curves.push({
        first: current,
        control1,
        control2,
        second: next,
        index,
        closing: closed && index === points.length - 1,
        estimatedLength: Math.max(EPSILON, controlLength),
        bounds: {
          left: Math.min(...controlHull.map((point) => point.x)),
          right: Math.max(...controlHull.map((point) => point.x)),
          top: Math.min(...controlHull.map((point) => point.y)),
          bottom: Math.max(...controlHull.map((point) => point.y)),
        },
      });
    }
    return { points, curves, closed };
  }

  function freeformCurveTurningAngle(curve) {
    let previous = null;
    let turning = 0;
    for (let index = 0; index <= 8; index += 1) {
      const derivative = cubicFreeformDerivative(curve, index / 8);
      const length = Math.hypot(derivative.x, derivative.y);
      if (length <= EPSILON) continue;
      const tangent = { x: derivative.x / length, y: derivative.y / length };
      if (previous) {
        turning += Math.abs(
          Math.atan2(
            previous.x * tangent.y - previous.y * tangent.x,
            clamp(previous.x * tangent.x + previous.y * tangent.y, -1, 1)
          )
        );
      }
      previous = tangent;
    }
    return turning;
  }

  function freeformCenterline(path, tension = 1) {
    const centerline = freeformCenterlineCurves(path, tension);
    if (!centerline.curves.length) {
      return { ...centerline, segments: [], samples: centerline.points, length: 0, bounds: null };
    }
    const desiredSubdivisions = centerline.curves.map((curve) =>
      Math.max(
        1,
        Math.ceil(curve.estimatedLength / FREEFORM_PATH_SAMPLE_SPACING),
        Math.ceil(freeformCurveTurningAngle(curve) / (Math.PI / 24))
      )
    );
    const desiredTotal = desiredSubdivisions.reduce((total, count) => total + count, 0);
    const subdivisionScale = desiredTotal > MAX_PATH_SAMPLE_POINTS
      ? MAX_PATH_SAMPLE_POINTS / desiredTotal
      : 1;
    const subdivisions = desiredSubdivisions.map((count) =>
      Math.max(1, Math.floor(count * subdivisionScale))
    );
    const segments = [];
    const samples = [];
    let running = 0;
    centerline.curves.forEach((curve, curveIndex) => {
      curve.startLength = running;
      const count = subdivisions[curveIndex];
      let first = cubicFreeformPoint(curve, 0);
      if (!samples.length) samples.push(first);
      for (let step = 1; step <= count; step += 1) {
        const secondAmount = step / count;
        const second = cubicFreeformPoint(curve, secondAmount);
        const length = Math.hypot(second.x - first.x, second.y - first.y);
        if (length > EPSILON) {
          segments.push({
            first,
            second,
            index: curve.index,
            closing: curve.closing,
            curve,
            curveAmountStart: (step - 1) / count,
            curveAmountEnd: secondAmount,
            startLength: running,
            length,
            bounds: curve.bounds,
          });
          running += length;
        }
        samples.push(second);
        first = second;
      }
      curve.length = running - curve.startLength;
      curve.endLength = running;
    });
    const bounds = {
      left: Math.min(...centerline.curves.map((curve) => curve.bounds.left)),
      right: Math.max(...centerline.curves.map((curve) => curve.bounds.right)),
      top: Math.min(...centerline.curves.map((curve) => curve.bounds.top)),
      bottom: Math.max(...centerline.curves.map((curve) => curve.bounds.bottom)),
    };
    return { ...centerline, segments, samples, length: running, bounds };
  }

  function freeformPathMetrics(sourceState = state) {
    if (!sourceState || typeof sourceState !== "object") return [];
    const freeform = sourceState.freeform || { paths: [] };
    const cached = freeformMetricsCache.get(sourceState);
    if (cached && cached.freeform === freeform && cached.paths === freeform.paths) return cached.metrics;

    const prepared = (freeform.paths || [])
      .map((path) => {
        const centerline = freeformCenterline(path);
        if (centerline.length < FREEFORM_MIN_PATH_LENGTH || !centerline.segments.length) return null;
        return {
          id: path.id,
          path,
          controlPoints: centerline.points,
          points: centerline.samples,
          curves: centerline.curves,
          closed: centerline.closed,
          segments: centerline.segments,
          length: centerline.length,
          bounds: centerline.bounds,
        };
      })
      .filter(Boolean);
    const totalGenomicLength = prepared.reduce(
      (total, metric) => total + freeformComponentLength(metric, sourceState),
      0
    );
    let cursor = 0;
    const metrics = prepared.map((metric, index) => {
      const genomicLength = freeformComponentLength(metric, sourceState);
      const span = index === prepared.length - 1
        ? 1 - cursor
        : genomicLength / Math.max(EPSILON, totalGenomicLength);
      const start = cursor;
      const end = index === prepared.length - 1 ? 1 : cursor + span;
      cursor = end;
      return {
        ...metric,
        genomicLength,
        start,
        end,
        span: Math.max(EPSILON, end - start),
      };
    });
    freeformMetricsCache.set(sourceState, { freeform, paths: freeform.paths, metrics });
    return metrics;
  }

  function freeformMetricById(id, sourceState = state) {
    return freeformPathMetrics(sourceState).find((metric) => metric.id === id) || null;
  }

  function pointOnFreeformMetric(metric, localFraction) {
    if (!metric?.segments?.length) {
      return { x: VIEW.width / 2, y: VIEW.centerY, tangentX: 1, tangentY: 0, normalX: 0, normalY: 1 };
    }
    const local = metric.closed ? wrapFraction(localFraction) : clamp(Number(localFraction) || 0, 0, 1);
    const target = local * metric.length;
    // Arc-length samples are sorted, so a binary search avoids walking every
    // stored point for each strand/base-pair sample on complex drawings.
    let lower = 0;
    let upper = metric.segments.length - 1;
    while (lower < upper) {
      const midpoint = Math.floor((lower + upper) / 2);
      const candidate = metric.segments[midpoint];
      if (target <= candidate.startLength + candidate.length + EPSILON) upper = midpoint;
      else lower = midpoint + 1;
    }
    const segment = metric.segments[lower] || metric.segments.at(-1);
    const amount = clamp((target - segment.startLength) / Math.max(EPSILON, segment.length), 0, 1);
    const curveAmount =
      segment.curveAmountStart +
      (segment.curveAmountEnd - segment.curveAmountStart) * amount;
    const point = cubicFreeformPoint(segment.curve, curveAmount);
    let derivative = cubicFreeformDerivative(segment.curve, curveAmount);
    if (Math.hypot(derivative.x, derivative.y) <= EPSILON) {
      derivative = {
        x: segment.second.x - segment.first.x,
        y: segment.second.y - segment.first.y,
      };
    }
    const derivativeLength = Math.max(EPSILON, Math.hypot(derivative.x, derivative.y));
    const inverse = 1 / derivativeLength;
    const tangentX = derivative.x * inverse;
    const tangentY = derivative.y * inverse;
    const secondDerivative = cubicFreeformSecondDerivative(segment.curve, curveAmount);
    const curvature =
      (derivative.x * secondDerivative.y - derivative.y * secondDerivative.x) /
      Math.max(EPSILON, derivativeLength ** 3);
    return {
      x: point.x,
      y: point.y,
      tangentX,
      tangentY,
      normalX: -tangentY,
      normalY: tangentX,
      curvature: Number.isFinite(curvature) ? curvature : 0,
      localPosition: metric.closed ? wrapFraction((segment.startLength + segment.length * amount) / metric.length) : clamp((segment.startLength + segment.length * amount) / metric.length, 0, 1),
      pathId: metric.id,
    };
  }

  function freeformDeformationDetailExtent(sourceState = state) {
    return (
      Math.max(
        Number(sourceState?.weight) || DEFAULTS.weight,
        Number(sourceState?.basePairWidth) || DEFAULTS.basePairWidth
      ) /
        2 +
      2
    );
  }

  function freeformHelixDeformationEnvelope(sourceState = state) {
    return Math.max(
      4,
      renderedDoubleStrandHalfHeight(sourceState) +
        freeformDeformationDetailExtent(sourceState)
    );
  }

  function freeformDeformationEnvelope(sourceState = state) {
    return Math.max(
      freeformHelixDeformationEnvelope(sourceState),
      renderedDaughterHalfSpacing(sourceState) +
        renderedDoubleStrandHalfHeight(sourceState) +
        freeformDeformationDetailExtent(sourceState)
    );
  }

  function equivalentFreeformAngle(angle, reference) {
    const turn = Math.PI * 2;
    return angle + Math.round((reference - angle) / turn) * turn;
  }

  function smoothedFreeformAngles(angles, passes = 2) {
    let current = angles.slice();
    for (let pass = 0; pass < passes; pass += 1) {
      current = current.map((angle, index) => {
        const previous = current[Math.max(0, index - 1)];
        const following = current[Math.min(current.length - 1, index + 1)];
        return (previous + angle * 2 + following) / 4;
      });
    }
    return current;
  }

  function rateLimitedFreeformAngles(angles, maximumStep) {
    if (angles.length < 2) return angles.slice();
    const limit = Math.max(EPSILON, Number(maximumStep) || EPSILON);
    const forward = [angles[0]];
    for (let index = 1; index < angles.length; index += 1) {
      forward.push(
        clamp(angles[index], forward[index - 1] - limit, forward[index - 1] + limit)
      );
    }
    const backward = Array(angles.length);
    backward[angles.length - 1] = angles.at(-1);
    for (let index = angles.length - 2; index >= 0; index -= 1) {
      backward[index] = clamp(
        angles[index],
        backward[index + 1] - limit,
        backward[index + 1] + limit
      );
    }
    return forward.map((angle, index) => (angle + backward[index]) / 2);
  }

  function freeformAngleSlopes(angles, maximumStep) {
    if (angles.length < 2) return angles.map(() => 0);
    const secants = angles.slice(1).map((angle, index) => angle - angles[index]);
    return angles.map((angle, index) => {
      if (index === 0) return clamp(secants[0], -maximumStep, maximumStep);
      if (index === angles.length - 1) {
        return clamp(secants.at(-1), -maximumStep, maximumStep);
      }
      const previous = secants[index - 1];
      const following = secants[index];
      if (previous * following <= 0) return 0;
      return clamp(
        (2 * previous * following) / (previous + following),
        -maximumStep,
        maximumStep
      );
    });
  }

  function smoothedPeriodicFreeformAngles(angles, fullTurn, passes = 2) {
    if (angles.length < 3) return angles.slice();
    const count = angles.length - 1;
    let current = angles.slice(0, count);
    for (let pass = 0; pass < passes; pass += 1) {
      current = current.map((angle, index, values) => {
        const previous = index === 0
          ? values[count - 1] - fullTurn
          : values[index - 1];
        const following = index === count - 1
          ? values[0] + fullTurn
          : values[index + 1];
        return (previous + angle * 2 + following) / 4;
      });
    }
    return [...current, current[0] + fullTurn];
  }

  function freeformAngleFrameProfile(
    rawAngles,
    segmentCount,
    arcStep,
    maximumTurnRate,
    closed = false
  ) {
    let maximumStep = Math.max(EPSILON, maximumTurnRate * arcStep);
    let targets = smoothedFreeformAngles(rawAngles);
    let fullTurn = 0;
    if (closed) {
      fullTurn =
        Math.round((rawAngles.at(-1) - rawAngles[0]) / (Math.PI * 2)) *
        Math.PI *
        2;
      maximumStep = Math.max(
        maximumStep,
        (Math.abs(fullTurn) / Math.max(1, segmentCount)) * 1.001
      );
      targets = smoothedPeriodicFreeformAngles(rawAngles, fullTurn);
    }

    let angles = rateLimitedFreeformAngles(targets, maximumStep);
    if (closed) {
      const seamError = angles.at(-1) - angles[0] - fullTurn;
      angles = angles.map(
        (angle, index) => angle - seamError * (index / segmentCount)
      );
      maximumStep = Math.max(
        maximumStep,
        ...angles.slice(1).map((angle, index) => Math.abs(angle - angles[index]))
      );
    }

    const slopes = freeformAngleSlopes(angles, maximumStep);
    if (closed && slopes.length > 1) {
      const previous = angles.at(-1) - angles.at(-2);
      const following = angles[1] - angles[0];
      const seamSlope = previous * following <= 0
        ? 0
        : clamp(
            (2 * previous * following) / (previous + following),
            -maximumStep,
            maximumStep
          );
      slopes[0] = seamSlope;
      slopes[slopes.length - 1] = seamSlope;
    }

    return {
      angles,
      slopes,
      segmentCount,
      arcStep,
      maximumTurnRate: maximumStep / Math.max(EPSILON, arcStep),
      closed,
      fullTurn,
    };
  }

  function freeformDeformationFrameProfile(
    metric,
    sourceState = state,
    configuredEnvelope = freeformDeformationEnvelope(sourceState)
  ) {
    if (!metric || !(metric.length > EPSILON)) return null;
    const envelope = Math.max(4, Number(configuredEnvelope) || 0);
    const cacheKey = `${metric.closed ? "closed" : "open"}:${metric.length.toFixed(3)}:${envelope.toFixed(3)}`;
    let cachedProfiles = freeformFrameCache.get(metric);
    if (!cachedProfiles) {
      cachedProfiles = new Map();
      freeformFrameCache.set(metric, cachedProfiles);
    }
    if (cachedProfiles.has(cacheKey)) return cachedProfiles.get(cacheKey);

    const segmentCount = clamp(
      Math.ceil(metric.length / 2.5),
      16,
      Math.min(6000, MAX_PATH_SAMPLE_POINTS)
    );
    const arcStep = metric.length / segmentCount;
    const rawAngles = [];
    for (let index = 0; index <= segmentCount; index += 1) {
      const point = pointOnFreeformMetric(metric, index / segmentCount);
      const angle = Math.atan2(point.tangentY, point.tangentX);
      rawAngles.push(
        index === 0 ? angle : equivalentFreeformAngle(angle, rawAngles[index - 1])
      );
    }

    const profile = freeformAngleFrameProfile(
      rawAngles,
      segmentCount,
      arcStep,
      FREEFORM_DEFORMATION_TURN_LIMIT / envelope,
      metric.closed
    );
    cachedProfiles.set(cacheKey, profile);
    return profile;
  }

  function freeformDeformationFrameAt(
    point,
    sourceState = state,
    envelope = freeformDeformationEnvelope(sourceState)
  ) {
    const profile = freeformDeformationFrameProfile(
      point?.metric,
      sourceState,
      envelope
    );
    if (!profile) return null;
    const position =
      clamp(Number(point?.localPosition) || 0, 0, 1) * profile.segmentCount;
    const index = Math.min(profile.segmentCount - 1, Math.floor(position));
    const amount = clamp(position - index, 0, 1);
    const firstAngle = profile.angles[index];
    const secondAngle = profile.angles[index + 1];
    const firstSlope = profile.slopes[index];
    const secondSlope = profile.slopes[index + 1];
    const amountSquared = amount * amount;
    const amountCubed = amountSquared * amount;
    const angle =
      (2 * amountCubed - 3 * amountSquared + 1) * firstAngle +
      (amountCubed - 2 * amountSquared + amount) * firstSlope +
      (-2 * amountCubed + 3 * amountSquared) * secondAngle +
      (amountCubed - amountSquared) * secondSlope;
    const angleDerivative =
      (6 * amountSquared - 6 * amount) * firstAngle +
      (3 * amountSquared - 4 * amount + 1) * firstSlope +
      (-6 * amountSquared + 6 * amount) * secondAngle +
      (3 * amountSquared - 2 * amount) * secondSlope;
    const tangentX = Math.cos(angle);
    const tangentY = Math.sin(angle);
    return {
      tangentX,
      tangentY,
      normalX: -tangentY,
      normalY: tangentX,
      turnRate: angleDerivative / Math.max(EPSILON, profile.arcStep),
      maximumTurnRate: profile.maximumTurnRate,
      angle,
    };
  }

  function freeformRenderedFrame(point, sourceState = state, deformationAmount = 1) {
    const configuredTangentX = Number(point?.tangentX);
    const configuredTangentY = Number(point?.tangentY);
    let rawTangentX = Number.isFinite(configuredTangentX) ? configuredTangentX : 1;
    let rawTangentY = Number.isFinite(configuredTangentY) ? configuredTangentY : 0;
    const rawLength = Math.hypot(rawTangentX, rawTangentY);
    if (rawLength > EPSILON) {
      rawTangentX /= rawLength;
      rawTangentY /= rawLength;
    } else {
      rawTangentX = 1;
      rawTangentY = 0;
    }
    const rawFrame = {
      tangentX: rawTangentX,
      tangentY: rawTangentY,
      normalX: -rawTangentY,
      normalY: rawTangentX,
    };
    if (!point?.metric) return rawFrame;
    const narrowFrame = freeformDeformationFrameAt(
      point,
      sourceState,
      freeformHelixDeformationEnvelope(sourceState)
    );
    if (!narrowFrame) return rawFrame;
    const blend = clamp(Number(deformationAmount) || 0, 0, 1);
    if (blend <= EPSILON) return narrowFrame;
    const wideFrame = freeformDeformationFrameAt(
      point,
      sourceState,
      freeformDeformationEnvelope(sourceState)
    );
    if (!wideFrame || blend >= 1 - EPSILON) return wideFrame || narrowFrame;
    const wideAngle = equivalentFreeformAngle(wideFrame.angle, narrowFrame.angle);
    const angle = narrowFrame.angle + (wideAngle - narrowFrame.angle) * blend;
    const tangentX = Math.cos(angle);
    const tangentY = Math.sin(angle);
    return {
      tangentX,
      tangentY,
      normalX: -tangentY,
      normalY: tangentX,
      turnRate:
        narrowFrame.turnRate + (wideFrame.turnRate - narrowFrame.turnRate) * blend,
      maximumTurnRate:
        narrowFrame.maximumTurnRate +
        (wideFrame.maximumTurnRate - narrowFrame.maximumTurnRate) * blend,
      angle,
    };
  }

  function freeformComponentCurvatureBound(point) {
    const raw = Math.abs(Number(point?.curvature) || 0);
    const metric = point?.metric;
    if (!metric?.curves?.length) return raw;
    if (Number.isFinite(metric.maximumCurvature)) return metric.maximumCurvature;
    let maximum = 0;
    metric.curves.forEach((curve) => {
      const samples = clamp(Math.ceil((Number(curve.length) || 0) / 2), 8, 64);
      for (let index = 0; index <= samples; index += 1) {
        maximum = Math.max(maximum, Math.abs(cubicFreeformCurvature(curve, index / samples)));
      }
    });
    metric.maximumCurvature = maximum * 1.2;
    return metric.maximumCurvature;
  }

  function freeformCurvatureSafeOffset(point, requestedOffset) {
    const offset = Number(requestedOffset) || 0;
    const curvature = freeformComponentCurvatureBound(point);
    const pressure = curvature * Math.abs(offset);
    if (pressure <= FREEFORM_OFFSET_CURVATURE_ONSET + EPSILON) return offset;

    // One fixed curvature bound maps the normal coordinate for the whole
    // painted piece. The mapping can saturate on a tight component, but it
    // never varies along the path and therefore cannot introduce ripples.
    const range = FREEFORM_OFFSET_CURVATURE_LIMIT - FREEFORM_OFFSET_CURVATURE_ONSET;
    const safePressure =
      FREEFORM_OFFSET_CURVATURE_ONSET +
      range *
        (1 -
          Math.exp(
            -(pressure - FREEFORM_OFFSET_CURVATURE_ONSET) /
              Math.max(EPSILON, range)
          ));
    return offset * (safePressure / Math.max(EPSILON, pressure));
  }

  function freeformRenderedNormalOffset(point, requestedOffset) {
    const offset = Number(requestedOffset) || 0;
    return point?.metric
      ? offset
      : freeformCurvatureSafeOffset(point, offset);
  }

  function distanceSquaredToBounds(point, bounds) {
    if (!bounds) return 0;
    const dx = point.x < bounds.left
      ? bounds.left - point.x
      : point.x > bounds.right
        ? point.x - bounds.right
        : 0;
    const dy = point.y < bounds.top
      ? bounds.top - point.y
      : point.y > bounds.bottom
        ? point.y - bounds.bottom
        : 0;
    return dx * dx + dy * dy;
  }

  function projectPointToFreeformMetric(
    point,
    metric,
    maximumDistance = Infinity,
    { referenceLocalPosition = null, maximumLocalDelta = Infinity } = {}
  ) {
    if (!metric?.segments?.length) return null;
    const finiteMaximum = Number.isFinite(Number(maximumDistance))
      ? Math.max(0, Number(maximumDistance))
      : Infinity;
    const reference = Number(referenceLocalPosition);
    const localLimit = Number.isFinite(Number(maximumLocalDelta))
      ? Math.max(0, Number(maximumLocalDelta))
      : Infinity;
    let nearestDistanceSquared = finiteMaximum ** 2;
    if (distanceSquaredToBounds(point, metric.bounds) > nearestDistanceSquared) return null;

    let nearestSegment = null;
    metric.segments.forEach((segment) => {
      if (Number.isFinite(reference) && Number.isFinite(localLimit)) {
        const segmentStart = segment.startLength / Math.max(EPSILON, metric.length);
        const segmentEnd = (segment.startLength + segment.length) / Math.max(EPSILON, metric.length);
        const segmentCenter = (segmentStart + segmentEnd) / 2;
        const segmentHalfSpan = Math.max(EPSILON, (segmentEnd - segmentStart) / 2);
        const centerDistance = metric.closed
          ? Math.abs(signedCircularFractionDelta(reference, segmentCenter))
          : Math.abs(segmentCenter - reference);
        if (Math.max(0, centerDistance - segmentHalfSpan) > localLimit + EPSILON) return;
      }
      if (distanceSquaredToBounds(point, segment.bounds) > nearestDistanceSquared) return;
      const dx = segment.second.x - segment.first.x;
      const dy = segment.second.y - segment.first.y;
      const denominator = dx * dx + dy * dy;
      const amount = denominator <= EPSILON
        ? 0
        : clamp(((point.x - segment.first.x) * dx + (point.y - segment.first.y) * dy) / denominator, 0, 1);
      const x = segment.first.x + dx * amount;
      const y = segment.first.y + dy * amount;
      const distanceSquared = (point.x - x) ** 2 + (point.y - y) ** 2;
      if (distanceSquared >= nearestDistanceSquared) return;
      nearestDistanceSquared = distanceSquared;
      nearestSegment = { segment, amount };
    });
    if (!nearestSegment) return null;

    const { segment } = nearestSegment;
    const lower = segment.curveAmountStart;
    const upper = segment.curveAmountEnd;
    let curveAmount = lower + (upper - lower) * nearestSegment.amount;
    // Refine the chord projection on the actual cubic. Starting from a short
    // flattened interval keeps Newton's method inside the correct lobe even
    // on tightly curved hand-drawn strokes.
    for (let iteration = 0; iteration < 10; iteration += 1) {
      const curvePoint = cubicFreeformPoint(segment.curve, curveAmount);
      const derivative = cubicFreeformDerivative(segment.curve, curveAmount);
      const secondDerivative = cubicFreeformSecondDerivative(segment.curve, curveAmount);
      const offsetX = curvePoint.x - point.x;
      const offsetY = curvePoint.y - point.y;
      const numerator = offsetX * derivative.x + offsetY * derivative.y;
      const denominator =
        derivative.x ** 2 +
        derivative.y ** 2 +
        offsetX * secondDerivative.x +
        offsetY * secondDerivative.y;
      if (Math.abs(denominator) <= 1e-12) break;
      const next = clamp(curveAmount - numerator / denominator, lower, upper);
      if (Math.abs(next - curveAmount) <= 1e-12) {
        curveAmount = next;
        break;
      }
      curveAmount = next;
    }
    const projected = cubicFreeformPoint(segment.curve, curveAmount);
    let derivative = cubicFreeformDerivative(segment.curve, curveAmount);
    if (Math.hypot(derivative.x, derivative.y) <= EPSILON) {
      derivative = {
        x: segment.second.x - segment.first.x,
        y: segment.second.y - segment.first.y,
      };
    }
    const inverse = 1 / Math.max(EPSILON, Math.hypot(derivative.x, derivative.y));
    const tangentX = derivative.x * inverse;
    const tangentY = derivative.y * inverse;
    const segmentAmount = clamp(
      (curveAmount - lower) / Math.max(EPSILON, upper - lower),
      0,
      1
    );
    const localPosition =
      (segment.startLength + segment.length * segmentAmount) / metric.length;
    return {
      metric,
      pathId: metric.id,
      x: projected.x,
      y: projected.y,
      distance: Math.hypot(point.x - projected.x, point.y - projected.y),
      tangentX,
      tangentY,
      normalX: -tangentY,
      normalY: tangentX,
      localPosition: metric.closed ? wrapFraction(localPosition) : clamp(localPosition, 0, 1),
      segmentIndex: segment.index,
      segmentAmount: curveAmount,
      closingSegment: segment.closing,
    };
  }

  function nearestFreeformProjection(point, sourceState = state, preferredPathId = null) {
    const metrics = freeformPathMetrics(sourceState);
    if (!metrics.length) return null;
    const preferred = preferredPathId ? freeformMetricById(preferredPathId, sourceState) : null;
    const preferredProjection = preferred ? projectPointToFreeformMetric(point, preferred) : null;
    let nearest = preferredProjection;
    metrics.forEach((metric) => {
      if (metric === preferred) return;
      const projection = projectPointToFreeformMetric(point, metric, nearest?.distance ?? Infinity);
      if (projection && (!nearest || projection.distance < nearest.distance)) nearest = projection;
    });
    return nearest;
  }

  function freeformMetricAtFraction(fraction, sourceState = state, preferredPathId = null) {
    const metrics = freeformPathMetrics(sourceState);
    if (!metrics.length) return null;
    if (preferredPathId) {
      const preferred = metrics.find((metric) => metric.id === preferredPathId);
      if (preferred) return preferred;
    }
    const configured = Number(fraction);
    const position = clamp(Number.isFinite(configured) ? configured : 0, 0, 1);
    if (position >= 1 - Number.EPSILON) return metrics.at(-1);
    let lower = 0;
    let upper = metrics.length - 1;
    while (lower < upper) {
      const midpoint = Math.floor((lower + upper) / 2);
      if (position < metrics[midpoint].end - EPSILON) upper = midpoint;
      else lower = midpoint + 1;
    }
    return metrics[lower] || metrics.at(-1);
  }

  function freeformLocalToFraction(pathId, localPosition, sourceState = state) {
    const metric = freeformMetricById(pathId, sourceState) || freeformPathMetrics(sourceState)[0];
    if (!metric) return 0;
    const local = metric.closed ? wrapFraction(localPosition) : clamp(Number(localPosition) || 0, 0, 1);
    return clamp(metric.start + local * metric.span, metric.start, metric.end);
  }

  function freeformFractionToLocal(fraction, metricOrId = null, sourceState = state) {
    const metric = typeof metricOrId === "string"
      ? freeformMetricById(metricOrId, sourceState)
      : metricOrId || freeformMetricAtFraction(fraction, sourceState);
    if (!metric) return 0;
    const local = (Number(fraction) - metric.start) / Math.max(EPSILON, metric.span);
    return metric.closed ? wrapFraction(local) : clamp(local, 0, 1);
  }

  function freeformPointAtFraction(fraction, sourceState = state, preferredPathId = null) {
    const metric = freeformMetricAtFraction(fraction, sourceState, preferredPathId);
    if (!metric) return null;
    const local = freeformFractionToLocal(fraction, metric, sourceState);
    return { ...pointOnFreeformMetric(metric, local), metric, globalPosition: metric.start + local * metric.span };
  }

  function freeformComponentBoundsForOrigin(origin, sourceState = state) {
    const metric = freeformMetricById(origin?.moleculeId, sourceState)
      || freeformMetricAtFraction(origin?.startPosition, sourceState);
    if (!metric) return { start: 0, end: 1, closed: false, id: null };
    return { start: metric.start, end: metric.end, closed: metric.closed, id: metric.id, metric };
  }

  function ensureFreeformOriginMetadata(sourceState = state, { preferLocal = true } = {}) {
    if (!freeformGeometry(sourceState) || !Array.isArray(sourceState.origins)) return false;
    const metrics = freeformPathMetrics(sourceState);
    if (!metrics.length) return false;
    let changed = false;
    sourceState.origins.forEach((origin) => {
      let metric = freeformMetricById(origin.moleculeId, sourceState);
      const configuredLocal = Number(origin.localPosition);
      if (preferLocal && metric && Number.isFinite(configuredLocal)) {
        const local = metric.closed ? wrapFraction(configuredLocal) : clamp(configuredLocal, 0, 1);
        const global = metric.start + local * metric.span;
        if (Math.abs((Number(origin.startPosition) || 0) - global) > EPSILON) changed = true;
        origin.localPosition = local;
        origin.startPosition = global;
        origin.position = global;
        return;
      }
      const global = clamp(Number(origin.startPosition ?? origin.position) || 0, 0, 1);
      metric = metric || freeformMetricAtFraction(global, sourceState) || metrics[0];
      const local = freeformFractionToLocal(global, metric, sourceState);
      if (origin.moleculeId !== metric.id || Math.abs((Number(origin.localPosition) || 0) - local) > EPSILON) {
        changed = true;
      }
      origin.moleculeId = metric.id;
      origin.localPosition = local;
      origin.startPosition = metric.start + local * metric.span;
      origin.position = origin.startPosition;
    });
    sourceState.origins.sort((first, second) => first.startPosition - second.startPosition);
    return changed;
  }

  function updateFreeformOriginMetadataFromGlobal(sourceState = state) {
    return ensureFreeformOriginMetadata(sourceState, { preferLocal: false });
  }

  function invalidateFreeformMetrics(sourceState = state) {
    if (sourceState && typeof sourceState === "object") {
      freeformMetricsCache.delete(sourceState);
      freeformHelixCache.delete(sourceState);
    }
  }

  function freeformPathById(pathId, sourceState = state) {
    return (sourceState?.freeform?.paths || []).find((path) => path.id === pathId) || null;
  }

  function selectedFreeformPath(sourceState = state) {
    const selectedId = freeformEditor.selectedPathId || sourceState?.freeform?.selectedPathId;
    return freeformPathById(selectedId, sourceState);
  }

  function selectFreeformPath(pathId, sourceState = state) {
    const path = freeformPathById(pathId, sourceState);
    const selectedId = path?.id || null;
    freeformEditor.selectedPathId = selectedId;
    if (sourceState?.freeform) sourceState.freeform.selectedPathId = selectedId;
    return path || null;
  }

  function rawFreeformPathD(path) {
    const points = (path?.points || []).map(freeformPoint).filter(Boolean);
    if (points.length < 2) return "";
    let result = `M${precise(points[0].x)} ${precise(points[0].y)}`;
    for (let index = 1; index < points.length; index += 1) {
      result += ` L${precise(points[index].x)} ${precise(points[index].y)}`;
    }
    if (path.closed && points.length > 2) result += " Z";
    return result;
  }

  function freeformSplinePathD(path, tension = 1) {
    const centerline = freeformCenterlineCurves(path, tension);
    if (!centerline.curves.length) return "";
    if (centerline.points.length === 2) {
      return rawFreeformPathD({ points: centerline.points, closed: false });
    }
    let result = `M${precise(centerline.curves[0].first.x)} ${precise(
      centerline.curves[0].first.y
    )}`;
    centerline.curves.forEach((curve) => {
      result += ` C${precise(curve.control1.x)} ${precise(curve.control1.y)} ${precise(
        curve.control2.x
      )} ${precise(curve.control2.y)} ${precise(curve.second.x)} ${precise(
        curve.second.y
      )}`;
    });
    if (centerline.closed) result += " Z";
    return result;
  }

  function distancePointToSegment(point, first, second) {
    const dx = second.x - first.x;
    const dy = second.y - first.y;
    const denominator = dx * dx + dy * dy;
    const amount = denominator <= EPSILON
      ? 0
      : clamp(((point.x - first.x) * dx + (point.y - first.y) * dy) / denominator, 0, 1);
    const x = first.x + dx * amount;
    const y = first.y + dy * amount;
    return { distance: Math.hypot(point.x - x, point.y - y), amount, x, y };
  }

  function distancePointToPolyline(point, points) {
    if (!Array.isArray(points) || !points.length) return Infinity;
    if (points.length === 1) return Math.hypot(point.x - points[0].x, point.y - points[0].y);
    let nearest = Infinity;
    for (let index = 0; index < points.length - 1; index += 1) {
      nearest = Math.min(nearest, distancePointToSegment(point, points[index], points[index + 1]).distance);
    }
    return nearest;
  }

  function appendFreeformStrokePoint(points, point, minimumSpacing = FREEFORM_DRAW_POINT_SPACING) {
    const candidate = freeformPoint(point);
    if (!candidate) return false;
    const spacing = Math.max(0.5, Number(minimumSpacing) || FREEFORM_DRAW_POINT_SPACING);
    let sampler = freeformStrokeSamplers.get(points);

    if (sampler?.tail) {
      if (points.at(-1) === sampler.tail) {
        points.pop();
      } else {
        sampler = null;
      }
    }

    const previous = points.at(-1);
    if (!previous) {
      points.push(candidate);
      freeformStrokeSamplers.set(points, {
        lastInput: candidate,
        remainder: 0,
        spacing,
        tail: null,
      });
      return true;
    }

    if (!sampler) {
      sampler = {
        lastInput: previous,
        remainder: 0,
        spacing,
        tail: null,
      };
      freeformStrokeSamplers.set(points, sampler);
    } else if (Math.abs(sampler.spacing - spacing) > EPSILON) {
      const phase = sampler.spacing > EPSILON ? sampler.remainder / sampler.spacing : 0;
      sampler.remainder = clamp(phase * spacing, 0, Math.max(0, spacing - EPSILON));
      sampler.spacing = spacing;
    }

    const segmentStart = sampler.lastInput;
    const dx = candidate.x - segmentStart.x;
    const dy = candidate.y - segmentStart.y;
    const distance = Math.hypot(dx, dy);

    // Pointer events arrive at a device- and load-dependent frequency. Carry
    // unused arc length across events and commit only uniform spatial samples;
    // the final item is a transient exact endpoint used by the live preview.
    if (distance > EPSILON) {
      let travelled = 0;
      let distanceToNext = spacing - sampler.remainder;
      while (distance - travelled >= distanceToNext - EPSILON) {
        travelled += distanceToNext;
        const amount = clamp(travelled / distance, 0, 1);
        const sample = {
          x: segmentStart.x + dx * amount,
          y: segmentStart.y + dy * amount,
        };
        const committed = points.at(-1);
        if (
          !committed ||
          Math.hypot(sample.x - committed.x, sample.y - committed.y) > EPSILON
        ) {
          points.push(sample);
        }
        sampler.remainder = 0;
        distanceToNext = spacing;
      }
      sampler.remainder = clamp(
        sampler.remainder + distance - travelled,
        0,
        Math.max(0, spacing - EPSILON)
      );
      sampler.lastInput = candidate;
    }

    const committed = points.at(-1);
    if (
      !committed ||
      Math.hypot(candidate.x - committed.x, candidate.y - committed.y) > EPSILON
    ) {
      sampler.tail = candidate;
      points.push(candidate);
    } else {
      sampler.tail = null;
    }
    if (points.length > FREEFORM_MAX_POINTS) {
      points.splice(1, points.length - FREEFORM_MAX_POINTS);
    }
    return distance > EPSILON;
  }

  function simplifyFreeformPoints(
    points,
    tolerance = 1.25,
    { preserveIndices = [] } = {}
  ) {
    const source = (points || []).map(freeformPoint).filter(Boolean);
    if (source.length <= 2) return source;
    const keep = new Uint8Array(source.length);
    const anchors = [
      0,
      ...(Array.isArray(preserveIndices) ? preserveIndices : [])
        .map((index) => Math.round(Number(index)))
        .filter((index) => Number.isFinite(index) && index > 0 && index < source.length - 1),
      source.length - 1,
    ]
      .filter((index, position, values) => values.indexOf(index) === position)
      .sort((first, second) => first - second);
    anchors.forEach((index) => {
      keep[index] = 1;
    });
    const stack = anchors
      .slice(1)
      .map((lastIndex, index) => [anchors[index], lastIndex])
      .filter(([firstIndex, lastIndex]) => lastIndex - firstIndex > 1);
    const threshold = Math.max(0.05, Number(tolerance) || 0.05);
    while (stack.length) {
      const [firstIndex, lastIndex] = stack.pop();
      let largestDistance = 0;
      let largestIndex = -1;
      for (let index = firstIndex + 1; index < lastIndex; index += 1) {
        const distance = distancePointToSegment(source[index], source[firstIndex], source[lastIndex]).distance;
        if (distance > largestDistance) {
          largestDistance = distance;
          largestIndex = index;
        }
      }
      if (largestIndex >= 0 && largestDistance > threshold) {
        keep[largestIndex] = 1;
        stack.push([firstIndex, largestIndex], [largestIndex, lastIndex]);
      }
    }
    return source.filter((_, index) => keep[index]);
  }

  function freeformDrawingScale(sourceState = state, sourceView = viewState) {
    const zoom = Math.max(0.1, Number(sourceView?.zoom) || 1);
    const aspect = Math.sqrt(
      Math.max(EPSILON, artworkAspectX(sourceState) * artworkAspectY(sourceState))
    );
    return zoom * aspect;
  }

  function resampleFreeformPoints(points, spacing = FREEFORM_DRAW_POINT_SPACING) {
    const source = (points || []).map(freeformPoint).filter(Boolean);
    if (source.length <= 1) return source;
    const cleaned = [source[0]];
    for (let index = 1; index < source.length; index += 1) {
      if (
        Math.hypot(
          source[index].x - cleaned.at(-1).x,
          source[index].y - cleaned.at(-1).y
        ) > EPSILON
      ) {
        cleaned.push(source[index]);
      }
    }
    if (cleaned.length <= 1) return cleaned;
    const cumulative = [0];
    for (let index = 1; index < cleaned.length; index += 1) {
      cumulative.push(
        cumulative.at(-1) +
          Math.hypot(
            cleaned[index].x - cleaned[index - 1].x,
            cleaned[index].y - cleaned[index - 1].y
          )
      );
    }
    const totalLength = cumulative.at(-1);
    if (totalLength <= EPSILON) return [cleaned[0]];
    const targetSpacing = Math.max(0.5, Number(spacing) || FREEFORM_DRAW_POINT_SPACING);
    const segmentCount = Math.max(1, Math.min(FREEFORM_MAX_POINTS - 1, Math.ceil(totalLength / targetSpacing)));
    const result = [];
    let sourceIndex = 1;
    for (let index = 0; index <= segmentCount; index += 1) {
      const target = (index / segmentCount) * totalLength;
      while (sourceIndex < cumulative.length - 1 && cumulative[sourceIndex] < target) {
        sourceIndex += 1;
      }
      const previousIndex = Math.max(0, sourceIndex - 1);
      const segmentLength = cumulative[sourceIndex] - cumulative[previousIndex];
      const amount = segmentLength <= EPSILON
        ? 0
        : clamp((target - cumulative[previousIndex]) / segmentLength, 0, 1);
      result.push({
        x: cleaned[previousIndex].x + (cleaned[sourceIndex].x - cleaned[previousIndex].x) * amount,
        y: cleaned[previousIndex].y + (cleaned[sourceIndex].y - cleaned[previousIndex].y) * amount,
      });
    }
    return result;
  }

  function smoothFreeformPoints(points, passes = 3, strength = 0.3) {
    let current = (points || []).map(freeformPoint).filter(Boolean);
    if (current.length <= 2) return current;
    const resolvedPasses = clamp(Math.round(Number(passes) || 0), 0, 6);
    const baseStrength = clamp(Number(strength) || 0, 0, 0.48);
    for (let pass = 0; pass < resolvedPasses; pass += 1) {
      const next = [current[0]];
      for (let index = 1; index < current.length - 1; index += 1) {
        const previous = current[index - 1];
        const point = current[index];
        const following = current[index + 1];
        const incomingLength = Math.hypot(point.x - previous.x, point.y - previous.y);
        const outgoingLength = Math.hypot(following.x - point.x, following.y - point.y);
        const denominator = Math.max(EPSILON, incomingLength * outgoingLength);
        const alignment = clamp(
          ((point.x - previous.x) * (following.x - point.x) +
            (point.y - previous.y) * (following.y - point.y)) /
            denominator,
          -1,
          1
        );
        // A non-zero floor also rounds abrupt pointer reversals. Deliberate
        // shape editing remains available afterwards through broad, tapered
        // deformation instead of storing mouse-resolution corners.
        const localStrength = baseStrength * clamp((alignment + 1) / 2, 0.32, 1);
        next.push({
          x: point.x * (1 - localStrength * 2) + (previous.x + following.x) * localStrength,
          y: point.y * (1 - localStrength * 2) + (previous.y + following.y) * localStrength,
        });
      }
      next.push(current.at(-1));
      current = next;
    }
    return current;
  }

  function roundFreeformCorners(points, amount = 0.22) {
    const source = (points || []).map(freeformPoint).filter(Boolean);
    if (source.length <= 2) return source;
    const cornerAmount = clamp(Number(amount) || 0, 0.08, 0.34);
    const rounded = [source[0]];
    for (let index = 1; index < source.length - 1; index += 1) {
      const previous = source[index - 1];
      const point = source[index];
      const following = source[index + 1];
      rounded.push(
        {
          x: point.x + (previous.x - point.x) * cornerAmount,
          y: point.y + (previous.y - point.y) * cornerAmount,
        },
        {
          x: point.x + (following.x - point.x) * cornerAmount,
          y: point.y + (following.y - point.y) * cornerAmount,
        }
      );
    }
    rounded.push(source.at(-1));
    return rounded;
  }

  function smoothFreeformTurns(points, radius = 24, strength = 0.8) {
    const source = (points || []).map(freeformPoint).filter(Boolean);
    if (source.length <= 2) return source;
    const lookaround = Math.max(1, Number(radius) || 1);
    const blendStrength = clamp(Number(strength) || 0, 0, 0.9);
    const cumulative = [0];
    for (let index = 1; index < source.length; index += 1) {
      cumulative.push(
        cumulative.at(-1) +
          Math.hypot(source[index].x - source[index - 1].x, source[index].y - source[index - 1].y)
      );
    }
    const smoothed = [source[0]];
    for (let index = 1; index < source.length - 1; index += 1) {
      let beforeIndex = index - 1;
      let afterIndex = index + 1;
      while (beforeIndex > 0 && cumulative[index] - cumulative[beforeIndex] < lookaround) {
        beforeIndex -= 1;
      }
      while (
        afterIndex < source.length - 1 &&
        cumulative[afterIndex] - cumulative[index] < lookaround
      ) {
        afterIndex += 1;
      }
      const before = source[beforeIndex];
      const point = source[index];
      const after = source[afterIndex];
      const incoming = { x: point.x - before.x, y: point.y - before.y };
      const outgoing = { x: after.x - point.x, y: after.y - point.y };
      const alignment = clamp(
        (incoming.x * outgoing.x + incoming.y * outgoing.y) /
          Math.max(EPSILON, Math.hypot(incoming.x, incoming.y) * Math.hypot(outgoing.x, outgoing.y)),
        -1,
        1
      );
      const blend = blendStrength * clamp(1 - alignment, 0, 1);
      smoothed.push({
        x: point.x + ((before.x + after.x) / 2 - point.x) * blend,
        y: point.y + ((before.y + after.y) / 2 - point.y) * blend,
      });
    }
    smoothed.push(source.at(-1));
    return smoothed;
  }

  function freeformStrokeTolerance(points, sourceState = state, sourceView = viewState) {
    const length = freeformPathLength(points, false);
    const scale = freeformDrawingScale(sourceState, sourceView);
    const minimum = FREEFORM_DRAW_MIN_TOLERANCE_PX / scale;
    const maximum = FREEFORM_DRAW_MAX_TOLERANCE_PX / scale;
    return clamp(length * FREEFORM_DRAW_RELATIVE_TOLERANCE, minimum, maximum);
  }

  function prepareFreeformStroke(points, sourceState = state, sourceView = viewState) {
    const source = (points || []).map(freeformPoint).filter(Boolean);
    const length = freeformPathLength(source, false);
    if (source.length < 2 || length <= EPSILON) return source;
    const scale = freeformDrawingScale(sourceState, sourceView);
    const sampleSpacing = clamp(
      length / 140,
      FREEFORM_DRAW_MIN_SAMPLE_PX / scale,
      FREEFORM_DRAW_MAX_SAMPLE_PX / scale
    );
    const uniformlySampled = resampleFreeformPoints(source, sampleSpacing);
    const screenLength = length * scale;
    const broadlyRounded = smoothFreeformTurns(
      uniformlySampled,
      28 / Math.max(0.1, scale),
      0.82
    );
    const smoothed = smoothFreeformPoints(
      broadlyRounded,
      screenLength >= 180 ? 4 : 3,
      screenLength >= 480 ? 0.34 : 0.3
    );
    const simplified = simplifyFreeformPoints(
      smoothed,
      freeformStrokeTolerance(smoothed, sourceState, sourceView)
    );
    const controlSpacing = Math.max(sampleSpacing * 1.9, length / 96);
    const rounded = roundFreeformCorners(simplified, screenLength >= 180 ? 0.24 : 0.2);
    return smoothFreeformPoints(resampleFreeformPoints(rounded, controlSpacing), 2, 0.22);
  }

  function sampledFreeformMetricPoints(metric, spacing = FREEFORM_PATH_SAMPLE_SPACING) {
    if (!metric) return [];
    const segmentCount = Math.max(
      metric.closed ? 12 : 1,
      Math.ceil(metric.length / Math.max(1, Number(spacing) || FREEFORM_PATH_SAMPLE_SPACING))
    );
    const count = metric.closed ? segmentCount : segmentCount + 1;
    return Array.from({ length: count }, (_, index) =>
      pointOnFreeformMetric(metric, metric.closed ? index / segmentCount : index / Math.max(1, segmentCount))
    ).map(({ x, y }) => ({ x, y }));
  }

  function freeformControlRecords(path, metric = null) {
    const records = [];
    (path?.points || []).forEach((suppliedPoint, index) => {
      const point = freeformPoint(suppliedPoint);
      if (!point) return;
      const previous = records.at(-1)?.point;
      if (!previous || Math.hypot(point.x - previous.x, point.y - previous.y) > EPSILON) {
        records.push({ index, point, localPosition: 0 });
      }
    });
    if (
      Boolean(path?.closed) &&
      records.length > 2 &&
      Math.hypot(
        records[0].point.x - records.at(-1).point.x,
        records[0].point.y - records.at(-1).point.y
      ) <= EPSILON
    ) {
      records.pop();
    }
    if (!records.length) return records;
    if (metric?.curves?.length) {
      records.forEach((record, index) => {
        if (!metric.closed && index === records.length - 1) record.localPosition = 1;
        else record.localPosition = clamp(
          (metric.curves[index]?.startLength || 0) / Math.max(EPSILON, metric.length),
          0,
          1
        );
      });
      return records;
    }
    const cumulative = [0];
    for (let index = 1; index < records.length; index += 1) {
      cumulative.push(
        cumulative.at(-1) +
          Math.hypot(
            records[index].point.x - records[index - 1].point.x,
            records[index].point.y - records[index - 1].point.y
          )
      );
    }
    const length = Math.max(EPSILON, cumulative.at(-1));
    records.forEach((record, index) => {
      record.localPosition = cumulative[index] / length;
    });
    return records;
  }

  function freeformShapeHandles(pathOrId, sourceState = state) {
    const path = typeof pathOrId === "string" ? freeformPathById(pathOrId, sourceState) : pathOrId;
    if (!path) return [];
    const metric = freeformMetricById(path.id, sourceState);
    const records = freeformControlRecords(path, metric);
    if (!metric) return records;
    const minimumCount = metric?.closed ? 3 : 2;
    const length = Math.max(EPSILON, metric?.length || freeformPathLength(path.points, path.closed));
    const desiredCount = clamp(
      Math.round(length / FREEFORM_SHAPE_HANDLE_SPACING) + (metric?.closed ? 0 : 1),
      minimumCount,
      FREEFORM_MAX_SHAPE_HANDLES
    );
    return Array.from({ length: desiredCount }, (_, index) => {
      const target = metric?.closed ? index / desiredCount : index / Math.max(1, desiredCount - 1);
      const point = pointOnFreeformMetric(metric, target);
      let nearest = records[0] ? { record: records[0], distance: Infinity } : null;
      records.forEach((record) => {
        const directDistance = Math.abs(record.localPosition - target);
        const distance = metric?.closed
          ? Math.min(directDistance, 1 - directDistance)
          : directDistance;
        if (!nearest || distance < nearest.distance) nearest = { record, distance };
      });
      return {
        index: nearest?.record?.index ?? null,
        localPosition: target,
        point: { x: point.x, y: point.y },
        virtual: !nearest || nearest.distance > 1e-6,
      };
    });
  }

  function freeformShapeControlBasis(pathOrId, sourceState = state) {
    const path = typeof pathOrId === "string" ? freeformPathById(pathOrId, sourceState) : pathOrId;
    const metric = path ? freeformMetricById(path.id, sourceState) : null;
    if (!path || !metric) {
      return { points: [], controlPositions: [], materialized: false };
    }
    let intervalCount = clamp(
      Math.ceil(metric.length / FREEFORM_SHAPE_CONTROL_SPACING),
      metric.closed ? 6 : 2,
      metric.closed
        ? FREEFORM_MAX_SHAPE_CONTROL_POINTS
        : FREEFORM_MAX_SHAPE_CONTROL_POINTS - 1
    );
    // An even number of open intervals gives midpoint edits a control exactly
    // at 0.5 while retaining approximately the requested physical spacing.
    if (!metric.closed && intervalCount % 2 !== 0) {
      intervalCount += intervalCount < FREEFORM_MAX_SHAPE_CONTROL_POINTS - 1 ? 1 : -1;
    }
    const targetCount = metric.closed ? intervalCount : intervalCount + 1;
    const points = Array.from({ length: targetCount }, (_, index) => {
      const localPosition = metric.closed
        ? index / targetCount
        : index / Math.max(1, targetCount - 1);
      const point = pointOnFreeformMetric(metric, localPosition);
      return { x: point.x, y: point.y };
    });
    const materialized = points.length !== path.points.length || points.some((point, index) => {
      const existing = freeformPoint(path.points[index]);
      return !existing || Math.hypot(point.x - existing.x, point.y - existing.y) > 1e-6;
    });
    return {
      points,
      controlPositions: Array.from({ length: targetCount }, (_, index) =>
        metric.closed ? index / targetCount : index / Math.max(1, targetCount - 1)
      ),
      materialized,
    };
  }

  function freeformShapeInfluenceFraction(metric, handleCount = null) {
    const count = Math.max(
      metric?.closed ? 3 : 2,
      Number(handleCount) || freeformShapeHandles(metric?.path, state).length || 2
    );
    const intervals = metric?.closed ? count : Math.max(1, count - 1);
    return clamp(2.3 / intervals, 0.1, metric?.closed ? 0.4 : 0.52);
  }

  function reshapeFreeformNeighborhood(
    pathId,
    centerLocalPosition,
    delta,
    {
      sourceState = state,
      originalPoints = null,
      controlPositions = null,
      influenceFraction = null,
    } = {}
  ) {
    const path = freeformPathById(pathId, sourceState);
    let metric = freeformMetricById(pathId, sourceState);
    if (!path || !metric) return false;
    const basis = originalPoints ? null : freeformShapeControlBasis(path, sourceState);
    if (basis?.materialized) {
      path.points = basis.points.map((point) => ({ ...point }));
      invalidateFreeformMetrics(sourceState);
      metric = freeformMetricById(pathId, sourceState);
      if (!metric) return false;
    }
    const baseline = (originalPoints || basis?.points || path.points).map(freeformPoint).filter(Boolean);
    if (baseline.length !== path.points.length) return false;
    const records = freeformControlRecords({ ...path, points: baseline }, metric);
    const positionByIndex = new Map(records.map((record) => [record.index, record.localPosition]));
    let lastPosition = 0;
    const positions = Array.isArray(controlPositions) && controlPositions.length === path.points.length
      ? controlPositions
      : basis?.controlPositions?.length === path.points.length
        ? basis.controlPositions
        : Array.from({ length: path.points.length }, (_, index) => {
            if (positionByIndex.has(index)) lastPosition = positionByIndex.get(index);
            return lastPosition;
          });
    const center = metric.closed
      ? wrapFraction(centerLocalPosition)
      : clamp(Number(centerLocalPosition) || 0, 0, 1);
    const radius = clamp(
      Number(influenceFraction) ||
        freeformShapeInfluenceFraction(metric, freeformShapeHandles(path, sourceState).length),
      0.02,
      metric.closed ? 0.5 : 1
    );
    const dx = Number(delta?.x) || 0;
    const dy = Number(delta?.y) || 0;
    let weights = positions.map((position) => {
      const direct = Math.abs(position - center);
      const distance = metric.closed ? Math.min(direct, 1 - direct) : direct;
      if (distance >= radius) return 0;
      const t = clamp(distance / radius, 0, 1);
      // A raised cosine has zero slope at both ends and produces a broader,
      // more natural bend than point-local dragging.
      return 0.5 + 0.5 * Math.cos(Math.PI * t);
    });
    for (let pass = 0; pass < 3 && weights.length > 2; pass += 1) {
      weights = weights.map((weight, index, values) => {
        if (!metric.closed && (index === 0 || index === values.length - 1)) return weight;
        const previous = values[(index - 1 + values.length) % values.length];
        const next = values[(index + 1) % values.length];
        return previous * 0.18 + weight * 0.64 + next * 0.18;
      });
    }
    const maximumWeight = Math.max(EPSILON, ...weights);
    weights = weights.map((weight) => weight / maximumWeight);

    // A large drag can otherwise move one control past its neighbour and make
    // the centripetal spline double back through a pinched point. Project only
    // dangerous weight changes downward: perpendicular pulls are bounded only
    // for bend smoothness, while motion against the path cannot reverse it.
    const displacementLength = Math.hypot(dx, dy);
    if (displacementLength > EPSILON && weights.length > 1) {
      const edgeCount = metric.closed ? weights.length : weights.length - 1;
      for (let pass = 0; pass < weights.length; pass += 1) {
        let changed = false;
        for (let index = 0; index < edgeCount; index += 1) {
          const nextIndex = (index + 1) % weights.length;
          const baselineX = baseline[nextIndex].x - baseline[index].x;
          const baselineY = baseline[nextIndex].y - baseline[index].y;
          const baselineLengthSquared = baselineX ** 2 + baselineY ** 2;
          if (baselineLengthSquared <= EPSILON) continue;
          const directionalDisplacement = dx * baselineX + dy * baselineY;
          const turnAllowance =
            (2.2 * Math.sqrt(baselineLengthSquared)) / displacementLength;
          let increaseAllowance = turnAllowance;
          let decreaseAllowance = turnAllowance;
          if (directionalDisplacement < -EPSILON) {
            const orderAllowance =
              (0.7 * baselineLengthSquared) / Math.abs(directionalDisplacement);
            increaseAllowance = Math.min(increaseAllowance, orderAllowance);
          } else if (directionalDisplacement > EPSILON) {
            const orderAllowance =
              (0.7 * baselineLengthSquared) / directionalDisplacement;
            decreaseAllowance = Math.min(decreaseAllowance, orderAllowance);
          }
          const difference = weights[nextIndex] - weights[index];
          if (difference > increaseAllowance) {
            weights[nextIndex] = weights[index] + increaseAllowance;
            changed = true;
          } else if (difference < -decreaseAllowance) {
            weights[index] = weights[nextIndex] + decreaseAllowance;
            changed = true;
          }
        }
        if (!changed) break;
      }
    }
    path.points = baseline.map((point, index) => {
      const weight = weights[index];
      return { x: point.x + dx * weight, y: point.y + dy * weight };
    });
    invalidateFreeformMetrics(sourceState);
    ensureFreeformOriginMetadata(sourceState, { preferLocal: true });
    return true;
  }

  function captureFreeformTopology(sourceState = state) {
    if (!freeformGeometry(sourceState)) return { origins: [], cuts: [] };
    ensureFreeformOriginMetadata(sourceState, { preferLocal: true });
    const origins = (sourceState.origins || []).map((origin) => {
      const metric = freeformMetricById(origin.moleculeId, sourceState)
        || freeformMetricAtFraction(origin.startPosition, sourceState);
      const localPosition = metric
        ? Number.isFinite(Number(origin.localPosition))
          ? metric.closed
            ? wrapFraction(origin.localPosition)
            : clamp(Number(origin.localPosition), 0, 1)
          : freeformFractionToLocal(origin.startPosition, metric, sourceState)
        : 0;
      const point = metric ? pointOnFreeformMetric(metric, localPosition) : null;
      return {
        data: { ...origin },
        pathId: metric?.id || origin.moleculeId || null,
        localPosition,
        point: point ? { x: point.x, y: point.y } : null,
        oldSpan: metric?.span || 1,
      };
    });
    const cuts = (sourceState.cuts || []).map((cut) => {
      const range = cutRange(cut);
      const first = freeformPointAtFraction(range.start, sourceState, range.componentId || null);
      const second = freeformPointAtFraction(range.end, sourceState, range.componentId || null);
      return {
        firstPoint: first ? { x: first.x, y: first.y } : null,
        secondPoint: second ? { x: second.x, y: second.y } : null,
        firstPathId: first?.pathId || null,
        secondPathId: second?.pathId || null,
        firstLocalPosition: first?.metric
          ? freeformFractionToLocal(range.start, first.metric, sourceState)
          : null,
        secondLocalPosition: second?.metric
          ? freeformFractionToLocal(range.end, second.metric, sourceState)
          : null,
      };
    });
    return { origins, cuts };
  }

  function topologyProjection(point, preferredPathId, sourceState = state) {
    if (!point) return null;
    // A topology edit can split one path into several pieces. Prefer the old
    // path ID only as a tie-breaker; always allow a newly created sibling to
    // win when it is physically closer, so origins and cuts remain attached to
    // the DNA segment beneath them instead of being discarded or pulled onto
    // the first surviving piece.
    return nearestFreeformProjection(point, sourceState, preferredPathId);
  }

  function restoreFreeformTopology(
    capture,
    sourceState = state,
    {
      removedPathIds = new Set(),
      maximumDistance = Infinity,
      rejectPoint = null,
      preferExistingPaths = true,
    } = {}
  ) {
    invalidateFreeformMetrics(sourceState);
    const metrics = freeformPathMetrics(sourceState);
    if (!metrics.length) {
      sourceState.origins = [];
      sourceState.cuts = [];
      sourceState.selectedOriginId = null;
      sourceState.selectedFork = null;
      sourceState.forkTravel = 0;
      sourceState.progress = 0;
      return { removedOrigins: capture?.origins?.length || 0 };
    }

    const existingById = new Map((sourceState.origins || []).map((origin) => [origin.id, origin]));
    const nextOrigins = [];
    let removedOrigins = 0;
    (capture?.origins || []).forEach((record) => {
      if (removedPathIds.has(record.pathId) || rejectPoint?.(record.point, record)) {
        removedOrigins += 1;
        return;
      }
      const retainedMetric = preferExistingPaths
        ? freeformMetricById(record.pathId, sourceState)
        : null;
      const projection = retainedMetric
        ? null
        : topologyProjection(record.point, record.pathId, sourceState);
      if (!retainedMetric && (!projection || projection.distance > maximumDistance)) {
        removedOrigins += 1;
        return;
      }
      const metric = retainedMetric || projection.metric;
      const candidateLocal = retainedMetric ? record.localPosition : projection.localPosition;
      const localPosition = metric.closed
        ? wrapFraction(candidateLocal)
        : clamp(candidateLocal, 0, 1);
      const globalPosition = metric.start + localPosition * metric.span;
      const scale = metric.span / Math.max(EPSILON, record.oldSpan || metric.span);
      const existing = existingById.get(record.data.id) || record.data;
      nextOrigins.push({
        ...existing,
        id: record.data.id,
        position: globalPosition,
        startPosition: globalPosition,
        moleculeId: metric.id,
        localPosition,
        // Offsets are measured relative to the shared S-phase clock. Scale the
        // signed effective fork travel, not the offset alone, so adding or
        // deleting another component cannot open, close, or retime this one.
        leftOffset:
          (Number(sourceState.forkTravel) + Number(record.data.leftOffset)) * scale -
          Number(sourceState.forkTravel),
        rightOffset:
          (Number(sourceState.forkTravel) + Number(record.data.rightOffset)) * scale -
          Number(sourceState.forkTravel),
      });
    });
    sourceState.origins = nextOrigins.sort((first, second) => first.startPosition - second.startPosition);

    const nextCuts = [];
    (capture?.cuts || []).forEach((record) => {
      if (removedPathIds.has(record.firstPathId) || removedPathIds.has(record.secondPathId)) return;
      const retainedMetric =
        preferExistingPaths &&
        record.firstPathId &&
        record.firstPathId === record.secondPathId
          ? freeformMetricById(record.firstPathId, sourceState)
          : null;
      if (
        retainedMetric &&
        Number.isFinite(Number(record.firstLocalPosition)) &&
        Number.isFinite(Number(record.secondLocalPosition))
      ) {
        const firstLocal = retainedMetric.closed
          ? wrapFraction(record.firstLocalPosition)
          : clamp(record.firstLocalPosition, 0, 1);
        const secondLocal = retainedMetric.closed
          ? wrapFraction(record.secondLocalPosition)
          : clamp(record.secondLocalPosition, 0, 1);
        nextCuts.push({
          start: retainedMetric.start + firstLocal * retainedMetric.span,
          end: retainedMetric.start + secondLocal * retainedMetric.span,
          componentId: retainedMetric.id,
        });
        return;
      }
      const first = topologyProjection(record.firstPoint, record.firstPathId, sourceState);
      const second = topologyProjection(record.secondPoint, record.secondPathId, sourceState);
      if (!first || !second || first.pathId !== second.pathId) return;
      if (first.distance > maximumDistance || second.distance > maximumDistance) return;
      const firstFraction = first.metric.start + first.localPosition * first.metric.span;
      const secondFraction = second.metric.start + second.localPosition * second.metric.span;
      nextCuts.push({
        start: firstFraction,
        end: secondFraction,
        componentId: first.pathId,
      });
    });
    sourceState.cuts = normaliseCutRegions(nextCuts).slice(0, 10);

    if (sourceState.selectedOriginId && !sourceState.origins.some((origin) => origin.id === sourceState.selectedOriginId)) {
      sourceState.selectedOriginId = null;
    }
    if (sourceState.selectedFork && !sourceState.origins.some((origin) => origin.id === sourceState.selectedFork.originId)) {
      sourceState.selectedFork = null;
    }
    reseedNextOriginId(sourceState);
    resetForkPlaybackClock(sourceState);
    synchroniseOriginPositions(sourceState);
    synchroniseSPhaseFromGeometry(getReplicationModelAtTravel(sourceState.forkTravel, sourceState), sourceState);
    return { removedOrigins };
  }

  function normaliseCurrentFreeform(sourceState = state) {
    const selected = freeformEditor.selectedPathId || sourceState.freeform?.selectedPathId;
    sourceState.freeform = normaliseFreeformState(
      { ...(sourceState.freeform || {}), selectedPathId: selected },
      sourceState
    );
    selectFreeformPath(sourceState.freeform.selectedPathId, sourceState);
    invalidateFreeformMetrics(sourceState);
    return sourceState.freeform;
  }

  function freeformEndpointCandidates(sourceState = state) {
    return freeformPathMetrics(sourceState)
      .filter((metric) => !metric.closed)
      .flatMap((metric) => [
        { pathId: metric.id, end: "start", point: pointOnFreeformMetric(metric, 0), metric },
        { pathId: metric.id, end: "end", point: pointOnFreeformMetric(metric, 1), metric },
      ]);
  }

  function sameFreeformEndpoint(first, second) {
    return Boolean(
      first &&
      second &&
      first.pathId === second.pathId &&
      first.end === second.end
    );
  }

  function nearestConnectableFreeformEndpoint(
    point,
    sourceState = state,
    sourceView = viewState,
    { exclude = [] } = {}
  ) {
    if (!point) return null;
    const excluded = Array.isArray(exclude) ? exclude : [exclude];
    const radius = freeformDrawSnapRadius(sourceState, sourceView);
    let nearest = null;
    freeformEndpointCandidates(sourceState).forEach((candidate) => {
      if (excluded.some((endpoint) => sameFreeformEndpoint(endpoint, candidate))) return;
      const distance = Math.hypot(point.x - candidate.point.x, point.y - candidate.point.y);
      if (distance > radius || (nearest && distance >= nearest.distance)) return;
      nearest = { ...candidate, radius, distance, kind: "endpoint" };
    });
    return nearest;
  }

  function freeformDraftSnapCandidate(
    points = freeformEditor.draftPoints,
    sourceState = state,
    sourceView = viewState,
    { startEndpoint = null } = {}
  ) {
    if (!Array.isArray(points) || points.length < 2) {
      return null;
    }
    const last = freeformPoint(points.at(-1));
    if (!last) return null;
    const endpointCandidate = nearestConnectableFreeformEndpoint(
      last,
      sourceState,
      sourceView,
      { exclude: startEndpoint ? [startEndpoint] : [] }
    );
    // The first painted point remains a valid close target even when the
    // stroke began on an existing endpoint. In that case the new loop merely
    // touches the existing component; it does not become part of it.
    const closeCandidate = freeformDraftCloseCandidate(points, sourceState, sourceView);
    if (!closeCandidate) return endpointCandidate;
    const ownStart = {
      ...closeCandidate,
      kind: "self",
      target: closeCandidate.first,
    };
    return !endpointCandidate || ownStart.distance <= endpointCandidate.distance
      ? ownStart
      : endpointCandidate;
  }

  function freeformShapeSnapCandidate(
    pathOrId,
    endpointSide,
    sourceState = state,
    sourceView = viewState
  ) {
    if (!["start", "end"].includes(endpointSide)) {
      return null;
    }
    const path = typeof pathOrId === "string"
      ? freeformPathById(pathOrId, sourceState)
      : pathOrId;
    if (!path || path.closed || path.points.length < 2) return null;
    const movingPoint = endpointSide === "start"
      ? freeformPoint(path.points[0])
      : freeformPoint(path.points.at(-1));
    if (!movingPoint) return null;
    const sourceEndpoint = { pathId: path.id, end: endpointSide };
    const endpointCandidate = nearestConnectableFreeformEndpoint(
      movingPoint,
      sourceState,
      sourceView,
      { exclude: [sourceEndpoint] }
    );
    const closeCandidate = freeformShapeCloseCandidate(
      path,
      endpointSide,
      sourceState,
      sourceView
    );
    const selfCandidate = closeCandidate
      ? {
          ...closeCandidate,
          kind: "self",
          sourceEndpoint,
          targetEndpoint: {
            pathId: path.id,
            end: endpointSide === "start" ? "end" : "start",
          },
        }
      : null;
    const joinCandidate = endpointCandidate
      ? {
          ...endpointCandidate,
          kind: "endpoint",
          endpointSide,
          first: freeformPoint(path.points[0]),
          last: freeformPoint(path.points.at(-1)),
          sourceEndpoint,
          targetEndpoint: { pathId: endpointCandidate.pathId, end: endpointCandidate.end },
          target: endpointCandidate.point,
        }
      : null;
    return !selfCandidate || (joinCandidate && joinCandidate.distance < selfCandidate.distance)
      ? joinCandidate
      : selfCandidate;
  }

  function freeformEraserRadius(value = freeformEditor.eraserRadius) {
    const configured = Number(value);
    return clamp(
      Number.isFinite(configured) ? configured : FREEFORM_ERASER_RADIUS,
      FREEFORM_ERASER_RADIUS_MIN,
      FREEFORM_ERASER_RADIUS_MAX
    );
  }

  function freeformSnapToStartEnabled(sourceState = state) {
    // Closing is proximity-driven now. Keeping this compatibility helper
    // avoids invalidating older saved files that still contain snapToStart.
    return freeformGeometry(sourceState);
  }

  function freeformDrawSnapRadius(sourceState = state, sourceView = viewState) {
    const zoom = Math.max(0.1, Number(sourceView?.zoom) || 1);
    const aspect = Math.sqrt(
      Math.max(EPSILON, artworkAspectX(sourceState) * artworkAspectY(sourceState))
    );
    return FREEFORM_DRAW_CLOSE_SNAP_PX / Math.max(0.1, zoom * aspect);
  }

  function freeformDraftCloseCandidate(
    points = freeformEditor.draftPoints,
    sourceState = state,
    sourceView = viewState
  ) {
    if (!freeformSnapToStartEnabled(sourceState) || !Array.isArray(points) || points.length < 4) {
      return null;
    }
    const first = freeformPoint(points[0]);
    const last = freeformPoint(points.at(-1));
    if (!first || !last) return null;
    const radius = freeformDrawSnapRadius(sourceState, sourceView);
    const distance = Math.hypot(last.x - first.x, last.y - first.y);
    const travelled = freeformPathLength(points, false);
    if (travelled < Math.max(FREEFORM_MIN_PATH_LENGTH * 1.4, radius * 2.5) || distance > radius) {
      return null;
    }
    return { first, last, radius, distance };
  }

  function freeformShapeCloseCandidate(
    pathOrId,
    endpointSide,
    sourceState = state,
    sourceView = viewState
  ) {
    if (!freeformSnapToStartEnabled(sourceState) || !["start", "end"].includes(endpointSide)) {
      return null;
    }
    const path = typeof pathOrId === "string"
      ? freeformPathById(pathOrId, sourceState)
      : pathOrId;
    if (!path || path.closed || path.points.length < 3) return null;
    const first = freeformPoint(path.points[0]);
    const last = freeformPoint(path.points.at(-1));
    if (!first || !last) return null;
    const radius = freeformDrawSnapRadius(sourceState, sourceView);
    const distance = Math.hypot(last.x - first.x, last.y - first.y);
    const travelled = freeformPathLength(path.points, false);
    if (travelled < Math.max(FREEFORM_MIN_PATH_LENGTH * 1.4, radius * 2.5) || distance > radius) {
      return null;
    }
    return {
      first,
      last,
      endpointSide,
      target: endpointSide === "start" ? last : first,
      radius,
      distance,
    };
  }

  function snapFreeformPathEnds(pathOrId, endpointSide, sourceState = state) {
    const path = typeof pathOrId === "string"
      ? freeformPathById(pathOrId, sourceState)
      : pathOrId;
    const candidate = freeformShapeCloseCandidate(path, endpointSide, sourceState, viewState);
    if (!path || !candidate) return false;
    const topologyCapture = captureFreeformTopology(sourceState);
    const forkCapture = captureFreeformForkGeometry(new Set([path.id]), sourceState);
    const previousMetric = freeformMetricById(path.id, sourceState);
    const segments = [{
      pathId: path.id,
      reversed: false,
      arcLength: previousMetric?.length || freeformPathLength(path.points, false) || 1,
    }];
    const previousArcLength = freeformPathLength(path.points, false);
    const previousGenomicLength = freeformPathGenomicLength(path, sourceState);
    const oppositeSide = endpointSide === "start" ? "end" : "start";
    const smoothed = smoothSnappedFreeformEndpoint(
      { pathId: path.id, end: endpointSide },
      { pathId: path.id, end: oppositeSide },
      sourceState
    );
    if (!smoothed) {
      const target = oppositeSide === "start" ? path.points[0] : path.points.at(-1);
      if (!snapFreeformEndpointToPoint(
        { pathId: path.id, end: endpointSide },
        target,
        sourceState
      )) return false;
    }
    if (
      path.points.length > 3 &&
      Math.hypot(
        path.points[0].x - path.points.at(-1).x,
        path.points[0].y - path.points.at(-1).y
      ) <= EPSILON
    ) {
      path.points.pop();
    }
    path.closed = true;
    const nextArcLength = freeformPathLength(path.points, true);
    path.genomicLength = previousArcLength > EPSILON
      ? previousGenomicLength * (nextArcLength / previousArcLength)
      : previousGenomicLength;
    invalidateFreeformMetrics(sourceState);
    normaliseCurrentFreeform(sourceState);
    synchroniseFreeformLengthFromPaths(sourceState);
    restoreFreeformTopology(topologyCapture, sourceState, { preferExistingPaths: false });
    restoreFreeformForkGeometry(forkCapture, path.id, segments, sourceState);
    return true;
  }

  function snapFreeformEndpointToPoint(endpoint, point, sourceState = state) {
    if (!endpoint || !point || !["start", "end"].includes(endpoint.end)) return false;
    const path = freeformPathById(endpoint.pathId, sourceState);
    const target = freeformPoint(point);
    if (!path || path.closed || !target || path.points.length < 2) return false;
    const index = endpoint.end === "start" ? 0 : path.points.length - 1;
    path.points[index] = { x: target.x, y: target.y };
    invalidateFreeformMetrics(sourceState);
    return true;
  }

  function freeformEndpointGeometry(endpoint, sourceState = state) {
    if (!endpoint || !["start", "end"].includes(endpoint.end)) return null;
    const path = freeformPathById(endpoint.pathId, sourceState);
    if (!path || path.closed || path.points.length < 2) return null;
    const endpointIndex = endpoint.end === "start" ? 0 : path.points.length - 1;
    const interiorIndex = endpoint.end === "start" ? 1 : path.points.length - 2;
    const point = freeformPoint(path.points[endpointIndex]);
    const interior = freeformPoint(path.points[interiorIndex]);
    if (!point || !interior) return null;
    const dx = interior.x - point.x;
    const dy = interior.y - point.y;
    const length = Math.hypot(dx, dy);
    if (length <= EPSILON) return null;
    return {
      path,
      endpointIndex,
      interiorIndex,
      point,
      interior,
      length,
      directionX: dx / length,
      directionY: dy / length,
    };
  }

  function alignFreeformEndpointApproach(
    endpoint,
    desiredDirection,
    sourceState = state,
    strength = 1
  ) {
    const source = freeformEndpointGeometry(endpoint, sourceState);
    const desiredLength = Math.hypot(
      Number(desiredDirection?.x) || 0,
      Number(desiredDirection?.y) || 0
    );
    if (!source || desiredLength <= EPSILON) return false;
    const desiredX = desiredDirection.x / desiredLength;
    const desiredY = desiredDirection.y / desiredLength;
    const blend = clamp(Number(strength) || 0, 0, 1);
    const rotation =
      Math.atan2(
        source.directionX * desiredY - source.directionY * desiredX,
        clamp(source.directionX * desiredX + source.directionY * desiredY, -1, 1)
      ) * blend;
    const interiorIndices = endpoint.end === "start"
      ? Array.from({ length: source.path.points.length - 1 }, (_, index) => index + 1)
      : Array.from(
          { length: source.path.points.length - 1 },
          (_, index) => source.path.points.length - 2 - index
        );
    const distances = [];
    let previousPoint = source.point;
    let totalDistance = 0;
    interiorIndices.forEach((index) => {
      const point = freeformPoint(source.path.points[index]);
      totalDistance += point
        ? Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y)
        : 0;
      distances.push(totalDistance);
      if (point) previousPoint = point;
    });
    const firstDistance = distances[0] || source.length;
    const preferredBlendDistance = Math.max(
      firstDistance * 4,
      FREEFORM_SHAPE_CONTROL_SPACING * 4.5,
      Math.abs(rotation) * 80
    );
    const blendDistance = Math.max(
      firstDistance,
      Math.min(totalDistance * 0.48, preferredBlendDistance)
    );
    interiorIndices.forEach((index, orderIndex) => {
      const point = freeformPoint(source.path.points[index]);
      if (!point) return;
      const distance = distances[orderIndex];
      const progress = orderIndex === 0
        ? 0
        : (distance - firstDistance) /
          Math.max(EPSILON, blendDistance - firstDistance);
      const localRotation = distance <= blendDistance + EPSILON
        ? rotation * (1 - smoothstep(progress))
        : 0;
      if (Math.abs(localRotation) <= EPSILON) return;
      const cosine = Math.cos(localRotation);
      const sine = Math.sin(localRotation);
      const offsetX = point.x - source.point.x;
      const offsetY = point.y - source.point.y;
      source.path.points[index] = {
        x: source.point.x + offsetX * cosine - offsetY * sine,
        y: source.point.y + offsetX * sine + offsetY * cosine,
      };
    });
    if (interiorIndices.length) {
      // Keep the first spline tangent exact even when the source was so short
      // that the rest of the transition had to use nearly all of the path.
      const nearestIndex = interiorIndices[0];
      const nearest = freeformPoint(source.path.points[nearestIndex]);
      const nearestLength = nearest
        ? Math.hypot(nearest.x - source.point.x, nearest.y - source.point.y)
        : source.length;
      const directionAngle = Math.atan2(source.directionY, source.directionX) + rotation;
      source.path.points[nearestIndex] = {
        x: source.point.x + Math.cos(directionAngle) * nearestLength,
        y: source.point.y + Math.sin(directionAngle) * nearestLength,
      };
    }
    invalidateFreeformMetrics(sourceState);
    return true;
  }

  function smoothSnappedFreeformEndpoint(
    sourceEndpoint,
    targetEndpoint,
    sourceState = state,
    strength = 1
  ) {
    if (
      !sourceEndpoint ||
      !targetEndpoint ||
      (sourceEndpoint.pathId === targetEndpoint.pathId && sourceEndpoint.end === targetEndpoint.end)
    ) {
      return false;
    }
    const uniquePathIds = new Set([sourceEndpoint.pathId, targetEndpoint.pathId]);
    for (const pathId of uniquePathIds) {
      const path = freeformPathById(pathId, sourceState);
      if (!path) return false;
      const basis = freeformShapeControlBasis(path, sourceState);
      if (basis.materialized) {
        path.points = basis.points.map((point) => ({ ...point }));
        invalidateFreeformMetrics(sourceState);
      }
    }

    const source = freeformEndpointGeometry(sourceEndpoint, sourceState);
    const target = freeformEndpointGeometry(targetEndpoint, sourceState);
    if (!source || !target) return false;
    let sharedX = source.directionX - target.directionX;
    let sharedY = source.directionY - target.directionY;
    let sharedLength = Math.hypot(sharedX, sharedY);
    if (sharedLength <= EPSILON) {
      const bridgeX = target.point.x - source.point.x;
      const bridgeY = target.point.y - source.point.y;
      const bridgeLength = Math.hypot(bridgeX, bridgeY);
      if (bridgeLength > EPSILON) {
        sharedX = -bridgeX / bridgeLength;
        sharedY = -bridgeY / bridgeLength;
      } else {
        // Coincident ends pointing into the same half-plane need a U-turn.
        // Split it evenly instead of rotating one whole side by 180 degrees.
        sharedX = -source.directionY;
        sharedY = source.directionX;
      }
      sharedLength = 1;
    }
    const sharedDirection = {
      x: sharedX / sharedLength,
      y: sharedY / sharedLength,
    };

    if (!snapFreeformEndpointToPoint(sourceEndpoint, target.point, sourceState)) return false;
    const sourceAligned = alignFreeformEndpointApproach(
      sourceEndpoint,
      sharedDirection,
      sourceState,
      strength
    );
    const targetAligned = alignFreeformEndpointApproach(
      targetEndpoint,
      { x: -sharedDirection.x, y: -sharedDirection.y },
      sourceState,
      strength
    );
    if (!sourceAligned || !targetAligned) return false;
    snapFreeformEndpointToPoint(sourceEndpoint, target.point, sourceState);

    const alignedSource = freeformEndpointGeometry(sourceEndpoint, sourceState);
    const alignedTarget = freeformEndpointGeometry(targetEndpoint, sourceState);
    if (alignedSource && alignedTarget) {
      // Equal first handles make the merged Catmull-Rom span locally
      // symmetric. This preserves the shared tangent without leaving a tiny
      // curvature dent when the two source paths used different sampling.
      const handleLength = Math.min(alignedSource.length, alignedTarget.length);
      const joinPoint = alignedTarget.point;
      alignedSource.path.points[alignedSource.interiorIndex] = {
        x: joinPoint.x + sharedDirection.x * handleLength,
        y: joinPoint.y + sharedDirection.y * handleLength,
      };
      alignedTarget.path.points[alignedTarget.interiorIndex] = {
        x: joinPoint.x - sharedDirection.x * handleLength,
        y: joinPoint.y - sharedDirection.y * handleLength,
      };
      invalidateFreeformMetrics(sourceState);
    }
    ensureFreeformOriginMetadata(sourceState, { preferLocal: true });
    return true;
  }

  function freeformTotalArcLength(sourceState = state) {
    return freeformPathMetrics(sourceState).reduce((total, metric) => total + metric.length, 0);
  }

  function captureFreeformLengthDensity(sourceState = state) {
    const metrics = freeformPathMetrics(sourceState);
    return {
      arcLength: metrics.reduce((total, metric) => total + metric.length, 0),
      genomicLength: metrics.reduce(
        (total, metric) => total + freeformComponentLength(metric, sourceState),
        0
      ),
      paths: metrics.map((metric) => ({
        id: metric.id,
        arcLength: metric.length,
        genomicLength: freeformComponentLength(metric, sourceState),
      })),
    };
  }

  function updateFreeformPathLengthFromDensity(pathId, capture, sourceState = state) {
    if (!freeformGeometry(sourceState)) return false;
    const path = freeformPathById(pathId, sourceState);
    const previous = (capture?.paths || []).find((record) => record.id === pathId);
    if (!path || !previous || !(previous.arcLength > EPSILON)) return false;

    invalidateFreeformMetrics(sourceState);
    const metric = freeformMetricById(pathId, sourceState);
    if (!metric || !(metric.length > EPSILON)) return false;
    const density = Math.max(EPSILON, Number(previous.genomicLength) || 0) / previous.arcLength;
    path.genomicLength = Math.max(EPSILON, metric.length * density);
    sourceState.advanced = {
      ...DEFAULTS.advanced,
      ...(sourceState.advanced || {}),
      lengthMode: "scale",
    };
    synchroniseFreeformLengthFromPaths(sourceState);
    ensureFreeformOriginMetadata(sourceState, { preferLocal: true });
    resetForkPlaybackClock(sourceState);
    return true;
  }

  function updateFreeformLengthAfterTopologyChange(capture, sourceState = state) {
    if (!freeformGeometry(sourceState)) return sourceState?.length;
    invalidateFreeformMetrics(sourceState);
    const previousById = new Map(
      (capture?.paths || []).map((record) => [record.id, record])
    );
    const previousArcLength = Math.max(0, Number(capture?.arcLength) || 0);
    const previousGenomicLength = Math.max(
      EPSILON,
      Number(capture?.genomicLength) || Number(sourceState.length) || DEFAULTS.length
    );
    const fallbackDensity = previousArcLength > EPSILON
      ? previousGenomicLength / previousArcLength
      : DEFAULTS.length / BASE_MOLECULE_WIDTH;

    (sourceState.freeform?.paths || []).forEach((path) => {
      const configured = Number(path.genomicLength);
      if (Number.isFinite(configured) && configured > EPSILON) return;
      const arcLength = freeformPathLength(path.points, path.closed);
      const previous = previousById.get(path.id);
      const density = previous?.arcLength > EPSILON
        ? previous.genomicLength / previous.arcLength
        : fallbackDensity;
      path.genomicLength = Math.max(EPSILON, arcLength * density);
    });

    sourceState.advanced = {
      ...DEFAULTS.advanced,
      ...(sourceState.advanced || {}),
      lengthMode: "scale",
    };
    synchroniseFreeformLengthFromPaths(sourceState);
    resetForkPlaybackClock(sourceState);
    return sourceState.length;
  }

  function syncFreeformEditorFromState(sourceState = state, { resetTool = false } = {}) {
    if (resetTool || !FREEFORM_TOOLS.has(freeformEditor.tool)) {
      freeformEditor.tool = freeformGeometry(sourceState) ? "draw" : "edit";
    }
    freeformEditor.draftPoints = [];
    freeformEditor.eraserPoints = [];
    freeformEditor.eraserRadius = freeformEraserRadius();
    freeformEditor.hoverPoint = null;
    freeformEditor.hoverEndpoint = null;
    const selectedId = sourceState?.freeform?.selectedPathId || sourceState?.freeform?.paths?.[0]?.id || null;
    freeformEditor.selectedPathId = freeformPathById(selectedId, sourceState)?.id || null;
    if (sourceState?.freeform) sourceState.freeform.selectedPathId = freeformEditor.selectedPathId;
    return freeformEditor;
  }

  function updateFreeformToolbar() {
    const enabled = freeformGeometry();
    if (elements.freeformTools) elements.freeformTools.hidden = !enabled;
    elements.canvasFrame?.classList.toggle("is-freeform-geometry", enabled);
    if (!enabled) {
      if (elements.canvas) delete elements.canvas.dataset.freeformTool;
      if (elements.freeformEraserSize) elements.freeformEraserSize.hidden = true;
      return;
    }
    if (!FREEFORM_TOOLS.has(freeformEditor.tool)) freeformEditor.tool = "draw";
    if (!freeformPathById(freeformEditor.selectedPathId)) {
      selectFreeformPath(state.freeform?.selectedPathId || state.freeform?.paths?.[0]?.id || null);
    }
    if (elements.canvas) elements.canvas.dataset.freeformTool = freeformEditor.tool;
    const controls = {
      edit: elements.freeformEditButton,
      select: elements.freeformSelectButton,
      draw: elements.freeformDrawButton,
      erase: elements.freeformEraseButton,
    };
    Object.entries(controls).forEach(([tool, control]) => {
      control?.setAttribute("aria-pressed", String(freeformEditor.tool === tool));
    });
    const eraserRadius = freeformEraserRadius();
    const eraserDiameter = Math.round(eraserRadius * 2);
    freeformEditor.eraserRadius = eraserRadius;
    if (elements.freeformEraserSize) {
      elements.freeformEraserSize.hidden = freeformEditor.tool !== "erase";
    }
    if (elements.freeformEraserSizeControl) {
      elements.freeformEraserSizeControl.value = String(eraserRadius);
      elements.freeformEraserSizeControl.setAttribute(
        "aria-valuetext",
        `${eraserDiameter} px diameter`
      );
    }
    if (elements.freeformEraserSizeOutput) {
      elements.freeformEraserSizeOutput.textContent = `${eraserDiameter} px`;
    }
    if (elements.freeformDeletePathButton) {
      elements.freeformDeletePathButton.disabled = !(state.freeform?.paths?.length > 0);
    }
  }

  function setFreeformTool(tool, { announce = true } = {}) {
    if (!FREEFORM_TOOLS.has(tool)) return false;
    freeformEditor.tool = tool;
    freeformEditor.draftPoints = [];
    freeformEditor.eraserPoints = [];
    freeformEditor.hoverPoint = null;
    freeformEditor.hoverEndpoint = null;
    if (tool !== "edit") {
      state.selectedOriginId = null;
      state.selectedFork = null;
      stopAnimation();
    }
    updateFreeformToolbar();
    hideContextAction();
    render();
    if (announce) {
      const labels = {
        edit: "DNA tools active",
        select: "Shape tool active — drag a DNA piece to reshape it",
        draw: "Paint tool active — drag to paint a DNA piece",
        erase: "Eraser active — drag across DNA to remove or split it",
      };
      setStatus(labels[tool]);
    }
    return true;
  }

  function renderFreeformEditorOverlay() {
    if (!freeformGeometry()) return "";
    const selected = selectedFreeformPath();
    const paths = [];
    if (selected && freeformEditor.tool === "select") {
      paths.push(
        `<path class="rs-freeform-selection-path" d="${freeformSplinePathD(selected)}"/>`
      );
    }

    const handles = [];
    if (selected && freeformEditor.tool === "select") {
      freeformShapeHandles(selected).forEach(({ point }) => {
        handles.push(
          `<circle class="rs-freeform-control-point" cx="${precise(point.x)}" cy="${precise(
            point.y
          )}" r="3.2"/>`
        );
      });
    }
    if (selected && !selected.closed && freeformEditor.tool === "select") {
      const first = selected.points[0];
      const last = selected.points.at(-1);
      handles.push(
        `<circle class="rs-freeform-endpoint" cx="${precise(first.x)}" cy="${precise(first.y)}" r="5"/>`,
        `<circle class="rs-freeform-endpoint" cx="${precise(last.x)}" cy="${precise(last.y)}" r="5"/>`
      );
    }
    const snapGuides = [];
    if (["draw", "select"].includes(freeformEditor.tool)) {
      const activeCandidate =
        dragState?.snapCandidate ||
        dragState?.closeCandidate ||
        (dragState?.role === "freeform-draw" && freeformEditor.draftPoints.length < 2
          ? dragState.startEndpoint
          : null) ||
        (!dragState && freeformEditor.tool === "draw"
          ? freeformEditor.hoverEndpoint
          : null);
      const guideRadius = freeformDrawSnapRadius() * 0.3;
      const endpointGroups = [];
      freeformEndpointCandidates().forEach((candidate) => {
        const group = endpointGroups.find(
          (entry) => Math.hypot(
            entry.point.x - candidate.point.x,
            entry.point.y - candidate.point.y
          ) <= 0.05
        );
        if (group) group.candidates.push(candidate);
        else endpointGroups.push({ point: candidate.point, candidates: [candidate] });
      });
      endpointGroups.forEach((group) => {
        const active = group.candidates.some((candidate) => activeCandidate?.targetEndpoint
          ? sameFreeformEndpoint(activeCandidate.targetEndpoint, candidate)
          : activeCandidate?.pathId === candidate.pathId && activeCandidate?.end === candidate.end);
        snapGuides.push(
          `<circle class="rs-freeform-connectable-endpoint${active ? " is-active" : ""}" cx="${precise(
            group.point.x
          )}" cy="${precise(group.point.y)}" r="${fixed(
            guideRadius * (active ? 1.2 : 1)
          )}"/>`
        );
      });
    }

    const previews = [];
    if (freeformEditor.draftPoints.length) {
      const hasStroke = freeformEditor.draftPoints.length > 1;
      const snapCandidate = hasStroke
        ? dragState?.role === "freeform-draw"
          ? dragState.snapCandidate || freeformDraftSnapCandidate(
              freeformEditor.draftPoints,
              state,
              viewState,
              { startEndpoint: dragState.startEndpoint || null }
            )
          : freeformDraftSnapCandidate()
        : null;
      const previewPoints = freeformEditor.draftPoints.map((point) => ({ ...point }));
      const target = snapCandidate?.target || snapCandidate?.point || null;
      if (target && previewPoints.length) previewPoints[previewPoints.length - 1] = { x: target.x, y: target.y };
      const closes = snapCandidate?.kind === "self";
      const preparedPreview = hasStroke
        ? prepareFreeformStroke(previewPoints, state, viewState)
        : previewPoints;
      const displayPoints = preparedPreview.length ? preparedPreview : previewPoints;
      if (hasStroke) {
        previews.push(
          `<path class="rs-freeform-draft-path${closes ? " is-closing" : snapCandidate ? " is-snapping" : ""}" d="${freeformSplinePathD({
            points: displayPoints,
            closed: closes,
          })}"/>`
        );
      }
      const draftRadius = Math.max(4.5, freeformDrawSnapRadius() * 0.3);
      const firstPoint = displayPoints[0];
      const lastPoint = displayPoints.at(-1);
      previews.push(
        `<circle class="rs-freeform-draft-endpoint is-start" cx="${precise(
          firstPoint.x
        )}" cy="${precise(firstPoint.y)}" r="${fixed(draftRadius)}"/>`
      );
      if (Math.hypot(lastPoint.x - firstPoint.x, lastPoint.y - firstPoint.y) > EPSILON) {
        previews.push(
          `<circle class="rs-freeform-draft-endpoint is-current" cx="${precise(
            lastPoint.x
          )}" cy="${precise(lastPoint.y)}" r="${fixed(draftRadius)}"/>`
        );
      }
      if (snapCandidate && target) {
        const rawLast = freeformEditor.draftPoints.at(-1);
        previews.push(
          `<line class="rs-freeform-close-preview" x1="${precise(rawLast.x)}" y1="${precise(
            rawLast.y
          )}" x2="${precise(target.x)}" y2="${precise(target.y)}"/>`,
          `<circle class="rs-freeform-close-snap-target" cx="${precise(
            target.x
          )}" cy="${precise(target.y)}" r="${fixed(
            Math.max(5, snapCandidate.radius * 0.44)
          )}"/>`
        );
      }
    }
    const shapeCloseCandidate =
      dragState?.role === "freeform-shape" ? dragState.closeCandidate : null;
    if (shapeCloseCandidate) {
      const sourcePoint = shapeCloseCandidate.endpointSide === "start"
        ? shapeCloseCandidate.first
        : shapeCloseCandidate.last;
      const targetPoint = shapeCloseCandidate.target || shapeCloseCandidate.point;
      previews.push(
        `<line class="rs-freeform-close-preview" x1="${precise(
          sourcePoint.x
        )}" y1="${precise(sourcePoint.y)}" x2="${precise(
          targetPoint.x
        )}" y2="${precise(targetPoint.y)}"/>`,
        `<circle class="rs-freeform-close-snap-target" cx="${precise(
          targetPoint.x
        )}" cy="${precise(targetPoint.y)}" r="${fixed(
          Math.max(5, shapeCloseCandidate.radius * 0.44)
        )}"/>`
      );
    }
    const eraserRadius = freeformEraserRadius();
    if (freeformEditor.eraserPoints.length > 1) {
      const eraserPath = rawFreeformPathD({
        points: freeformEditor.eraserPoints,
        closed: false,
      });
      previews.push(
        `<path class="rs-freeform-eraser-mark" d="${eraserPath}" stroke-width="${fixed(
          eraserRadius * 2
        )}"/>`,
        `<path class="rs-freeform-eraser-stroke" d="${eraserPath}"/>`
      );
    } else if (freeformEditor.eraserPoints.length === 1) {
      const point = freeformEditor.eraserPoints[0];
      previews.push(
        `<circle class="rs-freeform-eraser-mark rs-freeform-eraser-dot" cx="${precise(
          point.x
        )}" cy="${precise(point.y)}" r="${fixed(eraserRadius)}"/>`
      );
    }
    const eraserPoint =
      freeformEditor.tool === "erase"
        ? freeformEditor.eraserPoints.at(-1) || freeformEditor.hoverPoint
        : null;
    if (eraserPoint) {
      previews.push(
        `<circle class="rs-freeform-eraser-ring" cx="${precise(eraserPoint.x)}" cy="${precise(
          eraserPoint.y
        )}" r="${fixed(eraserRadius)}"/>`
      );
    }
    return `<g class="rs-freeform-selection rs-ui-only" aria-label="Free-form DNA editor">${paths.join(
      ""
    )}${snapGuides.join("")}${handles.join("")}${previews.join("")}</g>`;
  }

  function addFreeformPath(points, sourceState = state, { closed = false } = {}) {
    const lengthCapture = captureFreeformLengthDensity(sourceState);
    const closeCandidate = closed
      ? freeformDraftCloseCandidate(points, sourceState, viewState)
      : null;
    const simplified = prepareFreeformStroke(points, sourceState, viewState);
    const shouldClose = Boolean(closed && closeCandidate && simplified.length > 2);
    if (shouldClose) {
      const trimRadius = Math.max(2, closeCandidate.radius * 0.42);
      while (
        simplified.length > 3 &&
        Math.hypot(
          simplified.at(-1).x - simplified[0].x,
          simplified.at(-1).y - simplified[0].y
        ) <= trimRadius
      ) {
        simplified.pop();
      }
    }
    if (
      simplified.length < (shouldClose ? 3 : 2) ||
      freeformPathLength(simplified, shouldClose) < FREEFORM_MIN_PATH_LENGTH ||
      (sourceState.freeform?.paths?.length || 0) >= 128
    ) {
      return null;
    }
    const capture = captureFreeformTopology(sourceState);
    const newArcLength = freeformPathLength(simplified, shouldClose);
    const density = lengthCapture.arcLength > EPSILON
      ? lengthCapture.genomicLength / lengthCapture.arcLength
      : DEFAULTS.length / BASE_MOLECULE_WIDTH;
    const path = {
      id: nextAvailableFreeformPathId(sourceState),
      points: simplified,
      closed: false,
      genomicLength: Math.max(EPSILON, newArcLength * density),
    };
    sourceState.freeform.paths.push(path);
    selectFreeformPath(path.id, sourceState);
    if (shouldClose) {
      const smoothed = smoothSnappedFreeformEndpoint(
        { pathId: path.id, end: "end" },
        { pathId: path.id, end: "start" },
        sourceState
      );
      if (
        smoothed &&
        path.points.length > 3 &&
        Math.hypot(
          path.points[0].x - path.points.at(-1).x,
          path.points[0].y - path.points.at(-1).y
        ) <= EPSILON
      ) {
        path.points.pop();
      }
      path.closed = true;
      path.genomicLength = Math.max(
        EPSILON,
        freeformPathLength(path.points, true) * density
      );
      invalidateFreeformMetrics(sourceState);
    }
    normaliseCurrentFreeform(sourceState);
    restoreFreeformTopology(capture, sourceState);
    updateFreeformLengthAfterTopologyChange(lengthCapture, sourceState);
    selectFreeformPath(path.id, sourceState);
    return path;
  }

  function addConnectedFreeformStroke(
    points,
    sourceState = state,
    { startEndpoint = null, snapCandidate = null } = {}
  ) {
    const prepared = (points || []).map(freeformPoint).filter(Boolean);
    if (prepared.length < 2) return null;
    if (startEndpoint?.point) prepared[0] = { ...startEndpoint.point };
    const targetPoint = snapCandidate?.target || snapCandidate?.point || null;
    if (targetPoint) prepared[prepared.length - 1] = { x: targetPoint.x, y: targetPoint.y };
    const closesOwnStroke = snapCandidate?.kind === "self";
    const path = addFreeformPath(prepared, sourceState, { closed: closesOwnStroke });
    if (!path) return null;
    const created = freeformPathById(path.id, sourceState) || path;
    if (closesOwnStroke) return created;
    let joinedAtStart = false;
    if (startEndpoint) {
      joinedAtStart = joinFreeformEndpoints(
        { pathId: created.id, end: "start" },
        { pathId: startEndpoint.pathId, end: startEndpoint.end },
        sourceState
      );
    }
    if (snapCandidate?.kind === "endpoint") {
      const sourceEnd = joinedAtStart ? "start" : "end";
      const targetEndpoint = freeformPathById(snapCandidate.pathId, sourceState)
        ? { pathId: snapCandidate.pathId, end: snapCandidate.end }
        : startEndpoint?.pathId === snapCandidate.pathId
          ? { pathId: created.id, end: "end" }
          : null;
      if (
        targetEndpoint &&
        !sameFreeformEndpoint({ pathId: created.id, end: sourceEnd }, targetEndpoint)
      ) {
        joinFreeformEndpoints(
          { pathId: created.id, end: sourceEnd },
          targetEndpoint,
          sourceState
        );
      }
    }

    selectFreeformPath(created.id, sourceState);
    return freeformPathById(created.id, sourceState) || created;
  }

  function eraseFreeformPaths(strokePoints, radius = FREEFORM_ERASER_RADIUS, sourceState = state) {
    const stroke = (strokePoints || []).map(freeformPoint).filter(Boolean);
    if (!stroke.length) return { changed: false, removedOrigins: 0 };
    const lengthCapture = captureFreeformLengthDensity(sourceState);
    const capture = captureFreeformTopology(sourceState);
    const oldMetrics = freeformPathMetrics(sourceState);
    const nextPaths = [];
    const removedPathIds = new Set();
    let changed = false;

    oldMetrics.forEach((metric) => {
      const samples = sampledFreeformMetricPoints(metric, Math.max(2.5, radius / 5));
      if (samples.length < 2) return;
      const erased = samples.map((point) => distancePointToPolyline(point, stroke) <= radius);
      if (!erased.some(Boolean)) {
        nextPaths.push({
          id: metric.id,
          points: metric.path.points.map((point) => ({ ...point })),
          closed: metric.closed,
          genomicLength: freeformComponentLength(metric, sourceState),
        });
        return;
      }
      changed = true;
      removedPathIds.add(metric.id);
      const runs = [];
      if (metric.closed) {
        const firstErased = erased.findIndex(Boolean);
        const rotatedPoints = [];
        const rotatedErased = [];
        for (let offset = 1; offset <= samples.length; offset += 1) {
          const index = (firstErased + offset) % samples.length;
          rotatedPoints.push(samples[index]);
          rotatedErased.push(erased[index]);
        }
        let run = [];
        rotatedPoints.forEach((point, index) => {
          if (rotatedErased[index]) {
            if (run.length) runs.push(run);
            run = [];
          } else {
            run.push(point);
          }
        });
        if (run.length) runs.push(run);
      } else {
        let run = [];
        samples.forEach((point, index) => {
          if (erased[index]) {
            if (run.length) runs.push(run);
            run = [];
          } else {
            run.push(point);
          }
        });
        if (run.length) runs.push(run);
      }

      let reusedId = false;
      runs.forEach((run) => {
        const simplified = simplifyFreeformPoints(run, 0.9);
        if (simplified.length < 2 || freeformPathLength(simplified, false) < FREEFORM_MIN_PATH_LENGTH) return;
        const id = reusedId ? nextAvailableFreeformPathId(sourceState) : metric.id;
        reusedId = true;
        const survivingArcLength = freeformPathLength(simplified, false);
        nextPaths.push({
          id,
          points: simplified,
          closed: false,
          genomicLength:
            freeformComponentLength(metric, sourceState) *
            (survivingArcLength / Math.max(EPSILON, metric.length)),
        });
      });
      if (reusedId) removedPathIds.delete(metric.id);
    });

    if (!changed) return { changed: false, removedOrigins: 0 };
    sourceState.freeform.paths = nextPaths;
    sourceState.freeform.selectedPathId = nextPaths.find((path) => path.id === freeformEditor.selectedPathId)?.id
      || nextPaths[0]?.id
      || null;
    normaliseCurrentFreeform(sourceState);
    const result = restoreFreeformTopology(capture, sourceState, {
      removedPathIds,
      maximumDistance: radius * 2.25,
      rejectPoint: (point) => point && distancePointToPolyline(point, stroke) <= radius,
      preferExistingPaths: false,
    });
    updateFreeformLengthAfterTopologyChange(lengthCapture, sourceState);
    return { changed: true, ...result };
  }

  function captureFreeformForkGeometry(pathIds, sourceState = state) {
    const included = pathIds instanceof Set ? pathIds : new Set(pathIds || []);
    if (!included.size || !sourceState.origins?.length) return [];
    const metrics = new Map(
      freeformPathMetrics(sourceState).map((metric) => [metric.id, metric])
    );
    const model = getFreeformReplicationModelAtTravel(sourceState.forkTravel, sourceState);
    return model.origins
      .filter((descriptor) => included.has(descriptor.componentId))
      .map((descriptor) => {
        const metric = metrics.get(descriptor.componentId);
        if (!metric) return null;
        const stored = sourceState.origins.find((origin) => origin.id === descriptor.id);
        const leftOffset = Number(stored?.leftOffset) || 0;
        const rightOffset = Number(stored?.rightOffset) || 0;
        const travel = Number(sourceState.forkTravel) || 0;
        const pointRecord = (localPosition) => {
          const local = metric.closed
            ? wrapFraction(localPosition)
            : clamp(Number(localPosition) || 0, 0, 1);
          const point = pointOnFreeformMetric(metric, local);
          return {
            localPosition: local,
            point: point ? { x: point.x, y: point.y } : null,
          };
        };
        return {
          id: descriptor.id,
          pathId: metric.id,
          origin: pointRecord(descriptor.localStartPosition),
          left: {
            ...pointRecord(descriptor.localLeftPosition),
            offset: leftOffset,
            started: travel + leftOffset > EPSILON,
            side: "left",
          },
          right: {
            ...pointRecord(descriptor.localRightPosition),
            offset: rightOffset,
            started: travel + rightOffset > EPSILON,
            side: "right",
          },
        };
      })
      .filter(Boolean);
  }

  function joinedReferenceLocal(pathId, localPosition, segments) {
    const totalLength = Math.max(
      EPSILON,
      segments.reduce((total, segment) => total + segment.arcLength, 0)
    );
    let offset = 0;
    for (const segment of segments) {
      if (segment.pathId === pathId) {
        const local = clamp(Number(localPosition) || 0, 0, 1);
        const orientedLocal = segment.reversed ? 1 - local : local;
        return clamp((offset + orientedLocal * segment.arcLength) / totalLength, 0, 1);
      }
      offset += segment.arcLength;
    }
    return 0;
  }

  function joinedGeometryLocal(record, metric, segments) {
    const reference = joinedReferenceLocal(record.pathId, record.localPosition, segments);
    const segment = segments.find((candidate) => candidate.pathId === record.pathId);
    const totalLength = Math.max(
      EPSILON,
      segments.reduce((total, candidate) => total + candidate.arcLength, 0)
    );
    const localWindow = Math.max(
      0.08,
      ((segment?.arcLength || totalLength) / totalLength) * 0.24
    );
    const projection = record.point
      ? projectPointToFreeformMetric(record.point, metric, Infinity, {
          referenceLocalPosition: reference,
          maximumLocalDelta: localWindow,
        })
      : null;
    return metric.closed
      ? wrapFraction(projection?.localPosition ?? reference)
      : clamp(projection?.localPosition ?? reference, 0, 1);
  }

  function restoreFreeformForkGeometry(capture, mergedPathId, segments, sourceState = state) {
    if (!capture?.length) return;
    invalidateFreeformMetrics(sourceState);
    const metric = freeformMetricById(mergedPathId, sourceState);
    if (!metric) return;
    const records = new Map(capture.map((record) => [record.id, record]));
    const travel = Number(sourceState.forkTravel) || 0;

    sourceState.origins.forEach((origin) => {
      const record = records.get(origin.id);
      if (!record) return;
      const originLocal = joinedGeometryLocal(
        { ...record.origin, pathId: record.pathId },
        metric,
        segments
      );
      const projectedLeft = {
        ...record.left,
        localPosition: joinedGeometryLocal(
          { ...record.left, pathId: record.pathId },
          metric,
          segments
        ),
      };
      const projectedRight = {
        ...record.right,
        localPosition: joinedGeometryLocal(
          { ...record.right, pathId: record.pathId },
          metric,
          segments
        ),
      };
      let leftDistance;
      let rightDistance;
      let nextLeftOffset;
      let nextRightOffset;

      if (metric.closed) {
        leftDistance = clockwiseFractionDistance(projectedLeft.localPosition, originLocal) * metric.span;
        rightDistance = clockwiseFractionDistance(originLocal, projectedRight.localPosition) * metric.span;
        nextLeftOffset = projectedLeft.started ? leftDistance - travel : projectedLeft.offset;
        nextRightOffset = projectedRight.started ? rightDistance - travel : projectedRight.offset;
      } else {
        const sidesSwapped =
          segments.find((segment) => segment.pathId === record.pathId)?.reversed === true;
        const nextLeft = sidesSwapped ? projectedRight : projectedLeft;
        const nextRight = sidesSwapped ? projectedLeft : projectedRight;
        const leftLocal = Math.min(originLocal, nextLeft.localPosition);
        const rightLocal = Math.max(originLocal, nextRight.localPosition);
        leftDistance = (originLocal - leftLocal) * metric.span;
        rightDistance = (rightLocal - originLocal) * metric.span;
        nextLeftOffset = nextLeft.started ? leftDistance - travel : nextLeft.offset;
        nextRightOffset = nextRight.started ? rightDistance - travel : nextRight.offset;
        if (sidesSwapped && sourceState.selectedFork?.originId === origin.id) {
          sourceState.selectedFork.side = sourceState.selectedFork.side === "left" ? "right" : "left";
        }
      }

      const globalPosition = metric.start + originLocal * metric.span;
      origin.position = globalPosition;
      origin.startPosition = globalPosition;
      origin.moleculeId = metric.id;
      origin.localPosition = originLocal;
      origin.leftOffset = nextLeftOffset;
      origin.rightOffset = nextRightOffset;
    });

    sourceState.origins.sort((first, second) => first.startPosition - second.startPosition);
    reseedNextOriginId(sourceState);
    resetForkPlaybackClock(sourceState);
    synchroniseOriginPositions(sourceState);
    synchroniseSPhaseFromGeometry(
      getReplicationModelAtTravel(sourceState.forkTravel, sourceState),
      sourceState
    );
  }

  function joinFreeformEndpoints(firstEndpoint, secondEndpoint, sourceState = state) {
    if (!firstEndpoint || !secondEndpoint) return false;
    const firstPath = freeformPathById(firstEndpoint.pathId, sourceState);
    const secondPath = freeformPathById(secondEndpoint.pathId, sourceState);
    if (!firstPath || !secondPath || firstPath.closed || secondPath.closed) return false;
    if (
      !["start", "end"].includes(firstEndpoint.end) ||
      !["start", "end"].includes(secondEndpoint.end)
    ) {
      return false;
    }
    if (
      firstPath.id === secondPath.id &&
      (firstEndpoint.end === secondEndpoint.end || firstPath.points.length < 3)
    ) {
      return false;
    }
    const capture = captureFreeformTopology(sourceState);
    const forkCapture = captureFreeformForkGeometry(
      new Set([firstPath.id, secondPath.id]),
      sourceState
    );
    const firstMetric = freeformMetricById(firstPath.id, sourceState);
    const secondMetric = freeformMetricById(secondPath.id, sourceState);
    const segments = firstPath.id === secondPath.id
      ? [{ pathId: firstPath.id, reversed: false, arcLength: firstMetric?.length || 1 }]
      : [
          {
            pathId: firstPath.id,
            reversed: firstEndpoint.end === "start",
            arcLength: firstMetric?.length || 1,
          },
          {
            pathId: secondPath.id,
            reversed: secondEndpoint.end === "end",
            arcLength: secondMetric?.length || 1,
          },
        ];

    const smoothed = smoothSnappedFreeformEndpoint(
      firstEndpoint,
      secondEndpoint,
      sourceState
    );
    if (!smoothed) {
      const target = secondEndpoint.end === "start"
        ? secondPath.points[0]
        : secondPath.points.at(-1);
      if (!snapFreeformEndpointToPoint(firstEndpoint, target, sourceState)) return false;
    }

    if (firstPath.id === secondPath.id) {
      const previousArcLength = Math.max(EPSILON, firstMetric?.length || 0);
      const previousGenomicLength = freeformPathGenomicLength(firstPath, sourceState);
      if (
        firstPath.points.length > 3 &&
        Math.hypot(
          firstPath.points[0].x - firstPath.points.at(-1).x,
          firstPath.points[0].y - firstPath.points.at(-1).y
        ) <= EPSILON
      ) {
        firstPath.points.pop();
      }
      firstPath.closed = true;
      invalidateFreeformMetrics(sourceState);
      const nextMetricLength = freeformMetricById(firstPath.id, sourceState)?.length
        || freeformPathLength(firstPath.points, true);
      firstPath.genomicLength = previousGenomicLength * (nextMetricLength / previousArcLength);
      normaliseCurrentFreeform(sourceState);
      synchroniseFreeformLengthFromPaths(sourceState);
      restoreFreeformTopology(capture, sourceState, { preferExistingPaths: false });
      restoreFreeformForkGeometry(forkCapture, firstPath.id, segments, sourceState);
      selectFreeformPath(firstPath.id, sourceState);
      return true;
    }

    invalidateFreeformMetrics(sourceState);
    const reshapedFirstLength = freeformMetricById(firstPath.id, sourceState)?.length
      || freeformPathLength(firstPath.points, false);
    const firstDensity = freeformPathGenomicLength(firstPath, sourceState)
      / Math.max(EPSILON, firstMetric?.length || reshapedFirstLength);
    firstPath.genomicLength = Math.max(EPSILON, reshapedFirstLength * firstDensity);

    const firstPoints = firstPath.points.map((point) => ({ ...point }));
    const secondPoints = secondPath.points.map((point) => ({ ...point }));
    if (firstEndpoint.end === "start") firstPoints.reverse();
    if (secondEndpoint.end === "end") secondPoints.reverse();
    const firstLast = firstPoints.at(-1);
    const secondFirst = secondPoints[0];
    const bridgeDistance = Math.hypot(firstLast.x - secondFirst.x, firstLast.y - secondFirst.y);
    const joined = bridgeDistance <= 2
      ? [...firstPoints, ...secondPoints.slice(1)]
      : [...firstPoints, ...secondPoints];
    const protectedJoinIndices = bridgeDistance <= 2
      ? [firstPoints.length - 1]
      : [firstPoints.length - 1, firstPoints.length];
    firstPath.points = simplifyFreeformPoints(joined, 0.2, {
      preserveIndices: protectedJoinIndices,
    });
    firstPath.closed = false;
    firstPath.genomicLength =
      freeformPathGenomicLength(firstPath, sourceState) +
      freeformPathGenomicLength(secondPath, sourceState);
    sourceState.freeform.paths = sourceState.freeform.paths.filter((path) => path.id !== secondPath.id);
    sourceState.freeform.selectedPathId = firstPath.id;
    normaliseCurrentFreeform(sourceState);
    synchroniseFreeformLengthFromPaths(sourceState);
    restoreFreeformTopology(capture, sourceState, { preferExistingPaths: false });
    restoreFreeformForkGeometry(forkCapture, firstPath.id, segments, sourceState);
    selectFreeformPath(firstPath.id, sourceState);
    return true;
  }

  function deleteSelectedFreeformPath() {
    const selected = selectedFreeformPath();
    if (!selected) return false;
    const lengthCapture = captureFreeformLengthDensity(state);
    const capture = captureFreeformTopology(state);
    pushSnapshot();
    stopAnimation();
    const removedPathIds = new Set([selected.id]);
    state.freeform.paths = state.freeform.paths.filter((path) => path.id !== selected.id);
    state.freeform.selectedPathId = state.freeform.paths[0]?.id || null;
    normaliseCurrentFreeform(state);
    restoreFreeformTopology(capture, state, { removedPathIds });
    updateFreeformLengthAfterTopologyChange(lengthCapture, state);
    selectFreeformPath(state.freeform.selectedPathId, state);
    syncControls();
    render();
    setStatus("DNA piece deleted");
    return true;
  }

  function clearFreeformCanvasState(sourceState = state) {
    if (!freeformGeometry(sourceState)) return false;
    sourceState.freeform = {
      paths: [],
      selectedPathId: null,
      snapToStart: freeformSnapToStartEnabled(sourceState),
      workspace: defaultFreeformWorkspace(),
    };
    applyReplicationWorkspace(sourceState, sourceState.freeform.workspace, {
      kind: "freeform",
    });
    sourceState.geometry = "freeform";
    sourceState.advanced.lengthMode = "scale";
    sourceState.advanced.scaleBar = false;
    normaliseStateSchema(sourceState);
    return true;
  }

  function deleteAllFreeformPaths() {
    if (!freeformGeometry(state) || !(state.freeform?.paths?.length > 0)) return false;
    pushSnapshot();
    stopAnimation();
    clearFreeformCanvasState(state);
    syncFreeformEditorFromState(state);
    syncViewGeometry(state);
    syncControls();
    render();
    setStatus("All painted DNA deleted");
    return true;
  }

  function gridStyle(sourceState = state) {
    const configured = sourceState?.advanced?.gridStyle;
    return GRID_STYLES.has(configured) ? configured : DEFAULTS.advanced.gridStyle;
  }

  function scaleBarEnabled(sourceState = state) {
    return sourceState?.advanced?.scaleBar !== false;
  }

  function wrapFraction(value) {
    const configured = Number(value);
    if (!Number.isFinite(configured)) return 0;
    const wrapped = configured - Math.floor(configured);
    return wrapped >= 1 - Number.EPSILON ? 0 : wrapped;
  }

  function circularHelixPhase(sourceState = state) {
    const configured = Number(sourceState?.advanced?.circularHelixPhase);
    return wrapFraction(
      Number.isFinite(configured) ? configured : DEFAULTS.advanced.circularHelixPhase
    );
  }

  function circularHelixAnchor(sourceState = state) {
    const configured = Number(sourceState?.advanced?.circularHelixAnchor);
    return wrapFraction(
      Number.isFinite(configured) ? configured : DEFAULTS.advanced.circularHelixAnchor
    );
  }

  function circularTurnCountAtLength(length, sourceState = state) {
    return (
      crossoverCount({
        ...sourceState,
        geometry: "circular",
        length: Number(length),
      }) / 2
    );
  }

  function clockwiseFractionDistance(from, to) {
    return wrapFraction(Number(to) - Number(from));
  }

  function signedCircularFractionDelta(from, to) {
    const clockwise = clockwiseFractionDistance(from, to);
    return clockwise > 0.5 ? clockwise - 1 : clockwise;
  }

  function nearestEquivalentFraction(fraction, reference) {
    const wrapped = wrapFraction(fraction);
    const configuredReference = Number(reference);
    const anchor = Number.isFinite(configuredReference) ? configuredReference : wrapped;
    return wrapped + Math.round(anchor - wrapped);
  }

  function circularRadius(sourceState = state) {
    return moleculeWidthForState(sourceState) / (Math.PI * 2);
  }

  function circularMinimumRenderedRadius(sourceState = state) {
    const radius = circularRadius(sourceState);
    const strandWidth = contourEnabled(sourceState)
      ? contourStrokeWidth(sourceState.weight, sourceState)
      : Math.max(0, Number(sourceState?.weight) || DEFAULTS.weight);
    return Math.min(
      radius * 0.72,
      Math.max(14, radius * CIRCULAR_MIN_RENDERED_RADIUS_FRACTION, strandWidth * 1.75)
    );
  }

  function circularSafeRenderedRadius(value, sourceState = state) {
    const configured = Number(value);
    if (!Number.isFinite(configured)) return circularRadius(sourceState);
    const radius = circularRadius(sourceState);
    const minimum = circularMinimumRenderedRadius(sourceState);
    const blendWidth = Math.max(
      10,
      Math.min(
        radius * CIRCULAR_RADIUS_SOFT_CLAMP_FRACTION,
        renderedDoubleStrandHalfHeight(sourceState) + Math.max(4, Number(sourceState?.weight) || DEFAULTS.weight)
      )
    );
    const upper = minimum + blendWidth;
    if (configured >= upper) return configured;
    if (configured <= minimum) return minimum;
    const progress = clamp((configured - minimum) / blendWidth, 0, 1);
    // f(t)=t²(2-t) has zero slope at the protected inner radius and unit
    // slope where it rejoins the untouched radial coordinate. This prevents a
    // large replicated spacing from turning an inner circular strand through
    // the centre while keeping the transition visually smooth.
    return minimum + blendWidth * progress * progress * (2 - progress);
  }

  function circularRadialLayoutScale(sourceState = state) {
    if (!circularGeometry(sourceState)) return 1;
    const configuredSpacing = Math.max(0, Number(sourceState?.daughterSpacing) || 0) / 2;
    const configuredHalfHeight = doubleStrandHalfHeight(sourceState);
    const strandHalfWidth = contourEnabled(sourceState)
      ? contourStrokeWidth(sourceState.weight, sourceState) / 2
      : Math.max(0, Number(sourceState?.weight) || DEFAULTS.weight) / 2;
    const detailClearance = Math.max(
      strandHalfWidth,
      Math.max(0, Number(sourceState?.basePairWidth) || DEFAULTS.basePairWidth) / 2
    );
    const availableInwardExtent = Math.max(
      0,
      circularRadius(sourceState) -
        circularMinimumRenderedRadius(sourceState) -
        detailClearance -
        2
    );
    const requestedInwardExtent = configuredSpacing + configuredHalfHeight;
    return requestedInwardExtent > EPSILON
      ? clamp(availableInwardExtent / requestedInwardExtent, 0, 1)
      : 1;
  }

  function renderedDaughterHalfSpacing(sourceState = state) {
    const configured = Math.max(0, Number(sourceState?.daughterSpacing) || 0) / 2;
    return configured * circularRadialLayoutScale(sourceState);
  }

  function renderedDoubleStrandHalfHeight(sourceState = state) {
    return doubleStrandHalfHeight(sourceState) * circularRadialLayoutScale(sourceState);
  }

  function geometryFractionAtX(x, sourceState = state) {
    const configured = (Number(x) - VIEW.x0) / Math.max(EPSILON, moleculeWidthForState(sourceState));
    return circularGeometry(sourceState) ? wrapFraction(configured) : clamp(configured, 0, 1);
  }

  function circularAngleAtFraction(fraction) {
    return CIRCULAR_START_ANGLE + wrapFraction(fraction) * Math.PI * 2;
  }

  function freeformGeometryPointWithOffset(
    metric,
    fraction,
    offsetForPoint,
    sourceState = state,
    deformationForPoint = null
  ) {
    const local = freeformFractionToLocal(fraction, metric, sourceState);
    const point = { ...pointOnFreeformMetric(metric, local), metric };
    const offset = Number(offsetForPoint(point)) || 0;
    const deformationAmount = deformationForPoint
      ? deformationForPoint(point)
      : freeformDeformationAmountForBaseline(offset, sourceState);
    const frame = freeformRenderedFrame(point, sourceState, deformationAmount);
    return {
      x: point.x + frame.normalX * offset,
      y: point.y + frame.normalY * offset,
      pathId: point.pathId,
      localPosition: point.localPosition,
      tangentX: frame.tangentX,
      tangentY: frame.tangentY,
      normalOffset: offset,
    };
  }

  function freeformDeformationAmountForBaseline(baseline, sourceState = state) {
    const daughter = renderedDaughterHalfSpacing(sourceState);
    if (daughter <= EPSILON) return 0;
    const displacement = clamp(Math.abs(Number(baseline) || 0), 0, daughter);
    const narrowEnvelope = freeformHelixDeformationEnvelope(sourceState);
    const wideEnvelope = freeformDeformationEnvelope(sourceState);
    const narrowRate = 1 / narrowEnvelope;
    const wideRate = 1 / wideEnvelope;
    const requiredRate = 1 / (narrowEnvelope + displacement);
    return clamp(
      (narrowRate - requiredRate) /
        Math.max(EPSILON, narrowRate - wideRate),
      0,
      1
    );
  }

  function freeformStrandIntrinsicOffset(
    x,
    strandRole,
    sourceState = state,
    metricOrId = null
  ) {
    const modelName = strandModel(sourceState);
    if (modelName === "standard") {
      const preferredPathId = typeof metricOrId === "string"
        ? metricOrId
        : metricOrId?.id || null;
      return ["a", "b", "top", "bottom"].includes(strandRole)
        ? helixWave(x, strandRole, sourceState, preferredPathId)
        : 0;
    }
    if (modelName === "elegant") {
      const halfHeight = renderedDoubleStrandHalfHeight(sourceState);
      return {
        a: -halfHeight,
        b: halfHeight,
        top: halfHeight,
        bottom: -halfHeight,
      }[strandRole] || 0;
    }
    return 0;
  }

  function freeformStrandBaselineOffset(
    x,
    y,
    strandRole,
    sourceState = state,
    metricOrId = null
  ) {
    const requestedOffset = Number(y) - VIEW.centerY;
    return requestedOffset - freeformStrandIntrinsicOffset(
      x,
      strandRole,
      sourceState,
      metricOrId
    );
  }

  function freeformStrandDeformationAmount(x, y, strandRole, sourceState = state) {
    return freeformDeformationAmountForBaseline(
      freeformStrandBaselineOffset(x, y, strandRole, sourceState),
      sourceState
    );
  }

  function freeformGeometryPointOnMetric(metric, fraction, y, sourceState = state) {
    const requestedOffset = Number(y) - VIEW.centerY;
    return freeformGeometryPointWithOffset(
      metric,
      fraction,
      (point) => freeformRenderedNormalOffset(point, requestedOffset),
      sourceState
    );
  }

  function freeformStrandNormalOffset(point, x, y, strandRole, sourceState = state) {
    const requestedOffset = Number(y) - VIEW.centerY;
    const isHelixStrand = ["a", "b", "top", "bottom"].includes(strandRole);
    if (point?.metric && !point.metric.closed) return requestedOffset;
    if (strandModel(sourceState) !== "standard" || !isHelixStrand) {
      return freeformCurvatureSafeOffset(point, requestedOffset);
    }

    const amplitude = renderedDoubleStrandHalfHeight(sourceState);
    if (amplitude <= EPSILON) return freeformCurvatureSafeOffset(point, requestedOffset);

    const wave = helixWave(x, strandRole, sourceState, point?.metric?.id || null);
    const baseline = requestedOffset - wave;
    const safeAmplitude = Math.abs(freeformCurvatureSafeOffset(point, amplitude));
    const safeOuterOffset = Math.abs(
      freeformCurvatureSafeOffset(point, Math.abs(baseline) + amplitude)
    );
    const safeBaseline =
      Math.sign(baseline) * Math.max(0, safeOuterOffset - safeAmplitude);

    // Bound the daughter baseline and helix separately. Treating them as one
    // offset flattens the smaller sinusoid whenever a tight bend compresses a
    // widely separated daughter strand.
    return safeBaseline + wave * (safeAmplitude / amplitude);
  }

  function freeformDaughterDuplexFrameProfile(metric, side, sourceState = state) {
    const daughterOffset = renderedDaughterHalfSpacing(sourceState);
    if (!metric || daughterOffset <= EPSILON) return null;
    const baselineOffset = (side < 0 ? -1 : 1) * daughterOffset;
    const helixEnvelope = freeformHelixDeformationEnvelope(sourceState);
    const broadEnvelope = freeformDeformationEnvelope(sourceState);
    const cacheKey = [
      "daughter-duplex",
      baselineOffset.toFixed(3),
      helixEnvelope.toFixed(3),
      broadEnvelope.toFixed(3),
      metric.length.toFixed(3),
    ].join(":");
    let cachedProfiles = freeformFrameCache.get(metric);
    if (!cachedProfiles) {
      cachedProfiles = new Map();
      freeformFrameCache.set(metric, cachedProfiles);
    }
    if (cachedProfiles.has(cacheKey)) return cachedProfiles.get(cacheKey);

    const segmentCount = clamp(
      Math.ceil(metric.length / 2.5),
      16,
      Math.min(6000, MAX_PATH_SAMPLE_POINTS)
    );
    const arcStep = metric.length / segmentCount;
    const deformationAmount = freeformDeformationAmountForBaseline(
      baselineOffset,
      sourceState
    );
    const rawAngles = [];
    for (let index = 0; index <= segmentCount; index += 1) {
      const point = {
        ...pointOnFreeformMetric(metric, index / segmentCount),
        metric,
      };
      const frame = freeformRenderedFrame(point, sourceState, deformationAmount);
      const turnRate = Number(frame.turnRate) || 0;
      let tangentX = point.tangentX - baselineOffset * turnRate * frame.tangentX;
      let tangentY = point.tangentY - baselineOffset * turnRate * frame.tangentY;
      const tangentLength = Math.max(EPSILON, Math.hypot(tangentX, tangentY));
      tangentX /= tangentLength;
      tangentY /= tangentLength;
      const angle = Math.atan2(tangentY, tangentX);
      rawAngles.push(
        index === 0 ? angle : equivalentFreeformAngle(angle, rawAngles[index - 1])
      );
    }

    const profile = freeformAngleFrameProfile(
      rawAngles,
      segmentCount,
      arcStep,
      (metric.closed
        ? FREEFORM_PERIODIC_DUPLEX_TURN_LIMIT
        : FREEFORM_DEFORMATION_TURN_LIMIT) / helixEnvelope,
      metric.closed
    );
    cachedProfiles.set(cacheKey, profile);
    return profile;
  }

  function freeformAngleProfileAt(profile, localPosition) {
    const position = clamp(Number(localPosition) || 0, 0, 1) * profile.segmentCount;
    const index = Math.min(profile.segmentCount - 1, Math.floor(position));
    const amount = clamp(position - index, 0, 1);
    const firstAngle = profile.angles[index];
    const secondAngle = profile.angles[index + 1];
    const firstSlope = profile.slopes[index];
    const secondSlope = profile.slopes[index + 1];
    const amountSquared = amount * amount;
    const amountCubed = amountSquared * amount;
    return (
      (2 * amountCubed - 3 * amountSquared + 1) * firstAngle +
      (amountCubed - 2 * amountSquared + amount) * firstSlope +
      (-2 * amountCubed + 3 * amountSquared) * secondAngle +
      (amountCubed - amountSquared) * secondSlope
    );
  }

  function freeformDaughterDuplexFrame(point, baselineOffset, sourceState = state) {
    const narrowFrame = freeformRenderedFrame(point, sourceState, 0);
    const daughterOffset = renderedDaughterHalfSpacing(sourceState);
    const progress = daughterOffset > EPSILON
      ? clamp(Math.abs(baselineOffset) / daughterOffset, 0, 1)
      : 0;
    if (progress <= EPSILON) return narrowFrame;
    const profile = freeformDaughterDuplexFrameProfile(
      point.metric,
      baselineOffset,
      sourceState
    );
    if (!profile) return narrowFrame;
    const narrowAngle = Math.atan2(narrowFrame.tangentY, narrowFrame.tangentX);
    const daughterAngle = equivalentFreeformAngle(
      freeformAngleProfileAt(profile, point.localPosition),
      narrowAngle
    );
    const angle = narrowAngle + (daughterAngle - narrowAngle) * progress;
    const tangentX = Math.cos(angle);
    const tangentY = Math.sin(angle);
    return {
      tangentX,
      tangentY,
      normalX: -tangentY,
      normalY: tangentX,
      angle,
    };
  }

  function freeformDeformedStrandGeometryPointOnMetric(
    metric,
    fraction,
    x,
    y,
    strandRole,
    sourceState = state
  ) {
    const local = freeformFractionToLocal(fraction, metric, sourceState);
    const point = { ...pointOnFreeformMetric(metric, local), metric };
    const requestedOffset = Number(y) - VIEW.centerY;
    const baselineOffset = freeformStrandBaselineOffset(
      x,
      y,
      strandRole,
      sourceState,
      metric
    );
    const intrinsicOffset = requestedOffset - baselineOffset;
    const deformationAmount = freeformDeformationAmountForBaseline(
      baselineOffset,
      sourceState
    );
    const frame = freeformRenderedFrame(point, sourceState, deformationAmount);
    const baselinePoint = {
      x: point.x + frame.normalX * baselineOffset,
      y: point.y + frame.normalY * baselineOffset,
    };

    // The broad frame forms a cusp-free daughter baseline. A second, tighter
    // transported frame follows that daughter's tangent while limiting only
    // the angular motion that would fold the small helix offsets back on
    // themselves.
    const duplexFrame = freeformDaughterDuplexFrame(
      point,
      baselineOffset,
      sourceState
    );
    const tangentX = duplexFrame.tangentX;
    const tangentY = duplexFrame.tangentY;
    const renderedIntrinsicOffset = intrinsicOffset;

    return {
      x: baselinePoint.x - tangentY * renderedIntrinsicOffset,
      y: baselinePoint.y + tangentX * renderedIntrinsicOffset,
      pathId: point.pathId,
      localPosition: point.localPosition,
      tangentX,
      tangentY,
      normalOffset: requestedOffset,
      baselineOffset,
      intrinsicOffset,
      renderedIntrinsicOffset,
    };
  }

  function freeformStrandGeometryPointOnMetric(
    metric,
    fraction,
    x,
    y,
    strandRole,
    sourceState = state
  ) {
    if (metric) {
      return freeformDeformedStrandGeometryPointOnMetric(
        metric,
        fraction,
        x,
        y,
        strandRole,
        sourceState
      );
    }
    return freeformGeometryPointWithOffset(
      metric,
      fraction,
      (point) => freeformStrandNormalOffset(point, x, y, strandRole, sourceState),
      sourceState,
      () => freeformStrandDeformationAmount(x, y, strandRole, sourceState)
    );
  }

  function freeformStrandGeometryPoint(x, y, strandRole, sourceState = state) {
    const fraction = geometryFractionAtX(x, sourceState);
    const metric = freeformMetricAtFraction(fraction, sourceState);
    return metric
      ? freeformStrandGeometryPointOnMetric(
          metric,
          fraction,
          x,
          y,
          strandRole,
          sourceState
        )
      : { x: Number(x), y: Number(y), pathId: null };
  }

  function geometryPoint(x, y, sourceState = state) {
    if (freeformGeometry(sourceState)) {
      const fraction = geometryFractionAtX(x, sourceState);
      const metric = freeformMetricAtFraction(fraction, sourceState);
      return metric
        ? freeformGeometryPointOnMetric(metric, fraction, y, sourceState)
        : { x: Number(x), y: Number(y), pathId: null };
    }
    if (!circularGeometry(sourceState)) return { x: Number(x), y: Number(y) };
    const fraction = geometryFractionAtX(x, sourceState);
    const angle = circularAngleAtFraction(fraction);
    const requestedRadius = circularRadius(sourceState) + (Number(y) - VIEW.centerY);
    const radius = circularSafeRenderedRadius(requestedRadius, sourceState);
    return {
      x: VIEW.width / 2 + radius * Math.cos(angle),
      y: VIEW.centerY + radius * Math.sin(angle),
    };
  }

  function geometryPointToLinear(point, sourceState = state) {
    if (freeformGeometry(sourceState)) {
      const projection = nearestFreeformProjection(point, sourceState);
      if (!projection) return { x: point.x, y: point.y, distance: Infinity, pathId: null };
      const signedOffset =
        (Number(point.x) - projection.x) * projection.normalX +
        (Number(point.y) - projection.y) * projection.normalY;
      const globalPosition = projection.metric.start + projection.localPosition * projection.metric.span;
      return {
        x: VIEW.x0 + globalPosition * moleculeWidthForState(sourceState),
        y: VIEW.centerY + signedOffset,
        distance: projection.distance,
        pathId: projection.pathId,
        localPosition: projection.localPosition,
      };
    }
    if (!circularGeometry(sourceState)) return { x: point.x, y: point.y };
    const dx = Number(point.x) - VIEW.width / 2;
    const dy = Number(point.y) - VIEW.centerY;
    const angle = Math.atan2(dy, dx);
    const fraction = wrapFraction((angle - CIRCULAR_START_ANGLE) / (Math.PI * 2));
    return {
      x: VIEW.x0 + fraction * moleculeWidthForState(sourceState),
      y: VIEW.centerY + Math.hypot(dx, dy) - circularRadius(sourceState),
    };
  }

  function geometryTangentAngleDegrees(fraction, sourceState = state) {
    if (freeformGeometry(sourceState)) {
      const point = freeformPointAtFraction(fraction, sourceState);
      if (!point) return 0;
      const frame = freeformRenderedFrame(point, sourceState);
      return (Math.atan2(frame.tangentY, frame.tangentX) * 180) / Math.PI;
    }
    return ((circularAngleAtFraction(fraction) + Math.PI / 2) * 180) / Math.PI;
  }

  function circularScreenTangentScale(fraction, sourceState = state) {
    const angle = circularAngleAtFraction(fraction);
    const tangentX = -Math.sin(angle);
    const tangentY = Math.cos(angle);
    return Math.hypot(
      tangentX * artworkAspectX(sourceState),
      tangentY * artworkAspectY(sourceState)
    );
  }

  function circularScreenRadialScale(fraction, sourceState = state) {
    const angle = circularAngleAtFraction(fraction);
    return Math.hypot(
      Math.cos(angle) * artworkAspectX(sourceState),
      Math.sin(angle) * artworkAspectY(sourceState)
    );
  }

  function geometryScreenTangentScale(fraction, sourceState = state) {
    if (circularGeometry(sourceState)) return circularScreenTangentScale(fraction, sourceState);
    if (freeformGeometry(sourceState)) {
      const point = freeformPointAtFraction(fraction, sourceState);
      if (point) {
        const frame = freeformRenderedFrame(point, sourceState);
        return Math.hypot(
          frame.tangentX * artworkAspectX(sourceState),
          frame.tangentY * artworkAspectY(sourceState)
        );
      }
    }
    return artworkAspectX(sourceState);
  }

  function geometryScreenNormalScale(fraction, sourceState = state) {
    if (circularGeometry(sourceState)) return circularScreenRadialScale(fraction, sourceState);
    if (freeformGeometry(sourceState)) {
      const point = freeformPointAtFraction(fraction, sourceState);
      if (point) {
        const frame = freeformRenderedFrame(point, sourceState);
        return Math.hypot(
          frame.normalX * artworkAspectX(sourceState),
          frame.normalY * artworkAspectY(sourceState)
        );
      }
    }
    return artworkAspectY(sourceState);
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

  function basePairAngle(sourceState = state) {
    return boundedControlValue(
      "basePairAngle",
      sourceState?.advanced?.basePairAngle,
      DEFAULTS.advanced.basePairAngle
    );
  }

  function basePairTranslation(sourceState = state) {
    return boundedControlValue(
      "basePairTranslation",
      sourceState?.advanced?.basePairTranslation,
      DEFAULTS.advanced.basePairTranslation
    );
  }

  function basePairTranslationLabel(sourceState = state) {
    const value = basePairTranslation(sourceState);
    if (Math.abs(value) <= EPSILON) return "Anchored";
    return `${value > 0 ? "+" : ""}${Number(value.toFixed(2))} bp`;
  }

  function basePairAngleLabel(sourceState = state) {
    const value = Math.round(basePairAngle(sourceState));
    return Math.abs(value) <= EPSILON ? "Vertical" : `${value > 0 ? "+" : ""}${value}\u00b0`;
  }

  function depthAwareBasePairSplit(sourceState = state) {
    return sourceState?.advanced?.depthAwareBasePairSplit === true;
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
    if (freeformGeometry(sourceState)) {
      const componentTotal = (sourceState?.freeform?.paths || []).reduce(
        (total, path) => total + Math.max(0, Number(path?.genomicLength) || 0),
        0
      );
      // Free-form components keep independent resolutions. Expand the slider
      // ceiling with the drawing instead of squeezing existing components when
      // another piece is painted.
      return Math.min(
        FREEFORM_MAX_GENOMIC_LENGTH,
        Math.max(CONTROL_RANGES.length.max, Math.ceil(componentTotal * 2))
      );
    }
    const resolution = basePairResolution(sourceState);
    const edgeOffset = circularGeometry(sourceState) ? 0 : resolution % 2 === 0 ? 0.5 : 0;
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
      freeformGeometry(sourceState) ? FREEFORM_MIN_GENOMIC_LENGTH : CONTROL_RANGES.length.min,
      maximumLengthForBasePairCount(sourceState)
    );
  }

  function lengthMode(sourceState = state) {
    const configured = sourceState?.advanced?.lengthMode;
    return LENGTH_MODES.has(configured) ? configured : DEFAULTS.advanced.lengthMode;
  }

  function dnaHandedness(sourceState = state) {
    const configured = sourceState?.advanced?.dnaHandedness;
    return DNA_HANDEDNESS_MODES.has(configured)
      ? configured
      : DEFAULTS.advanced.dnaHandedness;
  }

  function geometryHandednessOrientation(sourceState = state) {
    // Circular coordinates advance clockwise while positive transverse offsets
    // point radially outwards. That basis is reflected relative to the
    // left-normal basis used by linear and free-form paths.
    return circularGeometry(sourceState) ? -1 : 1;
  }

  function crossoverAIsOver(index, sourceState = state) {
    // The original labels were reversed. In the corrected convention, the
    // first crossover has strand B above for a right-handed helix and strand A
    // above for a left-handed helix.
    let rightHandedAOver = Math.trunc(Number(index) || 0) % 2 !== 0;
    if (geometryHandednessOrientation(sourceState) < 0) {
      rightHandedAOver = !rightHandedAOver;
    }
    return dnaHandedness(sourceState) === "right"
      ? rightHandedAOver
      : !rightHandedAOver;
  }

  function referenceCrossoverCount() {
    return Math.max(
      1,
      Math.round((CROSSOVER_REFERENCE_LENGTH / BASE_PAIRS_PER_TURN) * 2)
    );
  }

  function moleculeWidthForState(sourceState = state) {
    const modelOverride = Number(sourceState?.__modelMoleculeWidth);
    if (Number.isFinite(modelOverride) && modelOverride > EPSILON) return modelOverride;
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
    // In right-extension mode the existing grid must remain visually fixed as
    // genome is appended. Returning the exact (possibly fractional) number of
    // base-width columns keeps the CSS repeat spacing constant instead of
    // nudging every line whenever the growing chromosome crosses a rounding
    // threshold. The extended endpoint therefore need not coincide with a grid
    // line; only scale-changing mode adapts the grid to the bar.
    return Math.max(
      EPSILON,
      GRID_COLUMN_COUNT * moleculeWidthForState(sourceState) / BASE_MOLECULE_WIDTH
    );
  }

  function resizeGenomeLength(value, sourceState = state) {
    const configuredPreviousLength = Number(sourceState?.length);
    const previousLength = freeformGeometry(sourceState)
      ? clamp(
          Number.isFinite(configuredPreviousLength) ? configuredPreviousLength : DEFAULTS.length,
          FREEFORM_MIN_GENOMIC_LENGTH,
          FREEFORM_MAX_GENOMIC_LENGTH
        )
      : clamp(
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

    if (freeformGeometry(sourceState)) {
      const paths = sourceState.freeform?.paths || [];
      const currentTotal = paths.reduce(
        (total, path) => total + freeformPathGenomicLength(path, sourceState),
        0
      );
      const scale = currentTotal > EPSILON ? nextLength / currentTotal : 1;
      paths.forEach((path) => {
        path.genomicLength = Math.max(EPSILON, freeformPathGenomicLength(path, sourceState) * scale);
      });
      sourceState.length = nextLength;
      invalidateFreeformMetrics(sourceState);
      syncViewGeometry(sourceState);
      resetForkPlaybackClock(sourceState);
      return nextLength;
    }

    let nextCircularAnchor = circularHelixAnchor(sourceState);
    let rebasedCircularPhase = circularHelixPhase(sourceState);
    if (!freeformGeometry(sourceState)) {
      // A closed duplex can only meet its own phase with a whole-number winding.
      // Rebase that unavoidable winding change around a neutral periodic anchor
      // instead of making genomic zero the visually privileged phase-slip point.
      // Free form has an independent length workspace, so its edits must never
      // rephase the structured circular molecule kept behind it.
      const previousCircularAnchor = nextCircularAnchor;
      nextCircularAnchor =
        lengthMode(sourceState) === "extend"
          ? wrapFraction((previousCircularAnchor * previousLength) / nextLength)
          : previousCircularAnchor;
      rebasedCircularPhase = wrapFraction(
        rebasedCircularPhase +
          circularTurnCountAtLength(previousLength, sourceState) * previousCircularAnchor -
          circularTurnCountAtLength(nextLength, sourceState) * nextCircularAnchor
      );
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
              ...(range.componentId ? { componentId: range.componentId } : {}),
            };
          })
          .filter((cut) => cut.start <= 1 + EPSILON && cut.end >= -EPSILON)
          .map((cut) => ({
            start: clamp(cut.start, 0, 1),
            end: clamp(cut.end, 0, 1),
            ...(cut.componentId ? { componentId: cut.componentId } : {}),
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
    sourceState.advanced.circularHelixPhase = rebasedCircularPhase;
    sourceState.advanced.circularHelixAnchor = nextCircularAnchor;
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

  function contourEnabled(sourceState = state) {
    return sourceState?.advanced?.contour === true;
  }

  function contourThickness(sourceState = state) {
    return boundedControlValue(
      "contourThickness",
      sourceState?.advanced?.contourThickness,
      DEFAULTS.advanced.contourThickness
    );
  }

  function contourColor(sourceState = state) {
    const configured = sourceState?.advanced?.contourColor;
    return HEX_COLOUR.test(String(configured || ""))
      ? configured
      : DEFAULTS.advanced.contourColor;
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
    const freeformBounds = freeformGeometry(sourceState)
      ? freeformArtworkBounds(sourceState)
      : null;
    const pivotX = circularGeometry(sourceState)
      ? VIEW.width / 2
      : freeformBounds
        ? (freeformBounds.left + freeformBounds.right) / 2
        : lengthMode(sourceState) === "extend"
          ? BASE_VIEW.x0
          : BASE_VIEW.x0 + moleculeWidthForState(sourceState) / 2;
    const pivotY = freeformBounds
      ? (freeformBounds.top + freeformBounds.bottom) / 2
      : VIEW.centerY;
    return {
      scaleX,
      scaleY,
      translateX: pivotX * (1 - scaleX),
      translateY: pivotY * (1 - scaleY),
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
    sourceState.geometry = geometryMode(sourceState);
    const suppliedFreeform = sourceState.freeform;
    const hasExplicitScaleBar =
      isPlainRecord(sourceState.advanced) &&
      Object.prototype.hasOwnProperty.call(sourceState.advanced, "scaleBar");
    sourceState.freeform = normaliseFreeformState(suppliedFreeform, sourceState);
    sourceState.structuredWorkspace = normaliseReplicationWorkspace(
      sourceState.structuredWorkspace,
      { kind: "structured", sourceState }
    );
    sourceState.freeform.workspace = normaliseReplicationWorkspace(
      sourceState.freeform.workspace,
      { kind: "freeform", sourceState }
    );
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
    sourceState.advanced.basePairTranslation = basePairTranslation(sourceState);
    sourceState.advanced.basePairAngle = basePairAngle(sourceState);
    sourceState.advanced.depthAwareBasePairSplit =
      sourceState.advanced.depthAwareBasePairSplit === true;
    sourceState.advanced.aspectX = artworkAspectX(sourceState);
    sourceState.advanced.aspectY = artworkAspectY(sourceState);
    sourceState.advanced.crossoverGaps = sourceState.advanced.crossoverGaps === true;
    sourceState.advanced.grid = sourceState.advanced.grid !== false;
    sourceState.advanced.gridStyle = gridStyle(sourceState);
    sourceState.advanced.scaleBar = hasExplicitScaleBar
      ? sourceState.advanced.scaleBar !== false
      : !freeformGeometry(sourceState);
    sourceState.advanced.alwaysShowControls = sourceState.advanced.alwaysShowControls !== false;
    sourceState.advanced.snapToBasePairs = sourceState.advanced.snapToBasePairs === true;
    sourceState.advanced.dnaHandedness = dnaHandedness(sourceState);
    sourceState.advanced.circularHelixPhase = circularHelixPhase(sourceState);
    sourceState.advanced.circularHelixAnchor = circularHelixAnchor(sourceState);
    sourceState.advanced.basePairTransition = basePairTransitionMode(sourceState);
    sourceState.advanced.lengthMode = lengthMode(sourceState);
    sourceState.advanced.includeExportBackground = sourceState.advanced.includeExportBackground === true;
    sourceState.advanced.contour = sourceState.advanced.contour === true;
    sourceState.advanced.contourThickness = contourThickness(sourceState);
    sourceState.advanced.contourColor = contourColor(sourceState);
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
    if (circularGeometry(sourceState) && Array.isArray(sourceState.origins)) {
      sourceState.origins.forEach((origin) => {
        // Keep the structured document coordinate on the closed interval. In
        // particular, a linear origin at the right endpoint must remain 1 so
        // switching back from circular geometry restores the same endpoint.
        // Circular models canonicalise their local copies with wrapFraction,
        // where 1 and 0 are correctly equivalent, without destroying that
        // linear-only endpoint identity in the stored state.
        const configured = Number(origin.startPosition ?? origin.position);
        origin.startPosition = clamp(Number.isFinite(configured) ? configured : 0, 0, 1);
        origin.position = origin.startPosition;
      });
      sourceState.origins.sort((first, second) => first.startPosition - second.startPosition);
    } else if (freeformGeometry(sourceState) && Array.isArray(sourceState.origins)) {
      if (!sourceState.freeform.paths.length) {
        sourceState.origins = [];
        sourceState.cuts = [];
        sourceState.selectedOriginId = null;
        sourceState.selectedFork = null;
        sourceState.forkTravel = 0;
        sourceState.progress = 0;
      } else {
        synchroniseFreeformLengthFromPaths(sourceState);
        ensureFreeformOriginMetadata(sourceState, { preferLocal: true });
      }
    }
    return sourceState;
  }

  function isPlainRecord(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
  }

  function invalidConfiguration(message = "invalid or damaged file") {
    const error = new Error(message);
    error.name = "RepliCanvasConfigurationError";
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
        if (key === "dnaHandedness" && !DNA_HANDEDNESS_MODES.has(value)) {
          throw invalidConfiguration(`${valuePath} is invalid`);
        }
        if (key === "geometry" && !GEOMETRY_MODES.has(value)) {
          throw invalidConfiguration(`${valuePath} is invalid`);
        }
        if (key === "gridStyle" && !GRID_STYLES.has(value)) {
          throw invalidConfiguration(`${valuePath} is invalid`);
        }
        result[key] = value;
      } else {
        throw invalidConfiguration(`${valuePath} uses an unsupported value`);
      }
    });
    return result;
  }

  function sanitiseFreeformConfiguration(source, path = "state.freeform") {
    if (source === undefined) {
      return {
        paths: [],
        selectedPathId: null,
        snapToStart: false,
        workspace: defaultFreeformWorkspace(),
      };
    }
    if (!isPlainRecord(source) || !Array.isArray(source.paths) || source.paths.length > 128) {
      throw invalidConfiguration(`${path} is invalid`);
    }

    const ids = new Set();
    const paths = source.paths.map((candidate, pathIndex) => {
      const itemPath = `${path}.paths[${pathIndex}]`;
      if (!isPlainRecord(candidate)) throw invalidConfiguration(`${itemPath} is invalid`);
      if (typeof candidate.id !== "string" || !/^[a-z\d][a-z\d_-]{0,63}$/i.test(candidate.id)) {
        throw invalidConfiguration(`${itemPath}.id is invalid`);
      }
      if (ids.has(candidate.id)) throw invalidConfiguration(`${itemPath}.id is duplicated`);
      ids.add(candidate.id);
      if (!Array.isArray(candidate.points) || candidate.points.length < 2 || candidate.points.length > FREEFORM_MAX_POINTS) {
        throw invalidConfiguration(`${itemPath}.points is invalid`);
      }
      const points = candidate.points.map((point, pointIndex) => {
        const pointPath = `${itemPath}.points[${pointIndex}]`;
        if (!isPlainRecord(point)) throw invalidConfiguration(`${pointPath} is invalid`);
        return {
          x: configurationNumber(point.x, `${pointPath}.x`, -10000, 10000),
          y: configurationNumber(point.y, `${pointPath}.y`, -10000, 10000),
        };
      });
      const closed = candidate.closed === true;
      if (candidate.closed !== undefined && typeof candidate.closed !== "boolean") {
        throw invalidConfiguration(`${itemPath}.closed is invalid`);
      }
      if (freeformPathLength(points, closed) < FREEFORM_MIN_PATH_LENGTH) {
        throw invalidConfiguration(`${itemPath} is too short`);
      }
      const genomicLength = candidate.genomicLength === undefined
        ? undefined
        : configurationNumber(
            candidate.genomicLength,
            `${itemPath}.genomicLength`,
            Number.EPSILON,
            FREEFORM_MAX_GENOMIC_LENGTH
          );
      return {
        id: candidate.id,
        points,
        closed: closed && points.length > 2,
        ...(genomicLength === undefined ? {} : { genomicLength }),
      };
    });

    const selectedPathId = source.selectedPathId ?? null;
    if (selectedPathId !== null && (typeof selectedPathId !== "string" || !ids.has(selectedPathId))) {
      throw invalidConfiguration(`${path}.selectedPathId is invalid`);
    }
    if (source.snapToStart !== undefined && typeof source.snapToStart !== "boolean") {
      throw invalidConfiguration(`${path}.snapToStart is invalid`);
    }
    return {
      paths,
      selectedPathId,
      snapToStart: source.snapToStart === true,
      workspace: source.workspace,
    };
  }

  function sanitiseReplicationWorkspaceConfiguration(
    source,
    path,
    { kind = "structured", freeformPathIds = new Set() } = {}
  ) {
    const fallback = kind === "freeform" ? defaultFreeformWorkspace() : defaultStructuredWorkspace();
    if (source === undefined || source === null) {
      return serializableReplicationWorkspace(fallback, kind);
    }
    if (!isPlainRecord(source)) throw invalidConfiguration(`${path} is invalid`);
    if (!Array.isArray(source.origins)) throw invalidConfiguration(`${path}.origins is invalid`);
    if (!Array.isArray(source.cuts) || source.cuts.length > 10) {
      throw invalidConfiguration(`${path}.cuts is invalid`);
    }

    const length = configurationNumber(
      source.length,
      `${path}.length`,
      CONTROL_RANGES.length.min,
      CONTROL_RANGES.length.max
    );
    const basePairSeed = configurationNumber(
      source.basePairSeed,
      `${path}.basePairSeed`,
      0,
      0xffffffff
    );
    if (!Number.isInteger(basePairSeed)) throw invalidConfiguration(`${path}.basePairSeed is invalid`);
    const progress = configurationNumber(
      source.progress,
      `${path}.progress`,
      CONTROL_RANGES.progress.min,
      CONTROL_RANGES.progress.max
    );
    const forkTravel = configurationNumber(source.forkTravel, `${path}.forkTravel`, -2, 2);
    if (typeof source.scaleBar !== "boolean") throw invalidConfiguration(`${path}.scaleBar is invalid`);

    const originIds = new Set();
    const origins = source.origins.map((origin, index) => {
      const originPath = `${path}.origins[${index}]`;
      if (!isPlainRecord(origin)) throw invalidConfiguration(`${originPath} is invalid`);
      if (typeof origin.id !== "string" || !/^[a-z\d][a-z\d_-]{0,63}$/i.test(origin.id)) {
        throw invalidConfiguration(`${originPath}.id is invalid`);
      }
      if (originIds.has(origin.id)) throw invalidConfiguration(`${originPath}.id is duplicated`);
      originIds.add(origin.id);
      const startPosition = configurationNumber(
        origin.startPosition ?? origin.position,
        `${originPath}.startPosition`,
        0,
        1
      );
      const position = configurationNumber(
        origin.position ?? startPosition,
        `${originPath}.position`,
        0,
        1
      );
      const moleculeId = origin.moleculeId;
      if (
        moleculeId !== undefined &&
        (typeof moleculeId !== "string" || !/^[a-z\d][a-z\d_-]{0,63}$/i.test(moleculeId))
      ) {
        throw invalidConfiguration(`${originPath}.moleculeId is invalid`);
      }
      if (kind === "freeform" && moleculeId !== undefined && !freeformPathIds.has(moleculeId)) {
        throw invalidConfiguration(`${originPath}.moleculeId is invalid`);
      }
      const localPosition = origin.localPosition;
      if (localPosition !== undefined) {
        configurationNumber(localPosition, `${originPath}.localPosition`, 0, 1);
      }
      return {
        id: origin.id,
        position,
        startPosition,
        leftOffset: configurationNumber(origin.leftOffset, `${originPath}.leftOffset`, -2, 2),
        rightOffset: configurationNumber(origin.rightOffset, `${originPath}.rightOffset`, -2, 2),
        ...(moleculeId !== undefined ? { moleculeId } : {}),
        ...(localPosition !== undefined ? { localPosition } : {}),
      };
    });

    const cuts = normaliseCutRegions(
      source.cuts.map((cut, index) => {
        const cutPath = `${path}.cuts[${index}]`;
        if (!isPlainRecord(cut)) throw invalidConfiguration(`${cutPath} is invalid`);
        const componentId = cut.componentId ?? cut.moleculeId ?? cut.pathId;
        if (
          componentId !== undefined &&
          (typeof componentId !== "string" || !/^[a-z\d][a-z\d_-]{0,63}$/i.test(componentId))
        ) {
          throw invalidConfiguration(`${cutPath}.componentId is invalid`);
        }
        if (kind === "freeform" && componentId !== undefined && !freeformPathIds.has(componentId)) {
          throw invalidConfiguration(`${cutPath}.componentId is invalid`);
        }
        return {
          start: configurationNumber(cut.start, `${cutPath}.start`, 0, 1),
          end: configurationNumber(cut.end, `${cutPath}.end`, 0, 1),
          ...(componentId !== undefined ? { componentId } : {}),
        };
      })
    );

    const selectedOriginId = source.selectedOriginId ?? null;
    if (selectedOriginId !== null && !originIds.has(selectedOriginId)) {
      throw invalidConfiguration(`${path}.selectedOriginId is invalid`);
    }
    let selectedFork = null;
    if (source.selectedFork !== undefined && source.selectedFork !== null) {
      if (
        !isPlainRecord(source.selectedFork) ||
        !originIds.has(source.selectedFork.originId) ||
        !["left", "right"].includes(source.selectedFork.side)
      ) {
        throw invalidConfiguration(`${path}.selectedFork is invalid`);
      }
      selectedFork = {
        originId: source.selectedFork.originId,
        side: source.selectedFork.side,
      };
    }
    return {
      length,
      basePairSeed: Math.trunc(basePairSeed) >>> 0,
      progress,
      forkTravel,
      origins,
      cuts,
      selectedOriginId: selectedFork ? null : selectedOriginId,
      selectedFork,
      scaleBar: source.scaleBar,
    };
  }

  function sanitiseConfigurationState(sourceState) {
    if (!isPlainRecord(sourceState)) throw invalidConfiguration("state is missing or invalid");

    const candidate = sanitiseConfigurationSettings(sourceState, DEFAULTS, "state");
    const sourceHasScaleBar =
      isPlainRecord(sourceState.advanced) &&
      Object.prototype.hasOwnProperty.call(sourceState.advanced, "scaleBar");
    if (geometryMode(candidate) === "freeform" && !sourceHasScaleBar) {
      candidate.advanced.scaleBar = false;
    }
    candidate.freeform = sanitiseFreeformConfiguration(sourceState.freeform);
    const freeformPathIds = new Set(candidate.freeform.paths.map((path) => path.id));
    candidate.structuredWorkspace = sanitiseReplicationWorkspaceConfiguration(
      sourceState.structuredWorkspace,
      "state.structuredWorkspace",
      { kind: "structured" }
    );
    candidate.freeform.workspace = sanitiseReplicationWorkspaceConfiguration(
      sourceState.freeform?.workspace,
      "state.freeform.workspace",
      { kind: "freeform", freeformPathIds }
    );
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
      const moleculeId = origin.moleculeId;
      if (moleculeId !== undefined && (typeof moleculeId !== "string" || !/^[a-z\d][a-z\d_-]{0,63}$/i.test(moleculeId))) {
        throw invalidConfiguration(`${path}.moleculeId is invalid`);
      }
      const localPosition = origin.localPosition;
      if (localPosition !== undefined) {
        configurationNumber(localPosition, `${path}.localPosition`, 0, 1);
      }
      return {
        id: origin.id,
        position,
        startPosition,
        leftOffset: configurationNumber(origin.leftOffset, `${path}.leftOffset`, -2, 2),
        rightOffset: configurationNumber(origin.rightOffset, `${path}.rightOffset`, -2, 2),
        ...(moleculeId !== undefined ? { moleculeId } : {}),
        ...(localPosition !== undefined ? { localPosition } : {}),
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
        const componentId = cut.componentId ?? cut.moleculeId ?? cut.pathId;
        if (
          componentId !== undefined &&
          (typeof componentId !== "string" || !/^[a-z\d][a-z\d_-]{0,63}$/i.test(componentId))
        ) {
          throw invalidConfiguration(`${path}.componentId is invalid`);
        }
        return {
          start: configurationNumber(cut.start, `${path}.start`, 0, 1),
          end: configurationNumber(cut.end, `${path}.end`, 0, 1),
          ...(componentId !== undefined ? { componentId } : {}),
        };
      })
    );
    if (geometryMode(candidate) === "freeform") {
      const pathIds = new Set((candidate.freeform?.paths || []).map((path) => path.id));
      candidate.cuts.forEach((cut, index) => {
        if (cut.componentId && !pathIds.has(cut.componentId)) {
          throw invalidConfiguration(`state.cuts[${index}].componentId is invalid`);
        }
      });
    }

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
    const legacyFormat = isPlainRecord(documentState) && documentState.format === LEGACY_CONFIG_FORMAT;
    if (
      !isPlainRecord(documentState) ||
      (documentState.format !== CONFIG_FORMAT && !legacyFormat)
    ) {
      throw invalidConfiguration("not a RepliCanvas configuration");
    }
    if (!Number.isInteger(documentState.schemaVersion)) throw invalidConfiguration("schema version is missing");
    if (documentState.schemaVersion > CONFIG_SCHEMA_VERSION) {
      throw invalidConfiguration("this configuration was created by a newer RepliCanvas version");
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
    let configurationState = documentState.state;
    if (legacyFormat && isPlainRecord(configurationState)) {
      configurationState = JSON.parse(JSON.stringify(configurationState));
      const legacyHandedness = configurationState.advanced?.dnaHandedness;
      if (DNA_HANDEDNESS_MODES.has(legacyHandedness)) {
        configurationState.advanced.dnaHandedness = legacyHandedness === "left" ? "right" : "left";
      }
    }
    return sanitiseConfigurationState(configurationState);
  }

  function cachedTemplateState() {
    try {
      if (!appSettings.rememberProject || typeof localStorage === "undefined") return null;
      for (const key of [TEMPLATE_CACHE_KEY, LEGACY_TEMPLATE_CACHE_KEY]) {
        const cached = localStorage.getItem(key);
        if (!cached) continue;
        try {
          return parseConfigurationText(cached);
        } catch {
          localStorage.removeItem(key);
        }
      }
      return null;
    } catch {
      // A damaged or inaccessible cache must never prevent the app opening.
      return null;
    }
  }

  function persistTemplateCacheNow() {
    if (!state || templateCacheSuspended) return false;
    if (templateCacheTimer) {
      clearTimeout(templateCacheTimer);
      templateCacheTimer = 0;
    }
    try {
      if (typeof localStorage === "undefined") return false;
      if (!appSettings.rememberProject) {
        localStorage.removeItem(TEMPLATE_CACHE_KEY);
        localStorage.removeItem(LEGACY_TEMPLATE_CACHE_KEY);
        return false;
      }
      localStorage.setItem(TEMPLATE_CACHE_KEY, JSON.stringify(configurationDocument()));
      return true;
    } catch {
      return false;
    }
  }

  function scheduleTemplateCache() {
    if (
      !state ||
      !appSettings.rememberProject ||
      templateCacheSuspended ||
      templateCacheTimer ||
      typeof setTimeout !== "function"
    ) return;
    // Throttle rather than continually debounce: long S-phase playback and
    // sustained drags are therefore checkpointed while remaining inexpensive.
    templateCacheTimer = setTimeout(() => {
      templateCacheTimer = 0;
      persistTemplateCacheNow();
    }, TEMPLATE_CACHE_DELAY_MS);
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

  function terminalPullSpan(terminalPosition, direction, sourceState = state) {
    // Interpret the slider in current base-pair units rather than fixed screen
    // pixels. In fit-to-canvas mode, longer genomes therefore use a shorter
    // displayed transition; in fixed-scale mode the same number of base pairs
    // retains the same physical span as the molecule extends.
    return (
      terminalSmoothing(sourceState) *
      moleculeWidthForState(sourceState) /
      Math.max(1, basePairLattice(sourceState).subdivisionCount)
    );
  }

  function effectiveTerminalSmoothing(sourceState = state) {
    const currentPairSpacing =
      moleculeWidthForState(sourceState) /
      Math.max(1, basePairLattice(sourceState).subdivisionCount);
    return terminalPullSpan(0.5, "right", sourceState) / Math.max(EPSILON, currentPairSpacing);
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
    if (rawTravel < contactTravel - EPSILON) return 0;
    if (strandModel(sourceState) !== "minimal") return 1;
    const overshoot =
      Math.max(0, rawTravel - contactTravel) * moleculeWidthForState(sourceState);
    return terminalClosureBlend(overshoot, sourceState);
  }

  function minimalManualEndOvershootFraction(sourceState = state) {
    if (
      strandModel(sourceState) !== "minimal" ||
      terminalSmoothing(sourceState) <= EPSILON
    ) {
      return 0;
    }
    return (
      terminalPullSpan(0.5, "right", sourceState) /
      Math.max(EPSILON, moleculeWidthForState(sourceState))
    );
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
    const position = circularGeometry(sourceState)
      ? geometryFractionAtX(x, sourceState)
      : (x - VIEW.x0) / VIEW.moleculeWidth;
    if (
      model.regions.some(
        (region) => position >= region.start - EPSILON && position <= region.end + EPSILON
      )
    ) {
      return 0;
    }

    let nearestForkDistance = Infinity;
    model.regions.forEach((region) => {
      if (!region.openStart) {
        const fractionDistance = circularGeometry(sourceState)
          ? Math.abs(signedCircularFractionDelta(position, region.start))
          : position < region.start
            ? region.start - position
            : Infinity;
        if (Number.isFinite(fractionDistance)) {
          const tangentScale = circularGeometry(sourceState)
            ? circularScreenTangentScale(region.start, sourceState)
            : artworkAspectX(sourceState);
          nearestForkDistance = Math.min(
            nearestForkDistance,
            fractionDistance * VIEW.moleculeWidth * tangentScale
          );
        }
      }
      if (!region.openEnd) {
        const fractionDistance = circularGeometry(sourceState)
          ? Math.abs(signedCircularFractionDelta(position, region.end))
          : position > region.end
            ? position - region.end
            : Infinity;
        if (Number.isFinite(fractionDistance)) {
          const tangentScale = circularGeometry(sourceState)
            ? circularScreenTangentScale(region.end, sourceState)
            : artworkAspectX(sourceState);
          nearestForkDistance = Math.min(
            nearestForkDistance,
            fractionDistance * VIEW.moleculeWidth * tangentScale
          );
        }
      }
    });
    if (!Number.isFinite(nearestForkDistance)) return 1;

    const representativeScale = circularGeometry(sourceState)
      ? Math.max(artworkAspectX(sourceState), artworkAspectY(sourceState))
      : artworkAspectX(sourceState);
    const pairSpacingScreen =
      (VIEW.moleculeWidth * representativeScale) /
      Math.max(1, basePairLattice(sourceState).subdivisionCount);
    const fadeDistanceScreen = clamp(pairSpacingScreen * 2, 18, 52);
    return smoothstep(nearestForkDistance / fadeDistanceScreen);
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

    const evaluationX = circularGeometry()
      ? VIEW.x0 + geometryFractionAtX(x) * VIEW.moleculeWidth
      : x;
    const edgeX = VIEW.x0 + (side === "start" ? region.start : region.end) * VIEW.moleculeWidth;
    const width = regionEdgeTransitionWidth(region, side, model);
    const inwardDistance = side === "start" ? evaluationX - edgeX : edgeX - evaluationX;
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
      freeform: {
        paths: [],
        selectedPathId: null,
        snapToStart: false,
        workspace: defaultFreeformWorkspace(),
      },
      structuredWorkspace: defaultStructuredWorkspace(),
      origins,
      cuts: [],
      selectedOriginId: DEFAULT_ORIGINS[0].id,
      selectedFork: null,
      playing: false,
    });
    syncViewGeometry(defaultState);
    return defaultState;
  }

  function serializableReplicationWorkspace(workspace, kind, sourceState = state) {
    const resolved = normaliseReplicationWorkspace(workspace, { kind, sourceState });
    return {
      ...resolved,
      origins: resolved.origins.map((origin) => ({ ...origin })),
      cuts: resolved.cuts.map((cut) => ({ ...cut })),
      selectedFork: resolved.selectedFork ? { ...resolved.selectedFork } : null,
    };
  }

  function serializableState() {
    const activeWorkspace = captureActiveReplicationWorkspace(state);
    const structuredWorkspace = serializableReplicationWorkspace(
      freeformGeometry(state) ? state.structuredWorkspace : activeWorkspace,
      "structured",
      state
    );
    const freeformWorkspace = serializableReplicationWorkspace(
      freeformGeometry(state) ? activeWorkspace : state.freeform?.workspace,
      "freeform",
      state
    );
    return {
      ...state,
      colors: { ...state.colors },
      layers: { ...state.layers },
      advanced: { ...state.advanced },
      structuredWorkspace,
      freeform: {
        selectedPathId: state.freeform?.selectedPathId || null,
        snapToStart: freeformSnapToStartEnabled(state),
        paths: (state.freeform?.paths || []).map((path) => ({
          id: path.id,
          closed: Boolean(path.closed),
          genomicLength: freeformPathGenomicLength(path, state),
          points: path.points.map((point) => ({ x: point.x, y: point.y })),
        })),
        workspace: freeformWorkspace,
      },
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
    const previousGeometry = geometryMode(state);
    stopAnimation();
    state = normaliseStateSchema(JSON.parse(value));
    state.playing = false;
    reseedNextOriginId(state);
    syncFreeformEditorFromState(state);
    syncViewGeometry(state);
    if (geometryMode(state) !== previousGeometry) viewState = fittedViewState(state);
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

  function resetMoleculeState() {
    const preservedGeometry = geometryMode(state);
    const preservedStyle = strandModel(state);
    state = makeDefaultState();
    state.advanced.strandModel = preservedStyle;
    if (preservedGeometry !== geometryMode(state)) {
      switchGeometryWorkspace(preservedGeometry, state);
    }
    dragState = null;
    hoverState = null;
    freeformEditor.eraserRadius = FREEFORM_ERASER_RADIUS;
    syncFreeformEditorFromState(state, { resetTool: true });
    syncViewGeometry(state);
    viewState = fittedViewState(state);
    return state;
  }

  function reset() {
    pushSnapshot();
    stopAnimation();
    pendingControlSnapshot = null;
    resetMoleculeState();
    syncControls();
    render();
    setStatus("Molecule and canvas reset");
  }

  function forkFlags() {
    return {
      left: true,
      right: true,
    };
  }

  function buildLinearRegions(origins, sourceState = state) {
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

  function getLinearReplicationModelAtTravel(travel, sourceState = state) {
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
              ? terminalEdgeBlend(leftPosition * moleculeWidthForState(sourceState), terminalPullSpan(0, "left", sourceState))
              : 0,
          rightEdgeBlend:
            index === sourceState.origins.length - 1 && flags.right
              ? terminalEdgeBlend(
                  (1 - rightPosition) * moleculeWidthForState(sourceState),
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
          (Math.max(0, rightOrigin.leftPosition - leftOrigin.rightPosition) * moleculeWidthForState(sourceState)) / 2;
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
      regions: buildLinearRegions(origins, sourceState),
      minimalClosures,
      activeForkCount: origins.reduce((count, origin) => count + Number(origin.leftActive) + Number(origin.rightActive), 0),
    };
  }

  function buildCircularRegions(origins, sourceState = state) {
    const intervals = origins
      .map((origin) => ({
        start: Number(origin.leftUnwrapped),
        end: Number(origin.rightUnwrapped),
        startBlend: origin.leftEdgeBlend || 0,
        endBlend: origin.rightEdgeBlend || 0,
        startClosureBlend: origin.leftClosureBlend || 0,
        endClosureBlend: origin.rightClosureBlend || 0,
        transitionSpan: Math.min(1, Math.max(0, Number(origin.rightUnwrapped) - Number(origin.leftUnwrapped))),
        originIds: [origin.id],
      }))
      .filter(
        (interval) =>
          Number.isFinite(interval.start) &&
          Number.isFinite(interval.end) &&
          interval.end - interval.start > EPSILON
      );

    if (intervals.some((interval) => interval.end - interval.start >= 1 - EPSILON)) {
      return [{
        start: 0,
        end: 1,
        openStart: true,
        openEnd: true,
        startBlend: 1,
        endBlend: 1,
        startClosureBlend: 1,
        endClosureBlend: 1,
        transitionSpan: 1,
        originIds: [...new Set(intervals.flatMap((interval) => interval.originIds))],
      }];
    }

    const segments = [];
    intervals.forEach((interval) => {
      const firstTurn = Math.floor(interval.start);
      const lastTurn = Math.floor(interval.end - Number.EPSILON);
      for (let turn = firstTurn; turn <= lastTurn; turn += 1) {
        const absoluteStart = Math.max(interval.start, turn);
        const absoluteEnd = Math.min(interval.end, turn + 1);
        if (absoluteEnd - absoluteStart <= EPSILON) continue;
        const seamStart = absoluteStart > interval.start + EPSILON;
        const seamEnd = absoluteEnd < interval.end - EPSILON;
        segments.push({
          start: clamp(absoluteStart - turn, 0, 1),
          end: clamp(absoluteEnd - turn, 0, 1),
          openStart: seamStart,
          openEnd: seamEnd,
          startBlend: seamStart ? 1 : interval.startBlend,
          endBlend: seamEnd ? 1 : interval.endBlend,
          startClosureBlend: seamStart ? 1 : interval.startClosureBlend,
          endClosureBlend: seamEnd ? 1 : interval.endClosureBlend,
          transitionSpan: interval.transitionSpan,
          originIds: [...interval.originIds],
        });
      }
    });

    segments.sort((first, second) => first.start - second.start || first.end - second.end);
    const merged = [];
    segments.forEach((segment) => {
      const current = merged.at(-1);
      if (!current || segment.start > current.end + EPSILON) {
        merged.push({ ...segment, originIds: [...segment.originIds] });
        return;
      }

      if (Math.abs(segment.start - current.start) <= EPSILON) {
        current.openStart = current.openStart || segment.openStart;
        current.startBlend = Math.max(current.startBlend || 0, segment.startBlend || 0);
        current.startClosureBlend = Math.max(
          current.startClosureBlend || 0,
          segment.startClosureBlend || 0
        );
      }
      if (segment.end > current.end + EPSILON) {
        current.end = segment.end;
        current.openEnd = segment.openEnd;
        current.endBlend = segment.endBlend;
        current.endClosureBlend = segment.endClosureBlend;
      } else if (Math.abs(segment.end - current.end) <= EPSILON) {
        current.openEnd = current.openEnd || segment.openEnd;
        current.endBlend = Math.max(current.endBlend || 0, segment.endBlend || 0);
        current.endClosureBlend = Math.max(
          current.endClosureBlend || 0,
          segment.endClosureBlend || 0
        );
      }
      current.transitionSpan = Math.max(current.transitionSpan || 0, segment.transitionSpan || 0);
      current.originIds.push(...segment.originIds);
    });

    const coverage = merged.reduce((total, region) => total + region.end - region.start, 0);
    if (coverage >= 1 - EPSILON) {
      return [{
        start: 0,
        end: 1,
        openStart: true,
        openEnd: true,
        startBlend: 1,
        endBlend: 1,
        startClosureBlend: 1,
        endClosureBlend: 1,
        transitionSpan: 1,
        originIds: [...new Set(merged.flatMap((region) => region.originIds))],
      }];
    }

    return merged.map((region) => ({
      ...region,
      originIds: [...new Set(region.originIds)],
      startBlend: region.openStart ? 1 : clamp(region.startBlend || 0, 0, 1),
      endBlend: region.openEnd ? 1 : clamp(region.endBlend || 0, 0, 1),
      startClosureBlend: region.openStart
        ? 1
        : clamp(region.startClosureBlend || 0, 0, 1),
      endClosureBlend: region.openEnd
        ? 1
        : clamp(region.endClosureBlend || 0, 0, 1),
    }));
  }

  function circularPairOrigins(origins, index) {
    const left = origins[index];
    const nextIndex = (index + 1) % origins.length;
    const next = origins[nextIndex];
    const rightStart = next.startPosition + (nextIndex === 0 ? 1 : 0);
    return {
      left,
      right: { ...next, startPosition: rightStart, position: rightStart },
      rightDescriptor: next,
      nextIndex,
      leftStart: left.startPosition,
      rightStart,
    };
  }

  function getCircularReplicationModelAtTravel(travel, sourceState = state) {
    const minimalClosures = [];
    const origins = [...sourceState.origins]
      .map((origin) => ({
        ...origin,
        startPosition: wrapFraction(origin.startPosition),
        position: wrapFraction(origin.startPosition),
      }))
      .sort((first, second) => first.startPosition - second.startPosition)
      .map((origin, index) => ({
        ...origin,
        index,
        flags: forkFlags(index),
        leftUnwrapped: origin.startPosition,
        rightUnwrapped: origin.startPosition,
        leftPosition: origin.startPosition,
        rightPosition: origin.startPosition,
        leftActive: true,
        rightActive: true,
        leftReason: null,
        rightReason: null,
        leftEdgeBlend: 0,
        rightEdgeBlend: 0,
        leftClosureBlend: 0,
        rightClosureBlend: 0,
      }));

    if (!origins.length) {
      return { origins: [], regions: [], minimalClosures: [], activeForkCount: 0 };
    }

    for (let index = 0; index < origins.length; index += 1) {
      const { left, right, rightDescriptor, nextIndex, leftStart, rightStart } =
        circularPairOrigins(origins, index);
      const rawRightTravel = rawForkTravelAt(travel, left.rightOffset);
      const rawLeftTravel = rawForkTravelAt(travel, right.leftOffset);
      const effectiveRightTravel = effectiveForkTravel(travel, left.rightOffset, sourceState);
      const effectiveLeftTravel = effectiveForkTravel(travel, right.leftOffset, sourceState);
      const rawRightPosition = leftStart + effectiveRightTravel;
      const rawLeftPosition = rightStart - effectiveLeftTravel;
      const meetingPoint = clamp(
        (leftStart + rightStart + left.rightOffset - right.leftOffset) / 2,
        leftStart,
        rightStart
      );
      const contacted = rawRightPosition >= rawLeftPosition - EPSILON;
      const resolvedRightPosition = contacted ? meetingPoint : rawRightPosition;
      const resolvedLeftPosition = contacted ? meetingPoint : rawLeftPosition;
      const leftVisible = resolvedRightPosition - leftStart > EPSILON;
      const rightVisible = rightStart - resolvedLeftPosition > EPSILON;

      if (!contacted && leftVisible && rightVisible) {
        const symmetricRemaining =
          (Math.max(0, resolvedLeftPosition - resolvedRightPosition) * moleculeWidthForState(sourceState)) / 2;
        const mergeBlend = terminalEdgeBlend(
          symmetricRemaining,
          terminalPullSpan(wrapFraction(meetingPoint), "right", sourceState)
        );
        left.rightEdgeBlend = Math.max(left.rightEdgeBlend, mergeBlend);
        rightDescriptor.leftEdgeBlend = Math.max(rightDescriptor.leftEdgeBlend, mergeBlend);
      }

      left.rightUnwrapped = resolvedRightPosition;
      left.rightPosition = wrapFraction(resolvedRightPosition);
      rightDescriptor.leftUnwrapped = resolvedLeftPosition - (nextIndex === 0 ? 1 : 0);
      rightDescriptor.leftPosition = wrapFraction(resolvedLeftPosition);
      left.rightActive = !contacted;
      rightDescriptor.leftActive = !contacted;
      left.rightReason = contacted ? "merge" : null;
      rightDescriptor.leftReason = contacted ? "merge" : null;

      if (contacted) {
        const closureMetrics = minimalMergeClosureMetrics(
          { ...left, startPosition: leftStart },
          { ...right, startPosition: rightStart },
          travel,
          sourceState
        );
        left.rightClosureBlend = closureMetrics.blend;
        rightDescriptor.leftClosureBlend = closureMetrics.blend;
        left.rightEdgeBlend = 1;
        rightDescriptor.leftEdgeBlend = 1;
        if (strandModel(sourceState) === "minimal") {
          const closureWidths = minimalMergeClosureWidths(
            {
              ...left,
              leftPosition: left.leftUnwrapped,
              rightPosition: resolvedRightPosition,
              startPosition: leftStart,
            },
            {
              ...right,
              leftPosition: resolvedLeftPosition,
              rightPosition: rightDescriptor.rightUnwrapped + (nextIndex === 0 ? 1 : 0),
              startPosition: rightStart,
            },
            meetingPoint,
            sourceState
          );
          minimalClosures.push({
            position: wrapFraction(meetingPoint),
            blend: closureMetrics.blend,
            leftWidth: closureWidths.left,
            rightWidth: closureWidths.right,
            leftOriginId: left.id,
            rightOriginId: rightDescriptor.id,
          });
        }
      }

      // Preserve the raw values for interaction diagnostics and tests.
      left.rawRightTravel = rawRightTravel;
      rightDescriptor.rawLeftTravel = rawLeftTravel;
    }

    const minimal = strandModel(sourceState) === "minimal";
    origins.forEach((origin) => {
      origin.circularSpan = clamp(origin.rightUnwrapped - origin.leftUnwrapped, 0, 1);
      origin.leftPosition = wrapFraction(origin.leftUnwrapped);
      origin.rightPosition = wrapFraction(origin.rightUnwrapped);
      origin.leftTerminalOpacity = minimal ? Number(origin.leftActive) : 1 - origin.leftEdgeBlend;
      origin.rightTerminalOpacity = minimal ? Number(origin.rightActive) : 1 - origin.rightEdgeBlend;
    });

    return {
      origins,
      regions: buildCircularRegions(origins, sourceState),
      minimalClosures,
      activeForkCount: origins.reduce(
        (count, origin) => count + Number(origin.leftActive) + Number(origin.rightActive),
        0
      ),
    };
  }

  function freeformComponentState(metric, travel, sourceState = state) {
    const span = Math.max(EPSILON, metric.span);
    const origins = sourceState.origins
      .filter((origin) => {
        const originMetric = freeformMetricById(origin.moleculeId, sourceState)
          || freeformMetricAtFraction(origin.startPosition, sourceState);
        return originMetric?.id === metric.id;
      })
      .map((origin) => {
        const localPosition = Number.isFinite(Number(origin.localPosition))
          ? metric.closed
            ? wrapFraction(origin.localPosition)
            : clamp(Number(origin.localPosition), 0, 1)
          : freeformFractionToLocal(origin.startPosition, metric, sourceState);
        return {
          ...origin,
          position: localPosition,
          startPosition: localPosition,
          leftOffset: Number(origin.leftOffset) / span,
          rightOffset: Number(origin.rightOffset) / span,
        };
      });
    return {
      ...sourceState,
      geometry: metric.closed ? "circular" : "linear",
      length: freeformComponentLength(metric, sourceState),
      forkTravel: Number(travel) / span,
      origins,
      cuts: [],
      freeform: { paths: [], selectedPathId: null },
      advanced: { ...sourceState.advanced, lengthMode: "scale" },
      __modelMoleculeWidth: metric.length,
    };
  }

  function mapFreeformModelPosition(metric, value, { wrap = false } = {}) {
    const local = wrap ? wrapFraction(value) : Number(value);
    return metric.start + local * metric.span;
  }

  function getFreeformReplicationModelAtTravel(travel, sourceState = state) {
    ensureFreeformOriginMetadata(sourceState, { preferLocal: true });
    const metrics = freeformPathMetrics(sourceState);
    if (!metrics.length || !sourceState.origins.length) {
      return { origins: [], regions: [], minimalClosures: [], activeForkCount: 0 };
    }

    const totalPathLength = metrics.reduce((total, metric) => total + metric.length, 0);
    const worldToLinear = VIEW.moleculeWidth / Math.max(EPSILON, totalPathLength);
    const origins = [];
    const regions = [];
    const minimalClosures = [];
    let activeForkCount = 0;

    metrics.forEach((metric) => {
      const localState = freeformComponentState(metric, travel, sourceState);
      if (!localState.origins.length) return;
      const localModel = metric.closed
        ? getCircularReplicationModelAtTravel(localState.forkTravel, localState)
        : getLinearReplicationModelAtTravel(localState.forkTravel, localState);
      activeForkCount += localModel.activeForkCount;

      localModel.origins.forEach((descriptor) => {
        const original = sourceState.origins.find((origin) => origin.id === descriptor.id) || descriptor;
        const localStartPosition = descriptor.startPosition;
        const mapped = {
          ...descriptor,
          ...original,
          position: mapFreeformModelPosition(metric, descriptor.position, { wrap: metric.closed }),
          startPosition: mapFreeformModelPosition(metric, localStartPosition, { wrap: metric.closed }),
          leftPosition: mapFreeformModelPosition(metric, descriptor.leftPosition, { wrap: metric.closed }),
          rightPosition: mapFreeformModelPosition(metric, descriptor.rightPosition, { wrap: metric.closed }),
          leftOffset: Number(descriptor.leftOffset) * metric.span,
          rightOffset: Number(descriptor.rightOffset) * metric.span,
          moleculeId: metric.id,
          localPosition: metric.closed ? wrapFraction(localStartPosition) : clamp(localStartPosition, 0, 1),
          localStartPosition,
          localLeftPosition: descriptor.leftPosition,
          localRightPosition: descriptor.rightPosition,
          componentId: metric.id,
          componentStart: metric.start,
          componentEnd: metric.end,
          componentClosed: metric.closed,
          componentSpan: metric.span,
        };
        if (Number.isFinite(Number(descriptor.leftUnwrapped))) {
          mapped.localLeftUnwrapped = descriptor.leftUnwrapped;
          mapped.leftUnwrapped = mapFreeformModelPosition(metric, descriptor.leftUnwrapped);
        }
        if (Number.isFinite(Number(descriptor.rightUnwrapped))) {
          mapped.localRightUnwrapped = descriptor.rightUnwrapped;
          mapped.rightUnwrapped = mapFreeformModelPosition(metric, descriptor.rightUnwrapped);
        }
        if (Number.isFinite(Number(descriptor.circularSpan))) {
          mapped.circularSpan = descriptor.circularSpan * metric.span;
        }
        origins.push(mapped);
      });

      localModel.regions.forEach((region) => {
        regions.push({
          ...region,
          start: mapFreeformModelPosition(metric, region.start),
          end: mapFreeformModelPosition(metric, region.end),
          transitionSpan: Number.isFinite(Number(region.transitionSpan))
            ? region.transitionSpan * metric.span
            : region.transitionSpan,
          componentId: metric.id,
          componentStart: metric.start,
          componentEnd: metric.end,
          componentClosed: metric.closed,
        });
      });

      (localModel.minimalClosures || []).forEach((closure) => {
        minimalClosures.push({
          ...closure,
          position: mapFreeformModelPosition(metric, closure.position, { wrap: metric.closed }),
          width: Number.isFinite(Number(closure.width)) ? closure.width * worldToLinear : closure.width,
          leftWidth: Number.isFinite(Number(closure.leftWidth))
            ? closure.leftWidth * worldToLinear
            : closure.leftWidth,
          rightWidth: Number.isFinite(Number(closure.rightWidth))
            ? closure.rightWidth * worldToLinear
            : closure.rightWidth,
          componentId: metric.id,
        });
      });
    });

    origins.sort((first, second) => first.startPosition - second.startPosition);
    origins.forEach((origin, index) => { origin.index = index; });
    regions.sort((first, second) => first.start - second.start || first.end - second.end);
    minimalClosures.sort((first, second) => first.position - second.position);
    return { origins, regions, minimalClosures, activeForkCount };
  }

  function getReplicationModelAtTravel(travel, sourceState = state) {
    if (freeformGeometry(sourceState)) return getFreeformReplicationModelAtTravel(travel, sourceState);
    return circularGeometry(sourceState)
      ? getCircularReplicationModelAtTravel(travel, sourceState)
      : getLinearReplicationModelAtTravel(travel, sourceState);
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

  function freeformForkTravelBounds(sourceState = state, { includeVisualClosure = false } = {}) {
    ensureFreeformOriginMetadata(sourceState, { preferLocal: true });
    const componentBounds = freeformPathMetrics(sourceState)
      .map((metric) => {
        const localState = freeformComponentState(metric, sourceState.forkTravel, sourceState);
        if (!localState.origins.length) return null;
        const bounds = includeVisualClosure
          ? forkTravelBounds(localState)
          : geometricForkTravelBounds(localState);
        return { zero: bounds.zero * metric.span, full: bounds.full * metric.span };
      })
      .filter(Boolean);
    if (!componentBounds.length) return { zero: 0, full: 0 };
    const zero = Math.min(...componentBounds.map((bounds) => bounds.zero));
    const full = Math.max(...componentBounds.map((bounds) => bounds.full));
    return { zero, full: Math.max(zero, full) };
  }

  function geometricForkTravelBounds(sourceState = state) {
    if (freeformGeometry(sourceState)) return freeformForkTravelBounds(sourceState);
    if (!sourceState.origins.length) return { zero: 0, full: 0 };
    const offsets = sourceState.origins.flatMap((origin) => [origin.leftOffset, origin.rightOffset]);
    const zero = -Math.max(...offsets);
    if (circularGeometry(sourceState)) {
      const origins = [...sourceState.origins]
        .map((origin) => ({ ...origin, startPosition: wrapFraction(origin.startPosition) }))
        .sort((first, second) => first.startPosition - second.startPosition);
      let full = zero;
      for (let index = 0; index < origins.length; index += 1) {
        const nextIndex = (index + 1) % origins.length;
        const leftOrigin = origins[index];
        const rightOrigin = {
          ...origins[nextIndex],
          startPosition: origins[nextIndex].startPosition + (nextIndex === 0 ? 1 : 0),
        };
        const gap = rightOrigin.startPosition - leftOrigin.startPosition;
        const naiveFull = Math.max(
          zero,
          gap - leftOrigin.rightOffset,
          gap - rightOrigin.leftOffset,
          (gap - leftOrigin.rightOffset - rightOrigin.leftOffset) / 2
        );
        full = Math.max(
          full,
          pairTravelForOverlap(leftOrigin, rightOrigin, 0, zero, naiveFull)
        );
      }
      return { zero, full: Math.max(zero, full) };
    }
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
    if (freeformGeometry(sourceState)) {
      return freeformForkTravelBounds(sourceState, { includeVisualClosure: true });
    }
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
    let origins = [...sourceState.origins].sort(
      (first, second) => first.startPosition - second.startPosition
    );
    let full = geometricBounds.full;

    if (circularGeometry(sourceState)) {
      // Stored structured coordinates deliberately distinguish the two linear
      // endpoints. Periodic timing must not: canonicalise only these model
      // copies so an origin retained at 1 behaves exactly like one at 0.
      origins = origins
        .map((origin) => ({ ...origin, startPosition: wrapFraction(origin.startPosition) }))
        .sort((first, second) => first.startPosition - second.startPosition);
      for (let index = 0; index < origins.length; index += 1) {
        const nextIndex = (index + 1) % origins.length;
        const leftOrigin = origins[index];
        const rightOrigin = {
          ...origins[nextIndex],
          startPosition: origins[nextIndex].startPosition + (nextIndex === 0 ? 1 : 0),
        };
        full = Math.max(
          full,
          minimalPairClosureCompletionTravel(
            leftOrigin,
            rightOrigin,
            sourceState,
            geometricBounds
          )
        );
      }
      return { zero: geometricBounds.zero, full: Math.max(geometricBounds.zero, full) };
    }

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
    if (freeformGeometry(sourceState)) {
      changed = updateFreeformOriginMetadataFromGlobal(sourceState) || changed;
    }
    return changed;
  }

  function replicationRegionsAtPosition(position, model, sourceState = state) {
    const regions = model?.regions || [];
    if (!freeformGeometry(sourceState)) return regions;
    const metric = freeformMetricAtFraction(position, sourceState);
    if (!metric) return [];
    const cache =
      artworkComputationCache?.model === model &&
      artworkComputationCache?.sourceState === sourceState
        ? artworkComputationCache.replicationRegions
        : null;
    if (cache?.has(metric.id)) return cache.get(metric.id);
    const componentRegions = regions.filter(
      (region) => region.componentId === metric.id
    );
    cache?.set(metric.id, componentRegions);
    return componentRegions;
  }

  function regionsShareComponent(first, second) {
    const firstId = first?.componentId;
    const secondId = second?.componentId;
    if (firstId === undefined && secondId === undefined) return true;
    return firstId !== undefined && firstId === secondId;
  }

  function replicationAt(x, model) {
    const cache =
      artworkComputationCache?.model === model &&
      artworkComputationCache?.sourceState === state
        ? artworkComputationCache.replication
        : null;
    if (cache?.has(x)) return cache.get(x);
    const position = circularGeometry() ? geometryFractionAtX(x) : (x - VIEW.x0) / VIEW.moleculeWidth;
    const componentRegions = replicationRegionsAtPosition(position, model);
    const componentMetric = freeformGeometry() ? freeformMetricAtFraction(position, state) : null;
    const periodic = circularGeometry() || componentMetric?.closed
      ? periodicRegionAtPosition(position, { ...model, regions: componentRegions }, state)
      : null;
    const region = periodic?.region || componentRegions.find(
      (item) => position >= item.start - EPSILON && position <= item.end + EPSILON
    );
    if (!region) {
      const empty = { amount: 0, profile: 0, region: null, evaluationX: x };
      cache?.set(x, empty);
      return empty;
    }

    // A bubble that crosses genomic zero is stored as two clipped display
    // regions. Evaluate those pieces as one unwrapped interval so the strand
    // envelope remains continuous while a fork passes through the seam.
    const evaluationPosition = periodic?.position ?? position;
    const evaluationX = periodic?.region?.periodicJoin
      ? VIEW.x0 + evaluationPosition * VIEW.moleculeWidth
      : x;
    const startX = VIEW.x0 + region.start * VIEW.moleculeWidth;
    const endX = VIEW.x0 + region.end * VIEW.moleculeWidth;
    const startTransitionWidth = regionEdgeTransitionWidth(region, "start", model);
    const endTransitionWidth = regionEdgeTransitionWidth(region, "end", model);
    const leftEdgeBlend = region.openStart ? 1 : region.startBlend || 0;
    const rightEdgeBlend = region.openEnd ? 1 : region.endBlend || 0;
    const leftProfile =
      leftEdgeBlend + (1 - leftEdgeBlend) * transitionProfile((evaluationX - startX) / startTransitionWidth);
    const rightProfile =
      rightEdgeBlend + (1 - rightEdgeBlend) * transitionProfile((endX - evaluationX) / endTransitionWidth);
    const profile = Math.min(leftProfile, rightProfile);

    const result = {
      amount: renderedDaughterHalfSpacing(state) * profile,
      profile,
      region,
      evaluationX,
    };
    cache?.set(x, result);
    return result;
  }

  function minimalReplicationAt(x, model, sourceState = state) {
    const cache =
      artworkComputationCache?.model === model &&
      artworkComputationCache?.sourceState === sourceState
        ? artworkComputationCache.minimalReplication
        : null;
    if (cache?.has(x)) return cache.get(x);
    const position = circularGeometry(sourceState)
      ? geometryFractionAtX(x, sourceState)
      : (x - VIEW.x0) / VIEW.moleculeWidth;
    const componentRegions = replicationRegionsAtPosition(position, model, sourceState);
    const componentMetric = freeformGeometry(sourceState)
      ? freeformMetricAtFraction(position, sourceState)
      : null;
    const periodic = circularGeometry(sourceState) || componentMetric?.closed
      ? periodicRegionAtPosition(position, { ...model, regions: componentRegions }, sourceState)
      : null;
    const region = periodic?.region || componentRegions.find(
      (item) => position >= item.start - EPSILON && position <= item.end + EPSILON
    );
    if (!region) {
      const empty = { amount: 0, profile: 0, region: null, evaluationX: x };
      cache?.set(x, empty);
      return empty;
    }

    const evaluationPosition = periodic?.position ?? position;
    const evaluationX = periodic?.region?.periodicJoin
      ? VIEW.x0 + evaluationPosition * VIEW.moleculeWidth
      : x;
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
          (evaluationX - startX) /
            minimalRegionEdgeTransitionWidth(region, "start", model, sourceState),
          sourceState
        );
    const rightProfile =
      rightBlend +
      (1 - rightBlend) *
        transitionProfile(
          (endX - evaluationX) /
            minimalRegionEdgeTransitionWidth(region, "end", model, sourceState),
          sourceState
        );
    let profile = Math.min(leftProfile, rightProfile);

    (model.minimalClosures || []).forEach((closure) => {
      if (
        !regionsShareComponent(region, closure) ||
        closure.position < region.start - EPSILON ||
        closure.position > region.end + EPSILON ||
        closure.blend >= 1 - EPSILON
      ) {
        return;
      }
      const closureX = VIEW.x0 + closure.position * VIEW.moleculeWidth;
      const closureBlend = clamp(closure.blend || 0, 0, 1);
      const closureWidth =
        evaluationX <= closureX
          ? closure.leftWidth ?? closure.width
          : closure.rightWidth ?? closure.width;
      const closureProfile =
        closureBlend +
        (1 - closureBlend) *
          transitionProfile(
            Math.abs(evaluationX - closureX) / Math.max(EPSILON, closureWidth),
            sourceState
          );
      profile = Math.min(profile, closureProfile);
    });

    const result = {
      amount: renderedDaughterHalfSpacing(sourceState) * profile,
      profile,
      region,
      evaluationX,
    };
    cache?.set(x, result);
    return result;
  }

  function visualReplicationAt(x, model) {
    if (strandModel() === "minimal") return minimalReplicationAt(x, model);
    const cache =
      artworkComputationCache?.model === model &&
      artworkComputationCache?.sourceState === state
        ? artworkComputationCache.visualReplication
        : null;
    if (cache?.has(x)) return cache.get(x);
    const replication = replicationAt(x, model);
    if (replication.region || !model.regions.length) {
      cache?.set(x, replication);
      return replication;
    }

    const position = circularGeometry() ? geometryFractionAtX(x) : (x - VIEW.x0) / VIEW.moleculeWidth;
    const componentMetric = freeformGeometry() ? freeformMetricAtFraction(position, state) : null;
    const regions = replicationRegionsAtPosition(position, model, state);
    if (!regions.length) {
      cache?.set(x, replication);
      return replication;
    }
    const periodicSpan = circularGeometry()
      ? 1
      : componentMetric?.closed
        ? componentMetric.span
        : 0;
    let previousRegion;
    let nextRegion;
    let previousEnd;
    let nextStart;
    if (periodicSpan > EPSILON) {
      const extended = [-1, 0, 1]
        .flatMap((turn) =>
          regions.map((region) => ({
            region,
            start: region.start + turn * periodicSpan,
            end: region.end + turn * periodicSpan,
          }))
        )
        .sort((first, second) => first.start - second.start);
      const previous = [...extended]
        .reverse()
        .find((candidate) => candidate.end < position + EPSILON);
      const next = extended.find((candidate) => candidate.start > position - EPSILON);
      previousRegion = previous?.region || null;
      nextRegion = next?.region || null;
      previousEnd = previous?.end;
      nextStart = next?.start;
    } else {
      const nextIndex = regions.findIndex((region) => position < region.start - EPSILON);
      previousRegion = nextIndex < 0 ? regions.at(-1) : regions[nextIndex - 1];
      nextRegion = nextIndex < 0 ? null : regions[nextIndex];
      previousEnd = previousRegion?.end;
      nextStart = nextRegion?.start;
    }
    let profile = 0;

    if (!previousRegion && nextRegion) {
      profile = nextRegion.startBlend || 0;
    } else if (previousRegion && !nextRegion) {
      profile = previousRegion.endBlend || 0;
    } else if (previousRegion && nextRegion) {
      const gapWidth = Math.max(EPSILON, nextStart - previousEnd);
      const gapProgress = clamp((position - previousEnd) / gapWidth, 0, 1);
      const previousBlend = previousRegion.endBlend || 0;
      const nextBlend = nextRegion.startBlend || 0;
      profile = previousBlend + (nextBlend - previousBlend) * smoothstep(gapProgress);
    }

    if (profile <= EPSILON) {
      cache?.set(x, replication);
      return replication;
    }
    const result = {
      amount: renderedDaughterHalfSpacing(state) * profile,
      profile,
      region: null,
      visualBridge: true,
    };
    cache?.set(x, result);
    return result;
  }

  function connectedStrandShiftFraction(sourceState = state) {
    return strandPhaseShift(sourceState) / Math.max(1, basePairLattice(sourceState).subdivisionCount);
  }

  function freeformHelixParameterMap(sourceState = state) {
    const freeform = sourceState?.freeform;
    const paths = freeform?.paths;
    const cached = freeformHelixCache.get(sourceState);
    if (cached && cached.freeform === freeform && cached.paths === paths) return cached.parameters;

    const metrics = freeformPathMetrics(sourceState);
    const parameters = new Map();
    const endpointRecords = [];
    metrics.forEach((metric) => {
      const rawTurns = Math.max(0.1, freeformComponentLength(metric, sourceState) / BASE_PAIRS_PER_TURN);
      if (metric.closed) {
        const rawCrossovers = Math.max(1, Math.round(rawTurns * 2));
        const turns = Math.max(1, Math.round(rawCrossovers / 2));
        parameters.set(metric.id, {
          turns,
          rawTurns,
          phaseOffset: 0,
          connectedStart: false,
          connectedEnd: false,
          adjustedTurns: Math.abs(turns - rawTurns) > EPSILON,
          orientation: 1,
        });
        return;
      }
      ["start", "end"].forEach((end) => {
        const localPosition = end === "start" ? 0 : 1;
        const point = pointOnFreeformMetric(metric, localPosition);
        endpointRecords.push({
          key: `${metric.id}:${end}`,
          metric,
          end,
          localPosition,
          rawTurns,
          point,
        });
      });
    });

    const connections = [];
    for (let first = 0; first < endpointRecords.length; first += 1) {
      for (let second = first + 1; second < endpointRecords.length; second += 1) {
        const firstEndpoint = endpointRecords[first];
        const secondEndpoint = endpointRecords[second];
        if (firstEndpoint.metric.id === secondEndpoint.metric.id) continue;
        if (
          Math.hypot(
            firstEndpoint.point.x - secondEndpoint.point.x,
            firstEndpoint.point.y - secondEndpoint.point.y
          ) <= FREEFORM_CONNECTION_EPSILON
        ) {
          connections.push([firstEndpoint, secondEndpoint]);
        }
      }
    }

    const neighbours = new Map(metrics.map((metric) => [metric.id, []]));
    const connectedEnds = new Map(metrics.map((metric) => [metric.id, new Set()]));
    connections.forEach(([first, second]) => {
      const orientationFactor = first.end === second.end ? -1 : 1;
      neighbours.get(first.metric.id)?.push({ own: first, other: second, orientationFactor });
      neighbours.get(second.metric.id)?.push({ own: second, other: first, orientationFactor });
      connectedEnds.get(first.metric.id)?.add(first.end);
      connectedEnds.get(second.metric.id)?.add(second.end);
    });

    metrics.forEach((metric) => {
      if (parameters.has(metric.id)) return;
      const rawTurns = Math.max(0.1, freeformComponentLength(metric, sourceState) / BASE_PAIRS_PER_TURN);
      const rootEnds = connectedEnds.get(metric.id) || new Set();
      parameters.set(metric.id, {
        turns: rawTurns,
        rawTurns,
        phaseOffset: 0,
        connectedStart: rootEnds.has("start"),
        connectedEnd: rootEnds.has("end"),
        adjustedTurns: false,
        orientation: 1,
      });
      const queue = [metric.id];
      while (queue.length) {
        const current = queue.shift();
        const currentParameters = parameters.get(current);
        (neighbours.get(current) || []).forEach(({ own, other, orientationFactor }) => {
          if (parameters.has(other.metric.id)) return;
          const ownPhase = wrapFraction(
            currentParameters.phaseOffset + own.localPosition * currentParameters.turns
          );
          const targetPhase = own.end === other.end
            ? wrapFraction(0.5 - ownPhase)
            : ownPhase;
          const otherTurns = Math.max(
            0.1,
            freeformComponentLength(other.metric, sourceState) / BASE_PAIRS_PER_TURN
          );
          const otherEnds = connectedEnds.get(other.metric.id) || new Set();
          parameters.set(other.metric.id, {
            turns: otherTurns,
            rawTurns: otherTurns,
            phaseOffset: wrapFraction(targetPhase - other.localPosition * otherTurns),
            connectedStart: otherEnds.has("start"),
            connectedEnd: otherEnds.has("end"),
            adjustedTurns: false,
            orientation: currentParameters.orientation * orientationFactor,
          });
          queue.push(other.metric.id);
        });
      }
    });

    freeformHelixCache.set(sourceState, { freeform, paths, parameters });
    return parameters;
  }

  function freeformHelixParameters(metricOrId, sourceState = state) {
    const metric = typeof metricOrId === "string"
      ? freeformMetricById(metricOrId, sourceState)
      : metricOrId;
    if (!metric) {
      return {
        turns: 1,
        rawTurns: 1,
        phaseOffset: 0,
        connectedStart: false,
        connectedEnd: false,
        adjustedTurns: false,
        orientation: 1,
      };
    }
    return freeformHelixParameterMap(sourceState).get(metric.id) || {
      turns: Math.max(0.1, freeformComponentLength(metric, sourceState) / BASE_PAIRS_PER_TURN),
      rawTurns: Math.max(0.1, freeformComponentLength(metric, sourceState) / BASE_PAIRS_PER_TURN),
      phaseOffset: 0,
      connectedStart: false,
      connectedEnd: false,
      adjustedTurns: false,
      orientation: 1,
    };
  }

  function freeformComponentCrossoverCount(metric, sourceState = state) {
    const helix = freeformHelixParameters(metric, sourceState);
    const raw = Math.max(1, Math.round(helix.turns * 2));
    return metric.closed ? Math.max(2, Math.round(raw / 2) * 2) : raw;
  }

  function helixWave(
    x,
    track = "a",
    sourceState = state,
    preferredPathId = null
  ) {
    if (strandModel(sourceState) !== "standard") return 0;
    let fraction;
    let turns;
    let phaseOffset = 0;
    let shift = connectedStrandShiftFraction(sourceState);
    if (freeformGeometry(sourceState)) {
      const rawGlobalFraction =
        (Number(x) - VIEW.x0) /
        Math.max(EPSILON, moleculeWidthForState(sourceState));
      const canonicalFraction = geometryFractionAtX(x, sourceState);
      const preferredMetric = preferredPathId
        ? freeformMetricById(preferredPathId, sourceState)
        : null;
      const metric = preferredMetric || freeformMetricAtFraction(canonicalFraction, sourceState);
      if (!metric) return 0;
      const globalFraction = preferredMetric?.closed
        ? rawGlobalFraction
        : canonicalFraction;
      fraction = freeformFractionToLocal(globalFraction, metric, sourceState);
      const helix = freeformHelixParameters(metric, sourceState);
      turns = helix.turns;
      phaseOffset = helix.phaseOffset;
      // Keep the optional longitudinal partner offset equal across connected
      // pieces. Same-end joins reverse it with the path orientation so both
      // template colours, rather than only template A, meet continuously.
      shift =
        (helix.orientation * strandPhaseShift(sourceState)) /
        (Math.max(EPSILON, turns) * 2 * (basePairResolution(sourceState) + 1));
    } else {
      fraction = circularGeometry(sourceState)
        ? geometryFractionAtX(x, sourceState)
        : (x - VIEW.x0) / VIEW.moleculeWidth;
      turns = circularGeometry(sourceState)
        ? crossoverCount(sourceState) / 2
        : sourceState.length / BASE_PAIRS_PER_TURN;
    }
    const partnerTrack = track === "b" || track === "top";
    const circularPhase = circularGeometry(sourceState)
      ? circularHelixPhase(sourceState)
      : phaseOffset;
    const phase =
      (fraction * turns + circularPhase + (partnerTrack ? shift * turns : 0)) *
        Math.PI *
        2 +
      (partnerTrack ? Math.PI : 0);
    return Math.cos(phase) * renderedDoubleStrandHalfHeight(sourceState);
  }

  function crossoverCount(sourceState = state) {
    const count = Math.max(1, Math.round((sourceState.length / BASE_PAIRS_PER_TURN) * 2));
    // A closed duplex must return each strand to its own phase at the seam.
    // Use the nearest complete turn in circular geometry while retaining the
    // existing half-turn resolution for linear DNA.
    return circularGeometry(sourceState) ? Math.max(2, Math.round(count / 2) * 2) : count;
  }

  function basePairLattice(sourceState = state) {
    const cache = artworkComputationCache?.lattices;
    if (cache?.has(sourceState)) return cache.get(sourceState);
    const resolution = basePairResolution(sourceState);
    const subdivisionCount = crossoverCount(sourceState) * (resolution + 1);
    // The helix begins and ends halfway between crossovers. When the number of
    // subdivisions per crossover is odd (an even resolution), the crossover-
    // anchored lattice therefore begins half a base-pair step inside each end.
    const edgeOffset = circularGeometry(sourceState) ? 0 : resolution % 2 === 0 ? 0.5 : 0;
    const lattice = {
      subdivisionCount,
      edgeOffset,
      count: subdivisionCount - edgeOffset * 2,
    };
    cache?.set(sourceState, lattice);
    return lattice;
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

  function interactiveRenderDetail(sourceState = state) {
    if (renderDetailOverride === "full") return false;
    if (renderDetailOverride === "fast") return true;
    if (dragState) return false;
    const mode = previewDetailMode();
    if (mode === "fast") return true;
    return mode === "auto" && Boolean(sourceState?.playing);
  }

  function previewDetailFactor(sourceState = state) {
    if (renderDetailOverride === "full" || previewDetailMode() === "full") return 1;
    if (renderDetailOverride === "fast" || previewDetailMode() === "fast") return 2.35;
    if (interactiveRenderDetail(sourceState)) return 1.7;
    return basePairCount(sourceState) > 360 ? 1.2 : 1;
  }

  function basePairDisplayStep(sourceState = state) {
    // Direct manipulation keeps the exact same rung lattice as the released
    // state. Only playback may thin exceptionally dense previews.
    const count = basePairCount(sourceState);
    if (!interactiveRenderDetail(sourceState) || count <= 220) return 1;
    const target = previewDetailMode() === "fast" || renderDetailOverride === "fast" ? 150 : 230;
    return Math.max(1, Math.ceil(count / target));
  }

  function displayedBasePairPositions(sourceState = state) {
    const count = basePairCount(sourceState);
    const step = basePairDisplayStep(sourceState);
    const positions = [];
    for (let position = 0; position < count; position += step) positions.push(position);
    if (!circularGeometry(sourceState)) positions.push(count);
    return positions;
  }

  function stableStringHash(value) {
    let hash = 2166136261;
    for (const character of String(value || "")) {
      hash ^= character.codePointAt(0);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash >>> 0;
  }

  function freeformComponentVisualState(metric, sourceState = state) {
    const helix = freeformHelixParameters(metric, sourceState);
    return {
      ...sourceState,
      geometry: metric?.closed ? "circular" : "linear",
      length: helix.adjustedTurns
        ? helix.turns * BASE_PAIRS_PER_TURN
        : freeformComponentLength(metric, sourceState),
      basePairSeed:
        (Math.trunc(Number(sourceState?.basePairSeed) || DEFAULTS.basePairSeed) ^
          stableStringHash(metric?.id)) >>> 0,
      freeform: { paths: [], selectedPathId: null, snapToStart: false, workspace: null },
      advanced: { ...(sourceState?.advanced || {}), lengthMode: "scale" },
      __modelMoleculeWidth: metric?.length || BASE_MOLECULE_WIDTH,
    };
  }

  function helixPhaseSamplingParameters(metric = null, sourceState = state) {
    const resolution = basePairResolution(sourceState);
    if (metric) {
      const helix = freeformHelixParameters(metric, sourceState);
      return {
        turns: Math.max(EPSILON, helix.turns),
        phaseOffset: helix.phaseOffset,
        partnerPhaseOffset:
          (helix.orientation * strandPhaseShift(sourceState)) /
          (2 * (resolution + 1)),
        closed: metric.closed,
      };
    }
    const turns = circularGeometry(sourceState)
      ? crossoverCount(sourceState) / 2
      : Math.max(0.1, Number(sourceState?.length) / BASE_PAIRS_PER_TURN);
    return {
      turns,
      phaseOffset: circularGeometry(sourceState) ? circularHelixPhase(sourceState) : 0,
      partnerPhaseOffset: connectedStrandShiftFraction(sourceState) * turns,
      closed: circularGeometry(sourceState),
    };
  }

  function helixPhaseSites(parameters, phaseStep, translationSteps = 0) {
    const turns = Math.max(EPSILON, Number(parameters?.turns) || 0);
    const step = Math.max(EPSILON, Number(phaseStep) || 0);
    const phaseOrigin =
      0.25 -
      (Number(parameters?.partnerPhaseOffset) || 0) / 2 -
      (Number(parameters?.phaseOffset) || 0) +
      (Number(translationSteps) || 0) * step;
    const sites = [];

    if (parameters?.closed) {
      const count = Math.max(1, Math.round(turns / step));
      for (let phaseIndex = 0; phaseIndex < count; phaseIndex += 1) {
        sites.push({
          phaseIndex,
          localFraction: wrapFraction((phaseOrigin + phaseIndex * step) / turns),
        });
      }
    } else {
      const tolerance = 1e-10;
      const firstIndex = Math.ceil(-phaseOrigin / step - tolerance);
      const lastIndex = Math.floor((turns - phaseOrigin) / step + tolerance);
      for (let phaseIndex = firstIndex; phaseIndex <= lastIndex; phaseIndex += 1) {
        sites.push({
          phaseIndex,
          localFraction: clamp((phaseOrigin + phaseIndex * step) / turns, 0, 1),
        });
      }
    }

    return sites.sort(
      (first, second) =>
        first.localFraction - second.localFraction || first.phaseIndex - second.phaseIndex
    );
  }

  function standardBasePairPhaseSites(metric = null, sourceState = state) {
    const phaseStep = 0.5 / (basePairResolution(sourceState) + 1);
    return helixPhaseSites(
      helixPhaseSamplingParameters(metric, sourceState),
      phaseStep,
      basePairTranslation(sourceState)
    );
  }

  function structuredBasePairSites(sourceState = state) {
    if (strandModel(sourceState) !== "standard") {
      return displayedBasePairPositions(sourceState).map((index) => ({
        index,
        localFraction: basePairFraction(index, sourceState),
      }));
    }
    const displayStep = basePairDisplayStep(sourceState);
    return standardBasePairPhaseSites(null, sourceState)
      .filter((site, index) => index % displayStep === 0)
      .map((site, index) => ({ ...site, index }));
  }

  function freeformBasePairSites(sourceState = state) {
    if (!freeformGeometry(sourceState)) return [];
    return freeformPathMetrics(sourceState).flatMap((metric) => {
      const componentState = freeformComponentVisualState(metric, sourceState);
      const helix = freeformHelixParameters(metric, sourceState);
      const phaseSites = strandModel(sourceState) === "standard"
        ? standardBasePairPhaseSites(metric, sourceState)
        : displayedBasePairPositions(componentState).map((index) => ({
            phaseIndex: index,
            localFraction: basePairFraction(index, componentState),
          }));
      const displayStep = basePairDisplayStep(componentState);
      return phaseSites
        .filter((site, index) => index % displayStep === 0)
        .map((site, index) => {
          const { localFraction } = site;
          const fraction = metric.start + localFraction * metric.span;
          return {
            index,
            phaseIndex: site.phaseIndex,
            pathId: metric.id,
            localFraction,
            fraction,
            x: VIEW.x0 + fraction * VIEW.moleculeWidth,
            componentState,
          };
        })
        .filter((site) =>
          !(helix.connectedStart && site.localFraction <= EPSILON) &&
          !(helix.connectedEnd && site.localFraction >= 1 - EPSILON)
        );
    });
  }

  function crossoverSites(sourceState = state) {
    const cache = artworkComputationCache?.crossoverSites;
    if (cache?.has(sourceState)) return cache.get(sourceState);
    if (freeformGeometry(sourceState)) {
      const sites = [];
      let globalIndex = 0;
      freeformPathMetrics(sourceState).forEach((metric) => {
        const componentSites = helixPhaseSites(
          helixPhaseSamplingParameters(metric, sourceState),
          0.5
        );
        componentSites.forEach((site, componentIndex) => {
          const local = site.localFraction;
          const fraction = metric.start + local * metric.span;
          sites.push({
            index: site.phaseIndex,
            globalIndex: globalIndex++,
            componentIndex,
            componentCount: componentSites.length,
            pathId: metric.id,
            fraction,
            localFraction: local,
            x: VIEW.x0 + fraction * VIEW.moleculeWidth,
          });
        });
      });
      sites.sort((first, second) => first.x - second.x);
      cache?.set(sourceState, sites);
      return sites;
    }

    const sites = helixPhaseSites(helixPhaseSamplingParameters(null, sourceState), 0.5)
      .map((site) => {
        const fraction = site.localFraction;
        return {
          index: site.phaseIndex,
          fraction,
          x: VIEW.x0 + fraction * VIEW.moleculeWidth,
        };
      })
      .sort((first, second) => first.x - second.x);
    cache?.set(sourceState, sites);
    return sites;
  }

  function crossoverClipHalfWidth(multiplier = 1.15, minimum = 3.5, sourceState = state) {
    const aspect = Math.max(EPSILON, artworkScaleX(sourceState));
    const configuredLength = Math.max(
      CONTROL_RANGES.length.min,
      Number(sourceState?.length) || DEFAULTS.length
    );
    const lengthScale = CROSSOVER_REFERENCE_LENGTH / configuredLength;
    // A contour is an outer stroke, so crossover cutouts and replacement
    // overpasses must clear its full visible width rather than only the inner
    // strand. This prevents the outline of the underpassing strand leaking
    // through at a crossover in either handedness.
    const visibleStrandWidth = contourEnabled(sourceState)
      ? contourStrokeWidth(sourceState.weight, sourceState)
      : sourceState.weight;
    const nominalScreenHalfWidth = Math.max(minimum, visibleStrandWidth * multiplier) * lengthScale;
    const crossoverSpacingScreen = (VIEW.moleculeWidth / crossoverCount(sourceState)) * aspect;
    const spacingLimitedHalfWidth = crossoverSpacingScreen * 0.42;
    const strandSafeHalfWidth = visibleStrandWidth / 2 + 0.5;
    const screenHalfWidth = Math.max(
      strandSafeHalfWidth,
      Math.min(nominalScreenHalfWidth, spacingLimitedHalfWidth)
    );
    return screenHalfWidth / aspect;
  }

  function crossoverNear(x, sourceState = state, preferredPathId = null) {
    const preferredMetric = freeformGeometry(sourceState)
      ? freeformMetricById(preferredPathId, sourceState) ||
        freeformMetricAtFraction(geometryFractionAtX(x, sourceState), sourceState)
      : null;
    const periodicWidth = circularGeometry(sourceState)
      ? VIEW.moleculeWidth
      : preferredMetric?.closed
        ? preferredMetric.span * VIEW.moleculeWidth
        : 0;
    const site = crossoverSites(sourceState).reduce((nearest, candidate) => {
      if (
        preferredMetric &&
        candidate.pathId &&
        candidate.pathId !== preferredMetric.id
      ) {
        return nearest;
      }
      const directDistance = Math.abs(x - candidate.x);
      const distance = periodicWidth > EPSILON
        ? Math.abs(
            directDistance -
              Math.round(directDistance / periodicWidth) * periodicWidth
          )
        : directDistance;
      return !nearest || distance < nearest.distance ? { ...candidate, distance } : nearest;
    }, null);
    const halfGap = crossoverClipHalfWidth(1.15, 3.5, sourceState);
    return site && site.distance <= halfGap ? site : null;
  }

  function isUnderpassGap(x, strand, model, preferredPathId = null) {
    if (!state.advanced.crossoverGaps || strandModel() !== "standard") return false;
    const crossover = crossoverNear(x, state, preferredPathId);
    if (!crossover) return false;
    const replication = replicationAt(crossover.x, model);
    const aIsOver = crossoverAIsOver(crossover.index);

    if (!replication.region || replication.profile < NASCENT_PROFILE_THRESHOLD) {
      if (strand === "a") return !aIsOver;
      if (strand === "b") return aIsOver;
      return false;
    }

    if (!state.layers.newDna) return false;
    if (strand === "a") return !aIsOver;
    if (strand === "top") return aIsOver;
    if (strand === "b") return aIsOver;
    if (strand === "bottom") return !aIsOver;
    return false;
  }

  function templateY(x, strand, model) {
    const modelName = strandModel();
    const replication = visualReplicationAt(x, model);
    if (modelName === "elegant") {
      const halfHeight = renderedDoubleStrandHalfHeight();
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

  function nascentY(
    x,
    daughter,
    model = getReplicationModel(),
    sourceState = state,
    preferredPathId = null
  ) {
    const daughterOffset = renderedDaughterHalfSpacing(sourceState);
    const modelName = strandModel(sourceState);
    if (modelName === "minimal") {
      const replication = replicationAt(x, model);
      return daughter === "top" ? VIEW.centerY - replication.amount : VIEW.centerY + replication.amount;
    }
    if (modelName === "elegant") {
      const replication = replicationAt(x, model);
      const halfHeight = renderedDoubleStrandHalfHeight(sourceState);
      return daughter === "top"
        ? VIEW.centerY - replication.amount + halfHeight
        : VIEW.centerY + replication.amount - halfHeight;
    }
    return daughter === "top"
      ? VIEW.centerY - daughterOffset + helixWave(x, "top", sourceState, preferredPathId)
      : VIEW.centerY + daughterOffset + helixWave(x, "bottom", sourceState, preferredPathId);
  }

  function regionTransitionWidth(region, sourceState = state) {
    const cache =
      artworkComputationCache?.sourceState === sourceState
        ? artworkComputationCache.regionTransitionWidths
        : null;
    if (cache?.has(region)) return cache.get(region);
    const span = circularGeometry(sourceState) && Number.isFinite(region?.transitionSpan)
      ? region.transitionSpan
      : region.end - region.start;
    const width = Math.max(1, span * VIEW.moleculeWidth);
    const tightness = transitionTightness(sourceState);
    const smoothWidth = 52;
    const maximumScreenWidth =
      tightness < 0
        ? smoothWidth + (sourceState.daughterSpacing / 2 - smoothWidth) * -tightness
        : 0.75 + 51.25 * (1 - tightness) ** 2;
    if (freeformGeometry(sourceState)) {
      const metric =
        freeformMetricById(region?.componentId, sourceState) ||
        freeformMetricAtFraction((Number(region?.start) + Number(region?.end)) / 2, sourceState);
      if (metric) {
        const componentCoordinateWidth = metric.span * VIEW.moleculeWidth;
        const coordinatePerArcLength =
          componentCoordinateWidth / Math.max(EPSILON, metric.length);
        const regionArcLength =
          (Math.max(0, span) / Math.max(EPSILON, metric.span)) * metric.length;
        const averageAspect = Math.sqrt(
          Math.max(EPSILON, artworkAspectX(sourceState) * artworkAspectY(sourceState))
        );
        const maximumArcLength = maximumScreenWidth / averageAspect;
        // Transition distances belong to their painted component. Expressing
        // the result back in the global render coordinate keeps the same fork
        // envelope when unrelated DNA pieces are added or removed.
        const result =
          Math.min(maximumArcLength, regionArcLength / 2) *
          coordinatePerArcLength;
        cache?.set(region, result);
        return result;
      }
    }
    const maximumWorldWidth =
      maximumScreenWidth / Math.max(EPSILON, artworkAspectX(sourceState));
    const result = Math.min(maximumWorldWidth, width / 2);
    cache?.set(region, result);
    return result;
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

  function facingRegionForEdge(region, side, model, sourceState = state) {
    if (!model?.regions?.length) return null;
    const componentRegions = freeformGeometry(sourceState) && region?.componentId
      ? model.regions.filter((candidate) => candidate.componentId === region.componentId)
      : model.regions;
    const regionIndex = componentRegions.indexOf(region);
    if (regionIndex < 0) return null;
    const adjacentIndex = side === "start" ? regionIndex - 1 : regionIndex + 1;
    if (componentRegions[adjacentIndex]) return componentRegions[adjacentIndex];
    const periodic = circularGeometry(sourceState) || Boolean(region?.componentClosed);
    if (!periodic || componentRegions.length < 2) return null;
    return side === "start" ? componentRegions.at(-1) : componentRegions[0];
  }

  function facingMergeBlend(region, side, model) {
    if (!model) return 0;
    const facingRegion = facingRegionForEdge(region, side, model);
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
    const cache =
      artworkComputationCache?.model === model &&
      artworkComputationCache?.sourceState === sourceState
        ? artworkComputationCache.regionEdgeWidths
        : null;
    const cached = cache?.get(region)?.[side];
    if (Number.isFinite(cached)) return cached;
    const remember = (value) => {
      if (cache) {
        const widths = cache.get(region) || {};
        widths[side] = value;
        cache.set(region, widths);
      }
      return value;
    };
    const ownWidth = regionTransitionWidth(region, sourceState);
    if (!model) return remember(ownWidth);

    const facingRegion = facingRegionForEdge(region, side, model, sourceState);
    if (!facingRegion) return remember(ownWidth);

    const coupling = facingMergeCoupling(region, side, model);
    if (coupling <= EPSILON) return remember(ownWidth);

    // Only approaching forks share a radius. Before the terminal pull begins,
    // a neighbouring region's size must have no effect on this edge.
    const sharedWidth = Math.min(ownWidth, regionTransitionWidth(facingRegion, sourceState));
    return remember(ownWidth + (sharedWidth - ownWidth) * coupling);
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
    const daughterOffset = Math.max(EPSILON, renderedDaughterHalfSpacing(sourceState));
    return clamp((renderedDoubleStrandHalfHeight(sourceState) * 2) / daughterOffset, 0, 1);
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
    const naturalY = nascentY(
      x,
      daughter,
      model,
      sourceState,
      region?.componentId || null
    );
    const edgeBlend = clamp(side === "start" ? region.startBlend || 0 : region.endBlend || 0, 0, 1);
    const startProfile = schematicNascentStartProfile(sourceState);
    const terminalProgress = smoothstep((edgeBlend - startProfile) / Math.max(EPSILON, 1 - startProfile));
    const unreplicatedY =
      daughter === "top"
        ? VIEW.centerY - renderedDoubleStrandHalfHeight(sourceState)
        : VIEW.centerY + renderedDoubleStrandHalfHeight(sourceState);
    return unreplicatedY + (naturalY - unreplicatedY) * terminalProgress;
  }

  function schematicNascentPathY(x, daughter, region, span, model, sourceState = state) {
    const preferredPathId = region?.componentId || null;
    const naturalY = nascentY(
      x,
      daughter,
      model,
      sourceState,
      preferredPathId
    );
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
      ((startY - nascentY(span.fromX, daughter, model, sourceState, preferredPathId)) * startWeight +
        (endY - nascentY(span.toX, daughter, model, sourceState, preferredPathId)) * endWeight) /
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

  function replicationEvaluationX(x, replication) {
    return Number.isFinite(replication?.evaluationX) ? replication.evaluationX : Number(x);
  }

  function newDnaVisibleAt(x, replication, model, sourceState = state) {
    if (!replication?.region || replication.profile < NASCENT_PROFILE_THRESHOLD) return false;
    const span = nascentSpan(replication.region, model, sourceState);
    const evaluationX = replicationEvaluationX(x, replication);
    return evaluationX >= span.fromX - EPSILON && evaluationX <= span.toX + EPSILON;
  }

  function newDnaBasePairGrowthAt(x, replication, model, sourceState = state) {
    if (!newDnaVisibleAt(x, replication, model, sourceState)) return 0;
    const region = replication.region;
    const span = nascentSpan(region, model, sourceState);
    const pairSpacing =
      VIEW.moleculeWidth / Math.max(1, basePairLattice(sourceState).subdivisionCount);
    const growthDistance = Math.max(EPSILON, pairSpacing * 2);
    const evaluationX = replicationEvaluationX(x, replication);
    const startGrowth = region.openStart
      ? 1
      : smoothstep((evaluationX - span.fromX) / growthDistance);
    const endGrowth = region.openEnd
      ? 1
      : smoothstep((span.toX - evaluationX) / growthDistance);

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
    const freeformArcScale = freeformGeometry(sourceState)
      ? freeformPathMetrics(sourceState).reduce((total, metric) => total + metric.length, 0) /
        Math.max(EPSILON, moleculeWidthForState(sourceState))
      : 1;
    const aspectX = Math.max(
      EPSILON,
      nonlinearGeometry(sourceState)
        ? Math.max(artworkAspectX(sourceState), artworkAspectY(sourceState)) *
          Math.max(EPSILON, freeformArcScale)
        : artworkAspectX(sourceState)
    );
    const detailFactor = previewDetailFactor(sourceState);
    const requestedScreenStep =
      Math.max(0.5, Math.abs(Number(requestedStep) || 3)) * detailFactor;
    const screenLimitedWorldStep = requestedScreenStep / aspectX;
    const budgetLimitedWorldStep =
      VIEW.moleculeWidth / Math.max(1200, MAX_PATH_SAMPLE_POINTS / detailFactor);
    let resolved = screenLimitedWorldStep;

    if (strandModel(sourceState) === "standard") {
      const turns = freeformGeometry(sourceState)
        ? Math.max(
            1,
            ...freeformPathMetrics(sourceState).map(
              (metric) => freeformComponentCrossoverCount(metric, sourceState) / 2
            )
          )
        : nonlinearGeometry(sourceState)
          ? Math.max(1, crossoverCount(sourceState) / 2)
          : Math.max(
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

    if (freeformGeometry() && strandModel() === "standard" && !state.advanced.crossoverGaps) {
      const bridgeHalfWidth = crossoverClipHalfWidth(1.8, 7);
      crossoverSites().forEach(({ x }) => {
        anchorXs.push(
          Math.max(VIEW.x0, x - bridgeHalfWidth),
          Math.min(VIEW.x1, x + bridgeHalfWidth)
        );
      });
    }

    // A gap gets its own endpoint-to-endpoint lattice. Because that lattice is
    // centred on the two forks, its cubic controls remain exact mirror images
    // while the gap contracts, regardless of the global molecule grid phase.
    if (strandModel() !== "standard") {
      for (let index = 0; index < model.regions.length - 1; index += 1) {
        const leftRegion = model.regions[index];
        const rightRegion = model.regions[index + 1];
        if (!regionsShareComponent(leftRegion, rightRegion)) continue;
        if (facingMergeCoupling(leftRegion, "end", model) <= EPSILON) continue;
        const leftX = VIEW.x0 + leftRegion.end * VIEW.moleculeWidth;
        const rightX = VIEW.x0 + rightRegion.start * VIEW.moleculeWidth;
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
    const componentId = typeof cut === "object" && cut
      ? cut.componentId || cut.moleculeId || cut.pathId || null
      : null;
    return {
      start: clamp(Math.min(first, second), 0, 1),
      end: clamp(Math.max(first, second), 0, 1),
      ...(componentId ? { componentId } : {}),
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

  function periodicCutInteractionRange(start, end, sourceState = state) {
    let first = Number(start);
    let second = Number(end);
    if (!Number.isFinite(first)) first = 0;
    if (!Number.isFinite(second)) second = first;
    if (
      first >= -EPSILON && first <= 1 + EPSILON &&
      second >= -EPSILON && second <= 1 + EPSILON
    ) {
      second = nearestEquivalentFraction(second, first);
    }
    if (Math.abs(second - first) > 1) {
      second = first + Math.sign(second - first) * 1;
    }
    if (snapEditingEnabled(sourceState)) {
      const snappedFirst = snapCircularEquivalent(first, sourceState);
      const snappedSecond = snapCircularEquivalent(second, sourceState);
      if (snappedFirst !== null) first = snappedFirst;
      if (snappedSecond !== null) second = snappedSecond;
    }
    return {
      start: Math.min(first, second),
      end: Math.max(first, second),
    };
  }

  function periodicCanonicalCutRanges(
    range,
    { start = 0, span = 1, componentId = null } = {}
  ) {
    const period = Math.max(EPSILON, Number(span) || 1);
    const localStart = (Number(range.start) - start) / period;
    const localEnd = (Number(range.end) - start) / period;
    const lower = Math.min(localStart, localEnd);
    const upper = Math.min(lower + 1, Math.max(localStart, localEnd));
    if (upper - lower <= EPSILON) {
      const local = wrapFraction(lower);
      const position = start + local * period;
      return [{
        start: position,
        end: position,
        ...(componentId ? { componentId } : {}),
      }];
    }

    const ranges = [];
    let cursor = lower;
    while (cursor < upper - EPSILON) {
      const boundary = Math.min(upper, Math.floor(cursor + EPSILON) + 1);
      const fromLocal = wrapFraction(cursor);
      const reachesSeam = Math.abs(boundary - Math.round(boundary)) <= EPSILON;
      const toLocal = reachesSeam ? 1 : wrapFraction(boundary);
      const first = start + fromLocal * period;
      const second = start + toLocal * period;
      ranges.push({
        start: Math.min(first, second),
        end: Math.max(first, second),
        ...(componentId ? { componentId } : {}),
      });
      cursor = boundary;
    }
    return ranges;
  }

  function cutRangesForGesture(start, end, sourceState = state, preferredPathId = null) {
    if (freeformGeometry(sourceState)) {
      const first = clamp(Number(start) || 0, 0, 1);
      const metric = freeformMetricById(preferredPathId, sourceState)
        || freeformMetricAtFraction(first, sourceState, preferredPathId)
        || freeformMetricAtFraction(clamp(Number(end) || first, 0, 1), sourceState);
      if (!metric) {
        const range = cutInteractionRange(start, end, sourceState);
        return { range, ranges: [range], componentId: null, componentClosed: false };
      }
      const period = Math.max(EPSILON, metric.span);
      const localState = freeformComponentState(metric, sourceState.forkTravel, sourceState);
      const localStart = (Number(start) - metric.start) / period;
      const localEnd = (Number(end) - metric.start) / period;
      if (metric.closed) {
        const localRange = periodicCutInteractionRange(localStart, localEnd, localState);
        const range = {
          start: metric.start + localRange.start * period,
          end: metric.start + localRange.end * period,
          componentId: metric.id,
        };
        return {
          range,
          ranges: periodicCanonicalCutRanges(range, {
            start: metric.start,
            span: period,
            componentId: metric.id,
          }),
          componentId: metric.id,
          componentClosed: true,
        };
      }
      const localRange = cutInteractionRange(localStart, localEnd, localState);
      const range = {
        start: metric.start + localRange.start * period,
        end: metric.start + localRange.end * period,
        componentId: metric.id,
      };
      return {
        range,
        ranges: [range],
        componentId: metric.id,
        componentClosed: false,
      };
    }

    if (circularGeometry(sourceState)) {
      const range = periodicCutInteractionRange(start, end, sourceState);
      return {
        range,
        ranges: periodicCanonicalCutRanges(range),
        componentId: null,
        componentClosed: true,
      };
    }

    const range = cutInteractionRange(start, end, sourceState);
    return { range, ranges: [range], componentId: null, componentClosed: false };
  }

  function normaliseCutRegions(cuts) {
    const ranges = cuts.map(cutRange).sort((first, second) => {
      const componentOrder = String(first.componentId || "").localeCompare(
        String(second.componentId || "")
      );
      return componentOrder || first.start - second.start;
    });
    const merged = [];
    ranges.forEach((range) => {
      const current = merged.at(-1);
      const sameComponent = (current?.componentId || null) === (range.componentId || null);
      if (current && sameComponent && range.start <= current.end + EPSILON) {
        current.end = Math.max(current.end, range.end);
      } else {
        merged.push({ ...range });
      }
    });
    return merged;
  }

  function subtractCutRange(cuts, repairedRange) {
    const repair = cutRange(repairedRange);
    return normaliseCutRegions(
      cuts.flatMap((cut) => {
        const range = cutRange(cut);
        const sameComponent =
          (repair.componentId || null) === (range.componentId || null);
        if (
          !sameComponent ||
          repair.end < range.start - EPSILON ||
          repair.start > range.end + EPSILON
        ) {
          return [range];
        }
        const remaining = [];
        if (repair.start > range.start + EPSILON) {
          remaining.push({
            start: range.start,
            end: Math.min(range.end, repair.start),
            ...(range.componentId ? { componentId: range.componentId } : {}),
          });
        }
        if (repair.end < range.end - EPSILON) {
          remaining.push({
            start: Math.max(range.start, repair.end),
            end: range.end,
            ...(range.componentId ? { componentId: range.componentId } : {}),
          });
        }
        return remaining;
      })
    );
  }

  function cutIndexAtFraction(
    fraction,
    sourceState = state,
    tolerancePx = 24,
    preferredPathId = null
  ) {
    const position = circularGeometry(sourceState)
      ? wrapFraction(fraction)
      : clamp(Number(fraction) || 0, 0, 1);
    const metric = freeformGeometry(sourceState)
      ? freeformMetricAtFraction(position, sourceState, preferredPathId)
      : null;
    const tolerance = Math.max(0, Number(tolerancePx) || 0) / VIEW.moleculeWidth;
    return (sourceState?.cuts || []).findIndex((cut) => {
      const range = cutRange(cut);
      if (range.componentId && range.componentId !== metric?.id) return false;
      if (position >= range.start - tolerance && position <= range.end + tolerance) return true;
      if (!circularGeometry(sourceState)) return false;
      return (
        Math.abs(signedCircularFractionDelta(position, range.start)) <= tolerance ||
        Math.abs(signedCircularFractionDelta(position, range.end)) <= tolerance
      );
    });
  }

  function previewCutRange() {
    if (dragState?.role !== "cut-range" || !dragState.moved) return null;
    return cutRangesForGesture(
      dragState.anchor,
      dragState.current,
      state,
      dragState.pathId || null
    ).range;
  }

  function previewUnreplicateRange() {
    if (dragState?.role !== "unreplicate-range" || !dragState.moved) return null;
    const plan = unreplicateRangePlan(
      dragState.anchor,
      dragState.current,
      state,
      dragState.pathId || null
    );
    return {
      ...plan.range,
      componentId: plan.componentId || dragState.pathId || null,
      componentClosed: Boolean(plan.componentClosed),
    };
  }

  function activeCutRanges() {
    if (dragState?.role === "cut-range" && dragState.moved) {
      const preview = cutRangesForGesture(
        dragState.anchor,
        dragState.current,
        state,
        dragState.pathId || null
      );
      return normaliseCutRegions([...state.cuts, ...preview.ranges]);
    }
    return state.cuts.map(cutRange);
  }

  function isCutGap(x, padding = 0) {
    const halfGap = 9 + state.weight + padding;
    const position = geometryFractionAtX(x);
    const halfGapFraction = halfGap / Math.max(EPSILON, VIEW.moleculeWidth);
    const metric = freeformGeometry()
      ? freeformMetricAtFraction(position, state)
      : null;
    return activeCutRanges().some((cut) => {
      if (cut.componentId && cut.componentId !== metric?.id) return false;
      if (position >= cut.start - halfGapFraction && position <= cut.end + halfGapFraction) {
        return true;
      }
      if (!circularGeometry()) return false;
      return (
        Math.abs(signedCircularFractionDelta(position, cut.start)) <= halfGapFraction ||
        Math.abs(signedCircularFractionDelta(position, cut.end)) <= halfGapFraction
      );
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

  function freeformProjectedPathDerivative(point, projected, sourceState = state) {
    const slope = Number(point?.slope);
    const metric = freeformMetricById(projected?.pathId, sourceState);
    if (!metric || !Number.isFinite(slope) || !(metric.length > EPSILON)) return null;
    const moleculeWidth = moleculeWidthForState(sourceState);
    const coordinateStart = VIEW.x0 + metric.start * moleculeWidth;
    const coordinateEnd = VIEW.x0 + metric.end * moleculeWidth;
    const coordinateSpan = Math.max(EPSILON, coordinateEnd - coordinateStart);
    const coordinatePerArcLength = coordinateSpan / metric.length;
    const delta = clamp(coordinatePerArcLength * 0.35, 0.01, 0.25);
    const sourceX = Number(point.x);
    let leftOffset = -delta;
    let rightOffset = delta;
    if (!metric.closed) {
      leftOffset = Math.max(leftOffset, coordinateStart - sourceX);
      rightOffset = Math.min(rightOffset, coordinateEnd - sourceX);
    }
    if (rightOffset - leftOffset <= EPSILON) return null;

    const mappedAtOffset = (offset) => {
      let sampleX = sourceX + offset;
      if (metric.closed) {
        while (sampleX < coordinateStart) sampleX += coordinateSpan;
        while (sampleX > coordinateEnd) sampleX -= coordinateSpan;
      }
      const fraction = clamp((sampleX - VIEW.x0) / Math.max(EPSILON, moleculeWidth), metric.start, metric.end);
      const sampleY = Number(point.y) + slope * offset;
      return point.strandRole
        ? freeformStrandGeometryPointOnMetric(
            metric,
            fraction,
            sampleX,
             sampleY,
             point.strandRole,
             sourceState
           )
        : freeformGeometryPointOnMetric(metric, fraction, sampleY, sourceState);
    };
    const first = mappedAtOffset(leftOffset);
    const second = mappedAtOffset(rightOffset);
    const inverseSpan = 1 / (rightOffset - leftOffset);
    return {
      x: (second.x - first.x) * inverseSpan,
      y: (second.y - first.y) * inverseSpan,
    };
  }

  function freeformHermitePathD(points, { closed = false } = {}) {
    const source = (points || []).filter(
      (point) => Number.isFinite(point?.x) && Number.isFinite(point?.y)
    );
    if (!source.length) return "";
    if (source.length === 1) return `M${precise(source[0].x)} ${precise(source[0].y)}`;

    const fallbackDerivative = (index) => {
      const previous = source[Math.max(0, index - 1)];
      const following = source[Math.min(source.length - 1, index + 1)];
      const parameterSpan = Math.max(EPSILON, following.sourceX - previous.sourceX);
      return {
        x: (following.x - previous.x) / parameterSpan,
        y: (following.y - previous.y) / parameterSpan,
      };
    };
    const derivatives = source.map((point, index) => {
      const x = Number(point.derivativeX);
      const y = Number(point.derivativeY);
      return Number.isFinite(x) && Number.isFinite(y) && Math.hypot(x, y) > EPSILON
        ? { x, y }
        : fallbackDerivative(index);
    });
    const boundedHandle = (derivative, parameterSpan, chord) => {
      const chordLength = Math.hypot(chord.x, chord.y);
      if (chordLength <= EPSILON) return { x: 0, y: 0 };
      let x = (derivative.x * parameterSpan) / 3;
      let y = (derivative.y * parameterSpan) / 3;
      let length = Math.hypot(x, y);
      const alignment = length > EPSILON
        ? (x * chord.x + y * chord.y) / (length * chordLength)
        : 0;
      if (alignment <= 0.2) {
        x = chord.x / 3;
        y = chord.y / 3;
        length = chordLength / 3;
      }
      const maximumLength = chordLength * 0.45;
      if (length > maximumLength) {
        const scale = maximumLength / length;
        x *= scale;
        y *= scale;
      }
      return { x, y };
    };

    let path = `M${precise(source[0].x)} ${precise(source[0].y)}`;
    for (let index = 0; index < source.length - 1; index += 1) {
      const current = source[index];
      const next = source[index + 1];
      const chord = { x: next.x - current.x, y: next.y - current.y };
      const parameterSpan = Math.max(EPSILON, next.sourceX - current.sourceX);
      const firstHandle = boundedHandle(derivatives[index], parameterSpan, chord);
      const secondHandle = boundedHandle(derivatives[index + 1], parameterSpan, chord);
      path += ` C${precise(current.x + firstHandle.x)} ${precise(
        current.y + firstHandle.y
      )} ${precise(next.x - secondHandle.x)} ${precise(
        next.y - secondHandle.y
      )} ${precise(next.x)} ${precise(next.y)}`;
    }
    if (closed && source.length > 2) path += " Z";
    return path;
  }

  function geometryRunPath(points, { closed = false, sourceState = state } = {}) {
    if (!points.length) return "";
    const projected = points.map((point) => {
      const preferredMetric =
        freeformGeometry(sourceState) && point.pathId
          ? freeformMetricById(point.pathId, sourceState)
          : null;
      const sourceFraction =
        (Number(point.x) - VIEW.x0) /
        Math.max(EPSILON, moleculeWidthForState(sourceState));
      const mapped =
        preferredMetric && point.strandRole
          ? freeformStrandGeometryPointOnMetric(
              preferredMetric,
              sourceFraction,
              point.x,
              point.y,
              point.strandRole,
              sourceState
            )
          : freeformGeometry(sourceState) && point.strandRole
            ? freeformStrandGeometryPoint(
                point.x,
                point.y,
                point.strandRole,
                sourceState
              )
          : geometryPoint(point.x, point.y, sourceState);
      const derivative = freeformGeometry(sourceState)
        ? freeformProjectedPathDerivative(point, mapped, sourceState)
        : null;
      return {
        ...mapped,
        sourceX: point.x,
        ...(derivative ? { derivativeX: derivative.x, derivativeY: derivative.y } : {}),
      };
    });

    if (!freeformGeometry(sourceState)) {
      if (
        closed &&
        projected.length > 1 &&
        Math.hypot(
          projected[0].x - projected.at(-1).x,
          projected[0].y - projected.at(-1).y
        ) <= 0.01
      ) {
        projected.pop();
      }
      if (!projected.length) return "";
      let path = `M${precise(projected[0].x)} ${precise(projected[0].y)}`;
      for (let index = 1; index < projected.length; index += 1) {
        path += ` L${precise(projected[index].x)} ${precise(projected[index].y)}`;
      }
      if (closed && projected.length > 2) path += " Z";
      return path;
    }

    const groups = [];
    projected.forEach((point) => {
      const current = groups.at(-1);
      if (!current || current.pathId !== point.pathId) {
        groups.push({ pathId: point.pathId, points: [point] });
      } else {
        current.points.push(point);
      }
    });

    return groups
      .filter((group) => group.points.length > 0)
      .map((group) => {
        const metric = freeformMetricById(group.pathId, sourceState);
        const groupPoints = group.points;
        let closesPath = false;
        if (metric?.closed && groupPoints.length > 2) {
          const firstFraction = geometryFractionAtX(groupPoints[0].sourceX, sourceState);
          const lastFraction = geometryFractionAtX(groupPoints.at(-1).sourceX, sourceState);
          const covered = Math.abs(lastFraction - firstFraction);
          closesPath = covered >= metric.span * 0.94;
        }
        return freeformHermitePathD(groupPoints, { closed: closesPath });
      })
      .join(" ");
  }

  function sampledPath(
    fromX,
    toX,
    pointForX,
    sampleStep = 3,
    extraGapForX = null,
    anchorXs = [],
    localWindows = [],
    tangentForX = null,
    strandRole = null,
    preferredPathId = null
  ) {
    const runs = [];
    let currentRun = [];
    let hadGap = false;
    const addPoint = (x) => {
      if (isCutGap(x) || extraGapForX?.(x)) {
        hadGap = true;
        if (currentRun.length) runs.push(currentRun);
        currentRun = [];
        return;
      }
      const slope = tangentForX?.(x);
      currentRun.push({
        x,
        y: pointForX(x),
        ...(Number.isFinite(slope) ? { slope } : {}),
        ...(strandRole ? { strandRole } : {}),
        ...(preferredPathId ? { pathId: preferredPathId } : {}),
      });
    };

    const step = adaptivePathSampleStep(sampleStep);
    addPoint(fromX);
    const firstInteriorIndex = Math.floor((fromX - VIEW.x0) / step + EPSILON) + 1;
    const interiorXs = anchorXs.filter((x) => x > fromX + EPSILON && x < toX - EPSILON);
    if (freeformGeometry()) {
      freeformPathMetrics()
        .slice(1)
        .map((metric) => VIEW.x0 + metric.start * VIEW.moleculeWidth)
        .filter((x) => x > fromX + EPSILON && x < toX - EPSILON)
        .forEach((x) => interiorXs.push(x));
    }
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
    if (nonlinearGeometry()) {
      const closesCircle =
        !hadGap &&
        runs.length === 1 &&
        Math.abs(fromX - VIEW.x0) <= EPSILON &&
        Math.abs(toX - VIEW.x1) <= EPSILON;
      return runs
        .map((run) => geometryRunPath(run, { closed: closesCircle }))
        .join(" ");
    }
    return runs.map(smoothRunPath).join(" ");
  }

  function insetBasePairSegment(firstY, secondY, width = state.basePairWidth, x = null) {
    const distance = Math.abs(secondY - firstY);
    const radialScale = nonlinearGeometry() && Number.isFinite(Number(x))
      ? geometryScreenNormalScale(geometryFractionAtX(Number(x)))
      : artworkAspectY();
    const inset = width / (2 * Math.max(EPSILON, radialScale));
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
    const cacheKey = `${Math.trunc(Number(sourceState?.basePairSeed) || 0) >>> 0}:${Math.round(
      (Number(sourceState?.length) || DEFAULTS.length) * 100
    )}:${basePairResolution(sourceState)}:${position}`;
    const cached = basePairIdentityCache.get(cacheKey);
    if (cached) return cached;
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
    const identity = Object.freeze({
      first: pair[0],
      second: pair[1],
      label: `${pair[0]}-${pair[1]}`,
    });
    if (basePairIdentityCache.size > 6000) basePairIdentityCache.clear();
    basePairIdentityCache.set(cacheKey, identity);
    return identity;
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

  function basePairRoleY(role, x, model, sourceState = state) {
    if (role === "top" || role === "bottom") return nascentY(x, role, model);
    return templateY(x, role === "b" ? "b" : "a", model);
  }

  function basePairDepthSplitFraction(
    x,
    firstRole,
    secondRole,
    sourceState = state
  ) {
    if (
      !depthAwareBasePairSplit(sourceState) ||
      basePairColorMode(sourceState) === "single" ||
      strandModel(sourceState) !== "standard"
    ) {
      return 0.5;
    }

    const fraction = geometryFractionAtX(x, sourceState);
    let nearest = null;
    crossoverSites(sourceState).forEach((site) => {
      const distance = circularGeometry(sourceState)
        ? Math.abs(signedCircularFractionDelta(fraction, site.fraction))
        : Math.abs(fraction - site.fraction);
      if (!nearest || distance < nearest.distance) nearest = { ...site, distance };
    });
    if (!nearest) return 0.5;

    const distanceInSteps = nearest.distance / Math.max(EPSILON, basePairStepFraction(sourceState));
    // One crossover interval contains resolution + 1 lattice steps. Expressing
    // the depth falloff in those steps keeps the 3D cue stable as resolution
    // changes instead of making it abruptly affect a fixed number of rungs.
    const influenceSpan = Math.max(1, (basePairResolution(sourceState) + 1) / 2);
    const influence = 1 - smoothstep(distanceInSteps / influenceSpan);
    if (influence <= EPSILON) return 0.5;

    const aIsOver = crossoverAIsOver(nearest.index, sourceState);
    const frontRoles = aIsOver
      ? new Set(["a", "bottom"])
      : new Set(["b", "top"]);
    const firstIsFront = frontRoles.has(firstRole);
    const secondIsFront = frontRoles.has(secondRole);
    if (firstIsFront === secondIsFront) return 0.5;

    const maximumBias = 0.18;
    return clamp(0.5 + (firstIsFront ? 1 : -1) * maximumBias * influence, 0.28, 0.72);
  }

  function basePairEndpointCompatible(
    nominalX,
    candidateX,
    role,
    model,
    sourceState = state
  ) {
    if (!circularGeometry(sourceState) && (candidateX < VIEW.x0 || candidateX > VIEW.x1)) return false;
    if (freeformGeometry(sourceState)) {
      const nominalMetric = freeformMetricAtFraction(
        geometryFractionAtX(nominalX, sourceState),
        sourceState
      );
      const candidateMetric = freeformMetricAtFraction(
        geometryFractionAtX(candidateX, sourceState),
        sourceState
      );
      // Angled rungs may approach a drawn end, but must never leak onto a
      // neighbouring DNA piece merely because the pieces are adjacent in the
      // global genomic parameterisation.
      if (!nominalMetric || nominalMetric.id !== candidateMetric?.id) return false;
    }
    if (isCutGap(candidateX, 3)) return false;
    const nominalReplication = replicationAt(nominalX, model);
    const candidateReplication = replicationAt(candidateX, model);
    if (Boolean(nominalReplication.region) !== Boolean(candidateReplication.region)) return false;
    if (
      (role === "top" || role === "bottom") &&
      !newDnaVisibleAt(candidateX, candidateReplication, model)
    ) {
      return false;
    }
    return Number.isFinite(basePairRoleY(role, candidateX, model));
  }

  function angledBasePairEndpoints(
    x,
    firstY,
    secondY,
    { firstRole = "a", secondRole = "b", model = null } = {},
    sourceState = state
  ) {
    const angle = basePairAngle(sourceState);
    if (!model || Math.abs(angle) <= EPSILON) {
      return { firstX: x, firstY, secondX: x, secondY };
    }

    const verticalDirection = Math.sign(secondY - firstY) || 1;
    const rawShift =
      Math.tan((angle * Math.PI) / 180) *
      (Math.abs(secondY - firstY) / 2) *
      verticalDirection;
    const latticeLimit =
      (moleculeWidthForState(sourceState) /
        Math.max(1, basePairLattice(sourceState).subdivisionCount)) *
      0.44;
    let boundaryLimit;
    if (circularGeometry(sourceState)) {
      boundaryLimit = latticeLimit;
    } else if (freeformGeometry(sourceState)) {
      const metric = freeformMetricAtFraction(geometryFractionAtX(x, sourceState), sourceState);
      const componentStartX = metric
        ? VIEW.x0 + metric.start * moleculeWidthForState(sourceState)
        : VIEW.x0;
      const componentEndX = metric
        ? VIEW.x0 + metric.end * moleculeWidthForState(sourceState)
        : VIEW.x1;
      // Closed drawn paths still have a parameter seam. Fade angled rungs back
      // to vertical at that seam rather than allowing an endpoint to enter a
      // different free-form component.
      boundaryLimit = Math.max(
        0,
        Math.min(x - componentStartX, componentEndX - x, latticeLimit)
      );
    } else {
      boundaryLimit = Math.max(0, Math.min(x - VIEW.x0, VIEW.x1 - x, latticeLimit));
    }
    let shift = clamp(rawShift, -boundaryLimit, boundaryLimit);
    if (Math.abs(shift) <= EPSILON) {
      return { firstX: x, firstY, secondX: x, secondY };
    }

    const isCompatible = (factor) => {
      const firstX = x - shift * factor;
      const secondX = x + shift * factor;
      return (
        basePairEndpointCompatible(x, firstX, firstRole, model, sourceState) &&
        basePairEndpointCompatible(x, secondX, secondRole, model, sourceState)
      );
    };

    if (!isCompatible(1)) {
      let lower = 0;
      let upper = 1;
      for (let iteration = 0; iteration < 14; iteration += 1) {
        const midpoint = (lower + upper) / 2;
        if (isCompatible(midpoint)) lower = midpoint;
        else upper = midpoint;
      }
      shift *= lower;
    }

    const firstX = x - shift;
    const secondX = x + shift;
    const resolvedFirstY = basePairRoleY(firstRole, firstX, model);
    const resolvedSecondY = basePairRoleY(secondRole, secondX, model);
    if (!Number.isFinite(resolvedFirstY) || !Number.isFinite(resolvedSecondY)) {
      return { firstX: x, firstY, secondX: x, secondY };
    }
    return {
      firstX,
      firstY: resolvedFirstY,
      secondX,
      secondY: resolvedSecondY,
    };
  }

  function interpolateBasePairPoint(first, second, amount) {
    const t = clamp(Number(amount) || 0, 0, 1);
    return {
      x: first.x + (second.x - first.x) * t,
      y: first.y + (second.y - first.y) * t,
    };
  }

  function insetBasePairSegment2D(first, second, width = state.basePairWidth) {
    const firstGeometry = geometryPoint(first.x, first.y);
    const secondGeometry = geometryPoint(second.x, second.y);
    const firstDisplay = transformedArtworkPoint(firstGeometry.x, firstGeometry.y);
    const secondDisplay = transformedArtworkPoint(secondGeometry.x, secondGeometry.y);
    const displayDistance = Math.hypot(
      secondDisplay.x - firstDisplay.x,
      secondDisplay.y - firstDisplay.y
    );
    if (displayDistance <= width + EPSILON) return null;
    const insetFraction = width / (2 * displayDistance);
    if (insetFraction >= 0.5 - EPSILON) return null;
    return {
      first: interpolateBasePairPoint(first, second, insetFraction),
      second: interpolateBasePairPoint(first, second, 1 - insetFraction),
    };
  }

  function renderBasePairLine(
    x,
    firstY,
    secondY,
    visibility,
    {
      firstRole = "a",
      secondRole = "b",
      firstBase = "A",
      secondBase = "T",
      model = null,
    } = {}
  ) {
    const angled = angledBasePairEndpoints(
      x,
      firstY,
      secondY,
      { firstRole, secondRole, model }
    );
    let segment;
    let segmentIsMapped = false;
    if (freeformGeometry()) {
      const firstPoint = freeformStrandGeometryPoint(
        angled.firstX,
        angled.firstY,
        firstRole
      );
      const secondPoint = freeformStrandGeometryPoint(
        angled.secondX,
        angled.secondY,
        secondRole
      );
      const firstDisplay = transformedArtworkPoint(firstPoint.x, firstPoint.y);
      const secondDisplay = transformedArtworkPoint(secondPoint.x, secondPoint.y);
      const displayDistance = Math.hypot(
        secondDisplay.x - firstDisplay.x,
        secondDisplay.y - firstDisplay.y
      );
      if (displayDistance <= state.basePairWidth + EPSILON) return "";
      const insetFraction = state.basePairWidth / (2 * displayDistance);
      if (insetFraction >= 0.5 - EPSILON) return "";
      segment = {
        first: interpolateBasePairPoint(firstPoint, secondPoint, insetFraction),
        second: interpolateBasePairPoint(firstPoint, secondPoint, 1 - insetFraction),
      };
      segmentIsMapped = true;
    } else if (Math.abs(basePairAngle()) <= EPSILON) {
      const vertical = insetBasePairSegment(firstY, secondY, state.basePairWidth, x);
      if (!vertical) return "";
      segment = {
        first: { x, y: vertical.firstY },
        second: { x, y: vertical.secondY },
      };
    } else {
      segment = insetBasePairSegment2D(
        { x: angled.firstX, y: angled.firstY },
        { x: angled.secondX, y: angled.secondY },
        state.basePairWidth
      );
      if (!segment) return "";
    }

    const transition = clamp(Number(visibility) || 0, 0, 1);
    if (transition <= EPSILON) return "";
    const transitionMode = basePairTransitionMode();
    const grows = transitionMode === "grow";
    const instant = transitionMode === "instant";
    const pairOpacity = grows || instant ? 1 : transition;
    const growth = grows ? transition : 1;
    const colourMode = basePairColorMode();
    const splitColourMode = colourMode !== "single";
    const [firstColor, secondColor] = basePairLineColors(
      firstRole,
      secondRole,
      firstBase,
      secondBase
    );
    const width = state.basePairWidth;
    const strokeAttributes = artworkStrokeAttributes(width);
    const contourAttributes = artworkStrokeAttributes(contourStrokeWidth(width));
    const splitFraction = basePairDepthSplitFraction(x, firstRole, secondRole);
    const join = interpolateBasePairPoint(segment.first, segment.second, splitFraction);
    const firstInner = interpolateBasePairPoint(segment.first, join, growth);
    const secondInner = interpolateBasePairPoint(segment.second, join, growth);
    const capFraction = 0.0001;
    const firstCapInner = interpolateBasePairPoint(segment.first, segment.second, capFraction);
    const secondCapInner = interpolateBasePairPoint(segment.second, segment.first, capFraction);
    const contourColour = contourColor();
    const contourOn = contourEnabled();
    const mappedPoint = (point) =>
      segmentIsMapped ? point : geometryPoint(point.x, point.y);

    const lineCoordinates = (from, to) => {
      const firstPoint = mappedPoint(from);
      const secondPoint = mappedPoint(to);
      return `x1="${precise(firstPoint.x)}" y1="${precise(firstPoint.y)}" x2="${precise(
        secondPoint.x
      )}" y2="${precise(secondPoint.y)}"`;
    };

    const line = (
      from,
      to,
      colour,
      attributes,
      cap,
      { beforeCoordinates = "", afterCoordinates = "" } = {}
    ) =>
      `<line ${beforeCoordinates}${lineCoordinates(from, to)} ${afterCoordinates}stroke="${colour}" ${attributes} stroke-linecap="${cap}"/>`;

    const contourSeparator = (atPoint, role) => {
      if (!contourOn || !splitColourMode) return "";
      const firstGeometry = mappedPoint(segment.first);
      const secondGeometry = mappedPoint(segment.second);
      const firstDisplay = transformedArtworkPoint(firstGeometry.x, firstGeometry.y);
      const secondDisplay = transformedArtworkPoint(secondGeometry.x, secondGeometry.y);
      const dx = secondDisplay.x - firstDisplay.x;
      const dy = secondDisplay.y - firstDisplay.y;
      const distance = Math.hypot(dx, dy);
      if (distance <= EPSILON) return "";
      const centreGeometry = mappedPoint(atPoint);
      const centreDisplay = transformedArtworkPoint(centreGeometry.x, centreGeometry.y);
      const halfWidth =
        contourStrokeWidth(width) /
        (2 * Math.max(EPSILON, artworkViewportScale));
      const perpendicularX = -dy / distance;
      const perpendicularY = dx / distance;
      const transform = artworkTransformComponents();
      const inversePoint = (displayX, displayY) => ({
        x: (displayX - transform.translateX) / Math.max(EPSILON, transform.scaleX),
        y: (displayY - transform.translateY) / Math.max(EPSILON, transform.scaleY),
      });
      const firstPoint = inversePoint(
        centreDisplay.x - perpendicularX * halfWidth,
        centreDisplay.y - perpendicularY * halfWidth
      );
      const secondPoint = inversePoint(
        centreDisplay.x + perpendicularX * halfWidth,
        centreDisplay.y + perpendicularY * halfWidth
      );
      return `<line data-rs-contour="true" data-rs-base-pair-separator="${role}" x1="${precise(
        firstPoint.x
      )}" y1="${precise(firstPoint.y)}" x2="${precise(secondPoint.x)}" y2="${precise(
        secondPoint.y
      )}" stroke="${contourColour}" ${artworkStrokeAttributes(
        contourThickness()
      )} stroke-linecap="butt"/>`;
    };

    if (!grows && !splitColourMode) {
      const contour = contourOn
        ? line(
            segment.first,
            segment.second,
            contourColour,
            contourAttributes,
            "round",
            { beforeCoordinates: 'data-rs-contour="true" ' }
          )
        : "";
      return `<g data-pair="${firstBase}-${secondBase}" data-transition="${transitionMode}" opacity="${precise(
        pairOpacity
      )}">${contour}${line(
        segment.first,
        segment.second,
        firstColor,
        strokeAttributes,
        "round"
      )}</g>`;
    }

    const completeJoin = growth >= 1 - EPSILON;
    let contour = "";
    if (contourOn) {
      if (completeJoin) {
        contour = line(
          segment.first,
          segment.second,
          contourColour,
          contourAttributes,
          "round",
          { beforeCoordinates: 'data-rs-contour="true" ' }
        );
      } else {
        contour = `${line(
          segment.first,
          firstInner,
          contourColour,
          contourAttributes,
          "butt",
          { beforeCoordinates: 'data-rs-contour="true" data-contour-half="first" ' }
        )}${line(
          secondInner,
          segment.second,
          contourColour,
          contourAttributes,
          "butt",
          { beforeCoordinates: 'data-rs-contour="true" data-contour-half="second" ' }
        )}${line(
          segment.first,
          firstCapInner,
          contourColour,
          contourAttributes,
          "round",
          { beforeCoordinates: 'data-rs-contour="true" data-contour-cap="first" ' }
        )}${line(
          segment.second,
          secondCapInner,
          contourColour,
          contourAttributes,
          "round",
          { beforeCoordinates: 'data-rs-contour="true" data-contour-cap="second" ' }
        )}`;
      }
    }

    const separator = splitColourMode
      ? completeJoin
        ? contourSeparator(join, "midpoint")
        : `${contourSeparator(firstInner, "first-front")}${contourSeparator(
            secondInner,
            "second-front"
          )}`
      : "";

    return `<g data-pair="${firstBase}-${secondBase}" data-transition="${transitionMode}" opacity="${precise(
      pairOpacity
    )}">
      ${contour}
      ${line(segment.first, firstInner, firstColor, strokeAttributes, "butt", {
        afterCoordinates: 'data-half="first" ',
      })}
      ${line(secondInner, segment.second, secondColor, strokeAttributes, "butt", {
        afterCoordinates: 'data-half="second" ',
      })}
      ${line(segment.first, firstCapInner, firstColor, strokeAttributes, "round", {
        beforeCoordinates: 'data-cap="first" ',
      })}
      ${line(segment.second, secondCapInner, secondColor, strokeAttributes, "round", {
        beforeCoordinates: 'data-cap="second" ',
      })}
      ${separator}
    </g>`;
  }

  function renderBasePairs(model) {
    if (!state.layers.pairs || !modelSupportsDoubleStrandDetails()) return "";

    const pairs = [];
    const transitionMode = basePairTransitionMode();

    const sites = freeformGeometry()
      ? freeformBasePairSites()
      : structuredBasePairSites().map((site) => ({
          index: site.index,
          x: VIEW.x0 + site.localFraction * VIEW.moleculeWidth,
          componentState: state,
        }));

    sites.forEach(({ index, x, componentState }) => {
      if (isCutGap(x, 3)) return;
      const identity = basePairIdentity(index, componentState);
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
          model,
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
          model,
        });
        const bottomPair = renderBasePairLine(x, yB, bottomNewY, bottomVisibility, {
          firstRole: "b",
          secondRole: "bottom",
          firstBase: identity.second,
          secondBase: identity.first,
          model,
        });
        if (topPair && topVisibility > EPSILON) pairs.push(topPair);
        if (bottomPair && bottomVisibility > EPSILON) pairs.push(bottomPair);
      }
    });

    return `<g aria-label="Base pairs">${pairs.join("")}</g>`;
  }

  function renderableReplicationRegions(model, sourceState = state) {
    const regions = [...(model?.regions || [])];
    if (!regions.length) return regions;
    if (circularGeometry(sourceState)) {
      if (regions.length < 2) return regions;
      const periodic = periodicRegionAtPosition(0, { ...model, regions }, sourceState);
      return periodic?.region?.periodicJoin
        ? [periodic.region, ...regions.slice(1, -1)]
        : regions;
    }
    if (!freeformGeometry(sourceState)) return regions;

    const grouped = new Map();
    regions.forEach((region) => {
      const key = region.componentId || "";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(region);
    });
    const rendered = [];
    grouped.forEach((componentRegions) => {
      componentRegions.sort((first, second) => first.start - second.start);
      if (!componentRegions[0]?.componentClosed || componentRegions.length < 2) {
        rendered.push(...componentRegions);
        return;
      }
      const componentStart = componentRegions[0].componentStart;
      const periodic = periodicRegionAtPosition(
        componentStart,
        { ...model, regions: componentRegions },
        sourceState
      );
      if (periodic?.region?.periodicJoin) {
        rendered.push(periodic.region, ...componentRegions.slice(1, -1));
      } else {
        rendered.push(...componentRegions);
      }
    });
    return rendered.sort((first, second) => first.start - second.start);
  }

  function renderNascentDna(model) {
    if (!state.layers.newDna || strandModel() === "minimal") return "";
    const strands = [];
    const sampling = replicationPathSampling(model);

    renderableReplicationRegions(model).forEach((region) => {
      const span = nascentSpan(region, model);
      const { fromX, toX } = span;
      const spanWidth = toX - fromX;
      if (spanWidth <= EPSILON) return;
      const periodicWidth = region.periodicJoin
        ? Math.max(
            0,
            Number(region.componentEnd) - Number(region.componentStart)
          ) * VIEW.moleculeWidth
        : 0;
      const componentStartX =
        VIEW.x0 + (Number(region.componentStart) || 0) * VIEW.moleculeWidth;
      const componentEndX =
        VIEW.x0 + (Number(region.componentEnd) || 1) * VIEW.moleculeWidth;
      const componentAnchors = periodicWidth > EPSILON
        ? sampling.anchorXs.filter(
            (x) => x >= componentStartX - EPSILON && x <= componentEndX + EPSILON
          )
        : [];
      const componentWindows = periodicWidth > EPSILON
        ? sampling.localWindows.filter(
            (window) =>
              window.toX >= componentStartX - EPSILON &&
              window.fromX <= componentEndX + EPSILON
          )
        : [];
      const anchorXs = periodicWidth > EPSILON
        ? [...sampling.anchorXs, ...componentAnchors.map((x) => x + periodicWidth)]
        : sampling.anchorXs;
      const localWindows = periodicWidth > EPSILON
        ? [
            ...sampling.localWindows,
            ...componentWindows.map((window) => ({
              fromX: window.fromX + periodicWidth,
              toX: window.toX + periodicWidth,
            })),
          ]
        : sampling.localWindows;
      const topYForX = (x) => schematicNascentPathY(x, "top", region, span, model);
      const bottomYForX = (x) => schematicNascentPathY(x, "bottom", region, span, model);
      const topPath = sampledPath(
        fromX,
        toX,
        topYForX,
        3,
        (x) => isUnderpassGap(x, "top", model, region.componentId || null),
        anchorXs,
        localWindows,
        (x) => numericalPathTangent(topYForX, x, fromX, toX),
        "top",
        region.componentId || null
      );
      const bottomPath = sampledPath(
        fromX,
        toX,
        bottomYForX,
        3,
        (x) => isUnderpassGap(x, "bottom", model, region.componentId || null),
        anchorXs,
        localWindows,
        (x) => numericalPathTangent(bottomYForX, x, fromX, toX),
        "bottom",
        region.componentId || null
      );
      const width = Math.max(2, state.weight * 0.9);
      const opacity = smoothstep(spanWidth / 18);
      strands.push(
        renderArtworkPath(topPath, stateArtworkColour("newDna"), width, { opacity }),
        renderArtworkPath(bottomPath, stateArtworkColour("newDna"), width, { opacity })
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
      const fromX = circularGeometry() ? x - halfWidth : Math.max(VIEW.x0, x - halfWidth);
      const toX = circularGeometry() ? x + halfWidth : Math.min(VIEW.x1, x + halfWidth);
      const nascent = strand === "top" || strand === "bottom";
      const width = strand === "a" || strand === "b" ? state.weight : Math.max(2, state.weight * 0.9);
      const yForX = nascent
        ? (sampleX) => nascentY(sampleX, strand, model)
        : (sampleX) => templateY(sampleX, strand, model);
      const extraGapForX = nascent
        ? (sampleX) => {
            const replication = replicationAt(sampleX, model);
            return !newDnaVisibleAt(sampleX, replication, model);
          }
        : null;
      const tangentForX = (sampleX) =>
        numericalPathTangent(yForX, sampleX, VIEW.x0, VIEW.x1);
      const path = sampledPath(
        fromX,
        toX,
        yForX,
        3,
        extraGapForX,
        sampling.anchorXs,
        sampling.localWindows,
        tangentForX,
        strand
      );
      if (!path) return;

      let contourPath = path;
      if (contourEnabled()) {
        const availableWidth = Math.max(0, toX - fromX);
        const inset = Math.min(availableWidth * 0.24, crossoverBridgeContourInset(width));
        const contourFromX = fromX + inset;
        const contourToX = toX - inset;
        contourPath = contourToX - contourFromX > EPSILON
          ? sampledPath(
              contourFromX,
              contourToX,
              yForX,
              3,
              extraGapForX,
              sampling.anchorXs,
              sampling.localWindows,
              tangentForX,
              strand
            )
          : path;
      }
      overpasses.push(renderCrossoverBridgePath(path, contourPath, color, width, { opacity }));
    };

    crossoverSites().forEach(({ index, x }) => {
      const replication = replicationAt(x, model);
      const aIsOver = crossoverAIsOver(index);

      if (!replication.region || !state.layers.newDna) {
        addOverpass(
          x,
          aIsOver ? "a" : "b",
          aIsOver ? stateArtworkColour("templateA") : stateArtworkColour("templateB")
        );
        return;
      }

      const daughterMix = newDnaVisibleAt(x, replication, model)
        ? daughterDetailFade(replication.profile)
        : 0;
      addOverpass(
        x,
        aIsOver ? "a" : "b",
        aIsOver ? stateArtworkColour("templateA") : stateArtworkColour("templateB")
      );
      addOverpass(
        x,
        aIsOver ? "bottom" : "top",
        stateArtworkColour("newDna"),
        daughterMix
      );
    });

    return `<g aria-label="Alternating strand overpasses">${overpasses.join("")}</g>`;
  }

  function interactionHalfHeight() {
    return renderedDaughterHalfSpacing(state);
  }

  function toolGuideBounds(sourceState = state) {
    const aspectY = Math.max(EPSILON, artworkAspectY(sourceState));
    const zoom = Math.max(EPSILON, viewState.zoom);
    const margin = 18 / (zoom * aspectY);
    const halfExtent =
      renderedDaughterHalfSpacing(sourceState) + renderedDoubleStrandHalfHeight(sourceState) + margin;
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
        const bubbleWidth = circularGeometry() || origin.componentClosed
          ? Math.max(0, Number(origin.circularSpan) || 0) * VIEW.moleculeWidth
          : rightX - leftX;
        const hitWidth = Math.max(48, bubbleWidth);
        const hitX = leftX - x - Math.max(0, (48 - bubbleWidth) / 2);
        const hitHalfHeight = interactionHalfHeight();
        const replication = replicationAt(x, model);
        const labelY = nonlinearGeometry()
          ? VIEW.centerY + replication.amount + renderedDoubleStrandHalfHeight() + 42
          : clamp(VIEW.centerY + replication.amount + 42, 370, 500);
        const tangentRotation = nonlinearGeometry()
          ? geometryTangentAngleDegrees(origin.position)
          : 0;
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

        const leftHoverBoundary = Number.isFinite(origin.leftUnwrapped)
          ? origin.leftUnwrapped
          : origin.position - bubbleWidth / Math.max(EPSILON, VIEW.moleculeWidth) / 2;
        const rightHoverBoundary = Number.isFinite(origin.rightUnwrapped)
          ? origin.rightUnwrapped
          : origin.position + bubbleWidth / Math.max(EPSILON, VIEW.moleculeWidth) / 2;
        const hoverZone = freeformGeometry()
          ? `<path class="rs-origin-hover-zone rs-ui-only" data-role="bubble-hover" data-origin-id="${origin.id}" d="${freeformPolylinePath(
              leftHoverBoundary,
              rightHoverBoundary,
              0,
              { pathId: origin.componentId || origin.moleculeId || null, minimumSegments: 8 }
            )}" fill="none" stroke="transparent" stroke-width="${fixed(
              Math.max(48, hitHalfHeight * 2)
            )}" stroke-linecap="round"/>`
          : circularGeometry()
            ? `<path class="rs-origin-hover-zone rs-ui-only" data-role="bubble-hover" data-origin-id="${origin.id}" d="${circularPolylinePath(
                leftHoverBoundary,
                rightHoverBoundary,
                0,
                { minimumSegments: 8 }
              )}" fill="none" stroke="transparent" stroke-width="${fixed(
                Math.max(48, hitHalfHeight * 2)
              )}"/>`
            : `<rect class="rs-origin-hover-zone rs-ui-only" data-role="bubble-hover" data-origin-id="${origin.id}" x="${fixed(
              x + hitX
            )}" y="${fixed(VIEW.centerY - hitHalfHeight)}" width="${fixed(hitWidth)}" height="${fixed(
              hitHalfHeight * 2
            )}" fill="transparent"/>`;

        return `<g class="rs-origin-marker${dragged ? " is-dragged" : ""}" data-origin-id="${origin.id}">
          ${hoverZone}
          <g class="rs-origin-control-cluster" transform="${fixedUiTransform(
            x,
            VIEW.centerY,
            tangentRotation
          )}">
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
    const tangentRotation = nonlinearGeometry()
      ? geometryTangentAngleDegrees(position)
      : 0;

    return `<g transform="${fixedUiTransform(x, VIEW.centerY, tangentRotation)}" style="--rs-fork-terminal-opacity:${precise(
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

  function circularRangeGuide(
    range,
    {
      color,
      opacity = 0.08,
      dashed = "4 6",
      preview = false,
      index = null,
      includeIcon = false,
      includeDelete = false,
      ariaLabel = "",
    } = {}
  ) {
    const guideBounds = toolGuideBounds();
    const innerY = guideBounds.top;
    const outerY = guideBounds.bottom;
    const middleY = (innerY + outerY) / 2;
    const guideWidth = Math.max(1, outerY - innerY);
    const rawStart = Number(range?.start) || 0;
    const rawEnd = Number(range?.end) || rawStart;
    const unwrappedStart = Math.min(rawStart, rawEnd);
    const unwrappedEnd = Math.min(unwrappedStart + 1, Math.max(rawStart, rawEnd));
    const startFraction = wrapFraction(unwrappedStart);
    const endFraction = wrapFraction(unwrappedEnd);
    const startX = VIEW.x0 + startFraction * VIEW.moleculeWidth;
    const endX = VIEW.x0 + endFraction * VIEW.moleculeWidth;
    const centerFraction = wrapFraction((unwrappedStart + unwrappedEnd) / 2);
    const centerX = VIEW.x0 + centerFraction * VIEW.moleculeWidth;
    const startInner = geometryPoint(startX, innerY);
    const startOuter = geometryPoint(startX, outerY);
    const endInner = geometryPoint(endX, innerY);
    const endOuter = geometryPoint(endX, outerY);
    const arcPath = circularPolylinePath(unwrappedStart, unwrappedEnd, middleY - VIEW.centerY, {
      minimumSegments: 8,
    });
    const boundaryOpacity = preview ? 0.72 : 0.62;
    const guide = `<path d="${arcPath}" fill="none" stroke="${color}" stroke-width="${fixed(
      guideWidth
    )}" opacity="${precise(opacity)}"/>
      <line x1="${precise(startInner.x)}" y1="${precise(startInner.y)}" x2="${precise(
        startOuter.x
      )}" y2="${precise(startOuter.y)}" stroke="${color}" stroke-width="1.5" stroke-dasharray="${dashed}" opacity="${precise(
        boundaryOpacity
      )}" vector-effect="non-scaling-stroke"/>
      ${
        unwrappedEnd - unwrappedStart > EPSILON
          ? `<line x1="${precise(endInner.x)}" y1="${precise(endInner.y)}" x2="${precise(
              endOuter.x
            )}" y2="${precise(endOuter.y)}" stroke="${color}" stroke-width="1.5" stroke-dasharray="${dashed}" opacity="${precise(
              boundaryOpacity
            )}" vector-effect="non-scaling-stroke"/>`
          : ""
      }`;
    if (!includeIcon) return guide;

    const representativeScale = Math.max(
      EPSILON,
      circularScreenRadialScale(centerFraction)
    );
    const iconOffset = 22 / Math.max(EPSILON, viewState.zoom * representativeScale);
    const iconY = outerY + iconOffset;
    const rotation = geometryTangentAngleDegrees(centerFraction);
    const deleteControl = includeDelete
      ? renderLocalItemDeleteControl(
          27,
          0,
          "delete-cut",
          `data-cut-index="${index}"`,
          `Delete break ${Number(index) + 1}`
        )
      : "";
    return `${guide}
      <path class="rs-ui-only" data-role="cut" data-cut-index="${index}" d="${arcPath}" fill="none" stroke="transparent" stroke-width="${fixed(
        guideWidth + 28
      )}"/>
      <g class="rs-ui-only" transform="${fixedUiTransform(centerX, iconY, rotation)}" ${
        ariaLabel ? `aria-label="${ariaLabel}"` : ""
      }>
        <circle cx="0" cy="0" r="17" fill="${canvasBackgroundColor()}" stroke="${color}" stroke-width="2"/>
        <text x="0" y="6" fill="${color}" font-family="Segoe UI Symbol, sans-serif" font-size="18" text-anchor="middle">&#9986;</text>
        ${deleteControl}
      </g>`;
  }

  function freeformRangeGuide(
    range,
    {
      color,
      opacity = 0.08,
      dashed = "4 6",
      preview = false,
      index = null,
      includeIcon = false,
      includeDelete = false,
      ariaLabel = "",
      pathId = null,
    } = {}
  ) {
    const metric = freeformRangeMetric(range, state, pathId || range?.componentId || null);
    if (!metric) return "";
    const bounds = freeformRangeLocalBounds(range, metric);
    const guideBounds = toolGuideBounds();
    const halfWidth = Math.max(1, (guideBounds.bottom - guideBounds.top) / 2);
    const path = freeformPolylinePath(range.start, range.end, 0, {
      sourceState: state,
      pathId: metric.id,
      minimumSegments: 8,
    });
    if (!path) return "";

    const boundaryMarkup = [bounds.lower, bounds.upper]
      .filter((value, boundaryIndex) => boundaryIndex === 0 || bounds.span > EPSILON)
      .map((local) => {
        const point = pointOnFreeformMetric(metric, local);
        return `<line x1="${precise(point.x - point.normalX * halfWidth)}" y1="${precise(
          point.y - point.normalY * halfWidth
        )}" x2="${precise(point.x + point.normalX * halfWidth)}" y2="${precise(
          point.y + point.normalY * halfWidth
        )}" stroke="${color}" stroke-width="1.5" stroke-dasharray="${dashed}" opacity="${precise(
          preview ? 0.72 : 0.62
        )}" vector-effect="non-scaling-stroke"/>`;
      })
      .join("");
    const guide = `<path d="${path}" fill="none" stroke="${color}" stroke-width="${fixed(
      halfWidth * 2
    )}" opacity="${precise(opacity)}" stroke-linecap="round" stroke-linejoin="round"/>${boundaryMarkup}`;
    if (!includeIcon) return guide;

    const center = freeformRangePoint(range, state, metric.id);
    if (!center) return guide;
    const normalScale = Math.max(
      EPSILON,
      Math.hypot(
        center.normalX * artworkAspectX(),
        center.normalY * artworkAspectY()
      )
    );
    const iconOffset = halfWidth + 22 / Math.max(EPSILON, viewState.zoom * normalScale);
    const iconPoint = {
      x: center.x + center.normalX * iconOffset,
      y: center.y + center.normalY * iconOffset,
    };
    const rotation = (Math.atan2(center.tangentY, center.tangentX) * 180) / Math.PI;
    const deleteControl = includeDelete
      ? renderLocalItemDeleteControl(
          27,
          0,
          "delete-cut",
          `data-cut-index="${index}"`,
          `Delete break ${Number(index) + 1}`
        )
      : "";
    return `${guide}
      <path class="rs-ui-only" data-role="cut" data-cut-index="${index}" d="${path}" fill="none" stroke="transparent" stroke-width="${fixed(
        halfWidth * 2 + 28
      )}" stroke-linecap="round"/>
      <g class="rs-ui-only" transform="${fixedCanvasUiTransform(
        iconPoint.x,
        iconPoint.y,
        rotation
      )}" ${ariaLabel ? `aria-label="${ariaLabel}"` : ""}>
        <circle cx="0" cy="0" r="17" fill="${canvasBackgroundColor()}" stroke="${color}" stroke-width="2"/>
        <text x="0" y="6" fill="${color}" font-family="Segoe UI Symbol, sans-serif" font-size="18" text-anchor="middle">&#9986;</text>
        ${deleteControl}
      </g>`;
  }

  function renderCuts() {
    const cuts = state.cuts.map((cut, index) => ({
      range: {
        ...cutRange(cut),
        componentId: cut.componentId || cut.moleculeId || cut.pathId || null,
      },
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
        if (freeformGeometry()) {
          return `<g class="rs-cut-marker${isPreview ? " is-preview" : ""}" data-role="cut" data-cut-index="${index}">
            ${freeformRangeGuide(range, {
              color: cutColor,
              preview: isPreview,
              index,
              includeIcon: true,
              includeDelete: !isPreview,
              ariaLabel: isPreview ? "Break preview" : `Break ${Number(index) + 1}`,
              pathId: range.componentId || null,
            })}
          </g>`;
        }
        if (circularGeometry()) {
          return `<g class="rs-cut-marker${isPreview ? " is-preview" : ""}" data-role="cut" data-cut-index="${index}">
            ${circularRangeGuide(range, {
              color: cutColor,
              preview: isPreview,
              index,
              includeIcon: true,
              includeDelete: !isPreview,
              ariaLabel: isPreview ? "Break preview" : `Break ${Number(index) + 1}`,
            })}
          </g>`;
        }

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
    if (freeformGeometry()) {
      return `<g class="rs-unreplicate-preview rs-ui-only" aria-label="Unreplicate preview">${freeformRangeGuide(
        range,
        {
          color: artworkColour("#b8384b"),
          opacity: 0.055,
          dashed: "5 6",
          preview: true,
          pathId: range.componentId || null,
        }
      )}</g>`;
    }
    if (circularGeometry()) {
      return `<g class="rs-unreplicate-preview rs-ui-only" aria-label="Unreplicate preview">${circularRangeGuide(
        range,
        {
          color: artworkColour("#b8384b"),
          opacity: 0.055,
          dashed: "5 6",
          preview: true,
        }
      )}</g>`;
    }
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

  function circularPolylinePath(
    startFraction,
    endFraction,
    radialOffset = 0,
    { sourceState = state, close = false, minimumSegments = 12 } = {}
  ) {
    const start = Number(startFraction) || 0;
    let end = Number(endFraction) || 0;
    if (end < start) end += Math.ceil(start - end);
    const span = Math.max(0, end - start);
    if (span <= EPSILON) {
      const point = geometryPoint(
        VIEW.x0 + wrapFraction(start) * moleculeWidthForState(sourceState),
        VIEW.centerY + radialOffset,
        sourceState
      );
      return `M${precise(point.x)} ${precise(point.y)}`;
    }
    const segments = Math.max(
      minimumSegments,
      Math.ceil(span * Math.PI * 2 * circularRadius(sourceState) / 5)
    );
    const points = [];
    for (let index = 0; index <= segments; index += 1) {
      const fraction = start + (span * index) / segments;
      points.push(
        geometryPoint(
          VIEW.x0 + fraction * moleculeWidthForState(sourceState),
          VIEW.centerY + radialOffset,
          sourceState
        )
      );
    }
    let path = `M${precise(points[0].x)} ${precise(points[0].y)}`;
    for (let index = 1; index < points.length; index += 1) {
      path += ` L${precise(points[index].x)} ${precise(points[index].y)}`;
    }
    if (close) path += " Z";
    return path;
  }


  function freeformRangeMetric(range, sourceState = state, preferredPathId = null) {
    const explicit = preferredPathId
      ? freeformMetricById(preferredPathId, sourceState)
      : null;
    if (explicit) return explicit;
    const first = Number(range?.start);
    const second = Number(range?.end);
    const candidates = [first, second, (first + second) / 2]
      .filter(Number.isFinite)
      .map((value) => clamp(value, 0, 1));
    for (const candidate of candidates) {
      const metric = freeformMetricAtFraction(candidate, sourceState);
      if (metric) return metric;
    }
    return freeformPathMetrics(sourceState)[0] || null;
  }

  function freeformRangeLocalBounds(range, metric) {
    const span = Math.max(EPSILON, metric?.span || 1);
    let first = (Number(range?.start) - metric.start) / span;
    let second = (Number(range?.end) - metric.start) / span;
    if (!Number.isFinite(first)) first = 0;
    if (!Number.isFinite(second)) second = first;
    let lower = Math.min(first, second);
    let upper = Math.max(first, second);
    if (metric.closed) {
      upper = Math.min(lower + 1, upper);
    } else {
      lower = clamp(lower, 0, 1);
      upper = clamp(upper, 0, 1);
    }
    return { lower, upper, span: Math.max(0, upper - lower) };
  }

  function freeformPolylinePath(
    startFraction,
    endFraction,
    normalOffset = 0,
    {
      sourceState = state,
      pathId = null,
      minimumSegments = 8,
    } = {}
  ) {
    const range = { start: Number(startFraction), end: Number(endFraction) };
    const metric = freeformRangeMetric(range, sourceState, pathId);
    if (!metric) return "";
    const bounds = freeformRangeLocalBounds(range, metric);
    const parts = [];
    if (bounds.span <= EPSILON) {
      parts.push([bounds.lower, bounds.lower]);
    } else if (!metric.closed) {
      parts.push([bounds.lower, bounds.upper]);
    } else {
      let cursor = bounds.lower;
      while (cursor < bounds.upper - EPSILON) {
        const boundary = Math.min(bounds.upper, Math.floor(cursor + EPSILON) + 1);
        parts.push([cursor, boundary]);
        cursor = boundary;
      }
    }

    return parts
      .map(([from, to]) => {
        const localSpan = Math.max(0, to - from);
        const segments = Math.max(
          localSpan <= EPSILON ? 0 : minimumSegments,
          Math.ceil((localSpan * metric.length) / Math.max(2.5, FREEFORM_PATH_SAMPLE_SPACING))
        );
        const points = [];
        const count = Math.max(1, segments);
        for (let index = 0; index <= count; index += 1) {
          const local = from + (localSpan * index) / count;
          const point = pointOnFreeformMetric(metric, local);
          const framedPoint = { ...point, metric };
          const frame = freeformRenderedFrame(framedPoint, sourceState);
          const offset = freeformRenderedNormalOffset(framedPoint, normalOffset);
          points.push({
            x: point.x + frame.normalX * offset,
            y: point.y + frame.normalY * offset,
          });
        }
        if (!points.length) return "";
        return freeformSplinePathD({
          points,
          closed: metric.closed && localSpan >= 1 - EPSILON,
        });
      })
      .filter(Boolean)
      .join(" ");
  }

  function freeformRangePoint(range, sourceState = state, preferredPathId = null) {
    const metric = freeformRangeMetric(range, sourceState, preferredPathId);
    if (!metric) return null;
    const bounds = freeformRangeLocalBounds(range, metric);
    const local = (bounds.lower + bounds.upper) / 2;
    return { ...pointOnFreeformMetric(metric, local), metric, localUnwrapped: local };
  }

  function renderCentricGrid(sourceState = state) {
    if (!sourceState?.advanced?.grid || gridStyle(sourceState) !== "centric") return "";
    const gridColour = canvasGridColor(sourceState);
    const maximumRadius = Math.hypot(VIEW.width, VIEW.height) * 1.35;
    const circles = [];
    for (let radius = CIRCULAR_GRID_STEP; radius <= maximumRadius; radius += CIRCULAR_GRID_STEP) {
      circles.push(
        `<circle cx="${fixed(VIEW.width / 2)}" cy="${fixed(VIEW.centerY)}" r="${fixed(
          radius
        )}" fill="none" stroke="${gridColour}" stroke-width="1" vector-effect="non-scaling-stroke"/>`
      );
    }
    const spokes = [];
    for (let degrees = 0; degrees < 360; degrees += 30) {
      const angle = (degrees * Math.PI) / 180;
      const dx = Math.cos(angle) * maximumRadius;
      const dy = Math.sin(angle) * maximumRadius;
      spokes.push(
        `<line x1="${fixed(VIEW.width / 2 - dx)}" y1="${fixed(
          VIEW.centerY - dy
        )}" x2="${fixed(VIEW.width / 2 + dx)}" y2="${fixed(
          VIEW.centerY + dy
        )}" stroke="${gridColour}" stroke-width="1" vector-effect="non-scaling-stroke"/>`
      );
    }
    return `<g class="rs-centric-grid rs-ui-only" aria-hidden="true">${circles.join("")}${spokes.join(
      ""
    )}</g>`;
  }

  function circularRulerRadius(sourceState = state) {
    const representativeScale = Math.max(
      EPSILON,
      Math.min(artworkAspectX(sourceState), artworkAspectY(sourceState))
    );
    const fixedMargin = 34 / Math.max(EPSILON, viewState.zoom * representativeScale);
    return (
      circularRadius(sourceState) +
      renderedDaughterHalfSpacing(sourceState) +
      renderedDoubleStrandHalfHeight(sourceState) +
      Math.max(sourceState.weight, sourceState.basePairWidth) +
      fixedMargin
    );
  }

  function renderCircularRuler(sourceState = state) {
    if (!circularGeometry(sourceState) || !scaleBarEnabled(sourceState)) return "";
    const radius = circularRulerRadius(sourceState);
    const radialOffset = radius - circularRadius(sourceState);
    const pairCount = basePairCount(sourceState);
    if (pairCount <= 0) return "";
    const averageAspect = Math.sqrt(
      Math.max(EPSILON, artworkAspectX(sourceState) * artworkAspectY(sourceState))
    );
    const pairSpacing =
      (Math.PI * 2 * radius * averageAspect * viewState.zoom) /
      Math.max(1, basePairLattice(sourceState).subdivisionCount);
    const majorEvery = rulerMajorEvery(pairSpacing, sourceState);
    const tickIndices = rulerTickIndices(majorEvery, sourceState).filter(
      (index) => index < pairCount
    );
    const ink = canvasInkColor(sourceState);
    const ticks = tickIndices
      .map((index) => {
        const fraction = basePairFraction(index, sourceState);
        const x = VIEW.x0 + fraction * moleculeWidthForState(sourceState);
        const radialScreenScale = Math.max(
          EPSILON,
          viewState.zoom * circularScreenRadialScale(fraction, sourceState)
        );
        const tickHalf = 6 / radialScreenScale;
        const labelOffset = 19 / radialScreenScale;
        const inner = geometryPoint(x, VIEW.centerY + radialOffset - tickHalf, sourceState);
        const outer = geometryPoint(x, VIEW.centerY + radialOffset + tickHalf, sourceState);
        const labelY = VIEW.centerY + radialOffset + tickHalf + labelOffset;
        return `<g class="rs-circular-ruler-tick">
          <line x1="${precise(inner.x)}" y1="${precise(inner.y)}" x2="${precise(
            outer.x
          )}" y2="${precise(outer.y)}" stroke="${ink}" stroke-width="1.5" vector-effect="non-scaling-stroke"/>
          <g transform="${fixedUiTransform(x, labelY)}"><text x="0" y="4" font-size="11" font-weight="700" text-anchor="middle">${rulerBasePairPosition(
            index,
            sourceState
          )}</text></g>
        </g>`;
      })
      .join("");
    const titleGap = 48 / Math.max(
      EPSILON,
      viewState.zoom * artworkAspectY(sourceState)
    );
    const title = `<g data-rs-circular-ruler-title="bottom" transform="${fixedCanvasUiTransform(
      VIEW.width / 2,
      VIEW.centerY + radius + titleGap
    )}"><text x="0" y="4" font-size="12" font-weight="750" text-anchor="middle">Genomic position (bp)</text></g>`;
    return `<g class="rs-circular-ruler rs-ui-only" aria-label="Genomic position in base pairs">
      <path d="${circularPolylinePath(0, 1, radialOffset, {
        sourceState,
        close: true,
        minimumSegments: 96,
      })}" fill="none" stroke="${ink}" stroke-width="1.7" vector-effect="non-scaling-stroke"/>
      ${ticks}${title}
    </g>`;
  }

  function freeformArtworkBounds(sourceState = state, padding = 0) {
    const metrics = freeformPathMetrics(sourceState);
    if (!metrics.length) {
      return {
        x: BASE_VIEW.x0,
        y: VIEW.centerY,
        width: BASE_MOLECULE_WIDTH,
        height: 1,
        left: BASE_VIEW.x0,
        right: BASE_VIEW.x1,
        top: VIEW.centerY,
        bottom: VIEW.centerY,
      };
    }
    const left = Math.min(...metrics.map((metric) => metric.bounds.left)) - padding;
    const right = Math.max(...metrics.map((metric) => metric.bounds.right)) + padding;
    const top = Math.min(...metrics.map((metric) => metric.bounds.top)) - padding;
    const bottom = Math.max(...metrics.map((metric) => metric.bounds.bottom)) + padding;
    return {
      x: left,
      y: top,
      width: Math.max(EPSILON, right - left),
      height: Math.max(EPSILON, bottom - top),
      left,
      right,
      top,
      bottom,
    };
  }

  function freeformOffsetPathD(metric, normalOffset, sourceState = state) {
    const segmentCount = Math.max(12, Math.ceil(metric.length / 5));
    const count = metric.closed ? segmentCount : segmentCount + 1;
    const points = Array.from({ length: count }, (_, index) => {
      const local = metric.closed ? index / segmentCount : index / Math.max(1, segmentCount);
      const point = pointOnFreeformMetric(metric, local);
      const framedPoint = { ...point, metric };
      const frame = freeformRenderedFrame(framedPoint, sourceState);
      const offset = freeformRenderedNormalOffset(framedPoint, normalOffset);
      return {
        x: point.x + frame.normalX * offset,
        y: point.y + frame.normalY * offset,
      };
    });
    if (!points.length) return "";
    return freeformSplinePathD({ points, closed: metric.closed });
  }

  function renderFreeformRuler(sourceState = state) {
    if (!freeformGeometry(sourceState) || !scaleBarEnabled(sourceState)) return "";
    const metrics = freeformPathMetrics(sourceState);
    if (!metrics.length) return "";
    const pairCount = basePairCount(sourceState);
    if (pairCount <= 0) return "";
    const averageAspect = Math.sqrt(
      Math.max(EPSILON, artworkAspectX(sourceState) * artworkAspectY(sourceState))
    );
    const totalLength = metrics.reduce((total, metric) => total + metric.length, 0);
    const pairSpacing =
      (totalLength * averageAspect * viewState.zoom) /
      Math.max(1, basePairLattice(sourceState).subdivisionCount);
    const majorEvery = rulerMajorEvery(pairSpacing, sourceState);
    const offset =
      sourceState.daughterSpacing / 2 +
      doubleStrandHalfHeight(sourceState) +
      Math.max(sourceState.weight, sourceState.basePairWidth) +
      24 / Math.max(EPSILON, viewState.zoom * averageAspect);
    const ink = canvasInkColor(sourceState);
    const axes = metrics
      .map(
        (metric) =>
          `<path d="${freeformOffsetPathD(metric, offset, sourceState)}" fill="none" stroke="${ink}" stroke-width="1.7" vector-effect="non-scaling-stroke"/>`
      )
      .join("");
    const ticks = rulerTickIndices(majorEvery, sourceState)
      .filter((index) => index <= pairCount)
      .map((index) => {
        const fraction = basePairFraction(index, sourceState);
        const position = freeformPointAtFraction(fraction, sourceState);
        if (!position) return "";
        const normalScale = Math.max(
          EPSILON,
          viewState.zoom * geometryScreenNormalScale(fraction, sourceState)
        );
        const tickHalf = 6 / normalScale;
        const labelOffset = 18 / normalScale;
        const inner = {
          x: position.x + position.normalX * (offset - tickHalf),
          y: position.y + position.normalY * (offset - tickHalf),
        };
        const outer = {
          x: position.x + position.normalX * (offset + tickHalf),
          y: position.y + position.normalY * (offset + tickHalf),
        };
        const labelPoint = {
          x: position.x + position.normalX * (offset + tickHalf + labelOffset),
          y: position.y + position.normalY * (offset + tickHalf + labelOffset),
        };
        return `<g class="rs-freeform-ruler-tick">
          <line x1="${precise(inner.x)}" y1="${precise(inner.y)}" x2="${precise(
            outer.x
          )}" y2="${precise(outer.y)}" stroke="${ink}" stroke-width="1.5" vector-effect="non-scaling-stroke"/>
          <g transform="${fixedCanvasUiTransform(labelPoint.x, labelPoint.y)}"><text x="0" y="4" font-size="11" font-weight="700" text-anchor="middle">${rulerBasePairPosition(
            index,
            sourceState
          )}</text></g>
        </g>`;
      })
      .join("");
    const bounds = freeformArtworkBounds(sourceState, offset);
    const titleGap = 42 / Math.max(EPSILON, viewState.zoom * artworkAspectY(sourceState));
    const title = `<g data-rs-freeform-ruler-title="bottom" transform="${fixedCanvasUiTransform(
      (bounds.left + bounds.right) / 2,
      bounds.bottom + titleGap
    )}"><text x="0" y="4" font-size="12" font-weight="750" text-anchor="middle">Genomic position (bp)</text></g>`;
    return `<g class="rs-freeform-ruler rs-ui-only" aria-label="Genomic position in base pairs">${axes}${ticks}${title}</g>`;
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
    const showGrid = state.advanced.grid === true;
    const centric = showGrid && gridStyle() === "centric";
    frame.classList.toggle("is-grid-hidden", !showGrid);
    frame.classList.toggle("is-centric-grid", centric);
    if (!showGrid || centric) return;

    const matrix = elements.canvas.querySelector("#rs-artwork-aspect")?.getScreenCTM();
    if (!matrix) return;
    const bounds = frame.getBoundingClientRect();
    const originX = bounds.left + frame.clientLeft;
    const originY = bounds.top + frame.clientTop;
    const anchor = transformedSvgPoint(VIEW.x0, VIEW.centerY, matrix);
    // A fixed genomic column count keeps the grid independent of base-pair
    // resolution while guaranteeing lines through both ruler endpoints. For
    // odd resolutions, those endpoints are also base-pair lattice sites.
    const columns = gridColumnCount(state);
    const xStep = transformedSvgPoint(
      VIEW.x0 + VIEW.moleculeWidth / columns,
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
    if (!ruler) return;
    const visible = !nonlinearGeometry() && scaleBarEnabled();
    ruler.hidden = !visible;
    if (!visible) {
      ruler.innerHTML = "";
      return;
    }
    const matrix = elements.canvas.querySelector("#rs-artwork-aspect")?.getScreenCTM();
    if (!matrix) return;

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
            ([color, label]) => {
              const contourStyle = contourEnabled()
                ? `;box-shadow:0 0 0 ${fixed(Math.min(3, contourThickness()))}px ${contourColor()}`
                : "";
              return `<span class="rs-legend-item"><span class="rs-legend-swatch" style="background:${color}${contourStyle}"></span>${label}</span>`;
            }
          )
          .join("")
      : "";
  }

  function renderFreeformEndLabels(model, sourceState = state) {
    if (!sourceState.layers?.labels || !freeformGeometry(sourceState)) return "";
    const labels = [];
    freeformPathMetrics(sourceState)
      .filter((metric) => !metric.closed)
      .forEach((metric) => {
        const endpoints = [
          { local: 0, fraction: metric.start, direction: -1, a: "5'", b: "3'" },
          { local: 1, fraction: metric.end, direction: 1, a: "3'", b: "5'" },
        ];
        endpoints.forEach((endpoint) => {
          const center = pointOnFreeformMetric(metric, endpoint.local);
          const x = VIEW.x0 + endpoint.fraction * moleculeWidthForState(sourceState);
          const positions = [
            { strand: "a", text: endpoint.a },
            { strand: "b", text: endpoint.b },
          ];
          positions.forEach(({ strand, text }) => {
            const strandPoint = freeformStrandGeometryPoint(
              x,
              templateY(x, strand, model),
              strand,
              sourceState
            );
            const labelPoint = {
              x: strandPoint.x + center.tangentX * endpoint.direction * 22,
              y: strandPoint.y + center.tangentY * endpoint.direction * 22,
            };
            labels.push(
              `<g transform="${fixedCanvasUiTransform(labelPoint.x, labelPoint.y)}"><text x="0" y="4" text-anchor="middle">${text}</text></g>`
            );
          });
        });
      });
    return `<g class="rs-ui-only" fill="${canvasInkColor(sourceState)}" font-family="Inter, Segoe UI, sans-serif" font-size="14" font-weight="700">${labels.join(
      ""
    )}</g>`;
  }

  function renderEndLabels(model) {
    if (!state.layers.labels || circularGeometry()) return "";
    if (freeformGeometry()) return renderFreeformEndLabels(model, state);
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

  function buildArtworkMarkup(model) {
    if (freeformGeometry() && !freeformPathMetrics().length) return "";
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
      (x) => numericalPathTangent(templateAYForX, x, VIEW.x0, VIEW.x1),
      "a"
    );
    const pathB = sampledPath(
      VIEW.x0,
      VIEW.x1,
      templateBYForX,
      3,
      (x) => isUnderpassGap(x, "b", model),
      sampling.anchorXs,
      sampling.localWindows,
      (x) => numericalPathTangent(templateBYForX, x, VIEW.x0, VIEW.x1),
      "b"
    );
    return `${renderBasePairs(model)}
      ${renderArtworkPath(pathA, stateArtworkColour("templateA"), state.weight)}
      ${renderArtworkPath(pathB, stateArtworkColour("templateB"), state.weight)}
      ${renderNascentDna(model)}
      ${renderCrossoverOverpasses(model)}`;
  }

  function artworkMarkup(model) {
    return withArtworkComputationCache(model, state, () =>
      buildArtworkMarkup(model)
    );
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

  function scheduleRender() {
    if (scheduledRenderFrame) return;
    scheduledRenderFrame = requestAnimationFrame(() => {
      scheduledRenderFrame = 0;
      render();
    });
  }

  function render() {
    if (scheduledRenderFrame) {
      cancelAnimationFrame(scheduledRenderFrame);
      scheduledRenderFrame = 0;
    }
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
    const liveArtwork = withArtworkStrokeScale(viewState.zoom, () =>
      withArtworkViewportScale(canvasViewportScale(), () => artworkMarkup(model))
    );

    elements.canvas.innerHTML = `
      <title id="dnaCanvasTitle">RepliCanvas DNA replication diagram</title>
      <desc id="dnaCanvasDescription">A vector diagram of a ${basePairCount()} base-pair ${
        geometryMode()
      } DNA molecule with ${
        state.origins.length
      } replication origins, ${model.activeForkCount} active forks, and ${state.cuts.length} strand breaks.</desc>
      <defs>
        <marker id="rs-arrow-neutral" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 8 4 L 0 8 z" fill="${canvasInkColor()}"/>
        </marker>
      </defs>
      <rect class="rs-canvas-hit-plane rs-ui-only" width="1200" height="640" fill="transparent"/>
      <g id="rs-world" transform="${worldTransform()}">
        <g id="rs-grid-aspect" transform="${artworkAspectTransform()}">
          ${renderCentricGrid()}
        </g>
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
          ${renderCircularRuler()}
          ${renderFreeformRuler()}
          ${renderFreeformEditorOverlay()}
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
      const selectedPath =
        freeformGeometry() && freeformEditor.tool === "select"
          ? selectedFreeformPath()
          : null;
      if (selectedOrigin) {
        elements.selectionMessage.textContent = `O${selectedOrigin.index + 1} at ${genomicPositionAtFraction(
          selectedOrigin.position
        )} bp`;
      } else if (selectedPath) {
        const paths = state.freeform?.paths || [];
        const pathIndex = Math.max(0, paths.findIndex((path) => path.id === selectedPath.id));
        elements.selectionMessage.textContent = `DNA piece ${pathIndex + 1} of ${paths.length} — ${
          selectedPath.closed ? "periodic loop" : "open ends"
        }`;
      } else {
        elements.selectionMessage.textContent = "No selection";
      }
    }
    updateFreeformToolbar();
    updateGrid();
    updateChromosomeRuler();
    refreshContextAction();
    scheduleTemplateCache();
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
    if (elements.basePairTranslationOutput) {
      elements.basePairTranslationOutput.textContent = basePairTranslationLabel();
    }
    if (elements.basePairAngleOutput) {
      elements.basePairAngleOutput.textContent = basePairAngleLabel();
    }
    if (elements.transitionTightnessOutput) {
      elements.transitionTightnessOutput.textContent = transitionTightnessLabel();
    }
    if (elements.terminalSmoothingOutput) {
      elements.terminalSmoothingOutput.textContent = terminalSmoothingLabel();
    }
    if (elements.contourThicknessOutput) {
      elements.contourThicknessOutput.textContent = `${Number(contourThickness().toFixed(1))} px`;
    }
    elements.speedOutput.textContent = speedMultiplierLabel();
    elements.zoomOutput.textContent = `${Math.round(viewState.zoom * 100)}%`;
    elements.lengthStat.textContent = `${basePairCount()} bp`;
    elements.originStat.textContent = state.origins.length;
    elements.forkStat.textContent = model.activeForkCount;
    elements.replicatedStat.textContent = `${replicated}%`;
    elements.progressControl.value = state.progress;
    elements.lengthControl.min = freeformGeometry()
      ? FREEFORM_MIN_GENOMIC_LENGTH
      : CONTROL_RANGES.length.min;
    elements.lengthControl.max = maximumLengthForBasePairCount(state);
    elements.deleteBreaksButton.disabled = state.cuts.length === 0;
    elements.deleteOriginsButton.disabled = state.origins.length === 0;
    elements.playButton.disabled = state.origins.length === 0;
    if (elements.exportMp4Button) {
      const animationAvailable = animationExportAvailable(state);
      elements.exportMp4Button.disabled = isVideoExporting || !animationAvailable;
      elements.exportMp4Button.title = animationAvailable
        ? "Export the configured S-phase animation"
        : "Add an origin to enable MP4 animation export";
      elements.exportMp4Button.setAttribute(
        "aria-label",
        animationAvailable
          ? "Export MP4 animation"
          : "MP4 animation unavailable until an origin is added"
      );
      if (elements.exportMp4Description) {
        elements.exportMp4Description.textContent = animationAvailable
          ? `${appSettings.frameRate} fps, ${appSettings.videoWidth} px`
          : "Add an origin to enable";
      }
    }
    updateHistoryButtons();
  }

  function syncControls() {
    synchroniseSPhaseFromGeometry();
    const modelName = strandModel();
    const doubleStrandDetails = modelSupportsDoubleStrandDetails();
    const pairMode = basePairColorMode();
    if (elements.modelControl) elements.modelControl.value = modelName;
    if (elements.geometryControl) elements.geometryControl.value = geometryMode();
    if (elements.fitGenomeToggle) {
      elements.fitGenomeToggle.checked = freeformGeometry() || lengthMode() === "scale";
      elements.fitGenomeToggle.disabled = freeformGeometry();
      elements.fitGenomeToggle.title = freeformGeometry()
        ? "Free-form DNA follows the shape drawn on the canvas"
        : "Fit the complete genome to the canvas";
    }
    if (elements.rightHandedToggle) elements.rightHandedToggle.checked = dnaHandedness() === "right";
    if (elements.depthAwareColorSplitToggle) {
      elements.depthAwareColorSplitToggle.checked = depthAwareBasePairSplit();
    }
    elements.lengthControl.max = maximumLengthForBasePairCount(state);
    elements.lengthControl.step = freeformGeometry() ? "1" : "5";
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
    if (elements.basePairTranslationControl) {
      elements.basePairTranslationControl.value = basePairTranslation();
    }
    if (elements.basePairAngleControl) {
      elements.basePairAngleControl.value = basePairAngle();
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
    elements.centricGridToggle.checked = gridStyle() === "centric";
    elements.centricGridToggle.disabled = !state.advanced.grid;
    elements.scaleBarToggle.checked = scaleBarEnabled();
    elements.alwaysShowControlsToggle.checked = state.advanced.alwaysShowControls;
    elements.snapToBasePairsToggle.checked = snapEditingEnabled();
    elements.includeExportBackgroundToggle.checked = state.advanced.includeExportBackground;
    elements.contourToggle.checked = contourEnabled();
    elements.contourThicknessControl.value = contourThickness();
    elements.contourColorControl.value = contourColor();
    elements.contourThicknessOption.hidden = !contourEnabled();
    elements.contourColorOption.hidden = !contourEnabled();
    elements.contourThicknessControl.disabled = !contourEnabled();
    elements.contourColorControl.disabled = !contourEnabled();
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
    if (elements.rightHandedToggle) elements.rightHandedToggle.disabled = modelName !== "standard";
    if (elements.depthAwareColorSplitToggle) {
      elements.depthAwareColorSplitToggle.disabled =
        !doubleStrandDetails || modelName !== "standard" || pairMode === "single";
    }
    if (elements.basePairAngleControl) elements.basePairAngleControl.disabled = !doubleStrandDetails;
    elements.newDnaStartDistanceControl.disabled = modelName === "minimal";
    elements.strandPhaseShiftControl.disabled = modelName !== "standard";
    if (elements.basePairTranslationControl) {
      elements.basePairTranslationControl.disabled = modelName !== "standard";
    }
    syncSettingsControls();
    updateFreeformToolbar();
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

  function screenToArtworkPoint(point, sourceState = state) {
    const transform = artworkTransformComponents(sourceState);
    const aspectX = VIEW.width / 2 +
      (point.x - VIEW.width / 2 - viewState.panX) / Math.max(EPSILON, viewState.zoom);
    const aspectY = VIEW.centerY +
      (point.y - VIEW.centerY - viewState.panY) / Math.max(EPSILON, viewState.zoom);
    return {
      x: (aspectX - transform.translateX) / Math.max(EPSILON, transform.scaleX),
      y: (aspectY - transform.translateY) / Math.max(EPSILON, transform.scaleY),
    };
  }

  function screenToWorld(point, sourceState = state) {
    return geometryPointToLinear(screenToArtworkPoint(point, sourceState), sourceState);
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
    if (freeformGeometry() && freeformEditor.tool !== "edit") return null;
    if (!point || ["origin", "fork", "cut", "delete-origin", "delete-cut"].includes(role)) return null;
    const halfHeight = interactionHalfHeight();
    const nearFreeformPath =
      !freeformGeometry() ||
      (Boolean(point.pathId) && Number.isFinite(point.distance) && point.distance <= halfHeight);
    if (
      point.x < VIEW.x0 ||
      point.x > VIEW.x1 ||
      Math.abs(point.y - VIEW.centerY) > halfHeight ||
      !nearFreeformPath
    ) {
      return null;
    }
    return replicationAt(point.x, model).region ? "split" : "add";
  }

  function refreshContextAction() {
    const action = elements.canvas.querySelector("#rs-context-action");
    if ((freeformGeometry() && freeformEditor.tool !== "edit") || !hoverState || dragState) {
      elements.canvas.classList.remove("is-pan-ready");
      hideContextAction();
      return;
    }

    const point = screenToWorld(hoverState.point);
    const halfHeight = interactionHalfHeight();
    const withinChromosome = point.x >= VIEW.x0 && point.x <= VIEW.x1;
    const nearFreeformPath =
      !freeformGeometry() ||
      (Boolean(point.pathId) && Number.isFinite(point.distance) && point.distance <= halfHeight);
    const withinEditingBand =
      withinChromosome &&
      Math.abs(point.y - VIEW.centerY) <= halfHeight &&
      nearFreeformPath;
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
    if (nonlinearGeometry()) {
      const firstPoint = geometryPoint(point.x, guideBounds.top);
      const secondPoint = geometryPoint(point.x, guideBounds.bottom);
      action.removeAttribute("transform");
      line.setAttribute("x1", precise(firstPoint.x));
      line.setAttribute("y1", precise(firstPoint.y));
      line.setAttribute("x2", precise(secondPoint.x));
      line.setAttribute("y2", precise(secondPoint.y));
    } else {
      action.setAttribute("transform", `translate(${fixed(point.x)} 0)`);
      line.setAttribute("x1", "0");
      line.setAttribute("y1", fixed(guideBounds.top));
      line.setAttribute("x2", "0");
      line.setAttribute("y2", fixed(guideBounds.bottom));
    }
    line.setAttribute("stroke", color);
    symbolGroup.setAttribute(
      "transform",
      fixedUiTransform(nonlinearGeometry() ? point.x : 0, symbolY)
    );
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
    const screenPoint = pointFromEvent(event);
    hoverState = {
      point: screenPoint,
      role: target?.dataset.role || null,
    };
    modifierState.shift = event.shiftKey;
    modifierState.special = event.ctrlKey || event.metaKey;
    if (freeformGeometry() && freeformEditor.tool !== "edit") {
      freeformEditor.hoverPoint = freeformArtworkPointFromScreen(screenPoint);
      const previousEndpoint = freeformEditor.hoverEndpoint;
      const nextEndpoint =
        freeformEditor.tool === "draw" && freeformEditor.hoverPoint
          ? nearestConnectableFreeformEndpoint(
              freeformEditor.hoverPoint,
              state,
              viewState
            )
          : null;
      const endpointChanged = !(
        (!previousEndpoint && !nextEndpoint) ||
        sameFreeformEndpoint(previousEndpoint, nextEndpoint)
      );
      freeformEditor.hoverEndpoint = nextEndpoint;
      elements.canvas.classList.remove("is-pan-ready");
      hideContextAction();
      const ring = elements.canvas.querySelector(".rs-freeform-eraser-ring");
      if (freeformEditor.tool === "erase" && freeformEditor.hoverPoint) {
        if (ring) {
          ring.setAttribute("cx", precise(freeformEditor.hoverPoint.x));
          ring.setAttribute("cy", precise(freeformEditor.hoverPoint.y));
          ring.setAttribute("visibility", "visible");
        } else {
          scheduleRender();
        }
      } else if (endpointChanged) {
        scheduleRender();
      }
      return;
    }
    refreshContextAction();
  }

  function clearPointerHover() {
    hoverState = null;
    const hadHoverEndpoint = Boolean(freeformEditor.hoverEndpoint);
    freeformEditor.hoverPoint = null;
    freeformEditor.hoverEndpoint = null;
    elements.canvas.classList.remove("is-pan-ready");
    const ring = elements.canvas.querySelector(".rs-freeform-eraser-ring");
    if (ring) ring.setAttribute("visibility", "hidden");
    hideContextAction();
    if (hadHoverEndpoint && freeformGeometry()) scheduleRender();
  }

  function setZoom(
    zoom,
    focus = { x: VIEW.width / 2, y: VIEW.centerY },
    { deferRender = false } = {}
  ) {
    const nextZoom = clamp(zoom, MIN_ZOOM, MAX_ZOOM);
    const artworkPoint = screenToArtworkPoint(focus);
    const aspectPoint = transformedArtworkPoint(artworkPoint.x, artworkPoint.y);
    viewState.panX =
      focus.x - VIEW.width / 2 - (aspectPoint.x - VIEW.width / 2) * nextZoom;
    viewState.panY =
      focus.y - VIEW.centerY - (aspectPoint.y - VIEW.centerY) * nextZoom;
    viewState.zoom = nextZoom;
    if (deferRender) scheduleRender();
    else render();
  }

  function fittedViewState(sourceState = state) {
    syncViewGeometry(sourceState);
    if (freeformGeometry(sourceState)) {
      const labelAllowance = sourceState.layers?.labels === false ? 18 : 58;
      const rulerAllowance = scaleBarEnabled(sourceState) ? 54 : 14;
      const molecularExtent =
        sourceState.daughterSpacing / 2 +
        doubleStrandHalfHeight(sourceState) +
        Math.max(sourceState.weight, sourceState.basePairWidth) +
        (contourEnabled(sourceState) ? contourThickness(sourceState) : 0) +
        labelAllowance +
        rulerAllowance;
      const bounds = freeformArtworkBounds(sourceState, molecularExtent);
      const corners = [
        transformedArtworkPoint(bounds.left, bounds.top, sourceState),
        transformedArtworkPoint(bounds.right, bounds.top, sourceState),
        transformedArtworkPoint(bounds.left, bounds.bottom, sourceState),
        transformedArtworkPoint(bounds.right, bounds.bottom, sourceState),
      ];
      const sourceLeft = Math.min(...corners.map((point) => point.x));
      const sourceRight = Math.max(...corners.map((point) => point.x));
      const sourceTop = Math.min(...corners.map((point) => point.y));
      const sourceBottom = Math.max(...corners.map((point) => point.y));
      const sourceWidth = Math.max(EPSILON, sourceRight - sourceLeft);
      const sourceHeight = Math.max(EPSILON, sourceBottom - sourceTop);
      // Leave room for the lower-left editing palette and its transient size
      // panel while keeping arbitrary pieces, labels and genomic rulers in view.
      const targetLeft = 44;
      const targetRight = BASE_VIEW.width - 44;
      const targetTop = 48;
      const targetBottom = BASE_VIEW.height - 72;
      const zoom = clamp(
        Math.min(
          1,
          (targetRight - targetLeft) / sourceWidth,
          (targetBottom - targetTop) / sourceHeight
        ),
        MIN_ZOOM,
        1
      );
      const sourceCenterX = (sourceLeft + sourceRight) / 2;
      const sourceCenterY = (sourceTop + sourceBottom) / 2;
      const targetCenterX = (targetLeft + targetRight) / 2;
      const targetCenterY = (targetTop + targetBottom) / 2;
      return {
        zoom,
        panX: targetCenterX - VIEW.width / 2 - (sourceCenterX - VIEW.width / 2) * zoom,
        panY: targetCenterY - VIEW.centerY - (sourceCenterY - VIEW.centerY) * zoom,
      };
    }
    if (circularGeometry(sourceState)) {
      const labelAllowance = sourceState.layers?.labels === false ? 20 : 72;
      const rulerAllowance = scaleBarEnabled(sourceState) ? 52 : 16;
      const radialExtent =
        circularRadius(sourceState) +
        renderedDaughterHalfSpacing(sourceState) +
        renderedDoubleStrandHalfHeight(sourceState) +
        Math.max(sourceState.weight, sourceState.basePairWidth) +
        (contourEnabled(sourceState) ? contourThickness(sourceState) : 0) +
        labelAllowance +
        rulerAllowance;
      const sourceWidth = Math.max(EPSILON, radialExtent * 2 * artworkAspectX(sourceState));
      const sourceHeight = Math.max(EPSILON, radialExtent * 2 * artworkAspectY(sourceState));
      const targetLeft = BASE_VIEW.x0;
      const targetRight = BASE_VIEW.x1;
      const targetTop = 44;
      const targetBottom = BASE_VIEW.height - 44;
      const zoom = clamp(
        Math.min(
          1,
          (targetRight - targetLeft) / sourceWidth,
          (targetBottom - targetTop) / sourceHeight
        ),
        MIN_ZOOM,
        1
      );
      const targetCenterX = (targetLeft + targetRight) / 2;
      const targetCenterY = (targetTop + targetBottom) / 2;
      return {
        zoom,
        panX: targetCenterX - VIEW.width / 2,
        panY: targetCenterY - VIEW.centerY,
      };
    }
    // Fit the transformed chromosome rather than only its unscaled genomic
    // coordinates. This restores cached templates with their aspect settings
    // intact while ensuring the complete artwork is visible on every launch.
    const leftPoint = transformedArtworkPoint(VIEW.x0, VIEW.centerY, sourceState);
    const rightPoint = transformedArtworkPoint(VIEW.x1, VIEW.centerY, sourceState);
    const sourceLeft = Math.min(leftPoint.x, rightPoint.x);
    const sourceRight = Math.max(leftPoint.x, rightPoint.x);
    const sourceWidth = Math.max(EPSILON, sourceRight - sourceLeft);
    const targetLeft = BASE_VIEW.x0;
    const targetRight = BASE_VIEW.x1;
    const targetWidth = targetRight - targetLeft;

    const verticalExtent =
      sourceState.daughterSpacing / 2 +
      doubleStrandHalfHeight(sourceState) +
      Math.max(sourceState.weight, sourceState.basePairWidth) +
      (contourEnabled(sourceState) ? contourThickness(sourceState) : 0) +
      32;
    const topPoint = transformedArtworkPoint(VIEW.width / 2, VIEW.centerY - verticalExtent, sourceState);
    const bottomPoint = transformedArtworkPoint(VIEW.width / 2, VIEW.centerY + verticalExtent, sourceState);
    const sourceTop = Math.min(topPoint.y, bottomPoint.y);
    const sourceBottom = Math.max(topPoint.y, bottomPoint.y);
    const sourceHeight = Math.max(EPSILON, sourceBottom - sourceTop);
    const targetTop = 52;
    const targetBottom = BASE_VIEW.height - 72;
    const targetHeight = targetBottom - targetTop;

    const zoom = clamp(
      Math.min(1, targetWidth / sourceWidth, targetHeight / sourceHeight),
      MIN_ZOOM,
      1
    );
    const sourceCenterX = (sourceLeft + sourceRight) / 2;
    const sourceCenterY = (sourceTop + sourceBottom) / 2;
    const targetCenterX = (targetLeft + targetRight) / 2;
    const targetCenterY = (targetTop + targetBottom) / 2;
    return {
      zoom,
      panX: targetCenterX - VIEW.width / 2 - (sourceCenterX - VIEW.width / 2) * zoom,
      panY: targetCenterY - VIEW.centerY - (sourceCenterY - VIEW.centerY) * zoom,
    };
  }

  function resetView() {
    const aspectChanged =
      Math.abs(artworkAspectX() - 1) >= EPSILON || Math.abs(artworkAspectY() - 1) >= EPSILON;
    if (aspectChanged) pushSnapshot();
    state.advanced.aspectX = 1;
    state.advanced.aspectY = 1;
    viewState = fittedViewState(state);
    syncControls();
    render();
    setStatus(lengthMode() === "extend" ? "Genome fitted to view" : "View and aspect reset");
  }

  function setArtworkAspectFromSlider(axis, sliderValue) {
    const key = aspectKey(axis);
    state.advanced[key] = aspectFactorFromSlider(axis, sliderValue);
    scheduleRender();
    setStatus(axis === "y" ? "Vertical aspect adjusted" : "Horizontal aspect adjusted");
  }

  function normalisedX(x) {
    return nonlinearGeometry()
      ? geometryFractionAtX(x)
      : clamp((x - VIEW.x0) / Math.max(EPSILON, VIEW.moleculeWidth), 0, 1);
  }

  function dragPeriodicComponent(activeDrag, sourceState = state) {
    if (circularGeometry(sourceState)) return { start: 0, end: 1, span: 1, id: null };
    if (!freeformGeometry(sourceState) || !activeDrag?.componentClosed) return null;
    const metric = freeformMetricById(activeDrag.componentId, sourceState);
    if (!metric?.closed) return null;
    return { start: metric.start, end: metric.end, span: metric.span, id: metric.id, metric };
  }

  function nearestPeriodicComponentPosition(position, reference, periodic) {
    const span = Math.max(EPSILON, periodic.span);
    const local = wrapFraction((Number(position) - periodic.start) / span);
    const canonical = periodic.start + local * span;
    const configuredReference = Number(reference);
    const anchor = Number.isFinite(configuredReference) ? configuredReference : canonical;
    return canonical + Math.round((anchor - canonical) / span) * span;
  }

  function unwrappedDragPointer(activeDrag, wrappedPosition, sourceState = state) {
    const periodic = dragPeriodicComponent(activeDrag, sourceState);
    if (!periodic || !activeDrag) return wrappedPosition;
    const wrappedLocal = wrapFraction((Number(wrappedPosition) - periodic.start) / periodic.span);
    if (!Number.isFinite(activeDrag.lastWrappedPointerPosition)) {
      activeDrag.lastWrappedPointerPosition = wrappedLocal;
      activeDrag.unwrappedPointerPosition = nearestPeriodicComponentPosition(
        periodic.start + wrappedLocal * periodic.span,
        activeDrag.startPointerPosition,
        periodic
      );
      return activeDrag.unwrappedPointerPosition;
    }
    const delta = signedCircularFractionDelta(activeDrag.lastWrappedPointerPosition, wrappedLocal);
    activeDrag.unwrappedPointerPosition =
      (Number(activeDrag.unwrappedPointerPosition) || periodic.start) + delta * periodic.span;
    activeDrag.lastWrappedPointerPosition = wrappedLocal;
    return activeDrag.unwrappedPointerPosition;
  }

  function forksShouldCollapse(side, desiredPosition, oppositePosition, sourceState = state) {
    const separation = Math.abs(desiredPosition - oppositePosition);
    const midpoint = (desiredPosition + oppositePosition) / 2;
    const localScale = geometryScreenTangentScale(
      circularGeometry(sourceState) ? wrapFraction(midpoint) : clamp(midpoint, 0, 1),
      sourceState
    );
    const screenDistance = separation * moleculeWidthForState(sourceState) * viewState.zoom * localScale;
    const crossedPartner = side === "left" ? desiredPosition >= oppositePosition : desiredPosition <= oppositePosition;
    return crossedPartner || screenDistance <= FORK_COLLAPSE_PX;
  }

  function addOrRepairCut(x, preferredPathId = null) {
    const rawPosition = normalisedX(x);
    const plan = cutRangesForGesture(rawPosition, rawPosition, state, preferredPathId);
    const position = plan.range.start;
    const existingIndex = cutIndexAtFraction(position, state, 24, plan.componentId);

    if (existingIndex >= 0) {
      pushSnapshot();
      state.cuts.splice(existingIndex, 1);
      setStatus("Break repaired");
    } else if (state.cuts.length < 10) {
      pushSnapshot();
      state.cuts = normaliseCutRegions([...state.cuts, ...plan.ranges]);
      setStatus(`Break added at ${genomicPositionAtFraction(wrapFraction(position))} bp`);
    } else {
      setStatus("Break limit reached");
    }
    render();
  }

  function commitCutRange(start, end, startSnapshot, preferredPathId = null) {
    const plan = cutRangesForGesture(start, end, state, preferredPathId);
    const range = plan.range;
    const nextCuts = normaliseCutRegions([...state.cuts, ...plan.ranges]);
    if (nextCuts.length > 10) {
      setStatus("Break limit reached");
      render();
      return;
    }

    pushSnapshot(startSnapshot);
    state.cuts = nextCuts;
    const startBp = genomicPositionAtFraction(wrapFraction(range.start));
    const endBp = genomicPositionAtFraction(wrapFraction(range.end));
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

  function periodicUnreplicateInteractionRange(start, end, sourceState = state) {
    let first = Number(start);
    let second = Number(end);
    if (!Number.isFinite(first)) first = 0;
    if (!Number.isFinite(second)) second = first;
    // Canonical pointer values on opposite sides of the seam represent the
    // nearby periodic arc. Gesture code may already provide an unwrapped value,
    // in which case its chosen branch is preserved exactly.
    if (
      first >= -EPSILON && first <= 1 + EPSILON &&
      second >= -EPSILON && second <= 1 + EPSILON
    ) {
      second = nearestEquivalentFraction(second, first);
    }
    if (Math.abs(second - first) > 1) {
      second = first + Math.sign(second - first) * 1;
    }
    if (snapEditingEnabled(sourceState)) {
      const snappedFirst = snapCircularEquivalent(first, sourceState);
      const snappedSecond = snapCircularEquivalent(second, sourceState);
      if (snappedFirst !== null) first = snappedFirst;
      if (snappedSecond !== null) second = snappedSecond;
    }

    let lower = Math.min(first, second);
    let upper = Math.max(first, second);
    const pairStep = basePairStepFraction(sourceState);
    const minimumSpan = snapEditingEnabled(sourceState)
      ? splitBubbleGapSteps(sourceState) * pairStep
      : splitBubbleClearancePx(sourceState) /
        Math.max(EPSILON, moleculeWidthForState(sourceState));
    if (upper - lower >= minimumSpan - EPSILON) {
      return { start: lower, end: Math.min(lower + 1, upper) };
    }

    const targetCenter = (lower + upper) / 2;
    if (snapEditingEnabled(sourceState)) {
      const gapSteps = splitBubbleGapSteps(sourceState);
      const halfSpan = (gapSteps * pairStep) / 2;
      const center = splitCompatibleCenterFraction(targetCenter, gapSteps, sourceState, {
        min: targetCenter - 1,
        max: targetCenter + 1,
      });
      if (center !== null) {
        return { start: center - halfSpan, end: center + halfSpan };
      }
    }
    return {
      start: targetCenter - minimumSpan / 2,
      end: targetCenter + minimumSpan / 2,
    };
  }

  function mergeUnwrappedIntervals(intervals) {
    const sorted = intervals
      .filter((interval) => interval.end - interval.start > EPSILON)
      .sort((first, second) => first.start - second.start);
    const merged = [];
    sorted.forEach((interval) => {
      const current = merged.at(-1);
      if (current && interval.start <= current.end + EPSILON) {
        current.end = Math.max(current.end, interval.end);
      } else {
        merged.push({ start: interval.start, end: interval.end });
      }
    });
    return merged;
  }

  function periodicRegionCopies(region, from, to) {
    const copies = [];
    const firstShift = Math.floor(from - region.end) - 1;
    const lastShift = Math.ceil(to - region.start) + 1;
    for (let shift = firstShift; shift <= lastShift; shift += 1) {
      const start = region.start + shift;
      const end = region.end + shift;
      if (end <= from + EPSILON || start >= to - EPSILON) continue;
      copies.push({ start, end, region });
    }
    return copies;
  }

  function circularUnreplicateRangePlan(start, end, sourceState, model) {
    const range = periodicUnreplicateInteractionRange(start, end, sourceState);
    const selectionStart = range.start;
    const selectionEnd = Math.min(selectionStart + 1, range.end);
    const selectionSpan = Math.max(0, selectionEnd - selectionStart);
    const affectedRegions = [];
    const affectedSet = new Set();
    const removedOriginIds = new Set();
    const removedIntervals = [];

    model.regions.forEach((region) => {
      periodicRegionCopies(region, selectionStart, selectionEnd).forEach((copy) => {
        const overlapStart = Math.max(copy.start, selectionStart);
        const overlapEnd = Math.min(copy.end, selectionEnd);
        if (overlapEnd - overlapStart <= EPSILON) return;
        removedIntervals.push({ start: overlapStart, end: overlapEnd });
        if (!affectedSet.has(region)) {
          affectedSet.add(region);
          affectedRegions.push(region);
        }
        (region.originIds || []).forEach((originId) => removedOriginIds.add(originId));
      });
    });

    const removedFraction = mergeUnwrappedIntervals(removedIntervals).reduce(
      (total, interval) => total + interval.end - interval.start,
      0
    );
    if (!removedOriginIds.size) {
      return {
        range: { start: selectionStart, end: selectionEnd },
        affectedRegions,
        removedOriginIds: [],
        removedFraction,
        remainingSegments: [],
      };
    }

    // Cut the circular representation inside the newly unreplicated arc. The
    // complement then becomes an ordinary unwrapped interval and can be rebuilt
    // by the same bubble representation used elsewhere in the application.
    const windowStart = selectionEnd;
    const windowEnd = windowStart + 1;
    const affectedIntervals = [];
    model.regions
      .filter((region) =>
        (region.originIds || []).some((originId) => removedOriginIds.has(originId))
      )
      .forEach((region) => {
        periodicRegionCopies(region, windowStart, windowEnd).forEach((copy) => {
          affectedIntervals.push({
            start: Math.max(windowStart, copy.start),
            end: Math.min(windowEnd, copy.end),
          });
        });
      });

    const removalStart = selectionStart + 1;
    const removalEnd = removalStart + selectionSpan;
    const remainingSegments = mergeUnwrappedIntervals(affectedIntervals)
      .flatMap((interval) => {
        if (removalEnd <= interval.start + EPSILON || removalStart >= interval.end - EPSILON) {
          return [interval];
        }
        const remaining = [];
        if (removalStart > interval.start + EPSILON) {
          remaining.push({ start: interval.start, end: Math.min(interval.end, removalStart) });
        }
        if (removalEnd < interval.end - EPSILON) {
          remaining.push({ start: Math.max(interval.start, removalEnd), end: interval.end });
        }
        return remaining;
      })
      .filter((segment) => segment.end - segment.start > EPSILON);

    return {
      range: { start: selectionStart, end: selectionEnd },
      affectedRegions,
      removedOriginIds: [...removedOriginIds],
      removedFraction,
      remainingSegments: mergeUnwrappedIntervals(remainingSegments),
    };
  }

  function unreplicateRangePlan(
    start,
    end,
    sourceState = state,
    preferredPathId = null
  ) {
    if (freeformGeometry(sourceState)) {
      const canonicalStart = clamp(Number(start) || 0, 0, 1);
      const metric = freeformMetricById(preferredPathId, sourceState)
        || freeformMetricAtFraction(canonicalStart, sourceState)
        || freeformMetricAtFraction(clamp(Number(end) || canonicalStart, 0, 1), sourceState);
      if (!metric) {
        return {
          range: cutRange({ start, end }),
          affectedRegions: [],
          removedOriginIds: [],
          removedFraction: 0,
          remainingSegments: [],
          componentId: null,
        };
      }
      const span = Math.max(EPSILON, metric.span);
      const localStart = (Number(start) - metric.start) / span;
      const localEnd = (Number(end) - metric.start) / span;
      const localState = freeformComponentState(metric, sourceState.forkTravel, sourceState);
      const localPlan = unreplicateRangePlan(localStart, localEnd, localState);
      const mapPosition = (position) => metric.start + position * span;
      return {
        ...localPlan,
        range: {
          start: mapPosition(localPlan.range.start),
          end: mapPosition(localPlan.range.end),
        },
        affectedRegions: localPlan.affectedRegions.map((region) => ({
          ...region,
          start: mapPosition(region.start),
          end: mapPosition(region.end),
          componentId: metric.id,
          componentStart: metric.start,
          componentEnd: metric.end,
          componentClosed: metric.closed,
        })),
        removedFraction: localPlan.removedFraction * span,
        remainingSegments: localPlan.remainingSegments.map((segment) => ({
          start: mapPosition(segment.start),
          end: mapPosition(segment.end),
          componentId: metric.id,
        })),
        componentId: metric.id,
        componentClosed: metric.closed,
      };
    }

    const model = getReplicationModelAtTravel(sourceState.forkTravel, sourceState);
    if (circularGeometry(sourceState)) {
      return circularUnreplicateRangePlan(start, end, sourceState, model);
    }

    const range = unreplicateInteractionRange(start, end, sourceState);
    const affectedRegions = model.regions.filter(
      (region) => Math.min(region.end, range.end) - Math.max(region.start, range.start) > EPSILON
    );
    const removedOriginIds = new Set();
    const removedFraction = affectedRegions.reduce(
      (total, region) =>
        total + Math.max(0, Math.min(region.end, range.end) - Math.max(region.start, range.start)),
      0
    );

    affectedRegions.forEach((region) => {
      region.originIds.forEach((originId) => removedOriginIds.add(originId));
    });

    const remainingSegments = model.regions
      .filter((region) =>
        region.originIds.some((originId) => removedOriginIds.has(originId))
      )
      .flatMap((region) => {
        const overlapStart = Math.max(region.start, range.start);
        const overlapEnd = Math.min(region.end, range.end);
        if (overlapEnd - overlapStart <= EPSILON) {
          return [{ start: region.start, end: region.end }];
        }
        const segments = [];
        if (range.start > region.start + EPSILON) {
          segments.push({ start: region.start, end: Math.min(region.end, range.start) });
        }
        if (range.end < region.end - EPSILON) {
          segments.push({ start: Math.max(region.start, range.end), end: region.end });
        }
        return segments;
      })
      .filter((segment) => segment.end - segment.start > EPSILON);

    return {
      range,
      affectedRegions,
      removedOriginIds: [...removedOriginIds],
      removedFraction,
      remainingSegments: mergeUnwrappedIntervals(remainingSegments),
    };
  }

  function applyUnreplicateRange(
    start,
    end,
    sourceState = state,
    preferredPathId = null
  ) {
    const plan = unreplicateRangePlan(start, end, sourceState, preferredPathId);
    if (!plan.affectedRegions.length) return { ...plan, changed: false, replacements: [] };

    const removedOriginIds = new Set(plan.removedOriginIds);
    sourceState.origins = sourceState.origins.filter(
      (origin) => !removedOriginIds.has(origin.id)
    );
    const replacements = plan.remainingSegments
      .map((segment) =>
        bubbleFromBounds(
          segment.start,
          segment.end,
          sourceState,
          segment.componentId || plan.componentId || preferredPathId
        )
      )
      .filter(Boolean);
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

  function unreplicateRange(start, end, sourceState = state, preferredPathId = null) {
    return applyUnreplicateRange(start, end, sourceState, preferredPathId);
  }

  function commitUnreplicateRange(
    start,
    end,
    startSnapshot,
    preferredPathId = null
  ) {
    const plan = unreplicateRangePlan(start, end, state, preferredPathId);
    if (!plan.affectedRegions.length) {
      render();
      setStatus("No replicated DNA lies within that region");
      return false;
    }

    pushSnapshot(startSnapshot);
    stopAnimation();
    const result = applyUnreplicateRange(start, end, state, preferredPathId);
    syncControls();
    render();
    const startBp = genomicPositionAtFraction(wrapFraction(result.range.start));
    const endBp = genomicPositionAtFraction(wrapFraction(result.range.end));
    setStatus(`DNA returned to unreplicated from ${startBp}–${endBp} bp`);
    return true;
  }

  function addOrigin(x, preferredPathId = null) {
    const rawPosition = normalisedX(x);
    let position = interactionFraction(rawPosition);
    let metric = null;
    if (freeformGeometry()) {
      metric = freeformMetricAtFraction(rawPosition, state, preferredPathId);
      if (!metric) {
        setStatus("Paint a DNA path before adding an origin");
        return;
      }
      const localState = freeformComponentState(metric, state.forkTravel, state);
      const local = freeformFractionToLocal(rawPosition, metric, state);
      const snappedLocal = snapEditingEnabled(state)
        ? metric.closed
          ? snapCircularEquivalent(local, localState)
          : snapFractionToBasePair(local, localState)
        : local;
      if (snappedLocal === null) return;
      position = metric.start + (metric.closed ? wrapFraction(snappedLocal) : clamp(snappedLocal, 0, 1)) * metric.span;
    }
    if (position === null) return;
    const nearby = state.origins.find((origin) => {
      if (metric && origin.moleculeId !== metric.id) return false;
      let distance;
      if (metric?.closed) {
        const first = freeformFractionToLocal(origin.position, metric, state);
        const second = freeformFractionToLocal(position, metric, state);
        distance = Math.abs(signedCircularFractionDelta(first, second)) * metric.span;
      } else {
        distance = circularGeometry()
          ? Math.abs(signedCircularFractionDelta(origin.position, position))
          : Math.abs(origin.position - position);
      }
      return distance * VIEW.moleculeWidth < 28;
    });
    if (nearby) {
      state.selectedFork = null;
      state.selectedOriginId = nearby.id;
      render();
      setStatus("Origin selected");
      return;
    }
    if (
      getReplicationModel().regions.some(
        (region) =>
          position > region.start &&
          position < region.end &&
          (!metric || region.componentId === metric.id)
      )
    ) {
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
      ...(metric
        ? {
            moleculeId: metric.id,
            localPosition: freeformFractionToLocal(position, metric, state),
          }
        : {}),
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

  function bubbleFromBounds(start, end, sourceState = state, preferredPathId = null) {
    if (freeformGeometry(sourceState)) {
      const midpoint = (Number(start) + Number(end)) / 2;
      const metric = freeformMetricAtFraction(clamp(midpoint, 0, 1), sourceState, preferredPathId)
        || freeformMetricById(preferredPathId, sourceState);
      if (!metric) return null;
      const span = Math.max(EPSILON, metric.span);
      const localState = freeformComponentState(metric, sourceState.forkTravel, sourceState);
      let lower = (Math.min(start, end) - metric.start) / span;
      let upper = (Math.max(start, end) - metric.start) / span;
      if (metric.closed) {
        upper = Math.min(lower + 1, upper);
      } else {
        lower = clamp(lower, 0, 1);
        upper = clamp(upper, 0, 1);
      }
      const localMidpoint = (lower + upper) / 2;
      let localCenter = localMidpoint;
      if (snapEditingEnabled(sourceState)) {
        const snapped = metric.closed
          ? snapCircularEquivalent(localMidpoint, localState)
          : snapFractionToBasePair(localMidpoint, localState, { min: lower, max: upper });
        if (snapped !== null) localCenter = snapped;
      }
      const canonicalLocal = metric.closed ? wrapFraction(localCenter) : clamp(localCenter, 0, 1);
      const globalCenter = metric.start + canonicalLocal * span;
      return {
        id: nextAvailableOriginId(sourceState),
        position: globalCenter,
        startPosition: globalCenter,
        leftOffset: (localCenter - lower) * span - sourceState.forkTravel,
        rightOffset: (upper - localCenter) * span - sourceState.forkTravel,
        moleculeId: metric.id,
        localPosition: canonicalLocal,
      };
    }

    const circular = circularGeometry(sourceState);
    const lower = circular ? Math.min(start, end) : clamp(Math.min(start, end), 0, 1);
    const upper = circular
      ? Math.min(lower + 1, Math.max(start, end))
      : clamp(Math.max(start, end), 0, 1);
    const midpoint = (lower + upper) / 2;
    const snappedCenter = snapEditingEnabled(sourceState)
      ? circular
        ? snapCircularEquivalent(midpoint, sourceState)
        : snapFractionToBasePair(midpoint, sourceState, { min: lower, max: upper })
      : null;
    const centerUnwrapped = snappedCenter === null ? midpoint : snappedCenter;
    const center = circular ? wrapFraction(centerUnwrapped) : centerUnwrapped;
    return {
      id: nextAvailableOriginId(sourceState),
      position: center,
      startPosition: center,
      leftOffset: centerUnwrapped - lower - sourceState.forkTravel,
      rightOffset: upper - centerUnwrapped - sourceState.forkTravel,
    };
  }

  function rawBubbleBounds(origin, sourceState = state) {
    const leftTravel = Math.max(0, sourceState.forkTravel + origin.leftOffset);
    const rightTravel = Math.max(0, sourceState.forkTravel + origin.rightOffset);
    if (freeformGeometry(sourceState)) {
      const component = freeformComponentBoundsForOrigin(origin, sourceState);
      const center = origin.startPosition;
      if (component.closed) {
        return {
          start: center - leftTravel,
          end: center + rightTravel,
          moleculeId: component.id,
          componentStart: component.start,
          componentEnd: component.end,
          period: component.metric.span,
          closed: true,
        };
      }
      return {
        start: Math.max(component.start, center - leftTravel),
        end: Math.min(component.end, center + rightTravel),
        moleculeId: component.id,
        componentStart: component.start,
        componentEnd: component.end,
        period: component.metric?.span || component.end - component.start,
        closed: false,
      };
    }
    if (circularGeometry(sourceState)) {
      const center = wrapFraction(origin.startPosition);
      return {
        start: center - leftTravel,
        end: center + rightTravel,
        period: 1,
        closed: true,
      };
    }
    return {
      start: Math.max(0, origin.startPosition - leftTravel),
      end: Math.min(1, origin.startPosition + rightTravel),
      period: 1,
      closed: false,
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
        if (freeformGeometry(sourceState) && interval.moleculeId !== seed.moleculeId) return;
        let candidate = interval;
        const periodic = Boolean(seed.closed);
        if (periodic) {
          const period = Math.max(EPSILON, seed.period || 1);
          const clusterCenter = (start + end) / 2;
          const intervalCenter = (interval.start + interval.end) / 2;
          const baseShift = Math.round((clusterCenter - intervalCenter) / period);
          candidate = null;
          for (const turn of [baseShift, baseShift - 1, baseShift + 1]) {
            const shifted = {
              ...interval,
              start: interval.start + turn * period,
              end: interval.end + turn * period,
            };
            if (
              shifted.start <= end + overlapTolerance &&
              shifted.end >= start - overlapTolerance
            ) {
              candidate = shifted;
              break;
            }
          }
          if (!candidate) return;
        } else if (
          interval.start > end + overlapTolerance ||
          interval.end < start - overlapTolerance
        ) {
          return;
        }
        originIds.add(interval.id);
        start = Math.min(start, candidate.start);
        end = Math.max(end, candidate.end);
        expanded = true;
      });
    }

    return {
      start,
      end,
      originIds: [...originIds],
      moleculeId: seed.moleculeId || null,
      period: seed.period || 1,
      closed: Boolean(seed.closed),
    };
  }

  function mergeOverlappingBubbleState(
    originId,
    sourceState = state,
    contactTolerance = RAW_BUBBLE_MERGE_EPSILON
  ) {
    const cluster = overlappingBubbleCluster(originId, sourceState, contactTolerance);
    if (!cluster || cluster.originIds.length < 2) return null;

    const mergedIds = new Set(cluster.originIds);
    const merged = bubbleFromBounds(cluster.start, cluster.end, sourceState, cluster.moleculeId);
    if (!merged) return null;
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
    const component = freeformGeometry(sourceState)
      ? freeformComponentBoundsForOrigin(mergedOrigin, sourceState)
      : null;
    const periodic = circularGeometry(sourceState) || Boolean(component?.closed);
    activeDrag.minimumTranslation = periodic
      ? -Infinity
      : (component?.start ?? 0) - bounds.start;
    activeDrag.maximumTranslation = periodic
      ? Infinity
      : (component?.end ?? 1) - bounds.end;
    activeDrag.componentId = component?.id || activeDrag.componentId || null;
    activeDrag.componentClosed = Boolean(component?.closed);
    activeDrag.lastWrappedPointerPosition = periodic
      ? wrapFraction((pointerPosition - (component?.start || 0)) / (component?.metric?.span || 1))
      : wrapFraction(pointerPosition);
    activeDrag.unwrappedPointerPosition = pointerPosition;
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

    const component = freeformGeometry(sourceState)
      ? freeformComponentBoundsForOrigin(origin, sourceState)
      : null;
    const circular = circularGeometry(sourceState);
    const periodic = circular || Boolean(component?.closed);
    const desiredTranslation = pointerPosition - activeDrag.startPointerPosition;
    const continuousTranslation = periodic
      ? desiredTranslation
      : clamp(desiredTranslation, activeDrag.minimumTranslation, activeDrag.maximumTranslation);
    const minimumPosition = activeDrag.originStartPosition + activeDrag.minimumTranslation;
    const maximumPosition = activeDrag.originStartPosition + activeDrag.maximumTranslation;
    const continuousPosition = activeDrag.originStartPosition + continuousTranslation;
    let resolvedPosition = continuousPosition;

    if (snapEditingEnabled(sourceState)) {
      if (component) {
        const localState = freeformComponentState(component.metric, sourceState.forkTravel, sourceState);
        const localContinuous = freeformDragValueToLocal(continuousPosition, component.metric);
        let snappedLocal;
        if (component.closed) {
          snappedLocal = snapCircularEquivalent(localContinuous, localState);
        } else {
          snappedLocal = snapFractionToBasePair(localContinuous, localState, {
            min: freeformDragValueToLocal(minimumPosition, component.metric),
            max: freeformDragValueToLocal(maximumPosition, component.metric),
          });
        }
        if (snappedLocal === null) return null;
        resolvedPosition = component.start + snappedLocal * component.metric.span;
      } else if (circular) {
        const snapped = snapCircularEquivalent(continuousPosition, sourceState);
        if (snapped === null) return null;
        resolvedPosition = snapped;
      } else {
        const snapped = snapFractionToBasePair(continuousPosition, sourceState, {
          min: minimumPosition,
          max: maximumPosition,
        });
        if (snapped === null) return null;
        resolvedPosition = snapped;
      }
    }

    if (component?.closed) {
      const local = wrapFraction((resolvedPosition - component.start) / component.metric.span);
      origin.localPosition = local;
      origin.moleculeId = component.id;
      origin.startPosition = component.start + local * component.metric.span;
    } else if (circular) {
      origin.startPosition = wrapFraction(resolvedPosition);
    } else {
      const lower = component?.start ?? 0;
      const upper = component?.end ?? 1;
      origin.startPosition = clamp(resolvedPosition, lower, upper);
    }
    origin.position = origin.startPosition;
    origin.leftOffset = activeDrag.originLeftOffset;
    origin.rightOffset = activeDrag.originRightOffset;
    if (component && !component.closed) {
      origin.moleculeId = component.id;
      origin.localPosition = freeformFractionToLocal(origin.startPosition, component.metric, sourceState);
    }

    const consumed = component?.closed
      ? null
      : mergeOverlappingBubbleDuringDrag(activeDrag, pointerPosition, sourceState);
    synchroniseOriginPositions(sourceState);
    return {
      origin: consumed?.merged || origin,
      translation: resolvedPosition - activeDrag.originStartPosition,
      consumed,
    };
  }

  function terminalClosureForFork(geometry, side, sourceState = state) {
    if (circularGeometry(sourceState) || geometry?.componentClosed) return null;
    if (!geometry || !["left", "right"].includes(side)) return null;
    const closesIntoLeftEnd =
      side === "right" && geometry.rightActive && !geometry.leftActive && geometry.leftReason === "end";
    if (closesIntoLeftEnd) return { replicatedBoundary: 0, completionBoundary: 0 };

    const closesIntoRightEnd =
      side === "left" && geometry.leftActive && !geometry.rightActive && geometry.rightReason === "end";
    if (closesIntoRightEnd) return { replicatedBoundary: 1, completionBoundary: 1 };
    return null;
  }

  function terminalClosureBoundaryForFork(geometry, side, sourceState = state) {
    return terminalClosureForFork(geometry, side, sourceState)?.completionBoundary ?? null;
  }

  function forkReachedChromosomeEnd(desiredPosition, completionBoundary, sourceState = state) {
    if (circularGeometry(sourceState)) return false;
    const midpoint = clamp((Number(desiredPosition) + Number(completionBoundary)) / 2, 0, 1);
    const screenDistance =
      Math.abs(desiredPosition - completionBoundary) *
      moleculeWidthForState(sourceState) *
      viewState.zoom *
      geometryScreenTangentScale(midpoint, sourceState);
    const crossedBoundary = completionBoundary <= EPSILON
      ? desiredPosition <= completionBoundary
      : desiredPosition >= completionBoundary;
    return crossedBoundary || screenDistance <= FORK_COLLAPSE_PX;
  }

  function manualForkMergeTolerance(sourceState = state) {
    if (strandModel(sourceState) !== "minimal") return RAW_BUBBLE_MERGE_EPSILON;
    const representativeAspect = nonlinearGeometry(sourceState)
      ? Math.min(artworkAspectX(sourceState), artworkAspectY(sourceState))
      : artworkScaleX(sourceState);
    const renderedWidth =
      Math.max(EPSILON, moleculeWidthForState(sourceState)) *
      Math.max(EPSILON, viewState.zoom) *
      Math.max(EPSILON, representativeAspect);
    return Math.max(RAW_BUBBLE_MERGE_EPSILON, FORK_COLLAPSE_PX / renderedWidth);
  }

  function snapCircularEquivalent(position, sourceState = state) {
    if (!snapEditingEnabled(sourceState)) return position;
    const configured = Number(position);
    if (!Number.isFinite(configured)) return null;
    const lattice = basePairLattice(sourceState);
    // Snap on the unwrapped periodic lattice itself. Wrapping before rounding
    // creates two competing seam candidates (0 and 1), which can make a fork
    // jump to 0 nt while the pointer crosses the periodic boundary.
    const index = Math.round(configured * lattice.subdivisionCount - lattice.edgeOffset);
    return (lattice.edgeOffset + index) / lattice.subdivisionCount;
  }

  function snapCircularForkDragPosition(position, sourceState = state) {
    if (!snapEditingEnabled(sourceState)) return position;
    const configured = Number(position);
    if (!Number.isFinite(configured)) return null;
    const lattice = basePairLattice(sourceState);
    const latticePosition = configured * lattice.subdivisionCount - lattice.edgeOffset;
    const lowerIndex = Math.floor(latticePosition);
    const progress = latticePosition - lowerIndex;
    // Fork handles use a continuous magnetic lattice instead of a discontinuous
    // round(). This still attracts them to base-pair sites, but genomic zero is
    // no longer a sticky special case and crossing the periodic seam is smooth.
    const attraction = 0.88;
    const easedProgress = progress - (attraction * Math.sin(progress * Math.PI * 2)) / (Math.PI * 2);
    return (lattice.edgeOffset + lowerIndex + easedProgress) / lattice.subdivisionCount;
  }

  function circularForkGapPixels(first, second, sourceState = state) {
    const midpoint = wrapFraction((first + second) / 2);
    return (
      Math.abs(second - first) *
      moleculeWidthForState(sourceState) *
      Math.max(EPSILON, viewState.zoom) *
      circularScreenTangentScale(midpoint, sourceState)
    );
  }

  function dormantOriginAtCurrentTime(origin, sourceState = state) {
    if (!origin) return false;
    return (
      rawForkTravelAt(sourceState.forkTravel, origin.leftOffset) <= EPSILON &&
      rawForkTravelAt(sourceState.forkTravel, origin.rightOffset) <= EPSILON
    );
  }

  function absorbDormantOriginsDuringForkDrag(
    activeDrag,
    movingPosition,
    sourceState = state
  ) {
    if (activeDrag?.role !== "fork" || !Number.isFinite(Number(movingPosition))) return 0;
    const periodic = dragPeriodicComponent(activeDrag, sourceState);
    const start = periodic
      ? activeDrag.side === "left"
        ? activeDrag.leftUnwrapped
        : activeDrag.rightUnwrapped
      : activeDrag.side === "left"
        ? activeDrag.leftPosition
        : activeDrag.rightPosition;
    if (!Number.isFinite(Number(start))) return 0;

    const lower = Math.min(Number(start), Number(movingPosition)) - EPSILON;
    const upper = Math.max(Number(start), Number(movingPosition)) + EPSILON;
    const midpoint = (lower + upper) / 2;
    const absorbedIds = new Set();
    sourceState.origins.forEach((candidate) => {
      if (candidate.id === activeDrag.originId || !dormantOriginAtCurrentTime(candidate, sourceState)) {
        return;
      }
      if (freeformGeometry(sourceState)) {
        const candidateMetric = freeformMetricById(candidate.moleculeId, sourceState)
          || freeformMetricAtFraction(candidate.startPosition, sourceState);
        if (candidateMetric?.id !== activeDrag.componentId) return;
      }
      const candidatePosition = periodic
        ? nearestPeriodicComponentPosition(candidate.startPosition, midpoint, periodic)
        : candidate.startPosition;
      if (candidatePosition >= lower && candidatePosition <= upper) absorbedIds.add(candidate.id);
    });
    if (!absorbedIds.size) return 0;

    sourceState.origins = sourceState.origins.filter((origin) => !absorbedIds.has(origin.id));
    if (absorbedIds.has(sourceState.selectedOriginId)) sourceState.selectedOriginId = null;
    if (absorbedIds.has(sourceState.selectedFork?.originId)) sourceState.selectedFork = null;
    return absorbedIds.size;
  }

  function applyCircularForkDragPosition(
    activeDrag,
    pointerPosition,
    sourceState = state,
    replicationModel = getReplicationModelAtTravel(sourceState.forkTravel, sourceState)
  ) {
    const origin = sourceState.origins.find((item) => item.id === activeDrag.originId);
    const geometry = replicationModel.origins.find((item) => item.id === activeDrag.originId);
    if (!origin || !geometry) return null;

    const globalTravel = sourceState.forkTravel;
    // Keep the unwrapped branch chosen at pointer-down fixed for the entire
    // gesture. Re-deriving it from the moving origin can switch turns at the
    // genomic seam, making the untouched fork appear to retreat.
    const centerReference = Number.isFinite(activeDrag.originStartUnwrapped)
      ? activeDrag.originStartUnwrapped
      : origin.startPosition;
    const center = Number.isFinite(activeDrag.originStartUnwrapped)
      ? activeDrag.originStartUnwrapped
      : nearestEquivalentFraction(origin.startPosition, centerReference);
    let leftBoundary = Number.isFinite(activeDrag.leftUnwrapped)
      ? activeDrag.leftUnwrapped
      : nearestEquivalentFraction(geometry.leftPosition, center);
    let rightBoundary = Number.isFinite(activeDrag.rightUnwrapped)
      ? activeDrag.rightUnwrapped
      : nearestEquivalentFraction(geometry.rightPosition, center);
    while (leftBoundary > center + EPSILON) leftBoundary -= 1;
    while (rightBoundary < center - EPSILON) rightBoundary += 1;
    if (rightBoundary - leftBoundary > 1) rightBoundary = leftBoundary + 1;

    let desired = Number(pointerPosition);
    if (!Number.isFinite(desired)) desired = activeDrag.side === "left" ? leftBoundary : rightBoundary;
    let movingPosition = desired;
    let collapsePending = false;
    let fullCircle = false;

    if (activeDrag.mirroredForks && activeDrag.pairedForks) {
      const rawHalfWidth = activeDrag.side === "left" ? center - desired : desired - center;
      let halfWidth = clamp(rawHalfWidth, 0, 0.5);
      if (snapEditingEnabled(sourceState) && halfWidth > EPSILON) {
        const snappedSide = snapCircularForkDragPosition(
          activeDrag.side === "left" ? center - halfWidth : center + halfWidth,
          sourceState
        );
        if (snappedSide === null) return null;
        halfWidth = clamp(Math.abs(snappedSide - center), 0, 0.5);
      }
      const gapPixels = circularForkGapPixels(center - halfWidth, center + halfWidth, sourceState);
      collapsePending = rawHalfWidth <= 0 || gapPixels <= FORK_COLLAPSE_PX;
      if (collapsePending) halfWidth = 0;
      fullCircle = halfWidth >= 0.5 - EPSILON;
      const leftPosition = center - halfWidth;
      const rightPosition = center + halfWidth;
      origin.startPosition = wrapFraction(center);
      origin.position = origin.startPosition;
      origin.leftOffset = halfWidth - globalTravel;
      origin.rightOffset = halfWidth - globalTravel;
      movingPosition = activeDrag.side === "left" ? leftPosition : rightPosition;
    } else if (activeDrag.pairedForks) {
      const opposite = activeDrag.side === "left" ? rightBoundary : leftBoundary;
      const minimum = activeDrag.side === "left" ? opposite - 1 : opposite;
      const maximum = activeDrag.side === "left" ? opposite : opposite + 1;
      movingPosition = clamp(desired, minimum, maximum);
      const snappedMoving = snapCircularForkDragPosition(movingPosition, sourceState);
      if (snappedMoving === null) return null;
      movingPosition = clamp(snappedMoving, minimum, maximum);

      let leftPosition = activeDrag.side === "left" ? movingPosition : opposite;
      let rightPosition = activeDrag.side === "right" ? movingPosition : opposite;
      if (rightPosition < leftPosition) [leftPosition, rightPosition] = [rightPosition, leftPosition];
      let span = rightPosition - leftPosition;
      collapsePending = span <= EPSILON || circularForkGapPixels(leftPosition, rightPosition, sourceState) <= FORK_COLLAPSE_PX;
      if (collapsePending) {
        movingPosition = opposite;
        leftPosition = opposite;
        rightPosition = opposite;
        span = 0;
      }
      if (span >= 1 - EPSILON) {
        fullCircle = true;
        if (activeDrag.side === "left") leftPosition = rightPosition - 1;
        else rightPosition = leftPosition + 1;
        span = 1;
        collapsePending = false;
      }

      // The dragged fork is already snapped when requested. Do not snap the
      // derived origin centre a second time: doing so can alter both offsets
      // and make the stationary fork move by one lattice interval.
      const originCenter = (leftPosition + rightPosition) / 2;
      origin.startPosition = wrapFraction(originCenter);
      origin.position = origin.startPosition;
      origin.leftOffset = originCenter - leftPosition - globalTravel;
      origin.rightOffset = rightPosition - originCenter - globalTravel;
    } else {
      const ownCenter = nearestEquivalentFraction(origin.startPosition, center);
      if (activeDrag.side === "left" && geometry.leftActive) {
        const lower = rightBoundary - 1;
        movingPosition = clamp(desired, lower, ownCenter);
        const snapped = snapCircularForkDragPosition(movingPosition, sourceState);
        if (snapped === null) return null;
        movingPosition = clamp(snapped, lower, ownCenter);
        origin.leftOffset = ownCenter - movingPosition - globalTravel;
      } else if (activeDrag.side === "right" && geometry.rightActive) {
        const upper = leftBoundary + 1;
        movingPosition = clamp(desired, ownCenter, upper);
        const snapped = snapCircularForkDragPosition(movingPosition, sourceState);
        if (snapped === null) return null;
        movingPosition = clamp(snapped, ownCenter, upper);
        origin.rightOffset = movingPosition - ownCenter - globalTravel;
      } else {
        return null;
      }
    }

    activeDrag.collapsePending = collapsePending;
    sourceState.selectedOriginId = null;
    sourceState.selectedFork = { originId: origin.id, side: activeDrag.side };
    const absorbedOriginCount = absorbDormantOriginsDuringForkDrag(
      activeDrag,
      movingPosition,
      sourceState
    );
    synchroniseOriginPositions(sourceState);
    return {
      origin,
      geometry,
      movingPosition: wrapFraction(movingPosition),
      movingPositionUnwrapped: movingPosition,
      collapsePending,
      mirrored: Boolean(activeDrag.mirroredForks && activeDrag.pairedForks),
      terminalClosure: false,
      openedTerminal: false,
      fullCircle,
      absorbedOriginCount,
    };
  }

  function freeformDragValueToLocal(value, metric) {
    const configured = Number(value);
    return Number.isFinite(configured)
      ? (configured - metric.start) / Math.max(EPSILON, metric.span)
      : configured;
  }

  function freeformDragStateToLocal(activeDrag, metric) {
    const local = { ...activeDrag, componentClosed: metric.closed, componentId: metric.id };
    [
      "startPointerPosition",
      "originStartPosition",
      "originStartUnwrapped",
      "leftPosition",
      "rightPosition",
      "leftUnwrapped",
      "rightUnwrapped",
      "terminalClosureBoundary",
      "terminalReplicatedBoundary",
      "unwrappedPointerPosition",
    ].forEach((key) => {
      const supplied = activeDrag[key];
      if (supplied !== null && supplied !== undefined && Number.isFinite(Number(supplied))) {
        local[key] = freeformDragValueToLocal(supplied, metric);
      }
    });
    if (Number.isFinite(Number(activeDrag.minimumTranslation))) {
      local.minimumTranslation = activeDrag.minimumTranslation / metric.span;
    }
    if (Number.isFinite(Number(activeDrag.maximumTranslation))) {
      local.maximumTranslation = activeDrag.maximumTranslation / metric.span;
    }
    return local;
  }

  function synchroniseFreeformComponentFromLocal(metric, localState, sourceState = state) {
    const remainingIds = new Set(localState.origins.map((origin) => origin.id));
    const existingById = new Map(sourceState.origins.map((origin) => [origin.id, origin]));
    const otherOrigins = sourceState.origins.filter((origin) => {
      const originMetric = freeformMetricById(origin.moleculeId, sourceState)
        || freeformMetricAtFraction(origin.startPosition, sourceState);
      return originMetric?.id !== metric.id;
    });
    const mappedOrigins = localState.origins.map((localOrigin) => {
      const existing = existingById.get(localOrigin.id) || localOrigin;
      const localPosition = metric.closed
        ? wrapFraction(localOrigin.startPosition)
        : clamp(localOrigin.startPosition, 0, 1);
      const globalPosition = metric.start + localPosition * metric.span;
      return {
        ...existing,
        id: localOrigin.id,
        position: globalPosition,
        startPosition: globalPosition,
        leftOffset: localOrigin.leftOffset * metric.span,
        rightOffset: localOrigin.rightOffset * metric.span,
        moleculeId: metric.id,
        localPosition,
      };
    });
    sourceState.origins = [...otherOrigins, ...mappedOrigins].sort(
      (first, second) => first.startPosition - second.startPosition
    );
    if (sourceState.selectedOriginId && !sourceState.origins.some((origin) => origin.id === sourceState.selectedOriginId)) {
      sourceState.selectedOriginId = null;
    }
    if (sourceState.selectedFork && !sourceState.origins.some((origin) => origin.id === sourceState.selectedFork.originId)) {
      sourceState.selectedFork = null;
    }
    return remainingIds;
  }

  function applyFreeformForkDragPosition(activeDrag, pointerPosition, sourceState = state) {
    const origin = sourceState.origins.find((item) => item.id === activeDrag.originId);
    const metric = freeformMetricById(activeDrag.componentId || origin?.moleculeId, sourceState)
      || freeformMetricAtFraction(origin?.startPosition, sourceState);
    if (!origin || !metric) return null;

    const localState = freeformComponentState(metric, sourceState.forkTravel, sourceState);
    const localDrag = freeformDragStateToLocal(activeDrag, metric);
    const localPointer = freeformDragValueToLocal(pointerPosition, metric);
    const localModel = metric.closed
      ? getCircularReplicationModelAtTravel(localState.forkTravel, localState)
      : getLinearReplicationModelAtTravel(localState.forkTravel, localState);
    const result = metric.closed
      ? applyCircularForkDragPosition(localDrag, localPointer, localState, localModel)
      : applyForkDragPosition(localDrag, localPointer, localState);
    if (!result) return null;

    synchroniseFreeformComponentFromLocal(metric, localState, sourceState);
    sourceState.selectedOriginId = localState.selectedOriginId;
    sourceState.selectedFork = localState.selectedFork ? { ...localState.selectedFork } : null;
    activeDrag.collapsePending = localDrag.collapsePending;
    activeDrag.openedTerminal = localDrag.openedTerminal;
    const movingLocal = Number.isFinite(Number(result.movingPositionUnwrapped))
      ? result.movingPositionUnwrapped
      : result.movingPosition;
    const movingPositionUnwrapped = metric.start + movingLocal * metric.span;
    const movingPosition = metric.closed
      ? metric.start + wrapFraction(movingLocal) * metric.span
      : clamp(movingPositionUnwrapped, metric.start, metric.end);
    synchroniseOriginPositions(sourceState);
    const globalModel = getFreeformReplicationModelAtTravel(sourceState.forkTravel, sourceState);
    const globalOrigin = sourceState.origins.find((item) => item.id === activeDrag.originId) || null;
    const globalGeometry = globalModel.origins.find((item) => item.id === activeDrag.originId) || null;
    return {
      ...result,
      origin: globalOrigin,
      geometry: globalGeometry,
      movingPosition,
      movingPositionUnwrapped,
      collapsePending: Boolean(result.collapsePending),
      absorbedOriginCount: result.absorbedOriginCount || 0,
    };
  }

  function applyForkDragPosition(activeDrag, pointerPosition, sourceState = state) {
    if (activeDrag?.role !== "fork" || !["left", "right"].includes(activeDrag.side)) return null;
    if (freeformGeometry(sourceState)) {
      return applyFreeformForkDragPosition(activeDrag, pointerPosition, sourceState);
    }
    const origin = sourceState.origins.find((item) => item.id === activeDrag.originId);
    const replicationModel = getReplicationModelAtTravel(sourceState.forkTravel, sourceState);
    const geometry = replicationModel.origins.find((item) => item.id === activeDrag.originId);
    if (!origin || !geometry) return null;

    if (circularGeometry(sourceState)) {
      return applyCircularForkDragPosition(
        activeDrag,
        pointerPosition,
        sourceState,
        replicationModel
      );
    }

    const desiredPosition = clamp(Number(pointerPosition) || 0, 0, 1);
    const globalTravel = sourceState.forkTravel;
    const detectedTerminalClosure = terminalClosureForFork(geometry, activeDrag.side, sourceState);
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
      if (!collapsePending) {
        const endOvershoot = minimalManualEndOvershootFraction(sourceState);
        if (leftPosition <= EPSILON) origin.leftOffset += endOvershoot;
        if (rightPosition >= 1 - EPSILON) origin.rightOffset += endOvershoot;
      }
      movingPosition = activeDrag.side === "left" ? leftPosition : rightPosition;
    } else if (Number.isFinite(completionBoundary) && Number.isFinite(replicatedBoundary)) {
      collapsePending = forkReachedChromosomeEnd(desiredPosition, completionBoundary, sourceState);
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
      const ownEndBoundary = activeDrag.side === "left" ? 0 : 1;
      const reachedOwnEnd = forkReachedChromosomeEnd(desiredPosition, ownEndBoundary, sourceState);
      collapsePending = !reachedOwnEnd && forksShouldCollapse(
        activeDrag.side,
        desiredPosition,
        oppositePosition
      );
      if (reachedOwnEnd) {
        movingPosition = ownEndBoundary;
      } else if (collapsePending) {
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
      // As in circular geometry, a one-sided fork drag keeps the untouched
      // boundary fixed and derives the bubble control from the two boundaries.
      // Snapping that midpoint again would move the stationary fork.
      const center = (leftPosition + rightPosition) / 2;
      const halfWidth = (rightPosition - leftPosition) / 2;
      origin.startPosition = center;
      origin.position = center;
      origin.leftOffset = halfWidth - globalTravel;
      origin.rightOffset = halfWidth - globalTravel;
      if (reachedOwnEnd && !collapsePending) {
        const endOvershoot = minimalManualEndOvershootFraction(sourceState);
        if (activeDrag.side === "left") origin.leftOffset += endOvershoot;
        else origin.rightOffset += endOvershoot;
        activeDrag.manualEndClosure = true;
      }
    } else if (activeDrag.side === "left" && geometry.leftActive) {
      const reachedEnd = forkReachedChromosomeEnd(desiredPosition, 0, sourceState);
      movingPosition = reachedEnd
        ? 0
        : snapEditingEnabled(sourceState)
          ? snapFractionToBasePair(desiredPosition, sourceState, { min: 0, max: geometry.startPosition })
          : clamp(desiredPosition, 0, geometry.startPosition);
      if (movingPosition === null) return null;
      // Minimal lines separate only after physical contact. A manual drag cannot
      // travel beyond a chromosome boundary, so encode the complete post-contact
      // pull when the handle reaches that boundary; this makes the end open in
      // the same gesture used by the other visual models.
      const closureOvershoot = reachedEnd ? minimalManualEndOvershootFraction(sourceState) : 0;
      origin.leftOffset =
        geometry.startPosition - movingPosition + closureOvershoot - globalTravel;
      activeDrag.openedTerminal = reachedEnd;
    } else if (activeDrag.side === "right" && geometry.rightActive) {
      const reachedEnd = forkReachedChromosomeEnd(desiredPosition, 1, sourceState);
      movingPosition = reachedEnd
        ? 1
        : snapEditingEnabled(sourceState)
          ? snapFractionToBasePair(desiredPosition, sourceState, { min: geometry.startPosition, max: 1 })
          : clamp(desiredPosition, geometry.startPosition, 1);
      if (movingPosition === null) return null;
      const closureOvershoot = reachedEnd ? minimalManualEndOvershootFraction(sourceState) : 0;
      origin.rightOffset =
        movingPosition - geometry.startPosition + closureOvershoot - globalTravel;
      activeDrag.openedTerminal = reachedEnd;
    } else {
      return null;
    }

    activeDrag.collapsePending = collapsePending;
    sourceState.selectedOriginId = null;
    sourceState.selectedFork = { originId: origin.id, side: activeDrag.side };
    const absorbedOriginCount = absorbDormantOriginsDuringForkDrag(
      activeDrag,
      movingPosition,
      sourceState
    );
    synchroniseOriginPositions(sourceState);
    return {
      origin,
      geometry,
      movingPosition,
      collapsePending,
      mirrored: Boolean(activeDrag.mirroredForks && activeDrag.pairedForks),
      terminalClosure: Number.isFinite(completionBoundary) && Number.isFinite(replicatedBoundary),
      openedTerminal: activeDrag.openedTerminal === true,
      absorbedOriginCount,
    };
  }

  function mergeTouchingBubbles(originId, contactTolerance = RAW_BUBBLE_MERGE_EPSILON) {
    const result = mergeOverlappingBubbleState(originId, state, contactTolerance);
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
    const pairSpacingPx =
      basePairStepFraction(sourceState) * moleculeWidthForState(sourceState);
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
    const circular = circularGeometry(sourceState);
    const lowerFraction = circular
      ? Math.min(Number(min) || 0, Number(max) || 0)
      : clamp(Math.min(Number(min) || 0, Number(max) || 0), 0, 1);
    const upperFraction = circular
      ? Math.max(Number(min) || 0, Number(max) || 0)
      : clamp(Math.max(Number(min) || 0, Number(max) || 0), 0, 1);
    const lowerCoordinate = lowerFraction * lattice.subdivisionCount - lattice.edgeOffset;
    const upperCoordinate = upperFraction * lattice.subdivisionCount - lattice.edgeOffset;
    const firstCoordinate = Math.ceil(lowerCoordinate - phase - 1e-10) + phase;
    const lastCoordinate = Math.floor(upperCoordinate - phase + 1e-10) + phase;
    if (firstCoordinate > lastCoordinate) return null;

    const targetFraction = circular
      ? Number(fraction) || 0
      : clamp(Number(fraction) || 0, 0, 1);
    const targetCoordinate =
      targetFraction * lattice.subdivisionCount - lattice.edgeOffset;
    const snappedCoordinate = clamp(
      Math.round(targetCoordinate - phase) + phase,
      firstCoordinate,
      lastCoordinate
    );
    return (lattice.edgeOffset + snappedCoordinate) / lattice.subdivisionCount;
  }

  function periodicRegionAtPosition(position, model, sourceState = state) {
    const regions = Array.isArray(model?.regions) ? model.regions : [];
    const region = regions.find(
      (item) => position >= item.start - EPSILON && position <= item.end + EPSILON
    );
    if (!region || regions.length < 2) return region ? { region, position } : null;

    const first = regions[0];
    const last = regions.at(-1);
    const componentClosed = Boolean(first.componentClosed || last.componentClosed);
    const periodic = circularGeometry(sourceState) || componentClosed;
    if (!periodic) return { region, position };
    const componentStart = componentClosed
      ? Number(first.componentStart ?? last.componentStart ?? 0)
      : 0;
    const componentEnd = componentClosed
      ? Number(first.componentEnd ?? last.componentEnd ?? 1)
      : 1;
    const periodicSpan = Math.max(EPSILON, componentEnd - componentStart);
    const firstTouchesSeam = first.openStart || first.start <= componentStart + EPSILON;
    const lastTouchesSeam = last.openEnd || last.end >= componentEnd - EPSILON;
    if (!firstTouchesSeam || !lastTouchesSeam) return { region, position };

    const joinedRegion = {
      ...last,
      start: last.start,
      end: first.end + periodicSpan,
      originIds: [...new Set([...(last.originIds || []), ...(first.originIds || [])])],
      transitionSpan: Math.min(
        periodicSpan,
        Math.max(
          Number(last.transitionSpan) || 0,
          Number(first.transitionSpan) || 0,
          first.end + periodicSpan - last.start
        )
      ),
      openStart: false,
      openEnd: false,
      startBlend: clamp(last.startBlend || 0, 0, 1),
      endBlend: clamp(first.endBlend || 0, 0, 1),
      startClosureBlend: clamp(last.startClosureBlend || 0, 0, 1),
      endClosureBlend: clamp(first.endClosureBlend || 0, 0, 1),
      periodicJoin: true,
      componentStart,
      componentEnd,
      componentClosed,
    };
    if (region === first) return { region: joinedRegion, position: position + periodicSpan };
    if (region === last) return { region: joinedRegion, position };
    return { region, position };
  }

  function splitBubbleDimensions(region, sourceState = state) {
    const regionWidth = Math.max(0, Number(region?.end) - Number(region?.start));
    const pairStep = basePairStepFraction(sourceState);
    const targetGapPx = splitBubbleClearancePx(sourceState);
    const targetGap = targetGapPx / Math.max(EPSILON, moleculeWidthForState(sourceState));
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

  function splitBubble(x, preferredPathId = null) {
    const canonicalPosition = normalisedX(x);
    let sourceState = state;
    let model = getReplicationModel();
    let position = canonicalPosition;
    let metric = null;

    if (freeformGeometry(state)) {
      metric = freeformMetricAtFraction(canonicalPosition, state, preferredPathId);
      if (!metric) {
        setStatus("Paint a DNA path before splitting a replication bubble");
        return;
      }
      sourceState = freeformComponentState(metric, state.forkTravel, state);
      position = freeformFractionToLocal(canonicalPosition, metric, state);
      model = metric.closed
        ? getCircularReplicationModelAtTravel(sourceState.forkTravel, sourceState)
        : getLinearReplicationModelAtTravel(sourceState.forkTravel, sourceState);
    }

    const periodic = periodicRegionAtPosition(position, model, sourceState);
    if (!periodic) {
      setStatus("Choose a wider replication bubble");
      return;
    }
    const { region, position: resolvedPosition } = periodic;
    const { gap, gapSteps, minimumWidth, requiredWidth } = splitBubbleDimensions(
      region,
      sourceState
    );
    if (region.end - region.start < requiredWidth - EPSILON) {
      setStatus("Choose a wider replication bubble");
      return;
    }
    const minimumSplit = region.start + minimumWidth + gap / 2;
    const maximumSplit = region.end - minimumWidth - gap / 2;
    const continuousSplit = clamp(resolvedPosition, minimumSplit, maximumSplit);
    const split = snapEditingEnabled(sourceState)
      ? splitCompatibleCenterFraction(continuousSplit, gapSteps, sourceState, {
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
    const toGlobal = (localPosition) =>
      metric ? metric.start + localPosition * metric.span : localPosition;
    const left = bubbleFromBounds(
      toGlobal(region.start),
      toGlobal(leftEnd),
      state,
      metric?.id || null
    );
    const right = bubbleFromBounds(
      toGlobal(rightStart),
      toGlobal(region.end),
      state,
      metric?.id || null
    );
    if (!left || !right) {
      setStatus("Choose a wider replication bubble");
      return;
    }

    const replacedIds = new Set(region.originIds);
    pushSnapshot();
    state.origins = state.origins.filter((origin) => !replacedIds.has(origin.id));
    state.origins.push(left, right);
    state.origins.sort((a, b) => a.startPosition - b.startPosition);
    state.selectedFork = null;
    state.selectedOriginId = resolvedPosition <= split ? left.id : right.id;
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
      actionPathId: worldPoint.pathId || null,
      moved: false,
    };
    hideContextAction();
    elements.canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function performCanvasClick(action, x, pathId = null) {
    if (action === "split") {
      splitBubble(x, pathId);
      return;
    }
    if (action === "add") {
      addOrigin(x, pathId);
      return;
    }
    state.selectedOriginId = null;
    state.selectedFork = null;
    render();
  }

  function beginCutRange(event, x, pathId = null) {
    const rawPosition = normalisedX(x);
    const metric = freeformGeometry()
      ? freeformMetricById(pathId, state) || freeformMetricAtFraction(rawPosition, state, pathId)
      : null;
    const position = metric
      ? clamp(rawPosition, metric.start, metric.end)
      : circularGeometry()
        ? wrapFraction(rawPosition)
        : cutInteractionFraction(rawPosition);
    const periodic = circularGeometry()
      ? { start: 0, end: 1, span: 1, id: null }
      : metric?.closed
        ? { start: metric.start, end: metric.end, span: metric.span, id: metric.id, metric }
        : null;
    const wrappedLocal = periodic
      ? wrapFraction((position - periodic.start) / periodic.span)
      : position;
    dragState = {
      pointerId: event.pointerId,
      role: "cut-range",
      anchor: position,
      current: position,
      pathId: metric?.id || pathId || null,
      componentId: metric?.id || null,
      componentClosed: Boolean(periodic),
      componentStart: periodic?.start ?? metric?.start ?? 0,
      componentEnd: periodic?.end ?? metric?.end ?? 1,
      startPointerPosition: position,
      lastWrappedPointerPosition: wrappedLocal,
      unwrappedPointerPosition: position,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startSnapshot: snapshot(),
      moved: false,
    };
    hideContextAction();
    elements.canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function beginUnreplicateRange(event, x, pathId = null) {
    const rawPosition = normalisedX(x);
    const metric = freeformGeometry()
      ? freeformMetricById(pathId, state) || freeformMetricAtFraction(rawPosition, state, pathId)
      : null;
    const position = metric
      ? clamp(rawPosition, metric.start, metric.end)
      : circularGeometry()
        ? wrapFraction(rawPosition)
        : cutInteractionFraction(rawPosition);
    const periodic = circularGeometry()
      ? { start: 0, end: 1, span: 1, id: null }
      : metric?.closed
        ? { start: metric.start, end: metric.end, span: metric.span, id: metric.id, metric }
        : null;
    const wrappedLocal = periodic
      ? wrapFraction((position - periodic.start) / periodic.span)
      : position;
    stopAnimation();
    dragState = {
      pointerId: event.pointerId,
      role: "unreplicate-range",
      anchor: position,
      current: position,
      pathId: metric?.id || pathId || null,
      componentId: metric?.id || null,
      componentClosed: Boolean(periodic),
      componentStart: periodic?.start ?? metric?.start ?? 0,
      componentEnd: periodic?.end ?? metric?.end ?? 1,
      startPointerPosition: position,
      lastWrappedPointerPosition: wrappedLocal,
      unwrappedPointerPosition: position,
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

  function freeformArtworkPointFromScreen(screenPoint) {
    return freeformPoint(screenToArtworkPoint(screenPoint));
  }

  function freeformProjectionContinuityWindow(metric, pointerDistance = 0) {
    if (!metric?.length) return 1;
    const travelled = Math.max(0, Number(pointerDistance) || 0);
    const maximumFraction = metric.closed ? 0.04 : 0.05;
    const maximumArcLength = metric.length * maximumFraction;
    const allowedArcLength = Math.min(
      maximumArcLength,
      Math.max(
        8,
        metric.length * 0.008,
        travelled * 1.25 + 6
      )
    );
    return clamp(
      allowedArcLength / Math.max(EPSILON, metric.length),
      0.008,
      maximumFraction
    );
  }

  function worldPointForFreeformPath(
    screenPoint,
    pathId,
    sourceState = state,
    continuityState = null
  ) {
    if (!freeformGeometry(sourceState) || !pathId) return screenToWorld(screenPoint, sourceState);
    const metric = freeformMetricById(pathId, sourceState);
    const artworkPoint = screenToArtworkPoint(screenPoint, sourceState);
    if (!metric) return screenToWorld(screenPoint, sourceState);

    let referenceLocal = Number(continuityState?.lastFreeformLocalPosition);
    if (!Number.isFinite(referenceLocal) && Number.isFinite(Number(continuityState?.startPointerPosition))) {
      referenceLocal = freeformDragValueToLocal(continuityState.startPointerPosition, metric);
    }
    const previousArtworkPoint = continuityState?.lastFreeformArtworkPoint;
    const pointerDistance = previousArtworkPoint
      ? Math.hypot(
          artworkPoint.x - previousArtworkPoint.x,
          artworkPoint.y - previousArtworkPoint.y
        )
      : 0;
    const localWindow = Number.isFinite(referenceLocal)
      ? freeformProjectionContinuityWindow(metric, pointerDistance)
      : Infinity;
    let projection = Number.isFinite(referenceLocal)
      ? projectPointToFreeformMetric(artworkPoint, metric, Infinity, {
          referenceLocalPosition: referenceLocal,
          maximumLocalDelta: localWindow,
        })
      : projectPointToFreeformMetric(artworkPoint, metric);
    if (!projection && Number.isFinite(referenceLocal)) {
      const anchor = pointOnFreeformMetric(metric, referenceLocal);
      projection = {
        ...anchor,
        metric,
        pathId: metric.id,
        distance: Math.hypot(artworkPoint.x - anchor.x, artworkPoint.y - anchor.y),
      };
    }
    if (!projection) return screenToWorld(screenPoint, sourceState);

    if (Number.isFinite(referenceLocal) && Number.isFinite(localWindow)) {
      const delta = metric.closed
        ? signedCircularFractionDelta(referenceLocal, projection.localPosition)
        : projection.localPosition - referenceLocal;
      if (Math.abs(delta) > localWindow + EPSILON) {
        const boundedLocal = referenceLocal + Math.sign(delta) * localWindow;
        const bounded = pointOnFreeformMetric(metric, boundedLocal);
        projection = {
          ...bounded,
          metric,
          pathId: metric.id,
          distance: Math.hypot(artworkPoint.x - bounded.x, artworkPoint.y - bounded.y),
        };
      }
    }
    const signedOffset =
      (artworkPoint.x - projection.x) * projection.normalX +
      (artworkPoint.y - projection.y) * projection.normalY;
    const localUnwrapped = metric.closed && Number.isFinite(referenceLocal)
      ? nearestEquivalentFraction(projection.localPosition, referenceLocal)
      : projection.localPosition;
    if (continuityState && typeof continuityState === "object") {
      continuityState.lastFreeformLocalPosition = localUnwrapped;
      continuityState.lastFreeformArtworkPoint = { x: artworkPoint.x, y: artworkPoint.y };
    }
    const globalPosition = metric.start + projection.localPosition * metric.span;
    return {
      x: VIEW.x0 + globalPosition * moleculeWidthForState(sourceState),
      y: VIEW.centerY + signedOffset,
      distance: projection.distance,
      pathId: metric.id,
      localPosition: projection.localPosition,
      localPositionUnwrapped: localUnwrapped,
    };
  }

  function beginFreeformDraw(event, screenPoint) {
    const point = freeformArtworkPointFromScreen(screenPoint);
    if (!point) return false;
    const startEndpoint = nearestConnectableFreeformEndpoint(point, state, viewState);
    const startPoint = startEndpoint?.point
      ? { x: startEndpoint.point.x, y: startEndpoint.point.y }
      : point;
    freeformEditor.draftPoints = [startPoint];
    freeformEditor.eraserPoints = [];
    freeformEditor.hoverPoint = point;
    freeformEditor.hoverEndpoint = startEndpoint;
    dragState = {
      pointerId: event.pointerId,
      role: "freeform-draw",
      startEndpoint: startEndpoint
        ? {
            pathId: startEndpoint.pathId,
            end: startEndpoint.end,
            point: { x: startEndpoint.point.x, y: startEndpoint.point.y },
          }
        : null,
      snapCandidate: null,
      startSnapshot: snapshot(),
      startClientX: event.clientX,
      startClientY: event.clientY,
      moved: false,
    };
    hideContextAction();
    elements.canvas.setPointerCapture(event.pointerId);
    render();
    event.preventDefault();
    return true;
  }

  function beginFreeformErase(event, screenPoint) {
    const point = freeformArtworkPointFromScreen(screenPoint);
    if (!point) return false;
    freeformEditor.eraserPoints = [point];
    freeformEditor.draftPoints = [];
    freeformEditor.hoverPoint = point;
    freeformEditor.hoverEndpoint = null;
    dragState = {
      pointerId: event.pointerId,
      role: "freeform-erase",
      startSnapshot: snapshot(),
      startClientX: event.clientX,
      startClientY: event.clientY,
      moved: false,
    };
    hideContextAction();
    elements.canvas.setPointerCapture(event.pointerId);
    render();
    event.preventDefault();
    return true;
  }

  function beginFreeformShape(event, screenPoint) {
    const point = freeformArtworkPointFromScreen(screenPoint);
    if (!point) return false;
    const projection = nearestFreeformProjection(point);
    const tolerance = FREEFORM_PATH_HIT_WIDTH / Math.max(0.35, viewState.zoom);
    if (!projection || projection.distance > tolerance) {
      selectFreeformPath(null);
      render();
      setStatus("No DNA piece selected");
      event.preventDefault();
      return true;
    }
    const path = selectFreeformPath(projection.pathId);
    if (!path) return false;
    const metric = projection.metric;
    const endpointTolerance = freeformDrawSnapRadius(state, viewState);
    const firstEndpoint = pointOnFreeformMetric(metric, 0);
    const lastEndpoint = pointOnFreeformMetric(metric, 1);
    const endpointSide = path.closed
      ? null
      : Math.hypot(point.x - firstEndpoint.x, point.y - firstEndpoint.y) <= endpointTolerance
        ? "start"
        : Math.hypot(point.x - lastEndpoint.x, point.y - lastEndpoint.y) <= endpointTolerance
          ? "end"
          : null;
    const handles = freeformShapeHandles(path, state);
    const shapeBasis = freeformShapeControlBasis(path, state);
    dragState = {
      pointerId: event.pointerId,
      role: "freeform-shape",
      pathId: path.id,
      endpointSide,
      closeCandidate: null,
      centerLocalPosition: endpointSide === "start" ? 0 : endpointSide === "end" ? 1 : projection.localPosition,
      influenceFraction: freeformShapeInfluenceFraction(metric, handles.length),
      originalPoints: shapeBasis.points,
      controlPositions: shapeBasis.controlPositions,
      materializeShapeBasis: shapeBasis.materialized,
      startArtworkPoint: { ...point },
      startClientX: event.clientX,
      startClientY: event.clientY,
      startSnapshot: snapshot(),
      topologyCapture: captureFreeformTopology(state),
      lengthDensityCapture: captureFreeformLengthDensity(state),
      moved: false,
    };
    freeformEditor.hoverPoint = point;
    freeformEditor.hoverEndpoint = null;
    hideContextAction();
    elements.canvas.setPointerCapture(event.pointerId);
    render();
    event.preventDefault();
    return true;
  }

  function handleFreeformEditorPointerDown(event, screenPoint) {
    if (!freeformGeometry() || freeformEditor.tool === "edit") return false;
    if (event.button === 1 || (event.button === 0 && (event.ctrlKey || event.metaKey))) {
      beginPan(event, screenPoint);
      return true;
    }
    if (event.button !== 0 && event.pointerType !== "touch") return true;
    if (freeformEditor.tool === "draw") return beginFreeformDraw(event, screenPoint);
    if (freeformEditor.tool === "erase") return beginFreeformErase(event, screenPoint);
    if (freeformEditor.tool === "select") return beginFreeformShape(event, screenPoint);
    return false;
  }

  function handleFreeformEditorPointerMove(event, screenPoint) {
    if (!dragState || dragState.pointerId !== event.pointerId) return false;
    if (!["freeform-draw", "freeform-erase", "freeform-shape"].includes(dragState.role)) return false;
    const coalescedEvents =
      typeof event.getCoalescedEvents === "function" ? event.getCoalescedEvents() : [];
    const pointerSamples = coalescedEvents.length ? [...coalescedEvents] : [];
    const lastSample = pointerSamples.at(-1);
    if (
      !lastSample ||
      lastSample.clientX !== event.clientX ||
      lastSample.clientY !== event.clientY
    ) {
      pointerSamples.push(event);
    }
    const sampledPoints = pointerSamples
      .map((sample) => freeformArtworkPointFromScreen(pointFromEvent(sample)))
      .filter(Boolean);
    const point = sampledPoints.at(-1) || freeformArtworkPointFromScreen(screenPoint);
    if (!point) return true;
    freeformEditor.hoverPoint = point;
    const distance = Math.hypot(
      event.clientX - dragState.startClientX,
      event.clientY - dragState.startClientY
    );
    const localSpacing = FREEFORM_DRAW_POINT_SPACING / Math.max(
      0.35,
      viewState.zoom * Math.sqrt(Math.max(EPSILON, artworkAspectX() * artworkAspectY()))
    );

    if (dragState.role === "freeform-draw") {
      const changed = sampledPoints.reduce(
        (didChange, sample) =>
          appendFreeformStrokePoint(freeformEditor.draftPoints, sample, localSpacing) || didChange,
        false
      );
      const previousCandidate = dragState.snapCandidate;
      dragState.snapCandidate = freeformDraftSnapCandidate(
        freeformEditor.draftPoints,
        state,
        viewState,
        { startEndpoint: dragState.startEndpoint || null }
      );
      const candidateChanged =
        previousCandidate?.kind !== dragState.snapCandidate?.kind ||
        previousCandidate?.pathId !== dragState.snapCandidate?.pathId ||
        previousCandidate?.end !== dragState.snapCandidate?.end;
      if (changed || candidateChanged) {
        dragState.moved = dragState.moved || distance >= CUT_DRAG_THRESHOLD_PX;
        scheduleRender();
      }
    } else if (dragState.role === "freeform-erase") {
      const changed = sampledPoints.reduce(
        (didChange, sample) =>
          appendFreeformStrokePoint(
            freeformEditor.eraserPoints,
            sample,
            Math.max(2, localSpacing * 0.7)
          ) || didChange,
        false
      );
      if (changed) {
        dragState.moved = dragState.moved || distance >= CUT_DRAG_THRESHOLD_PX;
        scheduleRender();
      }
    } else if (dragState.role === "freeform-shape") {
      if (!dragState.moved && distance < PAN_DRAG_THRESHOLD_PX) return true;
      if (!dragState.moved) {
        pushSnapshot(dragState.startSnapshot);
        dragState.moved = true;
        stopAnimation();
        elements.canvas.classList.add("is-dragging");
        if (dragState.materializeShapeBasis) {
          const path = freeformPathById(dragState.pathId, state);
          if (path) {
            path.points = dragState.originalPoints.map((pathPoint) => ({ ...pathPoint }));
            invalidateFreeformMetrics(state);
          }
          dragState.materializeShapeBasis = false;
        }
      }
      const reshaped = reshapeFreeformNeighborhood(
        dragState.pathId,
        dragState.centerLocalPosition,
        {
          x: point.x - dragState.startArtworkPoint.x,
          y: point.y - dragState.startArtworkPoint.y,
        },
        {
          sourceState: state,
          originalPoints: dragState.originalPoints,
          controlPositions: dragState.controlPositions,
          influenceFraction: dragState.influenceFraction,
        }
      );
      if (reshaped) {
        updateFreeformPathLengthFromDensity(
          dragState.pathId,
          dragState.lengthDensityCapture,
          state
        );
        restoreFreeformTopology(dragState.topologyCapture, state);
        syncControls();
      }
      dragState.closeCandidate = freeformShapeSnapCandidate(
        dragState.pathId,
        dragState.endpointSide,
        state,
        viewState
      );
      scheduleRender();
    }
    event.preventDefault();
    return true;
  }

  function endFreeformEditorDrag(event, completedDrag) {
    if (!["freeform-draw", "freeform-erase", "freeform-shape"].includes(completedDrag.role)) return false;
    const cancelled = event.type === "pointercancel";
    elements.canvas.classList.remove("is-dragging");

    if (completedDrag.role === "freeform-draw") {
      const points = freeformEditor.draftPoints;
      const snapCandidate = completedDrag.snapCandidate || freeformDraftSnapCandidate(
        points,
        state,
        viewState,
        { startEndpoint: completedDrag.startEndpoint || null }
      );
      freeformEditor.draftPoints = [];
      if (!cancelled) {
        const path = addConnectedFreeformStroke(points, state, {
          startEndpoint: completedDrag.startEndpoint || null,
          snapCandidate,
        });
        if (path) {
          pushSnapshot(completedDrag.startSnapshot);
          syncControls();
          render();
          setStatus(
            path.closed
              ? "DNA stroke closed into a periodic loop"
              : completedDrag.startEndpoint || snapCandidate?.kind === "endpoint"
                ? "DNA stroke snapped smoothly to an existing end"
                : "New DNA piece painted"
          );
        } else {
          render();
          setStatus("Paint a longer stroke to create DNA");
        }
      } else {
        render();
      }
    } else if (completedDrag.role === "freeform-erase") {
      const stroke = freeformEditor.eraserPoints;
      freeformEditor.eraserPoints = [];
      if (!cancelled) {
        const result = eraseFreeformPaths(stroke, freeformEraserRadius(), state);
        if (result.changed) {
          pushSnapshot(completedDrag.startSnapshot);
          syncControls();
          render();
          setStatus(
            result.removedOrigins
              ? `DNA erased; ${result.removedOrigins} origin${result.removedOrigins === 1 ? "" : "s"} removed with it`
              : "DNA erased or split into separate pieces"
          );
        } else {
          render();
          setStatus("The eraser did not intersect a DNA piece");
        }
      } else {
        render();
      }
    } else if (completedDrag.role === "freeform-shape") {
      if (cancelled && completedDrag.moved) {
        restoreSnapshot(completedDrag.startSnapshot);
        selectFreeformPath(completedDrag.pathId, state);
      } else if (completedDrag.moved) {
        const candidate = completedDrag.closeCandidate;
        const closedBySnap = Boolean(
          candidate?.kind === "self" &&
          completedDrag.endpointSide &&
          snapFreeformPathEnds(completedDrag.pathId, completedDrag.endpointSide, state)
        );
        let joinedEndpoint = false;
        if (candidate?.kind === "endpoint" && candidate.sourceEndpoint && candidate.targetEndpoint) {
          joinedEndpoint = joinFreeformEndpoints(
            candidate.sourceEndpoint,
            candidate.targetEndpoint,
            state
          );
        }
        if (!joinedEndpoint) {
          normaliseCurrentFreeform(state);
          updateFreeformPathLengthFromDensity(
            completedDrag.pathId,
            completedDrag.lengthDensityCapture,
            state
          );
          restoreFreeformTopology(completedDrag.topologyCapture, state);
        }
        selectFreeformPath(completedDrag.pathId, state);
        syncControls();
        render();
        setStatus(
          closedBySnap
            ? "DNA ends snapped into a periodic loop"
            : joinedEndpoint
              ? "DNA pieces joined into one smooth strand"
              : "DNA shape updated"
        );
      } else {
        render();
        setStatus("DNA piece selected");
      }
    }
    freeformEditor.hoverPoint = null;
    freeformEditor.hoverEndpoint = null;
    updateFreeformToolbar();
    return true;
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
    if (handleFreeformEditorPointerDown(event, screenPoint)) return;
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
    const nearFreeformPath =
      !freeformGeometry() ||
      (Boolean(point.pathId) && Number.isFinite(point.distance) && point.distance <= halfHeight);

    if (specialControl && role !== "fork") {
      const unreplicateAvailable =
        point.x >= VIEW.x0 &&
        point.x <= VIEW.x1 &&
        Math.abs(point.y - VIEW.centerY) <= halfHeight &&
        nearFreeformPath &&
        Boolean(replicationAt(point.x, getReplicationModel()).region);
      if (!unreplicateAvailable) {
        setStatus("Start on replicated DNA to unreplicate a region");
        return;
      }
      beginUnreplicateRange(event, point.x, point.pathId || null);
      return;
    }

    if (event.shiftKey) {
      const breakAvailable =
        point.x >= VIEW.x0 &&
        point.x <= VIEW.x1 &&
        Math.abs(point.y - VIEW.centerY) <= halfHeight &&
        nearFreeformPath;
      if (role !== "cut" && !breakAvailable) return;
      beginCutRange(event, point.x, point.pathId || null);
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
    const component = freeformGeometry()
      ? freeformComponentBoundsForOrigin(origin, state)
      : null;
    const periodic = circularGeometry()
      ? { start: 0, end: 1, span: 1, id: null }
      : component?.closed
        ? { start: component.start, end: component.end, span: component.metric.span, id: component.id }
        : null;
    // A Free-form control can sit close to another lobe of the same spline.
    // Reproject pointer-down onto the control's own component and local arc,
    // rather than using the globally nearest piece of DNA. This prevents the
    // first drag event from jumping to a distant branch and opening a large,
    // unrelated region of that component.
    const controlReferencePosition = role === "fork"
      ? target.dataset.side === "left"
        ? geometry.leftPosition
        : geometry.rightPosition
      : origin.startPosition;
    const controlContinuity = { startPointerPosition: controlReferencePosition };
    const controlPoint = freeformGeometry() && (component?.id || geometry.componentId)
      ? worldPointForFreeformPath(
          screenPoint,
          component?.id || geometry.componentId,
          state,
          controlContinuity
        )
      : point;
    const wrappedPointerPosition = normalisedX(controlPoint.x);
    const forkUnwrapped = target.dataset.side === "left"
      ? Number.isFinite(geometry.leftUnwrapped)
        ? geometry.leftUnwrapped
        : periodic
          ? nearestPeriodicComponentPosition(geometry.leftPosition, origin.startPosition, periodic)
          : geometry.leftPosition
      : Number.isFinite(geometry.rightUnwrapped)
        ? geometry.rightUnwrapped
        : periodic
          ? nearestPeriodicComponentPosition(geometry.rightPosition, origin.startPosition, periodic)
          : geometry.rightPosition;
    const startPointerPosition = periodic
      ? role === "fork"
        ? forkUnwrapped
        : nearestPeriodicComponentPosition(wrappedPointerPosition, origin.startPosition, periodic)
      : wrappedPointerPosition;
    const originStartUnwrapped = periodic
      ? nearestPeriodicComponentPosition(origin.startPosition, startPointerPosition, periodic)
      : origin.startPosition;
    const initialWrappedLocal = periodic
      ? wrapFraction((wrappedPointerPosition - periodic.start) / periodic.span)
      : wrappedPointerPosition;

    dragState = {
      pointerId: event.pointerId,
      role,
      side: target.dataset.side || null,
      originId,
      componentId: component?.id || geometry.componentId || null,
      componentClosed: Boolean(component?.closed || geometry.componentClosed),
      componentStart: component?.start ?? geometry.componentStart ?? 0,
      componentEnd: component?.end ?? geometry.componentEnd ?? 1,
      startX: point.x,
      startPointerPosition,
      originStartUnwrapped,
      originStartPosition: origin.startPosition,
      originLeftOffset: origin.leftOffset,
      originRightOffset: origin.rightOffset,
      leftPosition: geometry.leftPosition,
      rightPosition: geometry.rightPosition,
      leftUnwrapped: Number.isFinite(geometry.leftUnwrapped)
        ? geometry.leftUnwrapped
        : geometry.leftPosition,
      rightUnwrapped: Number.isFinite(geometry.rightUnwrapped)
        ? geometry.rightUnwrapped
        : geometry.rightPosition,
      pairedForks: geometry.leftActive && geometry.rightActive,
      mirroredForks: role === "fork" && specialControl && geometry.leftActive && geometry.rightActive,
      terminalClosureBoundary: role === "fork"
        ? terminalClosureForFork(geometry, target.dataset.side, state)?.completionBoundary ?? null
        : null,
      terminalReplicatedBoundary: role === "fork"
        ? terminalClosureForFork(geometry, target.dataset.side, state)?.replicatedBoundary ?? null
        : null,
      collapsePending: false,
      minimumTranslation: periodic
        ? -Infinity
        : (component?.start ?? 0) - geometry.leftPosition,
      maximumTranslation: periodic
        ? Infinity
        : (component?.end ?? 1) - geometry.rightPosition,
      lastWrappedPointerPosition: initialWrappedLocal,
      unwrappedPointerPosition: startPointerPosition,
      lastFreeformLocalPosition: controlContinuity.lastFreeformLocalPosition,
      lastFreeformArtworkPoint: controlContinuity.lastFreeformArtworkPoint,
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
    if (handleFreeformEditorPointerMove(event, screenPoint)) return;
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
      const point = worldPointForFreeformPath(screenPoint, dragState.pathId, state, dragState);
      const wrappedPosition = normalisedX(point.x);
      dragState.current = dragPeriodicComponent(dragState, state)
        ? unwrappedDragPointer(dragState, wrappedPosition, state)
        : wrappedPosition;
      const distance = Math.hypot(event.clientX - dragState.startClientX, event.clientY - dragState.startClientY);
      if (!dragState.moved && distance >= CUT_DRAG_THRESHOLD_PX) {
        dragState.moved = true;
        elements.canvas.classList.add("is-cutting");
      }
      if (dragState.moved) scheduleRender();
      event.preventDefault();
      return;
    }
    if (dragState.role === "unreplicate-range") {
      const point = worldPointForFreeformPath(screenPoint, dragState.pathId, state, dragState);
      const wrappedPosition = normalisedX(point.x);
      dragState.current = dragPeriodicComponent(dragState, state)
        ? unwrappedDragPointer(dragState, wrappedPosition, state)
        : wrappedPosition;
      const distance = Math.hypot(
        event.clientX - dragState.startClientX,
        event.clientY - dragState.startClientY
      );
      if (!dragState.moved && distance >= CUT_DRAG_THRESHOLD_PX) {
        dragState.moved = true;
      }
      if (dragState.moved) scheduleRender();
      event.preventDefault();
      return;
    }
    if (dragState.role === "pan") {
      viewState.panX = dragState.startPanX + screenPoint.x - dragState.startX;
      viewState.panY = dragState.startPanY + screenPoint.y - dragState.startY;
      dragState.moved = true;
      scheduleRender();
      event.preventDefault();
      return;
    }

    const point = worldPointForFreeformPath(screenPoint, dragState.componentId, state, dragState);
    const wrappedPointerPosition = normalisedX(point.x);
    const periodic = dragPeriodicComponent(dragState, state);
    const pointerPosition = periodic
      ? unwrappedDragPointer(dragState, wrappedPointerPosition)
      : wrappedPointerPosition;
    const movementDistance = Math.abs(pointerPosition - dragState.startPointerPosition) *
      moleculeWidthForState(state) *
      geometryScreenTangentScale(wrappedPointerPosition, state);
    if (!dragState.moved && movementDistance < 2) return;

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
      const dragResult = applyOriginDragPosition(dragState, pointerPosition);
      if (!dragResult) return;
      setStatus(
        dragResult.consumed
          ? "Overlapping origin and its forks were consumed"
          : `Replication bubble moved to ${genomicPositionAtFraction(dragResult.origin.position)} bp`
      );
    } else {
      state.selectedOriginId = null;
      state.selectedFork = { originId: dragState.originId, side: dragState.side };
      const dragResult = applyForkDragPosition(dragState, pointerPosition);
      if (!dragResult) return;
      setStatus(
        dragResult.absorbedOriginCount
          ? `${dragResult.absorbedOriginCount} dormant origin${
              dragResult.absorbedOriginCount === 1 ? "" : "s"
            } absorbed by the moving fork`
          : dragState.mirroredForks
          ? "Both forks adjusted symmetrically"
          : `${dragState.side === "left" ? "Left" : "Right"} fork adjusted`
      );
    }

    scheduleRender();
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

    if (endFreeformEditorDrag(event, completedDrag)) return;

    if (completedDrag.role === "cut-range") {
      if (event.type === "pointercancel") {
        render();
        clearPointerHover();
      } else if (completedDrag.moved) {
        commitCutRange(
          completedDrag.anchor,
          completedDrag.current,
          completedDrag.startSnapshot,
          completedDrag.pathId || null
        );
        rememberPointer(event);
      } else {
        addOrRepairCut(
          VIEW.x0 + wrapFraction(completedDrag.current) * VIEW.moleculeWidth,
          completedDrag.pathId || null
        );
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
          completedDrag.startSnapshot,
          completedDrag.pathId || null
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
        performCanvasClick(completedDrag.action, completedDrag.actionX, completedDrag.actionPathId);
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
    const mergeTolerance =
      completedDrag.role === "fork"
        ? manualForkMergeTolerance(state)
        : RAW_BUBBLE_MERGE_EPSILON;
    const merged =
      !collapsed &&
      shouldMergeCompletedBubbleDrag(completedDrag, event.type) &&
      mergeTouchingBubbles(completedDrag.originId, mergeTolerance);
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
    setZoom(viewState.zoom * factor, focus, { deferRender: true });
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
      setStatus(
        circularGeometry()
          ? "All active forks have merged around the circular molecule"
          : "All active forks have merged or reached an end"
      );
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
      // Rewind the shared S-phase clock without erasing the origin/fork
      // offsets that encode firing times and manual dynamics. Replaying a
      // completed programme therefore reproduces the same schedule.
      state.forkTravel = forkTravelBounds(state).zero;
      resetForkPlaybackClock(state);
      synchroniseSPhaseFromGeometry(getReplicationModelAtTravel(state.forkTravel, state), state);
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
    const needsFullDetail = interactiveRenderDetail() || previewDetailMode() === "fast";
    if (!needsFullDetail) return cleanSvgElementFromCurrentCanvas();

    const previousDetail = renderDetailOverride;
    renderDetailOverride = "full";
    render();
    try {
      return cleanSvgElementFromCurrentCanvas();
    } finally {
      renderDetailOverride = previousDetail;
      render();
    }
  }

  function cleanSvgElementFromCurrentCanvas() {
    const namespace = "http://www.w3.org/2000/svg";
    const artwork = elements.canvas.querySelector("#rs-export-artwork");
    const measured = artwork?.getBBox();
    const halfHeight = renderedDoubleStrandHalfHeight();
    const freeformPadding =
      state.daughterSpacing / 2 +
      halfHeight +
      Math.max(state.weight, state.basePairWidth) +
      (contourEnabled() ? contourThickness() : 0);
    const fallback = circularGeometry()
      ? {
          x: VIEW.width / 2 - circularRadius() - halfHeight,
          y: VIEW.centerY - circularRadius() - halfHeight,
          width: (circularRadius() + halfHeight) * 2,
          height: (circularRadius() + halfHeight) * 2,
        }
      : freeformGeometry()
        ? freeformArtworkBounds(state, freeformPadding)
        : {
            x: VIEW.x0,
            y: VIEW.centerY - halfHeight,
            width: VIEW.moleculeWidth,
            height: halfHeight * 2,
          };
    const bounds = measured && measured.width > 0 && measured.height > 0 ? measured : fallback;
    const strokeRadius = Math.max(state.weight, state.basePairWidth) / 2 +
      (contourEnabled() ? contourThickness() : 0);
    const exportPadding = Math.max(EXPORT_PADDING, strokeRadius + 2);
    const x = bounds.x - exportPadding;
    const y = bounds.y - exportPadding;
    const width = Math.max(1, bounds.width + exportPadding * 2);
    const height = Math.max(1, bounds.height + exportPadding * 2);
    const svg = document.createElementNS(namespace, "svg");
    const title = document.createElementNS(namespace, "title");
    title.textContent = "DNA replication diagram created with RepliCanvas";
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
    return `replicanvas-${geometryMode()}-${basePairCount()}bp-${state.origins.length}-origins.${extension}`;
  }

  function saveConfiguration() {
    const source = `${JSON.stringify(configurationDocument(), null, 2)}\n`;
    downloadBlob(
      new Blob([source], { type: "application/json;charset=utf-8" }),
      exportFilename("replicanvas.json")
    );
    setStatus("Configuration saved");
  }

  function applyConfigurationState(candidate) {
    const previousState = state;
    const previousViewState = { ...viewState };
    const previousSnapshot = snapshot();
    stopAnimation();
    pendingControlSnapshot = null;
    dragState = null;
    state = candidate;
    state.playing = false;

    try {
      reseedNextOriginId(state);
      syncFreeformEditorFromState(state, { resetTool: true });
      syncViewGeometry(state);
      viewState = fittedViewState(state);
      syncControls();
      render();
    } catch (error) {
      state = previousState;
      viewState = previousViewState;
      syncFreeformEditorFromState(state, { resetTool: true });
      syncViewGeometry(state);
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
    frame.title = "RepliCanvas PDF export";
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
      const maxStroke = Math.max(videoState.weight, videoState.basePairWidth) +
        (contourEnabled(videoState) ? contourThickness(videoState) * 2 : 0);
      const contentHalfExtent = Math.max(
        80,
        renderedDaughterHalfSpacing(videoState) + renderedDoubleStrandHalfHeight(videoState) + maxStroke
      );
      const transform = artworkTransformComponents(videoState);
      let x;
      let y;
      let width;
      let height;
      if (circularGeometry(videoState)) {
        const radialExtent = circularRadius(videoState) + contentHalfExtent;
        width = radialExtent * 2 * transform.scaleX + EXPORT_PADDING * 2;
        height = radialExtent * 2 * transform.scaleY + EXPORT_PADDING * 2;
        x = VIEW.width / 2 - width / 2;
        y = VIEW.centerY - height / 2;
      } else if (freeformGeometry(videoState)) {
        const bounds = freeformArtworkBounds(videoState, contentHalfExtent);
        const corners = [
          { x: bounds.left, y: bounds.top },
          { x: bounds.right, y: bounds.top },
          { x: bounds.left, y: bounds.bottom },
          { x: bounds.right, y: bounds.bottom },
        ].map((point) => ({
          x: transform.scaleX * point.x + transform.translateX,
          y: transform.scaleY * point.y + transform.translateY,
        }));
        const left = Math.min(...corners.map((point) => point.x));
        const right = Math.max(...corners.map((point) => point.x));
        const top = Math.min(...corners.map((point) => point.y));
        const bottom = Math.max(...corners.map((point) => point.y));
        x = left - EXPORT_PADDING;
        y = top - EXPORT_PADDING;
        width = Math.max(1, right - left + EXPORT_PADDING * 2);
        height = Math.max(1, bottom - top + EXPORT_PADDING * 2);
      } else {
        const transformedLeft = transform.scaleX * VIEW.x0 + transform.translateX;
        const transformedRight = transform.scaleX * VIEW.x1 + transform.translateX;
        const transformedTop =
          transform.scaleY * (VIEW.centerY - contentHalfExtent) + transform.translateY;
        const transformedBottom =
          transform.scaleY * (VIEW.centerY + contentHalfExtent) + transform.translateY;
        x = Math.min(transformedLeft, transformedRight) - EXPORT_PADDING;
        y = Math.min(transformedTop, transformedBottom) - EXPORT_PADDING;
        width = Math.abs(transformedRight - transformedLeft) + EXPORT_PADDING * 2;
        height = Math.abs(transformedBottom - transformedTop) + EXPORT_PADDING * 2;
      }
      const videoArtwork = withRenderDetail("full", () =>
        withArtworkStrokeScale(1, () =>
          withArtworkViewportScale(1, () => artworkMarkup(model))
        )
      );
      const source = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${fixed(x)} ${fixed(y)} ${fixed(width)} ${fixed(height)}" width="${fixed(
        width
      )}" height="${fixed(height)}" preserveAspectRatio="xMidYMid meet">
  <title>Animated DNA replication diagram created with RepliCanvas</title>
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

  function normaliseMp4Blob(blob) {
    if (!(blob instanceof Blob) || blob.size <= 0) {
      throw new Error("The MP4 encoder returned an empty file");
    }
    return blob.type === "video/mp4"
      ? blob
      : new Blob([blob], { type: "video/mp4" });
  }

  function saveMp4Blob(blob, filename) {
    downloadBlob(normaliseMp4Blob(blob), filename);
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

  function videoFramePlan(videoState, settings = appSettings) {
    // Legacy snapshots may contain zero, negative, or invalid speed values.
    // Export must still cover the complete phase instead of producing one 0%
    // frame; supported positive speeds retain their configured timing.
    const speed = playbackSpeed(videoState);
    const frameRate = animationFrameRate(settings);
    const startTravel = forkTravelBounds(videoState).zero;
    const completionTravel = forkCompletionTravel(videoState);
    const travelPerFrame =
      FORK_TRAVEL_PER_MILLISECOND *
      (1000 / frameRate) *
      speed *
      genomeDistanceScale(videoState);
    const travelSpan = Math.max(0, completionTravel - startTravel);
    return {
      frameRate,
      startTravel,
      completionTravel,
      travelPerFrame,
      discreteStep: discreteAnimationEnabled(videoState) ? basePairStepFraction(videoState) : 0,
      lastFrameIndex: travelPerFrame > 0 ? Math.ceil(travelSpan / travelPerFrame) : 0,
      frameDurationSeconds: 1 / frameRate,
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
    const plan = videoFramePlan(videoState);
    const source = new Mediabunny.CanvasSource(canvas, {
      codec,
      bitrate: videoBitsPerSecond(),
      latencyMode: appSettings.videoQuality === "balanced" ? "realtime" : "quality",
      keyFrameInterval: 2,
    });
    output.addVideoTrack(source, { frameRate: plan.frameRate });

    try {
      await output.start();
      for (let frameIndex = 0; frameIndex <= plan.lastFrameIndex; frameIndex += 1) {
        const forkTravel = videoTravelAtFrame(plan, frameIndex);
        const model = await drawVideoFrame(canvas, context, videoState, forkTravel);
        await source.add(frameIndex * plan.frameDurationSeconds, plan.frameDurationSeconds, {
          keyFrame: frameIndex % (plan.frameRate * 2) === 0,
        });
        setVideoExportProgress(
          0.02 + 0.92 * ((frameIndex + 1) / Math.max(1, plan.lastFrameIndex + 1))
        );
        if (frameIndex % plan.frameRate === 0 || frameIndex === plan.lastFrameIndex) {
          setStatus(`Encoding ${plan.frameRate} fps MP4... ${Math.round(replicatedFraction(model))}%`);
        }
      }
      source.close();
      setVideoExportProgress(0.96);
      await output.finalize();
      if (!target.buffer?.byteLength) throw new Error("The MP4 encoder returned an empty file");
      setVideoExportProgress(0.98);
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

  function captureVideoStream(canvas, frameRate = animationFrameRate()) {
    try {
      const manualStream = canvas.captureStream(0);
      const manualTrack = manualStream.getVideoTracks()[0];
      if (manualTrack && typeof manualTrack.requestFrame === "function") {
        return { stream: manualStream, requestFrame: () => manualTrack.requestFrame() };
      }
      manualStream.getTracks().forEach((track) => track.stop());
    } catch {
      // Fall back to the browser-managed canvas stream below.
    }
    return { stream: canvas.captureStream(frameRate), requestFrame: null };
  }

  function createNativeRecorder(stream, mimeType, bitrate = videoBitsPerSecond()) {
    try {
      return new MediaRecorder(stream, { mimeType, videoBitsPerSecond: bitrate });
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
      const captured = captureVideoStream(canvas, plan.frameRate);
      stream = captured.stream;
      recorder = createNativeRecorder(stream, mimeType, videoBitsPerSecond());
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
        setVideoExportProgress(
          0.02 + 0.88 * ((frameIndex + 1) / Math.max(1, plan.lastFrameIndex + 1))
        );
        if (frameIndex % plan.frameRate === 0 || frameIndex === plan.lastFrameIndex) {
          const format = mimeType.startsWith("video/webm") ? "intermediate video" : "fallback MP4";
          setStatus(`Recording ${format}... ${Math.round(replicatedFraction(model))}%`);
        }
        const targetTime = startedAt + ((frameIndex + 1) * 1000) / plan.frameRate;
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
      conversion.onProgress = (progress) => {
        setVideoExportProgress(0.9 + clamp(progress, 0, 1) * 0.08);
        setStatus(`Building MP4 file... ${Math.round(progress * 100)}%`);
      };
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

  function setVideoExportProgress(progress) {
    const configured = Number(progress);
    const next = clamp(Number.isFinite(configured) ? configured : 0, 0, 1);
    // Encoding may retry a codec or switch to a fallback. Keep the visible pie
    // monotonic so a retry never looks like lost work.
    videoExportProgress = isVideoExporting ? Math.max(videoExportProgress, next) : next;
    const percentage = Math.round(videoExportProgress * 100);
    if (elements.downloadButtonSpinner) {
      elements.downloadButtonSpinner.style?.setProperty?.(
        "--rs-video-progress",
        String(videoExportProgress)
      );
      elements.downloadButtonSpinner.setAttribute?.("data-progress", String(percentage));
    }
    if (isVideoExporting && elements.downloadButton) {
      elements.downloadButton.setAttribute("aria-label", `Generating animation ${percentage}%`);
    }
    return videoExportProgress;
  }

  function animationExportAvailable(sourceState = state) {
    return Array.isArray(sourceState?.origins) && sourceState.origins.length > 0;
  }

  function setVideoExportBusy(busy) {
    isVideoExporting = busy;
    if (busy) {
      videoExportProgress = 0;
      setVideoExportProgress(0);
    }
    if (elements.exportMp4Button) {
      elements.exportMp4Button.disabled = busy || !animationExportAvailable(state);
    }
    elements.downloadButton.disabled = busy;
    elements.downloadButtonLabel.textContent = busy ? "Generating..." : "Download";
    if (elements.downloadButtonSpinner) elements.downloadButtonSpinner.hidden = !busy;
    elements.downloadButton.setAttribute("aria-busy", String(busy));
    elements.downloadButton.setAttribute("aria-label", busy ? "Generating animation 0%" : "Download");
    elements.canvasFrame.toggleAttribute("aria-busy", busy);
    if (!busy) {
      videoExportProgress = 0;
      elements.downloadButtonSpinner?.style?.setProperty?.("--rs-video-progress", "0");
    }
  }

  async function exportMp4() {
    if (isVideoExporting) return;
    if (!animationExportAvailable(state)) {
      setStatus("Add an origin before exporting an animation");
      return;
    }

    if (typeof HTMLCanvasElement === "undefined") {
      setStatus("MP4 export is unavailable in this browser");
      return;
    }

    const videoState = makeVideoExportState();
    const filename = exportFilename("mp4");
    setVideoExportBusy(true);

    try {
      const dimensions = fixedVideoSvgSource(videoState, videoState.forkTravel);
      const canvas = document.createElement("canvas");
      canvas.width = animationResolution();
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

      setVideoExportProgress(0.99);
      saveMp4Blob(video, filename);
      setVideoExportProgress(1);
      setStatus("MP4 download started");
    } catch (error) {
      console.error("MP4 export failed", error);
      setStatus(`MP4 export failed: ${error instanceof Error ? error.message : "no compatible encoder was available"}`);
    } finally {
      setVideoExportBusy(false);
    }
  }

  function storedThemeMode() {
    try {
      if (typeof localStorage === "undefined") return "system";
      const stored = localStorage.getItem(THEME_CACHE_KEY) ?? localStorage.getItem(LEGACY_THEME_CACHE_KEY);
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
        localStorage.setItem(THEME_CACHE_KEY, themeMode);
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

  function aboutModalIsOpen() {
    return Boolean(elements.aboutModal && !elements.aboutModal.hidden);
  }

  function settingsModalIsOpen() {
    return Boolean(elements.settingsModal && !elements.settingsModal.hidden);
  }

  function syncSettingsControls() {
    appSettings = normaliseAppSettings(appSettings);
    if (elements.settingsFrameRateControl) {
      elements.settingsFrameRateControl.value = String(appSettings.frameRate);
    }
    if (elements.settingsResolutionControl) {
      elements.settingsResolutionControl.value = String(appSettings.videoWidth);
    }
    if (elements.settingsVideoQualityControl) {
      elements.settingsVideoQualityControl.value = appSettings.videoQuality;
    }
    if (elements.settingsPreviewDetailControl) {
      elements.settingsPreviewDetailControl.value = appSettings.previewDetail;
    }
    if (elements.settingsPauseHiddenToggle) {
      elements.settingsPauseHiddenToggle.checked = appSettings.pauseWhenHidden;
    }
    if (elements.settingsRememberProjectToggle) {
      elements.settingsRememberProjectToggle.checked = appSettings.rememberProject;
    }
    if (elements.exportMp4Description) {
      elements.exportMp4Description.textContent = animationExportAvailable(state)
        ? `${appSettings.frameRate} fps, ${appSettings.videoWidth} px`
        : "Add an origin to enable";
    }
  }

  function updateAppSettingsFromControls({ rerender = true, announce = true } = {}) {
    const previous = normaliseAppSettings(appSettings);
    appSettings = normaliseAppSettings({
      frameRate: elements.settingsFrameRateControl?.value ?? previous.frameRate,
      videoWidth: elements.settingsResolutionControl?.value ?? previous.videoWidth,
      videoQuality: elements.settingsVideoQualityControl?.value ?? previous.videoQuality,
      previewDetail: elements.settingsPreviewDetailControl?.value ?? previous.previewDetail,
      pauseWhenHidden: elements.settingsPauseHiddenToggle?.checked ?? previous.pauseWhenHidden,
      rememberProject: elements.settingsRememberProjectToggle?.checked ?? previous.rememberProject,
    });
    persistAppSettings();
    if (previous.rememberProject && !appSettings.rememberProject) {
      persistTemplateCacheNow();
    } else if (!previous.rememberProject && appSettings.rememberProject) {
      persistTemplateCacheNow();
    }
    syncSettingsControls();
    if (rerender && previous.previewDetail !== appSettings.previewDetail && state && elements.canvas) render();
    if (announce && elements.statusMessage) setStatus("Settings updated");
    return appSettings;
  }

  function openSettingsModal() {
    if (!elements.settingsModal) return;
    settingsReturnFocus = elements.projectMenuButton ||
      (document.activeElement?.focus ? document.activeElement : null);
    closeAboutModal({ restoreFocus: false });
    closeProjectMenu();
    closeDownloadMenu();
    syncSettingsControls();
    elements.settingsModal.hidden = false;
    syncModalPageState();
    requestAnimationFrame(() => elements.settingsCloseButton?.focus());
  }

  function closeSettingsModal({ restoreFocus = true } = {}) {
    if (!settingsModalIsOpen()) return;
    elements.settingsModal.hidden = true;
    syncModalPageState();
    const returnTarget = settingsReturnFocus || elements.projectMenuButton;
    settingsReturnFocus = null;
    if (restoreFocus) returnTarget?.focus?.();
  }

  function trapSettingsModalFocus(event) {
    return settingsModalIsOpen() ? trapModalFocus(elements.settingsModal, event) : false;
  }

  function restoreDefaultAppSettings() {
    appSettings = { ...APP_SETTINGS_DEFAULTS };
    persistAppSettings();
    syncSettingsControls();
    persistTemplateCacheNow();
    if (state && elements.canvas) render();
    setStatus("Application settings restored");
  }

  function syncModalPageState() {
    const open = settingsModalIsOpen() || aboutModalIsOpen();
    document.body?.classList?.toggle?.("rs-modal-open", open);
    if (elements.app) {
      if (open) elements.app.setAttribute("aria-hidden", "true");
      else elements.app.removeAttribute("aria-hidden");
    }
  }

  function openAboutModal() {
    if (!elements.aboutModal) return;
    // The About command itself lives inside a menu that is hidden immediately
    // afterwards, so return focus to the visible Menu button when the dialog
    // closes rather than to an inaccessible menu item.
    aboutReturnFocus = elements.projectMenuButton ||
      (document.activeElement?.focus ? document.activeElement : null);
    closeSettingsModal({ restoreFocus: false });
    closeProjectMenu();
    closeDownloadMenu();
    elements.aboutModal.hidden = false;
    syncModalPageState();
    requestAnimationFrame(() => elements.aboutCloseButton?.focus());
  }

  function closeAboutModal({ restoreFocus = true } = {}) {
    if (!aboutModalIsOpen()) return;
    elements.aboutModal.hidden = true;
    syncModalPageState();
    const returnTarget = aboutReturnFocus || elements.aboutMenuButton;
    aboutReturnFocus = null;
    if (restoreFocus) returnTarget?.focus?.();
  }

  function trapModalFocus(modal, event) {
    if (!modal || modal.hidden || event.key !== "Tab") return false;
    const focusable = [...modal.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter((element) => !element.hidden);
    if (!focusable.length) return false;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return true;
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
      return true;
    }
    return false;
  }

  function trapAboutModalFocus(event) {
    return aboutModalIsOpen() ? trapModalFocus(elements.aboutModal, event) : false;
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
    if (elements.geometryControl) {
      elements.geometryControl.addEventListener("change", () => {
        stopAnimation();
        pushSnapshot();
        const nextGeometry = GEOMETRY_MODES.has(elements.geometryControl.value)
          ? elements.geometryControl.value
          : DEFAULTS.geometry;
        switchGeometryWorkspace(nextGeometry, state);
        syncFreeformEditorFromState(state, { resetTool: true });
        selectFreeformPath(
          state.freeform?.selectedPathId || state.freeform?.paths?.[0]?.id || null,
          state
        );
        syncViewGeometry(state);
        viewState = fittedViewState(state);
        syncControls();
        render();
        const labels = {
          linear: "Linear DNA geometry selected",
          circular: "Circular DNA geometry selected",
          freeform: "Free-form canvas ready — paint a DNA piece to begin",
        };
        setStatus(labels[nextGeometry]);
      });
    }
    [
      [elements.freeformDrawButton, "draw"],
      [elements.freeformEditButton, "edit"],
      [elements.freeformSelectButton, "select"],
      [elements.freeformEraseButton, "erase"],
    ].forEach(([control, tool]) => {
      control?.addEventListener("click", () => setFreeformTool(tool));
    });
    elements.freeformEraserSizeControl?.addEventListener("input", () => {
      freeformEditor.eraserRadius = freeformEraserRadius(
        elements.freeformEraserSizeControl.value
      );
      updateFreeformToolbar();
      scheduleRender();
      setStatus(`Eraser size set to ${Math.round(freeformEditor.eraserRadius * 2)} px`);
    });
    elements.freeformDeletePathButton?.addEventListener("click", deleteAllFreeformPaths);

    bindContinuousControl(elements.lengthControl, (value) => {
      const nextLength = boundedLengthValue(value, state);
      if (Math.abs(nextLength - state.length) > EPSILON) reseedBasePairSequence(state);
      resizeGenomeLength(nextLength, state);
      scheduleRender();
    });
    if (elements.fitGenomeToggle) {
      elements.fitGenomeToggle.addEventListener("change", () => {
        pushSnapshot();
        state.advanced.lengthMode = elements.fitGenomeToggle.checked ? "scale" : "extend";
        syncViewGeometry(state);
        if (lengthMode() === "scale") viewState = fittedViewState(state);
        syncControls();
        render();
        setStatus(
          lengthMode() === "extend"
            ? circularGeometry()
              ? "Genome length will expand the circumference"
              : "Genome length will extend at a fixed genomic scale"
            : "The complete genome will be fitted to the canvas"
        );
      });
    }
    if (elements.rightHandedToggle) {
      elements.rightHandedToggle.addEventListener("change", () => {
        pushSnapshot();
        state.advanced.dnaHandedness = elements.rightHandedToggle.checked ? "right" : "left";
        render();
      });
    }
    if (elements.depthAwareColorSplitToggle) {
      elements.depthAwareColorSplitToggle.addEventListener("change", () => {
        pushSnapshot();
        state.advanced.depthAwareBasePairSplit = elements.depthAwareColorSplitToggle.checked;
        render();
      });
    }
    bindContinuousControl(elements.progressControl, (value) => {
      stopAnimation();
      setSPhaseTime(boundedControlValue("progress", value));
      scheduleRender();
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
      scheduleRender();
    });
    bindContinuousControl(elements.basePairWidthControl, (value) => {
      state.basePairWidth = boundedControlValue("basePairWidth", value);
      scheduleRender();
    });
    bindContinuousControl(elements.weightControl, (value) => {
      state.weight = boundedControlValue("weight", value);
      scheduleRender();
    });
    if (elements.doubleStrandHeightControl) {
      bindContinuousControl(elements.doubleStrandHeightControl, (value) => {
        state.doubleStrandHeight = boundedControlValue("doubleStrandHeight", value);
        scheduleRender();
      });
    }
    bindContinuousControl(elements.daughterSpacingControl, (value) => {
      state.daughterSpacing = boundedControlValue("daughterSpacing", value);
      scheduleRender();
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
        scheduleRender();
      });
    }
    if (elements.strandPhaseShiftControl) {
      bindContinuousControl(elements.strandPhaseShiftControl, (value) => {
        state.advanced.strandPhaseShift = boundedControlValue(
          "strandPhaseShift",
          value,
          DEFAULTS.advanced.strandPhaseShift
        );
        scheduleRender();
      });
    }
    if (elements.basePairTranslationControl) {
      bindContinuousControl(elements.basePairTranslationControl, (value) => {
        state.advanced.basePairTranslation = boundedControlValue(
          "basePairTranslation",
          value,
          DEFAULTS.advanced.basePairTranslation
        );
        scheduleRender();
      });
    }
    if (elements.basePairAngleControl) {
      bindContinuousControl(elements.basePairAngleControl, (value) => {
        state.advanced.basePairAngle = boundedControlValue(
          "basePairAngle",
          value,
          DEFAULTS.advanced.basePairAngle
        );
        scheduleRender();
      });
    }

    if (elements.transitionTightnessControl) {
      bindContinuousControl(elements.transitionTightnessControl, (value) => {
        state.advanced.transitionTightness = boundedControlValue(
          "transitionTightness",
          value,
          DEFAULTS.advanced.transitionTightness
        );
        scheduleRender();
      });
    }
    if (elements.terminalSmoothingControl) {
      bindContinuousControl(elements.terminalSmoothingControl, (value) => {
        state.advanced.terminalSmoothing = boundedControlValue(
          "terminalSmoothing",
          value,
          DEFAULTS.advanced.terminalSmoothing
        );
        scheduleRender();
      });
    }
    if (elements.contourThicknessControl) {
      bindContinuousControl(elements.contourThicknessControl, (value) => {
        state.advanced.contourThickness = boundedControlValue(
          "contourThickness",
          value,
          DEFAULTS.advanced.contourThickness
        );
        scheduleRender();
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
        scheduleRender();
      });
      control.addEventListener("change", finishControlChange);
    });

    [
      [elements.crossoverGapsToggle, "crossoverGaps"],
      [elements.gridToggle, "grid"],
      [elements.alwaysShowControlsToggle, "alwaysShowControls"],
      [elements.snapToBasePairsToggle, "snapToBasePairs"],
      [elements.includeExportBackgroundToggle, "includeExportBackground"],
      [elements.contourToggle, "contour"],
    ].forEach(([control, key]) => {
      control.addEventListener("change", () => {
        pushSnapshot();
        state.advanced[key] = control.checked;
        if (["contour", "grid"].includes(key)) syncControls();
        render();
      });
    });

    elements.centricGridToggle.addEventListener("change", () => {
      pushSnapshot();
      state.advanced.gridStyle = elements.centricGridToggle.checked ? "centric" : "square";
      render();
    });

    elements.scaleBarToggle.addEventListener("change", () => {
      pushSnapshot();
      state.advanced.scaleBar = elements.scaleBarToggle.checked;
      render();
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
      scheduleRender();
    });
    elements.backgroundColorControl.addEventListener("change", finishControlChange);

    elements.contourColorControl.addEventListener("pointerdown", beginControlChange);
    elements.contourColorControl.addEventListener("input", () => {
      state.advanced.contourColor = elements.contourColorControl.value;
      scheduleRender();
    });
    elements.contourColorControl.addEventListener("change", finishControlChange);

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
    elements.themeMenuButton.addEventListener("click", cycleTheme);
    elements.settingsMenuButton.addEventListener("click", openSettingsModal);
    elements.settingsCloseButton.addEventListener("click", () => closeSettingsModal());
    elements.settingsDoneButton.addEventListener("click", () => closeSettingsModal());
    elements.settingsResetButton.addEventListener("click", restoreDefaultAppSettings);
    elements.settingsModal.addEventListener("pointerdown", (event) => {
      if (event.target === elements.settingsModal) closeSettingsModal();
    });
    [
      elements.settingsFrameRateControl,
      elements.settingsResolutionControl,
      elements.settingsVideoQualityControl,
      elements.settingsPreviewDetailControl,
      elements.settingsPauseHiddenToggle,
      elements.settingsRememberProjectToggle,
    ].forEach((control) => {
      control.addEventListener("change", () => updateAppSettingsFromControls());
    });
    elements.aboutMenuButton.addEventListener("click", openAboutModal);
    elements.aboutCloseButton.addEventListener("click", () => closeAboutModal());
    elements.aboutModal.addEventListener("pointerdown", (event) => {
      if (event.target === elements.aboutModal) closeAboutModal();
    });
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
      if (settingsModalIsOpen()) {
        if (event.key === "Escape") {
          event.preventDefault();
          closeSettingsModal();
          return;
        }
        trapSettingsModalFocus(event);
        return;
      }
      if (aboutModalIsOpen()) {
        if (event.key === "Escape") {
          event.preventDefault();
          closeAboutModal();
          return;
        }
        trapAboutModalFocus(event);
        // Keep application shortcuts inert while the modal is open. Browser
        // defaults such as Enter on the mail link or Tab within the dialog are
        // left untouched.
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
      if (event.key === "Delete" || event.key === "Backspace") {
        const active = event.target || document.activeElement;
        if (active?.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(active?.tagName)) return;
        if (state.selectedOriginId) {
          event.preventDefault();
          deleteSelectedOrigin();
          return;
        }
        if (
          freeformGeometry() &&
          ["select", "join"].includes(freeformEditor.tool) &&
          selectedFreeformPath()
        ) {
          event.preventDefault();
          deleteSelectedFreeformPath();
        }
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
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && appSettings.pauseWhenHidden && state?.playing) {
        stopAnimation();
        setStatus("Playback paused while the tab is hidden");
      }
    });
    window.addEventListener("beforeunload", () => {
      persistTemplateCacheNow();
      persistAppSettings();
    });
    window.matchMedia?.("(prefers-color-scheme: dark)")?.addEventListener?.("change", () => {
      if (themeMode === "system") applyTheme("system");
    });
    window.addEventListener("resize", scheduleRender);
  }

  function collectElements() {
    [
      "replicanvas-app",
      "dnaCanvas",
      "canvasFrame",
      "canvasLegend",
      "chromosomeRuler",
      "freeformTools",
      "freeformEditButton",
      "freeformSelectButton",
      "freeformDrawButton",
      "freeformEraseButton",
      "freeformEraserSize",
      "freeformEraserSizeControl",
      "freeformEraserSizeOutput",
      "freeformDeletePathButton",
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
      "themeMenuButton",
      "themeMenuIcon",
      "themeMenuValue",
      "settingsMenuButton",
      "settingsModal",
      "settingsCloseButton",
      "settingsFrameRateControl",
      "settingsResolutionControl",
      "settingsVideoQualityControl",
      "settingsPreviewDetailControl",
      "settingsPauseHiddenToggle",
      "settingsRememberProjectToggle",
      "settingsResetButton",
      "settingsDoneButton",
      "aboutMenuButton",
      "aboutModal",
      "aboutCloseButton",
      "exportPngButton",
      "exportSvgButton",
      "exportPdfButton",
      "exportMp4Button",
      "exportMp4Description",
      "deleteOriginsButton",
      "deleteBreaksButton",
      "playButton",
      "playIcon",
      "playLabel",
      "statusMessage",
      "selectionMessage",
      "modelControl",
      "geometryControl",
      "lengthControl",
      "fitGenomeToggle",
      "rightHandedToggle",
      "depthAwareColorSplitToggle",
      "progressControl",
      "pairResolutionControl",
      "basePairWidthControl",
      "weightControl",
      "doubleStrandHeightControl",
      "daughterSpacingControl",
      "newDnaStartDistanceControl",
      "strandPhaseShiftControl",
      "basePairTranslationControl",
      "basePairAngleControl",
      "transitionTightnessControl",
      "terminalSmoothingControl",
      "contourThicknessControl",
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
      "basePairTranslationOutput",
      "basePairAngleOutput",
      "transitionTightnessOutput",
      "terminalSmoothingOutput",
      "contourThicknessOutput",
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
      "contourColorControl",
      "contourThicknessOption",
      "contourColorOption",
      "pairsToggle",
      "newDnaToggle",
      "labelsToggle",
      "crossoverGapsToggle",
      "gridToggle",
      "centricGridToggle",
      "scaleBarToggle",
      "alwaysShowControlsToggle",
      "snapToBasePairsToggle",
      "includeExportBackgroundToggle",
      "contourToggle",
    ].forEach((id) => {
      const key = id === "dnaCanvas" ? "canvas" : id === "replicanvas-app" ? "app" : id;
      elements[key] = byId(id);
    });
  }

  function initialise() {
    collectElements();
    appSettings = storedAppSettings();
    applyTheme(storedThemeMode());
    templateCacheSuspended = true;
    state = cachedTemplateState() || makeDefaultState();
    state.playing = false;
    reseedNextOriginId(state);
    syncFreeformEditorFromState(state, { resetTool: true });
    viewState = fittedViewState(state);
    templateCacheSuspended = false;
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
