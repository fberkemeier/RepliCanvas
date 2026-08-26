const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const sourcePath = path.join(__dirname, "..", "assets", "js", "replicanvas.js");
const cssPath = path.join(__dirname, "..", "assets", "css", "replicanvas.css");
const htmlPath = path.join(__dirname, "..", "index.html");
const source = fs.readFileSync(sourcePath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");
const html = fs.readFileSync(htmlPath, "utf8");
const testApi = `
  globalThis.__replicanvasTest = {
    VIEW,
    TEMPLATE_CACHE_KEY,
    BASE_PLAYBACK_SPEED,
    SPEED_MULTIPLIER_RANGE,
    MAX_BASE_PAIR_COUNT,
    GRID_COLUMN_COUNT,
    MIN_ZOOM,
    APP_VERSION,
    APP_SETTINGS_DEFAULTS,
    advanceForkPlayback,
    animationExportAvailable,
    applyForkDragPosition,
    applyOriginDragPosition,
    absorbDormantOriginsDuringForkDrag,
    angledBasePairEndpoints,
    animationFrameRate,
    animationFramePlan,
    animationResolution,
    buildCircularRegions,
    artworkAspectTransform,
    artworkAspectX,
    artworkAspectY,
    artworkScaleX,
    artworkTransformComponents,
    transformedArtworkPoint,
    adaptivePathSampleStep,
    aspectFactorFromSlider,
    aspectSliderValue,
    artworkMarkup,
    artworkColour,
    backgroundLuminance,
    basePairAngle,
    basePairAngleLabel,
    basePairTranslation,
    basePairTranslationLabel,
    basePairColorMode,
    basePairCount,
    basePairIdentity,
    basePairLineColors,
    basePairDepthSplitFraction,
    basePairDistanceFade,
    basePairDisplayStep,
    basePairFraction,
    basePairLattice,
    basePairResolution,
    basePairStepFraction,
    basePairForkDistanceFade,
    basePairForkInfluence,
    basePairTransitionInfluence,
    basePairTransitionMode,
    backgroundControlColor,
    boundedControlValue,
    boundedLengthValue,
    bubbleFromBounds,
    canvasGridColor,
    canvasInkColor,
    circularGeometry,
    freeformGeometry,
    clearFreeformCanvasState,
    defaultFreeformWorkspace,
    freeformSnapToStartEnabled,
    freeformDraftCloseCandidate,
    freeformDraftSnapCandidate,
    freeformShapeSnapCandidate,
    freeformEndpointCandidates,
    nearestConnectableFreeformEndpoint,
    sameFreeformEndpoint,
    freeformTotalArcLength,
    captureFreeformLengthDensity,
    updateFreeformPathLengthFromDensity,
    captureFreeformTopology,
    updateFreeformLengthAfterTopologyChange,
    defaultStructuredWorkspace,
    captureActiveReplicationWorkspace,
    persistActiveReplicationWorkspace,
    switchGeometryWorkspace,
    serializableReplicationWorkspace,
    circularRadius,
    circularMinimumRenderedRadius,
    circularSafeRenderedRadius,
    circularRadialLayoutScale,
    renderedDaughterHalfSpacing,
    renderedDoubleStrandHalfHeight,
    circularRulerRadius,
    circularPolylinePath,
    circularHelixPhase,
    circularHelixAnchor,
    circularTurnCountAtLength,
    snapCircularEquivalent,
    snapCircularForkDragPosition,
    clockwiseFractionDistance,
    canvasBackgroundColor,
    contextGlyphMarkup,
    canvasActionAtPoint,
    configurationDocument,
    cachedTemplateState,
    persistTemplateCacheNow,
    scheduleTemplateCache,
    configuredBackgroundColor,
    contourEnabled,
    contourThickness,
    contourColor,
    contourStrokeWidth,
    connectedStrandShiftFraction,
    contourColor,
    contourEnabled,
    contourStrokeWidth,
    contourThickness,
    crossoverAIsOver,
    crossoverBridgeContourInset,
    crossoverClipHalfWidth,
    crossoverAIsOver,
    crossoverSites,
    crossoverCount,
    cutInteractionFraction,
    cutInteractionRange,
    cutRangesForGesture,
    periodicCutInteractionRange,
    cutRange,
    daughterDetailFade,
    doubleStrandHalfHeight,
    depthAwareBasePairSplit,
    discreteAnimationEnabled,
    dormantOriginAtCurrentTime,
    drawVideoFrame,
    darkArtworkEnabled,
    dnaHandedness,
    dnaHandedness,
    displayedBasePairPositions,
    effectiveForkTravel,
    effectiveTerminalSmoothing,
    encodeMp4WithMediabunnyCodec,
    findForkTravelForReplicatedFraction,
    fittedViewState,
    freeformArtworkBounds,
    freeformComponentState,
    freeformComponentLength,
    freeformComponentVisualState,
    freeformHelixParameters,
    freeformBasePairSites,
    structuredBasePairSites,
    freeformFractionToLocal,
    freeformLocalToFraction,
    freeformMetricAtFraction,
    freeformMetricById,
    freeformPathMetrics,
    freeformPathLength,
    freeformPathGenomicLength,
    freeformPointAtFraction,
    freeformCurvatureSafeOffset,
    freeformRenderedNormalOffset,
    freeformHelixDeformationEnvelope,
    freeformDeformationEnvelope,
    freeformDeformationFrameProfile,
    freeformDeformationAmountForBaseline,
    freeformRenderedFrame,
    freeformStrandBaselineOffset,
    freeformStrandDeformationAmount,
    freeformStrandNormalOffset,
    freeformStrandGeometryPoint,
    freeformStrandGeometryPointOnMetric,
    freeformHermitePathD,
    appendFreeformStrokePoint,
    resampleFreeformPoints,
    smoothFreeformPoints,
    roundFreeformCorners,
    freeformStrokeTolerance,
    prepareFreeformStroke,
    projectPointToFreeformMetric,
    freeformProjectionContinuityWindow,
    worldPointForFreeformPath,
    cubicFreeformPoint,
    cubicFreeformDerivative,
    freeformCenterlineCurves,
    freeformSplinePathD,
    freeformShapeHandles,
    freeformShapeControlBasis,
    freeformShapeCloseCandidate,
    reshapeFreeformNeighborhood,
    snapFreeformPathEnds,
    snapFreeformEndpointToPoint,
    smoothSnappedFreeformEndpoint,
    freeformPolylinePath,
    freeformRangeGuide,
    renderFreeformRuler,
    renderFreeformEditorOverlay,
    fixedUiTransform,
    fixedVideoSvgSource,
    forkCompletionTravel,
    forkDescriptors,
    forkTravelBounds,
    geometricForkTravelBounds,
    forksShouldCollapse,
    geometryMode,
    geometryHandednessOrientation,
    geometryPoint,
    geometryPointToLinear,
    getCircularReplicationModelAtTravel,
    getFreeformReplicationModelAtTravel,
    getReplicationModel,
    getReplicationModelAtTravel,
    gridStyle,
    genomicPositionAtFraction,
    genomeDistanceScale,
    gridColumnCount,
    gifColourCount,
    gifFrameDelayCentiseconds,
    gifFramePlan,
    gifFrameRate,
    gifLzwEncode,
    gifLoops,
    gifPaletteSpec,
    gifResolution,
    helixWave,
    insetBasePairSegment,
    invertHexColour,
    interactionHalfHeight,
    isCutGap,
    isUnderpassGap,
    isPlaybackSpaceShortcut,
    latticeSpanFraction,
    lengthMode,
    moleculeWidthForState,
    aboutModalIsOpen,
    openAboutModal,
    closeAboutModal,
    makeVideoExportState,
    manualForkMergeTolerance,
    maximumLengthForBasePairCount,
    makeDefaultState,
    makeOrigins,
    mergeOverlappingBubbleState,
    mergeOverlappingBubbleDuringDrag,
    minimalMergeClosureMetrics,
    minimalManualEndOvershootFraction,
    minimalManualEndOvershootFraction,
    minimalRegionEdgeTransitionWidth,
    minimalReplicationAt,
    modelSupportsDoubleStrandDetails,
    nascentSpan,
    newDnaDistanceInset,
    newDnaStartDistance,
    newDnaBasePairGrowthAt,
    newDnaVisibleAt,
    nascentY,
    numericalPathTangent,
    niceIntegerCeiling,
    normaliseAppSettings,
    normaliseFreeformState,
    normaliseStateSchema,
    normaliseExportStrokeWidths,
    normaliseGifBlob,
    normaliseMp4Blob,
    normaliseCutRegions,
    nextAvailableOriginId,
    nativeWebmMimeTypes,
    parentalPairApproachFade,
    parentalPairFade,
    periodicRegionAtPosition,
    parseConfigurationText,
    referenceBasePairSpacingPx,
    referenceBasePairSubdivisionCount,
    playbackSpeed,
    playbackSpeedFromMultiplier,
    playbackComplete,
    speedMultiplier,
    speedMultiplierLabel,
    overlappingBubbleCluster,
    rawBubbleBounds,
    rebaseOriginDragAfterMerge,
    replicationAt,
    replicationRegionsAtPosition,
    regionsShareComponent,
    replicationPathSampling,
    replicationTransitionAnchors,
    replicationModelForPercentage,
    replicatedFraction,
    renderBasePairLine,
    renderBasePairs,
    renderCentricGrid,
    renderCircularRuler,
    renderCrossoverOverpasses,
    renderCrossoverBridgePath,
    renderArtworkPath,
    renderArtworkPath,
    renderNascentDna,
    renderableReplicationRegions,
    reseedBasePairSequence,
    reset,
    resetMoleculeState,
    resizeGenomeLength,
    reseedNextOriginId,
    remuxWebmToMp4,
    rulerBasePairPosition,
    rulerMajorEvery,
    rulerTickIndices,
    rulerTickPosition,
    sampledPath,
    schematicNascentPathY,
    scaleBarEnabled,
    settingsModalIsOpen,
    schematicNascentStartProfile,
    saveGifBlob,
    saveMp4Blob,
    screenToWorld,
    setDragState(value) { dragState = value; },
    setFreeformEditor(value) { freeformEditor = { ...freeformEditor, ...value }; },
    getFreeformEditor() { return { ...freeformEditor }; },
    setElements(value) { Object.assign(elements, value); },
    setAppSettings(value) { appSettings = normaliseAppSettings(value); },
    getAppSettings() { return { ...appSettings }; },
    setRenderDetail(value) { renderDetailOverride = value; },
    setSPhaseTime,
    selectedForkDescriptor,
    setState(value) { state = value; syncViewGeometry(state); },
    getState() { return state; },
    setThemeMode(value) { themeMode = value; },
    getThemeMode() { return themeMode; },
    setVideoExportBusy,
    setVideoExportProgress,
    setViewState(value) { viewState = value; },
    getViewState() { return { ...viewState }; },
    shouldMergeCompletedBubbleDrag,
    smoothRunPath,
    snapEditingEnabled,
    syncViewGeometry,
    snapForkTravel,
    snapFractionToBasePair,
    subtractCutRange,
    addFreeformPath,
    addConnectedFreeformStroke,
    eraseFreeformPaths,
    freeformEraserRadius,
    joinFreeformEndpoints,
    splitBubbleClearancePx,
    splitBubbleGapSteps,
    splitCompatibleCenterFraction,
    splitBubbleDimensions,
    strandModel,
    strandPhaseShift,
    stateArtworkColour,
    supportedMp4MimeType,
    synchroniseSPhaseFromGeometry,
    synchroniseFreeformLengthFromPaths,
    templateY,
    terminalClosureBoundaryForFork,
    terminalClosureBlend,
    terminalEdgeBlend,
    terminalPullSpan,
    terminalSmoothing,
    terminalSmoothingLabel,
    toggleAnimation,
    stopAnimation,
    toolGuideBounds,
    transitionProfile,
    transitionTightness,
    transitionTightnessLabel,
    unreplicateRange,
    unreplicateRangePlan,
    unwrappedDragPointer,
    updateCanvasLegend,
    regionEdgeTransitionWidth,
    regionTransitionWidth,
    visualReplicationAt,
    videoBitsPerSecond,
    videoFramePlan,
    videoTravelAtFrame,
    createGifEncoder,
    quantizeGifPixels,
    withArtworkStrokeScale,
    artworkStrokeAttributes,
    wrapFraction,
    worldTransform,
  };
`;
const instrumented = source.replace(/\n\}\)\(\);\s*$/, `${testApi}\n})();`);
assert.notEqual(instrumented, source, "test API injection point must be found");

const sandbox = {
  Blob,
  cancelAnimationFrame() {},
  clearTimeout,
  console,
  createImageBitmap: async () => ({ close() {} }),
  document: {
    addEventListener() {},
    getElementById() {
      return null;
    },
    readyState: "loading",
  },
  performance,
  requestAnimationFrame() {
    return 1;
  },
  setTimeout,
  window: {
    addEventListener() {},
  },
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
new vm.Script(instrumented, { filename: sourcePath }).runInContext(sandbox);
const api = sandbox.__replicanvasTest;

function freshState() {
  const state = api.makeDefaultState();
  Object.assign(state, {
    length: 90,
    progress: 12,
    forkTravel: 0,
    pairResolution: 3,
    basePairWidth: 1.8,
    weight: 4,
    doubleStrandHeight: 24,
    daughterSpacing: 152,
    speed: 1,
    discreteAnimation: false,
    basePairColorMode: "single",
    basePairSeed: 0x51f15e,
    selectedOriginId: null,
    selectedFork: null,
  });
  state.advanced = {
    ...state.advanced,
    snapToBasePairs: false,
  };
  state.origins = [
    { id: "test-origin-1", position: 1 / 3, startPosition: 1 / 3, leftOffset: 0, rightOffset: 0 },
    { id: "test-origin-2", position: 2 / 3, startPosition: 2 / 3, leftOffset: 0, rightOffset: 0 },
  ];
  state.forkTravel = api.findForkTravelForReplicatedFraction(state.progress, state);
  state.playing = false;
  return state;
}

function freeformState(paths, origins = []) {
  const state = freshState();
  state.geometry = "freeform";
  state.freeform = {
    paths: paths.map((path) => ({
      id: path.id,
      closed: Boolean(path.closed),
      points: path.points.map((point) => ({ ...point })),
      ...(Number.isFinite(Number(path.genomicLength))
        ? { genomicLength: Number(path.genomicLength) }
        : {}),
    })),
    selectedPathId: paths[0]?.id || null,
  };
  state.origins = origins.map((origin) => ({ ...origin }));
  state.cuts = [];
  state.forkTravel = 0;
  state.progress = 0;
  api.normaliseStateSchema(state);
  return state;
}

function cubicSegments(pathData) {
  const start = /^M(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/.exec(pathData);
  assert.ok(start, "path must begin with an SVG move");
  let from = { x: Number(start[1]), y: Number(start[2]) };
  return [...pathData.matchAll(/C(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g)].map(
    (match) => {
      const segment = {
        from,
        control1: { x: Number(match[1]), y: Number(match[2]) },
        control2: { x: Number(match[3]), y: Number(match[4]) },
        to: { x: Number(match[5]), y: Number(match[6]) },
      };
      from = segment.to;
      return segment;
    }
  );
}

function renderedCubicYAtX(pathData, x) {
  const segment = cubicSegments(pathData).find(
    (candidate) => x >= candidate.from.x - 1e-7 && x <= candidate.to.x + 1e-7
  );
  assert.ok(segment, `rendered path must contain x=${x}`);
  const width = segment.to.x - segment.from.x;
  const t = width <= 1e-9 ? 0 : Math.min(1, Math.max(0, (x - segment.from.x) / width));
  const inverse = 1 - t;
  return (
    inverse ** 3 * segment.from.y +
    3 * inverse ** 2 * t * segment.control1.y +
    3 * inverse * t ** 2 * segment.control2.y +
    t ** 3 * segment.to.y
  );
}

test("base-pair resolution keeps N strict interiors between crossover-anchored lattice sites", () => {
  const state = freshState();
  state.length = 90;
  api.setState(state);
  const crossovers = Math.round((state.length / 10) * 2);
  const sampleXs = Array.from(
    { length: 41 },
    (_, index) => api.VIEW.x0 + (index / 40) * api.VIEW.moleculeWidth
  );
  let referenceWave = null;

  for (let resolution = 1; resolution <= 10; resolution += 1) {
    state.pairResolution = resolution;
    const subdivisions = resolution + 1;
    const lattice = crossovers * subdivisions;
    const phase = resolution % 2 === 0 ? 0.5 : 0;
    const genomicMaximum = lattice - phase * 2;
    const positions = api.displayedBasePairPositions();

    const observedLattice = api.basePairLattice();
    assert.equal(observedLattice.subdivisionCount, lattice);
    assert.equal(observedLattice.edgeOffset, phase);
    assert.equal(observedLattice.count, genomicMaximum);
    assert.equal(api.basePairCount(), genomicMaximum);
    assert.equal(api.basePairDisplayStep(), 1);
    assert.equal(positions[0], 0);
    assert.equal(positions.at(-1), genomicMaximum);
    assert.equal(positions.length, genomicMaximum + 1);
    assert.ok(positions.every(Number.isInteger), "each rendered pair/tick must represent an integer base pair");
    assert.ok(positions.every((position, index) => position === index));

    const fractions = positions.map((index) => api.basePairFraction(index));
    assert.ok(Math.abs(fractions[0] - phase / lattice) < 1e-12);
    assert.ok(Math.abs(fractions.at(-1) - (1 - phase / lattice)) < 1e-12);
    assert.ok(Math.abs(fractions[0] + fractions.at(-1) - 1) < 1e-12, "edge insets must be centred");
    assert.ok(
      fractions.slice(1).every((fraction, index) => Math.abs(fraction - fractions[index] - 1 / lattice) < 1e-12),
      "all base-pair sites must remain equally spaced"
    );

    for (let crossover = 0; crossover < crossovers; crossover += 1) {
      const crossoverFraction = (crossover + 0.5) / crossovers;
      const rawCrossoverIndex = crossoverFraction * lattice - phase;
      const crossoverIndex = Math.round(rawCrossoverIndex);
      assert.ok(
        Math.abs(rawCrossoverIndex - crossoverIndex) < 1e-9,
        "every strand crossover must lie on the base-pair lattice"
      );
      assert.ok(Math.abs(api.basePairFraction(crossoverIndex) - crossoverFraction) < 1e-12);

      if (crossover === crossovers - 1) continue;
      const nextCrossoverIndex = crossoverIndex + subdivisions;
      const strictInteriors = positions.filter(
        (position) => position > crossoverIndex && position < nextCrossoverIndex
      );
      assert.equal(strictInteriors.length, resolution, "the control value is the strict interior site count");

      const midpointFraction = (crossover + 1) / crossovers;
      const hasMidpointSite = fractions.some((fraction) => Math.abs(fraction - midpointFraction) < 1e-12);
      assert.equal(hasMidpointSite, resolution % 2 === 1, "only odd resolutions place a site at the midpoint");
    }

    positions.forEach((position) => {
      assert.equal(api.genomicPositionAtFraction(api.basePairFraction(position)), position);
    });
    assert.equal(api.genomicPositionAtFraction(0), 0);
    assert.equal(api.genomicPositionAtFraction(1), genomicMaximum);

    const wave = sampleXs.map((x) => api.helixWave(x));
    if (referenceWave) assert.deepEqual(wave, referenceWave, "resolution must never move the template strands");
    else referenceWave = wave;
  }

  state.pairResolution = 2;
  assert.equal(api.basePairLattice().subdivisionCount, crossovers * 3);
  assert.equal(api.basePairCount(), crossovers * 3 - 1);
  assert.equal(api.displayedBasePairPositions().length, crossovers * 3);
  assert.ok(Math.abs(api.basePairFraction(0) - 0.5 / (crossovers * 3)) < 1e-12);
  assert.ok(Math.abs(api.basePairFraction(api.basePairCount()) - (1 - 0.5 / (crossovers * 3))) < 1e-12);

  state.origins = [];
  const renderedXs = [...api.renderBasePairs(api.getReplicationModel()).matchAll(/<line x1="([\d.-]+)"/g)].map(
    (match) => Number(match[1])
  );
  const firstCrossoverX = api.VIEW.x0 + (0.5 / crossovers) * api.VIEW.moleculeWidth;
  const secondCrossoverX = api.VIEW.x0 + (1.5 / crossovers) * api.VIEW.moleculeWidth;
  const midpointX = (firstCrossoverX + secondCrossoverX) / 2;
  const firstIntervalRungs = renderedXs.filter((x) => x > firstCrossoverX && x < secondCrossoverX);
  assert.equal(firstIntervalRungs.length, 2, "resolution 2 must render exactly two rungs in a full crossover interval");
  assert.ok(
    firstIntervalRungs.every((x) => Math.abs(x - midpointX) > 0.1),
    "an even resolution must not render a midpoint rung"
  );
});

test("editing snaps to the centred parity-aware base-pair lattice", () => {
  const state = freshState();
  state.advanced.snapToBasePairs = true;

  for (let resolution = 1; resolution <= 10; resolution += 1) {
    state.pairResolution = resolution;
    const lattice = api.basePairLattice(state);
    for (const fraction of [0, 0.017, 0.245, 0.5, 0.781, 0.999, 1]) {
      const snapped = api.snapFractionToBasePair(fraction, state);
      const index = api.genomicPositionAtFraction(snapped, state);
      assert.ok(Number.isInteger(index));
      assert.ok(Math.abs(snapped - api.basePairFraction(index, state)) < 1e-12);
    }
    assert.ok(Math.abs(api.basePairStepFraction(state) - 1 / lattice.subdivisionCount) < 1e-12);
    if (resolution % 2 === 0) {
      assert.ok(api.snapFractionToBasePair(0, state) > 0);
      assert.ok(api.snapFractionToBasePair(1, state) < 1);
    } else {
      assert.equal(api.snapFractionToBasePair(0, state), 0);
      assert.equal(api.snapFractionToBasePair(1, state), 1);
    }
  }

  state.pairResolution = 3;
  const step = api.basePairStepFraction(state);
  const site = api.basePairFraction(17, state);
  assert.equal(api.snapFractionToBasePair(site + step * 0.2, state, { min: site, max: site }), site);
  assert.equal(
    api.snapFractionToBasePair(site + step / 2, state, { min: site + step * 0.2, max: site + step * 0.8 }),
    null,
    "an interval containing no base-pair site must not create a continuous fallback"
  );
});

test("the attached 40-bp geometry starts at zero S phase with continuous editing", () => {
  const state = JSON.parse(JSON.stringify(api.makeDefaultState()));
  assert.equal(state.length, 50);
  assert.equal(api.basePairCount(state), 40);
  assert.equal(state.progress, 0);
  assert.equal(state.forkTravel, 0);
  assert.equal(state.pairResolution, 3);
  assert.equal(state.basePairWidth, 5);
  assert.equal(state.weight, 6);
  assert.equal(state.doubleStrandHeight, 46);
  assert.equal(state.daughterSpacing, 160);
  assert.equal(state.speed, 2.75);
  assert.equal(state.discreteAnimation, false);
  assert.equal(state.basePairColorMode, "single");
  assert.equal(state.basePairSeed, 3815474507);
  assert.equal(state.advanced.snapToBasePairs, false);
  assert.equal(state.advanced.backgroundColor, "#f8faf9");
  assert.deepEqual(state.origins, [
    {
      id: "origin-6",
      position: 0.3,
      startPosition: 0.3,
      leftOffset: 0,
      rightOffset: 0,
    },
    {
      id: "origin-5",
      position: 0.7,
      startPosition: 0.7,
      leftOffset: 0,
      rightOffset: 0,
    },
  ]);
  assert.equal(state.selectedOriginId, "origin-6");
  assert.equal(state.selectedFork, null);
  assert.equal(api.replicatedFraction(api.getReplicationModelAtTravel(state.forkTravel, state)), 0);
});

test("the two initial origins are centred on integer base-pair sites", () => {
  const state = freshState();
  assert.deepEqual(
    Array.from(state.origins, (origin) => api.genomicPositionAtFraction(origin.startPosition, state)),
    [24, 48]
  );
  state.origins.forEach((origin) => {
    const index = api.genomicPositionAtFraction(origin.startPosition, state);
    assert.ok(Math.abs(origin.startPosition - api.basePairFraction(index, state)) < 1e-12);
  });
});

test("snapped bubble and fork drags preserve exact geometry on lattice sites", () => {
  const state = freshState();
  state.advanced.snapToBasePairs = true;
  state.forkTravel = api.basePairStepFraction(state) * 4;
  state.origins = [
    {
      id: "snap-drag",
      position: api.basePairFraction(36, state),
      startPosition: api.basePairFraction(36, state),
      leftOffset: 0,
      rightOffset: 0,
    },
  ];
  api.setState(state);
  api.setViewState({ zoom: 1, panX: 0, panY: 0 });
  let geometry = api.getReplicationModelAtTravel(state.forkTravel, state).origins[0];
  const forkDrag = {
    role: "fork",
    side: "left",
    originId: "snap-drag",
    pairedForks: true,
    leftPosition: geometry.leftPosition,
    rightPosition: geometry.rightPosition,
    collapsePending: false,
  };
  const fixedRight = geometry.rightPosition;
  const requested = (api.basePairFraction(34, state) + api.basePairFraction(35, state)) / 2 - 1e-5;
  const result = api.applyForkDragPosition(forkDrag, requested, state);
  assert.ok(result);
  geometry = api.getReplicationModelAtTravel(state.forkTravel, state).origins[0];
  assert.ok(Math.abs(geometry.leftPosition - api.basePairFraction(34, state)) < 1e-12);
  assert.equal(geometry.rightPosition, fixedRight, "the fork not being dragged must not move");
  assert.ok(
    Math.abs(
      state.origins[0].startPosition -
        api.basePairFraction(api.genomicPositionAtFraction(state.origins[0].startPosition, state), state)
    ) < 1e-12
  );

  geometry = api.getReplicationModelAtTravel(state.forkTravel, state).origins[0];
  const originDrag = {
    role: "origin",
    originId: "snap-drag",
    moved: false,
    startPointerPosition: state.origins[0].startPosition,
    originStartPosition: state.origins[0].startPosition,
    originLeftOffset: state.origins[0].leftOffset,
    originRightOffset: state.origins[0].rightOffset,
    minimumTranslation: -geometry.leftPosition,
    maximumTranslation: 1 - geometry.rightPosition,
  };
  const dragged = api.applyOriginDragPosition(originDrag, originDrag.startPointerPosition + api.basePairStepFraction(state) * 1.4, state);
  assert.ok(dragged);
  const draggedIndex = api.genomicPositionAtFraction(dragged.origin.startPosition, state);
  assert.ok(Math.abs(dragged.origin.startPosition - api.basePairFraction(draggedIndex, state)) < 1e-12);

  const start = api.basePairFraction(10, state);
  const end = api.basePairFraction(31, state);
  const snappedBubble = api.bubbleFromBounds(start, end, state);
  const bounds = api.rawBubbleBounds(snappedBubble, state);
  assert.ok(Math.abs(bounds.start - start) < 1e-12);
  assert.ok(Math.abs(bounds.end - end) < 1e-12);
  assert.ok(
    Math.abs(
      snappedBubble.startPosition -
        api.basePairFraction(api.genomicPositionAtFraction(snappedBubble.startPosition, state), state)
    ) < 1e-12
  );
});

test("ruler uses the centred parity-aware lattice and its integer genomic coordinates", () => {
  const state = freshState();
  api.setState(state);
  for (let length = 10; length <= 400; length += 5) {
    for (let resolution = 1; resolution <= 10; resolution += 1) {
      state.length = length;
      state.pairResolution = resolution;
      const lattice = Math.round((length / 10) * 2) * (resolution + 1);
      const phase = resolution % 2 === 0 ? 0.5 : 0;
      const genomicMaximum = lattice - phase * 2;
      const start = -137.5;
      const end = 1284.25;
      const pairSpacing = (end - start) / lattice;
      const majorEvery = api.rulerMajorEvery(pairSpacing);

      const observedLattice = api.basePairLattice();
      assert.equal(observedLattice.subdivisionCount, lattice);
      assert.equal(observedLattice.edgeOffset, phase);
      assert.equal(observedLattice.count, genomicMaximum);
      assert.equal(api.basePairCount(), genomicMaximum);
      assert.ok(Number.isInteger(majorEvery) && majorEvery >= 1);
      for (const index of api.displayedBasePairPositions()) {
        assert.equal(api.rulerBasePairPosition(index), index);
        assert.equal(api.genomicPositionAtFraction(api.basePairFraction(index)), index);
        assert.ok(
          Math.abs(api.rulerTickPosition(index, start, end) - (start + api.basePairFraction(index) * (end - start))) <
            1e-9
        );
      }
      assert.equal(api.rulerBasePairPosition(genomicMaximum), genomicMaximum);
      const ticks = api.rulerTickIndices(majorEvery);
      assert.equal(ticks[0], 0);
      assert.equal(ticks.at(-1), genomicMaximum);
      assert.ok(ticks.slice(1, -1).every((index) => index % majorEvery === 0));
      assert.ok(ticks.slice(1).every((index, tickIndex) => index > ticks[tickIndex]));

      const expectedStart = start + phase * pairSpacing;
      const expectedEnd = end - phase * pairSpacing;
      assert.ok(Math.abs(api.rulerTickPosition(0, start, end) - expectedStart) < 1e-9);
      assert.ok(Math.abs(api.rulerTickPosition(genomicMaximum, start, end) - expectedEnd) < 1e-9);
      assert.ok(
        Math.abs(
          api.rulerTickPosition(0, start, end) + api.rulerTickPosition(genomicMaximum, start, end) - (start + end)
        ) < 1e-9,
        "the ruler must shrink symmetrically around the unchanged molecule"
      );
    }
  }
});

test("base-pair resolution snapshots migrate to a bounded integer interior count", () => {
  assert.equal(api.basePairResolution({ pairResolution: 2 }), 2);
  assert.equal(api.basePairResolution({ pairResolution: 2.6 }), 3);
  assert.equal(api.basePairResolution({ pairResolution: 0 }), 1);
  assert.equal(api.basePairResolution({ pairResolution: 99 }), 10);
  assert.equal(api.basePairResolution({ pairResolution: "invalid" }), 3);

  const low = api.normaliseStateSchema({ pairResolution: -4 });
  const high = api.normaliseStateSchema({ pairResolution: 12 });
  const missing = api.normaliseStateSchema({});
  assert.equal(low.pairResolution, 1);
  assert.equal(high.pairResolution, 10);
  assert.equal(missing.pairResolution, 3);
});

test("range-backed settings normalise imported values to the supported safe bounds", () => {
  const low = api.normaliseStateSchema({
    length: -10,
    progress: -1,
    pairResolution: -3,
    basePairWidth: 0,
    weight: 0,
    daughterSpacing: 1,
    doubleStrandHeight: 1,
    speed: 0.01,
    advanced: { terminalSmoothing: -10, transitionTightness: -1000, basePairTranslation: -20 },
  });
  assert.equal(low.length, 10);
  assert.equal(low.progress, 0);
  assert.equal(low.pairResolution, 1);
  assert.equal(low.basePairWidth, 0.2);
  assert.equal(low.weight, 1);
  assert.equal(low.daughterSpacing, 64);
  assert.equal(low.doubleStrandHeight, 8);
  assert.equal(low.speed, 2.75 * 0.25);
  assert.equal(low.advanced.terminalSmoothing, 0);
  assert.equal(low.advanced.transitionTightness, -100);
  assert.equal(low.advanced.basePairTranslation, -5);

  const high = api.normaliseStateSchema({
    length: 1000,
    progress: 101,
    pairResolution: 100,
    basePairWidth: 20,
    weight: 20,
    daughterSpacing: 1000,
    doubleStrandHeight: 100,
    speed: 50,
    advanced: { terminalSmoothing: 99, transitionTightness: 1000, basePairTranslation: 20 },
  });
  assert.equal(high.length, 225);
  assert.equal(high.progress, 100);
  assert.equal(high.pairResolution, 10);
  assert.equal(high.basePairWidth, 16);
  assert.equal(high.weight, 20);
  assert.equal(high.daughterSpacing, 800);
  assert.equal(high.doubleStrandHeight, 100);
  assert.equal(high.speed, 2.75 * 3);
  assert.equal(high.advanced.terminalSmoothing, 6);
  assert.equal(high.advanced.transitionTightness, 100);
  assert.equal(high.advanced.basePairTranslation, 5);

  const invalid = api.normaliseStateSchema({
    length: "invalid",
    progress: NaN,
    pairResolution: null,
    basePairWidth: undefined,
    weight: Infinity,
    daughterSpacing: "invalid",
    doubleStrandHeight: NaN,
    speed: 0,
    advanced: {
      terminalSmoothing: "invalid",
      transitionTightness: "invalid",
      basePairTranslation: "invalid",
    },
  });
  assert.equal(invalid.length, 50);
  assert.equal(invalid.progress, 0);
  assert.equal(invalid.pairResolution, 1);
  assert.equal(invalid.basePairWidth, 5);
  assert.equal(invalid.weight, 6);
  assert.equal(invalid.daughterSpacing, 160);
  assert.equal(invalid.doubleStrandHeight, 46);
  assert.equal(invalid.speed, 2.75);
  assert.equal(invalid.advanced.terminalSmoothing, 1.5);
  assert.equal(invalid.advanced.transitionTightness, 0);
  assert.equal(invalid.advanced.basePairTranslation, 0);

  assert.equal(api.playbackSpeed({ speed: -1 }), 2.75, "legacy non-positive speeds use the default");
  assert.equal(api.playbackSpeed({ speed: 99 }), 2.75 * 3);
  assert.equal(api.boundedControlValue("length", 2000), 1250);
  assert.equal(api.boundedLengthValue(2000, { pairResolution: 10, length: 90 }), 225);
});

test("ruler ticks remain anchored to genomic coordinates under pan and zoom", () => {
  const state = freshState();
  state.length = 90;
  state.pairResolution = 3;
  api.setState(state);
  const genomicLength = api.basePairCount();
  for (const [start, end] of [
    [48, 1152],
    [-410, 1798],
    [325, 877],
  ]) {
    assert.equal(api.rulerTickPosition(0, start, end), start);
    assert.equal(api.rulerTickPosition(genomicLength, start, end), end);
    assert.ok(
      Math.abs(api.rulerTickPosition(genomicLength / 3, start, end) - (start + (end - start) / 3)) < 1e-9
    );
  }
});

test("all resolutions permit up to 500 rendered base pairs without exceeding the density budget", () => {
  for (let resolution = 1; resolution <= 10; resolution += 1) {
    const state = api.normaliseStateSchema({
      ...freshState(),
      length: 10000,
      pairResolution: resolution,
      basePairWidth: 7,
      weight: 8,
      daughterSpacing: 400,
      doubleStrandHeight: 56,
    });
    api.setState(state);
    assert.equal(state.length, api.maximumLengthForBasePairCount(state));
    assert.ok(api.basePairCount() <= api.MAX_BASE_PAIR_COUNT, `resolution ${resolution} exceeded 500 bp`);
    assert.ok(api.basePairCount() >= 480, `resolution ${resolution} should retain nearly the full 500-bp range`);
  }

  const state = api.normaliseStateSchema({
    ...freshState(),
    length: 10000,
    pairResolution: 3,
    basePairWidth: 7,
    weight: 8,
    daughterSpacing: 400,
    doubleStrandHeight: 56,
    forkTravel: 0.2,
  });
  api.setState(state);
  assert.equal(state.length, 625);
  assert.equal(api.basePairCount(), 500);
  assert.equal(api.displayedBasePairPositions().length, 501);

  const labelledTicks = api.rulerTickIndices(api.rulerMajorEvery(7.25));
  assert.ok(labelledTicks.length < 501);
  assert.equal(labelledTicks[0], 0);
  assert.equal(labelledTicks.at(-1), 500);

  const model = api.getReplicationModel();
  const pairs = api.renderBasePairs(model);
  const artwork = api.artworkMarkup(model);
  const rungCount = (pairs.match(/<line\b/g) || []).length;
  assert.ok(rungCount > 0);
  assert.ok(rungCount <= 501 * 3, "each genomic site can render at most one parental and two daughter rungs");
  assert.doesNotMatch(artwork, /(?:NaN|Infinity)/);

  const halfStroke = state.weight / 2;
  for (let index = 0; index <= 80; index += 1) {
    const x = api.VIEW.x0 + (index / 80) * api.VIEW.moleculeWidth;
    for (const y of [
      api.templateY(x, "a", model),
      api.templateY(x, "b", model),
      api.nascentY(x, "top", model),
      api.nascentY(x, "bottom", model),
    ]) {
      assert.ok(y >= halfStroke && y <= api.VIEW.height - halfStroke, `maximum-range strand escaped at x=${x}`);
    }
  }
});

test("interaction height is exactly the configured replicated spacing", () => {
  const state = freshState();
  state.daughterSpacing = 64;
  api.setState(state);
  assert.equal(api.interactionHalfHeight(), 32);
  state.daughterSpacing = 240;
  assert.equal(api.interactionHalfHeight(), 120);
});

test("cut ranges normalize reverse drags and merge overlaps", () => {
  const ranges = api.normaliseCutRegions([
    { start: 0.6, end: 0.2 },
    { start: 0.5, end: 0.8 },
    { start: 0.9, end: 0.9 },
  ]);
  assert.equal(ranges.length, 2);
  assert.equal(ranges[0].start, 0.2);
  assert.equal(ranges[0].end, 0.8);
  assert.equal(ranges[1].start, 0.9);
  assert.equal(ranges[1].end, 0.9);
});

test("a dragged cut removes the whole selected interval", () => {
  const state = freshState();
  state.cuts = [{ start: 0.25, end: 0.5 }];
  api.setState(state);
  api.setDragState(null);
  const inside = api.VIEW.x0 + 0.4 * api.VIEW.moleculeWidth;
  const outside = api.VIEW.x0 + 0.7 * api.VIEW.moleculeWidth;
  assert.equal(api.isCutGap(inside), true);
  assert.equal(api.isCutGap(outside), false);
});

test("default S-phase percentage equals the actual replicated fraction", () => {
  const state = freshState();
  api.setState(state);
  assert.ok(Math.abs(api.replicatedFraction(api.getReplicationModel()) - state.progress) < 1e-8);
  assert.equal(state.progress, 12);
});

test("S-phase changes preserve manual fork offsets and move smoothly", () => {
  const state = freshState();
  state.origins = [
    {
      id: "origin-manual",
      position: 0.5,
      startPosition: 0.5,
      leftOffset: -0.05,
      rightOffset: 0.1,
    },
  ];
  api.setState(state);
  api.synchroniseSPhaseFromGeometry();
  const before = api.getReplicationModel().origins[0];
  const target = state.progress + 1;

  api.setSPhaseTime(target);
  const after = api.getReplicationModel().origins[0];

  assert.equal(state.origins[0].leftOffset, -0.05);
  assert.equal(state.origins[0].rightOffset, 0.1);
  assert.ok(Math.abs(after.leftPosition - before.leftPosition) < 0.02);
  assert.ok(Math.abs(after.rightPosition - before.rightPosition) < 0.02);
});

test("S-phase time can return to zero without discarding manual fork offsets", () => {
  const state = freshState();
  state.progress = 35;
  state.origins = [
    {
      id: "origin-manual",
      position: 0.5,
      startPosition: 0.5,
      leftOffset: 0.08,
      rightOffset: 0.12,
    },
  ];
  api.setState(state);

  api.setSPhaseTime(0);

  assert.equal(state.progress, 0);
  assert.equal(state.origins[0].leftOffset, 0.08);
  assert.equal(state.origins[0].rightOffset, 0.12);
  assert.equal(api.replicatedFraction(api.getReplicationModel()), 0);
});

test("every S-phase target from zero to one hundred matches replicated DNA", () => {
  const state = freshState();
  state.origins[0].leftOffset = 0.09;
  state.origins[0].rightOffset = -0.04;
  state.origins[1].leftOffset = -0.12;
  state.origins[1].rightOffset = 0.06;
  api.setState(state);
  let previousTravel = -Infinity;

  for (let target = 0; target <= 100; target += 1) {
    api.setSPhaseTime(target);
    const actual = api.replicatedFraction(api.getReplicationModel());
    assert.ok(Math.abs(actual - target) < 1e-7, `${target}% target produced ${actual}%`);
    assert.ok(state.forkTravel >= previousTravel - 1e-10, "fork travel must remain monotonic");
    previousTravel = state.forkTravel;
  }
});

test("playback keeps each fork at a constant world speed as the active-fork count changes", () => {
  const single = freshState();
  single.origins = [{ id: "single", position: 0.5, startPosition: 0.5, leftOffset: 0, rightOffset: 0 }];
  single.forkTravel = 0.04;
  single.progress = api.replicatedFraction(api.getReplicationModelAtTravel(single.forkTravel, single));

  const many = freshState();
  many.origins = [
    { id: "first", position: 0.2, startPosition: 0.2, leftOffset: 0, rightOffset: 0 },
    { id: "second", position: 0.5, startPosition: 0.5, leftOffset: 0, rightOffset: 0 },
    { id: "third", position: 0.8, startPosition: 0.8, leftOffset: 0, rightOffset: 0 },
  ];
  many.forkTravel = 0.04;
  many.progress = api.replicatedFraction(api.getReplicationModelAtTravel(many.forkTravel, many));

  const singleBefore = api.getReplicationModelAtTravel(single.forkTravel, single);
  const manyBefore = api.getReplicationModelAtTravel(many.forkTravel, many);
  const singleProgressBefore = single.progress;
  const manyProgressBefore = many.progress;
  assert.equal(singleBefore.activeForkCount, 2);
  assert.equal(manyBefore.activeForkCount, 6);

  const singleAfter = api.advanceForkPlayback(500, single);
  const manyAfter = api.advanceForkPlayback(500, many);
  const singleWorldTravel =
    (singleAfter.origins[0].rightPosition - singleBefore.origins[0].rightPosition) * api.VIEW.moleculeWidth;
  const manyWorldTravel =
    (manyAfter.origins[1].rightPosition - manyBefore.origins[1].rightPosition) * api.VIEW.moleculeWidth;

  assert.ok(Math.abs(singleWorldTravel - manyWorldTravel) < 1e-9);
  assert.ok(singleWorldTravel > 0);
  assert.ok(many.progress - manyProgressBefore > single.progress - singleProgressBefore);
  assert.ok(Math.abs(single.progress - api.replicatedFraction(singleAfter)) < 1e-9);
  assert.ok(Math.abs(many.progress - api.replicatedFraction(manyAfter)) < 1e-9);
});

test("discrete S-phase and playback advance on accumulated one-base-pair steps", () => {
  const continuous = freshState();
  continuous.origins = [
    { id: "rate", position: 0.5, startPosition: 0.5, leftOffset: 0, rightOffset: 0 },
  ];
  api.setSPhaseTime(0, continuous);
  const continuousStart = continuous.forkTravel;
  api.advanceForkPlayback(1000, continuous);
  const travelPerMillisecond = (continuous.forkTravel - continuousStart) / 1000;

  const state = freshState();
  state.origins = [
    { id: "discrete", position: 0.5, startPosition: 0.5, leftOffset: -0.03, rightOffset: 0.02 },
  ];
  state.discreteAnimation = true;
  api.setSPhaseTime(0, state);
  const bounds = api.forkTravelBounds(state);
  const step = api.basePairStepFraction(state);
  const startTravel = state.forkTravel;
  const offsetsBefore = state.origins.map(({ leftOffset, rightOffset }) => [leftOffset, rightOffset]);
  const millisecondsPerStep = step / travelPerMillisecond;

  api.advanceForkPlayback(millisecondsPerStep * 0.3, state);
  api.advanceForkPlayback(millisecondsPerStep * 0.3, state);
  api.advanceForkPlayback(millisecondsPerStep * 0.3, state);
  assert.ok(Math.abs(state.forkTravel - startTravel) < 1e-12, "sub-step frame time must accumulate without moving");
  const beforeJump = api.getReplicationModelAtTravel(state.forkTravel, state);
  api.advanceForkPlayback(millisecondsPerStep * 0.2, state);
  const afterJump = api.getReplicationModelAtTravel(state.forkTravel, state);
  assert.ok(Math.abs(state.forkTravel - startTravel - step) < 1e-10);
  assert.ok(
    Math.abs(afterJump.origins[0].rightPosition - beforeJump.origins[0].rightPosition - step) < 1e-10
  );
  assert.deepEqual(
    state.origins.map(({ leftOffset, rightOffset }) => [leftOffset, rightOffset]),
    offsetsBefore,
    "discrete playback must preserve firing and manual-offset timing"
  );

  for (const target of [0, 7, 24, 51, 83, 100]) {
    api.setSPhaseTime(target, state);
    assert.ok(Math.abs(state.progress - api.replicatedFraction(api.getReplicationModelAtTravel(state.forkTravel, state))) < 1e-9);
    if (target === 0) assert.equal(state.forkTravel, bounds.zero);
    else if (target === 100) assert.equal(state.forkTravel, bounds.full);
    else {
      const steps = (state.forkTravel - bounds.zero) / step;
      assert.ok(Math.abs(steps - Math.round(steps)) < 1e-9);
    }
  }
});

test("discrete animation quantizes delayed forks from their own firing time", () => {
  const state = freshState();
  state.discreteAnimation = true;
  state.forkTravel = 0;
  state.origins = [
    { id: "early", position: 0.25, startPosition: 0.25, leftOffset: 0, rightOffset: 0 },
    { id: "delayed", position: 0.75, startPosition: 0.75, leftOffset: -0.005, rightOffset: -0.005 },
  ];
  const step = api.basePairStepFraction(state);
  const offsetsBefore = state.origins.map(({ leftOffset, rightOffset }) => [leftOffset, rightOffset]);

  assert.equal(
    api.effectiveForkTravel(0.00005, 0, state),
    0,
    "a positive sub-step remainder must not leak into discrete fork geometry"
  );
  const subStepModel = api.getReplicationModelAtTravel(0.00005, state);
  const earlyBeforeFullStep = subStepModel.origins.find((origin) => origin.id === "early");
  assert.equal(earlyBeforeFullStep.leftPosition, earlyBeforeFullStep.startPosition);
  assert.equal(earlyBeforeFullStep.rightPosition, earlyBeforeFullStep.startPosition);

  const firstClockStep = api.getReplicationModelAtTravel(step, state);
  const delayedBeforeFirstFullStep = firstClockStep.origins.find((origin) => origin.id === "delayed");
  assert.equal(delayedBeforeFirstFullStep.leftPosition, delayedBeforeFirstFullStep.startPosition);
  assert.equal(delayedBeforeFirstFullStep.rightPosition, delayedBeforeFirstFullStep.startPosition);

  const secondClockStep = api.getReplicationModelAtTravel(step * 2, state);
  const delayedAfterFirstFullStep = secondClockStep.origins.find((origin) => origin.id === "delayed");
  assert.ok(
    Math.abs(delayedAfterFirstFullStep.startPosition - delayedAfterFirstFullStep.leftPosition - step) < 1e-10
  );
  assert.ok(
    Math.abs(delayedAfterFirstFullStep.rightPosition - delayedAfterFirstFullStep.startPosition - step) < 1e-10
  );
  secondClockStep.origins.forEach((origin) => {
    [origin.leftPosition, origin.rightPosition].forEach((position) => {
      const index = api.genomicPositionAtFraction(position, state);
      assert.ok(Math.abs(api.basePairFraction(index, state) - position) < 1e-10);
    });
  });
  assert.deepEqual(
    state.origins.map(({ leftOffset, rightOffset }) => [leftOffset, rightOffset]),
    offsetsBefore,
    "per-fork quantization must not rewrite origin firing offsets"
  );

  const continuous = structuredClone(state);
  continuous.discreteAnimation = false;
  const continuousDelayed = api
    .getReplicationModelAtTravel(step, continuous)
    .origins.find((origin) => origin.id === "delayed");
  assert.ok(continuousDelayed.rightPosition > continuousDelayed.startPosition);
  assert.ok(continuousDelayed.rightPosition - continuousDelayed.startPosition < step);
});

test("discrete even-resolution forks and MP4 reach exact chromosome endpoints", () => {
  const state = freshState();
  state.discreteAnimation = true;
  state.pairResolution = 2;
  const middleIndex = Math.round(api.basePairCount(state) / 2);
  const originPosition = api.basePairFraction(middleIndex, state);
  state.origins = [
    {
      id: "even-terminal",
      position: originPosition,
      startPosition: originPosition,
      leftOffset: -0.004,
      rightOffset: 0.003,
    },
  ];

  api.setSPhaseTime(100, state);
  const completed = api.getReplicationModelAtTravel(state.forkTravel, state);
  assert.equal(completed.origins[0].leftPosition, 0);
  assert.equal(completed.origins[0].rightPosition, 1);
  assert.equal(completed.activeForkCount, 0);
  assert.equal(api.replicatedFraction(completed), 100);

  const plan = api.videoFramePlan(state);
  const finalTravel = api.videoTravelAtFrame(plan, plan.lastFrameIndex);
  const finalFrame = api.getReplicationModelAtTravel(finalTravel, state);
  assert.equal(finalTravel, plan.completionTravel);
  assert.equal(finalFrame.origins[0].leftPosition, 0);
  assert.equal(finalFrame.origins[0].rightPosition, 1);
  assert.equal(api.replicatedFraction(finalFrame), 100);
});

test("discrete MP4 frames hold each one-base-pair pose without changing duration", () => {
  const state = freshState();
  state.discreteAnimation = true;
  const plan = api.videoFramePlan(state);
  assert.equal(plan.discreteStep, api.basePairStepFraction(state));
  let previous = api.videoTravelAtFrame(plan, 0);
  let observedJump = false;
  for (let frame = 1; frame <= plan.lastFrameIndex; frame += 1) {
    const travel = api.videoTravelAtFrame(plan, frame);
    const difference = travel - previous;
    if (frame === plan.lastFrameIndex) {
      assert.equal(travel, plan.completionTravel);
    } else {
      assert.ok(
        Math.abs(difference) < 1e-12 || Math.abs(difference - plan.discreteStep) < 1e-10,
        `frame ${frame} advanced by ${difference}`
      );
      observedJump ||= difference > 0;
    }
    previous = travel;
  }
  assert.equal(observedJump, true);

  state.discreteAnimation = false;
  assert.equal(api.videoFramePlan(state).discreteStep, 0);
});

test("one hundred percent remains reachable with extreme colliding fork offsets", () => {
  const state = freshState();
  state.origins = [
    {
      id: "origin-left-delayed",
      position: 0.2,
      startPosition: 0.2,
      leftOffset: -1,
      rightOffset: -1,
    },
    {
      id: "origin-middle-advanced",
      position: 0.5,
      startPosition: 0.5,
      leftOffset: 0.5,
      rightOffset: 0.5,
    },
    {
      id: "origin-right-delayed",
      position: 0.8,
      startPosition: 0.8,
      leftOffset: -1,
      rightOffset: -1,
    },
  ];
  api.setState(state);

  api.setSPhaseTime(100);

  assert.equal(state.progress, 100);
  assert.equal(api.replicatedFraction(api.getReplicationModel()), 100);
});

test("manual fork geometry moves the S-phase indicator without moving other forks", () => {
  const state = freshState();
  api.setState(state);
  const before = api.getReplicationModel();
  const untouchedBefore = before.origins[1].rightPosition;
  const progressBefore = state.progress;
  state.origins[0].leftOffset += 0.04;
  const changed = api.getReplicationModel();
  api.synchroniseSPhaseFromGeometry(changed);

  assert.ok(state.progress > progressBefore);
  assert.equal(changed.origins[1].rightPosition, untouchedBefore);
  assert.ok(Math.abs(state.progress - api.replicatedFraction(changed)) < 1e-8);
});

test("fork collapse requires true visual overlap and respects zoom", () => {
  api.setViewState({ zoom: 1, panX: 0, panY: 0 });
  const opposite = 0.5;
  const sevenPixelsAway = opposite - 7 / api.VIEW.moleculeWidth;
  const ninePixelsAway = opposite - 9 / api.VIEW.moleculeWidth;
  assert.equal(api.forksShouldCollapse("left", sevenPixelsAway, opposite), true);
  assert.equal(api.forksShouldCollapse("left", ninePixelsAway, opposite), false);
  assert.equal(api.forksShouldCollapse("left", opposite + 0.01, opposite), true);

  api.setViewState({ zoom: 4, panX: 0, panY: 0 });
  assert.equal(api.forksShouldCollapse("left", sevenPixelsAway, opposite), false);
});

test("a whole-bubble drag consumes a contained dormant origin using raw fork bounds", () => {
  const state = freshState();
  state.forkTravel = 0.12;
  state.origins = [
    {
      id: "dragged-wide",
      position: 0.48,
      startPosition: 0.48,
      leftOffset: 0.08,
      rightOffset: 0.08,
    },
    {
      id: "dormant-contained",
      position: 0.58,
      startPosition: 0.58,
      leftOffset: -0.12,
      rightOffset: -0.12,
    },
  ];

  const before = api.rawBubbleBounds(state.origins[0], state);
  const cluster = api.overlappingBubbleCluster("dragged-wide", state);
  assert.deepEqual(new Set(cluster.originIds), new Set(["dragged-wide", "dormant-contained"]));
  assert.equal(cluster.start, before.start);
  assert.equal(cluster.end, before.end);

  const result = api.mergeOverlappingBubbleState("dragged-wide", state);
  assert.ok(result);
  assert.equal(state.origins.length, 1);
  assert.equal(state.selectedOriginId, result.merged.id);
  assert.ok(!state.origins.some((origin) => origin.id === "dormant-contained"));
  const mergedBounds = api.rawBubbleBounds(result.merged, state);
  assert.ok(Math.abs(mergedBounds.start - before.start) < 1e-12);
  assert.ok(Math.abs(mergedBounds.end - before.end) < 1e-12);
  assert.equal(api.getReplicationModelAtTravel(state.forkTravel, state).activeForkCount, 2);
});

test("raw bubble consumption does not merge a merely nearby dormant origin", () => {
  const state = freshState();
  state.forkTravel = 0.1;
  state.origins = [
    {
      id: "dragged",
      position: 0.4,
      startPosition: 0.4,
      leftOffset: 0,
      rightOffset: 0,
    },
    {
      id: "nearby",
      position: 0.5005,
      startPosition: 0.5005,
      leftOffset: -0.1,
      rightOffset: -0.1,
    },
  ];

  const cluster = api.overlappingBubbleCluster("dragged", state);
  assert.deepEqual([...cluster.originIds], ["dragged"]);
  assert.equal(api.mergeOverlappingBubbleState("dragged", state), null);
  assert.equal(state.origins.length, 2);
});

test("raw bubble consumption follows a transitive chain of genuine overlaps", () => {
  const state = freshState();
  state.forkTravel = 0.1;
  state.origins = [
    { id: "dragged", position: 0.3, startPosition: 0.3, leftOffset: 0, rightOffset: 0 },
    { id: "bridge", position: 0.45, startPosition: 0.45, leftOffset: -0.04, rightOffset: -0.04 },
    { id: "far-edge", position: 0.56, startPosition: 0.56, leftOffset: -0.04, rightOffset: -0.04 },
  ];

  const cluster = api.overlappingBubbleCluster("dragged", state);
  assert.deepEqual(new Set(cluster.originIds), new Set(["dragged", "bridge", "far-edge"]));
  assert.ok(Math.abs(cluster.start - 0.2) < 1e-12);
  assert.ok(Math.abs(cluster.end - 0.62) < 1e-12);
  const result = api.mergeOverlappingBubbleState("dragged", state);
  assert.ok(result);
  assert.equal(state.origins.length, 1);
  const mergedBounds = api.rawBubbleBounds(state.origins[0], state);
  assert.ok(Math.abs(mergedBounds.start - 0.2) < 1e-12);
  assert.ok(Math.abs(mergedBounds.end - 0.62) < 1e-12);
});

test("both fork and whole-origin releases can consume overlapping bubbles", () => {
  assert.equal(api.shouldMergeCompletedBubbleDrag({ role: "fork", moved: true }, "pointerup"), true);
  assert.equal(api.shouldMergeCompletedBubbleDrag({ role: "origin", moved: true }, "pointerup"), true);
  assert.equal(api.shouldMergeCompletedBubbleDrag({ role: "origin", moved: false }, "pointerup"), false);
  assert.equal(api.shouldMergeCompletedBubbleDrag({ role: "origin", moved: true }, "pointercancel"), false);
  assert.equal(api.shouldMergeCompletedBubbleDrag({ role: "cut-range", moved: true }, "pointerup"), false);
});

test("a moving whole bubble consumes a dormant origin immediately and rebases its drag", () => {
  const state = freshState();
  state.forkTravel = 0.1;
  state.origins = [
    {
      id: "moving",
      position: 0.4,
      startPosition: 0.4,
      leftOffset: 0.08,
      rightOffset: 0.08,
    },
    {
      id: "tiny",
      position: 0.61,
      startPosition: 0.61,
      leftOffset: -0.1,
      rightOffset: -0.1,
    },
  ];
  api.setState(state);
  const drag = {
    role: "origin",
    originId: "moving",
    moved: true,
    startPointerPosition: 0.4,
    originStartPosition: 0.4,
    originLeftOffset: 0.08,
    originRightOffset: 0.08,
    minimumTranslation: -0.22,
    maximumTranslation: 0.42,
  };

  const collisionPointer = 0.431;
  const collision = api.applyOriginDragPosition(drag, collisionPointer, state);
  assert.ok(collision.consumed, "the tiny origin should be consumed on pointermove, not pointerup");
  assert.equal(state.origins.length, 1);
  assert.equal(drag.originId, collision.origin.id);
  assert.equal(state.selectedOriginId, collision.origin.id);
  assert.equal(drag.startPointerPosition, collisionPointer);
  assert.equal(drag.originStartPosition, collision.origin.startPosition);
  assert.equal(drag.originLeftOffset, collision.origin.leftOffset);
  assert.equal(drag.originRightOffset, collision.origin.rightOffset);
  const collisionBounds = api.rawBubbleBounds(collision.origin, state);
  assert.ok(Math.abs(drag.minimumTranslation + collisionBounds.start) < 1e-12);
  assert.ok(Math.abs(drag.maximumTranslation - (1 - collisionBounds.end)) < 1e-12);

  // Continue the same drag. The newly unified interval must translate from the
  // collision point without a jump and render the consumed locus as replicated.
  const continued = api.applyOriginDragPosition(drag, collisionPointer + 0.03, state);
  const continuedBounds = api.rawBubbleBounds(continued.origin, state);
  assert.ok(Math.abs(continuedBounds.start - (collisionBounds.start + 0.03)) < 1e-12);
  assert.ok(Math.abs(continuedBounds.end - (collisionBounds.end + 0.03)) < 1e-12);
  const model = api.getReplicationModelAtTravel(state.forkTravel, state);
  assert.equal(model.origins.length, 1);
  assert.equal(model.activeForkCount, 2);
  assert.equal(model.regions.length, 1);
  assert.ok(model.regions[0].start < 0.61 && model.regions[0].end > 0.61);
  assert.ok(api.replicationAt(api.VIEW.x0 + 0.61 * api.VIEW.moleculeWidth, model).profile > 0);
  assert.match(api.renderNascentDna(model), /aria-label="Newly synthesised DNA"/);
});

test("a dormant origin cannot open its far side before live raw-bound contact", () => {
  const makeFixture = (modelName) => {
    const state = freshState();
    state.advanced.strandModel = modelName;
    state.layers.pairs = false;
    state.layers.newDna = false;
    state.forkTravel = 0.1;
    state.origins = [
      { id: "moving-wide", position: 0.4, startPosition: 0.4, leftOffset: 0.08, rightOffset: 0.08 },
      { id: "dormant-target", position: 0.61, startPosition: 0.61, leftOffset: -0.1, rightOffset: -0.1 },
    ];
    const drag = {
      role: "origin",
      originId: "moving-wide",
      moved: true,
      startPointerPosition: 0.4,
      originStartPosition: 0.4,
      originLeftOffset: 0.08,
      originRightOffset: 0.08,
      minimumTranslation: -0.22,
      maximumTranslation: 0.42,
    };
    return { state, drag };
  };

  for (const modelName of ["standard", "elegant", "minimal"]) {
    const { state, drag } = makeFixture(modelName);
    api.setState(state);
    const dormantX = api.VIEW.x0 + state.origins[1].startPosition * api.VIEW.moleculeWidth;
    const farProbeX = dormantX + 12;
    const unreplicatedModel = { origins: [], regions: [], activeForkCount: 0 };
    const expectedFarY = api.templateY(farProbeX, "a", unreplicatedModel);

    // The final frame stays just outside the model's sub-pixel contact
    // tolerance. None of these approaching frames may affect the target's far
    // side, even though the ordinary terminal pull span has already begun.
    for (const translation of [0, 0.01, 0.02, 0.0298]) {
      const result = api.applyOriginDragPosition(drag, 0.4 + translation, state);
      assert.equal(result.consumed, null);
      const bounds = state.origins.map((origin) => api.rawBubbleBounds(origin, state));
      assert.ok(bounds[1].start - bounds[0].end > 0.0001);

      const model = api.getReplicationModelAtTravel(state.forkTravel, state);
      assert.equal(model.regions.length, 1, "a dormant origin must not create a display region");
      assert.equal(model.origins[0].rightEdgeBlend, 0);
      assert.equal(model.origins[1].leftEdgeBlend, 0);
      assert.equal(api.visualReplicationAt(farProbeX, model).profile, 0);
      assert.ok(Math.abs(api.templateY(farProbeX, "a", model) - expectedFarY) < 1e-10);

      const path = api.artworkMarkup(model).match(/<path d="([^"]+)"/)?.[1];
      assert.ok(Math.abs(renderedCubicYAtX(path, farProbeX) - expectedFarY) < 0.2);
    }

    // A normal release merge stays strict: a positive raw gap is not overlap.
    const strict = makeFixture(modelName).state;
    strict.origins[0].startPosition += 0.03 - 0.00005;
    strict.origins[0].position = strict.origins[0].startPosition;
    assert.equal(api.mergeOverlappingBubbleState("moving-wide", strict), null);

    // Live origin dragging consumes at the same EPSILON at which the rendered
    // model clamps contact, eliminating the otherwise mismatched ~0.11 px
    // frame. The contact geometry remains closed on the target's far side.
    const contact = api.applyOriginDragPosition(drag, 0.4 + 0.03 - 0.00005, state);
    assert.ok(contact.consumed);
    assert.equal(state.origins.length, 1);
    const contactModel = api.getReplicationModelAtTravel(state.forkTravel, state);
    assert.equal(api.visualReplicationAt(farProbeX, contactModel).profile, 0);
    const contactY = api.templateY(dormantX, "a", contactModel);
    assert.ok(Math.abs(contactY - api.templateY(dormantX, "a", unreplicatedModel)) < 1e-8);

    const after = api.applyOriginDragPosition(drag, drag.startPointerPosition + 0.002, state);
    assert.equal(after.consumed, null);
    const afterModel = api.getReplicationModelAtTravel(state.forkTravel, state);
    const afterProfile = api.replicationAt(dormantX, afterModel).profile;
    assert.ok(afterProfile > 0 && afterProfile < 0.05, "consumed DNA should open gradually after contact");
    assert.equal(api.visualReplicationAt(farProbeX, afterModel).profile, 0);
  }
});

test("live bubble consumption requires an active origin drag and genuine raw overlap", () => {
  const state = freshState();
  state.forkTravel = 0.1;
  state.origins = [
    { id: "moving", position: 0.4, startPosition: 0.4, leftOffset: 0.08, rightOffset: 0.08 },
    { id: "near-gap", position: 0.5805, startPosition: 0.5805, leftOffset: -0.1, rightOffset: -0.1 },
  ];
  const originDrag = {
    role: "origin",
    originId: "moving",
    moved: true,
    startPointerPosition: 0.4,
    originStartPosition: 0.4,
    originLeftOffset: 0.08,
    originRightOffset: 0.08,
    minimumTranslation: -0.22,
    maximumTranslation: 0.42,
  };

  const nearby = api.applyOriginDragPosition(originDrag, 0.4, state);
  assert.equal(nearby.consumed, null);
  assert.equal(state.origins.length, 2);
  assert.equal(originDrag.originId, "moving");

  // A hover/non-moved gesture and a single-fork drag do not change topology,
  // even when their raw bounds happen to overlap.
  state.origins[1].startPosition = 0.57;
  state.origins[1].position = 0.57;
  assert.equal(api.mergeOverlappingBubbleDuringDrag({ ...originDrag, moved: false }, 0.4, state), null);
  assert.equal(api.mergeOverlappingBubbleDuringDrag({ ...originDrag, role: "fork" }, 0.4, state), null);
  assert.equal(api.mergeOverlappingBubbleDuringDrag(null, 0.4, state), null);
  assert.equal(state.origins.length, 2);
});

test("adding and splitting origins has no artificial count limit", () => {
  assert.doesNotMatch(source, /Origin limit reached/);
  assert.doesNotMatch(source, /state\.origins\.length\s*>=\s*8/);
  assert.doesNotMatch(
    source,
    /state\.origins\.length\s*-\s*new Set\(region\.originIds\)\.size\s*\+\s*2\s*>\s*8/
  );
});

test("native MP4 fallback reports unavailable without MediaRecorder", () => {
  assert.equal(api.supportedMp4MimeType(), "");
});

test("drawing controls precisely cancel the preview zoom", () => {
  api.setState(freshState());
  api.setViewState({ zoom: 4, panX: 0, panY: 0 });
  assert.match(api.fixedUiTransform(100, 200), /scale\(0\.2500\)$/);
  assert.match(api.worldTransform(), /scale\(4\.0000\)/);

  api.setViewState({ zoom: 1.5625, panX: 0, panY: 0 });
  assert.match(api.fixedUiTransform(100, 200), /scale\(0\.6400\)$/);
  assert.equal(api.niceIntegerCeiling(2.1), 5);
});

test("artwork aspect is persistent, pointer-correct, and shared by preview and video", () => {
  const state = freshState();
  state.advanced.aspectX = 1.5;
  state.advanced.aspectY = 0.75;
  api.setState(state);
  api.setViewState({ zoom: 2, panX: 30, panY: -20 });

  assert.equal(api.artworkAspectX(), 1.5);
  assert.equal(api.artworkAspectY(), 0.75);
  assert.match(api.artworkAspectTransform(), /matrix\(1\.5000 0 0 0\.7500 -300\.0000 77\.5000\)/);
  assert.match(api.fixedUiTransform(100, 200), /scale\(0\.3333 0\.6667\)$/);

  const worldPoint = { x: 500, y: 280 };
  const screenPoint = {
    x: api.VIEW.width / 2 + 30 + (worldPoint.x - api.VIEW.width / 2) * 2 * 1.5,
    y: api.VIEW.centerY - 20 + (worldPoint.y - api.VIEW.centerY) * 2 * 0.75,
  };
  const recovered = api.screenToWorld(screenPoint);
  assert.ok(Math.abs(recovered.x - worldPoint.x) < 1e-9);
  assert.ok(Math.abs(recovered.y - worldPoint.y) < 1e-9);

  const opposite = 0.5;
  const sevenPixelsAway = opposite - 7 / (api.VIEW.moleculeWidth * 2 * 1.5);
  const ninePixelsAway = opposite - 9 / (api.VIEW.moleculeWidth * 2 * 1.5);
  assert.equal(api.forksShouldCollapse("left", sevenPixelsAway, opposite), true);
  assert.equal(api.forksShouldCollapse("left", ninePixelsAway, opposite), false);

  const video = api.fixedVideoSvgSource(state, state.forkTravel);
  assert.equal(video.width, api.VIEW.moleculeWidth * 1.5 + 24);
  assert.match(video.source, /transform="matrix\(1\.5000 0 0 0\.7500 -300\.0000 77\.5000\)"/);
  assert.match(source, /id="rs-artwork-aspect" transform="\$\{artworkAspectTransform\(\)\}"/);
  assert.match(source, /querySelector\("#rs-artwork-aspect"\)\?\.getScreenCTM\(\)/);

  state.advanced.aspectX = 99;
  state.advanced.aspectY = 0.1;
  api.normaliseStateSchema(state);
  assert.equal(state.advanced.aspectX, 10);
  assert.equal(state.advanced.aspectY, 0.1);

  assert.equal(api.aspectFactorFromSlider("x", 0), 1);
  assert.equal(api.aspectFactorFromSlider("x", 100), 10);
  assert.equal(api.aspectFactorFromSlider("x", -100), 0.1);
  assert.equal(api.aspectFactorFromSlider("y", 100), 5);
  assert.equal(api.aspectFactorFromSlider("y", -100), 0.1);
  assert.ok(Math.abs(api.aspectSliderValue("x", { advanced: { aspectX: 1 } })) < 1e-12);
});

test("video export preserves the fork schedule in a canonical copy without mutating live settings", () => {
  const state = freshState();
  state.progress = 47;
  state.origins[0].leftOffset = -0.08;
  state.origins[0].rightOffset = 0.11;
  state.origins[1].leftOffset = -0.19;
  state.origins[1].rightOffset = 0.03;
  api.setState(state);
  const before = JSON.stringify(state);
  const liveModel = api.getReplicationModelAtTravel(state.forkTravel, state);

  const videoState = api.makeVideoExportState();
  const exportedAtLiveTravel = api.getReplicationModelAtTravel(state.forkTravel, videoState);
  const geometrySignature = (model) =>
    JSON.stringify({
      activeForkCount: model.activeForkCount,
      origins: Array.from(model.origins, ({ id, leftPosition, rightPosition, leftActive, rightActive }) => ({
        id,
        leftPosition,
        rightPosition,
        leftActive,
        rightActive,
      })),
      regions: Array.from(model.regions, ({ start, end, originIds }) => ({ start, end, originIds: Array.from(originIds) })),
    });

  assert.equal(JSON.stringify(state), before);
  assert.equal(geometrySignature(exportedAtLiveTravel), geometrySignature(liveModel));
  assert.equal(videoState.progress, 0);
  assert.equal(videoState.forkTravel, api.forkTravelBounds(videoState).zero);
  assert.equal(videoState.origins[0].leftOffset, -0.08);
  assert.equal(videoState.origins[0].rightOffset, 0.11);
  assert.equal(videoState.origins[1].leftOffset, -0.19);
  assert.equal(videoState.origins[1].rightOffset, 0.03);
  assert.equal(api.replicatedFraction(api.getReplicationModelAtTravel(videoState.forkTravel, videoState)), 0);
});

test("new strand-model defaults are explicit and legacy simplified snapshots migrate", () => {
  const state = freshState();
  assert.equal(state.doubleStrandHeight, 24);
  assert.equal(state.advanced.strandModel, "standard");
  assert.equal(state.advanced.terminalSmoothing, 1.5);
  assert.equal(state.advanced.transitionTightness, 0);
  assert.equal(state.advanced.alwaysShowControls, true);
  assert.equal("simplified" in state.advanced, false);

  const migrated = api.normaliseStateSchema({ advanced: { simplified: true } });
  assert.equal(migrated.advanced.strandModel, "elegant");
  assert.equal(migrated.advanced.terminalSmoothing, 1.5);
  assert.equal("simplified" in migrated.advanced, false);
});

test("double-strand height couples unreplicated and daughter strand separation", () => {
  const state = freshState();
  state.doubleStrandHeight = 40;
  state.origins = [{ id: "height", position: 0.5, startPosition: 0.5, leftOffset: 0, rightOffset: 0 }];
  api.setState(state);

  const unreplicated = api.getReplicationModelAtTravel(0, state);
  const leftX = api.VIEW.x0;
  assert.ok(Math.abs(Math.abs(api.templateY(leftX, "a", unreplicated) - api.templateY(leftX, "b", unreplicated)) - 40) < 1e-8);

  const replicated = api.getReplicationModelAtTravel(0.5, state);
  assert.ok(
    Math.abs(Math.abs(api.templateY(leftX, "a", replicated) - api.nascentY(leftX, "top", replicated)) - 40) < 1e-8
  );

  state.advanced.strandModel = "elegant";
  assert.ok(Math.abs(Math.abs(api.templateY(leftX, "a", unreplicated) - api.templateY(leftX, "b", unreplicated)) - 40) < 1e-8);
  assert.ok(
    Math.abs(Math.abs(api.templateY(leftX, "a", replicated) - api.nascentY(leftX, "top", replicated)) - 40) < 1e-8
  );
});

test("minimal model renders one visual line per dsDNA and ignores double-strand detail", () => {
  const state = freshState();
  state.advanced.strandModel = "minimal";
  state.origins = [{ id: "minimal", position: 0.5, startPosition: 0.5, leftOffset: 0, rightOffset: 0 }];
  state.forkTravel = 0.2;
  api.setState(state);
  const model = api.getReplicationModel();
  const x = api.VIEW.x0 + api.VIEW.moleculeWidth / 2;

  state.doubleStrandHeight = 8;
  const compact = [api.templateY(x, "a", model), api.templateY(x, "b", model)];
  state.doubleStrandHeight = 48;
  const tall = [api.templateY(x, "a", model), api.templateY(x, "b", model)];
  assert.deepEqual(compact, tall);
  assert.equal(api.helixWave(x), 0);
  assert.equal(api.modelSupportsDoubleStrandDetails(), false);

  const markup = api.artworkMarkup(model);
  assert.equal((markup.match(/<path /g) || []).length, 2);
  assert.doesNotMatch(markup, /Base pairs|Newly synthesised DNA|Alternating strand overpasses/);
});

test("transition tightness spans smooth to a sub-pixel sharp envelope with exact anchors", () => {
  const state = freshState();
  state.origins = [{ id: "tight", position: 0.5, startPosition: 0.5, leftOffset: 0, rightOffset: 0 }];
  state.forkTravel = 0.2;
  api.setState(state);
  const model = api.getReplicationModel();
  const region = model.regions[0];

  state.advanced.transitionTightness = -100;
  assert.equal(api.transitionTightness(), -1);
  assert.equal(api.transitionTightnessLabel(), "Circular");
  assert.equal(api.regionTransitionWidth(region), state.daughterSpacing / 2);
  state.advanced.transitionTightness = 0;
  assert.equal(api.regionTransitionWidth(region), 52);
  state.advanced.transitionTightness = 100;
  assert.equal(api.regionTransitionWidth(region), 0.75);

  const startX = api.VIEW.x0 + region.start * api.VIEW.moleculeWidth;
  const endX = api.VIEW.x0 + region.end * api.VIEW.moleculeWidth;
  const anchors = api.replicationTransitionAnchors(model);
  assert.ok(anchors.some((x) => Math.abs(x - startX) < 1e-8));
  assert.ok(anchors.some((x) => Math.abs(x - (startX + 0.75)) < 1e-8));
  assert.ok(anchors.some((x) => Math.abs(x - (endX - 0.75)) < 1e-8));
  assert.ok(anchors.some((x) => Math.abs(x - endX) < 1e-8));

  const sampled = [];
  api.sampledPath(api.VIEW.x0, api.VIEW.x1, (x) => {
    sampled.push(x);
    return 100;
  }, 3, null, anchors);
  anchors.forEach((anchor) => assert.ok(sampled.some((x) => Math.abs(x - anchor) < 1e-8)));
});

test("base-pair caps remain within their strand endpoints", () => {
  for (let width = 0.5; width <= 5; width += 0.5) {
    for (let distance = 0.25; distance <= 20; distance += 0.25) {
      const segment = api.insetBasePairSegment(10, 10 + distance, width);
      if (distance <= width) {
        assert.equal(segment, null);
        continue;
      }
      assert.ok(segment.firstY - width / 2 >= 10 - 1e-10);
      assert.ok(segment.secondY + width / 2 <= 10 + distance + 1e-10);
    }
  }
});

test("strand paths use smooth cubic splines and never bridge cuts", () => {
  const run = api.smoothRunPath([
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 0 },
  ]);
  assert.match(run, /^M/);
  assert.match(run, / C/);
  assert.doesNotMatch(run, / L/);

  const state = freshState();
  state.cuts = [{ start: 0.45, end: 0.55 }];
  api.setState(state);
  api.setDragState(null);
  const path = api.sampledPath(api.VIEW.x0, api.VIEW.x1, () => 100, 3);
  assert.ok((path.match(/M/g) || []).length >= 2);
  assert.doesNotMatch(path, / L/);
});

test("shape-preserving splines cannot hook across a sharp fork transition", () => {
  const points = [
    { x: 0, y: 0 },
    { x: 3, y: 0 },
    { x: 3.75, y: 100 },
    { x: 6.75, y: 100 },
  ];
  const path = api.smoothRunPath(points);
  const segments = [...path.matchAll(/C(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g)];
  assert.equal(segments.length, 3);
  segments.forEach((match, index) => {
    const [, firstX, firstY, secondX, secondY] = match.map(Number);
    const from = points[index];
    const to = points[index + 1];
    assert.ok(firstX >= from.x && firstX <= to.x);
    assert.ok(secondX >= from.x && secondX <= to.x);
    assert.ok(firstY >= Math.min(from.y, to.y) - 1e-8 && firstY <= Math.max(from.y, to.y) + 1e-8);
    assert.ok(secondY >= Math.min(from.y, to.y) - 1e-8 && secondY <= Math.max(from.y, to.y) + 1e-8);
  });
});

test("new DNA remains sinusoidal on fixed daughter baselines and stops before closed forks", () => {
  const state = freshState();
  state.origins = [
    {
      id: "origin-nascent",
      position: 0.5,
      startPosition: 0.5,
      leftOffset: 0,
      rightOffset: 0,
    },
  ];
  api.setState(state);
  api.setSPhaseTime(40);
  const model = api.getReplicationModel();
  const region = model.regions[0];
  const startX = api.VIEW.x0 + region.start * api.VIEW.moleculeWidth;
  const middleX = api.VIEW.x0 + ((region.start + region.end) / 2) * api.VIEW.moleculeWidth;

  for (const x of [startX + 4, startX + 40, middleX]) {
    const wave = api.helixWave(x);
    assert.ok(Math.abs(api.nascentY(x, "top") + wave - (api.VIEW.centerY - state.daughterSpacing / 2)) < 1e-8);
    assert.ok(Math.abs(api.nascentY(x, "bottom") - wave - (api.VIEW.centerY + state.daughterSpacing / 2)) < 1e-8);
  }

  const closedMarkup = api.renderNascentDna(model);
  const closedStart = Number(closedMarkup.match(/<path d="M([\d.-]+)/)?.[1]);
  assert.ok(closedStart > startX + 15, "closed forks must retain a visible gap before new DNA");

  api.setSPhaseTime(100);
  const openMarkup = api.renderNascentDna(api.getReplicationModel());
  const openStart = Number(openMarkup.match(/<path d="M([\d.-]+)/)?.[1]);
  assert.ok(Math.abs(openStart - api.VIEW.x0) < 0.1, "an open chromosome end should not be inset");
});

test("schematic-duplex new DNA begins exactly at the corresponding unreplicated strand heights", () => {
  const state = freshState();
  state.advanced.strandModel = "elegant";
  state.origins = [
    {
      id: "origin-simple",
      position: 0.5,
      startPosition: 0.5,
      leftOffset: 0,
      rightOffset: 0,
    },
  ];
  state.forkTravel = 0.14;
  api.setState(state);

  const model = api.getReplicationModel();
  const region = model.regions[0];
  const span = api.nascentSpan(region);
  const middleX = (span.fromX + span.toX) / 2;
  const forkTopY = api.nascentY(span.fromX, "top", model);
  const middleTopY = api.nascentY(middleX, "top", model);
  const forkBottomY = api.nascentY(span.toX, "bottom", model);
  const middleBottomY = api.nascentY(middleX, "bottom", model);

  const halfHeight = api.doubleStrandHalfHeight(state);
  assert.ok(Math.abs(forkTopY - (api.VIEW.centerY - halfHeight)) < 1e-6);
  assert.ok(Math.abs(forkBottomY - (api.VIEW.centerY + halfHeight)) < 1e-6);
  assert.ok(Math.abs(forkTopY - api.VIEW.centerY) < Math.abs(middleTopY - api.VIEW.centerY));
  assert.ok(Math.abs(forkBottomY - api.VIEW.centerY) < Math.abs(middleBottomY - api.VIEW.centerY));
  assert.ok(Math.abs(api.replicationAt(span.fromX, model).profile - api.schematicNascentStartProfile(state)) < 1e-6);
  assert.ok(Math.abs(api.replicationAt(span.toX, model).profile - api.schematicNascentStartProfile(state)) < 1e-6);
  const markupStart = Number(api.renderNascentDna(model).match(/<path d="M([\d.-]+)/)?.[1]);
  const regionStart = api.VIEW.x0 + region.start * api.VIEW.moleculeWidth;
  const regionEnd = api.VIEW.x0 + region.end * api.VIEW.moleculeWidth;
  assert.ok(span.fromX > regionStart);
  assert.ok(span.toX < regionEnd);
  assert.ok(Math.abs(span.fromX - regionStart - (regionEnd - span.toX)) < 1e-8);
  assert.ok(Math.abs(markupStart - span.fromX) < 1e-4);
});

test("schematic new-DNA endpoints remain inset and converge smoothly during a terminal merge", () => {
  const state = freshState();
  state.advanced.strandModel = "elegant";
  state.origins = [
    { id: "nascent-left", position: 0.23, startPosition: 0.23, leftOffset: 0, rightOffset: 0 },
    { id: "nascent-right", position: 0.79, startPosition: 0.79, leftOffset: 0, rightOffset: 0 },
  ];
  const startProfile = api.schematicNascentStartProfile(state);
  const unreplicatedTopY = api.VIEW.centerY - api.doubleStrandHalfHeight(state);
  const replicatedTopY = api.VIEW.centerY - state.daughterSpacing / 2 + api.doubleStrandHalfHeight(state);
  let previousEndpointY = Number.POSITIVE_INFINITY;

  for (const gap of [50, 30, 10, 1]) {
    state.forkTravel =
      (state.origins[1].startPosition - state.origins[0].startPosition - gap / api.VIEW.moleculeWidth) / 2;
    api.setState(state);
    const model = api.getReplicationModel();
    const leftRegion = model.regions[0];
    const rightRegion = model.regions[1];
    const leftSpan = api.nascentSpan(leftRegion, model);
    const rightSpan = api.nascentSpan(rightRegion, model);
    const leftForkX = api.VIEW.x0 + leftRegion.end * api.VIEW.moleculeWidth;
    const rightForkX = api.VIEW.x0 + rightRegion.start * api.VIEW.moleculeWidth;
    assert.ok(leftSpan.toX < leftForkX, "left nascent strand must not touch an active fork");
    assert.ok(rightSpan.fromX > rightForkX, "right nascent strand must not touch an active fork");
    assert.ok(Math.abs(leftForkX - leftSpan.toX - (rightSpan.fromX - rightForkX)) < 1e-8);

    const renderedPaths = [...api.renderNascentDna(model).matchAll(/<path d="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(renderedPaths.length, 4);
    const leftTopEnd = cubicSegments(renderedPaths[0]).at(-1).to;
    const rightTopStart = cubicSegments(renderedPaths[2])[0].from;
    assert.ok(Math.abs(leftTopEnd.x - leftSpan.toX) < 1e-3);
    assert.ok(Math.abs(rightTopStart.x - rightSpan.fromX) < 1e-3);
    assert.ok(Math.abs(leftTopEnd.y - rightTopStart.y) < 1e-3, "facing nascent ends must mirror");
    assert.ok(leftTopEnd.y <= unreplicatedTopY + 1e-3 && leftTopEnd.y >= replicatedTopY - 1e-3);
    assert.ok(leftTopEnd.y <= previousEndpointY + 1e-3, "endpoint should pull outward without reversing");
    previousEndpointY = leftTopEnd.y;

    if (leftRegion.endBlend < startProfile - 1e-6) {
      assert.ok(Math.abs(leftTopEnd.y - unreplicatedTopY) < 1e-3);
    }

    const lastSegment = cubicSegments(renderedPaths[0]).at(-1);
    const endSlope =
      (lastSegment.to.y - lastSegment.control2.y) / (lastSegment.to.x - lastSegment.control2.x);
    assert.ok(Number.isFinite(endSlope) && Math.abs(endSlope) < 8, "nascent terminal developed a vertical seam");
  }
});

test("moving path boundaries retain a stable global sample lattice", () => {
  const state = freshState();
  api.setState(state);
  const firstSamples = [];
  const secondSamples = [];
  api.sampledPath(100.2, 124.4, (x) => {
    firstSamples.push(x);
    return 100;
  });
  api.sampledPath(100.8, 124.4, (x) => {
    secondSamples.push(x);
    return 100;
  });

  assert.deepEqual(firstSamples.slice(1), secondSamples.slice(1));
  assert.deepEqual(firstSamples.slice(1, -1), [102, 105, 108, 111, 114, 117, 120, 123]);
});

test("normal new-DNA endpoints use the exact profile threshold rather than a stepping sample", () => {
  const state = freshState();
  state.origins = [
    {
      id: "origin-exact",
      position: 0.5,
      startPosition: 0.5,
      leftOffset: 0,
      rightOffset: 0,
    },
  ];
  state.forkTravel = 0.18;
  api.setState(state);
  const model = api.getReplicationModel();
  const span = api.nascentSpan(model.regions[0]);

  assert.ok(Math.abs(api.replicationAt(span.fromX, model).profile - 0.38) < 1e-6);
  assert.ok(Math.abs(api.replicationAt(span.toX, model).profile - 0.38) < 1e-6);
  const markupStart = Number(api.renderNascentDna(model).match(/<path d="M([\d.-]+)/)?.[1]);
  assert.ok(Math.abs(markupStart - span.fromX) < 1e-4);
});

test("terminal smoothing follows the current genomic scale in fit and fixed-scale modes", () => {
  const state = freshState();
  state.length = 50;
  state.pairResolution = 3;
  state.advanced.lengthMode = "scale";
  state.advanced.terminalSmoothing = 1.5;
  api.setState(state);

  assert.equal(api.referenceBasePairSubdivisionCount(), 40);
  assert.equal(api.referenceBasePairSpacingPx(), api.VIEW.moleculeWidth / 40);
  const referenceSpan = api.terminalPullSpan(0.5, "right", state);
  assert.equal(api.terminalSmoothing(state), 1.5);
  assert.ok(Math.abs(api.effectiveTerminalSmoothing(state) - 1.5) < 1e-12);
  assert.equal(api.terminalSmoothingLabel(state), "1.5 bp");
  assert.ok(Math.abs(referenceSpan - 1.5 * api.referenceBasePairSpacingPx()) < 1e-12);

  state.length = 180;
  api.syncViewGeometry(state);
  const denserSpan = api.terminalPullSpan(0.5, "right", state);
  assert.ok(denserSpan < referenceSpan, "fit-to-canvas must reduce the displayed span for denser genomes");
  assert.ok(Math.abs(api.effectiveTerminalSmoothing(state) - 1.5) < 1e-12);
  assert.equal(api.terminalSmoothingLabel(state), "1.5 bp");

  const fixedScale = freshState();
  fixedScale.length = 50;
  fixedScale.pairResolution = 3;
  fixedScale.advanced.lengthMode = "extend";
  fixedScale.advanced.terminalSmoothing = 1.5;
  api.setState(fixedScale);
  const fixedReference = api.terminalPullSpan(0.5, "right", fixedScale);
  api.resizeGenomeLength(180, fixedScale);
  const fixedLong = api.terminalPullSpan(0.5, "right", fixedScale);
  assert.ok(Math.abs(fixedLong - fixedReference) < 1e-9, "fixed genomic scale must retain the same physical smoothing span");
  assert.equal(fixedLong, api.terminalPullSpan(0.37, "left", fixedScale));
});

test("zero terminal smoothing snaps at merge and chromosome-end contact", () => {
  const state = freshState();
  state.advanced.terminalSmoothing = 0;
  state.origins = [
    { id: "snap-left", position: 0.25, startPosition: 0.25, leftOffset: 0, rightOffset: 0 },
    { id: "snap-right", position: 0.75, startPosition: 0.75, leftOffset: 0, rightOffset: 0 },
  ];
  api.setState(state);

  assert.equal(api.terminalSmoothing(), 0);
  assert.equal(api.terminalSmoothingLabel(), "Snap");
  assert.equal(api.terminalPullSpan(0.5, "right", state), 0);

  const gap = 4;
  const beforeMergeTravel =
    (state.origins[1].startPosition - state.origins[0].startPosition - gap / api.VIEW.moleculeWidth) / 2;
  const beforeMerge = api.getReplicationModelAtTravel(beforeMergeTravel, state);
  assert.equal(beforeMerge.regions.length, 2);
  assert.equal(beforeMerge.origins[0].rightEdgeBlend, 0);
  assert.equal(beforeMerge.origins[1].leftEdgeBlend, 0);

  const atMerge = api.getReplicationModelAtTravel(0.25, state);
  assert.equal(atMerge.regions.length, 1);
  assert.equal(atMerge.origins[0].rightEdgeBlend, 1);
  assert.equal(atMerge.origins[1].leftEdgeBlend, 1);

  state.origins = [{ id: "snap-end", position: 0.5, startPosition: 0.5, leftOffset: 0, rightOffset: 0 }];
  const beforeEnd = api.getReplicationModelAtTravel(0.5 - gap / api.VIEW.moleculeWidth, state);
  assert.equal(beforeEnd.origins[0].rightEdgeBlend, 0);
  assert.equal(beforeEnd.regions[0].openEnd, false);

  const atEnd = api.getReplicationModelAtTravel(0.5, state);
  assert.equal(atEnd.origins[0].rightEdgeBlend, 1);
  assert.equal(atEnd.regions[0].openEnd, true);
});

test("nonzero terminal smoothing eases opposing forks symmetrically over the configured distance", () => {
  const state = freshState();
  state.advanced.terminalSmoothing = 1.5;
  state.origins = [
    { id: "ease-left", position: 0.25, startPosition: 0.25, leftOffset: 0, rightOffset: 0 },
    { id: "ease-right", position: 0.75, startPosition: 0.75, leftOffset: 0, rightOffset: 0 },
  ];
  api.setState(state);

  const span = api.terminalPullSpan(0.5, "right", state);
  const travelForGap = (gapInPixels) =>
    (state.origins[1].startPosition - state.origins[0].startPosition - gapInPixels / api.VIEW.moleculeWidth) / 2;
  const atPullStart = api.getReplicationModelAtTravel(travelForGap(span * 2), state);
  const halfway = api.getReplicationModelAtTravel(travelForGap(span), state);

  assert.ok(atPullStart.origins[0].rightEdgeBlend < 1e-12);
  assert.ok(Math.abs(halfway.origins[0].rightEdgeBlend - 0.5) < 1e-12);
  assert.equal(halfway.origins[0].rightEdgeBlend, halfway.origins[1].leftEdgeBlend);

  state.origins = [{ id: "ease-end", position: 0.5, startPosition: 0.5, leftOffset: 0, rightOffset: 0 }];
  const endAtPullStart = api.getReplicationModelAtTravel(0.5 - span / api.VIEW.moleculeWidth, state);
  const endHalfway = api.getReplicationModelAtTravel(0.5 - span / 2 / api.VIEW.moleculeWidth, state);
  assert.ok(endAtPullStart.origins[0].rightEdgeBlend < 1e-12);
  assert.ok(Math.abs(endHalfway.origins[0].rightEdgeBlend - 0.5) < 1e-12);
});

test("daughter profiles blend continuously before fork merges and chromosome ends", () => {
  const state = freshState();
  state.origins = [
    { id: "left", position: 0.25, startPosition: 0.25, leftOffset: 0, rightOffset: 0 },
    { id: "right", position: 0.75, startPosition: 0.75, leftOffset: 0, rightOffset: 0 },
  ];
  api.setState(state);

  const travelForGap = (gapInPixels) => (0.5 - gapInPixels / api.VIEW.moleculeWidth) / 2;
  const far = api.getReplicationModelAtTravel(travelForGap(24), state);
  const near = api.getReplicationModelAtTravel(travelForGap(8), state);
  assert.ok(near.origins[0].rightEdgeBlend > far.origins[0].rightEdgeBlend);
  assert.ok(near.origins[0].rightTerminalOpacity < far.origins[0].rightTerminalOpacity);

  const nearForkX = api.VIEW.x0 + near.origins[0].rightPosition * api.VIEW.moleculeWidth;
  assert.ok(Math.abs(api.replicationAt(nearForkX, near).profile - near.origins[0].rightEdgeBlend) < 1e-8);
  const merged = api.getReplicationModelAtTravel(0.25, state);
  assert.equal(merged.regions.length, 1);
  assert.ok(Math.abs(api.replicationAt(api.VIEW.x0 + api.VIEW.moleculeWidth / 2, merged).profile - 1) < 1e-8);

  state.origins = [{ id: "end", position: 0.25, startPosition: 0.25, leftOffset: 0, rightOffset: 0 }];
  const nearEnd = api.getReplicationModelAtTravel(0.25 - 8 / api.VIEW.moleculeWidth, state);
  const atEnd = api.getReplicationModelAtTravel(0.25, state);
  assert.ok(nearEnd.origins[0].leftEdgeBlend > 0 && nearEnd.origins[0].leftEdgeBlend < 1);
  assert.equal(atEnd.origins[0].leftEdgeBlend, 1);
  assert.equal(atEnd.regions[0].openStart, true);
});

test("rendered fork geometry ignores a distant bubble until the facing terminal pull begins", () => {
  const state = freshState();
  state.layers.pairs = false;
  state.layers.newDna = false;
  state.forkTravel = 0.04;
  state.origins = [
    {
      id: "observed",
      position: 0.25,
      startPosition: 0.25,
      leftOffset: 0.1,
      rightOffset: 0.1,
    },
    {
      id: "distant",
      position: 0.8,
      startPosition: 0.8,
      leftOffset: 0,
      rightOffset: 0.1,
    },
  ];

  const renderWithDistantOffsets = (modelName, leftOffset, rightOffset) => {
    state.advanced.strandModel = modelName;
    state.origins[1].leftOffset = leftOffset;
    state.origins[1].rightOffset = rightOffset;
    api.setState(state);
    const model = api.getReplicationModel();
    const observedRegion = model.regions[0];
    const distantRegion = model.regions[1];
    const observedEndX = api.VIEW.x0 + observedRegion.end * api.VIEW.moleculeWidth;
    const distantStartX = api.VIEW.x0 + distantRegion.start * api.VIEW.moleculeWidth;
    const templatePath = api.artworkMarkup(model).match(/<path d="([^"]+)"/)?.[1];
    assert.ok(templatePath);
    return {
      model,
      observedRegion,
      distantRegion,
      observedEndX,
      distantStartX,
      transitionWidth: api.regionEdgeTransitionWidth(observedRegion, "end", model, state),
      templatePath,
    };
  };

  for (const modelName of ["standard", "elegant", "minimal"]) {
    const wideDistantBubble = renderWithDistantOffsets(modelName, 0, 0.1);
    // Collapse the distant bubble to a roughly 2 px sliver. Its forks may move,
    // but both stay hundreds of pixels from the independently observed fork.
    const collapsedDistantBubble = renderWithDistantOffsets(modelName, -0.039, -0.039);

    assert.ok(wideDistantBubble.distantStartX - wideDistantBubble.observedEndX > 300);
    assert.ok(collapsedDistantBubble.distantStartX - collapsedDistantBubble.observedEndX > 300);
    assert.equal(wideDistantBubble.observedRegion.endBlend, 0);
    assert.equal(wideDistantBubble.distantRegion.startBlend, 0);
    assert.equal(collapsedDistantBubble.observedRegion.endBlend, 0);
    assert.equal(collapsedDistantBubble.distantRegion.startBlend, 0);
    assert.ok(
      Math.abs(wideDistantBubble.transitionWidth - collapsedDistantBubble.transitionWidth) < 1e-9,
      `${modelName} transition width was coupled to a distant bubble`
    );

    for (const distanceInsideFork of [4, 12, 20]) {
      const probeX = wideDistantBubble.observedEndX - distanceInsideFork;
      const before = renderedCubicYAtX(wideDistantBubble.templatePath, probeX);
      const after = renderedCubicYAtX(collapsedDistantBubble.templatePath, probeX);
      assert.ok(
        Math.abs(before - after) < 2e-3,
        `${modelName} rendered fork moved by ${Math.abs(before - after)}px at a distant resize`
      );
    }
  }

  // Once the opposing forks enter their shared pull span, their facing blends
  // explicitly signal that transition geometry may be coordinated.
  state.advanced.strandModel = "minimal";
  const pullSpan = api.terminalPullSpan(0.5, "right", state);
  const observedRightPosition =
    state.origins[0].startPosition + Math.max(0, state.forkTravel + state.origins[0].rightOffset);
  const nearbyLeftTravel = Math.max(0, state.forkTravel);
  const nearbyStartPosition = observedRightPosition + pullSpan / api.VIEW.moleculeWidth + nearbyLeftTravel;
  state.origins[1] = {
    id: "nearby",
    position: nearbyStartPosition,
    startPosition: nearbyStartPosition,
    leftOffset: 0,
    rightOffset: -0.04,
  };
  api.setState(state);
  const terminalModel = api.getReplicationModel();
  assert.ok(terminalModel.regions[0].endBlend > 0);
  assert.ok(terminalModel.regions[1].startBlend > 0);
  assert.ok(Math.abs(terminalModel.regions[0].endBlend - terminalModel.regions[1].startBlend) < 1e-9);
});

test("unequal minimal bubbles retain their independent fork shapes until physical contact", () => {
  const state = freshState();
  state.advanced.strandModel = "minimal";
  state.forkTravel = 0.3;
  state.origins = [
    { id: "wide", position: 0.2, startPosition: 0.2, leftOffset: 0, rightOffset: 0 },
    {
      id: "narrow",
      position: 0.52,
      startPosition: 0.52,
      leftOffset: -0.29,
      rightOffset: -0.29,
    },
  ];
  api.setState(state);
  const model = api.getReplicationModel();
  assert.equal(model.regions.length, 2);

  const [wide, narrow] = model.regions;
  const wideOwnWidth = api.regionTransitionWidth(wide, state);
  const narrowOwnWidth = api.regionTransitionWidth(narrow, state);
  assert.ok(wideOwnWidth > narrowOwnWidth * 4, "the regression needs strongly unequal bubbles");
  assert.ok(wide.endBlend > 0.5 && narrow.startBlend > 0.5, "forks must be in the final pull zone");

  const wideFacingWidth = api.minimalRegionEdgeTransitionWidth(wide, "end", model, state);
  const narrowFacingWidth = api.minimalRegionEdgeTransitionWidth(narrow, "start", model, state);
  assert.ok(Math.abs(wideFacingWidth - wideOwnWidth) < 1e-9);
  assert.ok(Math.abs(narrowFacingWidth - narrowOwnWidth) < 1e-9);
  assert.ok(
    Math.abs(wideFacingWidth - narrowFacingWidth) > 1,
    "minimal forks must not be forced into one shared, near-vertical transition"
  );

  const earlyWide = { ...wide, endBlend: 0.25 };
  const earlyNarrow = { ...narrow, startBlend: 0.25 };
  const earlyModel = { ...model, regions: [earlyWide, earlyNarrow] };
  assert.ok(
    Math.abs(
      api.minimalRegionEdgeTransitionWidth(earlyWide, "end", earlyModel, state) - wideOwnWidth
    ) < 1e-9
  );
  assert.ok(
    Math.abs(
      api.minimalRegionEdgeTransitionWidth(earlyNarrow, "start", earlyModel, state) - narrowOwnWidth
    ) < 1e-9
  );

  const leftEdgeX = api.VIEW.x0 + wide.end * api.VIEW.moleculeWidth;
  const rightEdgeX = api.VIEW.x0 + narrow.start * api.VIEW.moleculeWidth;
  const sampling = api.replicationPathSampling(model);
  assert.ok(
    sampling.localWindows.some(
      (window) => Math.abs(window.fromX - leftEdgeX) < 1e-8 && Math.abs(window.toX - rightEdgeX) < 1e-8
    ),
    "the closing gap should retain a dense endpoint-to-endpoint sample lattice"
  );

  for (const offset of [2, 4, 8]) {
    const leftProfile =
      (api.VIEW.centerY - api.templateY(leftEdgeX - offset, "a", model)) /
      (state.daughterSpacing / 2);
    const rightProfile =
      (api.VIEW.centerY - api.templateY(rightEdgeX + offset, "a", model)) /
      (state.daughterSpacing / 2);
    assert.ok(
      Math.abs(leftProfile - api.transitionProfile(offset / wideOwnWidth, state)) < 2e-3,
      `wide fork lost its ordinary transition at ${offset}px`
    );
    assert.ok(
      Math.abs(rightProfile - api.transitionProfile(offset / narrowOwnWidth, state)) < 2e-3,
      `narrow fork lost its ordinary transition at ${offset}px`
    );
  }

  const contactTravel =
    (state.origins[1].startPosition -
      state.origins[0].startPosition -
      state.origins[0].rightOffset -
      state.origins[1].leftOffset) /
    2;
  state.forkTravel = contactTravel;
  api.setState(state);
  const atContact = api.getReplicationModel();
  assert.equal(atContact.minimalClosures.length, 1);
  const closure = atContact.minimalClosures[0];
  assert.equal(closure.blend, 0);
  assert.ok(
    closure.leftWidth > closure.rightWidth * 2,
    "the contact frame must preserve the unequal limiting fork widths"
  );
  const contactX = api.VIEW.x0 + closure.position * api.VIEW.moleculeWidth;
  for (const offset of [2, 4, 8]) {
    assert.ok(
      Math.abs(
        api.minimalReplicationAt(contactX - offset, atContact, state).profile -
          api.transitionProfile(offset / closure.leftWidth, state)
      ) < 2e-3
    );
    assert.ok(
      Math.abs(
        api.minimalReplicationAt(contactX + offset, atContact, state).profile -
          api.transitionProfile(offset / closure.rightWidth, state)
      ) < 2e-3
    );
  }
});

test("schematic and minimal terminal envelopes stay continuous and mirror-symmetric across a merge gap", () => {
  const state = freshState();
  state.origins = [
    { id: "left", position: 0.22, startPosition: 0.22, leftOffset: 0, rightOffset: 0 },
    { id: "right", position: 0.81, startPosition: 0.81, leftOffset: 0, rightOffset: 0 },
  ];
  const gap = 8;
  const meetingPosition = (state.origins[0].startPosition + state.origins[1].startPosition) / 2;
  state.forkTravel =
    (state.origins[1].startPosition - state.origins[0].startPosition - gap / api.VIEW.moleculeWidth) / 2;

  for (const modelName of ["elegant", "minimal"]) {
    state.advanced.strandModel = modelName;
    api.setState(state);
    const model = api.getReplicationModel();
    assert.equal(model.regions.length, 2);
    const meetingX = api.VIEW.x0 + meetingPosition * api.VIEW.moleculeWidth;
    const leftEdgeX = api.VIEW.x0 + model.regions[0].end * api.VIEW.moleculeWidth;
    const rightEdgeX = api.VIEW.x0 + model.regions[1].start * api.VIEW.moleculeWidth;

    assert.ok(Math.abs(model.regions[0].endBlend - model.regions[1].startBlend) < 1e-10);
    assert.equal(
      api.terminalPullSpan(meetingPosition, "left", state),
      api.terminalPullSpan(meetingPosition, "right", state)
    );
    for (const offset of [0, gap / 4, gap / 2, gap, 18, 36]) {
      const left = api.visualReplicationAt(meetingX - offset, model).profile;
      const right = api.visualReplicationAt(meetingX + offset, model).profile;
      assert.ok(Math.abs(left - right) < 1e-8, `${modelName} envelope must mirror at ${offset}px`);
      assert.ok(
        Math.abs(api.templateY(meetingX - offset, "a", model) - api.templateY(meetingX + offset, "a", model)) < 1e-8
      );
    }

    const edgeProfile = api.visualReplicationAt(leftEdgeX, model).profile;
    const gapProfile = api.visualReplicationAt(leftEdgeX + 0.001, model).profile;
    assert.ok(Math.abs(edgeProfile - gapProfile) < 1e-5, `${modelName} envelope must not jump into the gap`);
    assert.ok(Math.abs(api.visualReplicationAt(rightEdgeX, model).profile - edgeProfile) < 1e-8);
  }
});

test("rendered schematic and minimal spline controls mirror exactly throughout a fork merge", () => {
  const state = freshState();
  state.origins = [
    { id: "render-left", position: 0.23, startPosition: 0.23, leftOffset: 0, rightOffset: 0 },
    { id: "render-right", position: 0.79, startPosition: 0.79, leftOffset: 0, rightOffset: 0 },
  ];
  const meetingPosition = (state.origins[0].startPosition + state.origins[1].startPosition) / 2;
  const meetingX = api.VIEW.x0 + meetingPosition * api.VIEW.moleculeWidth;

  for (const modelName of ["elegant", "minimal"]) {
    state.advanced.strandModel = modelName;
    for (const tightness of [-100, 0, 100]) {
      state.advanced.transitionTightness = tightness;
      for (const gap of [17.3, 8.1, 1.7]) {
        state.forkTravel =
          (state.origins[1].startPosition - state.origins[0].startPosition - gap / api.VIEW.moleculeWidth) / 2;
        api.setState(state);
        const model = api.getReplicationModel();
        const sampling = api.replicationPathSampling(model);
        const leftEdgeX = api.VIEW.x0 + model.regions[0].end * api.VIEW.moleculeWidth;
        const rightEdgeX = api.VIEW.x0 + model.regions[1].start * api.VIEW.moleculeWidth;
        const leftTransition = sampling.localWindows.find(
          (window) => Math.abs(window.toX - leftEdgeX) < 1e-6 && window.fromX < leftEdgeX - 1e-6
        );
        const rightTransition = sampling.localWindows.find(
          (window) => Math.abs(window.fromX - rightEdgeX) < 1e-6 && window.toX > rightEdgeX + 1e-6
        );
        assert.ok(leftTransition && rightTransition);
        assert.ok(
          Math.abs(leftEdgeX - leftTransition.fromX - (rightTransition.toX - rightEdgeX)) < 1e-8,
          "facing transitions must share one width"
        );

        const templatePath = api.artworkMarkup(model).match(/<path d="([^"]+)"/)?.[1];
        const centralSegments = cubicSegments(templatePath).filter(
          (segment) =>
            segment.from.x >= leftTransition.fromX - 1e-3 && segment.to.x <= rightTransition.toX + 1e-3
        );
        assert.ok(centralSegments.length >= 3);
        for (let index = 0; index < centralSegments.length; index += 1) {
          const left = centralSegments[index];
          const right = centralSegments[centralSegments.length - index - 1];
          assert.ok(Math.abs(left.from.x + right.to.x - meetingX * 2) < 2e-3);
          assert.ok(Math.abs(left.to.x + right.from.x - meetingX * 2) < 2e-3);
          assert.ok(Math.abs(left.control1.x + right.control2.x - meetingX * 2) < 2e-3);
          assert.ok(Math.abs(left.control2.x + right.control1.x - meetingX * 2) < 2e-3);
          assert.ok(Math.abs(left.from.y - right.to.y) < 2e-3);
          assert.ok(Math.abs(left.to.y - right.from.y) < 2e-3);
          assert.ok(Math.abs(left.control1.y - right.control2.y) < 2e-3);
          assert.ok(Math.abs(left.control2.y - right.control1.y) < 2e-3);
        }
      }
    }
  }
});

test("rendered standard-wave forks keep a symmetric envelope and C1 bounded tangents before merging", () => {
  const state = freshState();
  state.advanced.strandModel = "standard";
  state.advanced.transitionTightness = 0;
  state.origins = [
    { id: "wave-left", position: 0.231, startPosition: 0.231, leftOffset: 0, rightOffset: 0 },
    { id: "wave-right", position: 0.793, startPosition: 0.793, leftOffset: 0, rightOffset: 0 },
  ];
  const meetingPosition = (state.origins[0].startPosition + state.origins[1].startPosition) / 2;
  const meetingX = api.VIEW.x0 + meetingPosition * api.VIEW.moleculeWidth;

  for (const gap of [23.4, 9.7, 2.1]) {
    state.forkTravel =
      (state.origins[1].startPosition - state.origins[0].startPosition - gap / api.VIEW.moleculeWidth) / 2;
    api.setState(state);
    const model = api.getReplicationModel();
    const sampling = api.replicationPathSampling(model);
    const leftEdgeX = api.VIEW.x0 + model.regions[0].end * api.VIEW.moleculeWidth;
    const rightEdgeX = api.VIEW.x0 + model.regions[1].start * api.VIEW.moleculeWidth;
    const leftTransition = sampling.localWindows.find(
      (window) => Math.abs(window.toX - leftEdgeX) < 1e-6 && window.fromX < leftEdgeX - 1e-6
    );
    const rightTransition = sampling.localWindows.find(
      (window) => Math.abs(window.fromX - rightEdgeX) < 1e-6 && window.toX > rightEdgeX + 1e-6
    );
    assert.ok(leftTransition && rightTransition, "standard forks must use local transition samples");
    const transitionWidth = leftEdgeX - leftTransition.fromX;
    assert.ok(Math.abs(transitionWidth - (rightTransition.toX - rightEdgeX)) < 1e-8);
    assert.ok(Math.abs(model.regions[0].endBlend - model.regions[1].startBlend) < 1e-12);

    for (const strand of ["a", "b"]) {
      const leftInside = api.templateY(leftEdgeX - 0.001, strand, model);
      const leftOutside = api.templateY(leftEdgeX + 0.001, strand, model);
      const rightOutside = api.templateY(rightEdgeX - 0.001, strand, model);
      const rightInside = api.templateY(rightEdgeX + 0.001, strand, model);
      assert.ok(Math.abs(leftInside - leftOutside) < 0.02, "left standard fork has a rendered y jump");
      assert.ok(Math.abs(rightInside - rightOutside) < 0.02, "right standard fork has a rendered y jump");
    }

    for (const transitionOffset of [0, transitionWidth * 0.2, transitionWidth * 0.5, transitionWidth]) {
      const offset = gap / 2 + transitionOffset;
      const leftProfile = api.replicationAt(meetingX - offset, model).profile;
      const rightProfile = api.replicationAt(meetingX + offset, model).profile;
      assert.ok(Math.abs(leftProfile - rightProfile) < 1e-8, `standard envelope differs at ${offset}px`);
    }

    const templatePath = api.artworkMarkup(model).match(/<path d="([^"]+)"/)?.[1];
    assert.equal((templatePath.match(/M/g) || []).length, 1, "an uncut template must remain one continuous run");
    const centralSegments = cubicSegments(templatePath).filter(
      (segment) =>
        segment.from.x >= leftTransition.fromX - 1e-3 && segment.to.x <= rightTransition.toX + 1e-3
    );
    assert.ok(centralSegments.length >= 5);
    centralSegments.forEach((segment, index) => {
      const minimumY = Math.min(segment.from.y, segment.to.y) - 1e-3;
      const maximumY = Math.max(segment.from.y, segment.to.y) + 1e-3;
      assert.ok(segment.control1.y >= minimumY && segment.control1.y <= maximumY, "first control must not hook");
      assert.ok(segment.control2.y >= minimumY && segment.control2.y <= maximumY, "second control must not hook");
      const startSlope = (segment.control1.y - segment.from.y) / (segment.control1.x - segment.from.x);
      const endSlope = (segment.to.y - segment.control2.y) / (segment.to.x - segment.control2.x);
      assert.ok(Number.isFinite(startSlope) && Math.abs(startSlope) < 6, "fork start tangent became near-vertical");
      assert.ok(Number.isFinite(endSlope) && Math.abs(endSlope) < 6, "fork end tangent became near-vertical");
      const next = centralSegments[index + 1];
      if (!next || Math.abs(segment.to.x - next.from.x) > 1e-3) return;
      const nextSlope = (next.control1.y - next.from.y) / (next.control1.x - next.from.x);
      assert.ok(Math.abs(endSlope - nextSlope) < 0.02, "adjacent Bézier segments must share one tangent");
    });
  }
});

test("schematic and minimal merges stay symmetric when one opposing fork is still delayed", () => {
  const state = freshState();
  state.forkTravel = 0.2;
  state.origins = [
    {
      id: "advanced",
      position: 0.2,
      startPosition: 0.2,
      leftOffset: 0,
      rightOffset: 0.392,
    },
    {
      id: "delayed",
      position: 0.8,
      startPosition: 0.8,
      leftOffset: -0.3,
      rightOffset: 0,
    },
  ];

  for (const modelName of ["elegant", "minimal"]) {
    state.advanced.strandModel = modelName;
    api.setState(state);
    const model = api.getReplicationModel();
    const left = model.origins[0];
    const right = model.origins[1];
    assert.ok(right.leftPosition > left.rightPosition, "the opposing forks should not have merged yet");
    assert.ok(Math.abs(left.rightEdgeBlend - right.leftEdgeBlend) < 1e-12);

    const gapMiddle =
      api.VIEW.x0 + ((left.rightPosition + right.leftPosition) / 2) * api.VIEW.moleculeWidth;
    for (const offset of [0, 1, 3]) {
      const before = api.templateY(gapMiddle - offset, "a", model);
      const after = api.templateY(gapMiddle + offset, "a", model);
      assert.ok(Math.abs(before - after) < 1e-8);
    }
  }
});

test("minimal lines keep a merge gap closed, join first, then lift apart after contact", () => {
  const state = freshState();
  state.advanced.strandModel = "minimal";
  state.origins = [
    { id: "strict-left", position: 0.25, startPosition: 0.25, leftOffset: 0, rightOffset: 0 },
    { id: "strict-right", position: 0.75, startPosition: 0.75, leftOffset: 0, rightOffset: 0 },
  ];
  const gap = 5;
  const contactTravel = 0.25;
  state.forkTravel =
    (state.origins[1].startPosition - state.origins[0].startPosition - gap / api.VIEW.moleculeWidth) / 2;
  api.setState(state);

  const beforeContact = api.getReplicationModel();
  const leftEdgeX = api.VIEW.x0 + beforeContact.regions[0].end * api.VIEW.moleculeWidth;
  const rightEdgeX = api.VIEW.x0 + beforeContact.regions[1].start * api.VIEW.moleculeWidth;
  assert.ok(beforeContact.regions[0].endBlend > 0, "fixture must be inside the terminal pull zone");
  assert.equal(beforeContact.origins[0].rightTerminalOpacity, 1);
  assert.equal(beforeContact.origins[1].leftTerminalOpacity, 1);
  assert.ok(
    api.minimalRegionEdgeTransitionWidth(beforeContact.regions[0], "end", beforeContact, state) > 40,
    "the approaching minimal fork must retain its smooth transition width"
  );

  for (const x of [leftEdgeX, leftEdgeX + gap * 0.25, (leftEdgeX + rightEdgeX) / 2, rightEdgeX]) {
    assert.equal(api.minimalReplicationAt(x, beforeContact).profile, 0);
    assert.equal(api.templateY(x, "a", beforeContact), api.VIEW.centerY);
    assert.equal(api.templateY(x, "b", beforeContact), api.VIEW.centerY);
  }

  const path = api.artworkMarkup(beforeContact).match(/<path d="([^"]+)"/)?.[1];
  const closedGapSegments = cubicSegments(path).filter(
    (segment) => segment.from.x >= leftEdgeX - 1e-3 && segment.to.x <= rightEdgeX + 1e-3
  );
  assert.ok(closedGapSegments.length > 0, "the rendered path must contain the remaining gap");
  closedGapSegments.forEach((segment) => {
    for (const point of [segment.from, segment.control1, segment.control2, segment.to]) {
      assert.ok(Math.abs(point.y - api.VIEW.centerY) < 1e-3, "the rendered gap must remain a closed line");
    }
  });

  state.forkTravel = contactTravel;
  api.setState(state);
  const atContact = api.getReplicationModel();
  const meetingX = api.VIEW.x0 + api.VIEW.moleculeWidth / 2;
  assert.equal(atContact.regions.length, 1);
  assert.equal(atContact.minimalClosures.length, 1);
  assert.equal(atContact.minimalClosures[0].blend, 0);
  assert.equal(api.minimalReplicationAt(meetingX, atContact).profile, 0);
  assert.equal(api.templateY(meetingX, "a", atContact), api.VIEW.centerY);
  assert.equal(api.templateY(meetingX, "b", atContact), api.VIEW.centerY);

  const pullFraction = api.terminalPullSpan(0.5, "right", state) / api.VIEW.moleculeWidth;
  state.forkTravel = contactTravel + pullFraction / 2;
  api.setState(state);
  const halfway = api.getReplicationModel();
  assert.ok(Math.abs(halfway.minimalClosures[0].blend - 0.5) < 1e-10);
  assert.ok(Math.abs(api.minimalReplicationAt(meetingX, halfway).profile - 0.5) < 1e-10);
  assert.ok(
    Math.abs(api.templateY(meetingX, "a", halfway) - (api.VIEW.centerY - state.daughterSpacing / 4)) < 1e-8
  );
  assert.ok(
    Math.abs(api.templateY(meetingX, "b", halfway) - (api.VIEW.centerY + state.daughterSpacing / 4)) < 1e-8
  );

  state.forkTravel = api.forkTravelBounds(state).full;
  api.setState(state);
  const completed = api.getReplicationModel();
  assert.equal(completed.minimalClosures[0].blend, 1);
  assert.equal(api.minimalReplicationAt(meetingX, completed).profile, 1);
  assert.ok(api.templateY(meetingX, "a", completed) < api.VIEW.centerY - state.daughterSpacing * 0.45);
  assert.ok(api.templateY(meetingX, "b", completed) > api.VIEW.centerY + state.daughterSpacing * 0.45);
});

test("minimal lines keep a chromosome tail closed, meet the end, then lift apart", () => {
  const state = freshState();
  state.advanced.strandModel = "minimal";
  state.origins = [{ id: "strict-end", position: 0.5, startPosition: 0.5, leftOffset: 0, rightOffset: 0 }];
  const tail = 4;
  const contactTravel = 0.5;
  state.forkTravel = contactTravel - tail / api.VIEW.moleculeWidth;
  api.setState(state);

  const beforeEnd = api.getReplicationModel();
  const edgeX = api.VIEW.x0 + beforeEnd.regions[0].end * api.VIEW.moleculeWidth;
  assert.ok(beforeEnd.regions[0].endBlend > 0, "fixture must be inside the terminal pull zone");
  assert.ok(
    api.minimalRegionEdgeTransitionWidth(beforeEnd.regions[0], "end", beforeEnd, state) > 40,
    "the approaching chromosome end must retain its smooth transition width"
  );
  for (const x of [edgeX, edgeX + tail / 2, api.VIEW.x1]) {
    assert.equal(api.minimalReplicationAt(x, beforeEnd).profile, 0);
    assert.equal(api.templateY(x, "a", beforeEnd), api.VIEW.centerY);
    assert.equal(api.templateY(x, "b", beforeEnd), api.VIEW.centerY);
  }

  const path = api.artworkMarkup(beforeEnd).match(/<path d="([^"]+)"/)?.[1];
  const closedTailSegments = cubicSegments(path).filter((segment) => segment.from.x >= edgeX - 1e-3);
  assert.ok(closedTailSegments.length > 0, "the rendered path must contain the remaining chromosome tail");
  closedTailSegments.forEach((segment) => {
    for (const point of [segment.from, segment.control1, segment.control2, segment.to]) {
      assert.ok(Math.abs(point.y - api.VIEW.centerY) < 1e-3, "the rendered tail must remain a closed line");
    }
  });

  state.forkTravel = contactTravel;
  api.setState(state);
  const atEnd = api.getReplicationModel();
  assert.equal(atEnd.regions[0].openEnd, true);
  assert.equal(atEnd.regions[0].endClosureBlend, 0);
  assert.equal(api.minimalReplicationAt(api.VIEW.x1, atEnd).profile, 0);
  assert.equal(api.templateY(api.VIEW.x1, "a", atEnd), api.VIEW.centerY);
  assert.equal(api.templateY(api.VIEW.x1, "b", atEnd), api.VIEW.centerY);

  const pullFraction = api.terminalPullSpan(1, "right", state) / api.VIEW.moleculeWidth;
  state.forkTravel = contactTravel + pullFraction / 2;
  api.setState(state);
  const halfway = api.getReplicationModel();
  assert.ok(Math.abs(halfway.regions[0].endClosureBlend - 0.5) < 1e-10);
  assert.ok(Math.abs(api.minimalReplicationAt(api.VIEW.x1, halfway).profile - 0.5) < 1e-10);

  state.forkTravel = api.forkTravelBounds(state).full;
  api.setState(state);
  const completed = api.getReplicationModel();
  assert.equal(completed.regions[0].endClosureBlend, 1);
  assert.equal(api.minimalReplicationAt(api.VIEW.x1, completed).profile, 1);
  assert.ok(api.templateY(api.VIEW.x1, "a", completed) < api.VIEW.centerY - state.daughterSpacing * 0.45);
  assert.ok(api.templateY(api.VIEW.x1, "b", completed) > api.VIEW.centerY + state.daughterSpacing * 0.45);
});

test("minimal merge/end smoothing still snaps immediately when set to zero", () => {
  const state = freshState();
  state.advanced.strandModel = "minimal";
  state.advanced.terminalSmoothing = 0;
  state.origins = [
    { id: "snap-minimal-left", position: 0.25, startPosition: 0.25, leftOffset: 0, rightOffset: 0 },
    { id: "snap-minimal-right", position: 0.75, startPosition: 0.75, leftOffset: 0, rightOffset: 0 },
  ];
  state.forkTravel = 0.25;
  api.setState(state);

  const merged = api.getReplicationModel();
  const meetingX = api.VIEW.x0 + api.VIEW.moleculeWidth / 2;
  assert.equal(merged.minimalClosures[0].blend, 1);
  assert.equal(api.minimalReplicationAt(meetingX, merged).profile, 1);
  assert.equal(api.forkTravelBounds(state).full, api.geometricForkTravelBounds(state).full);

  state.origins = [{ id: "snap-minimal-end", position: 0.5, startPosition: 0.5, leftOffset: 0, rightOffset: 0 }];
  state.forkTravel = 0.5;
  api.setState(state);
  const ended = api.getReplicationModel();
  assert.equal(ended.regions[0].endClosureBlend, 1);
  assert.equal(api.minimalReplicationAt(api.VIEW.x1, ended).profile, 1);
});

test("minimal playback and MP4 continue through the post-contact closure interval", () => {
  const state = freshState();
  state.advanced.strandModel = "minimal";
  state.advanced.terminalSmoothing = 1.5;
  state.origins = [
    { id: "tail-left", position: 0.25, startPosition: 0.25, leftOffset: 0, rightOffset: 0 },
    { id: "tail-right", position: 0.75, startPosition: 0.75, leftOffset: 0, rightOffset: 0 },
  ];
  state.forkTravel = api.geometricForkTravelBounds(state).full;
  api.setState(state);

  const contactModel = api.getReplicationModel();
  assert.equal(contactModel.activeForkCount, 0);
  assert.equal(contactModel.minimalClosures[0].blend, 0);
  assert.equal(api.playbackComplete(state), false);

  const contactTravel = state.forkTravel;
  api.advanceForkPlayback(100, state);
  assert.ok(state.forkTravel > contactTravel, "playback must continue after the forks have met");
  const lifted = api.getReplicationModelAtTravel(state.forkTravel, state);
  assert.ok(lifted.minimalClosures[0].blend > 0 && lifted.minimalClosures[0].blend < 1);

  const plan = api.videoFramePlan(state);
  assert.equal(plan.completionTravel, api.forkTravelBounds(state).full);
  assert.ok(plan.completionTravel > api.geometricForkTravelBounds(state).full);
});

test("circular transition is a quarter-circle on each side of the replication envelope", () => {
  const state = freshState();
  state.advanced.strandModel = "minimal";
  state.advanced.transitionTightness = -100;
  state.origins = [{ id: "round", position: 0.5, startPosition: 0.5, leftOffset: 0, rightOffset: 0 }];
  state.forkTravel = 0.3;
  api.setState(state);
  const model = api.getReplicationModel();
  const region = model.regions[0];
  const startX = api.VIEW.x0 + region.start * api.VIEW.moleculeWidth;
  const radius = api.regionTransitionWidth(region);
  const halfwayProfile = api.replicationAt(startX + radius / 2, model).profile;

  assert.ok(Math.abs(radius - state.daughterSpacing / 2) < 1e-8);
  assert.ok(Math.abs(halfwayProfile - Math.sqrt(3) / 2) < 1e-8);
  assert.equal(api.replicationAt(startX, model).profile, 0);
  assert.equal(api.replicationAt(startX + radius, model).profile, 1);
  assert.ok(
    Math.abs(
      api.templateY(startX + radius / 2, "a", model) +
        api.templateY(startX + radius / 2, "b", model) -
        api.VIEW.centerY * 2
    ) < 1e-8
  );
});

test("final fork pulls run continuously across the configured merge and chromosome-end distance", () => {
  const state = freshState();
  state.advanced.strandModel = "elegant";
  state.origins = [{ id: "end", position: 0.5, startPosition: 0.5, leftOffset: 0, rightOffset: 0 }];
  api.setState(state);

  const endSpan = api.terminalPullSpan(1, "right", state);
  state.advanced.transitionTightness = 100;
  assert.equal(api.terminalPullSpan(1, "right", state), endSpan, "terminal pull must stay smooth at Sharp tightness");
  const travelAtPullStart = 0.5 - endSpan / api.VIEW.moleculeWidth;
  const atPullStart = api.getReplicationModelAtTravel(travelAtPullStart, state);
  const halfwayToEnd = api.getReplicationModelAtTravel(
    travelAtPullStart + endSpan / api.VIEW.moleculeWidth / 2,
    state
  );
  const atEnd = api.getReplicationModelAtTravel(0.5, state);
  const endBlends = [
    atPullStart.origins[0].rightEdgeBlend,
    halfwayToEnd.origins[0].rightEdgeBlend,
    atEnd.origins[0].rightEdgeBlend,
  ];
  assert.ok(endBlends[0] < 1e-8);
  assert.ok(endBlends[1] > endBlends[0] && endBlends[1] < endBlends[2]);
  assert.ok(Math.abs(endBlends[2] - 1) < 1e-8);
  assert.ok(
    Math.abs(
      (halfwayToEnd.origins[0].rightPosition - atPullStart.origins[0].rightPosition) -
        (atEnd.origins[0].rightPosition - halfwayToEnd.origins[0].rightPosition)
    ) < 1e-8,
    "fork endpoint must keep moving at the replication rate during its final pull"
  );

  state.origins = [
    { id: "left", position: 0.25, startPosition: 0.25, leftOffset: 0, rightOffset: 0 },
    { id: "right", position: 0.75, startPosition: 0.75, leftOffset: 0, rightOffset: 0 },
  ];
  const meetingPoint = 0.5;
  const mergeSpan = api.terminalPullSpan(meetingPoint, "right", state);
  const travelAtMergePullStart = meetingPoint - mergeSpan / api.VIEW.moleculeWidth - state.origins[0].startPosition;
  const beforeMerge = api.getReplicationModelAtTravel(travelAtMergePullStart, state);
  const duringMerge = api.getReplicationModelAtTravel(
    travelAtMergePullStart + mergeSpan / api.VIEW.moleculeWidth / 2,
    state
  );
  const merged = api.getReplicationModelAtTravel(0.25, state);
  assert.ok(beforeMerge.origins[0].rightEdgeBlend < 1e-8);
  assert.ok(duringMerge.origins[0].rightEdgeBlend > 0 && duringMerge.origins[0].rightEdgeBlend < 1);
  assert.equal(merged.origins[0].rightEdgeBlend, 1);
  assert.equal(merged.origins[1].leftEdgeBlend, 1);
  assert.equal(merged.regions.length, 1);
});

test("default molecule is wider while preserving symmetric canvas margins", () => {
  assert.equal(api.VIEW.x0, 48);
  assert.equal(api.VIEW.x1, 1152);
  assert.equal(api.VIEW.x0, api.VIEW.width - api.VIEW.x1);
});

test("video frame plan describes an exact 60 fps timeline", () => {
  const state = freshState();
  state.speed = 1;
  const plan = api.videoFramePlan(state);
  assert.equal(plan.frameDurationSeconds, 1 / 60);
  assert.ok(plan.lastFrameIndex >= 1000);
  assert.ok(plan.lastFrameIndex * plan.travelPerFrame >= plan.completionTravel - plan.startTravel);
  assert.equal(api.videoTravelAtFrame(plan, plan.lastFrameIndex), plan.completionTravel);
  assert.equal(api.replicatedFraction(api.getReplicationModelAtTravel(plan.completionTravel, state)), 100);

  state.speed = 2;
  const doubleSpeed = api.videoFramePlan(state);
  assert.ok(Math.abs(doubleSpeed.travelPerFrame - plan.travelPerFrame * 2) < 1e-12);

  for (const legacySpeed of [0, -1, "invalid"]) {
    state.speed = legacySpeed;
    const fallback = api.videoFramePlan(state);
    const configuredFallback = api.videoFramePlan({ ...state, speed: 2.75 });
    assert.equal(fallback.travelPerFrame, configuredFallback.travelPerFrame);
    assert.ok(fallback.lastFrameIndex > 0);
    assert.equal(api.videoTravelAtFrame(fallback, fallback.lastFrameIndex), fallback.completionTravel);
    assert.equal(api.replicatedFraction(api.getReplicationModelAtTravel(fallback.completionTravel, state)), 100);
  }
});

test("video timeline retains delayed-origin order and asymmetric manual fork offsets from 0 to 100 percent", () => {
  const liveState = freshState();
  liveState.forkTravel = 0.32;
  liveState.progress = 73;
  liveState.origins = [
    { id: "early", position: 0.18, startPosition: 0.18, leftOffset: 0.12, rightOffset: 0.05 },
    { id: "middle", position: 0.5, startPosition: 0.5, leftOffset: -0.02, rightOffset: 0.03 },
    { id: "late", position: 0.82, startPosition: 0.82, leftOffset: -0.21, rightOffset: -0.13 },
  ];
  api.setState(liveState);
  const liveBefore = JSON.stringify(liveState);
  const videoState = api.makeVideoExportState();
  const plan = api.videoFramePlan(videoState);

  assert.equal(JSON.stringify(liveState), liveBefore);
  assert.deepEqual(
    Array.from(videoState.origins, ({ leftOffset, rightOffset }) => [leftOffset, rightOffset]),
    [
      [0.12, 0.05],
      [-0.02, 0.03],
      [-0.21, -0.13],
    ]
  );
  assert.ok(Math.abs(plan.startTravel + 0.12) < 1e-12, "the earliest adjusted fork must define frame zero");
  assert.equal(api.replicatedFraction(api.getReplicationModelAtTravel(plan.startTravel, videoState)), 0);
  assert.equal(api.videoTravelAtFrame(plan, plan.lastFrameIndex), plan.completionTravel);
  assert.equal(api.replicatedFraction(api.getReplicationModelAtTravel(plan.completionTravel, videoState)), 100);

  const geometryAt = (travel, id) =>
    api.getReplicationModelAtTravel(travel, videoState).origins.find((origin) => origin.id === id);
  const travelled = (origin) => [origin.startPosition - origin.leftPosition, origin.rightPosition - origin.startPosition];

  const earlyOnly = geometryAt(-0.04, "early");
  const middleDormant = geometryAt(-0.04, "middle");
  assert.deepEqual(travelled(earlyOnly).map((value) => Number(value.toFixed(8))), [0.08, 0.01]);
  assert.deepEqual(travelled(middleDormant), [0, 0]);

  const middleFired = geometryAt(0.05, "middle");
  const lateDormant = geometryAt(0.05, "late");
  assert.deepEqual(travelled(middleFired).map((value) => Number(value.toFixed(8))), [0.03, 0.08]);
  assert.deepEqual(travelled(lateDormant), [0, 0]);

  const lateRightOnly = geometryAt(0.17, "late");
  assert.deepEqual(travelled(lateRightOnly).map((value) => Number(value.toFixed(8))), [0, 0.04]);
  const lateBoth = geometryAt(0.23, "late");
  assert.deepEqual(travelled(lateBoth).map((value) => Number(value.toFixed(8))), [0.02, 0.1]);

  const firstFrame = api.fixedVideoSvgSource(videoState, plan.startTravel);
  assert.equal(api.replicatedFraction(firstFrame.model), 0);
  assert.match(firstFrame.source, /Animated DNA replication diagram/);
  const scheduledFrame = api.fixedVideoSvgSource(videoState, -0.04);
  assert.deepEqual(
    travelled(scheduledFrame.model.origins.find((origin) => origin.id === "early")).map((value) =>
      Number(value.toFixed(8))
    ),
    [0.08, 0.01]
  );
  assert.deepEqual(travelled(scheduledFrame.model.origins.find((origin) => origin.id === "middle")), [0, 0]);
  assert.equal(JSON.stringify(liveState), liveBefore, "fixed video rendering must restore the visible state");
});

test("video reaches 100 percent when an overtaken origin remains dormant until late in the timeline", () => {
  const liveState = freshState();
  liveState.origins = [
    { id: "early-wide", position: 0.2, startPosition: 0.2, leftOffset: 0.3, rightOffset: 0.3 },
    { id: "late-passive", position: 0.5, startPosition: 0.5, leftOffset: -1, rightOffset: -1 },
  ];
  api.setState(liveState);
  const videoState = api.makeVideoExportState();
  const plan = api.videoFramePlan(videoState);

  assert.ok(Math.abs(plan.startTravel + 0.3) < 1e-12);
  const justBeforeContact = api.getReplicationModelAtTravel(-0.01, videoState);
  const dormantBefore = justBeforeContact.origins.find((origin) => origin.id === "late-passive");
  assert.equal(dormantBefore.leftPosition, dormantBefore.startPosition);
  assert.equal(dormantBefore.rightPosition, dormantBefore.startPosition);

  const longAfterOvertake = api.getReplicationModelAtTravel(0.9, videoState);
  const stillDormant = longAfterOvertake.origins.find((origin) => origin.id === "late-passive");
  assert.equal(stillDormant.leftPosition, stillDormant.startPosition);
  assert.equal(stillDormant.rightPosition, stillDormant.startPosition);
  assert.ok(api.replicatedFraction(longAfterOvertake) < 100);

  const finalModel = api.getReplicationModelAtTravel(plan.completionTravel, videoState);
  assert.equal(api.videoTravelAtFrame(plan, plan.lastFrameIndex), plan.completionTravel);
  assert.equal(api.replicatedFraction(finalModel), 100);
});

test("video export preserves fork speed before and after other forks merge", () => {
  api.setState(freshState());
  const state = api.makeVideoExportState();
  state.speed = 1;
  const plan = api.videoFramePlan(state);
  const mergeTravel = (state.origins[1].startPosition - state.origins[0].startPosition) / 2;
  const beforeIndex = Math.floor((mergeTravel - plan.startTravel) / plan.travelPerFrame) - 2;
  const afterIndex = Math.ceil((mergeTravel - plan.startTravel) / plan.travelPerFrame) + 2;

  const movementAt = (frameIndex) => {
    const first = api.getReplicationModelAtTravel(api.videoTravelAtFrame(plan, frameIndex), state);
    const second = api.getReplicationModelAtTravel(api.videoTravelAtFrame(plan, frameIndex + 1), state);
    return {
      activeForkCount: first.activeForkCount,
      pixels: (first.origins[0].leftPosition - second.origins[0].leftPosition) * api.VIEW.moleculeWidth,
      progressDelta: api.replicatedFraction(second) - api.replicatedFraction(first),
    };
  };

  const before = movementAt(beforeIndex);
  const after = movementAt(afterIndex);
  assert.equal(before.activeForkCount, 4);
  assert.equal(after.activeForkCount, 2);
  assert.ok(Math.abs(before.pixels - after.pixels) < 1e-9);
  assert.ok(before.progressDelta > after.progressDelta);
});

test("direct MP4 encoder passes the documented numeric bitrate option", async () => {
  let encodingConfig = null;
  class BufferTarget {
    constructor() {
      this.buffer = null;
    }
  }
  class Output {
    constructor({ target }) {
      this.target = target;
    }
    addVideoTrack() {}
    async start() {}
    async finalize() {
      this.target.buffer = new ArrayBuffer(8);
    }
    async cancel() {}
  }
  class CanvasSource {
    constructor(_canvas, config) {
      encodingConfig = config;
    }
    async add() {}
    close() {}
  }
  sandbox.Mediabunny = {
    BufferTarget,
    Output,
    Mp4OutputFormat: class {},
    CanvasSource,
  };
  const state = freshState();
  state.speed = 5;
  state.origins = Array.from({ length: 40 }, (_, index) => {
    const position = (index + 1) / 41;
    return {
      id: `encoder-origin-${index}`,
      position,
      startPosition: position,
      leftOffset: 0,
      rightOffset: 0,
    };
  });
  api.setState(state);
  api.setElements({ statusMessage: { textContent: "" } });
  const canvas = { width: 320, height: 180 };
  const context = { fillStyle: "", fillRect() {}, drawImage() {} };

  const video = await api.encodeMp4WithMediabunnyCodec(state, canvas, context, "avc");

  assert.equal(encodingConfig.bitrate, 5_000_000);
  assert.equal("quality" in encodingConfig, false);
  assert.ok(video.size > 0);
});

test("WebM fallback is remuxed into an MP4 blob without transcoding options", async () => {
  let conversionOptions = null;
  let disposed = false;
  class BufferTarget {
    constructor() {
      this.buffer = null;
    }
  }
  class Output {
    constructor({ target }) {
      this.target = target;
    }
  }
  class Input {
    dispose() {
      disposed = true;
    }
  }
  sandbox.Mediabunny = {
    ALL_FORMATS: [{}],
    BlobSource: class {},
    BufferTarget,
    Input,
    Mp4OutputFormat: class {},
    Output,
    Conversion: {
      async init(options) {
        conversionOptions = options;
        return {
          isValid: true,
          onProgress: null,
          async execute() {
            options.output.target.buffer = new ArrayBuffer(12);
            this.onProgress?.(1);
          },
        };
      },
    },
  };

  const video = await api.remuxWebmToMp4(new Blob(["webm"], { type: "video/webm" }));

  assert.equal(conversionOptions.tracks, "primary");
  assert.equal("video" in conversionOptions, false, "remux must not force a WebCodecs transcode");
  assert.equal(disposed, true);
  assert.equal(video.type, "video/mp4");
  assert.ok(video.size > 0);
});

test("MP4 completion starts one browser download without a save picker or ready dialog", () => {
  const originalCreateElement = sandbox.document.createElement;
  const originalBody = sandbox.document.body;
  const originalUrl = sandbox.URL;
  const originalSetTimeout = sandbox.setTimeout;
  const link = {
    clicked: 0,
    removed: false,
    click() { this.clicked += 1; },
    remove() { this.removed = true; },
  };
  let appended = null;
  let revoked = null;
  sandbox.document.createElement = (tagName) => {
    assert.equal(tagName, "a");
    return link;
  };
  sandbox.document.body = {
    appendChild(node) { appended = node; },
  };
  sandbox.URL = {
    createObjectURL(blob) {
      assert.equal(blob.type, "video/mp4");
      assert.ok(blob.size > 0);
      return "blob:replicanvas-video";
    },
    revokeObjectURL(url) { revoked = url; },
  };
  sandbox.setTimeout = (callback) => {
    callback();
    return 1;
  };

  try {
    const blob = new Blob(["mp4"], { type: "video/mp4" });
    assert.equal(api.saveMp4Blob(blob, "replicanvas.mp4"), "download");
    assert.equal(appended, link);
    assert.equal(link.href, "blob:replicanvas-video");
    assert.equal(link.download, "replicanvas.mp4");
    assert.equal(link.clicked, 1, "the completed animation should download immediately");
    assert.equal(link.removed, true);
    assert.equal(revoked, "blob:replicanvas-video");
    assert.doesNotMatch(source, /showSaveFilePicker|prepareAnimationDownloadWindow/);
    assert.doesNotMatch(html, /videoReadyModal|Animation ready|videoSaveLink/);
  } finally {
    sandbox.document.createElement = originalCreateElement;
    sandbox.document.body = originalBody;
    sandbox.URL = originalUrl;
    sandbox.setTimeout = originalSetTimeout;
  }
});

test("GIF encoder writes valid indexed frames, transparency, looping and stable timing", async () => {
  const palette = api.gifPaletteSpec(128);
  assert.equal(palette.palette.length, 128 * 3);
  assert.equal(palette.minimumCodeSize, 7);
  const quantized = api.quantizeGifPixels(
    Uint8ClampedArray.from([
      10, 20, 30, 0,
      20, 80, 140, 255,
    ]),
    palette
  );
  assert.equal(quantized[0], palette.transparentIndex);
  assert.notEqual(quantized[1], palette.transparentIndex);

  // Decode the standalone LZW stream with a deliberately different decoder.
  // The pseudo-random input crosses every GIF dictionary-width boundary and
  // forces at least one 4096-entry dictionary reset.
  const original = new Uint8Array(30000);
  let seed = 0x51f15e;
  for (let index = 0; index < original.length; index += 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    original[index] = seed >>> 25;
  }
  const compressed = api.gifLzwEncode(original, 7);
  const clearCode = 1 << 7;
  const endCode = clearCode + 1;
  let bitOffset = 0;
  let codeSize = 8;
  let nextCode = endCode + 1;
  let previous = null;
  let dictionary = [];
  const decoded = [];
  const resetDictionary = () => {
    dictionary = Array.from({ length: clearCode }, (_, value) => Uint8Array.of(value));
    dictionary.length = endCode + 1;
    codeSize = 8;
    nextCode = endCode + 1;
    previous = null;
  };
  const readCode = () => {
    let code = 0;
    for (let bit = 0; bit < codeSize; bit += 1) {
      code |= ((compressed[(bitOffset + bit) >>> 3] >>> ((bitOffset + bit) & 7)) & 1) << bit;
    }
    bitOffset += codeSize;
    return code;
  };
  resetDictionary();
  while (bitOffset + codeSize <= compressed.length * 8) {
    const code = readCode();
    if (code === clearCode) {
      resetDictionary();
      continue;
    }
    if (code === endCode) break;
    let entry;
    if (code < nextCode && dictionary[code]) {
      entry = dictionary[code];
    } else if (code === nextCode && previous) {
      entry = Uint8Array.from([...previous, previous[0]]);
    } else {
      assert.fail(`invalid GIF LZW code ${code}`);
    }
    decoded.push(...entry);
    if (previous && nextCode < 4096) {
      dictionary[nextCode] = Uint8Array.from([...previous, entry[0]]);
      nextCode += 1;
      if (nextCode === 1 << codeSize && codeSize < 12) codeSize += 1;
    }
    previous = entry;
  }
  assert.deepEqual(Uint8Array.from(decoded), original);

  const encoder = api.createGifEncoder(2, 2, { colors: 64, loop: true });
  encoder.addFrame(
    Uint8ClampedArray.from([
      0, 0, 0, 0, 30, 90, 150, 255,
      160, 40, 50, 255, 240, 245, 245, 255,
    ]),
    { delayCentiseconds: 7 }
  );
  encoder.addFrame(
    Uint8ClampedArray.from([
      30, 90, 150, 255, 0, 0, 0, 0,
      240, 245, 245, 255, 160, 40, 50, 255,
    ]),
    { delayCentiseconds: 6 }
  );
  assert.equal(encoder.frameCount, 2);
  const blob = encoder.finish();
  assert.equal(blob.type, "image/gif");
  const bytes = new Uint8Array(await blob.arrayBuffer());
  assert.equal(Buffer.from(bytes.subarray(0, 6)).toString("ascii"), "GIF89a");
  assert.equal(bytes[6] | (bytes[7] << 8), 2);
  assert.equal(bytes[8] | (bytes[9] << 8), 2);
  assert.ok(Buffer.from(bytes).includes(Buffer.from("NETSCAPE2.0")));
  assert.equal(bytes.at(-1), 0x3b);
  let graphicControlBlocks = 0;
  for (let index = 0; index < bytes.length - 2; index += 1) {
    if (bytes[index] === 0x21 && bytes[index + 1] === 0xf9 && bytes[index + 2] === 0x04) {
      graphicControlBlocks += 1;
      assert.equal(bytes[index + 3], 0x09, "frames restore a transparent background");
    }
  }
  assert.equal(graphicControlBlocks, 2);

  const delays = Array.from({ length: 45 }, (_, index) =>
    api.gifFrameDelayCentiseconds(index, 15)
  );
  assert.deepEqual([...new Set(delays)].sort(), [6, 7]);
  assert.equal(delays.reduce((sum, delay) => sum + delay, 0), 300);
});

test("GIF appears before MP4 and completion starts one browser download", () => {
  const pdfIndex = html.indexOf('id="exportPdfButton"');
  const gifIndex = html.indexOf('id="exportGifButton"');
  const mp4Index = html.indexOf('id="exportMp4Button"');
  assert.ok(pdfIndex < gifIndex && gifIndex < mp4Index);
  assert.match(source, /exportGifButton\.addEventListener\("click", \(\) => runDownload\(exportGif\)\)/);

  const originalCreateElement = sandbox.document.createElement;
  const originalBody = sandbox.document.body;
  const originalUrl = sandbox.URL;
  const originalSetTimeout = sandbox.setTimeout;
  const link = {
    clicked: 0,
    click() { this.clicked += 1; },
    remove() {},
  };
  sandbox.document.createElement = (tagName) => {
    assert.equal(tagName, "a");
    return link;
  };
  sandbox.document.body = { appendChild() {} };
  sandbox.URL = {
    createObjectURL(blob) {
      assert.equal(blob.type, "image/gif");
      return "blob:replicanvas-gif";
    },
    revokeObjectURL() {},
  };
  sandbox.setTimeout = (callback) => {
    callback();
    return 1;
  };

  try {
    assert.equal(api.saveGifBlob(new Blob(["gif"]), "replicanvas.gif"), "download");
    assert.equal(link.href, "blob:replicanvas-gif");
    assert.equal(link.download, "replicanvas.gif");
    assert.equal(link.clicked, 1);
  } finally {
    sandbox.document.createElement = originalCreateElement;
    sandbox.document.body = originalBody;
    sandbox.URL = originalUrl;
    sandbox.setTimeout = originalSetTimeout;
  }
});

test("MP4 busy state exposes determinate progress and remains unavailable without origins", () => {
  const attributes = {};
  const frameAttributes = {};
  const spinnerAttributes = {};
  const spinnerStyle = {};
  const label = { textContent: "Download" };
  const downloadButton = {
    disabled: false,
    setAttribute(name, value) {
      attributes[name] = value;
    },
  };
  const canvasFrame = {
    toggleAttribute(name, value) {
      frameAttributes[name] = value;
    },
  };
  const spinner = {
    hidden: true,
    style: {
      setProperty(name, value) { spinnerStyle[name] = value; },
    },
    setAttribute(name, value) { spinnerAttributes[name] = value; },
  };
  const exportButton = { disabled: false };
  const gifExportButton = { disabled: false };
  const exportDescription = { textContent: "" };
  const gifExportDescription = { textContent: "" };
  api.setState(freshState());
  api.setElements({
    canvasFrame,
    downloadButton,
    downloadButtonLabel: label,
    downloadButtonSpinner: spinner,
    exportMp4Button: exportButton,
    exportMp4Description: exportDescription,
    exportGifButton: gifExportButton,
    exportGifDescription: gifExportDescription,
  });

  api.setVideoExportBusy(true);
  assert.equal(label.textContent, "Generating...");
  assert.equal(downloadButton.disabled, true);
  assert.equal(spinner.hidden, false);
  assert.equal(attributes["aria-busy"], "true");
  assert.equal(frameAttributes["aria-busy"], true);
  api.setVideoExportProgress(0.42);
  assert.equal(Number(spinnerStyle["--rs-video-progress"]), 0.42);
  assert.equal(spinnerAttributes["data-progress"], "42");
  assert.equal(attributes["aria-label"], "Generating animation 42%");

  api.setVideoExportBusy(false);
  assert.equal(label.textContent, "Download");
  assert.equal(downloadButton.disabled, false);
  assert.equal(spinner.hidden, true);
  assert.equal(attributes["aria-busy"], "false");
  assert.equal(frameAttributes["aria-busy"], false);
  assert.equal(exportButton.disabled, false);
  assert.equal(gifExportButton.disabled, false);

  const empty = freshState();
  empty.origins = [];
  api.setState(empty);
  assert.equal(api.animationExportAvailable(empty), false);
  api.setVideoExportBusy(false);
  assert.equal(exportButton.disabled, true, "MP4 should be greyed out when S phase has no origins");
  assert.equal(gifExportButton.disabled, true, "GIF should be greyed out when S phase has no origins");
  assert.match(source, /exportMp4Description[\s\S]*Add an origin to enable/);
  assert.match(source, /exportGifDescription[\s\S]*Add an origin to enable/);
  assert.match(css, /conic-gradient\([\s\S]*?--rs-video-progress/);
  assert.match(css, /\.rs-download-menu button:disabled\s*\{[^}]*cursor:\s*not-allowed/s);
});

test("layer toggle inputs are anchored to their local visible switches", () => {
  assert.match(css, /\.rs-toggle\s*\{[^}]*position:\s*relative/s);
  assert.match(css, /\.rs-toggle input\s*\{[^}]*top:\s*50%[^}]*right:\s*0[^}]*width:\s*34px[^}]*height:\s*18px/s);
});

test("advanced canvas controls and permanent hover controls are wired", () => {
  assert.match(html, /id="backgroundColorControl"[^>]*type="color"/);
  assert.match(html, /id="alwaysShowControlsToggle"[^>]*type="checkbox"[^>]*checked/);
  assert.match(html, /id="transitionTightnessControl"[^>]*min="-100"[^>]*max="100"/);
  assert.match(html, /id="terminalSmoothingControl"[^>]*min="0"[^>]*max="6"[^>]*step="0\.25"/);
  assert.match(html, /id="snapToBasePairsToggle"[^>]*type="checkbox"/);
  assert.match(html, /id="discreteAnimationToggle"[^>]*type="checkbox"/);
  assert.match(html, /Move every active fork one base pair at a time/);
  assert.match(source, /sourceState\.advanced\.snapToBasePairs/);
  assert.match(source, /sourceState\.discreteAnimation/);
  assert.doesNotMatch(html, /id="originsToggle"/);
  assert.doesNotMatch(html, /id="simplifiedToggle"/);
  assert.doesNotMatch(source, /elements\.simplifiedToggle/);
  assert.doesNotMatch(source, /layers\.origins|originsToggle/);
  assert.match(css, /\.rs-fork-control-visual\s*\{[^}]*opacity:\s*0/s);
  assert.match(css, /\.rs-fork-handle:hover \.rs-fork-control-visual/);
  assert.match(css, /#dnaCanvas\.rs-show-all-controls \.rs-origin-visual/);
  for (const id of ["aspectControls", "aspectXControl", "aspectYControl"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.doesNotMatch(html, /aspectNarrowButton|aspectWidenButton|aspectResetButton|aspectOutput/);
  assert.match(html, /id="aspectXControl"[^>]*min="-100"[^>]*max="100"[^>]*value="0"/);
  assert.match(html, /id="aspectYControl"[^>]*min="-100"[^>]*max="100"[^>]*value="0"/);
  assert.match(css, /\.rs-canvas-frame:hover \.rs-aspect-controls/);
  assert.doesNotMatch(css, /\.rs-aspect-controls:focus-within/);
  assert.match(css, /\.rs-aspect-controls:has\(:focus-visible\)/);
  assert.match(css, /@media \(hover: none\)[\s\S]*\.rs-aspect-controls/);
});

test("all range controls expose the expanded safe contracts and correct initial readouts", () => {
  const contracts = {
    progressControl: ["0", "100", "1"],
    speedControl: ["0.25", "3", "0.25"],
    lengthControl: ["10", "625", "5"],
    pairResolutionControl: ["1", "10", "1"],
    basePairWidthControl: ["0.2", "16", "0.1"],
    weightControl: ["1", "20", "0.5"],
    daughterSpacingControl: ["64", "800", "4"],
    doubleStrandHeightControl: ["8", "160", "2"],
    transitionTightnessControl: ["-100", "100", "1"],
    terminalSmoothingControl: ["0", "6", "0.25"],
    newDnaStartDistanceControl: ["0", "20", "0.25"],
    strandPhaseShiftControl: ["-5", "5", "0.25"],
    basePairTranslationControl: ["-5", "5", "0.05"],
    aspectXControl: ["-100", "100", "1"],
    aspectYControl: ["-100", "100", "1"],
  };

  for (const [id, [minimum, maximum, step]] of Object.entries(contracts)) {
    const tag = html.match(new RegExp(`<input[^>]*id="${id}"[^>]*>`))?.[0];
    assert.ok(tag, `${id} must exist`);
    assert.match(tag, new RegExp(`min="${minimum.replace(".", "\\.")}"`));
    assert.match(tag, new RegExp(`max="${maximum.replace(".", "\\.")}"`));
    assert.match(tag, new RegExp(`step="${step.replace(".", "\\.")}"`));
  }

  assert.match(html, /id="lengthOutput"[^>]*>40 bp</);
  assert.match(html, /id="lengthStat"[^>]*>40 bp</);
  assert.match(html, /id="progressOutput"[^>]*>0%</);
  assert.match(html, /id="speedOutput"[^>]*>1x</);
  assert.match(html, /id="basePairWidthOutput"[^>]*>5\.0 px</);
  assert.match(html, /id="weightOutput"[^>]*>6 px</);
  assert.match(html, /id="doubleStrandHeightOutput"[^>]*>46 px</);
  assert.match(html, /id="daughterSpacingOutput"[^>]*>160 px</);
  assert.match(html, /id="pairResolutionOutput"[^>]*>3 between crossovers</);
  assert.match(html, /id="terminalSmoothingOutput"[^>]*>1\.5 bp</);
  assert.match(html, /id="newDnaStartDistanceOutput"[^>]*>0 bp</);
  assert.match(html, /id="strandPhaseShiftOutput"[^>]*>0 bp</);
  assert.match(html, /id="basePairTranslationOutput"[^>]*>Anchored</);
  assert.match(html, /id="lengthControl"[^>]*value="50"/);
  assert.match(html, /id="progressControl"[^>]*value="0"/);
  assert.match(html, /id="speedControl"[^>]*value="1"/);
  assert.match(html, /id="basePairWidthControl"[^>]*value="5"/);
  assert.match(html, /id="weightControl"[^>]*value="6"/);
  assert.match(html, /id="doubleStrandHeightControl"[^>]*value="46"/);
  assert.match(html, /id="daughterSpacingControl"[^>]*value="160"/);
  assert.doesNotMatch(html, /id="snapToBasePairsToggle"[^>]*checked/);
  assert.match(source, /const MAX_BASE_PAIR_COUNT = 500/);
  assert.match(source, /const MIN_ZOOM = 0\.1/);
  assert.match(html, /<section class="rs-control-section rs-compact-section">[\s\S]*?<h2>Controls<\/h2>/);
});

test("ruler shows only labelled ticks from the shared genomic sampling lattice", () => {
  assert.match(source, /Genomic position \(bp\)/);
  assert.match(source, /function rulerTickIndices\(majorEvery/);
  assert.match(source, /<output>\$\{label\}<\/output>/);
  assert.doesNotMatch(source, /labelled \? `<output>/);
  assert.match(source, /function basePairLattice\(/);
  assert.match(source, /function basePairFraction\(/);
  assert.match(source, /function genomicPositionAtFraction\(/);
  assert.match(source, /between crossovers/);
  assert.match(html, /id="pairResolutionOutput"/);
  assert.match(html, /<span>Genomic length<\/span>[\s\S]*id="lengthOutput"/);
  assert.match(source, /class="rs-ruler-axis"/);
});

test("ruler axis continues across the viewport without extending genomic ticks", () => {
  const state = freshState();
  state.length = 90;
  state.pairResolution = 3;
  api.setState(state);
  const genomicLength = api.basePairCount();
  assert.ok(api.rulerTickIndices(api.rulerMajorEvery(7.25)).every((index) => index >= 0 && index <= genomicLength));
  assert.match(source, /<span class="rs-ruler-axis"><\/span>/);
  assert.doesNotMatch(source, /class="rs-ruler-axis" style=/);
  assert.match(css, /\.rs-ruler-axis\s*\{[^}]*right:\s*0;[^}]*left:\s*0;/s);
});

test("statusbar exposes compact project resources, version, selection, and latest action", () => {
  assert.match(html, /class="rs-project-link"[\s\S]*href="https:\/\/github\.com\/fberkemeier\/RepliCanvas"/);
  assert.match(html, /href="https:\/\/github\.com\/fberkemeier\/RepliCanvas#readme"[\s\S]*aria-label="Documentation"/);
  assert.match(html, /href="https:\/\/github\.com\/fberkemeier\/RepliCanvas\/issues\/new"[\s\S]*aria-label="Raise an issue"/);
  assert.match(html, /class="rs-project-version">v1\.3\.5<\/span>/);
  assert.match(css, /--rs-project-blue:\s*#3c9ab7/);
  assert.match(css, /--rs-project-menu-blue:\s*#022851/);
  assert.match(css, /\.rs-project-version\s*\{[^}]*border:\s*0;[^}]*background:\s*transparent;[^}]*color:\s*var\(--rs-project-blue\)[^}]*font-weight:\s*400/s);
  assert.match(css, /\.rs-project-link\s*\{[^}]*color:\s*var\(--rs-project-blue\)/s);
  assert.doesNotMatch(css, /--rs-template-a/);
  assert.doesNotMatch(html, /<div class="rs-brand">[\s\S]*?rs-project-meta[\s\S]*?<\/div>\s*<div class="rs-top-actions"/);
  assert.match(
    html,
    /class="rs-status-copy"[\s\S]*id="selectionMessage"[\s\S]*rs-status-separator[\s\S]*id="statusMessage"/
  );
  assert.match(html, /class="rs-project-meta rs-status-project-meta"/);
  assert.match(html, /id="projectMenuButton"[\s\S]*aria-controls="projectMenu"/);
  assert.match(html, /id="projectMenu"[\s\S]*GitHub[\s\S]*Documentation[\s\S]*Raise an issue[\s\S]*Theme/);
  assert.doesNotMatch(html, /rs-menu-chevron/);
  assert.match(css, /\.rs-project-menu-button\s*\{[^}]*background:\s*var\(--rs-project-menu-blue\)[^}]*color:\s*#ffffff/s);
  assert.match(css, /\.rs-project-menu-panel (?:a|button),[\s\S]*?color:\s*var\(--rs-ink\)/);
  assert.match(css, /\.rs-topbar\s*\{[^}]*z-index:\s*100/s);
  assert.match(css, /\.rs-body\s*\{[^}]*z-index:\s*0/s);
  assert.match(css, /\.rs-download-menu\s*\{[^}]*z-index:\s*120/s);
  assert.match(css, /\.rs-project-menu-panel\s*\{[^}]*z-index:\s*120/s);
  assert.match(css, /\.rs-zoom-controls\s*\{[^}]*z-index:\s*3/s);
  assert.match(css, /\.rs-zoom-controls output\s*\{[^}]*border-left:\s*1px solid var\(--rs-soft\)/s);
  assert.match(css, /\.rs-aspect-controls\s*\{[^}]*z-index:\s*3/s);
  assert.doesNotMatch(css, /\.rs-zoom-controls:focus-within|\.rs-aspect-controls:focus-within/);
  const lightbulbs = html.match(/M9 18h6M10 22h4M8\.5 15\.5/g) || [];
  assert.equal(lightbulbs.length, 2, "issue links in the menu and status bar must both use light bulbs");
  assert.match(html, /rs-guide-fork-control[\s\S]*M-3-5L3 0-3 5[\s\S]*Drag fork/);
  assert.doesNotMatch(html, /&#8249;|&#8250;/);
});

test("browser metadata and configuration file actions are exposed accessibly", () => {
  assert.match(html, /<title>RepliCanvas<\/title>/);
  assert.match(html, /<link[^>]*rel="icon"[^>]*type="image\/png"[^>]*href="assets\/img\/logo_small\.png"/);
  assert.ok(fs.existsSync(path.join(__dirname, "..", "assets", "img", "logo_small.png")));
  assert.match(html, /id="saveConfigButton"[^>]*aria-label="Save configuration"/);
  assert.match(html, /id="loadConfigButton"[^>]*aria-label="Load configuration"/);
  const resetButton = html.match(/<button[^>]*id="resetButton"[\s\S]*?<\/button>/)?.[0] || "";
  assert.match(resetButton, /aria-label="Reset molecule"/);
  assert.match(resetButton, /<svg[^>]*aria-hidden="true"[\s\S]*M3 12a9 9 0 1 0/);
  assert.doesNotMatch(resetButton, /&#8635;/);
  assert.match(
    html,
    /id="configFileInput"[^>]*type="file"[^>]*accept="\.replicanvas\.json,\.json,application\/json"[^>]*hidden/
  );
});

test("versioned configuration files round-trip all document settings", () => {
  const state = freshState();
  state.length = 135;
  state.speed = 2.25;
  state.discreteAnimation = true;
  state.colors.newDna = "#123abc";
  state.colors.adenine = "#aa1122";
  state.basePairColorMode = "bases";
  state.basePairSeed = 987654321;
  state.advanced.newDnaStartDistance = 4.25;
  state.advanced.strandPhaseShift = -1.5;
  state.advanced.basePairTranslation = 0.35;
  state.advanced.includeExportBackground = true;
  state.advanced.snapToBasePairs = true;
  state.advanced.aspectX = 1.4;
  state.advanced.aspectY = 0.8;
  state.origins[0].leftOffset = 0.125;
  state.cuts = [{ start: 0.2, end: 0.28 }];
  state.selectedOriginId = state.origins[1].id;
  api.setState(state);

  const documentState = api.configurationDocument();
  const loaded = api.parseConfigurationText(JSON.stringify(documentState));

  assert.equal(documentState.format, "RepliCanvas");
  assert.equal(documentState.schemaVersion, 1);
  assert.equal(documentState.appVersion, "1.3.5");
  assert.equal(loaded.length, 135);
  assert.equal(loaded.speed, 2.25);
  assert.equal(loaded.discreteAnimation, true);
  assert.equal(loaded.colors.newDna, "#123abc");
  assert.equal(loaded.colors.adenine, "#aa1122");
  assert.equal(loaded.basePairColorMode, "bases");
  assert.equal(loaded.basePairSeed, 987654321);
  assert.equal(loaded.advanced.newDnaStartDistance, 4.25);
  assert.equal(loaded.advanced.strandPhaseShift, -1.5);
  assert.equal(loaded.advanced.basePairTranslation, 0.35);
  assert.equal(loaded.advanced.includeExportBackground, true);
  assert.equal(loaded.advanced.snapToBasePairs, true);
  assert.equal(loaded.advanced.aspectX, 1.4);
  assert.equal(loaded.advanced.aspectY, 0.8);
  assert.equal(loaded.origins[0].leftOffset, 0.125);
  assert.equal(loaded.cuts[0].start, 0.2);
  assert.equal(loaded.selectedOriginId, state.origins[1].id);
  assert.equal(loaded.playing, false);
});

test("legacy configuration documents retain their visual handedness after the rename", () => {
  const state = freshState();
  state.advanced.dnaHandedness = "left";
  api.setState(state);
  const legacyDocument = api.configurationDocument();
  legacyDocument.format = ["Repli", "Sketch"].join("");
  legacyDocument.state.advanced.dnaHandedness = "left";

  const migrated = api.parseConfigurationText(JSON.stringify(legacyDocument));
  assert.equal(migrated.advanced.dnaHandedness, "right");
});

test("the application and distributable source use the RepliCanvas identity", () => {
  const formerBrand = ["Repli", "Sketch"].join("");
  const formerSlug = ["repli", "sketch"].join("");
  assert.match(html, /<title>RepliCanvas<\/title>/);
  assert.match(html, /https:\/\/fberkemeier\.github\.io\/RepliCanvas\//);
  assert.match(html, /https:\/\/github\.com\/fberkemeier\/RepliCanvas/);
  assert.match(source, /const CONFIG_FORMAT = "RepliCanvas"/);
  assert.match(source, /const TEMPLATE_CACHE_KEY = "replicanvas-template-v1"/);
  assert.doesNotMatch(html, new RegExp(formerBrand, "i"));
  assert.doesNotMatch(require("node:fs").readFileSync(path.join(__dirname, "..", "README.md"), "utf8"), new RegExp(formerBrand, "i"));
  assert.ok(fs.existsSync(path.join(__dirname, "..", "assets", "js", "replicanvas.js")));
  assert.ok(fs.existsSync(path.join(__dirname, "..", "assets", "css", "replicanvas.css")));
  assert.equal(fs.existsSync(path.join(__dirname, "..", "assets", "js", `${formerSlug}.js`)), false);
  assert.equal(fs.existsSync(path.join(__dirname, "..", "assets", "css", `${formerSlug}.css`)), false);
});

test("configuration parsing rejects unsafe or structurally invalid documents", () => {
  const state = freshState();
  api.setState(state);
  const valid = api.configurationDocument();
  const sourceWith = (change) => {
    const copy = JSON.parse(JSON.stringify(valid));
    change(copy);
    return JSON.stringify(copy);
  };

  assert.throws(() => api.parseConfigurationText("not json"), /invalid or damaged file/);
  assert.throws(
    () => api.parseConfigurationText(sourceWith((documentState) => (documentState.schemaVersion = 2))),
    /newer RepliCanvas version/
  );
  assert.throws(
    () =>
      api.parseConfigurationText(
        sourceWith((documentState) => (documentState.state.colors.templateA = '\" onload="alert(1)'))
      ),
    /hexadecimal colour/
  );
  assert.throws(
    () =>
      api.parseConfigurationText(
        sourceWith((documentState) => (documentState.state.origins[1].id = documentState.state.origins[0].id))
      ),
    /duplicated/
  );
  assert.throws(
    () => api.parseConfigurationText(sourceWith((documentState) => (documentState.state.cuts = "bad"))),
    /state\.cuts is invalid/
  );
});

test("loaded origin identifiers cannot collide with subsequently created origins", () => {
  const loadedState = freshState();
  loadedState.origins = [
    { id: "origin-450", position: 0.4, startPosition: 0.4, leftOffset: 0, rightOffset: 0 },
  ];
  api.reseedNextOriginId(loadedState);
  assert.equal(api.nextAvailableOriginId(loadedState), "origin-451");
});

test("moving replication details cross-fade instead of popping", () => {
  assert.equal(api.daughterDetailFade(0.38), 0);
  assert.ok(api.daughterDetailFade(0.47) > 0 && api.daughterDetailFade(0.47) < 1);
  assert.equal(api.daughterDetailFade(0.56), 1);
  assert.equal(api.parentalPairFade(0), 1);
  assert.ok(api.parentalPairFade(0.06) > 0 && api.parentalPairFade(0.06) < 1);
  assert.equal(api.parentalPairFade(0.12), 0);
  assert.equal(api.parentalPairFade(0.19), 0);
});

test("base-pair distance fade retains its one-third physical threshold", () => {
  const state = freshState();
  state.daughterSpacing = 152;

  assert.equal(api.basePairDistanceFade(0, 40, state), 1);
  assert.ok(api.basePairDistanceFade(0, 46, state) > 0 && api.basePairDistanceFade(0, 46, state) < 1);
  assert.equal(api.basePairDistanceFade(0, 152 / 3, state), 0);
  assert.equal(api.basePairDistanceFade(0, 80, state), 0);
  assert.equal(api.basePairDistanceFade(90, 90 - 152 / 3, state), 0, "endpoint order must not affect the gate");
});

test("fork-local distance influence leaves stable duplexes uncapped", () => {
  const state = freshState();
  state.advanced.strandModel = "elegant";
  state.daughterSpacing = 64;
  state.doubleStrandHeight = 24;
  state.origins = [{ id: "local-gate", position: 0.5, startPosition: 0.5, leftOffset: 0, rightOffset: 0 }];
  state.forkTravel = 0.2;
  api.setState(state);

  const model = api.getReplicationModel();
  const stableUnreplicatedX = api.VIEW.x0;
  const stableReplicatedX = api.VIEW.x0 + api.VIEW.moleculeWidth / 2;
  const region = model.regions[0];
  const edgeX = api.VIEW.x0 + region.start * api.VIEW.moleculeWidth;
  const transitionX = edgeX + api.regionEdgeTransitionWidth(region, "start", model) / 2;
  const endpointDistance = state.doubleStrandHeight;

  assert.equal(api.basePairDistanceFade(0, endpointDistance, state), 0, "the raw distance exceeds one third");
  assert.equal(api.basePairForkInfluence(stableUnreplicatedX, model), 0);
  assert.equal(api.basePairForkInfluence(stableReplicatedX, model), 0);
  assert.equal(api.basePairForkDistanceFade(stableUnreplicatedX, 0, endpointDistance, model), 1);
  assert.equal(api.basePairForkDistanceFade(stableReplicatedX, 0, endpointDistance, model), 1);

  const transitionReplication = api.replicationAt(transitionX, model);
  assert.ok(Math.abs(transitionReplication.profile - 0.5) < 1e-8);
  assert.equal(api.basePairTransitionInfluence(transitionReplication.profile), 1);
  assert.equal(api.basePairForkInfluence(transitionX, model, transitionReplication), 1);
  assert.equal(api.basePairForkDistanceFade(transitionX, 0, endpointDistance, model, transitionReplication), 0);
});

test("stable base-pair rungs remain rendered when duplex height exceeds one third of daughter spacing", () => {
  for (const modelName of ["standard", "elegant"]) {
    const state = freshState();
    state.advanced.strandModel = modelName;
    state.daughterSpacing = 64;
    state.doubleStrandHeight = 24;
    state.pairResolution = 6;
    state.origins = [{ id: `stable-${modelName}`, position: 0.5, startPosition: 0.5, leftOffset: 0, rightOffset: 0 }];
    state.forkTravel = 0.2;
    api.setState(state);

    const markup = api.renderBasePairs(api.getReplicationModel());
    const lines = [...markup.matchAll(/<line x1="([\d.-]+)" y1="([\d.-]+)" x2="[\d.-]+" y2="([\d.-]+)"/g)].map(
      (match) => ({ x: Number(match[1]), length: Math.abs(Number(match[3]) - Number(match[2])) })
    );
    const firstRungX = api.VIEW.x0 + api.basePairFraction(0) * api.VIEW.moleculeWidth;
    const middleRungIndex = api.genomicPositionAtFraction(0.5);
    const middleRungX = api.VIEW.x0 + api.basePairFraction(middleRungIndex) * api.VIEW.moleculeWidth;
    const unreplicatedRungs = lines.filter((line) => Math.abs(line.x - firstRungX) < 0.06);
    const replicatedRungs = lines.filter((line) => Math.abs(line.x - middleRungX) < 0.06);

    assert.equal(unreplicatedRungs.length, 1, `${modelName} stable parental rung must remain visible`);
    assert.equal(replicatedRungs.length, 2, `${modelName} stable daughter rungs must remain visible`);
    assert.ok(
      [...unreplicatedRungs, ...replicatedRungs].every((line) => line.length > state.daughterSpacing / 3),
      "fixture must exercise stable rungs beyond the former global cap"
    );
  }
});

test("terminal visual bridges retain the fork-local long-rung gate", () => {
  const state = freshState();
  state.advanced.strandModel = "elegant";
  state.daughterSpacing = 64;
  state.doubleStrandHeight = 24;
  state.pairResolution = 6;
  state.origins = [
    { id: "bridge-left", position: 0.25, startPosition: 0.25, leftOffset: 0, rightOffset: 0 },
    { id: "bridge-right", position: 0.75, startPosition: 0.75, leftOffset: 0, rightOffset: 0 },
  ];
  const gap = 5;
  state.forkTravel = (0.5 - gap / api.VIEW.moleculeWidth) / 2;
  api.setState(state);

  const model = api.getReplicationModel();
  const bridgeX = api.VIEW.width / 2;
  const replication = api.replicationAt(bridgeX, model);
  const visualReplication = api.visualReplicationAt(bridgeX, model);
  const firstY = api.templateY(bridgeX, "a", model);
  const secondY = api.templateY(bridgeX, "b", model);
  assert.equal(replication.region, null);
  assert.equal(visualReplication.visualBridge, true);
  assert.equal(api.basePairForkInfluence(bridgeX, model, replication), 1);
  assert.equal(api.basePairForkDistanceFade(bridgeX, firstY, secondY, model, replication), 0);

  const renderedBridgeXs = [...api.renderBasePairs(model).matchAll(/<line x1="([\d.-]+)"/g)].map((match) =>
    Number(match[1])
  );
  assert.ok(!renderedBridgeXs.some((x) => Math.abs(x - bridgeX) < 0.01), "the long terminal bridge rung must stay hidden");
});

test("parental base-pair rungs fade at the fork instead of fanning into a bubble", () => {
  const state = freshState();
  state.origins = [
    {
      id: "origin-pair-fade",
      position: 0.5,
      startPosition: 0.5,
      leftOffset: 0,
      rightOffset: 0,
    },
  ];
  state.forkTravel = 0.14;
  state.pairResolution = 6;
  api.setState(state);

  const model = api.getReplicationModel();
  const region = model.regions[0];
  const leftForkX = api.VIEW.x0 + region.start * api.VIEW.moleculeWidth;
  const nearUnreplicatedFade = api.parentalPairApproachFade(leftForkX - 1, model, state);
  assert.ok(
    nearUnreplicatedFade > 0 && nearUnreplicatedFade < 1,
    "the final unreplicated rungs should fade as a fork approaches"
  );
  assert.equal(
    api.parentalPairApproachFade(leftForkX, model, state),
    0,
    "a parental rung must disappear as soon as its position is crossed"
  );
  assert.equal(
    api.parentalPairApproachFade(leftForkX - 60, model, state),
    1,
    "rungs well away from a fork should remain fully opaque"
  );

  const renderedXs = new Set(
    [...api.renderBasePairs(model).matchAll(/<line x1="([\d.-]+)"/g)].map((match) => Number(match[1]))
  );
  const lingeringParentalSamples = api
    .displayedBasePairPositions()
    .map((index) => api.VIEW.x0 + api.basePairFraction(index) * api.VIEW.moleculeWidth)
    .filter((x) => {
      const replication = api.replicationAt(x, model);
      return replication.region && replication.profile >= 0.12 && replication.profile < 0.38;
    });

  assert.ok(lingeringParentalSamples.length > 0, "fixture must cover the former fan-shaped fade zone");
  assert.ok(
    lingeringParentalSamples.every((x) => !renderedXs.has(Number(x.toFixed(1)))),
    "no parental rung should remain once the fork has begun separating"
  );
});

test("custom canvas backgrounds keep previews legible while static exports remain transparent", async () => {
  const light = freshState();
  light.advanced.backgroundColor = "#ffffff";
  const dark = freshState();
  dark.advanced.backgroundColor = "#000000";
  assert.ok(api.backgroundLuminance(light) > api.backgroundLuminance(dark));
  assert.equal(api.canvasInkColor(light), "#43545a");
  assert.equal(api.canvasInkColor(dark), "#eef5f3");
  assert.match(api.canvasGridColor(dark), /255, 255, 255/);
  assert.match(css, /var\(--rs-grid-line/);
  assert.match(css, /var\(--rs-canvas-ink/);
  assert.match(source, /if \(state\.advanced\.includeExportBackground\)/);
  assert.match(source, /background\.setAttribute\("fill", canvasBackgroundColor\(\)\)/);
  assert.equal(light.advanced.includeExportBackground, false, "static exports remain transparent by default");
  assert.match(source, /getContext\("2d", \{ alpha: true \}\)/);
  assert.match(source, /context\.clearRect\(0, 0, canvas\.width, canvas\.height\)/);
  assert.match(source, /overflow:hidden;background:transparent/);
  assert.match(html, /id="includeExportBackgroundToggle"[^>]*type="checkbox"/);
  assert.match(html, /<strong>PNG<\/strong><span>High-resolution raster, 2x<\/span>/);

  // MP4 stays opaque because the supported MP4 codecs do not preserve alpha.
  dark.speed = 5;
  let paintedBackground = "";
  const context = {
    fillStyle: "",
    fillRect() {
      paintedBackground = this.fillStyle;
    },
    drawImage() {},
  };
  await api.drawVideoFrame({ width: 320, height: 180 }, context, dark, 0);
  assert.equal(paintedBackground, "#000000");
});

test("dark theme preserves molecular colours while inverting the canvas, labels, and logo", () => {
  const state = freshState();
  state.colors.templateA = "#067e94";
  state.colors.templateB = "#022851";
  state.colors.newDna = "#8b1e2d";
  state.colors.basePair = "#022851";
  state.advanced.backgroundColor = "#f8faf9";
  api.setState(state);
  const canvasLegend = { hidden: false, innerHTML: "" };
  api.setElements({ canvasLegend });

  try {
    api.setThemeMode("light");
    assert.equal(api.stateArtworkColour("templateA", state), "#067e94");
    assert.equal(api.canvasBackgroundColor(state), "#f8faf9");

    api.setThemeMode("dark");
    assert.equal(api.darkArtworkEnabled(), true);
    assert.equal(api.invertHexColour("#067e94"), "#f9816b");
    assert.equal(api.stateArtworkColour("templateA", state), "#067e94");
    assert.equal(api.stateArtworkColour("templateB", state), "#022851");
    assert.equal(api.stateArtworkColour("newDna", state), "#8b1e2d");
    assert.equal(api.canvasBackgroundColor(state), "#070506");
    assert.equal(api.canvasInkColor(state), "#eef5f3");
    assert.match(api.canvasGridColor(state), /255, 255, 255/);

    const markup = api.artworkMarkup(api.getReplicationModel());
    assert.match(markup, /stroke="#067e94"/);
    assert.match(markup, /stroke="#022851"/);
    assert.match(markup, /stroke="#8b1e2d"/);

    api.updateCanvasLegend();
    assert.match(canvasLegend.innerHTML, /background:#067e94[^>]*><\/span>Template A/);
    assert.match(canvasLegend.innerHTML, /background:#022851[^>]*><\/span>Template B/);
    assert.match(canvasLegend.innerHTML, /background:#8b1e2d[^>]*><\/span>New strands/);
    assert.equal(api.backgroundControlColor(state), "#070506");
    assert.equal(api.configuredBackgroundColor("#070506"), "#f8faf9");

    assert.equal(state.colors.templateA, "#067e94", "theme inversion must not mutate saved colours");
    assert.equal(state.advanced.backgroundColor, "#f8faf9", "theme inversion must not mutate the configured background");
  } finally {
    api.setThemeMode("system");
  }
  assert.match(css, /html\[data-theme="dark"\] \.rs-brand-logo\s*\{[^}]*filter:\s*invert\(1\)/s);
});


test("new-DNA fork distance augments rather than replaces the existing height-based start rules", () => {
  for (const modelName of ["standard", "elegant"]) {
    const state = freshState();
    state.advanced.strandModel = modelName;
    state.origins = [{ id: `distance-${modelName}`, position: 0.5, startPosition: 0.5, leftOffset: 0, rightOffset: 0 }];
    state.forkTravel = 0.28;
    state.advanced.newDnaStartDistance = 0;
    api.setState(state);
    const model = api.getReplicationModel();
    const region = model.regions[0];
    const oldSpan = api.nascentSpan(region, model);

    state.advanced.newDnaStartDistance = 8;
    const shiftedSpan = api.nascentSpan(region, model);
    const regionStart = api.VIEW.x0 + region.start * api.VIEW.moleculeWidth;
    const regionEnd = api.VIEW.x0 + region.end * api.VIEW.moleculeWidth;
    const configuredInset = api.newDnaDistanceInset(region, "start", state);

    assert.ok(shiftedSpan.fromX >= oldSpan.fromX - 1e-9);
    assert.ok(shiftedSpan.toX <= oldSpan.toX + 1e-9);
    assert.ok(shiftedSpan.fromX - regionStart >= configuredInset - 1e-9);
    assert.ok(regionEnd - shiftedSpan.toX >= api.newDnaDistanceInset(region, "end", state) - 1e-9);

    const excludedX = Math.min(shiftedSpan.fromX - 0.5, Math.max(oldSpan.fromX, regionStart) + 0.5);
    if (excludedX > regionStart && excludedX < shiftedSpan.fromX) {
      const replication = api.replicationAt(excludedX, model);
      assert.equal(api.newDnaVisibleAt(excludedX, replication, model), false);
    }
    const middleX = (shiftedSpan.fromX + shiftedSpan.toX) / 2;
    assert.equal(api.newDnaVisibleAt(middleX, api.replicationAt(middleX, model), model), true);
  }

  const terminal = freshState();
  terminal.origins = [{ id: "distance-terminal", position: 0.2, startPosition: 0.2, leftOffset: 0, rightOffset: 0 }];
  terminal.forkTravel = 0.2;
  terminal.advanced.newDnaStartDistance = 10;
  api.setState(terminal);
  const terminalModel = api.getReplicationModel();
  const terminalRegion = terminalModel.regions[0];
  assert.equal(terminalRegion.openStart, true);
  assert.equal(api.newDnaDistanceInset(terminalRegion, "start", terminal), 0);
  assert.ok(api.newDnaDistanceInset(terminalRegion, "end", terminal) > 0);
  assert.equal(api.nascentSpan(terminalRegion, terminalModel).fromX, api.VIEW.x0);
});

test("base-pair colour modes use balanced complementary pairs and reseed when sampling geometry changes", () => {
  const state = freshState();
  state.origins = [];
  state.colors = {
    ...state.colors,
    templateA: "#111111",
    templateB: "#222222",
    newDna: "#333333",
    basePair: "#444444",
    adenine: "#aa0000",
    thymine: "#00aa00",
    guanine: "#0000aa",
    cytosine: "#aaaa00",
  };
  api.setState(state);

  const identities = Array.from({ length: 160 }, (_, index) => api.basePairIdentity(index, state));
  const labels = new Set(identities.map((identity) => identity.label));
  assert.deepEqual([...labels].sort(), ["A-T", "G-C", "T-A", "C-G"].sort());
  const complement = { A: "T", T: "A", G: "C", C: "G" };
  assert.ok(identities.every(({ first, second }) => complement[first] === second));
  for (let blockStart = 0; blockStart < identities.length; blockStart += 8) {
    const blockCounts = Object.fromEntries(["A-T", "T-A", "G-C", "C-G"].map((label) => [label, 0]));
    identities.slice(blockStart, blockStart + 8).forEach(({ label }) => {
      blockCounts[label] += 1;
    });
    assert.deepEqual(blockCounts, { "A-T": 2, "T-A": 2, "G-C": 2, "C-G": 2 });
  }
  assert.deepEqual(
    identities.slice(0, 20).map(({ label }) => label),
    Array.from({ length: 20 }, (_, index) => api.basePairIdentity(index, state).label),
    "the shuffled sequence must remain stable while editing"
  );
  const reseeded = { ...state, basePairSeed: state.basePairSeed + 1 };
  assert.notDeepEqual(
    identities.slice(0, 20).map(({ label }) => label),
    Array.from({ length: 20 }, (_, index) => api.basePairIdentity(index, reseeded).label),
    "changing the stored seed must produce a different shuffled sequence"
  );
  const changedLength = { ...state, length: state.length + 5 };
  const changedResolution = { ...state, pairResolution: state.pairResolution + 1 };
  assert.notDeepEqual(
    identities.slice(0, 32).map(({ label }) => label),
    Array.from({ length: 32 }, (_, index) => api.basePairIdentity(index, changedLength).label),
    "changing chromosome length must produce a new sequence"
  );
  assert.notDeepEqual(
    identities.slice(0, 32).map(({ label }) => label),
    Array.from({ length: 32 }, (_, index) => api.basePairIdentity(index, changedResolution).label),
    "changing base-pair resolution must produce a new sequence"
  );
  const previousSeed = state.basePairSeed;
  api.reseedBasePairSequence(state, previousSeed);
  assert.notEqual(state.basePairSeed, previousSeed, "an explicit reseed must never retain the previous seed");

  state.basePairColorMode = "single";
  assert.deepEqual(Array.from(api.basePairLineColors("a", "b", "A", "T", state)), ["#444444", "#444444"]);
  state.basePairColorMode = "strand";
  assert.deepEqual(Array.from(api.basePairLineColors("a", "b", "A", "T", state)), ["#111111", "#222222"]);
  assert.deepEqual(Array.from(api.basePairLineColors("a", "top", "A", "T", state)), ["#111111", "#333333"]);
  state.basePairColorMode = "bases";
  assert.deepEqual(Array.from(api.basePairLineColors("a", "b", "A", "T", state)), ["#aa0000", "#00aa00"]);
  assert.deepEqual(Array.from(api.basePairLineColors("b", "bottom", "C", "G", state)), ["#aaaa00", "#0000aa"]);

  const twoColourLine = api.renderBasePairLine(100, 20, 60, 1, {
    firstRole: "a",
    secondRole: "b",
    firstBase: "A",
    secondBase: "T",
  });
  assert.equal((twoColourLine.match(/<line\b/g) || []).length, 4);
  assert.match(twoColourLine, /data-pair="A-T"/);
  assert.match(twoColourLine, /stroke="#aa0000"/);
  assert.match(twoColourLine, /stroke="#00aa00"/);
  assert.equal((twoColourLine.match(/stroke-linecap="butt"/g) || []).length, 2);
  assert.equal((twoColourLine.match(/data-cap=/g) || []).length, 2);
  assert.match(twoColourLine, /data-cap="first"[^>]*y1="20\.9000"[^>]*stroke-linecap="round"/);
  assert.match(twoColourLine, /data-cap="second"[^>]*y1="59\.1000"[^>]*stroke-linecap="round"/);
  assert.match(twoColourLine, /y1="20\.9000"[^>]*y2="40\.0000"/);
  assert.match(twoColourLine, /y1="40\.0000"[^>]*y2="59\.1000"/);

  state.basePairColorMode = "single";
  const opaquePairs = api.renderBasePairs(api.getReplicationModel());
  const opacities = [...opaquePairs.matchAll(/opacity="([\d.]+)"/g)].map((match) => Number(match[1]));
  assert.ok(opacities.length > 0);
  assert.ok(opacities.every((opacity) => opacity === 1), "stable base-pair rungs must be fully opaque");
});

test("connected-strand phase shifts move the partner waveform and crossover clips without tilting base pairs", () => {
  const state = freshState();
  state.origins = [];
  state.advanced.strandModel = "standard";
  state.advanced.strandPhaseShift = 0;
  api.setState(state);
  const sampleX = api.VIEW.x0 + 0.237 * api.VIEW.moleculeWidth;
  const aBefore = api.helixWave(sampleX, "a", state);
  const bBefore = api.helixWave(sampleX, "b", state);
  const sitesBefore = new Map(api.crossoverSites(state).map((site) => [site.index, site.x]));

  state.advanced.strandPhaseShift = 2.5;
  const aAfter = api.helixWave(sampleX, "a", state);
  const bAfter = api.helixWave(sampleX, "b", state);
  const sitesAfter = new Map(api.crossoverSites(state).map((site) => [site.index, site.x]));
  assert.equal(aAfter, aBefore, "Template A remains the fixed phase reference");
  assert.notEqual(bAfter, bBefore, "the connected partner strand must move relative to Template A");
  assert.ok([...sitesBefore].some(([index, x]) => Math.abs(sitesAfter.get(index) - x) > 1e-6));

  state.basePairColorMode = "single";
  const markup = api.renderBasePairs(api.getReplicationModel());
  const lines = [...markup.matchAll(/<line x1="([\d.-]+)" y1="[\d.-]+" x2="([\d.-]+)"/g)];
  assert.ok(lines.length > 0);
  assert.ok(lines.every((match) => match[1] === match[2]), "base pairs must remain vertical after the phase shift");

  state.length = 50;
  state.advanced.aspectX = 1;
  const normalClip = api.crossoverClipHalfWidth(1.8, 7, state);
  state.length = 100;
  const longerGenomeClip = api.crossoverClipHalfWidth(1.8, 7, state);
  assert.ok(longerGenomeClip < normalClip, "crossover cutouts must shrink with increasing genome length");
  assert.ok(
    Math.abs(longerGenomeClip * 2 - normalClip) < 1e-12,
    "before the strand-safety floor, cutouts scale inversely with genome length"
  );
  state.length = 1000;
  assert.ok(
    api.crossoverClipHalfWidth(1.8, 7, state) >= state.weight / 2 + 0.5,
    "dense crossover cutouts must remain wide enough to hide round strand caps"
  );
  state.length = 50;
  state.advanced.aspectX = 2;
  const widenedClip = api.crossoverClipHalfWidth(1.8, 7, state);
  assert.ok(Math.abs(widenedClip * 2 - normalClip) < 1e-12, "clip width must counteract horizontal aspect scaling");
});

test("rendered base pairs stay phase-anchored at actual crossovers and translate independently", () => {
  const state = freeformState([
    {
      id: "phase-lattice",
      closed: false,
      genomicLength: 47.3,
      points: [
        { x: 120, y: 280 },
        { x: 470, y: 180 },
        { x: 980, y: 340 },
      ],
    },
  ]);
  state.origins = [];
  state.pairResolution = 4;
  state.advanced.strandModel = "standard";
  state.advanced.strandPhaseShift = 1.35;
  state.advanced.basePairTranslation = 0;
  api.normaliseStateSchema(state);
  api.setState(state);

  const crossovers = api.crossoverSites(state);
  const anchored = api.freeformBasePairSites(state);
  assert.ok(crossovers.length > 4 && anchored.length > crossovers.length);
  crossovers.forEach((crossover) => {
    assert.ok(
      anchored.some((site) => Math.abs(site.localFraction - crossover.localFraction) < 1e-10),
      "every geometric crossover must also be a rendered rung site"
    );
    assert.ok(
      Math.abs(api.helixWave(crossover.x, "a", state) - api.helixWave(crossover.x, "b", state)) < 1e-8,
      "crossover sampling follows the two actual strand phases"
    );
  });
  assert.equal(api.basePairTranslationLabel(state), "Anchored");

  const beforeByPhase = new Map(anchored.map((site) => [site.phaseIndex, site.localFraction]));
  const crossoverBefore = crossovers.map((site) => site.localFraction);
  state.advanced.basePairTranslation = 0.4;
  const shifted = api.freeformBasePairSites(state);
  const helix = api.freeformHelixParameters("phase-lattice", state);
  const expectedShift = (0.4 * 0.5) / ((state.pairResolution + 1) * helix.turns);
  const shared = shifted.find(
    (site) =>
      beforeByPhase.has(site.phaseIndex) &&
      site.localFraction > 0.1 &&
      site.localFraction < 0.9
  );
  assert.ok(shared);
  assert.ok(
    Math.abs(shared.localFraction - beforeByPhase.get(shared.phaseIndex) - expectedShift) < 1e-10
  );
  assert.deepEqual(
    api.crossoverSites(state).map((site) => site.localFraction),
    crossoverBefore,
    "base-pair translation never moves the underlying strand crossovers"
  );
  assert.equal(api.basePairTranslation(state), 0.4);
  assert.equal(api.basePairTranslationLabel(state), "+0.4 bp");
});

test("an open-ended terminal bubble can be removed by dragging its sole fork into the contained chromosome end", () => {
  const leftOpen = freshState();
  leftOpen.origins = [{ id: "left-open", position: 0.25, startPosition: 0.25, leftOffset: 0, rightOffset: 0 }];
  leftOpen.forkTravel = 0.25;
  api.setState(leftOpen);
  let geometry = api.getReplicationModel().origins[0];
  assert.equal(geometry.leftActive, false);
  assert.equal(geometry.leftReason, "end");
  assert.equal(geometry.rightActive, true);
  assert.equal(api.terminalClosureBoundaryForFork(geometry, "right"), 0);

  const rightDrag = { role: "fork", side: "right", originId: "left-open", pairedForks: false };
  let result = api.applyForkDragPosition(rightDrag, 0.12, leftOpen);
  assert.equal(result.terminalClosure, true);
  assert.equal(result.collapsePending, false);
  assert.ok(Math.abs(leftOpen.origins[0].startPosition - 0.06) < 1e-12);
  let bounds = api.rawBubbleBounds(leftOpen.origins[0], leftOpen);
  assert.ok(Math.abs(bounds.start) < 1e-12);
  assert.ok(Math.abs(bounds.end - 0.12) < 1e-12);
  assert.deepEqual({ ...leftOpen.selectedFork }, { originId: "left-open", side: "right" });

  result = api.applyForkDragPosition(rightDrag, 0, leftOpen);
  assert.equal(result.collapsePending, true, "the remaining fork can pass the origin and reach the left chromosome end");
  bounds = api.rawBubbleBounds(leftOpen.origins[0], leftOpen);
  assert.ok(bounds.end - bounds.start < 1e-12);

  const rightOpen = freshState();
  rightOpen.origins = [{ id: "right-open", position: 0.75, startPosition: 0.75, leftOffset: 0, rightOffset: 0 }];
  rightOpen.forkTravel = 0.25;
  api.setState(rightOpen);
  geometry = api.getReplicationModel().origins[0];
  assert.equal(geometry.rightReason, "end");
  assert.equal(api.terminalClosureBoundaryForFork(geometry, "left"), 1);
  const leftDrag = { role: "fork", side: "left", originId: "right-open", pairedForks: false };
  result = api.applyForkDragPosition(leftDrag, 0.88, rightOpen);
  assert.equal(result.terminalClosure, true);
  assert.equal(result.collapsePending, false);
  assert.ok(Math.abs(rightOpen.origins[0].startPosition - 0.94) < 1e-12);
  bounds = api.rawBubbleBounds(rightOpen.origins[0], rightOpen);
  assert.ok(Math.abs(bounds.start - 0.88) < 1e-12);
  assert.ok(Math.abs(bounds.end - 1) < 1e-12);
  result = api.applyForkDragPosition(leftDrag, 1, rightOpen);
  assert.equal(result.collapsePending, true, "the remaining fork can pass the origin and reach the right chromosome end");
  bounds = api.rawBubbleBounds(rightOpen.origins[0], rightOpen);
  assert.ok(bounds.end - bounds.start < 1e-12);
});

test("moving a fork makes it the selected numbered object", () => {
  const state = freshState();
  api.setState(state);
  const initial = api.forkDescriptors(api.getReplicationModel());
  assert.ok(initial.length >= 2);
  const target = initial[1];
  const drag = {
    role: "fork",
    side: target.side,
    originId: target.origin.id,
    pairedForks: target.origin.leftActive && target.origin.rightActive,
    leftPosition: target.origin.leftPosition,
    rightPosition: target.origin.rightPosition,
  };
  const desired = target.side === "left" ? target.origin.leftPosition + 0.01 : target.origin.rightPosition - 0.01;
  const moved = api.applyForkDragPosition(drag, desired, state);
  assert.ok(moved);
  assert.equal(state.selectedOriginId, null);
  assert.deepEqual({ ...state.selectedFork }, { originId: target.origin.id, side: target.side });
  const selected = api.selectedForkDescriptor(api.getReplicationModel());
  assert.ok(selected);
  assert.equal(selected.number, target.number);
  assert.match(source, /`F\$\{selectedFork\.number\} \(\$\{selectedFork\.side\}\) at/);
});

test("discrete playback preserves the continuous fork speed while quantising only the visible pose", () => {
  const continuous = freshState();
  continuous.origins = [{ id: "speed-continuous", position: 0.5, startPosition: 0.5, leftOffset: 0, rightOffset: 0 }];
  continuous.forkTravel = 0;
  continuous.discreteAnimation = false;
  const discrete = JSON.parse(JSON.stringify(continuous));
  discrete.origins[0].id = "speed-discrete";
  discrete.discreteAnimation = true;

  const chunks = Array.from({ length: 137 }, (_, index) => 3 + (index % 11));
  const elapsed = chunks.reduce((sum, chunk) => sum + chunk, 0);
  api.advanceForkPlayback(elapsed, continuous);
  chunks.forEach((chunk) => api.advanceForkPlayback(chunk, discrete));
  const step = api.basePairStepFraction(discrete);
  assert.ok(continuous.forkTravel >= discrete.forkTravel);
  assert.ok(continuous.forkTravel - discrete.forkTravel < step + 1e-12);
  assert.equal(Math.round(discrete.forkTravel / step), discrete.forkTravel / step);

  api.advanceForkPlayback((step / (0.006 / 400)) * 1.01, discrete);
  assert.ok(discrete.forkTravel >= continuous.forkTravel, "the carried remainder must release the next full step at the same average speed");
});

test("the fixed preview grid spans both genomic endpoints independently of base-pair resolution", () => {
  assert.equal(api.GRID_COLUMN_COUNT, 12);
  const gridStep = api.VIEW.moleculeWidth / api.GRID_COLUMN_COUNT;
  assert.equal(api.VIEW.x0 + gridStep * api.GRID_COLUMN_COUNT, api.VIEW.x1);
  assert.match(source, /VIEW\.x0 \+ VIEW\.moleculeWidth \/ columns/);
  assert.match(source, /const anchor = transformedSvgPoint\(VIEW\.x0/);
  assert.doesNotMatch(source, /--rs-grid-x[^\n]*basePairResolution/);
});

test("playback, menu, aspect, and control-guide layout matches the refined interface", () => {
  const header = html.match(/<div class="rs-canvas-header">([\s\S]*?)<div class="rs-canvas-frame"/)?.[1] || "";
  assert.ok(header.indexOf("rs-header-playback") >= 0);
  assert.ok(header.indexOf("rs-header-playback") < header.indexOf("rs-header-stats"));
  assert.doesNotMatch(html.match(/<header class="rs-topbar">([\s\S]*?)<\/header>/)?.[1] || "", /progressControl|speedControl|playButton/);
  assert.match(css, /\.rs-header-discrete-toggle\s*\{[^}]*padding:\s*0 2px;[^}]*color:/s);
  assert.doesNotMatch(css.match(/\.rs-header-discrete-toggle\s*\{[^}]*\}/s)?.[0] || "", /border:/);

  const guide = html.match(/<div class="rs-control-guide"[\s\S]*?<\/div>\s*<div class="rs-inline-actions">/)?.[0] || "";
  assert.ok(guide.indexOf("Add origin") < guide.indexOf("Shift"));
  assert.ok(guide.indexOf("Split bubble") < guide.indexOf("Shift"));
  assert.ok(guide.indexOf("Drag bubble") < guide.indexOf("Shift"));
  assert.ok(guide.indexOf("Drag fork") < guide.indexOf("Shift"));
  assert.match(guide, /Break region/);
  assert.match(guide, /Unreplicate/);
  assert.doesNotMatch(guide, /Wheel zoom|Cut \/ drag region/);

  const guideSvgs = [...guide.matchAll(/<svg[\s\S]*?<\/svg>/g)].map((match) => match[0]);
  assert.equal(guideSvgs.length, 4);
  guideSvgs.forEach((svg) => assert.match(svg, /<circle[^>]*r="11"/));
  assert.match(guideSvgs[1], /rs-guide-split-control/);
  assert.match(guideSvgs[1], /rs-guide-origin-dot/);
  assert.doesNotMatch(guideSvgs[1], /M-1\.5-4\.5L-6 0l4\.5 4\.5M1\.5-4\.5L6 0 1\.5 4\.5/);
  assert.match(guideSvgs[2], /M-1\.5-4\.5L-6 0l4\.5 4\.5M1\.5-4\.5L6 0 1\.5 4\.5/);

  assert.match(css, /\.rs-zoom-controls\s*\{[\s\S]*?width:\s*154px;/);
  assert.match(css, /\.rs-aspect-controls\s*\{[^}]*top:\s*52px;[^}]*right:\s*12px;[^}]*width:\s*154px;[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/s);
  assert.match(css, /\.rs-aspect-slider\s*\{[^}]*grid-template-columns:\s*20px minmax\(0, 1fr\)/s);
  assert.doesNotMatch(html, /id="aspectOutput"/);
  assert.match(source, /const MIN_ZOOM = 0\.1/);
  assert.match(source, /aspectX:\s*\{ min: 0\.1, max: 10 \}/);
  assert.match(source, /function resetView\(\)[\s\S]*state\.advanced\.aspectX = 1;[\s\S]*state\.advanced\.aspectY = 1;/);
});

test("split-bubble spacing follows genome-scaled merge clearance across genomic lengths", () => {
  const shortState = freshState();
  shortState.length = 50;
  shortState.pairResolution = 3;
  shortState.advanced.lengthMode = "scale";
  shortState.advanced.snapToBasePairs = false;
  api.normaliseStateSchema(shortState);
  const longState = JSON.parse(JSON.stringify(shortState));
  longState.length = 625;
  api.normaliseStateSchema(longState);
  const region = { start: 0.1, end: 0.9 };
  const shortDimensions = api.splitBubbleDimensions(region, shortState);
  const longDimensions = api.splitBubbleDimensions(region, longState);

  assert.ok(api.terminalPullSpan(0.5, "right", longState) < api.terminalPullSpan(0.5, "right", shortState));
  assert.equal(shortDimensions.targetGapPx, api.splitBubbleClearancePx(shortState));
  assert.equal(longDimensions.targetGapPx, api.splitBubbleClearancePx(longState));
  assert.ok(longDimensions.targetGapPx <= shortDimensions.targetGapPx);
  assert.ok(Math.abs(shortDimensions.gap * api.VIEW.moleculeWidth - shortDimensions.targetGapPx) < 1e-9);
  assert.ok(Math.abs(longDimensions.gap * api.VIEW.moleculeWidth - longDimensions.targetGapPx) < 1e-9);
  assert.ok(longDimensions.gap <= shortDimensions.gap);
  assert.ok(Math.abs(api.effectiveTerminalSmoothing(longState) - 1.5) < 1e-12);
  assert.ok(Math.abs(api.effectiveTerminalSmoothing(shortState) - 1.5) < 1e-12);

  [shortState, longState].forEach((continuousState) => {
    const candidateState = JSON.parse(JSON.stringify(continuousState));
    candidateState.advanced.snapToBasePairs = true;
    api.normaliseStateSchema(candidateState);
    const dimensions = api.splitBubbleDimensions(region, candidateState);
    const pairStep = api.basePairStepFraction(candidateState);
    assert.ok(dimensions.gap >= dimensions.targetGap - 1e-12);
    assert.ok(dimensions.gap - dimensions.targetGap < pairStep + 1e-12);
    assert.ok(Math.abs(dimensions.gap / pairStep - dimensions.gapSteps) < 1e-10);

    const center = api.splitCompatibleCenterFraction(0.503, dimensions.gapSteps, candidateState, {
      min: region.start + dimensions.minimumWidth + dimensions.gap / 2,
      max: region.end - dimensions.minimumWidth - dimensions.gap / 2,
    });
    assert.notEqual(center, null);
    const leftEnd = center - dimensions.gap / 2;
    const rightStart = center + dimensions.gap / 2;
    const lattice = api.basePairLattice(candidateState);
    const leftCoordinate = leftEnd * lattice.subdivisionCount - lattice.edgeOffset;
    const rightCoordinate = rightStart * lattice.subdivisionCount - lattice.edgeOffset;
    assert.ok(Math.abs(leftCoordinate - Math.round(leftCoordinate)) < 1e-9);
    assert.ok(Math.abs(rightCoordinate - Math.round(rightCoordinate)) < 1e-9);
    assert.ok(Math.abs(rightCoordinate - leftCoordinate - dimensions.gapSteps) < 1e-9);
  });
});

test("break points and dragged break regions follow the editing lattice when snapping is enabled", () => {
  const continuousState = freshState();
  continuousState.advanced.snapToBasePairs = false;
  api.normaliseStateSchema(continuousState);
  const snappedState = JSON.parse(JSON.stringify(continuousState));
  snappedState.advanced.snapToBasePairs = true;
  api.normaliseStateSchema(snappedState);

  const rawStart = 0.2137;
  const rawEnd = 0.6842;
  assert.equal(api.cutInteractionFraction(rawStart, continuousState), rawStart);
  const continuousRange = api.cutInteractionRange(rawStart, rawEnd, continuousState);
  assert.equal(continuousRange.start, rawStart);
  assert.equal(continuousRange.end, rawEnd);

  const snappedStart = api.cutInteractionFraction(rawStart, snappedState);
  const snappedRange = api.cutInteractionRange(rawStart, rawEnd, snappedState);
  assert.equal(snappedStart, api.snapFractionToBasePair(rawStart, snappedState));
  assert.equal(snappedRange.start, api.snapFractionToBasePair(rawStart, snappedState));
  assert.equal(snappedRange.end, api.snapFractionToBasePair(rawEnd, snappedState));
  assert.notEqual(snappedRange.start, rawStart);
  assert.notEqual(snappedRange.end, rawEnd);
});

test("bulk delete buttons and per-item hover delete controls are wired separately", () => {
  assert.match(html, /id="deleteOriginsButton"[^>]*>Delete origins<\/button>/);
  assert.match(html, /id="deleteBreaksButton"[^>]*>Delete breaks<\/button>/);
  assert.doesNotMatch(html, /id="deleteOriginButton"|id="clearCutsButton"/);
  assert.match(source, /"delete-origin"/);
  assert.match(source, /"delete-cut"/);
  assert.match(source, /function deleteAllOrigins\(\)/);
  assert.match(source, /function deleteAllBreaks\(\)/);
  assert.match(source, /function deleteOriginById\(originId\)/);
  assert.match(source, /function deleteCutByIndex\(index\)/);
  assert.match(source, /function handleCanvasControlKeydown\(event\)/);
  assert.match(source, /elements\.canvas\.addEventListener\("keydown", handleCanvasControlKeydown\)/);
  assert.match(css, /\.rs-origin-control-cluster:hover \.rs-item-delete-control/);
  assert.match(css, /\.rs-cut-marker:not\(\.is-preview\):hover \.rs-item-delete-control/);
});

test("default canvas panning defers to add, split, origin, and fork controls", () => {
  const state = freshState();
  api.setState(state);
  const model = api.getReplicationModel();
  const unreplicatedPoint = { x: api.VIEW.x0 + api.VIEW.moleculeWidth * 0.02, y: api.VIEW.centerY };
  const firstRegion = model.regions[0];
  const replicatedPoint = {
    x: api.VIEW.x0 + api.VIEW.moleculeWidth * ((firstRegion.start + firstRegion.end) / 2),
    y: api.VIEW.centerY,
  };

  assert.equal(api.canvasActionAtPoint(unreplicatedPoint, null, model), "add");
  assert.equal(api.canvasActionAtPoint(replicatedPoint, null, model), "split");
  assert.equal(api.canvasActionAtPoint(replicatedPoint, "origin", model), null);
  assert.equal(api.canvasActionAtPoint(replicatedPoint, "fork", model), null);
  assert.equal(api.canvasActionAtPoint({ ...replicatedPoint, y: 20 }, null, model), null);
  assert.match(source, /function beginCanvasGesture/);
  assert.match(source, /dragState\.role = "pan"/);
  assert.match(source, /Direct origin\/fork controls are handled below/);
});

test("preview, download, and menu actions are ordered and described", () => {
  const topbar = html.match(/<header class="rs-topbar">([\s\S]*?)<\/header>/)?.[1] || "";
  assert.ok(topbar.indexOf('id="previewButton"') < topbar.indexOf('id="downloadControl"'));
  assert.ok(topbar.indexOf('id="downloadControl"') < topbar.indexOf('id="projectMenuControl"'));
  assert.match(html, /id="previewButton"[^>]*title="Preview SVG"[^>]*aria-label="Preview SVG in a new tab"/);
  assert.match(html, /id="downloadButton"[^>]*title="Download image or video"[^>]*aria-label="Download image or video"/);
  assert.match(html, /id="projectMenuButton"[^>]*title="Menu"[^>]*aria-label="Menu"/);
  assert.match(css, /\.rs-preview-button\s*\{[^}]*flex:\s*0 0 38px/s);
  assert.match(source, /function previewSvg\(\)/);
  assert.match(source, /window\.open\(url, "_blank"\)/);
});

test("selected origins and forks never force hidden canvas controls to remain visible", () => {
  assert.doesNotMatch(css, /\.rs-fork-handle\.is-selected \.rs-fork-control-visual/);
  assert.doesNotMatch(css, /\.rs-origin-marker\.is-selected \.rs-origin-visual/);
  assert.match(css, /\.rs-fork-handle:hover \.rs-fork-control-visual/);
  assert.match(css, /\.rs-fork-handle\.is-dragged \.rs-fork-control-visual/);
  assert.match(css, /#dnaCanvas\.rs-show-all-controls \.rs-fork-control-visual/);
  assert.match(css, /\.rs-origin-marker:hover \.rs-origin-visual/);
  assert.match(css, /#dnaCanvas\.rs-show-all-controls \.rs-origin-visual/);
  assert.match(source, /const selectionRing = selected[\s\S]*?<g class="rs-fork-control-visual">[\s\S]*?\$\{selectionRing\}/);
});

test("base-pair transition mode supports opaque growth from both strands to the midpoint", () => {
  const state = freshState();
  state.basePairColorMode = "bases";
  state.colors.adenine = "#aa0000";
  state.colors.thymine = "#00aa00";
  state.advanced.basePairTransition = "grow";
  api.setState(state);

  assert.equal(api.basePairTransitionMode(state), "grow");
  const half = api.renderBasePairLine(100, 20, 60, 0.5, {
    firstRole: "a",
    secondRole: "b",
    firstBase: "A",
    secondBase: "T",
  });
  assert.match(half, /opacity="1\.0000"/);
  assert.match(half, /y1="20\.9000"[^>]*y2="30\.4500"[^>]*data-half="first"/);
  assert.match(half, /y1="49\.5500"[^>]*y2="59\.1000"[^>]*data-half="second"/);
  assert.match(half, /data-cap="first"[^>]*stroke-linecap="round"/);
  assert.match(half, /data-cap="second"[^>]*stroke-linecap="round"/);

  const complete = api.renderBasePairLine(100, 20, 60, 1, {
    firstRole: "a",
    secondRole: "b",
    firstBase: "A",
    secondBase: "T",
  });
  assert.match(complete, /y2="40\.0000"[^>]*data-half="first"/);
  assert.match(complete, /y1="40\.0000"[^>]*data-half="second"/);

  state.advanced.basePairTransition = "fade";
  const faded = api.renderBasePairLine(100, 20, 60, 0.4, {
    firstRole: "a",
    secondRole: "b",
    firstBase: "A",
    secondBase: "T",
  });
  assert.match(faded, /opacity="0\.4000"/);

  state.advanced.basePairTransition = "instant";
  const instant = api.renderBasePairLine(100, 20, 60, 0.05, {
    firstRole: "a",
    secondRole: "b",
    firstBase: "A",
    secondBase: "T",
  });
  assert.match(instant, /data-transition="instant"/);
  assert.match(instant, /opacity="1\.0000"/);
  assert.match(instant, /y2="40\.0000"[^>]*data-half="first"/);
  assert.match(instant, /y1="40\.0000"[^>]*data-half="second"/);

  assert.match(
    html,
    /id="basePairTransitionControl"[\s\S]*?<option value="fade" selected>Fade at forks<\/option>[\s\S]*?<option value="grow">Grow to midpoint<\/option>[\s\S]*?<option value="instant">Instant<\/option>/
  );
  assert.ok(
    html.indexOf('id="includeExportBackgroundToggle"') <
      html.indexOf('id="basePairTransitionControl"'),
    "export-background switch should remain grouped with the other switches"
  );
  assert.doesNotMatch(html, /id="growBasePairsToggle"/);
});

test("base-pair growth starts at the configured New-DNA fork distance", () => {
  const state = freshState();
  state.origins = [
    {
      id: "growth-distance",
      position: 0.5,
      startPosition: 0.5,
      leftOffset: 0.2,
      rightOffset: 0.2,
    },
  ];
  state.forkTravel = 0.1;
  state.advanced.basePairTransition = "grow";
  state.advanced.newDnaStartDistance = 0;
  api.setState(state);

  let model = api.getReplicationModelAtTravel(state.forkTravel, state);
  let region = model.regions[0];
  const initialSpan = api.nascentSpan(region, model, state);
  const pairSpacing = api.VIEW.moleculeWidth / api.basePairLattice(state).subdivisionCount;
  const initiallyGrowingX = initialSpan.fromX + pairSpacing;
  const initialReplication = api.replicationAt(initiallyGrowingX, model);
  assert.ok(api.newDnaBasePairGrowthAt(initiallyGrowingX, initialReplication, model, state) > 0);

  state.advanced.newDnaStartDistance = 6;
  model = api.getReplicationModelAtTravel(state.forkTravel, state);
  region = model.regions[0];
  const shiftedSpan = api.nascentSpan(region, model, state);
  assert.ok(shiftedSpan.fromX > initialSpan.fromX + pairSpacing * 4);
  assert.equal(
    api.newDnaBasePairGrowthAt(
      initiallyGrowingX,
      api.replicationAt(initiallyGrowingX, model),
      model,
      state
    ),
    0
  );
  const shiftedStartReplication = api.replicationAt(shiftedSpan.fromX, model);
  assert.equal(
    api.newDnaBasePairGrowthAt(shiftedSpan.fromX, shiftedStartReplication, model, state),
    0
  );
  const fullyGrownX = shiftedSpan.fromX + pairSpacing * 2;
  assert.ok(
    api.newDnaBasePairGrowthAt(
      fullyGrownX,
      api.replicationAt(fullyGrownX, model),
      model,
      state
    ) > 0.99
  );
});

test("the displayed speed multiplier maps the historical 2.75 pace to one times", () => {
  assert.equal(api.BASE_PLAYBACK_SPEED, 2.75);
  assert.deepEqual(Array.from(Object.values(api.SPEED_MULTIPLIER_RANGE)), [0.25, 3]);
  assert.equal(api.playbackSpeedFromMultiplier(0.25), 0.6875);
  assert.equal(api.playbackSpeedFromMultiplier(1), 2.75);
  assert.equal(api.playbackSpeedFromMultiplier(3), 8.25);
  assert.equal(api.speedMultiplier({ speed: 2.75 }), 1);
  assert.equal(api.speedMultiplier({ speed: 8.25 }), 3);
  assert.equal(api.speedMultiplierLabel({ speed: 2.75 }), "1x");
  assert.equal(api.makeDefaultState().speed, 2.75);
});

test("Ctrl fork dragging moves the two active forks symmetrically around a fixed origin", () => {
  const state = freshState();
  state.origins = [{ id: "mirror", position: 0.5, startPosition: 0.5, leftOffset: 0, rightOffset: 0 }];
  state.forkTravel = 0.1;
  state.advanced.snapToBasePairs = false;
  api.setState(state);
  api.setViewState({ zoom: 1, panX: 0, panY: 0 });

  const result = api.applyForkDragPosition(
    {
      role: "fork",
      side: "right",
      originId: "mirror",
      originStartPosition: 0.5,
      leftPosition: 0.4,
      rightPosition: 0.6,
      pairedForks: true,
      mirroredForks: true,
      collapsePending: false,
    },
    0.72,
    state
  );
  assert.ok(result);
  assert.equal(result.mirrored, true);
  const geometry = api.getReplicationModelAtTravel(state.forkTravel, state).origins[0];
  assert.ok(Math.abs(geometry.leftPosition - 0.28) < 1e-10);
  assert.ok(Math.abs(geometry.rightPosition - 0.72) < 1e-10);
  assert.ok(Math.abs((geometry.leftPosition + geometry.rightPosition) / 2 - 0.5) < 1e-10);
  assert.equal(state.origins[0].startPosition, 0.5);
  assert.match(source, /mirroredForks:\s*role === "fork" && specialControl/);
  assert.match(source, /Both forks adjusted symmetrically/);
});

test("Ctrl drag converts only the selected replicated interval back to unreplicated DNA", () => {
  const state = freshState();
  state.advanced.snapToBasePairs = false;
  state.forkTravel = 0.1;
  state.origins = [
    {
      id: "unreplicate-source",
      position: 0.5,
      startPosition: 0.5,
      leftOffset: 0.3,
      rightOffset: 0.3,
    },
  ];
  state.selectedOriginId = "unreplicate-source";
  state.selectedFork = null;
  api.setState(state);

  const before = api.getReplicationModelAtTravel(state.forkTravel, state);
  assert.deepEqual(
    JSON.parse(JSON.stringify(
      before.regions.map(({ start, end }) => [Number(start.toFixed(6)), Number(end.toFixed(6))])
    )),
    [[0.1, 0.9]]
  );

  const result = api.unreplicateRange(0.4, 0.6, state);
  assert.equal(result.changed, true);
  assert.ok(Math.abs(result.range.start - 0.4) < 1e-10);
  assert.ok(Math.abs(result.range.end - 0.6) < 1e-10);
  assert.equal(result.affectedRegions.length, 1);
  const after = api.getReplicationModelAtTravel(state.forkTravel, state);
  assert.deepEqual(
    JSON.parse(JSON.stringify(
      after.regions.map(({ start, end }) => [Number(start.toFixed(6)), Number(end.toFixed(6))])
    )),
    [
      [0.1, 0.4],
      [0.6, 0.9],
    ]
  );
  assert.equal(state.origins.length, 2);
  assert.equal(state.selectedOriginId, null);
  assert.equal(state.selectedFork, null);

  assert.match(source, /function beginUnreplicateRange\(event, x, pathId = null\)/);
  assert.match(source, /specialControl && role !== "fork"/);
  assert.match(source, /Boolean\(replicationAt\(point\.x, getReplicationModel\(\)\)\.region\)/);
  assert.match(source, /beginUnreplicateRange\(event, point\.x, point\.pathId \|\| null\)/);
  assert.match(source, /commitUnreplicateRange\([\s\S]*?completedDrag\.anchor/);
  assert.doesNotMatch(
    source.match(/if \(specialControl && role !== "fork"\) \{[\s\S]*?\n    \}/)?.[0] || "",
    /beginPan/
  );
});

test("artwork aspect transforms preserve strand and base-pair stroke thickness", () => {
  const state = freshState();
  state.basePairWidth = 4;
  state.weight = 7;
  state.advanced.aspectX = 1;
  state.advanced.aspectY = 1;
  api.setState(state);
  api.setViewState({ zoom: 1, panX: 0, panY: 0 });
  const normalInset = api.insetBasePairSegment(20, 60, 4);
  const normalAttributes = api.artworkStrokeAttributes(7);

  state.advanced.aspectX = 10;
  state.advanced.aspectY = 2;
  const stretchedInset = api.insetBasePairSegment(20, 60, 4);
  const stretchedAttributes = api.artworkStrokeAttributes(7);
  assert.equal(normalAttributes, stretchedAttributes);
  assert.match(stretchedAttributes, /stroke-width="7\.0"/);
  assert.match(stretchedAttributes, /data-rs-stroke-width="7\.0"/);
  assert.match(stretchedAttributes, /vector-effect="non-scaling-stroke"/);
  assert.ok(Math.abs((normalInset.firstY - 20) - (stretchedInset.firstY - 20) * 2) < 1e-10);

  const zoomed = api.withArtworkStrokeScale(2, () => api.artworkStrokeAttributes(7));
  assert.match(zoomed, /stroke-width="14\.0"/);
  assert.match(zoomed, /data-rs-stroke-width="7\.0"/);
  assert.match(source, /normaliseExportStrokeWidths\(clonedArtwork\)/);
});

test("context controls swap split and drag icons, clear stale glyphs, and span beyond daughter strands", () => {
  const state = freshState();
  api.setState(state);
  api.setViewState({ zoom: 1, panX: 0, panY: 0 });
  const splitGlyph = api.contextGlyphMarkup("split", "#123456");
  const addGlyph = api.contextGlyphMarkup("add", "#123456");
  assert.match(splitGlyph, /<circle[^>]*r="3\.8"/);
  assert.doesNotMatch(splitGlyph, /M-5 0H5/);
  assert.match(addGlyph, /M-5 0H5M0-5V5/);
  assert.match(source, /if \(glyph\) glyph\.replaceChildren\(\)/);
  assert.doesNotMatch(source, /id="rs-context-split-glyph"/);
  assert.match(source, /<g id="rs-context-glyph"><\/g>/);
  assert.match(source, /M-1\.5-4\.5L-6 0l4\.5 4\.5M1\.5-4\.5L6 0 1\.5 4\.5/);

  const bounds = api.toolGuideBounds(state);
  const molecularHalfExtent = state.daughterSpacing / 2 + state.doubleStrandHeight / 2;
  assert.ok(bounds.top < api.VIEW.centerY - molecularHalfExtent);
  assert.ok(bounds.bottom > api.VIEW.centerY + molecularHalfExtent);
  assert.match(source, /line\.setAttribute\("y1", fixed\(guideBounds\.top\)\)/);
  assert.match(source, /line\.setAttribute\("y2", fixed\(guideBounds\.bottom\)\)/);
});

test("the fit-view control uses a framed artwork icon and resets both aspect axes", () => {
  const fitButton = html.match(/<button id="fitViewButton"[\s\S]*?<\/button>/)?.[0] || "";
  assert.match(fitButton, /title="Fit current view"/);
  assert.match(fitButton, /class="rs-fit-view-icon"/);
  assert.match(fitButton, /<rect x="8" y="8" width="8" height="8" rx="1\.5"/);
  assert.match(fitButton, /M9 4H4v5M15 4h5v5M4 15v5h5M20 15v5h-5/);
  assert.match(source, /function resetView\(\)[\s\S]*state\.advanced\.aspectX = 1;[\s\S]*state\.advanced\.aspectY = 1;/);
});


test("fork transitions preserve their rendered horizontal shape across aspect ratios", () => {
  const state = freshState();
  state.length = 250;
  state.advanced.lengthMode = "scale";
  state.advanced.aspectY = 1;
  state.origins = [
    {
      id: "aspect-fork",
      position: 0.5,
      startPosition: 0.5,
      leftOffset: 0.18,
      rightOffset: 0.18,
    },
  ];
  state.forkTravel = 0.08;

  state.advanced.aspectX = 1;
  api.setState(state);
  let model = api.getReplicationModelAtTravel(state.forkTravel, state);
  let region = model.regions[0];
  const normalWorldWidth = api.regionTransitionWidth(region, state);
  const normalScreenWidth = normalWorldWidth * api.artworkScaleX(state);
  const normalTerminalScreenSpan = api.terminalPullSpan(0, "left", state) * api.artworkScaleX(state);

  state.advanced.aspectX = 8;
  api.syncViewGeometry(state);
  model = api.getReplicationModelAtTravel(state.forkTravel, state);
  region = model.regions[0];
  const stretchedWorldWidth = api.regionTransitionWidth(region, state);
  const stretchedScreenWidth = stretchedWorldWidth * api.artworkScaleX(state);
  const stretchedTerminalScreenSpan = api.terminalPullSpan(0, "left", state) * api.artworkScaleX(state);

  assert.ok(Math.abs(stretchedScreenWidth - normalScreenWidth) < 1e-9);
  assert.ok(Math.abs(stretchedTerminalScreenSpan - normalTerminalScreenSpan * 8) < 1e-9);
  assert.ok(Math.abs(stretchedWorldWidth * 8 - normalWorldWidth) < 1e-9);
  assert.match(source, /maximumScreenWidth\s*\/\s*Math\.max\(EPSILON, artworkAspectX\(sourceState\)\)/);
});

test("long dense helices retain adaptive smooth sampling under horizontal stretching", () => {
  const state = freshState();
  state.length = 625;
  state.pairResolution = 3;
  state.advanced.lengthMode = "scale";
  state.advanced.aspectX = 10;
  state.advanced.aspectY = 1;
  state.origins = [];
  state.forkTravel = 0;
  state.progress = 0;
  api.setState(state);

  const turns = state.length / 10;
  const worldWidthPerTurn = api.VIEW.moleculeWidth / turns;
  const step = api.adaptivePathSampleStep(3, state);
  assert.ok(step <= worldWidthPerTurn / 24 + 1e-12);
  assert.ok(step * state.advanced.aspectX <= 3.6 + 1e-12);

  const model = api.getReplicationModelAtTravel(0, state);
  const path = api.sampledPath(
    api.VIEW.x0,
    api.VIEW.x1,
    (x) => api.templateY(x, "a", model),
    3,
    null,
    [],
    [],
    null
  );
  const segments = cubicSegments(path);
  assert.ok(segments.length >= turns * 24 - 2);
  assert.ok(segments.length <= 12000 + 2);
  assert.ok(segments.every((segment) => Number.isFinite(segment.control1.y) && Number.isFinite(segment.control2.y)));
  assert.match(source, /Keep at least 24 samples per helix turn/);
});

test("genome length supports scale-changing and right-extension modes with scale-changing as default", () => {
  const defaults = api.makeDefaultState();
  assert.equal(defaults.advanced.lengthMode, "scale");
  assert.equal(api.lengthMode(defaults), "scale");
  assert.equal(api.moleculeWidthForState(defaults), 1104);

  const scaled = freshState();
  scaled.length = 50;
  scaled.advanced.lengthMode = "scale";
  scaled.origins = [
    { id: "scale-origin", position: 0.3, startPosition: 0.3, leftOffset: 0.04, rightOffset: 0.06 },
  ];
  scaled.cuts = [{ start: 0.2, end: 0.25 }];
  api.setState(scaled);
  const scaledOriginFraction = scaled.origins[0].startPosition;
  api.resizeGenomeLength(100, scaled);
  assert.equal(api.VIEW.moleculeWidth, 1104);
  assert.equal(scaled.origins[0].startPosition, scaledOriginFraction);
  assert.equal(scaled.cuts[0].start, 0.2);

  const extended = freshState();
  extended.length = 50;
  extended.advanced.lengthMode = "extend";
  extended.origins = [
    { id: "extend-origin", position: 0.3, startPosition: 0.3, leftOffset: 0.04, rightOffset: 0.06 },
  ];
  extended.cuts = [{ start: 0.2, end: 0.25 }];
  extended.forkTravel = 0.1;
  api.setState(extended);
  const oldWidth = api.VIEW.moleculeWidth;
  const oldOriginX = api.VIEW.x0 + extended.origins[0].startPosition * oldWidth;
  const oldCutStartX = api.VIEW.x0 + extended.cuts[0].start * oldWidth;
  const oldForkTravelPx = extended.forkTravel * oldWidth;

  api.resizeGenomeLength(100, extended);
  assert.equal(api.VIEW.moleculeWidth, oldWidth * 2);
  assert.ok(Math.abs(api.VIEW.x0 + extended.origins[0].startPosition * api.VIEW.moleculeWidth - oldOriginX) < 1e-9);
  assert.ok(Math.abs(api.VIEW.x0 + extended.cuts[0].start * api.VIEW.moleculeWidth - oldCutStartX) < 1e-9);
  assert.ok(Math.abs(extended.forkTravel * api.VIEW.moleculeWidth - oldForkTravelPx) < 1e-9);
  assert.equal(extended.origins[0].startPosition, 0.15);
  assert.equal(extended.cuts[0].start, 0.1);
  assert.equal(api.gridColumnCount(extended), 24);
  assert.ok(
    Math.abs(
      api.VIEW.moleculeWidth / api.gridColumnCount(extended) -
        oldWidth / api.GRID_COLUMN_COUNT
    ) < 1e-9
  );

  // Even under horizontal aspect stretching, the left-anchored fixed scale
  // keeps all pre-existing genomic coordinates stationary as the right end grows.
  const aspectExtended = freshState();
  aspectExtended.length = 50;
  aspectExtended.advanced.lengthMode = "extend";
  aspectExtended.advanced.aspectX = 4;
  aspectExtended.origins = [
    { id: "aspect-extend", position: 0.3, startPosition: 0.3, leftOffset: 0, rightOffset: 0 },
  ];
  api.setState(aspectExtended);
  const beforeAspectX = api.transformedArtworkPoint(
    api.VIEW.x0 + aspectExtended.origins[0].startPosition * api.VIEW.moleculeWidth,
    api.VIEW.centerY,
    aspectExtended
  ).x;
  api.resizeGenomeLength(100, aspectExtended);
  const afterAspectX = api.transformedArtworkPoint(
    api.VIEW.x0 + aspectExtended.origins[0].startPosition * api.VIEW.moleculeWidth,
    api.VIEW.centerY,
    aspectExtended
  ).x;
  assert.ok(Math.abs(afterAspectX - beforeAspectX) < 1e-9);

  const switchMarkup = html.match(/<label class="rs-toggle" for="fitGenomeToggle"[\s\S]*?<\/label>/)?.[0] || "";
  assert.match(switchMarkup, /Fit genome to canvas/);
  assert.match(switchMarkup, /id="fitGenomeToggle" type="checkbox" checked/);
  assert.match(source, /state\.advanced\.lengthMode = elements\.fitGenomeToggle\.checked \? "scale" : "extend"/);
});


test("minimal end smoothing lifts both chromosome endpoints only after contact", () => {
  const state = freshState();
  state.advanced.strandModel = "minimal";
  state.advanced.terminalSmoothing = 2;
  state.origins = [
    { id: "both-ends", position: 0.5, startPosition: 0.5, leftOffset: 0, rightOffset: 0 },
  ];
  const contactTravel = 0.5;
  state.forkTravel = contactTravel;
  api.setState(state);

  const contact = api.getReplicationModel();
  assert.equal(contact.regions[0].startClosureBlend, 0);
  assert.equal(contact.regions[0].endClosureBlend, 0);
  assert.equal(api.minimalReplicationAt(api.VIEW.x0, contact).profile, 0);
  assert.equal(api.minimalReplicationAt(api.VIEW.x1, contact).profile, 0);

  const pullFraction = api.terminalPullSpan(0, "left", state) / api.VIEW.moleculeWidth;
  state.forkTravel = contactTravel + pullFraction / 2;
  api.setState(state);
  const halfway = api.getReplicationModel();
  assert.ok(Math.abs(halfway.regions[0].startClosureBlend - 0.5) < 1e-10);
  assert.ok(Math.abs(halfway.regions[0].endClosureBlend - 0.5) < 1e-10);
  assert.ok(Math.abs(api.minimalReplicationAt(api.VIEW.x0, halfway).profile - 0.5) < 1e-10);
  assert.ok(Math.abs(api.minimalReplicationAt(api.VIEW.x1, halfway).profile - 0.5) < 1e-10);
  assert.ok(api.templateY(api.VIEW.x0, "a", halfway) < api.VIEW.centerY);
  assert.ok(api.templateY(api.VIEW.x0, "b", halfway) > api.VIEW.centerY);
  assert.ok(api.templateY(api.VIEW.x1, "a", halfway) < api.VIEW.centerY);
  assert.ok(api.templateY(api.VIEW.x1, "b", halfway) > api.VIEW.centerY);

  state.forkTravel = api.forkTravelBounds(state).full;
  api.setState(state);
  const complete = api.getReplicationModel();
  assert.equal(complete.regions[0].startClosureBlend, 1);
  assert.equal(complete.regions[0].endClosureBlend, 1);
  assert.equal(api.minimalReplicationAt(api.VIEW.x0, complete).profile, 1);
  assert.equal(api.minimalReplicationAt(api.VIEW.x1, complete).profile, 1);
});

test("advanced options group switches, dropdowns, sliders and colours clearly", () => {
  const advanced = html.match(/<details class="rs-options-menu" id="advancedOptions">[\s\S]*?<\/details>/)?.[0] || "";
  assert.match(advanced, /rs-options-group rs-options-switch-group/);
  assert.match(advanced, /rs-options-group rs-options-dropdown-group/);
  assert.match(advanced, /rs-options-group rs-options-slider-group/);
  assert.match(advanced, /rs-options-group rs-options-colour-group/);
  assert.ok(advanced.indexOf('id="fitGenomeToggle"') < advanced.indexOf('id="basePairTransitionControl"'));
  assert.match(advanced, /for="fitGenomeToggle"[\s\S]*?Fit genome to canvas/);
  assert.match(advanced, /for="rightHandedToggle"[\s\S]*?Right-handed helix/);
  assert.match(advanced, /for="depthAwareColorSplitToggle"[\s\S]*?Depth-aware colour split/);
  assert.doesNotMatch(
    html.match(/<section class="rs-control-section rs-compact-section">[\s\S]*?<h2>Geometry<\/h2>[\s\S]*?<\/section>/)?.[0] || "",
    /fitGenomeToggle|rightHandedToggle/
  );
  assert.match(css, /\.rs-options-group \+ \.rs-options-group\s*\{[^}]*border-top:/s);
  assert.match(css, /\.rs-options-group \.rs-options-range[\s\S]*?border-top:\s*0/s);
  assert.match(css, /\.rs-options-group \.rs-options-select[\s\S]*?border-top:\s*0/s);
});

test("geometry controls expose wider spacing and vertical aspect ranges in the requested order", () => {
  const geometry = html.match(/<h2>Geometry<\/h2>[\s\S]*?<\/section>/)?.[0] || "";
  assert.ok(geometry.indexOf('id="weightControl"') < geometry.indexOf('id="basePairWidthControl"'));
  assert.match(geometry, /<span>Strand width<\/span>/);
  assert.doesNotMatch(geometry, /Strand weight/);
  assert.match(geometry, /id="daughterSpacingControl"[^>]*max="800"/);
  assert.match(geometry, /id="doubleStrandHeightControl"[^>]*max="160"/);
  assert.equal(api.boundedControlValue("daughterSpacing", 9999), 800);
  assert.equal(api.boundedControlValue("doubleStrandHeight", 9999), 160);
  assert.equal(api.aspectFactorFromSlider("y", -100), 0.1);
  assert.equal(api.aspectFactorFromSlider("y", 100), 5);
});

test("fit view derives zoom and pan from right-extended genome length", () => {
  const scaled = freshState();
  scaled.length = 100;
  scaled.advanced.lengthMode = "scale";
  const scaledFit = api.fittedViewState(scaled);
  assert.equal(scaledFit.zoom, 1);
  assert.equal(scaledFit.panX, 0);
  assert.equal(scaledFit.panY, 0);

  const extended = freshState();
  extended.length = 100;
  extended.advanced.lengthMode = "extend";
  const fitted = api.fittedViewState(extended);
  assert.ok(Math.abs(fitted.zoom - 0.5) < 1e-12);
  assert.ok(Math.abs(fitted.panX + 276) < 1e-12);
  const left = api.VIEW.width / 2 + fitted.panX +
    (api.VIEW.x0 - api.VIEW.width / 2) * fitted.zoom;
  const right = api.VIEW.width / 2 + fitted.panX +
    (api.VIEW.x1 - api.VIEW.width / 2) * fitted.zoom;
  assert.ok(Math.abs(left - 48) < 1e-9);
  assert.ok(Math.abs(right - 1152) < 1e-9);
  assert.match(source, /viewState = fittedViewState\(state\)/);
});

test("right-extension grid spacing remains exact between non-round genome lengths", () => {
  const extended = freshState();
  extended.length = 55;
  extended.advanced.lengthMode = "extend";
  api.setState(extended);
  const columns = api.gridColumnCount(extended);
  assert.ok(Math.abs(columns - 13.2) < 1e-12);
  assert.ok(
    Math.abs(api.VIEW.moleculeWidth / columns - 1104 / api.GRID_COLUMN_COUNT) < 1e-9
  );
  assert.match(source, /exact \(possibly fractional\) number/);
});

test("Menu exposes an accessible blurred About dialog with project identity and contact", () => {
  assert.match(html, /id="aboutMenuButton"[^>]*role="menuitem"/);
  assert.match(html, /id="aboutModal"[^>]*hidden/);
  assert.match(html, /role="dialog"[^>]*aria-modal="true"/);
  assert.match(html, /class="rs-about-logo"[^>]*src="assets\/img\/logo1\.png"/);
  assert.doesNotMatch(html, /<h2[^>]*>\s*RepliCanvas\s*<\/h2>/);
  assert.match(html, /© 2026 Francisco Berkemeier|&copy; 2026 Francisco Berkemeier/);
  assert.match(html, /mailto:fp409@cam\.ac\.uk/);
  assert.match(css, /\.rs-about-backdrop\s*\{[\s\S]*?backdrop-filter:\s*blur\(9px\)/);
  assert.match(css, /\.rs-about-dialog\s*\{[\s\S]*?place-items|\.rs-about-dialog\s*\{/);
  assert.match(source, /elements\.aboutMenuButton\.addEventListener\("click", openAboutModal\)/);
  assert.match(source, /if \(aboutModalIsOpen\(\)\) \{[\s\S]*?event\.key === "Escape"/);
});

test("Space toggles playback outside editable controls and restarts completed S phase", () => {
  assert.equal(
    api.isPlaybackSpaceShortcut({ key: " ", code: "Space", target: { tagName: "DIV" } }),
    true
  );
  assert.equal(
    api.isPlaybackSpaceShortcut({ key: " ", code: "Space", target: { tagName: "INPUT" } }),
    false
  );
  assert.equal(
    api.isPlaybackSpaceShortcut({ key: " ", code: "Space", repeat: true, target: { tagName: "DIV" } }),
    false
  );
  assert.equal(
    api.isPlaybackSpaceShortcut({ key: " ", code: "Space", ctrlKey: true, target: { tagName: "DIV" } }),
    false
  );
  assert.match(source, /if \(isPlaybackSpaceShortcut\(event\)\) \{[\s\S]*?toggleAnimation\(\);/);
  assert.match(
    source,
    /if \(playbackComplete\(\)\) \{[\s\S]*?state\.forkTravel = forkTravelBounds\(state\)\.zero;[\s\S]*?synchroniseSPhaseFromGeometry/
  );
  const replayBlock = source.match(/if \(playbackComplete\(\)\) \{[\s\S]*?\n    \}/)?.[0] || "";
  assert.doesNotMatch(replayBlock, /clearForkOffsets\(\)/);

  const minimal = freshState();
  minimal.advanced.strandModel = "minimal";
  minimal.origins = [
    { id: "space-left", position: 0.25, startPosition: 0.25, leftOffset: 0, rightOffset: 0 },
    { id: "space-right", position: 0.75, startPosition: 0.75, leftOffset: 0, rightOffset: 0 },
  ];
  minimal.forkTravel = 0.25;
  api.setState(minimal);
  assert.equal(api.playbackComplete(minimal), false, "contact must not skip the minimal closure animation");
  minimal.forkTravel = api.forkTravelBounds(minimal).full;
  assert.equal(api.playbackComplete(minimal), true);
});


test("right-extension mode preserves fork speed, grid scale, and video timing dependencies", () => {
  const scaled = freshState();
  scaled.length = 50;
  scaled.advanced.lengthMode = "scale";
  scaled.discreteAnimation = false;
  scaled.speed = api.BASE_PLAYBACK_SPEED;
  scaled.origins = [
    { id: "scaled-speed", position: 0.5, startPosition: 0.5, leftOffset: 0, rightOffset: 0 },
  ];
  scaled.forkTravel = 0;
  api.setState(scaled);
  const scaledWidth = api.VIEW.moleculeWidth;
  api.advanceForkPlayback(100, scaled);
  const scaledPixels = scaled.forkTravel * scaledWidth;
  const scaledPlan = api.videoFramePlan(scaled);

  const extended = freshState();
  extended.length = 100;
  extended.advanced.lengthMode = "extend";
  extended.discreteAnimation = false;
  extended.speed = api.BASE_PLAYBACK_SPEED;
  extended.origins = [
    { id: "extended-speed", position: 0.25, startPosition: 0.25, leftOffset: 0, rightOffset: 0 },
  ];
  extended.forkTravel = 0;
  api.setState(extended);
  const extendedWidth = api.VIEW.moleculeWidth;
  assert.equal(api.genomeDistanceScale(extended), 0.5);
  api.advanceForkPlayback(100, extended);
  const extendedPixels = extended.forkTravel * extendedWidth;
  const extendedPlan = api.videoFramePlan(extended);

  assert.ok(Math.abs(extendedPixels - scaledPixels) < 1e-9);
  assert.ok(
    Math.abs(
      extendedPlan.travelPerFrame * extendedWidth -
        scaledPlan.travelPerFrame * scaledWidth
    ) < 1e-9
  );
  assert.equal(api.gridColumnCount(extended), 24);
  assert.match(source, /speed \* genomeDistanceScale\(sourceState\)/);
  assert.match(source, /speed \*[\s\S]*genomeDistanceScale\(videoState\)/);
});

test("minimal forks can be dragged open at chromosome ends and merged at opposing forks", () => {
  api.setViewState({ zoom: 1, panX: 0, panY: 0 });

  const endState = freshState();
  endState.advanced.strandModel = "minimal";
  endState.advanced.terminalSmoothing = 2;
  endState.forkTravel = 0;
  endState.origins = [
    {
      id: "manual-end",
      position: 0.5,
      startPosition: 0.5,
      leftOffset: 0.2,
      rightOffset: 0.2,
    },
  ];
  api.setState(endState);
  const before = api.getReplicationModelAtTravel(0, endState).origins[0];
  const endDrag = {
    role: "fork",
    side: "left",
    originId: "manual-end",
    originStartPosition: 0.5,
    originLeftOffset: 0.2,
    originRightOffset: 0.2,
    leftPosition: before.leftPosition,
    rightPosition: before.rightPosition,
    pairedForks: true,
    mirroredForks: false,
  };
  const endResult = api.applyForkDragPosition(endDrag, 0, endState);
  assert.ok(endResult);
  const openedModel = api.getReplicationModelAtTravel(endState.forkTravel, endState);
  const openedOrigin = openedModel.origins[0];
  assert.equal(openedOrigin.leftPosition, 0);
  assert.ok(openedOrigin.leftClosureBlend > 1 - 1e-9);
  assert.ok(api.minimalReplicationAt(api.VIEW.x0, openedModel, endState).profile > 1 - 1e-9);
  assert.ok(api.minimalManualEndOvershootFraction(endState) > 0);

  const collapseState = freshState();
  collapseState.advanced.strandModel = "minimal";
  collapseState.advanced.terminalSmoothing = 2;
  collapseState.forkTravel = 0;
  collapseState.origins = [
    {
      id: "manual-collapse",
      position: 0.5,
      startPosition: 0.5,
      leftOffset: 0.2,
      rightOffset: 0.2,
    },
  ];
  api.setState(collapseState);
  const collapseGeometry = api.getReplicationModelAtTravel(0, collapseState).origins[0];
  const collapseResult = api.applyForkDragPosition(
    {
      role: "fork",
      side: "left",
      originId: "manual-collapse",
      originStartPosition: 0.5,
      originLeftOffset: 0.2,
      originRightOffset: 0.2,
      leftPosition: collapseGeometry.leftPosition,
      rightPosition: collapseGeometry.rightPosition,
      pairedForks: true,
      mirroredForks: false,
    },
    collapseGeometry.rightPosition,
    collapseState
  );
  assert.equal(collapseResult.collapsePending, true);

  const mergeState = freshState();
  mergeState.advanced.strandModel = "minimal";
  mergeState.advanced.terminalSmoothing = 2;
  mergeState.forkTravel = 0;
  mergeState.origins = [
    {
      id: "manual-left",
      position: 0.3,
      startPosition: 0.3,
      leftOffset: 0.1,
      rightOffset: 0.1,
    },
    {
      id: "manual-right",
      position: 0.7,
      startPosition: 0.7,
      leftOffset: 0.1,
      rightOffset: 0.1,
    },
  ];
  api.setState(mergeState);
  const mergeGeometry = api.getReplicationModelAtTravel(0, mergeState).origins[0];
  const tolerance = api.manualForkMergeTolerance(mergeState);
  assert.ok(tolerance > 1e-8);
  api.applyForkDragPosition(
    {
      role: "fork",
      side: "right",
      originId: "manual-left",
      originStartPosition: 0.3,
      originLeftOffset: 0.1,
      originRightOffset: 0.1,
      leftPosition: mergeGeometry.leftPosition,
      rightPosition: mergeGeometry.rightPosition,
      pairedForks: true,
      mirroredForks: false,
    },
    0.6 - tolerance / 2,
    mergeState
  );
  const merged = api.mergeOverlappingBubbleState("manual-left", mergeState, tolerance);
  assert.ok(merged);
  assert.equal(merged.originIds.length, 2);
  assert.equal(mergeState.origins.length, 1);
  assert.match(source, /mergeTouchingBubbles\(completedDrag\.originId, mergeTolerance\)/);
});

test("the current template is cached across browser sessions and restored fitted to the window", () => {
  const values = new Map();
  sandbox.localStorage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
  };

  const state = freshState();
  state.length = 200;
  state.advanced.lengthMode = "extend";
  state.advanced.aspectX = 1.8;
  state.advanced.aspectY = 1.4;
  state.progress = 37;
  state.playing = true;
  api.setState(state);

  assert.equal(api.persistTemplateCacheNow(), true);
  const cachedText = values.get(api.TEMPLATE_CACHE_KEY);
  assert.ok(cachedText);
  const cachedDocument = JSON.parse(cachedText);
  assert.equal(cachedDocument.format, "RepliCanvas");
  assert.equal(cachedDocument.state.playing, false);

  const restored = api.cachedTemplateState();
  assert.equal(restored.length, 200);
  assert.equal(restored.advanced.lengthMode, "extend");
  assert.equal(restored.advanced.aspectX, 1.8);
  assert.equal(restored.advanced.aspectY, 1.4);
  assert.equal(restored.playing, false);
  const fitted = api.fittedViewState(restored);
  assert.ok(fitted.zoom < 1, "a long, stretched cached genome must reopen fitted to the viewport");

  values.set(api.TEMPLATE_CACHE_KEY, "not-json");
  assert.equal(api.cachedTemplateState(), null);
  assert.equal(values.has(api.TEMPLATE_CACHE_KEY), false, "damaged cache entries are discarded safely");
  delete sandbox.localStorage;

  assert.match(source, /state = cachedTemplateState\(\) \|\| makeDefaultState\(\)/);
  assert.match(source, /viewState = fittedViewState\(state\)/);
  assert.match(source, /persistTemplateCacheNow\(\);[\s\S]*?URL\.revokeObjectURL/);
});

test("DNA chirality defaults to right-handed and reverses crossover depth and cutouts", () => {
  const state = freshState();
  state.advanced.strandModel = "standard";
  state.advanced.crossoverGaps = true;
  state.forkTravel = 0;
  api.setState(state);
  const model = api.getReplicationModelAtTravel(0, state);
  const firstSite = api.crossoverSites(state)[0];

  assert.equal(api.dnaHandedness(state), "right");
  assert.equal(api.crossoverAIsOver(firstSite.index, state), false);
  assert.equal(api.isUnderpassGap(firstSite.x, "a", model), true);
  assert.equal(api.isUnderpassGap(firstSite.x, "b", model), false);

  state.advanced.dnaHandedness = "left";
  api.setState(state);
  const leftModel = api.getReplicationModelAtTravel(0, state);
  assert.equal(api.dnaHandedness(state), "left");
  assert.equal(api.crossoverAIsOver(firstSite.index, state), true);
  assert.equal(api.isUnderpassGap(firstSite.x, "a", leftModel), false);
  assert.equal(api.isUnderpassGap(firstSite.x, "b", leftModel), true);

  state.advanced.dnaHandedness = "right";
  api.setState(state);
  const documentState = api.configurationDocument();
  const restored = api.parseConfigurationText(JSON.stringify(documentState));
  assert.equal(restored.advanced.dnaHandedness, "right");

  const handednessSwitch = html.match(/<label class="rs-toggle" for="rightHandedToggle"[\s\S]*?<\/label>/)?.[0] || "";
  assert.match(handednessSwitch, /Right-handed helix/);
  assert.match(handednessSwitch, /id="rightHandedToggle" type="checkbox" checked/);
  assert.match(source, /state\.advanced\.dnaHandedness = elements\.rightHandedToggle\.checked \? "right" : "left"/);
  assert.match(source, /elements\.rightHandedToggle\.disabled = modelName !== "standard"/);
});

test("optional cartoon contours cover strands and base pairs in every compatible model", () => {
  const state = freshState();
  state.advanced.contour = true;
  state.advanced.contourThickness = 2;
  state.advanced.contourColor = "#000000";
  state.basePairColorMode = "bases";
  state.colors.adenine = "#aa0000";
  state.colors.thymine = "#00aa00";
  api.setState(state);

  assert.equal(api.contourEnabled(state), true);
  assert.equal(api.contourThickness(state), 2);
  assert.equal(api.contourColor(state), "#000000");
  assert.equal(api.contourStrokeWidth(6, state), 10);

  const path = api.renderArtworkPath("M0 0 L10 0", "#ffffff", 6);
  assert.match(path, /data-rs-contour="true"/);
  assert.match(path, /stroke="#000000"[^>]*stroke-width="10\.0"/);
  assert.match(path, /stroke="#ffffff"[^>]*stroke-width="6\.0"/);

  const pair = api.renderBasePairLine(100, 20, 60, 1, {
    firstRole: "a",
    secondRole: "b",
    firstBase: "A",
    secondBase: "T",
  });
  assert.match(pair, /data-rs-contour="true"/);
  assert.equal((pair.match(/data-rs-contour="true"/g) || []).length, 2);
  assert.match(pair, /data-rs-base-pair-separator="midpoint"/);
  assert.match(pair, /data-rs-base-pair-separator="midpoint"[^>]*stroke-width="2\.0"[^>]*data-rs-stroke-width="2\.0"/);
  assert.match(pair, /data-half="first"/);
  assert.match(pair, /data-half="second"/);

  state.advanced.basePairTransition = "grow";
  api.setState(state);
  const growingPair = api.renderBasePairLine(100, 20, 60, 0.4, {
    firstRole: "a",
    secondRole: "b",
    firstBase: "A",
    secondBase: "T",
  });
  assert.match(growingPair, /data-rs-base-pair-separator="first-front"/);
  assert.match(growingPair, /data-rs-base-pair-separator="second-front"/);
  assert.doesNotMatch(growingPair, /data-rs-base-pair-separator="midpoint"/);
  assert.equal((growingPair.match(/data-rs-base-pair-separator=/g) || []).length, 2);

  const joinedGrowingPair = api.renderBasePairLine(100, 20, 60, 1, {
    firstRole: "a",
    secondRole: "b",
    firstBase: "A",
    secondBase: "T",
  });
  assert.match(joinedGrowingPair, /data-rs-base-pair-separator="midpoint"/);
  assert.equal((joinedGrowingPair.match(/data-rs-base-pair-separator=/g) || []).length, 1);

  state.basePairColorMode = "single";
  api.setState(state);
  const singleColourGrowingPair = api.renderBasePairLine(100, 20, 60, 0.4);
  assert.doesNotMatch(singleColourGrowingPair, /data-rs-base-pair-separator=/);
  state.basePairColorMode = "bases";
  state.advanced.basePairTransition = "fade";
  api.setState(state);

  for (const modelName of ["standard", "elegant", "minimal"]) {
    state.advanced.strandModel = modelName;
    api.setState(state);
    const markup = api.artworkMarkup(api.getReplicationModelAtTravel(state.forkTravel, state));
    assert.match(markup, /data-rs-contour="true"/, `${modelName} should render outlined strands`);
  }

  const plain = freshState();
  plain.advanced.contour = false;
  api.setState(plain);
  assert.doesNotMatch(api.renderArtworkPath("M0 0 L10 0", "#ffffff", 6), /data-rs-contour/);

  const switchGroup = html.match(/<div class="rs-options-group rs-options-switch-group">([\s\S]*?)<\/div>\s*<div class="rs-options-group rs-options-dropdown-group">/)?.[1] || "";
  assert.match(switchGroup, /for="contourToggle"/);
  assert.ok(switchGroup.lastIndexOf('for="contourToggle"') > switchGroup.lastIndexOf('for="includeExportBackgroundToggle"'));
  assert.match(html, /id="contourThicknessOption" hidden/);
  assert.match(html, /id="contourColorOption"[^>]*hidden/);
  assert.match(css, /#contourThicknessOption\[hidden\],[\s\S]*?#contourColorOption\[hidden\][\s\S]*?display:\s*none/);

  const noContourWidth = api.crossoverClipHalfWidth(1.15, 3.5, plain);
  state.advanced.strandModel = "standard";
  api.setState(state);
  const contourWidth = api.crossoverClipHalfWidth(1.15, 3.5, state);
  assert.ok(contourWidth > noContourWidth, "crossover cutouts must clear the outer contour stroke");

  state.advanced.crossoverGaps = false;
  state.forkTravel = 0;
  api.setState(state);
  const bridgeMarkup = api.renderCrossoverOverpasses(
    api.getReplicationModelAtTravel(state.forkTravel, state)
  );
  assert.match(bridgeMarkup, /data-rs-crossover-bridge="contour"/);
  assert.match(bridgeMarkup, /data-rs-crossover-bridge="contour"[^>]*stroke-linecap="butt"/);
  assert.match(bridgeMarkup, /data-rs-crossover-bridge="fill"[^>]*stroke-linecap="round"/);
  assert.ok(
    api.crossoverBridgeContourInset(state.weight, state) > 0,
    "the contour bridge must end inside the coloured redraw to avoid transverse seams"
  );
});

test("animation export has no completion popup and reports estimated progress while encoding", () => {
  assert.doesNotMatch(html, /videoReadyModal|videoReadyDownloadButton|videoSaveLink|Animation ready/);
  assert.doesNotMatch(source, /openVideoReadyModal|requestAnimationSaveHandle|showSaveFilePicker/);
  assert.match(source, /setVideoExportProgress\([\s\S]*?frameIndex/);
  assert.match(source, /saveMp4Blob\(video, filename\)/);
  assert.match(source, /setStatus\("MP4 download started"\)/);
  assert.match(css, /\.rs-button-spinner\s*\{[\s\S]*?conic-gradient/);
});

test("geometry controls expose linear, circular, and free-form DNA beside the molecular model", () => {
  const geometrySection = html.match(/<section class="rs-control-section rs-compact-section">[\s\S]*?<h2>Geometry<\/h2>([\s\S]*?)<\/section>/)?.[1] || "";
  assert.match(
    geometrySection,
    /class="rs-select-pair"[\s\S]*?for="modelControl">Model[\s\S]*?for="geometryControl">Geometry/
  );
  assert.match(geometrySection, /<option value="linear" selected>Linear<\/option>/);
  assert.match(geometrySection, /<option value="circular">Circular<\/option>/);
  assert.match(geometrySection, /<option value="freeform">Free form<\/option>/);
  assert.match(css, /\.rs-select-pair\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s);

  const advanced = html.match(/<div class="rs-options-panel">([\s\S]*?)<\/div>\s*<\/details>/)?.[1] || "";
  assert.match(
    advanced,
    /for="gridToggle">[\s\S]*?Background grid[\s\S]*?for="centricGridToggle">[\s\S]*?Centrical grid[\s\S]*?for="scaleBarToggle">[\s\S]*?Scale bar/
  );
});

test("new geometry, grid, and scale settings are explicit, persistent, and backward compatible", () => {
  const defaults = freshState();
  assert.equal(api.geometryMode(defaults), "linear");
  assert.equal(api.gridStyle(defaults), "square");
  assert.equal(api.scaleBarEnabled(defaults), true);

  defaults.geometry = "circular";
  defaults.advanced.gridStyle = "centric";
  defaults.advanced.scaleBar = false;
  api.setState(defaults);
  const documentState = api.configurationDocument();
  const restored = api.parseConfigurationText(JSON.stringify(documentState));
  assert.equal(restored.geometry, "circular");
  assert.equal(restored.advanced.gridStyle, "centric");
  assert.equal(restored.advanced.scaleBar, false);

  delete documentState.state.geometry;
  delete documentState.state.advanced.gridStyle;
  delete documentState.state.advanced.scaleBar;
  const legacy = api.parseConfigurationText(JSON.stringify(documentState));
  assert.equal(legacy.geometry, "linear");
  assert.equal(legacy.advanced.gridStyle, "square");
  assert.equal(legacy.advanced.scaleBar, true);
});

test("circular winding changes preserve a neutral periodic phase instead of pinning genomic zero", () => {
  const state = freshState();
  state.geometry = "circular";
  state.length = 50;
  state.advanced.lengthMode = "scale";
  state.advanced.circularHelixPhase = 0;
  state.advanced.circularHelixAnchor = 0.5;
  api.normaliseStateSchema(state);
  api.setState(state);

  const anchorX = api.VIEW.x0 + api.circularHelixAnchor(state) * api.VIEW.moleculeWidth;
  const anchorBefore = api.helixWave(anchorX, "a", state);
  const zeroBefore = api.helixWave(api.VIEW.x0, "a", state);
  assert.equal(api.circularTurnCountAtLength(50, state), 5);
  assert.equal(api.circularTurnCountAtLength(55, state), 6);

  api.resizeGenomeLength(55, state);
  const anchorAfter = api.helixWave(anchorX, "a", state);
  const zeroAfter = api.helixWave(api.VIEW.x0, "a", state);
  assert.ok(Math.abs(anchorAfter - anchorBefore) < 1e-9);
  assert.ok(Math.abs(zeroAfter - zeroBefore) > 1, "the unavoidable phase slip must not remain pinned at zero");
  assert.ok(Math.abs(api.circularHelixPhase(state) - 0.5) < 1e-10);
  assert.ok(
    Math.abs(api.helixWave(api.VIEW.x0, "a", state) - api.helixWave(api.VIEW.x1, "a", state)) <
      1e-9,
    "a rebased nonzero phase must still close periodically"
  );

  for (const site of api.crossoverSites(state)) {
    assert.ok(
      Math.abs(api.helixWave(site.x, "a", state) - api.helixWave(site.x, "b", state)) < 1e-8,
      "crossover depth must move with the rebased helix phase"
    );
  }

  const phase = state.advanced.circularHelixPhase;
  const anchor = state.advanced.circularHelixAnchor;
  const origins = JSON.stringify(state.origins);
  const cuts = JSON.stringify(state.cuts);
  assert.equal(api.switchGeometryWorkspace("linear", state), true);
  assert.equal(api.switchGeometryWorkspace("circular", state), true);
  assert.equal(state.advanced.circularHelixPhase, phase);
  assert.equal(state.advanced.circularHelixAnchor, anchor);
  assert.equal(JSON.stringify(state.origins), origins);
  assert.equal(JSON.stringify(state.cuts), cuts);

  api.setState(state);
  const restored = api.parseConfigurationText(JSON.stringify(api.configurationDocument()));
  assert.equal(restored.advanced.circularHelixPhase, phase);
  assert.equal(restored.advanced.circularHelixAnchor, anchor);
});

test("Free-form length edits cannot rephase the independent circular workspace", () => {
  const state = freshState();
  state.geometry = "circular";
  state.length = 50;
  state.advanced.circularHelixPhase = 0;
  state.advanced.circularHelixAnchor = 0.5;
  api.normaliseStateSchema(state);
  api.setState(state);

  const anchorX = api.VIEW.x0 + api.circularHelixAnchor(state) * api.VIEW.moleculeWidth;
  const circularWave = api.helixWave(anchorX, "a", state);
  assert.equal(api.switchGeometryWorkspace("freeform", state), true);
  api.resizeGenomeLength(55, state);
  assert.equal(state.length, 55);
  assert.equal(api.circularHelixPhase(state), 0);

  assert.equal(api.switchGeometryWorkspace("circular", state), true);
  assert.equal(state.length, 50);
  assert.equal(api.circularHelixPhase(state), 0);
  assert.ok(Math.abs(api.helixWave(anchorX, "a", state) - circularWave) < 1e-9);
});

test("right-handed circular DNA compensates for its reflected radial basis", () => {
  const linear = freshState();
  linear.geometry = "linear";
  linear.advanced.dnaHandedness = "right";
  api.setState(linear);
  assert.equal(api.geometryHandednessOrientation(linear), 1);
  assert.equal(api.crossoverAIsOver(0, linear), false);

  const circular = freshState();
  circular.geometry = "circular";
  circular.advanced.dnaHandedness = "right";
  circular.advanced.crossoverGaps = true;
  api.setState(circular);
  const site = api.crossoverSites(circular).find((candidate) => candidate.index === 0);
  const model = api.getReplicationModelAtTravel(circular.forkTravel, circular);
  assert.equal(api.geometryHandednessOrientation(circular), -1);
  assert.equal(api.crossoverAIsOver(0, circular), true);
  assert.equal(api.isUnderpassGap(site.x, "a", model), false);
  assert.equal(api.isUnderpassGap(site.x, "b", model), true);

  circular.advanced.dnaHandedness = "left";
  api.setState(circular);
  const leftModel = api.getReplicationModelAtTravel(circular.forkTravel, circular);
  assert.equal(api.crossoverAIsOver(0, circular), false);
  assert.equal(api.isUnderpassGap(site.x, "a", leftModel), true);
  assert.equal(api.isUnderpassGap(site.x, "b", leftModel), false);
});

test("a single circular origin replicates periodically through the genomic seam", () => {
  const state = freshState();
  state.geometry = "circular";
  state.origins = [
    { id: "periodic-origin", position: 0.93, startPosition: 0.93, leftOffset: 0, rightOffset: 0 },
  ];
  state.forkTravel = 0.1;
  api.setState(state);

  const partial = api.getReplicationModelAtTravel(0.1, state);
  assert.equal(partial.activeForkCount, 2);
  assert.equal(partial.regions.length, 2);
  assert.ok(Math.abs(api.replicatedFraction(partial) - 20) < 1e-8);
  assert.ok(partial.regions[0].start <= 1e-8);
  assert.ok(partial.regions.at(-1).end >= 1 - 1e-8);

  const bounds = api.forkTravelBounds(state);
  const completed = api.getReplicationModelAtTravel(bounds.full, state);
  assert.equal(completed.activeForkCount, 0);
  assert.equal(completed.regions.length, 1);
  assert.deepEqual(
    [completed.regions[0].start, completed.regions[0].end],
    [0, 1]
  );
  assert.equal(api.replicatedFraction(completed), 100);
});

test("periodic fork completion and S-phase inversion remain exact for asymmetric multi-origin programmes", () => {
  const state = freshState();
  state.geometry = "circular";
  state.origins = [
    { id: "c1", position: 0.04, startPosition: 0.04, leftOffset: -0.03, rightOffset: 0.02 },
    { id: "c2", position: 0.41, startPosition: 0.41, leftOffset: 0.07, rightOffset: -0.04 },
    { id: "c3", position: 0.84, startPosition: 0.84, leftOffset: -0.01, rightOffset: 0.05 },
  ];
  api.setState(state);
  const bounds = api.forkTravelBounds(state);
  const completed = api.getReplicationModelAtTravel(bounds.full, state);
  assert.equal(api.replicatedFraction(completed), 100);
  assert.equal(completed.activeForkCount, 0);

  for (const target of [0, 1, 7, 25, 50, 73, 99, 100]) {
    const travel = api.findForkTravelForReplicatedFraction(target, state);
    const model = api.getReplicationModelAtTravel(travel, state);
    assert.ok(
      Math.abs(api.replicatedFraction(model) - target) < 1e-6,
      `periodic S phase must invert ${target}% exactly`
    );
    for (let index = 1; index < model.regions.length; index += 1) {
      assert.ok(model.regions[index - 1].end <= model.regions[index].start + 1e-9);
    }
    assert.ok(model.regions.every((region) => region.start >= 0 && region.end <= 1));
  }
});

test("circular coordinate projection is continuous and invertible around the seam", () => {
  const state = freshState();
  state.geometry = "circular";
  api.setState(state);
  for (const fraction of [0, 0.001, 0.125, 0.5, 0.999]) {
    for (const radialOffset of [-80, 0, 135]) {
      const linear = {
        x: api.VIEW.x0 + fraction * api.VIEW.moleculeWidth,
        y: api.VIEW.centerY + radialOffset,
      };
      const projected = api.geometryPoint(linear.x, linear.y, state);
      const restored = api.geometryPointToLinear(projected, state);
      const restoredFraction = (restored.x - api.VIEW.x0) / api.VIEW.moleculeWidth;
      assert.ok(Math.abs(api.clockwiseFractionDistance(fraction, restoredFraction)) < 1e-9 || Math.abs(api.clockwiseFractionDistance(restoredFraction, fraction)) < 1e-9);
      assert.ok(Math.abs(restored.y - linear.y) < 1e-9);
    }
  }
  const seamStart = api.geometryPoint(api.VIEW.x0, api.VIEW.centerY, state);
  const seamEnd = api.geometryPoint(api.VIEW.x1, api.VIEW.centerY, state);
  assert.ok(Math.hypot(seamStart.x - seamEnd.x, seamStart.y - seamEnd.y) < 1e-9);
});

test("linear right-end state survives a circular round trip without changing periodic rendering", () => {
  const state = freshState();
  state.geometry = "linear";
  state.forkTravel = 0.08;
  state.origins = [
    {
      id: "right-end-origin",
      position: 1,
      startPosition: 1,
      leftOffset: 0.025,
      rightOffset: -0.015,
    },
  ];
  state.cuts = [{ start: 1, end: 1 }];
  state.selectedOriginId = null;
  state.selectedFork = { originId: "right-end-origin", side: "left" };
  state.advanced.circularHelixPhase = 0.37;
  state.advanced.circularHelixAnchor = 0.42;
  api.normaliseStateSchema(state);
  api.setState(state);

  assert.equal(api.switchGeometryWorkspace("circular", state), true);
  assert.equal(state.origins[0].startPosition, 1);
  assert.equal(state.origins[0].position, 1);
  assert.equal(state.selectedFork.originId, "right-end-origin");
  assert.equal(state.selectedFork.side, "left");
  assert.equal(state.cuts[0].start, 1);
  assert.equal(state.cuts[0].end, 1);
  assert.equal(state.advanced.circularHelixPhase, 0.37);
  assert.equal(state.advanced.circularHelixAnchor, 0.42);

  const circularOrigin = api.getCircularReplicationModelAtTravel(state.forkTravel, state).origins[0];
  assert.equal(circularOrigin.startPosition, 0, "periodic calculations must canonicalise 1 to 0");
  assert.equal(circularOrigin.position, 0);
  assert.ok(Number.isFinite(circularOrigin.leftPosition));
  assert.ok(Number.isFinite(circularOrigin.rightPosition));
  const rightEndpointTiming = {
    ...state,
    advanced: { ...state.advanced, strandModel: "minimal" },
  };
  const zeroEquivalent = {
    ...rightEndpointTiming,
    origins: rightEndpointTiming.origins.map((origin) => ({
      ...origin,
      position: 0,
      startPosition: 0,
    })),
  };
  assert.deepEqual(
    JSON.parse(JSON.stringify(api.forkTravelBounds(rightEndpointTiming))),
    JSON.parse(JSON.stringify(api.forkTravelBounds(zeroEquivalent))),
    "periodic fork timing must treat the retained right endpoint as genomic zero"
  );

  assert.equal(api.switchGeometryWorkspace("linear", state), true);
  assert.equal(state.origins[0].id, "right-end-origin");
  assert.equal(state.origins[0].position, 1);
  assert.equal(state.origins[0].startPosition, 1);
  assert.equal(state.origins[0].leftOffset, 0.025);
  assert.equal(state.origins[0].rightOffset, -0.015);
  assert.equal(state.selectedFork.originId, "right-end-origin");
  assert.equal(state.selectedFork.side, "left");
  assert.equal(state.cuts[0].start, 1);
  assert.equal(state.cuts[0].end, 1);
  assert.equal(api.getReplicationModelAtTravel(state.forkTravel, state).origins[0].position, 1);
});

test("saved circular state retains a structured right-end origin while rendering it at the seam", () => {
  const state = freshState();
  state.geometry = "circular";
  state.origins = [
    {
      id: "saved-right-end",
      position: 1,
      startPosition: 1,
      leftOffset: 0,
      rightOffset: 0,
    },
  ];
  state.cuts = [{ start: 0.96, end: 1 }];
  state.selectedOriginId = "saved-right-end";
  state.selectedFork = null;
  api.normaliseStateSchema(state);
  api.setState(state);

  const restored = api.parseConfigurationText(JSON.stringify(api.configurationDocument()));
  assert.equal(restored.geometry, "circular");
  assert.equal(restored.origins[0].startPosition, 1);
  assert.equal(restored.origins[0].position, 1);
  assert.equal(restored.cuts[0].start, 0.96);
  assert.equal(restored.cuts[0].end, 1);
  assert.equal(
    api.getCircularReplicationModelAtTravel(restored.forkTravel, restored).origins[0].position,
    0
  );
});

test("circular base-pair and helix sampling closes without duplicating the seam", () => {
  const state = freshState();
  state.geometry = "circular";
  state.length = 93;
  api.setState(state);
  const lattice = api.basePairLattice(state);
  assert.equal(lattice.edgeOffset, 0);
  assert.equal(lattice.count, lattice.subdivisionCount);
  const positions = api.displayedBasePairPositions(state);
  assert.equal(positions.length, lattice.count);
  assert.equal(positions[0], 0);
  assert.equal(positions.at(-1), lattice.count - 1);
  assert.ok(Math.abs(api.helixWave(api.VIEW.x0, "a", state) - api.helixWave(api.VIEW.x1, "a", state)) < 1e-9);
});

test("every molecular model renders finite closed circular artwork across S phase", () => {
  for (const modelName of ["standard", "elegant", "minimal"]) {
    for (const target of [0, 12, 50, 99, 100]) {
      const state = freshState();
      state.geometry = "circular";
      state.advanced.strandModel = modelName;
      api.setState(state);
      state.forkTravel = api.findForkTravelForReplicatedFraction(target, state);
      const model = api.getReplicationModelAtTravel(state.forkTravel, state);
      const markup = api.artworkMarkup(model);
      assert.doesNotMatch(markup, /NaN|Infinity|undefined/);
      assert.match(markup, /<path/);
      assert.match(markup, /\sZ(?:"|\s)/, `${modelName} template paths must close on the circle`);
    }
  }
});

test("circular scale and centrical grid obey their independent advanced switches", () => {
  const state = freshState();
  state.geometry = "circular";
  state.advanced.grid = true;
  state.advanced.gridStyle = "centric";
  state.advanced.scaleBar = true;
  api.setState(state);
  api.setViewState({ zoom: 1, panX: 0, panY: 0 });
  const grid = api.renderCentricGrid(state);
  const ruler = api.renderCircularRuler(state);
  assert.match(grid, /class="rs-centric-grid/);
  assert.match(grid, /<circle/);
  assert.match(grid, /<line/);
  assert.match(ruler, /class="rs-circular-ruler/);
  assert.match(ruler, /Genomic position \(bp\)/);
  assert.doesNotMatch(ruler, /NaN|Infinity/);

  state.advanced.gridStyle = "square";
  assert.equal(api.renderCentricGrid(state), "");
  state.advanced.scaleBar = false;
  assert.equal(api.renderCircularRuler(state), "");
});

test("wrapped replicated bubbles can be located, split, and selectively unreplicated without losing the seam arc", () => {
  const state = freshState();
  state.geometry = "circular";
  state.origins = [
    { id: "wrapped", position: 0.95, startPosition: 0.95, leftOffset: 0, rightOffset: 0 },
  ];
  state.forkTravel = 0.15;
  api.setState(state);
  const model = api.getReplicationModelAtTravel(state.forkTravel, state);
  const periodic = api.periodicRegionAtPosition(0.02, model);
  assert.ok(periodic);
  assert.ok(periodic.region.start > 0.7);
  assert.ok(periodic.region.end > 1);
  assert.ok(periodic.position > 1);

  const plan = api.unreplicateRangePlan(0.84, 0.89, state);
  assert.equal(Array.from(plan.removedOriginIds).join(","), "wrapped");
  assert.ok(plan.remainingSegments.some((segment) => segment.end > 1));
  const result = api.unreplicateRange(0.84, 0.89, state);
  assert.equal(result.changed, true);
  const after = api.getReplicationModelAtTravel(state.forkTravel, state);
  assert.ok(after.regions.some((region) => region.start <= 1e-8));
  assert.ok(after.regions.some((region) => region.end >= 1 - 1e-8));
  assert.ok(api.replicatedFraction(after) < api.replicatedFraction(model));
});

test("circular video framing contains the complete molecule at extreme aspect ratios", () => {
  const state = freshState();
  state.geometry = "circular";
  state.advanced.aspectX = 2.4;
  state.advanced.aspectY = 0.55;
  state.daughterSpacing = 260;
  api.setState(state);
  const videoState = api.makeVideoExportState();
  const frame = api.fixedVideoSvgSource(videoState, videoState.forkTravel);
  assert.ok(frame.width > frame.height);
  assert.ok(frame.width > 0 && frame.height > 0);
  assert.doesNotMatch(frame.source, /NaN|Infinity/);
  assert.match(frame.source, /<svg/);
});

test("the circular genomic-scale title is anchored below the molecule", () => {
  const state = freshState();
  state.geometry = "circular";
  state.advanced.scaleBar = true;
  api.setState(state);
  api.setViewState({ zoom: 1, panX: 0, panY: 0 });

  const markup = api.renderCircularRuler(state);
  assert.match(markup, /data-rs-circular-ruler-title="bottom"/);
  const titleTransform = markup.match(
    /data-rs-circular-ruler-title="bottom" transform="matrix\([^)]* ([\d.-]+) ([\d.-]+)\)"/
  );
  assert.ok(titleTransform, "the title must expose its final canvas translation");
  const titleY = Number(titleTransform[2]);
  assert.ok(titleY > api.VIEW.centerY + api.circularRulerRadius(state));
  assert.match(markup, />Genomic position \(bp\)<\/text>/);
});

test("moving one circular fork across the seam leaves its partner fixed", () => {
  const state = freshState();
  state.geometry = "circular";
  state.forkTravel = 0.1;
  state.origins = [
    { id: "seam-origin", position: 0.95, startPosition: 0.95, leftOffset: 0, rightOffset: 0 },
  ];
  api.setState(state);
  const before = api.getReplicationModelAtTravel(state.forkTravel, state).origins[0];
  assert.ok(Math.abs(before.leftPosition - 0.85) < 1e-10);
  assert.ok(Math.abs(before.rightPosition - 0.05) < 1e-10);

  const drag = {
    role: "fork",
    side: "right",
    originId: "seam-origin",
    pairedForks: true,
    mirroredForks: false,
    originStartPosition: 0.95,
    originStartUnwrapped: 0.95,
    leftPosition: 0.85,
    rightPosition: 0.05,
    leftUnwrapped: 0.85,
    rightUnwrapped: 1.05,
  };
  const result = api.applyForkDragPosition(drag, 1.18, state);
  assert.ok(result);
  const origin = state.origins[0];
  const unwrappedCenter = 1 + origin.startPosition;
  const stationaryLeft = unwrappedCenter - Math.max(0, state.forkTravel + origin.leftOffset);
  const movedRight = unwrappedCenter + Math.max(0, state.forkTravel + origin.rightOffset);
  assert.ok(Math.abs(stationaryLeft - 0.85) < 1e-10, "the untouched fork must not retreat");
  assert.ok(Math.abs(movedRight - 1.18) < 1e-10);
});

test("a dragged fork absorbs dormant origins without activating their far side", () => {
  for (const geometry of ["linear", "circular"]) {
    const state = freshState();
    state.geometry = geometry;
    state.forkTravel = 0.1;
    state.origins = [
      { id: "active", position: 0.2, startPosition: 0.2, leftOffset: 0, rightOffset: 0 },
      { id: "dormant", position: 0.5, startPosition: 0.5, leftOffset: -0.2, rightOffset: -0.2 },
    ];
    api.setState(state);
    assert.equal(api.dormantOriginAtCurrentTime(state.origins[1], state), true);
    const drag = {
      role: "fork",
      side: "right",
      originId: "active",
      pairedForks: true,
      mirroredForks: false,
      originStartPosition: 0.2,
      originStartUnwrapped: 0.2,
      leftPosition: 0.1,
      rightPosition: 0.3,
      leftUnwrapped: 0.1,
      rightUnwrapped: 0.3,
    };
    const result = api.applyForkDragPosition(drag, 0.62, state);
    assert.ok(result);
    assert.equal(result.absorbedOriginCount, 1, `${geometry} drag must report one absorbed origin`);
    assert.deepEqual(state.origins.map((origin) => origin.id), ["active"]);
    assert.ok(!state.origins.some((origin) => origin.id === "dormant"));
    const model = api.getReplicationModelAtTravel(state.forkTravel, state);
    assert.equal(model.origins.length, 1, "no second fork may be opened beyond the consumed origin");
  }
});

test("replaying a completed S phase preserves the configured firing schedule", () => {
  const state = freshState();
  state.origins = [
    { id: "early", position: 0.25, startPosition: 0.25, leftOffset: 0.08, rightOffset: 0.03 },
    { id: "late", position: 0.75, startPosition: 0.75, leftOffset: -0.12, rightOffset: -0.09 },
  ];
  state.forkTravel = api.forkTravelBounds(state).full;
  state.progress = 100;
  state.playing = false;
  api.setState(state);
  const offsets = state.origins.map(({ leftOffset, rightOffset }) => [leftOffset, rightOffset]);
  api.setElements({
    playButton: { setAttribute() {} },
    playIcon: { innerHTML: "" },
    playLabel: { textContent: "" },
    statusMessage: { textContent: "" },
    undoButton: { disabled: false },
    redoButton: { disabled: false },
  });

  api.toggleAnimation();
  assert.deepEqual(
    state.origins.map(({ leftOffset, rightOffset }) => [leftOffset, rightOffset]),
    offsets,
    "replay must not flatten origin firing-time offsets"
  );
  assert.equal(state.forkTravel, api.forkTravelBounds(state).zero);
  assert.equal(state.playing, true);
  api.stopAnimation();
});

test("depth-aware two-colour base pairs follow crossover depth and resolution", () => {
  const state = freshState();
  state.basePairColorMode = "strand";
  state.advanced.strandModel = "standard";
  state.advanced.depthAwareBasePairSplit = true;
  state.advanced.dnaHandedness = "right";
  api.setState(state);
  const site = api.crossoverSites(state)[0];
  const rightSplit = api.basePairDepthSplitFraction(site.x, "a", "b", state);
  assert.ok(rightSplit < 0.5, "right-handed crossover should favour the front B strand at the first site");

  state.advanced.dnaHandedness = "left";
  api.setState(state);
  const leftSplit = api.basePairDepthSplitFraction(site.x, "a", "b", state);
  assert.ok(leftSplit > 0.5, "changing handedness must reverse the depth cue");

  const splitAtQuarterCrossover = (resolution) => {
    state.pairResolution = resolution;
    api.normaliseStateSchema(state);
    api.setState(state);
    const sites = api.crossoverSites(state);
    const fraction = sites[0].fraction + 0.25 / sites.length;
    const x = api.VIEW.x0 + fraction * api.VIEW.moleculeWidth;
    return api.basePairDepthSplitFraction(x, "a", "b", state);
  };
  const lowResolution = splitAtQuarterCrossover(1);
  const highResolution = splitAtQuarterCrossover(9);
  assert.ok(Math.abs(lowResolution - highResolution) < 1e-10, "the depth falloff must scale with resolution");

  state.advanced.depthAwareBasePairSplit = false;
  api.setState(state);
  assert.equal(api.basePairDepthSplitFraction(site.x, "a", "b", state), 0.5);
});

test("base-pair angles remain strand-constrained and vertical by default", () => {
  const state = freshState();
  state.origins = [];
  state.forkTravel = 0;
  state.advanced.basePairAngle = 0;
  api.setState(state);
  const model = api.getReplicationModelAtTravel(0, state);
  const x = (api.VIEW.x0 + api.VIEW.x1) / 2;
  const firstY = api.templateY(x, "a", model);
  const secondY = api.templateY(x, "b", model);
  const vertical = api.angledBasePairEndpoints(x, firstY, secondY, {
    firstRole: "a",
    secondRole: "b",
    model,
  }, state);
  assert.equal(api.basePairAngleLabel(state), "Vertical");
  assert.equal(vertical.firstX, x);
  assert.equal(vertical.secondX, x);

  state.advanced.basePairAngle = 60;
  api.setState(state);
  const angled = api.angledBasePairEndpoints(x, firstY, secondY, {
    firstRole: "a",
    secondRole: "b",
    model,
  }, state);
  const latticeLimit = api.VIEW.moleculeWidth / api.basePairLattice(state).subdivisionCount * 0.44;
  assert.ok(angled.firstX < x && angled.secondX > x);
  assert.ok(x - angled.firstX <= latticeLimit + 1e-10);
  assert.ok(angled.secondX - x <= latticeLimit + 1e-10);
  assert.ok(Number.isFinite(angled.firstY) && Number.isFinite(angled.secondY));

  const nearEndX = api.VIEW.x0 + latticeLimit / 4;
  const nearEnd = api.angledBasePairEndpoints(
    nearEndX,
    api.templateY(nearEndX, "a", model),
    api.templateY(nearEndX, "b", model),
    { firstRole: "a", secondRole: "b", model },
    state
  );
  assert.ok(nearEnd.firstX >= api.VIEW.x0 - 1e-10);
  assert.ok(nearEnd.secondX <= api.VIEW.x1 + 1e-10);
});

test("Settings organise and normalise independent GIF, MP4 and application options", () => {
  assert.match(html, /id="settingsMenuButton"[^>]*role="menuitem"/);
  assert.match(html, /id="settingsModal"[^>]*hidden/);
  assert.match(html, /<legend>GIF export<\/legend>[\s\S]*<legend>MP4 export<\/legend>[\s\S]*<legend>Application<\/legend>/);
  assert.match(html, /id="settingsGifFrameRateControl"[\s\S]*10 fps[\s\S]*15 fps[\s\S]*20 fps/);
  assert.match(html, /id="settingsGifResolutionControl"[\s\S]*640 px[\s\S]*960 px[\s\S]*1280 px/);
  assert.match(html, /id="settingsGifColoursControl"[\s\S]*64 colours[\s\S]*128 colours[\s\S]*256 colours/);
  assert.match(html, /id="settingsGifLoopToggle"[^>]*checked/);
  assert.match(html, /id="settingsFrameRateControl"[\s\S]*24 fps[\s\S]*30 fps[\s\S]*60 fps/);
  assert.match(html, /id="settingsResolutionControl"[\s\S]*1280 px[\s\S]*1920 px[\s\S]*2560 px[\s\S]*3840 px/);
  assert.match(css, /\.rs-settings-backdrop\s*\{/);
  assert.match(css, /\.rs-settings-section\s*\{/);
  assert.match(source, /elements\.settingsMenuButton\.addEventListener\("click", openSettingsModal\)/);

  const normalised = api.normaliseAppSettings({
    frameRate: 30,
    videoWidth: 3840,
    videoQuality: "maximum",
    gifFrameRate: 20,
    gifWidth: 1280,
    gifColors: 256,
    gifLoop: false,
    previewDetail: "fast",
    pauseWhenHidden: false,
    rememberProject: false,
  });
  assert.deepEqual(JSON.parse(JSON.stringify(normalised)), {
    frameRate: 30,
    videoWidth: 3840,
    videoQuality: "maximum",
    gifFrameRate: 20,
    gifWidth: 1280,
    gifColors: 256,
    gifLoop: false,
    previewDetail: "fast",
    pauseWhenHidden: false,
    rememberProject: false,
  });
  api.setAppSettings(normalised);
  assert.equal(api.animationFrameRate(), 30);
  assert.equal(api.animationResolution(), 3840);
  assert.equal(api.gifFrameRate(), 20);
  assert.equal(api.gifResolution(), 1280);
  assert.equal(api.gifColourCount(), 256);
  assert.equal(api.gifLoops(), false);
  assert.ok(api.videoBitsPerSecond() > 9_000_000);

  const state = freshState();
  api.setState(state);
  const plan = api.videoFramePlan(state);
  assert.equal(plan.frameRate, 30);
  assert.equal(plan.frameDurationSeconds, 1 / 30);
  const gifPlan = api.gifFramePlan(state);
  assert.equal(gifPlan.frameRate, 20);
  assert.equal(gifPlan.frameDurationSeconds, 1 / 20);
  assert.equal(gifPlan.startTravel, plan.startTravel);
  assert.equal(gifPlan.completionTravel, plan.completionTravel);

  const invalid = api.normaliseAppSettings({
    gifFrameRate: 60,
    gifWidth: 3840,
    gifColors: 12,
  });
  assert.equal(invalid.gifFrameRate, api.APP_SETTINGS_DEFAULTS.gifFrameRate);
  assert.equal(invalid.gifWidth, api.APP_SETTINGS_DEFAULTS.gifWidth);
  assert.equal(invalid.gifColors, api.APP_SETTINGS_DEFAULTS.gifColors);
  api.setAppSettings(api.APP_SETTINGS_DEFAULTS);
});

test("large interactive genomes reduce preview work but retain full static detail", () => {
  const state = freshState();
  state.length = 625;
  state.pairResolution = 3;
  state.playing = false;
  api.setState(state);
  api.setAppSettings({ ...api.APP_SETTINGS_DEFAULTS, previewDetail: "auto" });
  api.setRenderDetail(null);
  assert.equal(api.basePairDisplayStep(state), 1);

  state.playing = true;
  assert.ok(api.basePairDisplayStep(state) > 1);
  const interactiveStep = api.adaptivePathSampleStep(3, state);
  state.playing = false;
  const staticStep = api.adaptivePathSampleStep(3, state);
  assert.ok(interactiveStep >= staticStep);

  api.setRenderDetail("full");
  state.playing = true;
  assert.equal(api.basePairDisplayStep(state), 1, "full-detail export rendering must restore every rung");
  api.setRenderDetail(null);
  state.playing = false;
});

test("direct fork and bubble drags keep structured base-pair and path sampling unchanged", () => {
  for (const geometry of ["linear", "circular"]) {
    const state = freshState();
    state.geometry = geometry;
    state.length = 625;
    state.pairResolution = 3;
    state.playing = false;
    api.normaliseStateSchema(state);
    api.setState(state);
    api.setAppSettings({ ...api.APP_SETTINGS_DEFAULTS, previewDetail: "auto" });
    api.setRenderDetail(null);
    api.setDragState(null);

    const releasedPositions = api.displayedBasePairPositions(state);
    const releasedStep = api.adaptivePathSampleStep(3, state);
    const model = api.getReplicationModel();
    const releasedArtwork = api.artworkMarkup(model);
    api.setDragState({ role: "fork", side: "right", originId: state.origins[0]?.id || null });
    assert.deepEqual(
      api.displayedBasePairPositions(state),
      releasedPositions,
      `${geometry} fork dragging cannot temporarily replace the base-pair lattice`
    );
    assert.equal(
      api.adaptivePathSampleStep(3, state),
      releasedStep,
      `${geometry} fork dragging cannot temporarily change strand sampling`
    );
    assert.equal(
      api.artworkMarkup(model),
      releasedArtwork,
      `${geometry} artwork must not change merely because a drag is active`
    );

    api.setDragState({ role: "origin", originId: state.origins[0]?.id || null });
    assert.deepEqual(api.displayedBasePairPositions(state), releasedPositions);
    assert.equal(api.adaptivePathSampleStep(3, state), releasedStep);
    assert.equal(api.artworkMarkup(model), releasedArtwork);
    api.setDragState(null);
  }
});

test("snapped circular fork dragging remains strictly smooth through the 0-nt seam", () => {
  const state = freshState();
  state.geometry = "circular";
  state.advanced.snapToBasePairs = true;
  state.forkTravel = 0.1;
  state.origins = [
    { id: "seam-origin", position: 0.95, startPosition: 0.95, leftOffset: 0, rightOffset: 0 },
  ];
  api.normaliseStateSchema(state);
  api.setState(state);

  const pointerDrag = {
    role: "fork",
    side: "right",
    originId: "seam-origin",
    pairedForks: true,
    componentClosed: false,
    startPointerPosition: 0.98,
    lastWrappedPointerPosition: 0.98,
    unwrappedPointerPosition: 0.98,
  };
  const unwrapped = [0.99, 0.01, 0.03].map((position) =>
    api.unwrappedDragPointer(pointerDrag, position, state)
  );
  assert.ok(unwrapped[0] < unwrapped[1] && unwrapped[1] < unwrapped[2]);
  assert.ok(Math.abs(unwrapped[1] - 1.01) < 1e-10);

  const inputPositions = [0.982, 0.988, 0.994, 1, 1.006, 1.012, 1.018];
  const magnetisedPositions = inputPositions.map((position) =>
    api.snapCircularForkDragPosition(position, state)
  );
  for (let index = 1; index < magnetisedPositions.length; index += 1) {
    assert.ok(
      magnetisedPositions[index] > magnetisedPositions[index - 1],
      "the magnetic base-pair lattice must remain strictly monotonic across genomic zero"
    );
  }

  const drag = {
    role: "fork",
    side: "right",
    originId: "seam-origin",
    pairedForks: true,
    mirroredForks: false,
    originStartPosition: 0.95,
    originStartUnwrapped: 0.95,
    leftPosition: 0.85,
    rightPosition: 0.05,
    leftUnwrapped: 0.85,
    rightUnwrapped: 1.05,
  };
  const results = [];
  const stationaryForkPositions = [];
  inputPositions.forEach((position) => {
    results.push(api.applyForkDragPosition(drag, position, state));
    const model = api.getCircularReplicationModelAtTravel(state.forkTravel, state);
    stationaryForkPositions.push(model.origins[0].leftUnwrapped);
  });
  assert.ok(results.every(Boolean));
  for (let index = 1; index < results.length; index += 1) {
    assert.ok(
      results[index].movingPositionUnwrapped > results[index - 1].movingPositionUnwrapped,
      "the fork handle must move continuously rather than pausing or snapping at 0 nt"
    );
    assert.ok(
      results[index].movingPositionUnwrapped - results[index - 1].movingPositionUnwrapped < 0.03,
      "crossing the seam must not create a visible jump"
    );
  }
  stationaryForkPositions.forEach((position) => {
    assert.ok(Math.abs(position - 0.85) < 1e-10);
  });
  const beforeSeam = api.geometryPoint(
    api.VIEW.x0 + results[2].movingPosition * api.VIEW.moleculeWidth,
    api.VIEW.centerY,
    state
  );
  const afterSeam = api.geometryPoint(
    api.VIEW.x0 + results[4].movingPosition * api.VIEW.moleculeWidth,
    api.VIEW.centerY,
    state
  );
  assert.ok(Math.hypot(afterSeam.x - beforeSeam.x, afterSeam.y - beforeSeam.y) < 80);

  // The original defect was in the strand envelope rather than the fork
  // handle: the seam-split bubble was evaluated as two independent regions,
  // causing both template strands to jump radially at genomic zero.
  const seamModel = api.getCircularReplicationModelAtTravel(state.forkTravel, state);
  const seamOffsetFraction = 1e-5;
  const seamOffset = api.VIEW.moleculeWidth * seamOffsetFraction;
  const beforeProfile = api.replicationAt(api.VIEW.x1 - seamOffset, seamModel);
  const atRightSeam = api.replicationAt(api.VIEW.x1, seamModel);
  const atLeftSeam = api.replicationAt(api.VIEW.x0, seamModel);
  const afterProfile = api.replicationAt(api.VIEW.x0 + seamOffset, seamModel);
  assert.ok(beforeProfile.region?.periodicJoin);
  assert.ok(atRightSeam.region?.periodicJoin);
  assert.ok(atLeftSeam.region?.periodicJoin);
  assert.ok(afterProfile.region?.periodicJoin);
  assert.ok(Math.abs(atRightSeam.profile - atLeftSeam.profile) < 1e-12);
  const leftDerivative = (atRightSeam.profile - beforeProfile.profile) / seamOffsetFraction;
  const rightDerivative = (afterProfile.profile - atLeftSeam.profile) / seamOffsetFraction;
  assert.ok(
    Math.abs(leftDerivative - rightDerivative) < 0.02,
    "the replication envelope must have a continuous slope through genomic zero"
  );
  assert.ok(
    Math.abs(
      api.templateY(api.VIEW.x1, "a", seamModel) -
      api.templateY(api.VIEW.x0, "a", seamModel)
    ) < 1e-10,
    "the strand itself must meet continuously at genomic zero"
  );
  const renderedRegions = api.renderableReplicationRegions(seamModel, state);
  assert.equal(renderedRegions.filter((region) => region.periodicJoin).length, 1);
});

test("free-form arc-length coordinates round-trip on curved DNA", () => {
  const state = freeformState([
    {
      id: "curve",
      closed: false,
      points: [
        { x: 160, y: 360 },
        { x: 360, y: 180 },
        { x: 640, y: 390 },
        { x: 980, y: 230 },
      ],
    },
  ]);
  api.setState(state);
  const metric = api.freeformMetricById("curve", state);
  assert.ok(metric && metric.length > 0);
  const global = api.freeformLocalToFraction("curve", 0.37, state);
  const point = api.freeformPointAtFraction(global, state, "curve");
  const linear = api.geometryPointToLinear({ x: point.x, y: point.y }, state);
  const recoveredGlobal = (linear.x - api.VIEW.x0) / api.VIEW.moleculeWidth;
  const recoveredLocal = api.freeformFractionToLocal(recoveredGlobal, metric, state);
  assert.ok(Math.abs(recoveredLocal - 0.37) < 1e-8);
  assert.equal(point.pathId, "curve");
  assert.ok(Number.isFinite(point.tangentX) && Number.isFinite(point.normalY));
});

test("open and closed free-form pieces replicate independently without crossing components", () => {
  const paths = [
    {
      id: "open-piece",
      closed: false,
      points: [
        { x: 120, y: 210 },
        { x: 500, y: 210 },
      ],
    },
    {
      id: "loop-piece",
      closed: true,
      points: [
        { x: 720, y: 180 },
        { x: 980, y: 180 },
        { x: 980, y: 430 },
        { x: 720, y: 430 },
      ],
    },
  ];
  const state = freeformState(paths, [
    {
      id: "open-origin",
      position: 0,
      startPosition: 0,
      localPosition: 0.5,
      moleculeId: "open-piece",
      leftOffset: 0,
      rightOffset: 0,
    },
    {
      id: "loop-origin",
      position: 0,
      startPosition: 0,
      localPosition: 0.2,
      moleculeId: "loop-piece",
      leftOffset: 0,
      rightOffset: 0,
    },
  ]);
  state.forkTravel = api.forkTravelBounds(state).full;
  api.setState(state);
  const model = api.getFreeformReplicationModelAtTravel(state.forkTravel, state);
  const metrics = api.freeformPathMetrics(state);
  assert.equal(new Set(model.origins.map((origin) => origin.componentId)).size, 2);
  for (const region of model.regions) {
    const metric = metrics.find((candidate) => candidate.id === region.componentId);
    assert.ok(metric);
    assert.ok(region.start >= metric.start - 1e-10);
    assert.ok(region.end <= metric.end + 1e-10);
  }
  assert.ok(Math.abs(api.replicatedFraction(model) - 100) < 1e-8);
  assert.equal(model.activeForkCount, 0);
});

test("free-form topology changes update genomic length without moving or refitting painted DNA", () => {
  const state = freeformState([
    {
      id: "first-piece",
      closed: false,
      points: [
        { x: 120, y: 180 },
        { x: 480, y: 180 },
      ],
    },
  ]);
  state.length = 100;
  state.advanced.lengthMode = "scale";
  api.normaliseStateSchema(state);
  api.setState(state);
  api.setViewState({ zoom: 1.65, panX: 117, panY: -43 });

  const firstPathBefore = JSON.parse(JSON.stringify(state.freeform.paths[0].points));
  const viewBefore = api.getViewState();
  const arcBeforeAdd = api.freeformTotalArcLength(state);
  const lengthBeforeAdd = state.length;
  const added = api.addFreeformPath(
    [
      { x: 650, y: 450 },
      { x: 1030, y: 450 },
    ],
    state
  );
  assert.ok(added);
  const arcAfterAdd = api.freeformTotalArcLength(state);
  const targetAfterAdd = lengthBeforeAdd * (arcAfterAdd / arcBeforeAdd);
  const expectedAfterAdd = api.boundedLengthValue(
    Math.max(1, Math.round(targetAfterAdd)),
    { ...state, length: targetAfterAdd }
  );
  assert.equal(state.length, expectedAfterAdd);
  assert.ok(state.length > lengthBeforeAdd);
  assert.deepEqual(
    JSON.parse(JSON.stringify(state.freeform.paths.find((path) => path.id === "first-piece").points)),
    firstPathBefore,
    "adding another molecule must not rescale existing painted coordinates"
  );
  assert.deepEqual(api.getViewState(), viewBefore, "painting must not refit or pan the canvas");

  const arcBeforeErase = api.freeformTotalArcLength(state);
  const lengthBeforeErase = state.length;
  const erased = api.eraseFreeformPaths(
    added.points.map((point) => ({ ...point })),
    36,
    state
  );
  assert.equal(erased.changed, true);
  assert.equal(state.freeform.paths.length, 1);
  const arcAfterErase = api.freeformTotalArcLength(state);
  const targetAfterErase = lengthBeforeErase * (arcAfterErase / arcBeforeErase);
  const expectedAfterErase = api.boundedLengthValue(
    Math.max(1, Math.round(targetAfterErase)),
    { ...state, length: targetAfterErase }
  );
  assert.equal(state.length, expectedAfterErase);
  assert.ok(state.length < lengthBeforeErase);
  assert.deepEqual(api.getViewState(), viewBefore, "erasing must not refit or pan the canvas");
});

test("adding or deleting an unrelated free-form component leaves existing DNA unchanged", () => {
  const state = freeformState(
    [
      {
        id: "stable-piece",
        closed: false,
        genomicLength: 120,
        points: [
          { x: 120, y: 220 },
          { x: 310, y: 170 },
          { x: 520, y: 250 },
        ],
      },
    ],
    [
      {
        id: "stable-origin",
        position: 0.42,
        startPosition: 0.42,
        localPosition: 0.42,
        moleculeId: "stable-piece",
        leftOffset: -0.018,
        rightOffset: 0.027,
      },
    ]
  );
  state.forkTravel = 0.075;
  api.normaliseStateSchema(state);
  api.setState(state);
  api.setViewState({ zoom: 1.4, panX: 36, panY: -18 });

  const stableSignature = () => {
    const path = state.freeform.paths.find((candidate) => candidate.id === "stable-piece");
    const metric = api.freeformMetricById("stable-piece", state);
    const model = api.getFreeformReplicationModelAtTravel(state.forkTravel, state);
    const origin = model.origins.find((candidate) => candidate.id === "stable-origin");
    const region = model.regions.find((candidate) => candidate.componentId === "stable-piece");
    const componentState = api.freeformComponentVisualState(metric, state);
    const basePairs = api.freeformBasePairSites(state)
      .filter((site) => site.pathId === "stable-piece")
      .map((site) => [
        site.index,
        Number(site.localFraction.toFixed(10)),
        api.basePairIdentity(site.index, componentState).label,
      ]);
    const helix = [0.08, 0.31, 0.63, 0.91].map((localFraction) => {
      const globalFraction = metric.start + localFraction * metric.span;
      const x = api.VIEW.x0 + globalFraction * api.VIEW.moleculeWidth;
      return Number(api.helixWave(x, "a", state).toFixed(10));
    });
    const transitionCoordinateWidth = api.regionTransitionWidth(region, state);
    const transitionArcWidth =
      (transitionCoordinateWidth * metric.length) /
      (metric.span * api.VIEW.moleculeWidth);
    const regionStartLocal = (region.start - metric.start) / metric.span;
    const transitionProbeLocal = regionStartLocal + transitionArcWidth / (metric.length * 2);
    const transitionProbeX =
      api.VIEW.x0 +
      (metric.start + transitionProbeLocal * metric.span) * api.VIEW.moleculeWidth;
    return {
      points: JSON.parse(JSON.stringify(path.points)),
      genomicLength: path.genomicLength,
      basePairs,
      helix,
      localOrigin: Number(origin.localStartPosition.toFixed(10)),
      localLeft: Number(origin.localLeftPosition.toFixed(10)),
      localRight: Number(origin.localRightPosition.toFixed(10)),
      transitionArcWidth: Number(transitionArcWidth.toFixed(10)),
      transitionProfile: Number(
        api.visualReplicationAt(transitionProbeX, model).profile.toFixed(10)
      ),
      view: api.getViewState(),
    };
  };

  const before = stableSignature();
  const added = api.addFreeformPath(
    [
      { x: 690, y: 420 },
      { x: 850, y: 350 },
      { x: 1060, y: 430 },
    ],
    state
  );
  assert.ok(added);
  assert.deepEqual(stableSignature(), before);
  assert.ok(state.length > before.genomicLength);
  assert.ok(api.maximumLengthForBasePairCount(state) >= state.length);

  const erased = api.eraseFreeformPaths(
    added.points.map((point) => ({ ...point })),
    48,
    state
  );
  assert.equal(erased.changed, true);
  assert.equal(state.freeform.paths.some((path) => path.id === added.id), false);
  assert.deepEqual(stableSignature(), before);
});

test("Shape can snap an open free-form path into a smooth periodic loop", () => {
  const state = freeformState([
    {
      id: "shape-loop",
      closed: false,
      genomicLength: 90,
      points: [
        { x: 260, y: 220 },
        { x: 520, y: 130 },
        { x: 820, y: 300 },
        { x: 540, y: 470 },
        { x: 272, y: 228 },
      ],
    },
  ]);
  state.freeform.snapToStart = true;
  api.normaliseStateSchema(state);
  api.setState(state);
  api.setViewState({ zoom: 1, panX: 0, panY: 0 });

  const path = state.freeform.paths[0];
  const candidate = api.freeformShapeCloseCandidate(path, "end", state, api.getViewState());
  assert.ok(candidate);
  assert.ok(candidate.distance < candidate.radius);
  const previousGenomicLength = path.genomicLength;
  const previousArcLength = api.freeformPathLength(path.points, false);
  assert.equal(api.snapFreeformPathEnds(path, "end", state), true);
  assert.equal(path.closed, true);
  const nextArcLength = api.freeformPathLength(path.points, true);
  assert.ok(
    Math.abs(path.genomicLength - previousGenomicLength * (nextArcLength / previousArcLength)) < 1e-8
  );
  const metric = api.freeformMetricById(path.id, state);
  assert.equal(metric.closed, true);
  const helix = api.freeformHelixParameters(metric, state);
  assert.ok(Math.abs(helix.turns - Math.round(helix.turns)) < 1e-10);
  const curves = api.freeformCenterlineCurves(path).curves;
  const firstTangent = api.cubicFreeformDerivative(curves[0], 0);
  const lastTangent = api.cubicFreeformDerivative(curves.at(-1), 1);
  const tangentDot =
    (firstTangent.x * lastTangent.x + firstTangent.y * lastTangent.y) /
    (Math.hypot(firstTangent.x, firstTangent.y) * Math.hypot(lastTangent.x, lastTangent.y));
  assert.ok(tangentDot > 1 - 1e-10, "the centerline tangent must be continuous at the loop seam");
  assert.match(source, /\["draw", "select"\]\.includes\(freeformEditor\.tool\)/);
  assert.doesNotMatch(html, /id="freeformSnapStartButton"/);
});

test("periodic Free-form loops preserve the full replicated ribbon and close every frame", () => {
  const state = freeformState([
    {
      id: "deformed-periodic-ribbon",
      closed: true,
      genomicLength: 180,
      points: [
        { x: 210, y: 245 },
        { x: 115, y: 160 },
        { x: 105, y: 345 },
        { x: 235, y: 475 },
        { x: 430, y: 455 },
        { x: 535, y: 370 },
        { x: 665, y: 455 },
        { x: 855, y: 420 },
        { x: 925, y: 245 },
        { x: 830, y: 105 },
        { x: 610, y: 90 },
        { x: 485, y: 185 },
        { x: 360, y: 285 },
      ],
    },
  ]);
  state.daughterSpacing = 180;
  state.doubleStrandHeight = 30;
  state.advanced.contour = false;
  state.advanced.crossoverGaps = false;
  let metric = api.freeformMetricById("deformed-periodic-ribbon", state);
  const originPosition = metric.start + metric.span * 0.92;
  state.origins = [{
    id: "periodic-ribbon-origin",
    position: originPosition,
    startPosition: originPosition,
    localPosition: 0.92,
    moleculeId: metric.id,
    leftOffset: 0,
    rightOffset: 0,
  }];
  state.forkTravel = metric.span * 0.2;
  api.normaliseStateSchema(state);
  api.setState(state);
  metric = api.freeformMetricById("deformed-periodic-ribbon", state);

  const broadProfile = api.freeformDeformationFrameProfile(
    metric,
    state,
    api.freeformDeformationEnvelope(state)
  );
  assert.equal(broadProfile.closed, true);
  assert.ok(Math.abs(broadProfile.fullTurn) >= Math.PI * 2 - 1e-8);
  assert.ok(
    Math.abs(
      broadProfile.angles.at(-1) - broadProfile.angles[0] - broadProfile.fullTurn
    ) < 1e-10
  );
  assert.ok(Math.abs(broadProfile.slopes.at(-1) - broadProfile.slopes[0]) < 1e-12);

  const model = api.getFreeformReplicationModelAtTravel(state.forkTravel, state);
  assert.ok(model.regions.length > 0);
  const daughterOffset = api.renderedDaughterHalfSpacing(state);
  const maximumOffset = daughterOffset + api.renderedDoubleStrandHalfHeight(state);
  const fullSections = [];
  const ribbonSamples = [];
  for (let index = 0; index < 1800; index += 1) {
    const fraction = metric.start + (index / 1800) * metric.span;
    const x = api.VIEW.x0 + fraction * api.VIEW.moleculeWidth;
    const center = api.geometryPoint(x, api.VIEW.centerY, state);
    const outer = api.geometryPoint(x, api.VIEW.centerY + maximumOffset, state);
    const inner = api.geometryPoint(x, api.VIEW.centerY - maximumOffset, state);
    ribbonSamples.push({ center, outer, inner });
    assert.ok(
      Math.abs(Math.hypot(outer.x - inner.x, outer.y - inner.y) - maximumOffset * 2) < 1e-6,
      "the periodic deformation preserves the canonical ribbon width"
    );
    if (api.replicationAt(x, model).profile < 1 - 1e-10) continue;

    const upperTemplate = api.freeformStrandGeometryPoint(
      x,
      api.templateY(x, "a", model),
      "a",
      state
    );
    const upperDaughter = api.freeformStrandGeometryPoint(
      x,
      api.nascentY(x, "top", model),
      "top",
      state
    );
    const lowerTemplate = api.freeformStrandGeometryPoint(
      x,
      api.templateY(x, "b", model),
      "b",
      state
    );
    const lowerDaughter = api.freeformStrandGeometryPoint(
      x,
      api.nascentY(x, "bottom", model),
      "bottom",
      state
    );
    const upperMidpoint = {
      x: (upperTemplate.x + upperDaughter.x) / 2,
      y: (upperTemplate.y + upperDaughter.y) / 2,
    };
    const lowerMidpoint = {
      x: (lowerTemplate.x + lowerDaughter.x) / 2,
      y: (lowerTemplate.y + lowerDaughter.y) / 2,
    };
    assert.ok(
      Math.abs(Math.hypot(upperMidpoint.x - center.x, upperMidpoint.y - center.y) - daughterOffset) < 1e-6
    );
    assert.ok(
      Math.abs(Math.hypot(lowerMidpoint.x - center.x, lowerMidpoint.y - center.y) - daughterOffset) < 1e-6
    );
    assert.ok(
      Math.abs(
        Math.hypot(
          lowerMidpoint.x - upperMidpoint.x,
          lowerMidpoint.y - upperMidpoint.y
        ) - daughterOffset * 2
      ) < 1e-6,
      "both periodic daughters remain visibly separated"
    );
    fullSections.push({
      index,
      upperMidpoint,
      lowerMidpoint,
      upperRung: {
        x: upperDaughter.x - upperTemplate.x,
        y: upperDaughter.y - upperTemplate.y,
      },
      lowerRung: {
        x: lowerDaughter.x - lowerTemplate.x,
        y: lowerDaughter.y - lowerTemplate.y,
      },
      upperTemplate,
      upperDaughter,
      lowerTemplate,
      lowerDaughter,
    });
  }
  assert.ok(fullSections.length > 300);
  const periodicIntrinsicScales = fullSections.flatMap((sample) =>
    ["upperTemplate", "upperDaughter", "lowerTemplate", "lowerDaughter"].map((key) =>
      Math.abs(sample[key].intrinsicOffset) > 1
        ? Math.abs(sample[key].renderedIntrinsicOffset / sample[key].intrinsicOffset)
        : 1
    )
  );
  assert.ok(
    Math.min(...periodicIntrinsicScales) > 1 - 1e-10 &&
      Math.max(...periodicIntrinsicScales) < 1 + 1e-10,
    "periodic daughter helices retain their full amplitude"
  );

  ["outer", "inner"].forEach((side) => {
    const speedRatios = ribbonSamples.map((sample, index) => {
      const next = ribbonSamples[(index + 1) % ribbonSamples.length];
      const strandStep = Math.hypot(
        next[side].x - sample[side].x,
        next[side].y - sample[side].y
      );
      const centerStep = Math.hypot(
        next.center.x - sample.center.x,
        next.center.y - sample.center.y
      );
      return strandStep / Math.max(1e-9, centerStep);
    });
    assert.ok(
      Math.min(...speedRatios) > 0.08,
      `the ${side} periodic ribbon cannot stop or reverse at a cusp`
    );
  });

  [
    ["upperMidpoint", "upperRung"],
    ["lowerMidpoint", "lowerRung"],
  ].forEach(([midpointKey, rungKey]) => {
    const perpendicularity = [];
    for (let index = 1; index < fullSections.length - 1; index += 1) {
      const previous = fullSections[index - 1];
      const current = fullSections[index];
      const following = fullSections[index + 1];
      if (previous.index + 1 !== current.index || current.index + 1 !== following.index) continue;
      const tangent = {
        x: following[midpointKey].x - previous[midpointKey].x,
        y: following[midpointKey].y - previous[midpointKey].y,
      };
      const rung = current[rungKey];
      const scale = Math.hypot(tangent.x, tangent.y) * Math.hypot(rung.x, rung.y);
      if (scale <= 1e-9) continue;
      perpendicularity.push({
        value: Math.abs(rung.x * tangent.y - rung.y * tangent.x) / scale,
        sampleIndex: current.index,
      });
    }
    assert.ok(perpendicularity.length > 200);
    const minimum = perpendicularity.reduce(
      (lowest, sample) => sample.value < lowest.value ? sample : lowest
    );
    assert.ok(
      minimum.value > 0.68,
      `periodic replicated cross-sections follow their own daughter baseline (${minimum.value} at ${minimum.sampleIndex})`
    );
  });

  ["upperTemplate", "upperDaughter", "lowerTemplate", "lowerDaughter"].forEach((key) => {
    const vectors = [];
    for (let index = 0; index < fullSections.length - 1; index += 1) {
      const current = fullSections[index];
      const following = fullSections[index + 1];
      if (current.index + 1 !== following.index) {
        vectors.push(null);
        continue;
      }
      vectors.push({
        x: following[key].x - current[key].x,
        y: following[key].y - current[key].y,
      });
    }
    const lengths = vectors.filter(Boolean).map((vector) => Math.hypot(vector.x, vector.y));
    assert.ok(lengths.length > 250);
    assert.ok(Math.min(...lengths) > 0.02, `${key} cannot collapse to a periodic cusp`);
    const alignments = [];
    for (let index = 0; index < vectors.length - 1; index += 1) {
      const first = vectors[index];
      const second = vectors[index + 1];
      if (!first || !second) continue;
      alignments.push({
        value:
          (first.x * second.x + first.y * second.y) /
          Math.max(1e-9, Math.hypot(first.x, first.y) * Math.hypot(second.x, second.y)),
        sampleIndex: fullSections[index + 1]?.index,
        sectionIndex: index + 1,
      });
    }
    const minimumAlignment = alignments.reduce(
      (lowest, sample) => sample.value < lowest.value ? sample : lowest
    );
    assert.ok(
      minimumAlignment.value > 0.45,
      `${key} remains smooth through periodic bends (${minimumAlignment.value} at ${minimumAlignment.sampleIndex}; ` +
        `${JSON.stringify(fullSections.slice(
          Math.max(0, minimumAlignment.sectionIndex - 1),
          minimumAlignment.sectionIndex + 2
        ).map((sample) => ({
          index: sample.index,
          point: sample[key],
        })))})`
    );
  });

  const renderedRegions = api.renderableReplicationRegions(model, state);
  const joinedRegion = renderedRegions.find((region) => region.periodicJoin);
  assert.ok(joinedRegion);
  assert.ok(joinedRegion.end > metric.end + 1e-6);
  const joinedSpan = api.nascentSpan(joinedRegion, model, state);
  const topYForX = (x) =>
    api.schematicNascentPathY(x, "top", joinedRegion, joinedSpan, model, state);
  const joinedPath = api.sampledPath(
    joinedSpan.fromX,
    joinedSpan.toX,
    topYForX,
    3,
    null,
    [],
    [],
    null,
    "top",
    metric.id
  );
  assert.doesNotMatch(joinedPath, /NaN|Infinity/);
  const pathCoordinates = [...joinedPath.matchAll(
    /[-+]?(?:\d*\.?\d+)(?:e[-+]?\d+)?/gi
  )].map((match) => Number(match[0]));
  assert.ok(pathCoordinates.length > 20);
  const renderedEnd = {
    x: pathCoordinates.at(-2),
    y: pathCoordinates.at(-1),
  };
  const unwrappedEndFraction =
    (joinedSpan.toX - api.VIEW.x0) / api.VIEW.moleculeWidth;
  const canonicalEndFraction =
    metric.start +
    api.wrapFraction(
      (unwrappedEndFraction - metric.start) / metric.span
    ) * metric.span;
  const canonicalEndX =
    api.VIEW.x0 + canonicalEndFraction * api.VIEW.moleculeWidth;
  const canonicalEndY = api.nascentY(
    canonicalEndX,
    "top",
    model,
    state,
    metric.id
  );
  const expectedEnd = api.freeformStrandGeometryPointOnMetric(
    metric,
    canonicalEndFraction,
    canonicalEndX,
    canonicalEndY,
    "top",
    state
  );
  assert.ok(
    Math.hypot(renderedEnd.x - expectedEnd.x, renderedEnd.y - expectedEnd.y) < 0.02,
    "the unwrapped daughter path continues around the loop instead of stacking at its linked endpoint"
  );

  const seamX = api.VIEW.x0 + metric.end * api.VIEW.moleculeWidth;
  const seamStep = (metric.span * api.VIEW.moleculeWidth) / 1800;
  ["top", "bottom"].forEach((role) => {
    const points = Array.from({ length: 9 }, (_, index) => {
      const x = seamX + (index - 4) * seamStep;
      const fraction = (x - api.VIEW.x0) / api.VIEW.moleculeWidth;
      const y = api.nascentY(x, role, model, state, metric.id);
      return api.freeformStrandGeometryPointOnMetric(
        metric,
        fraction,
        x,
        y,
        role,
        state
      );
    });
    const vectors = points.slice(1).map((point, index) => ({
      x: point.x - points[index].x,
      y: point.y - points[index].y,
    }));
    assert.ok(
      Math.min(...vectors.map((vector) => Math.hypot(vector.x, vector.y))) > 0.02,
      `${role} cannot collapse at the painted loop seam`
    );
    for (let index = 1; index < vectors.length; index += 1) {
      const previous = vectors[index - 1];
      const next = vectors[index];
      const alignment =
        (previous.x * next.x + previous.y * next.y) /
        Math.max(
          1e-9,
          Math.hypot(previous.x, previous.y) * Math.hypot(next.x, next.y)
        );
      assert.ok(alignment > 0.85, `${role} remains tangent-continuous at the painted loop seam`);
    }
  });

  const seamCoordinates = (role, baseline) => {
    const firstX = api.VIEW.x0;
    const lastX = api.VIEW.x1;
    return [firstX, lastX].map((x) =>
      api.freeformStrandGeometryPoint(
        x,
        api.VIEW.centerY + baseline + api.helixWave(x, role, state),
        role,
        state
      )
    );
  };
  [
    ["a", -daughterOffset],
    ["top", -daughterOffset],
    ["b", daughterOffset],
    ["bottom", daughterOffset],
  ].forEach(([role, baseline]) => {
    const [first, last] = seamCoordinates(role, baseline);
    assert.ok(
      Math.hypot(first.x - last.x, first.y - last.y) < 1e-6,
      `${role} closes continuously at the periodic seam`
    );
  });
});

test("closing a replicating Free-form strand preserves its origin, forks, and daughter DNA", () => {
  const state = freeformState([
    {
      id: "replicating-open-loop",
      closed: false,
      genomicLength: 150,
      points: [
        { x: 265, y: 225 },
        { x: 500, y: 115 },
        { x: 820, y: 270 },
        { x: 705, y: 470 },
        { x: 390, y: 465 },
        { x: 274, y: 232 },
      ],
    },
  ]);
  state.freeform.snapToStart = true;
  let metric = api.freeformMetricById("replicating-open-loop", state);
  const originPosition = metric.start + metric.span * 0.5;
  state.origins = [{
    id: "closing-loop-origin",
    position: originPosition,
    startPosition: originPosition,
    localPosition: 0.5,
    moleculeId: metric.id,
    leftOffset: 0,
    rightOffset: 0,
  }];
  state.forkTravel = metric.span * 0.18;
  api.normaliseStateSchema(state);
  api.setState(state);

  const beforeModel = api.getFreeformReplicationModelAtTravel(state.forkTravel, state);
  const beforeReplication = api.replicatedFraction(beforeModel);
  assert.ok(beforeModel.regions.length > 0);
  assert.equal(api.snapFreeformPathEnds("replicating-open-loop", "end", state), true);

  metric = api.freeformMetricById("replicating-open-loop", state);
  assert.equal(metric.closed, true);
  assert.equal(state.origins.length, 1);
  const afterModel = api.getFreeformReplicationModelAtTravel(state.forkTravel, state);
  const afterOrigin = afterModel.origins.find((origin) => origin.id === "closing-loop-origin");
  assert.ok(afterOrigin);
  assert.ok(afterModel.regions.length > 0);
  assert.ok(afterOrigin.leftActive && afterOrigin.rightActive);
  assert.ok(
    Math.abs(api.replicatedFraction(afterModel) - beforeReplication) < 2,
    "closing the seam preserves the already replicated fraction"
  );

  const x = api.VIEW.x0 + afterOrigin.startPosition * api.VIEW.moleculeWidth;
  const center = api.geometryPoint(x, api.VIEW.centerY, state);
  const template = api.freeformStrandGeometryPoint(
    x,
    api.templateY(x, "a", afterModel),
    "a",
    state
  );
  const daughter = api.freeformStrandGeometryPoint(
    x,
    api.nascentY(x, "top", afterModel),
    "top",
    state
  );
  const midpoint = {
    x: (template.x + daughter.x) / 2,
    y: (template.y + daughter.y) / 2,
  };
  assert.ok(
    Math.abs(
      Math.hypot(midpoint.x - center.x, midpoint.y - center.y) -
        api.renderedDaughterHalfSpacing(state)
    ) < 1e-6,
    "the periodic daughter remains visible after the endpoints are linked"
  );
});

test("Shape endpoint edits preserve genomic density and update the total genome length", () => {
  const state = freeformState([
    {
      id: "shape-density",
      closed: false,
      genomicLength: 120,
      points: [
        { x: 120, y: 280 },
        { x: 470, y: 280 },
        { x: 820, y: 280 },
      ],
    },
  ]);
  api.setState(state);
  const capture = api.captureFreeformLengthDensity(state);
  const original = capture.paths[0];
  const originalDensity = original.genomicLength / original.arcLength;
  const originalPoints = state.freeform.paths[0].points.map((point) => ({ ...point }));

  assert.equal(
    api.reshapeFreeformNeighborhood(
      "shape-density",
      1,
      { x: 210, y: 180 },
      {
        sourceState: state,
        originalPoints,
        controlPositions: [0, 0.5, 1],
        influenceFraction: 0.3,
      }
    ),
    true
  );
  const nextArcLength = api.freeformMetricById("shape-density", state).length;
  assert.ok(Math.abs(nextArcLength - original.arcLength) > 1);
  assert.ok(api.updateFreeformPathLengthFromDensity("shape-density", capture, state));

  const path = state.freeform.paths[0];
  assert.ok(Math.abs(path.genomicLength / nextArcLength - originalDensity) < 1e-10);
  assert.ok(Math.abs(state.length - path.genomicLength) < 1e-10);
  assert.match(source, /lengthDensityCapture:\s*captureFreeformLengthDensity\(state\)/);
  assert.match(
    source,
    /updateFreeformPathLengthFromDensity\(\s*completedDrag\.pathId,\s*completedDrag\.lengthDensityCapture,\s*state\s*\)/
  );
});

test("connected free-form endpoints align both Standard-model strands without changing their frequency", () => {
  const state = freeformState([
    {
      id: "phase-left",
      closed: false,
      genomicLength: 37,
      points: [
        { x: 120, y: 260 },
        { x: 460, y: 260 },
      ],
    },
    {
      id: "phase-right",
      closed: false,
      genomicLength: 53,
      points: [
        { x: 460, y: 260 },
        { x: 920, y: 260 },
      ],
    },
  ]);
  state.advanced.strandModel = "standard";
  state.advanced.strandPhaseShift = 0;
  api.setState(state);

  const left = api.freeformMetricById("phase-left", state);
  const right = api.freeformMetricById("phase-right", state);
  const leftHelix = api.freeformHelixParameters(left, state);
  const rightHelix = api.freeformHelixParameters(right, state);
  const halfHeight = api.renderedDoubleStrandHalfHeight(state);
  const strandPoint = (metric, helix, local, partner = false) => {
    const center = api.freeformPointAtFraction(
      metric.start + local * metric.span,
      state,
      metric.id
    );
    const phase = (helix.phaseOffset + local * helix.turns) * Math.PI * 2 +
      (partner ? Math.PI : 0);
    const offset = Math.cos(phase) * halfHeight;
    return {
      x: center.x + center.normalX * offset,
      y: center.y + center.normalY * offset,
    };
  };

  for (const partner of [false, true]) {
    const first = strandPoint(left, leftHelix, 1, partner);
    const second = strandPoint(right, rightHelix, 0, partner);
    assert.ok(
      Math.hypot(first.x - second.x, first.y - second.y) < 1e-8,
      "each coloured strand must meet its continuation at the shared endpoint"
    );
  }
  assert.equal(leftHelix.adjustedTurns, false, "a singly connected path keeps its native frequency");
  assert.equal(rightHelix.adjustedTurns, false, "a singly connected path keeps its native frequency");
});

test("a free-form bridge matches both strand phases at both connected ends", () => {
  const state = freeformState([
    {
      id: "bridge-left",
      closed: false,
      genomicLength: 37,
      points: [
        { x: 100, y: 260 },
        { x: 360, y: 260 },
      ],
    },
    {
      id: "bridge-right",
      closed: false,
      genomicLength: 51,
      points: [
        { x: 760, y: 260 },
        { x: 1040, y: 260 },
      ],
    },
    {
      id: "phase-bridge",
      closed: false,
      genomicLength: 44,
      points: [
        { x: 360, y: 260 },
        { x: 560, y: 260 },
        { x: 760, y: 260 },
      ],
    },
  ]);
  state.advanced.strandPhaseShift = 0;
  api.setState(state);
  const metrics = new Map(api.freeformPathMetrics(state).map((metric) => [metric.id, metric]));
  const phaseAt = (id, local) => {
    const helix = api.freeformHelixParameters(metrics.get(id), state);
    return api.wrapFraction(helix.phaseOffset + local * helix.turns);
  };

  assert.ok(
    Math.abs(api.clockwiseFractionDistance(phaseAt("bridge-left", 1), phaseAt("phase-bridge", 0))) < 1e-10
  );
  assert.ok(
    Math.abs(api.clockwiseFractionDistance(phaseAt("phase-bridge", 1), phaseAt("bridge-right", 0))) < 1e-10
  );
  const bridgeHelix = api.freeformHelixParameters(metrics.get("phase-bridge"), state);
  assert.equal(bridgeHelix.adjustedTurns, false);
  assert.ok(Math.abs(bridgeHelix.turns - bridgeHelix.rawTurns) < 1e-12);
});

test("connected base-pair sampling leaves joins between lattice sites", () => {
  const state = freeformState([
    {
      id: "lattice-left",
      closed: false,
      genomicLength: 41,
      points: [
        { x: 100, y: 260 },
        { x: 480, y: 260 },
      ],
    },
    {
      id: "lattice-right",
      closed: false,
      genomicLength: 57,
      points: [
        { x: 480, y: 260 },
        { x: 980, y: 260 },
      ],
    },
  ]);
  state.pairResolution = 3;
  api.setState(state);
  const sites = api.freeformBasePairSites(state);
  const leftSites = sites.filter((site) => site.pathId === "lattice-left");
  const rightSites = sites.filter((site) => site.pathId === "lattice-right");
  assert.ok(leftSites.every((site) => site.localFraction < 1 - 1e-10));
  assert.ok(rightSites.every((site) => site.localFraction > 1e-10));
});

test("same-end free-form connections compensate for their reversed path normals", () => {
  const state = freeformState([
    {
      id: "same-end-left",
      closed: false,
      genomicLength: 37,
      points: [
        { x: 120, y: 300 },
        { x: 500, y: 300 },
      ],
    },
    {
      id: "same-end-right",
      closed: false,
      genomicLength: 43,
      points: [
        { x: 900, y: 300 },
        { x: 500, y: 300 },
      ],
    },
  ]);
  state.advanced.strandPhaseShift = 1.5;
  api.setState(state);
  const first = api.freeformMetricById("same-end-left", state);
  const second = api.freeformMetricById("same-end-right", state);
  const firstHelix = api.freeformHelixParameters(first, state);
  const secondHelix = api.freeformHelixParameters(second, state);
  const firstPhase = api.wrapFraction(firstHelix.phaseOffset + firstHelix.turns);
  const secondPhase = api.wrapFraction(secondHelix.phaseOffset + secondHelix.turns);
  assert.ok(
    Math.abs(api.clockwiseFractionDistance(secondPhase, api.wrapFraction(0.5 - firstPhase))) < 1e-10
  );

  const halfHeight = api.renderedDoubleStrandHalfHeight(state);
  const endpoint = (metric, helix, phase, partner) => {
    const center = api.freeformPointAtFraction(metric.end, state, metric.id);
    const partnerPhase = partner
      ? helix.orientation * state.advanced.strandPhaseShift / (2 * (state.pairResolution + 1))
      : 0;
    const offset = Math.cos(
      (phase + partnerPhase) * Math.PI * 2 + (partner ? Math.PI : 0)
    ) * halfHeight;
    return { x: center.x + center.normalX * offset, y: center.y + center.normalY * offset };
  };
  for (const partner of [false, true]) {
    const firstPoint = endpoint(first, firstHelix, firstPhase, partner);
    const secondPoint = endpoint(second, secondHelix, secondPhase, partner);
    assert.ok(Math.hypot(firstPoint.x - secondPoint.x, firstPoint.y - secondPoint.y) < 1e-8);
  }
});

test("painted free-form strokes can snap back to their own start and become periodic loops", () => {
  const state = freeformState([]);
  state.freeform.snapToStart = true;
  api.normaliseStateSchema(state);
  api.setState(state);
  api.setViewState({ zoom: 1, panX: 0, panY: 0 });
  const loopStroke = [
    { x: 280, y: 220 },
    { x: 560, y: 160 },
    { x: 820, y: 320 },
    { x: 560, y: 480 },
    { x: 286, y: 226 },
  ];
  const candidate = api.freeformDraftCloseCandidate(loopStroke, state, api.getViewState());
  assert.ok(candidate);
  assert.ok(candidate.distance < candidate.radius);
  const loop = api.addFreeformPath(loopStroke, state, { closed: true });
  assert.ok(loop);
  assert.equal(loop.closed, true);
  const loopMetric = api.freeformMetricById(loop.id, state);
  assert.equal(loopMetric.closed, true);
  const loopCurves = api.freeformCenterlineCurves(loopMetric.path).curves;
  const firstTangent = api.cubicFreeformDerivative(loopCurves[0], 0);
  const lastTangent = api.cubicFreeformDerivative(loopCurves.at(-1), 1);
  const seamAlignment =
    (firstTangent.x * lastTangent.x + firstTangent.y * lastTangent.y) /
    Math.max(
      1e-9,
      Math.hypot(firstTangent.x, firstTangent.y) * Math.hypot(lastTangent.x, lastTangent.y)
    );
  assert.ok(seamAlignment > 1 - 1e-10, "painted loop endpoints share one spline tangent");

  api.setState(state);
  const documentState = api.configurationDocument();
  assert.equal(documentState.state.freeform.snapToStart, true);
  const loaded = api.parseConfigurationText(JSON.stringify(documentState));
  assert.equal(loaded.freeform.snapToStart, true);
  assert.equal(loaded.freeform.paths[0].closed, true);

  loaded.freeform.snapToStart = false;
  assert.ok(
    api.freeformDraftCloseCandidate(loopStroke, loaded, api.getViewState()),
    "loop closing remains automatic after the obsolete toggle is removed"
  );
});

test("free-form fork rendering and manual movement never open unrelated DNA components", () => {
  const state = freeformState([
    {
      id: "replicating-piece",
      closed: false,
      points: [
        { x: 120, y: 210 },
        { x: 500, y: 210 },
      ],
    },
    {
      id: "quiet-piece",
      closed: false,
      points: [
        { x: 650, y: 430 },
        { x: 1080, y: 430 },
      ],
    },
  ]);
  const firstMetric = api.freeformMetricById("replicating-piece", state);
  const firstPosition = firstMetric.start + firstMetric.span * 0.5;
  state.origins = [
    {
      id: "component-origin",
      position: firstPosition,
      startPosition: firstPosition,
      localPosition: 0.5,
      moleculeId: "replicating-piece",
      leftOffset: 0,
      rightOffset: 0,
    },
  ];
  state.forkTravel = firstMetric.span * 0.12;
  api.normaliseStateSchema(state);
  api.setState(state);

  let model = api.getFreeformReplicationModelAtTravel(state.forkTravel, state);
  const quietMetric = api.freeformMetricById("quiet-piece", state);
  const quietFraction = quietMetric.start + quietMetric.span * 0.5;
  const quietX = api.VIEW.x0 + quietFraction * api.VIEW.moleculeWidth;
  const activeX = api.VIEW.x0 + firstPosition * api.VIEW.moleculeWidth;
  assert.ok(api.visualReplicationAt(activeX, model).profile > 0);
  assert.equal(api.replicationRegionsAtPosition(quietFraction, model, state).length, 0);
  assert.equal(api.visualReplicationAt(quietX, model).profile, 0);
  assert.equal(api.visualReplicationAt(quietX, model).amount, 0);

  const geometry = model.origins.find((origin) => origin.id === "component-origin");
  const drag = {
    role: "fork",
    side: "right",
    originId: "component-origin",
    pairedForks: geometry.leftActive && geometry.rightActive,
    mirroredForks: false,
    componentId: "replicating-piece",
    componentClosed: false,
    originStartPosition: geometry.startPosition,
    leftPosition: geometry.leftPosition,
    rightPosition: geometry.rightPosition,
  };
  const target = firstMetric.start + firstMetric.span * 0.86;
  assert.ok(api.applyForkDragPosition(drag, target, state));
  model = api.getFreeformReplicationModelAtTravel(state.forkTravel, state);
  assert.equal(api.visualReplicationAt(quietX, model).profile, 0);
  assert.ok(model.regions.every((region) => region.componentId === "replicating-piece"));
});

test("a fork dragged from a new free-form origin keeps the opposite edge fixed and recentres its control", () => {
  const state = freeformState([
    {
      id: "single-painted-piece",
      closed: false,
      genomicLength: 180,
      points: [
        { x: 100, y: 260 },
        { x: 500, y: 180 },
        { x: 900, y: 360 },
      ],
    },
  ]);
  const metric = api.freeformMetricById("single-painted-piece", state);
  const localOrigin = 0.46;
  const originPosition = metric.start + metric.span * localOrigin;
  state.forkTravel = metric.span * 0.31;
  state.origins = [
    {
      id: "fresh-freeform-origin",
      position: originPosition,
      startPosition: originPosition,
      localPosition: localOrigin,
      moleculeId: metric.id,
      leftOffset: -state.forkTravel,
      rightOffset: -state.forkTravel,
    },
  ];
  api.setState(state);

  let geometry = api.getFreeformReplicationModelAtTravel(state.forkTravel, state).origins[0];
  assert.ok(Math.abs(geometry.leftPosition - originPosition) < 1e-10);
  assert.ok(Math.abs(geometry.rightPosition - originPosition) < 1e-10);
  const target = metric.start + metric.span * 0.7;
  const drag = {
    role: "fork",
    side: "right",
    originId: "fresh-freeform-origin",
    pairedForks: true,
    mirroredForks: false,
    componentId: metric.id,
    componentClosed: false,
    originStartPosition: originPosition,
    leftPosition: geometry.leftPosition,
    rightPosition: geometry.rightPosition,
    terminalClosureBoundary: null,
    terminalReplicatedBoundary: null,
  };
  assert.ok(api.applyForkDragPosition(drag, target, state));

  geometry = api.getFreeformReplicationModelAtTravel(state.forkTravel, state).origins[0];
  const expectedControlPosition = (originPosition + target) / 2;
  const expectedLocalPosition = (expectedControlPosition - metric.start) / metric.span;
  assert.ok(Math.abs(state.origins[0].startPosition - expectedControlPosition) < 1e-10);
  assert.ok(Math.abs(state.origins[0].localPosition - expectedLocalPosition) < 1e-10);
  assert.ok(Math.abs(state.origins[0].leftOffset - state.origins[0].rightOffset) < 1e-10);
  assert.ok(Math.abs(geometry.leftPosition - originPosition) < 1e-10);
  assert.ok(Math.abs(geometry.rightPosition - target) < 1e-10);
});

test("reset restores molecule defaults while preserving geometry, style, and application settings", () => {
  const changed = api.makeDefaultState();
  Object.assign(changed, {
    geometry: "freeform",
    length: 137,
    progress: 64,
    pairResolution: 9,
    basePairWidth: 11,
    weight: 13,
    doubleStrandHeight: 82,
    daughterSpacing: 244,
    speed: 3.25,
    discreteAnimation: true,
  });
  changed.colors = { ...changed.colors, templateA: "#ff00aa", newDna: "#00ffaa" };
  changed.layers = { pairs: false, newDna: false, labels: false };
  changed.advanced = {
    ...changed.advanced,
    strandModel: "minimal",
    grid: false,
    scaleBar: false,
    aspectX: 1.8,
    aspectY: 0.55,
    backgroundColor: "#112233",
  };
  changed.freeform = {
    paths: [{ id: "painted-reset", closed: true, points: [
      { x: 200, y: 200 },
      { x: 320, y: 200 },
      { x: 260, y: 300 },
    ] }],
    selectedPathId: "painted-reset",
    snapToStart: true,
    workspace: api.defaultFreeformWorkspace(),
  };
  api.normaliseStateSchema(changed);
  api.setState(changed);
  api.setViewState({ zoom: 2.4, panX: 91, panY: -47 });
  api.setFreeformEditor({
    tool: "erase",
    selectedPathId: "painted-reset",
    eraserRadius: 72,
    draftPoints: [{ x: 1, y: 2 }],
    eraserPoints: [{ x: 3, y: 4 }],
  });

  api.setAppSettings({
    frameRate: 30,
    videoWidth: 1920,
    videoQuality: "maximum",
    previewDetail: "fast",
    pauseWhenHidden: false,
    rememberProject: false,
  });
  api.setThemeMode("dark");
  const preservedSettings = api.getAppSettings();
  const expected = api.makeDefaultState();
  expected.advanced.strandModel = "minimal";
  api.switchGeometryWorkspace("freeform", expected);
  const expectedView = api.fittedViewState(expected);

  api.resetMoleculeState();

  assert.deepEqual(
    JSON.parse(JSON.stringify(api.getState())),
    JSON.parse(JSON.stringify(expected))
  );
  assert.deepEqual(api.getViewState(), expectedView);
  assert.equal(api.getFreeformEditor().tool, "draw");
  assert.equal(api.getFreeformEditor().eraserRadius, 30);
  assert.equal(api.getFreeformEditor().draftPoints.length, 0);
  assert.equal(api.getFreeformEditor().eraserPoints.length, 0);
  assert.deepEqual(api.getAppSettings(), preservedSettings);
  assert.equal(api.getThemeMode(), "dark");
});

test("free-form trash clears every painted strand and its replication state", () => {
  const state = freeformState(
    [
      {
        id: "trash-one",
        closed: false,
        points: [{ x: 180, y: 250 }, { x: 520, y: 250 }],
      },
      {
        id: "trash-two",
        closed: false,
        points: [{ x: 680, y: 410 }, { x: 1040, y: 410 }],
      },
    ],
    [
      {
        id: "trash-origin-one",
        position: 0.25,
        startPosition: 0.25,
        localPosition: 0.5,
        moleculeId: "trash-one",
        leftOffset: 0.04,
        rightOffset: 0.07,
      },
      {
        id: "trash-origin-two",
        position: 0.75,
        startPosition: 0.75,
        localPosition: 0.5,
        moleculeId: "trash-two",
        leftOffset: 0.02,
        rightOffset: 0.03,
      },
    ]
  );
  state.cuts = [{ start: 0.1, end: 0.2, componentId: "trash-one" }];
  state.progress = 58;
  state.forkTravel = 0.22;
  state.advanced.strandModel = "elegant";
  state.colors.templateA = "#123456";
  const structuredWorkspace = JSON.parse(JSON.stringify(state.structuredWorkspace));

  assert.equal(api.clearFreeformCanvasState(state), true);
  assert.equal(state.geometry, "freeform");
  assert.equal(state.advanced.strandModel, "elegant");
  assert.equal(state.colors.templateA, "#123456");
  assert.equal(state.freeform.paths.length, 0);
  assert.equal(state.freeform.selectedPathId, null);
  assert.equal(state.origins.length, 0);
  assert.equal(state.cuts.length, 0);
  assert.equal(state.progress, 0);
  assert.equal(state.forkTravel, 0);
  assert.equal(state.selectedOriginId, null);
  assert.equal(state.selectedFork, null);
  assert.deepEqual(
    JSON.parse(JSON.stringify(state.structuredWorkspace)),
    structuredWorkspace
  );
});

test("free-form erasing splits DNA while retaining controls on every surviving piece", () => {
  const state = freeformState(
    [
      {
        id: "long-piece",
        closed: false,
        points: [
          { x: 180, y: 310 },
          { x: 1020, y: 310 },
        ],
      },
    ],
    [
      {
        id: "left-origin",
        position: 0.25,
        startPosition: 0.25,
        localPosition: 0.25,
        moleculeId: "long-piece",
        leftOffset: 0,
        rightOffset: 0,
      },
      {
        id: "erased-origin",
        position: 0.5,
        startPosition: 0.5,
        localPosition: 0.5,
        moleculeId: "long-piece",
        leftOffset: 0,
        rightOffset: 0,
      },
      {
        id: "right-origin",
        position: 0.75,
        startPosition: 0.75,
        localPosition: 0.75,
        moleculeId: "long-piece",
        leftOffset: 0,
        rightOffset: 0,
      },
    ]
  );
  state.cuts = [{ start: 0.72, end: 0.78, componentId: "long-piece" }];
  state.forkTravel = 0.04;
  api.setState(state);
  const result = api.eraseFreeformPaths(
    [
      { x: 600, y: 240 },
      { x: 600, y: 380 },
    ],
    24,
    state
  );
  assert.equal(result.changed, true);
  assert.equal(result.removedOrigins, 1);
  assert.equal(state.freeform.paths.length, 2);
  assert.deepEqual(
    Array.from(state.origins, (origin) => origin.id).sort(),
    ["left-origin", "right-origin"]
  );
  assert.equal(new Set(state.origins.map((origin) => origin.moleculeId)).size, 2);
  assert.equal(state.cuts.length, 1);
  assert.ok(state.freeform.paths.some((path) => path.id === state.cuts[0].componentId));
  const model = api.getFreeformReplicationModelAtTravel(state.forkTravel, state);
  assert.equal(model.origins.length, 2);
  assert.equal(model.activeForkCount, 4, "both surviving origins keep independently draggable forks");
  const metrics = new Map(api.freeformPathMetrics(state).map((metric) => [metric.id, metric]));
  model.regions.forEach((region) => {
    const metric = metrics.get(region.componentId);
    assert.ok(metric);
    assert.ok(region.start >= metric.start - 1e-10 && region.end <= metric.end + 1e-10);
  });
});

test("joining free-form pieces preserves origins, fork state, and component-specific cuts", () => {
  const state = freeformState(
    [
      {
        id: "joined-left",
        closed: false,
        points: [
          { x: 120, y: 260 },
          { x: 480, y: 260 },
        ],
      },
      {
        id: "joined-right",
        closed: false,
        points: [
          { x: 520, y: 260 },
          { x: 1040, y: 360 },
        ],
      },
    ],
    [
      {
        id: "left-control",
        position: 0,
        startPosition: 0,
        localPosition: 0.45,
        moleculeId: "joined-left",
        leftOffset: 0,
        rightOffset: 0,
      },
      {
        id: "right-control",
        position: 0,
        startPosition: 0,
        localPosition: 0.55,
        moleculeId: "joined-right",
        leftOffset: 0,
        rightOffset: 0,
      },
    ]
  );
  state.forkTravel = 0.025;
  const metricsBefore = api.freeformPathMetrics(state);
  state.cuts = metricsBefore.map((metric) => ({
    start: metric.start + metric.span * 0.2,
    end: metric.start + metric.span * 0.3,
    componentId: metric.id,
  }));
  api.setState(state);
  assert.equal(
    api.joinFreeformEndpoints(
      { pathId: "joined-left", end: "end" },
      { pathId: "joined-right", end: "start" },
      state
    ),
    true
  );
  assert.equal(state.freeform.paths.length, 1);
  assert.equal(state.origins.length, 2);
  assert.ok(state.origins.every((origin) => origin.moleculeId === "joined-left"));
  assert.equal(state.cuts.length, 2);
  assert.ok(state.cuts.every((cut) => cut.componentId === "joined-left"));
  const model = api.getFreeformReplicationModelAtTravel(state.forkTravel, state);
  assert.equal(model.origins.length, 2);
  assert.equal(model.activeForkCount, 4);
  assert.ok(model.regions.every((region) => region.componentId === "joined-left"));
  assert.doesNotMatch(api.artworkMarkup(model), /NaN|Infinity/);
});

test("joining replicated and unreplicated ends preserves an active fork at the junction", () => {
  const state = freeformState(
    [
      {
        id: "replicated-side",
        closed: false,
        genomicLength: 40,
        points: [
          { x: 100, y: 300 },
          { x: 500, y: 300 },
        ],
      },
      {
        id: "unreplicated-side",
        closed: false,
        genomicLength: 40,
        points: [
          { x: 500, y: 300 },
          { x: 900, y: 300 },
        ],
      },
    ],
    [
      {
        id: "junction-origin",
        position: 0,
        startPosition: 0,
        localPosition: 0.5,
        moleculeId: "replicated-side",
        leftOffset: 0,
        rightOffset: 0,
      },
    ]
  );
  api.setState(state);
  const leftMetric = api.freeformMetricById("replicated-side", state);
  state.forkTravel = leftMetric.span * 0.5;
  const before = api.getFreeformReplicationModelAtTravel(state.forkTravel, state).origins[0];
  assert.equal(before.rightActive, false);
  assert.equal(before.rightReason, "end");
  assert.ok(Math.abs(before.rightPosition - leftMetric.end) < 1e-10);

  assert.equal(
    api.joinFreeformEndpoints(
      { pathId: "replicated-side", end: "end" },
      { pathId: "unreplicated-side", end: "start" },
      state
    ),
    true
  );
  assert.equal(state.freeform.paths.length, 1);
  assert.equal(state.origins[0].moleculeId, "replicated-side");
  const joinedMetric = api.freeformMetricById("replicated-side", state);
  const junction = joinedMetric.start + joinedMetric.span * 0.5;
  const joined = api.getFreeformReplicationModelAtTravel(state.forkTravel, state);
  const fork = joined.origins.find((origin) => origin.id === "junction-origin");
  assert.ok(Math.abs(fork.rightPosition - junction) < 0.002);
  assert.equal(fork.rightActive, true, "the former terminal fork is live at the new internal junction");
  assert.ok(joined.regions.every((region) => region.end <= junction + 0.002));

  const advanced = api.getFreeformReplicationModelAtTravel(state.forkTravel + 0.04, state);
  const advancedFork = advanced.origins.find((origin) => origin.id === "junction-origin");
  assert.ok(advancedFork.rightPosition > junction + 0.02, "the fork continues into the joined strand");
});

test("joining a reversed component preserves dormant fork delays and selected-side identity", () => {
  const state = freeformState(
    [
      {
        id: "forward-piece",
        closed: false,
        genomicLength: 35,
        points: [
          { x: 100, y: 260 },
          { x: 400, y: 260 },
        ],
      },
      {
        id: "reversed-piece",
        closed: false,
        genomicLength: 35,
        points: [
          { x: 760, y: 260 },
          { x: 400, y: 260 },
        ],
      },
    ],
    [
      {
        id: "delayed-origin",
        position: 0,
        startPosition: 0,
        localPosition: 0.5,
        moleculeId: "reversed-piece",
        leftOffset: -0.3,
        rightOffset: -0.15,
      },
    ]
  );
  state.forkTravel = 0.1;
  state.selectedFork = { originId: "delayed-origin", side: "left" };
  api.setState(state);

  assert.equal(
    api.joinFreeformEndpoints(
      { pathId: "forward-piece", end: "end" },
      { pathId: "reversed-piece", end: "end" },
      state
    ),
    true
  );
  const origin = state.origins.find((candidate) => candidate.id === "delayed-origin");
  assert.ok(Math.abs(origin.leftOffset - -0.15) < 1e-10);
  assert.ok(Math.abs(origin.rightOffset - -0.3) < 1e-10);
  assert.equal(state.selectedFork.side, "right");
  const dormant = api.getFreeformReplicationModelAtTravel(0.1, state).origins[0];
  assert.ok(Math.abs(dormant.leftPosition - dormant.startPosition) < 1e-10);
  assert.ok(Math.abs(dormant.rightPosition - dormant.startPosition) < 1e-10);
  const leftStarted = api.getFreeformReplicationModelAtTravel(0.16, state).origins[0];
  assert.ok(leftStarted.leftPosition < leftStarted.startPosition);
  assert.ok(Math.abs(leftStarted.rightPosition - leftStarted.startPosition) < 1e-10);
});

test("free-form endpoints can join separate pieces and close into a periodic loop", () => {
  const state = freeformState([
    {
      id: "first",
      closed: false,
      points: [
        { x: 180, y: 280 },
        { x: 480, y: 280 },
      ],
    },
    {
      id: "second",
      closed: false,
      points: [
        { x: 520, y: 280 },
        { x: 840, y: 390 },
        { x: 220, y: 420 },
      ],
    },
  ]);
  api.setState(state);
  assert.equal(
    api.joinFreeformEndpoints(
      { pathId: "first", end: "end" },
      { pathId: "second", end: "start" },
      state
    ),
    true
  );
  assert.equal(state.freeform.paths.length, 1);
  const joinedId = state.freeform.paths[0].id;
  assert.equal(
    api.joinFreeformEndpoints(
      { pathId: joinedId, end: "start" },
      { pathId: joinedId, end: "end" },
      state
    ),
    true
  );
  assert.equal(state.freeform.paths[0].closed, true);
  const metric = api.freeformMetricById(joinedId, state);
  assert.equal(metric.closed, true);
});

test("free-form cuts follow components and split periodic seam selections canonically", () => {
  const state = freeformState([
    {
      id: "loop",
      closed: true,
      points: [
        { x: 220, y: 170 },
        { x: 520, y: 170 },
        { x: 520, y: 450 },
        { x: 220, y: 450 },
      ],
    },
    {
      id: "line",
      closed: false,
      points: [
        { x: 700, y: 300 },
        { x: 1040, y: 300 },
      ],
    },
  ]);
  api.setState(state);
  const metric = api.freeformMetricById("loop", state);
  const start = metric.start + metric.span * 0.95;
  const end = metric.start + metric.span * 1.05;
  const plan = api.cutRangesForGesture(start, end, state, "loop");
  assert.equal(plan.componentClosed, true);
  assert.equal(plan.ranges.length, 2);
  assert.ok(plan.ranges.every((range) => range.componentId === "loop"));
  assert.ok(plan.ranges.every((range) => range.start >= metric.start - 1e-10));
  assert.ok(plan.ranges.every((range) => range.end <= metric.end + 1e-10));
  const guide = api.freeformRangeGuide(plan.range, {
    color: "#b8384b",
    pathId: "loop",
  });
  assert.match(guide, /<path/);
  assert.doesNotMatch(guide, /NaN|Infinity/);
});

test("free-form geometry persists paths, component cuts, and an explicitly blank canvas", () => {
  const state = freeformState(
    [
      {
        id: "saved-loop",
        closed: true,
        points: [
          { x: 300, y: 180 },
          { x: 700, y: 180 },
          { x: 700, y: 430 },
          { x: 300, y: 430 },
        ],
      },
    ],
    [
      {
        id: "saved-origin",
        position: 0.3,
        startPosition: 0.3,
        localPosition: 0.3,
        moleculeId: "saved-loop",
        leftOffset: 0,
        rightOffset: 0,
      },
    ]
  );
  state.cuts = [{ start: 0.1, end: 0.2, componentId: "saved-loop" }];
  api.setState(state);
  const loaded = api.parseConfigurationText(JSON.stringify(api.configurationDocument()));
  assert.equal(loaded.geometry, "freeform");
  assert.equal(loaded.freeform.paths[0].closed, true);
  assert.deepEqual(
    JSON.parse(JSON.stringify(loaded.freeform.paths[0].points)),
    JSON.parse(JSON.stringify(state.freeform.paths[0].points))
  );
  assert.equal(loaded.origins[0].moleculeId, "saved-loop");
  assert.equal(loaded.cuts[0].componentId, "saved-loop");

  const blank = freeformState([]);
  blank.origins = [];
  blank.cuts = [];
  api.normaliseStateSchema(blank);
  assert.equal(blank.freeform.paths.length, 0);
  api.setState(blank);
  const restoredBlank = api.parseConfigurationText(JSON.stringify(api.configurationDocument()));
  assert.equal(restoredBlank.freeform.paths.length, 0);
  assert.equal(restoredBlank.origins.length, 0);
});

test("the free-form canvas exposes an accessible bottom-left drawing palette and finite ruler/export bounds", () => {
  assert.match(html, /<option value="freeform">Free form<\/option>/);
  assert.match(html, /id="freeformTools"[^>]*aria-label="Free-form DNA tools"[^>]*hidden/);
  for (const id of [
    "freeformEditButton",
    "freeformSelectButton",
    "freeformDrawButton",
    "freeformEraseButton",
    "freeformEraserSize",
    "freeformEraserSizeControl",
    "freeformEraserSizeOutput",
    "freeformDeletePathButton",
  ]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  for (const removedId of [
    "freeformCloseButton",
    "freeformSnapStartButton",
    "freeformDrawOptions",
    "freeformPieceCount",
  ]) {
    assert.doesNotMatch(html, new RegExp(`id="${removedId}"`));
  }
  assert.doesNotMatch(
    source,
    /toggleSelectedFreeformClosure|freeformCloseButton|freeformSnapStartButton|freeformPieceCount/
  );
  assert.doesNotMatch(html, /id="freeformJoinButton"/);
  assert.match(
    html,
    /class="rs-freeform-tool-group rs-freeform-primary-tools"[^>]*aria-orientation="vertical"/
  );
  assert.match(css, /\.rs-freeform-tools\s*\{[^}]*bottom:\s*12px;[^}]*left:\s*12px/s);
  assert.match(css, /\.rs-freeform-primary-tools\s*\{[^}]*flex-direction:\s*column/s);
  assert.match(
    html,
    /id="freeformDrawButton"[\s\S]*id="freeformEditButton"[\s\S]*id="freeformSelectButton"[\s\S]*id="freeformEraseButton"[\s\S]*id="freeformDeletePathButton"/
  );
  assert.match(source, /elements\.freeformDrawButton, "draw"/);
  assert.match(source, /eraseFreeformPaths\(stroke, freeformEraserRadius\(\), state\)/);
  assert.match(
    html,
    /id="freeformDeletePathButton"[^>]*title="Delete all painted DNA"[^>]*aria-label="Delete all painted DNA"/
  );
  assert.match(
    source,
    /freeformDeletePathButton\?\.addEventListener\("click", deleteAllFreeformPaths\)/
  );

  const state = freeformState(
    [
      {
        id: "export-curve",
        closed: false,
        points: [
          { x: 120, y: 320 },
          { x: 400, y: 160 },
          { x: 760, y: 430 },
          { x: 1080, y: 260 },
        ],
      },
    ],
    [
      {
        id: "export-origin",
        position: 0.4,
        startPosition: 0.4,
        localPosition: 0.4,
        moleculeId: "export-curve",
        leftOffset: 0,
        rightOffset: 0,
      },
    ]
  );
  api.setState(state);
  api.setViewState({ zoom: 1, panX: 0, panY: 0 });
  const ruler = api.renderFreeformRuler(state);
  assert.match(ruler, /data-rs-freeform-ruler-title="bottom"/);
  assert.match(ruler, /Genomic position \(bp\)/);
  assert.doesNotMatch(ruler, /NaN|Infinity/);
  const bounds = api.freeformArtworkBounds(state, 20);
  assert.ok([bounds.left, bounds.right, bounds.top, bounds.bottom, bounds.width, bounds.height].every(Number.isFinite));
  const video = api.fixedVideoSvgSource(state, state.forkTravel);
  assert.ok(video.width > 0 && video.height > 0);
  assert.doesNotMatch(video.source, /NaN|Infinity/);
});

test("the adjustable eraser paints the exact footprint that will be removed", () => {
  assert.match(
    html,
    /id="freeformEraserSize"[^>]*for="freeformEraserSizeControl"[^>]*hidden[\s\S]*?id="freeformEraserSizeControl"[^>]*min="6"[^>]*max="64"/
  );
  assert.match(css, /\.rs-freeform-eraser-mark\s*\{[^}]*stroke:/s);
  assert.match(css, /\.rs-freeform-eraser-dot\s*\{[^}]*fill:/s);
  assert.equal(api.freeformEraserRadius(1), 6);
  assert.equal(api.freeformEraserRadius(100), 64);

  const state = freeformState([
    {
      id: "eraser-preview",
      closed: false,
      points: [
        { x: 160, y: 300 },
        { x: 1040, y: 300 },
      ],
    },
  ]);
  api.setState(state);
  api.setFreeformEditor({
    tool: "erase",
    eraserRadius: 27,
    eraserPoints: [
      { x: 500, y: 250 },
      { x: 500, y: 350 },
    ],
    hoverPoint: { x: 500, y: 350 },
  });
  const strokeOverlay = api.renderFreeformEditorOverlay();
  assert.match(strokeOverlay, /class="rs-freeform-eraser-mark"[^>]*stroke-width="54\.0"/);
  assert.match(strokeOverlay, /class="rs-freeform-eraser-stroke"/);
  assert.match(strokeOverlay, /class="rs-freeform-eraser-ring"[^>]*r="27\.0"/);

  api.setFreeformEditor({ eraserPoints: [{ x: 520, y: 300 }] });
  const dotOverlay = api.renderFreeformEditorOverlay();
  assert.match(
    dotOverlay,
    /class="rs-freeform-eraser-mark rs-freeform-eraser-dot"[^>]*r="27\.0"/
  );
  assert.match(source, /freeformEditor\.eraserRadius = freeformEraserRadius\(/);
});

test("Free form opens as an independent blank paint workspace and restores each geometry separately", () => {
  const state = api.makeDefaultState();
  state.length = 120;
  state.advanced.scaleBar = true;
  state.origins = [
    {
      id: "structured-origin",
      position: 0.42,
      startPosition: 0.42,
      leftOffset: -0.01,
      rightOffset: 0.02,
    },
  ];
  state.cuts = [{ start: 0.1, end: 0.14 }];
  state.selectedOriginId = null;
  api.normaliseStateSchema(state);
  api.setState(state);

  assert.equal(api.switchGeometryWorkspace("freeform", state), true);
  assert.equal(state.geometry, "freeform");
  assert.equal(state.freeform.paths.length, 0);
  assert.equal(state.origins.length, 0);
  assert.equal(state.cuts.length, 0);
  assert.equal(state.progress, 0);
  assert.equal(state.forkTravel, 0);
  assert.equal(state.advanced.scaleBar, false);
  assert.equal(
    api.artworkMarkup(api.getReplicationModelAtTravel(state.forkTravel, state)),
    "",
    "an empty Free-form workspace must not fall back to a linear molecule"
  );
  assert.equal(state.length, api.defaultFreeformWorkspace().length);
  assert.equal(state.structuredWorkspace.origins[0].id, "structured-origin");
  assert.equal(state.structuredWorkspace.cuts.length, 1);

  state.freeform.paths = [
    {
      id: "painted-piece",
      closed: false,
      points: [
        { x: 180, y: 300 },
        { x: 480, y: 180 },
        { x: 900, y: 340 },
      ],
    },
  ];
  state.freeform.selectedPathId = "painted-piece";
  state.length = 80;
  state.origins = [
    {
      id: "painted-origin",
      position: 0.55,
      startPosition: 0.55,
      localPosition: 0.55,
      moleculeId: "painted-piece",
      leftOffset: 0,
      rightOffset: 0,
    },
  ];
  state.advanced.scaleBar = true;
  api.normaliseStateSchema(state);

  assert.equal(api.switchGeometryWorkspace("linear", state), true);
  assert.equal(state.geometry, "linear");
  assert.equal(state.length, 120);
  assert.deepEqual(Array.from(state.origins, (origin) => origin.id), ["structured-origin"]);
  assert.equal(state.cuts.length, 1);
  assert.equal(state.advanced.scaleBar, true);
  assert.equal(state.freeform.paths[0].id, "painted-piece");

  assert.equal(api.switchGeometryWorkspace("freeform", state), true);
  assert.equal(state.length, 80);
  assert.deepEqual(Array.from(state.origins, (origin) => origin.id), ["painted-origin"]);
  assert.equal(state.freeform.paths[0].id, "painted-piece");
  assert.equal(state.advanced.scaleBar, true, "an explicit Free-form ruler choice should persist independently");
});

test("large free-form component lengths remain saveable and resizable", () => {
  const state = freeformState([
    {
      id: "long-piece",
      closed: false,
      genomicLength: 1800,
      points: [
        { x: 100, y: 300 },
        { x: 1100, y: 300 },
      ],
    },
  ]);
  api.normaliseStateSchema(state);
  api.setState(state);
  assert.equal(state.length, 1800);
  assert.ok(api.maximumLengthForBasePairCount(state) >= 3600);
  assert.equal(api.resizeGenomeLength(2400, state), 2400);
  assert.equal(state.freeform.paths[0].genomicLength, 2400);
  const documentState = api.configurationDocument();
  const loaded = api.parseConfigurationText(JSON.stringify(documentState));
  assert.equal(loaded.freeform.paths[0].genomicLength, 2400);
  assert.equal(loaded.length, 2400);
});

test("configuration round-trips independent structured and Free-form workspaces", () => {
  const state = api.makeDefaultState();
  state.length = 105;
  state.origins = [
    {
      id: "linear-kept",
      position: 0.38,
      startPosition: 0.38,
      leftOffset: 0,
      rightOffset: 0,
    },
  ];
  api.normaliseStateSchema(state);
  api.setState(state);
  api.switchGeometryWorkspace("freeform", state);
  state.freeform.paths = [
    {
      id: "saved-painted-piece",
      closed: true,
      points: [
        { x: 260, y: 180 },
        { x: 720, y: 180 },
        { x: 760, y: 420 },
        { x: 300, y: 440 },
      ],
    },
  ];
  state.freeform.selectedPathId = "saved-painted-piece";
  state.length = 70;
  state.origins = [
    {
      id: "freeform-kept",
      position: 0.25,
      startPosition: 0.25,
      localPosition: 0.25,
      moleculeId: "saved-painted-piece",
      leftOffset: 0,
      rightOffset: 0,
    },
  ];
  state.advanced.scaleBar = false;
  api.normaliseStateSchema(state);
  api.setState(state);

  const documentState = api.configurationDocument();
  const loaded = api.parseConfigurationText(JSON.stringify(documentState));
  assert.equal(loaded.geometry, "freeform");
  assert.equal(loaded.freeform.paths[0].id, "saved-painted-piece");
  assert.equal(loaded.origins[0].id, "freeform-kept");
  assert.equal(loaded.freeform.workspace.origins[0].id, "freeform-kept");
  assert.equal(loaded.freeform.workspace.scaleBar, false);
  assert.equal(loaded.structuredWorkspace.origins[0].id, "linear-kept");
  assert.equal(loaded.structuredWorkspace.length, 105);

  api.setState(loaded);
  api.switchGeometryWorkspace("linear", loaded);
  assert.equal(loaded.origins[0].id, "linear-kept");
  assert.equal(loaded.length, 105);
  api.switchGeometryWorkspace("freeform", loaded);
  assert.equal(loaded.origins[0].id, "freeform-kept");
  assert.equal(loaded.freeform.paths[0].id, "saved-painted-piece");
});

test("paint strokes are interpolated, relatively simplified, and emitted as smooth splines", () => {
  const interpolated = [];
  assert.equal(api.appendFreeformStrokePoint(interpolated, { x: 0, y: 0 }, 4), true);
  assert.equal(api.appendFreeformStrokePoint(interpolated, { x: 40, y: 0 }, 4), true);
  assert.ok(interpolated.length >= 10, "a sparse pointer interval should be filled at a uniform tolerance");
  const gaps = interpolated.slice(1).map((point, index) =>
    Math.hypot(point.x - interpolated[index].x, point.y - interpolated[index].y)
  );
  assert.ok(Math.max(...gaps) <= 4.01);
  assert.ok(Math.min(...gaps) >= 3.5);

  const state = api.makeDefaultState();
  state.geometry = "freeform";
  state.freeform = { paths: [], selectedPathId: null };
  api.normaliseStateSchema(state);
  api.setState(state);
  api.setViewState({ zoom: 1, panX: 0, panY: 0 });

  const dense = Array.from({ length: 201 }, (_, index) => {
    const x = 120 + index * 4;
    return { x, y: 310 + 72 * Math.sin(index / 20) };
  });
  const sparse = dense.filter((_, index) => index % 5 === 0 || index === dense.length - 1);
  const densePrepared = api.prepareFreeformStroke(dense, state, { zoom: 1 });
  const sparsePrepared = api.prepareFreeformStroke(sparse, state, { zoom: 1 });
  assert.ok(densePrepared.length > 20 && sparsePrepared.length > 20);
  const denseLength = densePrepared.slice(1).reduce(
    (total, point, index) => total + Math.hypot(point.x - densePrepared[index].x, point.y - densePrepared[index].y),
    0
  );
  const sparseLength = sparsePrepared.slice(1).reduce(
    (total, point, index) => total + Math.hypot(point.x - sparsePrepared[index].x, point.y - sparsePrepared[index].y),
    0
  );
  assert.ok(Math.abs(denseLength - sparseLength) / denseLength < 0.035);

  const shortTolerance = api.freeformStrokeTolerance(
    [{ x: 0, y: 0 }, { x: 300, y: 0 }],
    state,
    { zoom: 1 }
  );
  const longTolerance = api.freeformStrokeTolerance(
    [{ x: 0, y: 0 }, { x: 1000, y: 0 }],
    state,
    { zoom: 1 }
  );
  assert.ok(longTolerance > shortTolerance, "simplification tolerance should scale with stroke length");

  const path = api.freeformSplinePathD({ points: sparsePrepared, closed: false });
  assert.match(path, /^M/);
  assert.match(path, / C/);
  assert.doesNotMatch(path, /NaN|Infinity/);
});

test("paint sampling is independent of pointer-event rate and preserves circular steering", () => {
  const center = { x: 620, y: 390 };
  const radius = 100;
  const collectCircle = (eventCount) => {
    const points = [];
    for (let index = 0; index <= eventCount; index += 1) {
      const angle = (Math.PI * 2 * index) / eventCount;
      api.appendFreeformStrokePoint(
        points,
        {
          x: center.x + radius * Math.cos(angle),
          y: center.y + radius * Math.sin(angle),
        },
        4
      );
    }
    return points;
  };
  const sparse = collectCircle(36);
  const dense = collectCircle(720);

  assert.ok(sparse.length > 150 && dense.length > 150);
  assert.ok(Math.abs(sparse.length - dense.length) <= 2);
  [sparse, dense].forEach((points) => {
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    assert.ok(Math.max(...xs) - Math.min(...xs) > radius * 1.98);
    assert.ok(Math.max(...ys) - Math.min(...ys) > radius * 1.98);
    assert.ok(Math.hypot(points.at(-1).x - (center.x + radius), points.at(-1).y - center.y) < 1e-8);
  });

  const state = api.makeDefaultState();
  state.geometry = "freeform";
  state.freeform = { paths: [], selectedPathId: null };
  api.normaliseStateSchema(state);
  api.setState(state);
  api.setViewState({ zoom: 1, panX: 0, panY: 0 });
  const sparsePrepared = api.prepareFreeformStroke(sparse, state, { zoom: 1 });
  const densePrepared = api.prepareFreeformStroke(dense, state, { zoom: 1 });
  const distanceToPolyline = (point, polyline) => {
    let nearest = Infinity;
    for (let index = 1; index < polyline.length; index += 1) {
      const start = polyline[index - 1];
      const end = polyline[index];
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const denominator = dx * dx + dy * dy;
      const amount = denominator
        ? Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / denominator))
        : 0;
      nearest = Math.min(
        nearest,
        Math.hypot(point.x - (start.x + dx * amount), point.y - (start.y + dy * amount))
      );
    }
    return nearest;
  };
  const deviation = Math.max(
    ...sparsePrepared.map((point) => distanceToPolyline(point, densePrepared)),
    ...densePrepared.map((point) => distanceToPolyline(point, sparsePrepared))
  );
  assert.ok(deviation < 2, `event-rate variants should remain visually equivalent (deviation ${deviation})`);
});

test("free-form metrics and SVG paths share one C1 centripetal centerline", () => {
  const state = freeformState([
    {
      id: "shared-spline",
      closed: false,
      points: [
        { x: 90, y: 330 },
        { x: 250, y: 120 },
        { x: 315, y: 410 },
        { x: 760, y: 185 },
        { x: 1080, y: 325 },
      ],
    },
  ]);
  api.setState(state);
  const metric = api.freeformMetricById("shared-spline", state);
  const rendered = cubicSegments(api.freeformSplinePathD(metric.path));
  assert.equal(rendered.length, metric.curves.length);
  metric.curves.forEach((curve, index) => {
    assert.ok(Math.abs(rendered[index].control1.x - curve.control1.x) < 1e-4);
    assert.ok(Math.abs(rendered[index].control1.y - curve.control1.y) < 1e-4);
    assert.ok(Math.abs(rendered[index].control2.x - curve.control2.x) < 1e-4);
    assert.ok(Math.abs(rendered[index].control2.y - curve.control2.y) < 1e-4);
  });
  for (let index = 0; index < metric.curves.length - 1; index += 1) {
    const incoming = api.cubicFreeformDerivative(metric.curves[index], 1);
    const outgoing = api.cubicFreeformDerivative(metric.curves[index + 1], 0);
    const cross = incoming.x * outgoing.y - incoming.y * outgoing.x;
    const scale = Math.max(1e-9, Math.hypot(incoming.x, incoming.y) * Math.hypot(outgoing.x, outgoing.y));
    assert.ok(Math.abs(cross) / scale < 1e-10, "adjacent spline pieces must have a shared tangent");
    assert.ok(incoming.x * outgoing.x + incoming.y * outgoing.y > 0);
  }
  assert.ok(metric.points.length > metric.controlPoints.length, "the metric must use the smooth centerline LUT");
});

test("shape handles scale with path length and smooth deformation preserves topology", () => {
  const shortPoints = Array.from({ length: 61 }, (_, index) => ({ x: 100 + index * 3, y: 180 }));
  const longPoints = Array.from({ length: 121 }, (_, index) => ({ x: 80 + index * 8, y: 340 }));
  const state = freeformState(
    [
      { id: "short-shape", closed: false, points: shortPoints },
      { id: "long-shape", closed: false, points: longPoints },
    ],
    [
      {
        id: "shape-origin",
        position: 0.75,
        startPosition: 0.75,
        localPosition: 0.5,
        moleculeId: "long-shape",
        leftOffset: 0,
        rightOffset: 0,
      },
    ]
  );
  api.setState(state);
  const shortHandles = api.freeformShapeHandles("short-shape", state);
  const longHandles = api.freeformShapeHandles("long-shape", state);
  assert.ok(shortHandles.length < longHandles.length, "longer molecules should receive proportionally more handles");
  assert.ok(longHandles.length <= 24 && longHandles.length < longPoints.length / 4);

  const path = state.freeform.paths.find((candidate) => candidate.id === "long-shape");
  const original = path.points.map((point) => ({ ...point }));
  const pathIds = state.freeform.paths.map((candidate) => candidate.id);
  assert.equal(
    api.reshapeFreeformNeighborhood("long-shape", 0.5, { x: 0, y: -96 }, {
      sourceState: state,
      originalPoints: original,
    }),
    true
  );
  assert.equal(path.points.length, original.length, "shape edits must not insert resolution points");
  assert.equal(Array.from(state.freeform.paths, (candidate) => candidate.id).join("|"), pathIds.join("|"));
  assert.equal(path.points[0].x, original[0].x);
  assert.equal(path.points[0].y, original[0].y);
  assert.equal(path.points.at(-1).x, original.at(-1).x);
  assert.equal(path.points.at(-1).y, original.at(-1).y);
  const displacement = path.points.map((point, index) => point.y - original[index].y);
  assert.ok(Math.min(...displacement) < -90);
  const adjacentChanges = displacement.slice(1).map((value, index) => Math.abs(value - displacement[index]));
  assert.ok(Math.max(...adjacentChanges) < 18, "neighbouring controls must taper without a spike");
  assert.equal(state.origins[0].moleculeId, "long-shape");
  assert.ok(Number.isFinite(state.origins[0].localPosition));
});

test("large Shape pulls preserve control order and cannot create a local cusp", () => {
  const points = Array.from({ length: 81 }, (_, index) => ({
    x: 120 + index * 10,
    y: 300,
  }));
  const state = freeformState([
    {
      id: "ordered-shape",
      closed: false,
      genomicLength: 160,
      points,
    },
  ]);
  api.setState(state);
  const original = state.freeform.paths[0].points.map((point) => ({ ...point }));
  assert.equal(
    api.reshapeFreeformNeighborhood(
      "ordered-shape",
      0.5,
      { x: -360, y: 260 },
      { sourceState: state, originalPoints: original, influenceFraction: 0.12 }
    ),
    true
  );
  const deformed = state.freeform.paths[0].points;
  for (let index = 0; index < deformed.length - 1; index += 1) {
    const baseline = {
      x: original[index + 1].x - original[index].x,
      y: original[index + 1].y - original[index].y,
    };
    const next = {
      x: deformed[index + 1].x - deformed[index].x,
      y: deformed[index + 1].y - deformed[index].y,
    };
    assert.ok(
      next.x * baseline.x + next.y * baseline.y > Math.hypot(baseline.x, baseline.y) ** 2 * 0.2,
      "adjacent controls must retain their original arc order"
    );
  }
  const metric = api.freeformMetricById("ordered-shape", state);
  assert.ok(
    metric.curves.every((curve) => {
      const midpoint = api.cubicFreeformDerivative(curve, 0.5);
      return Math.hypot(midpoint.x, midpoint.y) > 1e-5;
    })
  );
  assert.match(
    source,
    /reshapeFreeformNeighborhood\([\s\S]*?updateFreeformPathLengthFromDensity\([\s\S]*?syncControls\(\)[\s\S]*?dragState\.closeCandidate/
  );
});

test("virtual shape handles materialize a sparse long path once and bend its midpoint smoothly", () => {
  const state = freeformState(
    [
      {
        id: "sparse-line",
        closed: false,
        points: [
          { x: 100, y: 300 },
          { x: 1100, y: 300 },
        ],
      },
    ],
    [
      {
        id: "sparse-origin",
        position: 0.5,
        startPosition: 0.5,
        localPosition: 0.5,
        moleculeId: "sparse-line",
        leftOffset: 0,
        rightOffset: 0,
      },
    ]
  );
  api.setState(state);
  const path = state.freeform.paths[0];
  const handles = api.freeformShapeHandles(path, state);
  assert.ok(handles.length >= 10 && handles.length <= 24);
  assert.ok(handles.some((handle) => handle.virtual));
  assert.ok(handles.some((handle) => Math.abs(handle.localPosition - 0.5) < 0.06));

  const basis = api.freeformShapeControlBasis(path, state);
  assert.equal(basis.materialized, true);
  assert.ok(basis.points.length > handles.length && basis.points.length <= 160);
  assert.equal(path.points.length, 2, "preparing virtual controls must remain read-only until a drag moves");

  assert.equal(
    api.reshapeFreeformNeighborhood("sparse-line", 0.5, { x: 0, y: -120 }, { sourceState: state }),
    true
  );
  assert.equal(path.points.length, basis.points.length);
  const firstCount = path.points.length;
  const displacement = path.points.map((point) => point.y - 300);
  assert.ok(Math.min(...displacement) < -115);
  assert.equal(displacement[0], 0);
  assert.equal(displacement.at(-1), 0);
  const adjacentChanges = displacement.slice(1).map((value, index) => Math.abs(value - displacement[index]));
  assert.ok(Math.max(...adjacentChanges) < 55, "materialized controls must form a broad bend, not a spike");

  assert.equal(
    api.reshapeFreeformNeighborhood("sparse-line", 0.5, { x: 0, y: -72 }, {
      sourceState: state,
      originalPoints: basis.points,
      controlPositions: basis.controlPositions,
    }),
    true
  );
  assert.equal(path.points.length, firstCount, "subsequent pointer moves must reuse the same topology");
  assert.equal(state.origins[0].moleculeId, "sparse-line");
  assert.ok(Math.abs(state.origins[0].localPosition - 0.5) < 1e-8);
});

test("a sparse straight erase survivor retains virtual midpoint shape controls", () => {
  const state = freeformState([
    {
      id: "erased-sparse-line",
      closed: false,
      points: [
        { x: 80, y: 300 },
        { x: 1120, y: 300 },
      ],
    },
  ]);
  api.setState(state);
  const erased = api.eraseFreeformPaths(
    [
      { x: 380, y: 220 },
      { x: 380, y: 380 },
    ],
    24,
    state
  );
  assert.equal(erased.changed, true);
  const survivor = state.freeform.paths
    .map((path) => ({ path, metric: api.freeformMetricById(path.id, state) }))
    .sort((first, second) => second.metric.length - first.metric.length)[0].path;
  assert.ok(survivor.points.length <= 3, "the straight erased run should remain intentionally sparse");
  const handles = api.freeformShapeHandles(survivor, state);
  assert.ok(handles.length > survivor.points.length);
  const beforeCount = survivor.points.length;
  assert.equal(
    api.reshapeFreeformNeighborhood(survivor.id, 0.5, { x: 0, y: 80 }, { sourceState: state }),
    true
  );
  assert.ok(survivor.points.length > beforeCount);
  assert.ok(Math.max(...survivor.points.map((point) => point.y)) > 370);
});

test("paint preparation suppresses high-frequency mouse jitter", () => {
  const state = freeformState([]);
  api.setState(state);
  const jittered = Array.from({ length: 161 }, (_, index) => ({
    x: 100 + index * 5,
    y: 300 + (index % 2 === 0 ? -14 : 14) + index * 0.05,
  }));
  const prepared = api.prepareFreeformStroke(jittered, state, { zoom: 1 });
  const roughness = (points) =>
    points.slice(2).reduce(
      (total, point, index) =>
        total + Math.abs(point.y - 2 * points[index + 1].y + points[index].y),
      0
    ) / Math.max(1, points.length - 2);
  assert.ok(prepared.length < jittered.length);
  assert.ok(roughness(prepared) < roughness(jittered) * 0.2);
  assert.equal(prepared[0].x, jittered[0].x);
  assert.equal(prepared[0].y, jittered[0].y);
  assert.equal(prepared.at(-1).x, jittered.at(-1).x);
  assert.equal(prepared.at(-1).y, jittered.at(-1).y);
});

test("paint preparation rounds abrupt corners while preserving both endpoints", () => {
  const state = freeformState([]);
  api.setState(state);
  const cornered = [
    { x: 100, y: 320 },
    { x: 280, y: 320 },
    { x: 280, y: 150 },
    { x: 500, y: 150 },
  ];
  const rounded = api.roundFreeformCorners(cornered, 0.24);
  assert.equal(rounded[0].x, cornered[0].x);
  assert.equal(rounded[0].y, cornered[0].y);
  assert.equal(rounded.at(-1).x, cornered.at(-1).x);
  assert.equal(rounded.at(-1).y, cornered.at(-1).y);
  assert.ok(rounded.length > cornered.length);
  const alignments = rounded.slice(1, -1).map((point, index) => {
    const previous = rounded[index];
    const following = rounded[index + 2];
    const incoming = { x: point.x - previous.x, y: point.y - previous.y };
    const outgoing = { x: following.x - point.x, y: following.y - point.y };
    return (
      (incoming.x * outgoing.x + incoming.y * outgoing.y) /
      Math.max(1e-9, Math.hypot(incoming.x, incoming.y) * Math.hypot(outgoing.x, outgoing.y))
    );
  });
  assert.ok(Math.min(...alignments) > 0.45, "corner cutting replaces right angles with broad turns");

  const prepared = api.prepareFreeformStroke(cornered, state, { zoom: 1 });
  assert.equal(prepared[0].x, cornered[0].x);
  assert.equal(prepared[0].y, cornered[0].y);
  assert.equal(prepared.at(-1).x, cornered.at(-1).x);
  assert.equal(prepared.at(-1).y, cornered.at(-1).y);
  const firstCornerClearance = Math.min(
    ...prepared.map((point) => Math.hypot(point.x - cornered[1].x, point.y - cornered[1].y))
  );
  assert.ok(
    firstCornerClearance > 12,
    `stored centerlines use a visible corner radius (${firstCornerClearance.toFixed(2)} px)`
  );
  assert.ok(api.freeformSplinePathD({ points: prepared, closed: false }).includes(" C"));
});

test("tight free-form offsets remain cusp-safe and render as smooth cubic paths", () => {
  assert.equal(api.freeformCurvatureSafeOffset({ curvature: 0.01 }, 20), 20);
  const syntheticOffset = api.freeformCurvatureSafeOffset({ curvature: 0.08 }, 40);
  assert.ok(Math.abs(0.08 * syntheticOffset) < 0.78);
  assert.ok(
    Math.abs(
      api.freeformCurvatureSafeOffset({ curvature: 0.08 }, -40) + syntheticOffset
    ) < 1e-12,
    "positive and negative strand offsets are limited symmetrically"
  );

  const state = freeformState([
    {
      id: "tight-rendered-turn",
      closed: false,
      genomicLength: 100,
      points: [
        { x: 100, y: 330 },
        { x: 300, y: 330 },
        { x: 360, y: 285 },
        { x: 325, y: 220 },
        { x: 255, y: 245 },
        { x: 245, y: 315 },
        { x: 305, y: 370 },
        { x: 560, y: 350 },
      ],
    },
  ]);
  state.origins = [];
  state.cuts = [];
  api.normaliseStateSchema(state);
  api.setState(state);
  const metric = api.freeformMetricById("tight-rendered-turn", state);
  let curvedSamples = 0;
  const renderedOffsets = [];
  for (let index = 0; index <= 1200; index += 1) {
    const local = index / 1200;
    const global = metric.start + local * metric.span;
    const point = api.freeformPointAtFraction(global, state, metric.id);
    const safeOffset = api.freeformCurvatureSafeOffset(point, 90);
    renderedOffsets.push(safeOffset);
    assert.equal(
      api.freeformRenderedNormalOffset(point, 90),
      90,
      "open painted DNA preserves the canonical transverse coordinate"
    );
    if (Math.abs(point.curvature) > 0.005) curvedSamples += 1;
    assert.ok(
      Math.abs(point.curvature * safeOffset) <= 0.780000001,
      "a strand offset must stay below the parallel-curve cusp"
    );
  }
  assert.ok(curvedSamples > 0, "the fixture contains a genuinely tight bend");
  const largestOffsetStep = renderedOffsets.slice(1).reduce(
    (largest, offset, index) => Math.max(largest, Math.abs(offset - renderedOffsets[index])),
    0
  );
  assert.ok(
    largestOffsetStep < 3,
    `curvature compression must ease between adjacent samples (${largestOffsetStep.toFixed(3)} px)`
  );
  metric.curves.slice(1).forEach((curve) => {
    const local = curve.startLength / metric.length;
    const delta = 1e-5;
    const before = api.freeformPointAtFraction(
      metric.start + Math.max(0, local - delta) * metric.span,
      state,
      metric.id
    );
    const after = api.freeformPointAtFraction(
      metric.start + Math.min(1, local + delta) * metric.span,
      state,
      metric.id
    );
    assert.ok(
      Math.abs(
        api.freeformCurvatureSafeOffset(before, 90) -
          api.freeformCurvatureSafeOffset(after, 90)
      ) < 0.2,
      "strand offsets remain continuous across centerline spline controls"
    );
  });

  const path = api.sampledPath(
    api.VIEW.x0,
    api.VIEW.x1,
    () => api.VIEW.centerY + 90,
    2
  );
  assert.match(path, / C/);
  assert.doesNotMatch(path, / L|NaN|Infinity/);
});

test("tight pencil helices keep a smooth transported frame without strand dents", () => {
  const state = freeformState([]);
  state.length = 50;
  state.doubleStrandHeight = 28;
  state.origins = [];
  const stroke = [
    { x: 90, y: 120 },
    { x: 160, y: 105 },
    { x: 220, y: 128 },
    { x: 238, y: 175 },
    { x: 222, y: 225 },
    { x: 252, y: 275 },
    { x: 264, y: 330 },
    { x: 242, y: 380 },
    { x: 185, y: 410 },
    { x: 105, y: 400 },
  ];
  const prepared = api.prepareFreeformStroke(stroke, state, { zoom: 1 });
  state.freeform.paths = [{
    id: "tight-pencil-frame",
    points: prepared,
    closed: false,
    genomicLength: 50,
  }];
  state.freeform.selectedPathId = "tight-pencil-frame";
  api.normaliseStateSchema(state);
  api.setState(state);

  const metric = api.freeformMetricById("tight-pencil-frame", state);
  for (const local of [0, 1]) {
    const point = api.freeformPointAtFraction(
      metric.start + local * metric.span,
      state,
      metric.id
    );
    const frame = api.freeformRenderedFrame(point);
    assert.ok(
      Math.abs(Math.hypot(frame.tangentX, frame.tangentY) - 1) < 1e-10,
      "the deformation frame remains orthonormal at open DNA endpoints"
    );
    assert.ok(
      frame.tangentX * point.tangentX + frame.tangentY * point.tangentY > 0.2,
      "the softened frame remains oriented with the painted centerline"
    );
  }

  const envelope = api.freeformDeformationEnvelope(state);
  for (let index = 0; index <= 1200; index += 1) {
    const point = api.freeformPointAtFraction(
      metric.start + (index / 1200) * metric.span,
      state,
      metric.id
    );
    const frame = api.freeformRenderedFrame(point, state);
    assert.ok(
      Math.abs(frame.turnRate || 0) * envelope < 0.86,
      "the complete replicated ribbon cannot reach an offset-curve cusp"
    );
  }

  const model = api.getReplicationModel();
  const strandPoints = Array.from({ length: 1601 }, (_, index) => {
    const local = index / 1600;
    const fraction = metric.start + local * metric.span;
    const x = api.VIEW.x0 + fraction * api.VIEW.moleculeWidth;
    return api.geometryPoint(x, api.templateY(x, "a", model), state);
  });
  const vectors = strandPoints.slice(1).map((point, index) => ({
    x: point.x - strandPoints[index].x,
    y: point.y - strandPoints[index].y,
  }));
  const tangentDots = vectors.slice(1).map((vector, index) => {
    const previous = vectors[index];
    return (
      (previous.x * vector.x + previous.y * vector.y) /
      Math.max(1e-9, Math.hypot(previous.x, previous.y) * Math.hypot(vector.x, vector.y))
    );
  });
  assert.ok(
    Math.min(...tangentDots) > 0.94,
    "a densely sampled rendered strand cannot fold or form a pointed waypoint"
  );

  const rendered = api.sampledPath(
    api.VIEW.x0,
    api.VIEW.x1,
    (x) => api.templateY(x, "a", model),
    2
  );
  assert.match(rendered, / C/);
  assert.doesNotMatch(rendered, / L|NaN|Infinity/);
  assert.equal(
    api.freeformSplinePathD({ points: prepared, closed: false }),
    api.freeformSplinePathD({ points: prepared, closed: false }, 1),
    "free-form rendering uses the full centripetal tangent instead of waypoint-like short handles"
  );
});

test("replicated free-form bends keep smooth shared offsets and exact crossover splines", () => {
  const state = freeformState([
    {
      id: "replicated-u-turn",
      closed: false,
      genomicLength: 100,
      points: [
        { x: 80, y: 190 },
        { x: 170, y: 95 },
        { x: 315, y: 75 },
        { x: 430, y: 145 },
        { x: 470, y: 275 },
        { x: 425, y: 395 },
        { x: 535, y: 465 },
        { x: 700, y: 425 },
        { x: 815, y: 315 },
        { x: 875, y: 175 },
      ],
    },
  ]);
  state.daughterSpacing = 180;
  state.doubleStrandHeight = 32;
  state.advanced.contour = false;
  state.advanced.crossoverGaps = false;
  const metric = api.freeformMetricById("replicated-u-turn", state);
  const originPosition = metric.start + metric.span * 0.52;
  state.origins = [{
    id: "curve-origin",
    position: originPosition,
    startPosition: originPosition,
    localPosition: 0.52,
    moleculeId: metric.id,
    leftOffset: 0,
    rightOffset: 0,
  }];
  state.forkTravel = metric.span * 0.43;
  api.normaliseStateSchema(state);
  api.setState(state);

  const model = api.getFreeformReplicationModelAtTravel(state.forkTravel, state);
  const maximumOffset =
    api.renderedDaughterHalfSpacing(state) + api.renderedDoubleStrandHalfHeight(state);
  const scales = Array.from({ length: 1601 }, (_, index) => {
    const fraction = metric.start + (index / 1600) * metric.span;
    const x = api.VIEW.x0 + fraction * api.VIEW.moleculeWidth;
    return api.geometryPoint(x, api.VIEW.centerY + maximumOffset, state).normalOffset /
      maximumOffset;
  });
  const scaleRange = Math.max(...scales) - Math.min(...scales);
  assert.ok(
    scaleRange < 1e-10,
    `one painted piece must use one fixed normal-coordinate scale (${scaleRange})`
  );

  const helixAmplitude = api.renderedDoubleStrandHalfHeight(state);
  const fullyReplicated = Array.from({ length: 1601 }, (_, index) => {
    const fraction = metric.start + (index / 1600) * metric.span;
    const x = api.VIEW.x0 + fraction * api.VIEW.moleculeWidth;
    const replication = api.replicationAt(x, model);
    if (replication.profile < 1 - 1e-10) return null;
    const template = api.freeformStrandGeometryPoint(
      x,
      api.templateY(x, "a", model),
      "a",
      state
    );
    const daughter = api.freeformStrandGeometryPoint(
      x,
      api.nascentY(x, "top", model),
      "top",
      state
    );
    const safeAmplitude = Math.abs(
      api.geometryPoint(x, api.VIEW.centerY + helixAmplitude, state).normalOffset
    );
    return {
      fraction,
      separation: Math.abs(daughter.normalOffset - template.normalOffset),
      safeAmplitude,
      midpoint: (daughter.normalOffset + template.normalOffset) / 2,
    };
  }).filter(Boolean);
  assert.ok(fullyReplicated.length > 500);
  const replicatedMidpoints = fullyReplicated.map((sample) => sample.midpoint);
  assert.ok(
    Math.max(...replicatedMidpoints) - Math.min(...replicatedMidpoints) < 1e-8,
    "opposed daughter waves share one smooth replicated baseline"
  );
  const sectionStart = fullyReplicated[0].fraction;
  const sectionSpan = fullyReplicated.at(-1).fraction - sectionStart;
  const waveSections = Array.from({ length: 6 }, () => []);
  fullyReplicated.forEach((sample) => {
    const section = Math.min(
      waveSections.length - 1,
      Math.floor(((sample.fraction - sectionStart) / sectionSpan) * waveSections.length)
    );
    waveSections[section].push(sample);
  });
  waveSections.forEach((samples, section) => {
    const peakRatio = Math.max(
      ...samples.map((sample) =>
        sample.separation / Math.max(1e-9, sample.safeAmplitude * 2)
      )
    );
    assert.ok(
      peakRatio > 0.94,
      `replicated helix section ${section} retains its full sinusoidal amplitude (${peakRatio})`
    );
  });

  const sampling = api.replicationPathSampling(model);
  const renderedPath = (
    pointForX,
    strandRole,
    fromX = api.VIEW.x0,
    toX = api.VIEW.x1
  ) =>
    api.sampledPath(
      fromX,
      toX,
      pointForX,
      3,
      null,
      sampling.anchorXs,
      sampling.localWindows,
      (x) => api.numericalPathTangent(pointForX, x, api.VIEW.x0, api.VIEW.x1),
      strandRole
    );
  const fullPaths = [
    renderedPath((x) => api.templateY(x, "a", model), "a"),
    renderedPath((x) => api.templateY(x, "b", model), "b"),
    renderedPath((x) => api.nascentY(x, "top", model), "top"),
    renderedPath((x) => api.nascentY(x, "bottom", model), "bottom"),
  ];
  fullPaths.forEach((pathData, pathIndex) => {
    const segments = cubicSegments(pathData);
    assert.ok(segments.length > 40);
    for (let index = 0; index < segments.length - 1; index += 1) {
      const current = segments[index];
      const next = segments[index + 1];
      const incoming = {
        x: current.to.x - current.control2.x,
        y: current.to.y - current.control2.y,
      };
      const outgoing = {
        x: next.control1.x - next.from.x,
        y: next.control1.y - next.from.y,
      };
      const scale = Math.hypot(incoming.x, incoming.y) * Math.hypot(outgoing.x, outgoing.y);
      if (scale <= 1e-8) continue;
      const alignment = (incoming.x * outgoing.x + incoming.y * outgoing.y) / scale;
      assert.ok(
        alignment > 0.995,
        `rendered path ${pathIndex} loses its tangent at segment ${index} (${alignment}; ` +
          `${JSON.stringify({ previous: current.from, point: current.to, following: next.to, incoming, outgoing })})`
      );
    }
  });

  const commandsFrom = (paths) => new Set(
    paths.flatMap((pathData) =>
      (pathData.match(/C[^CMZ]+/g) || []).map((command) => command.trim())
    )
  );
  const assertExactBridges = (allowedCommands) => {
    const bridgeMarkup = api.renderCrossoverOverpasses(model);
    const bridgePaths = [...bridgeMarkup.matchAll(/<path d="([^"]+)"/g)].map((match) => match[1]);
    assert.ok(bridgePaths.length > 4);
    bridgePaths.forEach((pathData) => {
      const commands = (pathData.match(/C[^CMZ]+/g) || []).map((command) => command.trim());
      assert.ok(commands.length > 0);
      commands.forEach((command) => {
        assert.ok(
          allowedCommands.has(command),
          `a crossover bridge must reuse its full-strand Bezier segment: ${command}`
        );
      });
    });
    assert.doesNotMatch(bridgeMarkup, /<use\b|<clipPath\b/);
  };

  state.layers.newDna = false;
  assertExactBridges(commandsFrom(fullPaths.slice(0, 2)));
  state.layers.newDna = true;
  assertExactBridges(commandsFrom(fullPaths));
});

test("sharp open Free-form turns deform the complete replicated ribbon without collapse", () => {
  const state = freeformState([
    {
      id: "sharp-replicated-ribbon",
      closed: false,
      genomicLength: 140,
      points: [
        { x: 105, y: 310 },
        { x: 72, y: 240 },
        { x: 94, y: 165 },
        { x: 165, y: 112 },
        { x: 350, y: 110 },
        { x: 445, y: 165 },
        { x: 472, y: 275 },
        { x: 440, y: 400 },
        { x: 530, y: 485 },
        { x: 710, y: 515 },
        { x: 850, y: 455 },
        { x: 895, y: 335 },
        { x: 872, y: 175 },
        { x: 900, y: 65 },
      ],
    },
  ]);
  state.daughterSpacing = 180;
  state.doubleStrandHeight = 30;
  state.advanced.contour = false;
  state.advanced.crossoverGaps = false;
  let metric = api.freeformMetricById("sharp-replicated-ribbon", state);
  const originPosition = metric.start + metric.span * 0.24;
  state.origins = [{
    id: "sharp-ribbon-origin",
    position: originPosition,
    startPosition: originPosition,
    localPosition: 0.24,
    moleculeId: metric.id,
    leftOffset: 0,
    rightOffset: 0,
  }];
  state.forkTravel = metric.span * 0.2;
  api.normaliseStateSchema(state);
  api.setState(state);
  metric = api.freeformMetricById("sharp-replicated-ribbon", state);

  const envelope = api.freeformDeformationEnvelope(state);
  const transverseOffset =
    api.renderedDaughterHalfSpacing(state) + api.renderedDoubleStrandHalfHeight(state);
  const upper = [];
  const lower = [];
  const centre = [];
  for (let index = 0; index <= 2400; index += 1) {
    const fraction = metric.start + (index / 2400) * metric.span;
    const x = api.VIEW.x0 + fraction * api.VIEW.moleculeWidth;
    const centrePoint = api.geometryPoint(x, api.VIEW.centerY, state);
    const upperPoint = api.geometryPoint(
      x,
      api.VIEW.centerY - transverseOffset,
      state
    );
    const lowerPoint = api.geometryPoint(
      x,
      api.VIEW.centerY + transverseOffset,
      state
    );
    const framePoint = api.freeformPointAtFraction(fraction, state, metric.id);
    const frame = api.freeformRenderedFrame(framePoint, state);
    centre.push(centrePoint);
    upper.push(upperPoint);
    lower.push(lowerPoint);
    assert.ok(
      Math.abs(
        Math.hypot(lowerPoint.x - upperPoint.x, lowerPoint.y - upperPoint.y) -
          transverseOffset * 2
      ) < 1e-7,
      "the painted deformation preserves the full canonical ribbon width"
    );
    assert.ok(
      Math.abs(frame.turnRate || 0) * envelope < 0.86,
      "the deformation frame turns too slowly to form an inner offset cusp"
    );
  }

  [upper, lower].forEach((strandPoints, strandIndex) => {
    const vectors = strandPoints.slice(1).map((point, index) => ({
      x: point.x - strandPoints[index].x,
      y: point.y - strandPoints[index].y,
      centreLength: Math.hypot(
        centre[index + 1].x - centre[index].x,
        centre[index + 1].y - centre[index].y
      ),
    }));
    const minimumSpeedRatio = Math.min(
      ...vectors.map((vector) =>
        Math.hypot(vector.x, vector.y) / Math.max(1e-9, vector.centreLength)
      )
    );
    assert.ok(
      minimumSpeedRatio > 0.12,
      `sharp-turn ribbon side ${strandIndex} cannot stop or reverse through a cusp (${minimumSpeedRatio})`
    );
  });

  const daughterOffset = api.renderedDaughterHalfSpacing(state);
  [0.1, 0.25, 0.5, 0.75].forEach((progress) => {
    [-1, 1].forEach((side) => {
      const baseline = side * daughterOffset * progress;
      const deformation = api.freeformDeformationAmountForBaseline(baseline, state);
      assert.ok(
        deformation > progress - 1e-10,
        "partial bubbles hand off conservatively toward the broad deformation frame"
      );
      const samples = Array.from({ length: 1601 }, (_, index) => {
        const fraction = metric.start + (index / 1600) * metric.span;
        const x = api.VIEW.x0 + fraction * api.VIEW.moleculeWidth;
        return {
          strand: api.geometryPoint(x, api.VIEW.centerY + baseline, state),
          center: api.geometryPoint(x, api.VIEW.centerY, state),
        };
      });
      const speedRatios = samples.slice(1).map((sample, index) => {
        const strandLength = Math.hypot(
          sample.strand.x - samples[index].strand.x,
          sample.strand.y - samples[index].strand.y
        );
        const centerLength = Math.hypot(
          sample.center.x - samples[index].center.x,
          sample.center.y - samples[index].center.y
        );
        return strandLength / Math.max(1e-9, centerLength);
      });
      assert.ok(
        Math.min(...speedRatios) > 0.1,
        `partial ribbon ${side}:${progress} remains free of a longitudinal cusp`
      );
    });
  });

  const model = api.getFreeformReplicationModelAtTravel(state.forkTravel, state);
  const replicatedWaveRatios = [];
  const replicatedCrossSections = { upper: [], lower: [] };
  for (let index = 0; index <= 1600; index += 1) {
    const fraction = metric.start + (index / 1600) * metric.span;
    const x = api.VIEW.x0 + fraction * api.VIEW.moleculeWidth;
    if (api.replicationAt(x, model).profile < 1 - 1e-10) continue;
    [
      { key: "upper", templateRole: "a", daughterRole: "top" },
      { key: "lower", templateRole: "b", daughterRole: "bottom" },
    ].forEach(({ key, templateRole, daughterRole }) => {
      const template = api.freeformStrandGeometryPoint(
        x,
        api.templateY(x, templateRole, model),
        templateRole,
        state
      );
      const daughter = api.freeformStrandGeometryPoint(
        x,
        api.nascentY(x, daughterRole, model),
        daughterRole,
        state
      );
      const expected = Math.abs(
        api.helixWave(x, daughterRole, state) -
          api.helixWave(x, templateRole, state)
      );
      const rung = {
        x: daughter.x - template.x,
        y: daughter.y - template.y,
      };
      replicatedCrossSections[key].push({
        midpoint: {
          x: (template.x + daughter.x) / 2,
          y: (template.y + daughter.y) / 2,
        },
        rung,
      });
      if (expected > 1) {
        replicatedWaveRatios.push(Math.hypot(rung.x, rung.y) / expected);
      }
    });
  }
  assert.ok(replicatedWaveRatios.length > 100);
  assert.ok(
    Math.min(...replicatedWaveRatios) > 0.999999,
    "replicated waves retain the same amplitude as their linear source geometry"
  );
  assert.ok(Math.max(...replicatedWaveRatios) < 1.000001);

  Object.entries(replicatedCrossSections).forEach(([side, crossSections]) => {
    const perpendicularity = [];
    for (let index = 1; index < crossSections.length - 1; index += 1) {
      const previous = crossSections[index - 1].midpoint;
      const following = crossSections[index + 1].midpoint;
      const tangent = {
        x: following.x - previous.x,
        y: following.y - previous.y,
      };
      const rung = crossSections[index].rung;
      const tangentLength = Math.hypot(tangent.x, tangent.y);
      const rungLength = Math.hypot(rung.x, rung.y);
      if (tangentLength <= 1e-9 || rungLength <= 2) continue;
      perpendicularity.push(
        Math.abs(rung.x * tangent.y - rung.y * tangent.x) /
          (rungLength * tangentLength)
      );
    }
    assert.ok(perpendicularity.length > 40);
    const minimumPerpendicularity = Math.min(...perpendicularity);
    assert.ok(
      minimumPerpendicularity > 0.985,
      `${side} replicated cross-sections stay perpendicular to their daughter baseline (${minimumPerpendicularity})`
    );
  });
});

test("unreplicated Free-form helices stay perpendicular to tight painted centreline turns", () => {
  const centre = { x: 420, y: 300 };
  const radius = 92;
  const points = Array.from({ length: 13 }, (_, index) => {
    const angle = (-150 + index * 27.5) * (Math.PI / 180);
    return {
      x: centre.x + Math.cos(angle) * radius,
      y: centre.y + Math.sin(angle) * radius,
    };
  });
  const state = freeformState([
    {
      id: "tight-unreplicated-arc",
      closed: false,
      genomicLength: 100,
      points,
    },
  ]);
  state.daughterSpacing = 180;
  state.doubleStrandHeight = 30;
  state.origins = [];
  state.cuts = [];
  api.normaliseStateSchema(state);
  api.setState(state);

  const metric = api.freeformMetricById("tight-unreplicated-arc", state);
  const model = api.getFreeformReplicationModelAtTravel(0, state);
  const amplitude = api.renderedDoubleStrandHalfHeight(state);
  const alignments = [];
  const wideAlignments = [];
  for (let index = 40; index <= 960; index += 1) {
    const local = index / 1000;
    const fraction = metric.start + local * metric.span;
    const x = api.VIEW.x0 + fraction * api.VIEW.moleculeWidth;
    const wave = api.helixWave(x, "a", state);
    if (Math.abs(wave) < amplitude * 0.35) continue;
    const centerline = api.geometryPoint(x, api.VIEW.centerY, state);
    const strand = api.freeformStrandGeometryPoint(
      x,
      api.templateY(x, "a", model),
      "a",
      state
    );
    const point = api.freeformPointAtFraction(fraction, state, metric.id);
    const rawNormal = { x: -point.tangentY, y: point.tangentX };
    const displacement = {
      x: strand.x - centerline.x,
      y: strand.y - centerline.y,
    };
    const displacementLength = Math.hypot(displacement.x, displacement.y);
    alignments.push(
      Math.abs(
        (displacement.x * rawNormal.x + displacement.y * rawNormal.y) /
          Math.max(1e-9, displacementLength)
      )
    );
    const wideFrame = api.freeformRenderedFrame(point, state, 1);
    wideAlignments.push(
      Math.abs(wideFrame.normalX * rawNormal.x + wideFrame.normalY * rawNormal.y)
    );
    assert.ok(
      api.freeformStrandDeformationAmount(
        x,
        api.templateY(x, "a", model),
        "a",
        state
      ) < 1e-12,
      "an unreplicated helix uses the centreline-following frame"
    );
  }

  assert.ok(alignments.length > 500);
  assert.ok(
    Math.min(...alignments) > 0.985,
    `unreplicated cross-sections remain perpendicular (${Math.min(...alignments)})`
  );
  assert.ok(
    Math.min(...wideAlignments) < 0.9,
    "the fixture exercises a turn where the full daughter frame would visibly skew the helix"
  );
});

test("strand-aware wave protection changes only Free-form path geometry", () => {
  ["linear", "circular"].forEach((geometry) => {
    const state = freshState();
    state.geometry = geometry;
    state.length = 40;
    state.cuts = [];
    api.normaliseStateSchema(state);
    api.setState(state);
    const model = api.getReplicationModel();
    const pointForX = (x) => api.templateY(x, "a", model);
    const tangentForX = (x) =>
      api.numericalPathTangent(pointForX, x, api.VIEW.x0, api.VIEW.x1);
    const commonArguments = [
      api.VIEW.x0,
      api.VIEW.x1,
      pointForX,
      3,
      null,
      [],
      [],
      tangentForX,
    ];
    assert.equal(
      api.sampledPath(...commonArguments, "a"),
      api.sampledPath(...commonArguments),
      `${geometry} rendering ignores the Free-form strand mapping`
    );
  });
});

test("the Free-form palette uses the requested vertical tool order and pencil cursor", () => {
  assert.match(
    html,
    /id="freeformDrawButton"[^>]*title="Paint a new DNA piece"[^>]*aria-label="Paint a new DNA piece"[^>]*aria-pressed="true"/
  );
  assert.match(
    html,
    /id="freeformDrawButton"[\s\S]*?<svg[^>]*>[\s\S]*?<path d="M4 20h4L19 9l-4-4L4 16v4Z"/
  );
  assert.match(
    html,
    /id="freeformEditButton"[\s\S]*?<circle cx="12" cy="12" r="8\.5"[\s\S]*?<path d="M12 8v8M8 12h8"/
  );
  assert.match(
    html,
    /id="freeformSelectButton"[^>]*title="Shape and link DNA pieces"[\s\S]*?<path d="M4 17c4-9 10-10 16-5"/
  );
  assert.match(
    html,
    /id="freeformEraseButton"[\s\S]*?<path d="m4 14\.5 7\.8-9\.8/
  );
  assert.match(
    html,
    /id="freeformDrawButton"[\s\S]*id="freeformEditButton"[\s\S]*id="freeformSelectButton"[\s\S]*id="freeformEraseButton"[\s\S]*id="freeformDeletePathButton"/
  );
  assert.doesNotMatch(html, /id="freeformSnapStartButton"|id="freeformPieceCount"/);
  assert.match(
    html,
    /id="freeformEraserSizeControl"[^>]*value="30"[^>]*aria-valuetext="60 px diameter"/
  );
  assert.equal(api.freeformEraserRadius(Number.NaN), 30);
  assert.match(
    css,
    /#dnaCanvas\[data-freeform-tool="draw"\][\s\S]*?cursor:\s*url\("data:image\/svg\+xml,[^\"]*M4 28[^\"]+"\) 3 29,\s*crosshair !important;/
  );
  assert.match(source, /freeformEditor = \{\s*tool: "draw"/s);
  assert.doesNotMatch(source, /function defaultFreeformPath\(/);
  assert.match(source, /freeform: "Free-form canvas ready — paint a DNA piece to begin"/);
});

test("circular strand radii remain smooth and finite when replicated DNA crosses genomic zero", () => {
  const state = freshState();
  state.geometry = "circular";
  state.length = 40;
  state.daughterSpacing = 520;
  state.doubleStrandHeight = 56;
  state.weight = 8;
  state.cuts = [];
  api.normaliseStateSchema(state);
  api.setState(state);

  const radius = api.circularRadius(state);
  const minimum = api.circularMinimumRenderedRadius(state);
  const radialScale = api.circularRadialLayoutScale(state);
  const renderedHalfSpacing = api.renderedDaughterHalfSpacing(state);
  const renderedHalfHeight = api.renderedDoubleStrandHalfHeight(state);
  assert.ok(minimum > 0 && minimum < radius);
  assert.ok(radialScale > 0 && radialScale < 1);
  assert.ok(renderedHalfSpacing > 0 && renderedHalfSpacing < state.daughterSpacing / 2);
  assert.ok(renderedHalfHeight > 0 && renderedHalfHeight < api.doubleStrandHalfHeight(state));
  assert.equal(api.circularSafeRenderedRadius(-radius, state), minimum);

  const inwardY = api.VIEW.centerY - radius * 2.5;
  const atZero = api.geometryPoint(api.VIEW.x0, inwardY, state);
  const atOne = api.geometryPoint(api.VIEW.x1, inwardY, state);
  const radialDistance = (point) => Math.hypot(
    point.x - api.VIEW.width / 2,
    point.y - api.VIEW.centerY
  );
  assert.ok(Math.abs(radialDistance(atZero) - minimum) < 1e-7);
  assert.ok(Math.hypot(atZero.x - atOne.x, atZero.y - atOne.y) < 1e-7);

  const outside = api.geometryPoint(api.VIEW.x0 + api.VIEW.moleculeWidth * 0.37, api.VIEW.centerY + 35, state);
  assert.ok(Math.abs(radialDistance(outside) - (radius + 35)) < 1e-7);

  const path = api.sampledPath(
    api.VIEW.x0,
    api.VIEW.x1,
    () => inwardY,
    5
  );
  assert.doesNotMatch(path, /NaN|Infinity/);
  const points = [...path.matchAll(/[ML](-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g)].map((match) => ({
    x: Number(match[1]),
    y: Number(match[2]),
  }));
  assert.ok(points.length > 20);
  assert.ok(points.every((point) => radialDistance(point) >= minimum - 0.01));

  state.origins = [
    {
      id: "radial-seam-origin",
      position: 0.95,
      startPosition: 0.95,
      leftOffset: 0,
      rightOffset: 0,
    },
  ];
  state.forkTravel = 0.22;
  const model = api.getCircularReplicationModelAtTravel(state.forkTravel, state);
  const innerPath = api.sampledPath(
    api.VIEW.x0,
    api.VIEW.x1,
    (x) => api.templateY(x, "a", model),
    3
  );
  const innerPoints = [...innerPath.matchAll(/[ML](-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g)].map((match) => ({
    x: Number(match[1]),
    y: Number(match[2]),
  }));
  assert.ok(innerPoints.length > 100);
  assert.ok(
    innerPoints.every((point) => radialDistance(point) >= minimum + 1),
    "the inward daughter remains a proper ring instead of collapsing onto the centre guard"
  );
  const seamStart = api.geometryPoint(
    api.VIEW.x0,
    api.templateY(api.VIEW.x0, "a", model),
    state
  );
  const seamEnd = api.geometryPoint(
    api.VIEW.x1,
    api.templateY(api.VIEW.x1, "a", model),
    state
  );
  assert.ok(Math.hypot(seamStart.x - seamEnd.x, seamStart.y - seamEnd.y) < 1e-8);
});

test("partial circular bubbles render daughter base pairs on both sides of genomic zero", () => {
  const state = freshState();
  state.geometry = "circular";
  state.length = 40;
  state.origins = [
    {
      id: "base-pair-seam-origin",
      position: 0.95,
      startPosition: 0.95,
      leftOffset: 0,
      rightOffset: 0,
    },
  ];
  state.forkTravel = 0.22;
  state.cuts = [];
  api.normaliseStateSchema(state);
  api.setState(state);

  const model = api.getCircularReplicationModelAtTravel(state.forkTravel, state);
  assert.ok(model.regions[0].start <= 1e-8);
  assert.ok(model.regions.at(-1).end >= 1 - 1e-8);

  [
    { fraction: 0.9, side: "before zero" },
    { fraction: 0.05, side: "after zero" },
  ].forEach(({ fraction, side }) => {
    const x = api.VIEW.x0 + fraction * api.VIEW.moleculeWidth;
    const replication = api.replicationAt(x, model);
    assert.equal(replication.region?.periodicJoin, true, `${side} uses the joined seam region`);
    assert.ok(replication.profile > 0.9, `${side} is fully inside the daughter envelope`);
    assert.equal(
      api.newDnaVisibleAt(x, replication, model, state),
      true,
      `${side} keeps its daughter base pairs visible`
    );
    assert.ok(
      api.newDnaBasePairGrowthAt(x, replication, model, state) > 0.9,
      `${side} grows daughter base pairs from the matching periodic span`
    );
  });
});

test("free-form pointer projection stays on the same local spline branch during a fork drag", () => {
  const state = freeformState([
    {
      id: "folded-path",
      closed: false,
      genomicLength: 180,
      points: [
        { x: 120, y: 210 },
        { x: 880, y: 210 },
        { x: 900, y: 250 },
        { x: 120, y: 250 },
      ],
    },
  ]);
  api.setState(state);
  const metric = api.freeformMetricById("folded-path", state);
  const pointer = { x: 500, y: 246 };
  const unconstrained = api.projectPointToFreeformMetric(pointer, metric);
  const constrained = api.projectPointToFreeformMetric(pointer, metric, Infinity, {
    referenceLocalPosition: 0.2,
    maximumLocalDelta: 0.09,
  });

  assert.ok(unconstrained && constrained);
  assert.ok(unconstrained.localPosition > 0.55, "the globally nearest point is on the returning branch");
  assert.ok(constrained.localPosition < 0.38, "drag continuity keeps the projection on the original branch");
  assert.ok(Math.abs(constrained.localPosition - 0.2) <= 0.09 + 0.02);
  assert.ok(api.freeformProjectionContinuityWindow(metric, 3) <= 0.05);
  assert.ok(api.freeformProjectionContinuityWindow(metric, 10000) <= 0.05);

  api.setViewState({ zoom: 1, panX: 0, panY: 0 });
  const continuity = {
    startPointerPosition: metric.start + metric.span * 0.2,
    lastFreeformLocalPosition: 0.2,
    lastFreeformArtworkPoint: { x: 120, y: 210 },
  };
  const projected = api.worldPointForFreeformPath(
    pointer,
    metric.id,
    state,
    continuity
  );
  assert.equal(projected.pathId, metric.id);
  assert.ok(
    projected.localPosition <= 0.25 + 1e-8,
    "even a sparse pointer event cannot jump to a distant folded branch"
  );
  assert.ok(continuity.lastFreeformLocalPosition <= 0.25 + 1e-8);
});

test("painted endpoints remain visible snap targets and expose hover feedback", () => {
  const state = freeformState([
    {
      id: "automatic-snap-piece",
      closed: false,
      genomicLength: 80,
      points: [
        { x: 180, y: 300 },
        { x: 520, y: 300 },
      ],
    },
  ]);
  state.freeform.snapToStart = false;
  api.normaliseStateSchema(state);
  api.setState(state);
  api.setViewState({ zoom: 1, panX: 0, panY: 0 });
  api.setFreeformEditor({
    tool: "draw",
    draftPoints: [
      { x: 700, y: 360 },
      { x: 524, y: 302 },
    ],
    selectedPathId: null,
  });
  api.setDragState({ role: "freeform-draw", startEndpoint: null, snapCandidate: null });

  const endpoint = api.nearestConnectableFreeformEndpoint(
    { x: 524, y: 302 },
    state,
    api.getViewState()
  );
  assert.equal(endpoint?.pathId, "automatic-snap-piece");
  assert.equal(endpoint?.end, "end");
  const candidate = api.freeformDraftSnapCandidate(
    api.getFreeformEditor().draftPoints,
    state,
    api.getViewState()
  );
  assert.equal(candidate?.kind, "endpoint");
  assert.equal(candidate?.pathId, "automatic-snap-piece");
  const overlay = api.renderFreeformEditorOverlay();
  assert.equal((overlay.match(/rs-freeform-connectable-endpoint/g) || []).length, 2);
  assert.equal((overlay.match(/rs-freeform-draft-endpoint/g) || []).length, 2);

  api.setDragState(null);
  api.setFreeformEditor({
    tool: "draw",
    draftPoints: [],
    hoverPoint: { x: 524, y: 302 },
    hoverEndpoint: endpoint,
  });
  const hoverOverlay = api.renderFreeformEditorOverlay();
  assert.match(
    hoverOverlay,
    /class="rs-freeform-connectable-endpoint is-active"/,
    "hovering within the paint snap radius highlights the receiving end"
  );
});

test("Paint snaps smoothly between open ends and merges every touched strand", () => {
  const state = freeformState([
    {
      id: "left-piece",
      closed: false,
      genomicLength: 60,
      points: [
        { x: 100, y: 220 },
        { x: 300, y: 220 },
      ],
    },
    {
      id: "right-piece",
      closed: false,
      genomicLength: 60,
      points: [
        { x: 700, y: 220 },
        { x: 900, y: 220 },
      ],
    },
  ]);
  state.freeform.snapToStart = true;
  api.normaliseStateSchema(state);
  api.setState(state);
  api.setViewState({ zoom: 1, panX: 0, panY: 0 });
  api.setFreeformEditor({ tool: "draw", draftPoints: [], selectedPathId: "left-piece" });
  api.setDragState(null);

  const overlay = api.renderFreeformEditorOverlay();
  assert.equal((overlay.match(/rs-freeform-connectable-endpoint/g) || []).length, 4);

  const startEndpoint = api.nearestConnectableFreeformEndpoint(
    { x: 302, y: 221 },
    state,
    api.getViewState()
  );
  assert.equal(startEndpoint.pathId, "left-piece");
  assert.equal(startEndpoint.end, "end");

  const stroke = [
    { ...startEndpoint.point },
    { x: 430, y: 165 },
    { x: 575, y: 170 },
    { x: 698, y: 219 },
  ];
  const snapCandidate = api.freeformDraftSnapCandidate(stroke, state, api.getViewState(), {
    startEndpoint,
  });
  assert.equal(snapCandidate.kind, "endpoint");
  assert.equal(snapCandidate.pathId, "right-piece");
  assert.equal(snapCandidate.end, "start");

  const created = api.addConnectedFreeformStroke(stroke, state, { startEndpoint, snapCandidate });
  assert.ok(created);
  assert.equal(state.freeform.paths.length, 1);
  assert.equal(created.closed, false);
  assert.ok(Math.hypot(created.points[0].x - 100, created.points[0].y - 220) < 1e-7);
  assert.ok(Math.hypot(created.points.at(-1).x - 900, created.points.at(-1).y - 220) < 1e-7);
  assert.equal(state.freeform.paths.some((path) => path.id === "left-piece"), false);
  assert.equal(state.freeform.paths.some((path) => path.id === "right-piece"), false);

  const unit = (dx, dy) => {
    const length = Math.hypot(dx, dy);
    return { x: dx / length, y: dy / length };
  };
  const startDirection = unit(
    created.points[1].x - created.points[0].x,
    created.points[1].y - created.points[0].y
  );
  const endDirection = unit(
    created.points.at(-2).x - created.points.at(-1).x,
    created.points.at(-2).y - created.points.at(-1).y
  );
  assert.ok(startDirection.x > 0.97, "the merged strand leaves its first terminus smoothly");
  assert.ok(endDirection.x < -0.97, "the merged strand reaches its final terminus smoothly");
  const connectedOverlay = api.renderFreeformEditorOverlay();
  assert.equal(
    (connectedOverlay.match(/rs-freeform-connectable-endpoint/g) || []).length,
    2,
    "the merged strand exposes only its two new outer endpoints"
  );

  const metric = api.freeformMetricById(created.id, state);
  state.origins = [{
    id: "bridge-origin",
    position: metric.start + metric.span * 0.5,
    startPosition: metric.start + metric.span * 0.5,
    localPosition: 0.5,
    moleculeId: created.id,
    leftOffset: 0,
    rightOffset: 0,
  }];
  state.forkTravel = metric.span;
  const model = api.getFreeformReplicationModelAtTravel(state.forkTravel, state);
  assert.ok(model.regions.length > 0);
  assert.ok(model.regions.every((region) => region.componentId === created.id));
  assert.ok(model.origins.every((origin) => origin.componentId === created.id));
});

test("Shape snaps an open endpoint smoothly and merges both replication components", () => {
  const state = freeformState([
    {
      id: "shape-source",
      closed: false,
      genomicLength: 60,
      points: [
        { x: 120, y: 330 },
        { x: 492, y: 332 },
      ],
    },
    {
      id: "shape-target",
      closed: false,
      genomicLength: 70,
      points: [
        { x: 500, y: 330 },
        { x: 760, y: 300 },
      ],
    },
  ]);
  state.freeform.snapToStart = true;
  api.normaliseStateSchema(state);
  api.setState(state);
  api.setViewState({ zoom: 1, panX: 0, panY: 0 });

  const candidate = api.freeformShapeSnapCandidate("shape-source", "end", state, api.getViewState());
  assert.ok(candidate);
  assert.equal(candidate.kind, "endpoint");
  assert.equal(candidate.targetEndpoint.pathId, "shape-target");
  assert.equal(candidate.targetEndpoint.end, "start");
  assert.equal(
    api.joinFreeformEndpoints(
      candidate.sourceEndpoint,
      candidate.targetEndpoint,
      state
    ),
    true
  );
  const sourcePath = api.freeformMetricById("shape-source", state).path;
  assert.ok(Math.hypot(sourcePath.points.at(-1).x - 760, sourcePath.points.at(-1).y - 300) < 1e-7);
  assert.ok(
    sourcePath.points.length >= 4,
    "the merged path retains controls on both sides of the smooth connection"
  );
  assert.equal(sourcePath.points[0].x, 120, "the far endpoint x stays fixed");
  assert.equal(sourcePath.points[0].y, 330, "the far endpoint y stays fixed");
  assert.equal(state.freeform.paths.length, 1);
  assert.equal(state.freeform.paths.some((path) => path.id === "shape-target"), false);
  const sourceOutward = {
    x: sourcePath.points.at(-2).x - sourcePath.points.at(-1).x,
    y: sourcePath.points.at(-2).y - sourcePath.points.at(-1).y,
  };
  const sourceLength = Math.hypot(sourceOutward.x, sourceOutward.y);
  assert.ok(sourceOutward.x / sourceLength < -0.97);
});

test("endpoint linking distributes a large tangent change across a smooth approach", () => {
  const state = freeformState([
    {
      id: "turning-source",
      closed: false,
      genomicLength: 80,
      points: [
        { x: 100, y: 320 },
        { x: 492, y: 320 },
      ],
    },
    {
      id: "turning-target",
      closed: false,
      genomicLength: 55,
      points: [
        { x: 500, y: 320 },
        { x: 500, y: 100 },
      ],
    },
  ]);
  api.setState(state);
  assert.equal(
    api.smoothSnappedFreeformEndpoint(
      { pathId: "turning-source", end: "end" },
      { pathId: "turning-target", end: "start" },
      state
    ),
    true
  );
  const sourcePath = state.freeform.paths.find((path) => path.id === "turning-source");
  assert.ok(sourcePath.points.length >= 8, "the connection needs enough ordered controls for a broad turn");
  const sourceMetric = api.freeformMetricById("turning-source", state);
  const targetMetric = api.freeformMetricById("turning-target", state);
  const sourceEnd = api.freeformPointAtFraction(sourceMetric.end, state, sourceMetric.id);
  const targetStart = api.freeformPointAtFraction(targetMetric.start, state, targetMetric.id);
  assert.ok(sourceEnd.tangentX * targetStart.tangentX + sourceEnd.tangentY * targetStart.tangentY > 0.9999);
  const targetPath = state.freeform.paths.find((path) => path.id === "turning-target");
  const sourceHandleLength = Math.hypot(
    sourcePath.points.at(-2).x - sourcePath.points.at(-1).x,
    sourcePath.points.at(-2).y - sourcePath.points.at(-1).y
  );
  const targetHandleLength = Math.hypot(
    targetPath.points[1].x - targetPath.points[0].x,
    targetPath.points[1].y - targetPath.points[0].y
  );
  assert.ok(
    Math.abs(sourceHandleLength - targetHandleLength) < 1e-7,
    "both sides of a snapped connection use matching first spline handles"
  );

  const vectors = sourcePath.points.slice(1).map((point, index) => ({
    x: point.x - sourcePath.points[index].x,
    y: point.y - sourcePath.points[index].y,
  }));
  for (let index = 0; index < vectors.length - 1; index += 1) {
    const scale = Math.max(
      1e-9,
      Math.hypot(vectors[index].x, vectors[index].y) *
        Math.hypot(vectors[index + 1].x, vectors[index + 1].y)
    );
    const alignment =
      (vectors[index].x * vectors[index + 1].x + vectors[index].y * vectors[index + 1].y) /
      scale;
    assert.ok(alignment > -0.1, "the approach must turn progressively instead of folding at one point");
  }

  assert.equal(
    api.joinFreeformEndpoints(
      { pathId: "turning-source", end: "end" },
      { pathId: "turning-target", end: "start" },
      state
    ),
    true
  );
  const joinedPath = state.freeform.paths[0];
  const joinedMetric = api.freeformMetricById(joinedPath.id, state);
  const projectedJoin = api.projectPointToFreeformMetric(
    { x: 500, y: 320 },
    joinedMetric
  );
  assert.ok(
    projectedJoin.distance < 0.5,
    `the merged spline stays on the snapped endpoint (${projectedJoin.distance.toFixed(3)} px)`
  );
  const joinDelta = Math.min(0.004, 5 / joinedMetric.length);
  const beforeJoin = api.freeformPointAtFraction(
    joinedMetric.start + Math.max(0, projectedJoin.localPosition - joinDelta) * joinedMetric.span,
    state,
    joinedMetric.id
  );
  const afterJoin = api.freeformPointAtFraction(
    joinedMetric.start + Math.min(1, projectedJoin.localPosition + joinDelta) * joinedMetric.span,
    state,
    joinedMetric.id
  );
  const joinAlignment =
    beforeJoin.tangentX * afterJoin.tangentX + beforeJoin.tangentY * afterJoin.tangentY;
  assert.ok(joinAlignment > 0.97, "the merged spline turns continuously through the join");
});

test("Paint can close back onto its first point even when it started on another segment", () => {
  const state = freeformState([
    {
      id: "anchor-piece",
      closed: false,
      genomicLength: 50,
      points: [
        { x: 100, y: 300 },
        { x: 300, y: 300 },
      ],
    },
  ]);
  state.freeform.snapToStart = true;
  api.normaliseStateSchema(state);
  api.setState(state);
  api.setViewState({ zoom: 1, panX: 0, panY: 0 });
  const startEndpoint = api.nearestConnectableFreeformEndpoint(
    { x: 300, y: 300 },
    state,
    api.getViewState()
  );
  const stroke = [
    { x: 300, y: 300 },
    { x: 430, y: 210 },
    { x: 520, y: 320 },
    { x: 410, y: 405 },
    { x: 302, y: 302 },
  ];
  const candidate = api.freeformDraftSnapCandidate(stroke, state, api.getViewState(), {
    startEndpoint,
  });
  assert.equal(candidate.kind, "self");
  const loop = api.addConnectedFreeformStroke(stroke, state, {
    startEndpoint,
    snapCandidate: candidate,
  });
  assert.ok(loop?.closed);
  assert.equal(state.freeform.paths.length, 2);
  assert.equal(state.freeform.paths[0].id, "anchor-piece");
});

test("each free-form DNA component completes and terminates its forks independently", () => {
  const state = freeformState(
    [
      {
        id: "short-component",
        closed: false,
        genomicLength: 100,
        points: [
          { x: 100, y: 180 },
          { x: 380, y: 180 },
        ],
      },
      {
        id: "long-component",
        closed: false,
        genomicLength: 300,
        points: [
          { x: 120, y: 430 },
          { x: 980, y: 430 },
        ],
      },
    ],
    [
      {
        id: "short-origin",
        position: 0.125,
        startPosition: 0.125,
        localPosition: 0.5,
        moleculeId: "short-component",
        leftOffset: 0,
        rightOffset: 0,
      },
      {
        id: "long-origin",
        position: 0.625,
        startPosition: 0.625,
        localPosition: 0.5,
        moleculeId: "long-component",
        leftOffset: 0,
        rightOffset: 0,
      },
    ]
  );
  const shortMetric = api.freeformMetricById("short-component", state);
  const longMetric = api.freeformMetricById("long-component", state);
  state.forkTravel = shortMetric.span * 0.6;
  api.setState(state);
  const model = api.getFreeformReplicationModelAtTravel(state.forkTravel, state);
  const shortOrigin = model.origins.find((origin) => origin.id === "short-origin");
  const longOrigin = model.origins.find((origin) => origin.id === "long-origin");

  assert.equal(shortOrigin.leftActive, false);
  assert.equal(shortOrigin.rightActive, false);
  assert.equal(longOrigin.leftActive, true);
  assert.equal(longOrigin.rightActive, true);

  const byComponent = new Map();
  model.regions.forEach((region) => {
    if (!byComponent.has(region.componentId)) byComponent.set(region.componentId, []);
    byComponent.get(region.componentId).push(region);
    const metric = region.componentId === shortMetric.id ? shortMetric : longMetric;
    assert.ok(region.start >= metric.start - 1e-10);
    assert.ok(region.end <= metric.end + 1e-10);
  });
  const shortCoverage = byComponent.get(shortMetric.id).reduce(
    (sum, region) => sum + region.end - region.start,
    0
  );
  const longCoverage = byComponent.get(longMetric.id).reduce(
    (sum, region) => sum + region.end - region.start,
    0
  );
  assert.ok(Math.abs(shortCoverage - shortMetric.span) < 1e-8);
  assert.ok(longCoverage > 0 && longCoverage < longMetric.span);
});
