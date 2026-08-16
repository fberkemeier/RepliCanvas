const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const sourcePath = path.join(__dirname, "..", "assets", "js", "replisketch.js");
const cssPath = path.join(__dirname, "..", "assets", "css", "replisketch.css");
const htmlPath = path.join(__dirname, "..", "index.html");
const source = fs.readFileSync(sourcePath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");
const html = fs.readFileSync(htmlPath, "utf8");
const testApi = `
  globalThis.__replisketchTest = {
    VIEW,
    MAX_BASE_PAIR_COUNT,
    GRID_COLUMN_COUNT,
    MIN_ZOOM,
    advanceForkPlayback,
    applyForkDragPosition,
    applyOriginDragPosition,
    artworkAspectTransform,
    artworkAspectX,
    artworkAspectY,
    artworkMarkup,
    backgroundLuminance,
    basePairColorMode,
    basePairCount,
    basePairIdentity,
    basePairLineColors,
    basePairDistanceFade,
    basePairDisplayStep,
    basePairFraction,
    basePairLattice,
    basePairResolution,
    basePairStepFraction,
    basePairForkDistanceFade,
    basePairForkInfluence,
    basePairTransitionInfluence,
    boundedControlValue,
    boundedLengthValue,
    bubbleFromBounds,
    canvasGridColor,
    canvasInkColor,
    configurationDocument,
    connectedStrandShiftFraction,
    crossoverClipHalfWidth,
    crossoverSites,
    cutRange,
    daughterDetailFade,
    doubleStrandHalfHeight,
    discreteAnimationEnabled,
    drawVideoFrame,
    displayedBasePairPositions,
    effectiveForkTravel,
    encodeMp4WithMediabunnyCodec,
    findForkTravelForReplicatedFraction,
    fixedUiTransform,
    fixedVideoSvgSource,
    forkCompletionTravel,
    forkDescriptors,
    forkTravelBounds,
    forksShouldCollapse,
    getReplicationModel,
    getReplicationModelAtTravel,
    genomicPositionAtFraction,
    helixWave,
    insetBasePairSegment,
    interactionHalfHeight,
    isCutGap,
    makeVideoExportState,
    maximumLengthForBasePairCount,
    makeDefaultState,
    makeOrigins,
    mergeOverlappingBubbleState,
    mergeOverlappingBubbleDuringDrag,
    minimalReplicationAt,
    modelSupportsDoubleStrandDetails,
    nascentSpan,
    newDnaDistanceInset,
    newDnaStartDistance,
    newDnaVisibleAt,
    nascentY,
    niceIntegerCeiling,
    normaliseStateSchema,
    normaliseCutRegions,
    nextAvailableOriginId,
    nativeWebmMimeTypes,
    parentalPairFade,
    parseConfigurationText,
    playbackSpeed,
    overlappingBubbleCluster,
    rawBubbleBounds,
    rebaseOriginDragAfterMerge,
    replicationAt,
    replicationPathSampling,
    replicationTransitionAnchors,
    replicationModelForPercentage,
    replicatedFraction,
    renderBasePairLine,
    renderBasePairs,
    renderNascentDna,
    reseedNextOriginId,
    remuxWebmToMp4,
    rulerBasePairPosition,
    rulerMajorEvery,
    rulerTickIndices,
    rulerTickPosition,
    sampledPath,
    schematicNascentStartProfile,
    requestAnimationSaveHandle,
    saveMp4Blob,
    saveMp4ToHandle,
    screenToWorld,
    setDragState(value) { dragState = value; },
    setElements(value) { Object.assign(elements, value); },
    setSPhaseTime,
    selectedForkDescriptor,
    setState(value) { state = value; },
    setVideoExportBusy,
    setViewState(value) { viewState = value; },
    shouldMergeCompletedBubbleDrag,
    smoothRunPath,
    snapEditingEnabled,
    snapForkTravel,
    snapFractionToBasePair,
    strandModel,
    strandPhaseShift,
    supportedMp4MimeType,
    synchroniseSPhaseFromGeometry,
    templateY,
    terminalClosureBoundaryForFork,
    terminalEdgeBlend,
    terminalPullSpan,
    terminalSmoothing,
    terminalSmoothingLabel,
    transitionProfile,
    transitionTightness,
    transitionTightnessLabel,
    regionEdgeTransitionWidth,
    regionTransitionWidth,
    visualReplicationAt,
    videoFramePlan,
    videoTravelAtFrame,
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
const api = sandbox.__replisketchTest;

function freshState() {
  const state = api.makeDefaultState();
  state.playing = false;
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
    advanced: { terminalSmoothing: -10, transitionTightness: -1000 },
  });
  assert.equal(low.length, 10);
  assert.equal(low.progress, 0);
  assert.equal(low.pairResolution, 1);
  assert.equal(low.basePairWidth, 0.2);
  assert.equal(low.weight, 1);
  assert.equal(low.daughterSpacing, 64);
  assert.equal(low.doubleStrandHeight, 8);
  assert.equal(low.speed, 0.25);
  assert.equal(low.advanced.terminalSmoothing, 0);
  assert.equal(low.advanced.transitionTightness, -100);

  const high = api.normaliseStateSchema({
    length: 1000,
    progress: 101,
    pairResolution: 100,
    basePairWidth: 20,
    weight: 20,
    daughterSpacing: 1000,
    doubleStrandHeight: 100,
    speed: 50,
    advanced: { terminalSmoothing: 99, transitionTightness: 1000 },
  });
  assert.equal(high.length, 225);
  assert.equal(high.progress, 100);
  assert.equal(high.pairResolution, 10);
  assert.equal(high.basePairWidth, 7);
  assert.equal(high.weight, 8);
  assert.equal(high.daughterSpacing, 400);
  assert.equal(high.doubleStrandHeight, 56);
  assert.equal(high.speed, 5);
  assert.equal(high.advanced.terminalSmoothing, 6);
  assert.equal(high.advanced.transitionTightness, 100);

  const invalid = api.normaliseStateSchema({
    length: "invalid",
    progress: NaN,
    pairResolution: null,
    basePairWidth: undefined,
    weight: Infinity,
    daughterSpacing: "invalid",
    doubleStrandHeight: NaN,
    speed: 0,
    advanced: { terminalSmoothing: "invalid", transitionTightness: "invalid" },
  });
  assert.equal(invalid.length, 90);
  assert.equal(invalid.progress, 12);
  assert.equal(invalid.pairResolution, 1);
  assert.equal(invalid.basePairWidth, 1.8);
  assert.equal(invalid.weight, 4);
  assert.equal(invalid.daughterSpacing, 152);
  assert.equal(invalid.doubleStrandHeight, 24);
  assert.equal(invalid.speed, 1);
  assert.equal(invalid.advanced.terminalSmoothing, 1.5);
  assert.equal(invalid.advanced.transitionTightness, 0);

  assert.equal(api.playbackSpeed({ speed: -1 }), 1, "legacy non-positive speeds use the default");
  assert.equal(api.playbackSpeed({ speed: 99 }), 5);
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
  assert.match(api.artworkAspectTransform(), /scale\(1\.5000 0\.7500\)/);
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
  assert.match(video.source, /transform="translate\(600\.0 310\.0\) scale\(1\.5000 0\.7500\)/);
  assert.match(source, /id="rs-artwork-aspect" transform="\$\{artworkAspectTransform\(\)\}"/);
  assert.match(source, /querySelector\("#rs-artwork-aspect"\)\?\.getScreenCTM\(\)/);

  state.advanced.aspectX = 99;
  state.advanced.aspectY = 0.1;
  api.normaliseStateSchema(state);
  assert.equal(state.advanced.aspectX, 2);
  assert.equal(state.advanced.aspectY, 0.5);
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

test("terminal smoothing is measured on the parity-aware displayed base-pair lattice", () => {
  const state = freshState();
  state.length = 90;
  state.pairResolution = 3;
  state.advanced.terminalSmoothing = 1.5;
  api.setState(state);

  const defaultLattice = api.basePairLattice(state);
  const defaultSpan = api.terminalPullSpan(0.5, "right", state);
  assert.equal(api.terminalSmoothing(state), 1.5);
  assert.equal(api.terminalSmoothingLabel(state), "1.5 bp");
  assert.ok(
    Math.abs(defaultSpan - (1.5 * api.VIEW.moleculeWidth) / defaultLattice.subdivisionCount) < 1e-12
  );
  const crossoverCount = defaultLattice.subdivisionCount / (state.pairResolution + 1);
  const legacyHalfCrossoverSpan = api.VIEW.moleculeWidth / (crossoverCount * 2);
  assert.ok(defaultSpan < legacyHalfCrossoverSpan, "the new default should begin closer than the former pull");
  assert.ok(Math.abs(defaultSpan / legacyHalfCrossoverSpan - 0.75) < 1e-12);

  state.length = 180;
  const longerGenomeSpan = api.terminalPullSpan(0.5, "right", state);
  assert.ok(Math.abs(longerGenomeSpan - defaultSpan / 2) < 1e-12);

  state.length = 90;
  state.pairResolution = 1;
  const lowResolutionSpan = api.terminalPullSpan(0.5, "right", state);
  assert.ok(Math.abs(lowResolutionSpan - defaultSpan * 2) < 1e-12);

  state.pairResolution = 2;
  const evenLattice = api.basePairLattice(state);
  const evenSpan = api.terminalPullSpan(0.37, "right", state);
  assert.equal(evenLattice.edgeOffset, 0.5);
  assert.ok(
    Math.abs((evenSpan * evenLattice.subdivisionCount) / api.VIEW.moleculeWidth - 1.5) < 1e-12,
    "the centred half-step edge inset must not distort the configured genomic distance"
  );
  assert.equal(evenSpan, api.terminalPullSpan(0.37, "left", state));
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

test("unequal bubbles share only their facing geometry in the final merge zone", () => {
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

  const wideFacingWidth = api.regionEdgeTransitionWidth(wide, "end", model, state);
  const narrowFacingWidth = api.regionEdgeTransitionWidth(narrow, "start", model, state);
  assert.ok(wide.endBlend > 0.5 && narrow.startBlend > 0.5, "forks must be in the final pull zone");
  assert.ok(Math.abs(wideFacingWidth - narrowFacingWidth) < 1e-9);
  assert.ok(Math.abs(wideFacingWidth - narrowOwnWidth) < 1e-9);

  const earlyWide = { ...wide, endBlend: 0.25 };
  const earlyNarrow = { ...narrow, startBlend: 0.25 };
  const earlyModel = { ...model, regions: [earlyWide, earlyNarrow] };
  const earlyWideFacingWidth = api.regionEdgeTransitionWidth(earlyWide, "end", earlyModel, state);
  assert.ok(
    Math.abs(earlyWideFacingWidth - (wideOwnWidth + narrowOwnWidth) / 2) < 1e-9,
    "shared geometry should ease in rather than snapping at the start of the terminal pull"
  );

  const leftEdgeX = api.VIEW.x0 + wide.end * api.VIEW.moleculeWidth;
  const rightEdgeX = api.VIEW.x0 + narrow.start * api.VIEW.moleculeWidth;
  const meetingX = (leftEdgeX + rightEdgeX) / 2;
  const sampling = api.replicationPathSampling(model);
  assert.ok(
    sampling.localWindows.some(
      (window) => Math.abs(window.fromX - leftEdgeX) < 1e-8 && Math.abs(window.toX - rightEdgeX) < 1e-8
    ),
    "the closing gap should switch to a symmetric local sample lattice"
  );

  for (const offset of [0, (rightEdgeX - leftEdgeX) / 4, (rightEdgeX - leftEdgeX) / 2, 8, 12]) {
    const leftY = api.templateY(meetingX - offset, "a", model);
    const rightY = api.templateY(meetingX + offset, "a", model);
    assert.ok(Math.abs(leftY - rightY) < 1e-8, `merge envelope differs at ${offset}px`);
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

test("minimal lines keep an approaching merge gap closed until the forks make contact", () => {
  const state = freshState();
  state.advanced.strandModel = "minimal";
  state.origins = [
    { id: "strict-left", position: 0.25, startPosition: 0.25, leftOffset: 0, rightOffset: 0 },
    { id: "strict-right", position: 0.75, startPosition: 0.75, leftOffset: 0, rightOffset: 0 },
  ];
  const gap = 5;
  state.forkTravel =
    (state.origins[1].startPosition - state.origins[0].startPosition - gap / api.VIEW.moleculeWidth) / 2;
  api.setState(state);

  const beforeContact = api.getReplicationModel();
  const leftEdgeX = api.VIEW.x0 + beforeContact.regions[0].end * api.VIEW.moleculeWidth;
  const rightEdgeX = api.VIEW.x0 + beforeContact.regions[1].start * api.VIEW.moleculeWidth;
  assert.ok(beforeContact.regions[0].endBlend > 0, "fixture must be inside the former visual-bridge zone");

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

  state.forkTravel = 0.25;
  api.setState(state);
  const atContact = api.getReplicationModel();
  const meetingX = api.VIEW.x0 + api.VIEW.moleculeWidth / 2;
  assert.equal(atContact.regions.length, 1);
  assert.ok(api.templateY(meetingX, "a", atContact) < api.VIEW.centerY - state.daughterSpacing * 0.45);
  assert.ok(api.templateY(meetingX, "b", atContact) > api.VIEW.centerY + state.daughterSpacing * 0.45);
});

test("minimal lines keep a chromosome tail closed until the fork reaches the end", () => {
  const state = freshState();
  state.advanced.strandModel = "minimal";
  state.origins = [{ id: "strict-end", position: 0.5, startPosition: 0.5, leftOffset: 0, rightOffset: 0 }];
  const tail = 4;
  state.forkTravel = 0.5 - tail / api.VIEW.moleculeWidth;
  api.setState(state);

  const beforeEnd = api.getReplicationModel();
  const edgeX = api.VIEW.x0 + beforeEnd.regions[0].end * api.VIEW.moleculeWidth;
  assert.ok(beforeEnd.regions[0].endBlend > 0, "fixture must be inside the terminal pull zone");
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

  state.forkTravel = 0.5;
  api.setState(state);
  const atEnd = api.getReplicationModel();
  assert.equal(atEnd.regions[0].openEnd, true);
  assert.ok(api.templateY(api.VIEW.x1, "a", atEnd) < api.VIEW.centerY - state.daughterSpacing * 0.45);
  assert.ok(api.templateY(api.VIEW.x1, "b", atEnd) > api.VIEW.centerY + state.daughterSpacing * 0.45);
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
    assert.equal(fallback.travelPerFrame, plan.travelPerFrame);
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

test("MP4 export asks for a filename first and falls back to a browser download where needed", async () => {
  let pickerOptions = null;
  const writes = [];
  const handle = {
    async createWritable() {
      return {
        async write(blob) { writes.push(blob); },
        async close() { writes.push("closed"); },
      };
    },
  };
  sandbox.window.showSaveFilePicker = async (options) => {
    pickerOptions = options;
    return handle;
  };
  const link = {
    hidden: true,
    removeAttribute(name) { delete this[name]; },
    click() {},
  };
  sandbox.URL = {
    createObjectURL() { return "blob:replisketch-video"; },
    revokeObjectURL() {},
  };
  api.setElements({ videoSaveLink: link });

  const selected = await api.requestAnimationSaveHandle("replisketch.mp4");
  assert.equal(selected.handle, handle);
  assert.equal(selected.cancelled, false);
  assert.equal(selected.supported, true);
  assert.equal(pickerOptions.suggestedName, "replisketch.mp4");
  assert.equal(Array.from(pickerOptions.types[0].accept["video/mp4"]).join(","), ".mp4");

  const blob = new Blob(["mp4"], { type: "video/mp4" });
  assert.equal(await api.saveMp4Blob(blob, "replisketch.mp4", handle), "file");
  assert.equal(writes[0], blob);
  assert.equal(writes[1], "closed");

  delete sandbox.window.showSaveFilePicker;
  let clicked = 0;
  link.click = () => { clicked += 1; };
  assert.equal(api.saveMp4Blob(blob, "replisketch.mp4"), "download");
  assert.equal(link.href, "blob:replisketch-video");
  assert.equal(link.download, "replisketch.mp4");
  assert.equal(link.hidden, false);
  assert.equal(clicked, 1);
  assert.match(source, /showSaveFilePicker/);
});

test("MP4 busy state changes Download to Generating and restores it", () => {
  const attributes = {};
  const label = { textContent: "Download" };
  const downloadButton = {
    disabled: false,
    setAttribute(name, value) {
      attributes[name] = value;
    },
  };
  const canvasFrame = {
    toggleAttribute(name, value) {
      attributes[name] = value;
    },
  };
  const spinner = { hidden: true };
  api.setElements({
    canvasFrame,
    downloadButton,
    downloadButtonLabel: label,
    downloadButtonSpinner: spinner,
    exportMp4Button: { disabled: false },
  });

  api.setVideoExportBusy(true);
  assert.equal(label.textContent, "Generating...");
  assert.equal(downloadButton.disabled, true);
  assert.equal(spinner.hidden, false);
  assert.equal(attributes["aria-busy"], true);

  api.setVideoExportBusy(false);
  assert.equal(label.textContent, "Download");
  assert.equal(downloadButton.disabled, false);
  assert.equal(spinner.hidden, true);
  assert.equal(attributes["aria-busy"], false);
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
  for (const id of [
    "aspectControls",
    "aspectNarrowButton",
    "aspectWidenButton",
    "aspectResetButton",
    "aspectShorterButton",
    "aspectTallerButton",
    "aspectOutput",
  ]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(css, /\.rs-canvas-frame:hover \.rs-aspect-controls/);
  assert.match(css, /\.rs-aspect-controls:focus-within/);
  assert.match(css, /@media \(hover: none\)[\s\S]*\.rs-aspect-controls/);
});

test("all range controls expose the expanded safe contracts and correct initial readouts", () => {
  const contracts = {
    progressControl: ["0", "100", "1"],
    speedControl: ["0.25", "5", "0.25"],
    lengthControl: ["10", "625", "5"],
    pairResolutionControl: ["1", "10", "1"],
    basePairWidthControl: ["0.2", "7", "0.1"],
    weightControl: ["1", "8", "0.5"],
    daughterSpacingControl: ["64", "400", "4"],
    doubleStrandHeightControl: ["8", "56", "2"],
    transitionTightnessControl: ["-100", "100", "1"],
    terminalSmoothingControl: ["0", "6", "0.25"],
    newDnaStartDistanceControl: ["0", "20", "0.25"],
    strandPhaseShiftControl: ["-5", "5", "0.25"],
  };

  for (const [id, [minimum, maximum, step]] of Object.entries(contracts)) {
    const tag = html.match(new RegExp(`<input[^>]*id="${id}"[^>]*>`))?.[0];
    assert.ok(tag, `${id} must exist`);
    assert.match(tag, new RegExp(`min="${minimum.replace(".", "\\.")}"`));
    assert.match(tag, new RegExp(`max="${maximum.replace(".", "\\.")}"`));
    assert.match(tag, new RegExp(`step="${step.replace(".", "\\.")}"`));
  }

  assert.match(html, /id="lengthOutput"[^>]*>72 bp</);
  assert.match(html, /id="lengthStat"[^>]*>72 bp</);
  assert.match(html, /id="pairResolutionOutput"[^>]*>3 between crossovers</);
  assert.match(html, /id="terminalSmoothingOutput"[^>]*>1\.5 bp</);
  assert.match(html, /id="newDnaStartDistanceOutput"[^>]*>0 bp</);
  assert.match(html, /id="strandPhaseShiftOutput"[^>]*>0 bp</);
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
  assert.match(html, /class="rs-project-link"[\s\S]*href="https:\/\/github\.com\/fberkemeier\/RepliSketch"/);
  assert.match(html, /href="https:\/\/github\.com\/fberkemeier\/RepliSketch#readme"[\s\S]*aria-label="Documentation"/);
  assert.match(html, /href="https:\/\/github\.com\/fberkemeier\/RepliSketch\/issues\/new"[\s\S]*aria-label="Raise an issue"/);
  assert.match(html, /class="rs-project-version">v1\.1\.0<\/span>/);
  assert.match(css, /\.rs-project-version\s*\{[^}]*color:\s*var\(--rs-template-a\)/s);
  assert.doesNotMatch(html, /<div class="rs-brand">[\s\S]*?rs-project-meta[\s\S]*?<\/div>\s*<div class="rs-top-actions"/);
  assert.match(
    html,
    /class="rs-status-copy"[\s\S]*id="selectionMessage"[\s\S]*rs-status-separator[\s\S]*id="statusMessage"/
  );
  assert.match(html, /class="rs-project-meta rs-status-project-meta"/);
  assert.match(html, /id="projectMenuButton"[\s\S]*aria-controls="projectMenu"/);
  assert.match(html, /id="projectMenu"[\s\S]*GitHub[\s\S]*Documentation[\s\S]*Raise an issue[\s\S]*Theme/);
  const lightbulbs = html.match(/M9 18h6M10 22h4M8\.5 15\.5/g) || [];
  assert.equal(lightbulbs.length, 2, "issue links in the menu and status bar must both use light bulbs");
  assert.match(html, /rs-guide-fork[\s\S]*Drag fork/);
});

test("browser metadata and configuration file actions are exposed accessibly", () => {
  assert.match(html, /<title>RepliSketch<\/title>/);
  assert.match(html, /<link[^>]*rel="icon"[^>]*type="image\/png"[^>]*href="assets\/img\/logo_small\.png"/);
  assert.ok(fs.existsSync(path.join(__dirname, "..", "assets", "img", "logo_small.png")));
  assert.match(html, /id="saveConfigButton"[^>]*aria-label="Save configuration"/);
  assert.match(html, /id="loadConfigButton"[^>]*aria-label="Load configuration"/);
  assert.match(
    html,
    /id="configFileInput"[^>]*type="file"[^>]*accept="\.replisketch\.json,\.json,application\/json"[^>]*hidden/
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

  assert.equal(documentState.format, "RepliSketch");
  assert.equal(documentState.schemaVersion, 1);
  assert.equal(documentState.appVersion, "1.0.0");
  assert.equal(loaded.length, 135);
  assert.equal(loaded.speed, 2.25);
  assert.equal(loaded.discreteAnimation, true);
  assert.equal(loaded.colors.newDna, "#123abc");
  assert.equal(loaded.colors.adenine, "#aa1122");
  assert.equal(loaded.basePairColorMode, "bases");
  assert.equal(loaded.basePairSeed, 987654321);
  assert.equal(loaded.advanced.newDnaStartDistance, 4.25);
  assert.equal(loaded.advanced.strandPhaseShift, -1.5);
  assert.equal(loaded.advanced.includeExportBackground, true);
  assert.equal(loaded.advanced.snapToBasePairs, true);
  assert.equal(loaded.advanced.aspectX, 1.4);
  assert.equal(loaded.advanced.aspectY, 0.8);
  assert.equal(loaded.origins[0].leftOffset, 0.125);
  assert.equal(loaded.cuts[0].start, 0.2);
  assert.equal(loaded.selectedOriginId, state.origins[1].id);
  assert.equal(loaded.playing, false);
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
    /newer RepliSketch version/
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
  assert.match(source, /background\.setAttribute\("fill", state\.advanced\.backgroundColor/);
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

test("base-pair colour modes preserve complementary A-T and G-C pairing with a stable shuffled sequence", () => {
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
  assert.equal((twoColourLine.match(/<line\b/g) || []).length, 2);
  assert.match(twoColourLine, /data-pair="A-T"/);
  assert.match(twoColourLine, /stroke="#aa0000"/);
  assert.match(twoColourLine, /stroke="#00aa00"/);
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

  state.advanced.aspectX = 1;
  const normalClip = api.crossoverClipHalfWidth(1.8, 7, state);
  state.advanced.aspectX = 2;
  const widenedClip = api.crossoverClipHalfWidth(1.8, 7, state);
  assert.ok(Math.abs(widenedClip * 2 - normalClip) < 1e-12, "clip width must counteract horizontal aspect scaling");
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
  assert.match(source, /VIEW\.x0 \+ VIEW\.moleculeWidth \/ GRID_COLUMN_COUNT/);
  assert.match(source, /const anchor = transformedSvgPoint\(VIEW\.x0/);
  assert.doesNotMatch(source, /--rs-grid-x[^\n]*basePairResolution/);
});

test("playback, project, aspect, and control-guide layout matches the refined interface", () => {
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
  assert.doesNotMatch(guide, /Wheel zoom/);

  assert.match(css, /\.rs-zoom-controls\s*\{[\s\S]*?width:\s*154px;/);
  assert.match(css, /\.rs-aspect-controls\s*\{[^}]*top:\s*52px;[^}]*right:\s*12px;[^}]*width:\s*154px;/s);
  assert.match(source, /const MIN_ZOOM = 0\.1/);
});
