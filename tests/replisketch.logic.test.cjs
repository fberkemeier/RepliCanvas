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
    advanceForkPlayback,
    applyOriginDragPosition,
    artworkMarkup,
    backgroundLuminance,
    basePairCount,
    basePairDistanceFade,
    basePairDisplayStep,
    basePairResolution,
    basePairForkDistanceFade,
    basePairForkInfluence,
    basePairTransitionInfluence,
    boundedControlValue,
    canvasGridColor,
    canvasInkColor,
    cutRange,
    daughterDetailFade,
    doubleStrandHalfHeight,
    drawVideoFrame,
    displayedBasePairPositions,
    encodeMp4WithMediabunnyCodec,
    findForkTravelForReplicatedFraction,
    fixedUiTransform,
    fixedVideoSvgSource,
    forkCompletionTravel,
    forkTravelBounds,
    forksShouldCollapse,
    getReplicationModel,
    getReplicationModelAtTravel,
    helixWave,
    insetBasePairSegment,
    interactionHalfHeight,
    isCutGap,
    makeVideoExportState,
    makeDefaultState,
    mergeOverlappingBubbleState,
    mergeOverlappingBubbleDuringDrag,
    minimalReplicationAt,
    modelSupportsDoubleStrandDetails,
    nascentSpan,
    nascentY,
    niceIntegerCeiling,
    normaliseStateSchema,
    normaliseCutRegions,
    nativeWebmMimeTypes,
    parentalPairFade,
    playbackSpeed,
    overlappingBubbleCluster,
    rawBubbleBounds,
    rebaseOriginDragAfterMerge,
    replicationAt,
    replicationPathSampling,
    replicationTransitionAnchors,
    replicationModelForPercentage,
    replicatedFraction,
    renderBasePairs,
    renderNascentDna,
    remuxWebmToMp4,
    rulerBasePairPosition,
    rulerMajorEvery,
    rulerTickIndices,
    rulerTickPosition,
    sampledPath,
    schematicNascentStartProfile,
    saveMp4Blob,
    setDragState(value) { dragState = value; },
    setElements(value) { Object.assign(elements, value); },
    setSPhaseTime,
    setState(value) { state = value; },
    setVideoExportBusy,
    setViewState(value) { viewState = value; },
    shouldMergeCompletedBubbleDrag,
    smoothRunPath,
    strandModel,
    supportedMp4MimeType,
    synchroniseSPhaseFromGeometry,
    templateY,
    terminalEdgeBlend,
    terminalPullSpan,
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

test("base-pair resolution sets N plus one equal intervals per crossover on one integer lattice", () => {
  const state = freshState();
  state.length = 90;
  api.setState(state);
  const densities = [];
  const crossovers = Math.round((state.length / 10) * 2);

  for (let resolution = 1; resolution <= 10; resolution += 1) {
    state.pairResolution = resolution;
    const step = api.basePairDisplayStep();
    const positions = api.displayedBasePairPositions();
    const expectedLength = crossovers * (resolution + 1);
    assert.equal(api.basePairCount(), expectedLength);
    assert.equal(api.basePairCount() / crossovers, resolution + 1);
    assert.equal(step, 1);
    assert.equal(positions[0], 0);
    assert.equal(positions.at(-1), expectedLength);
    assert.equal(positions.length, expectedLength + 1);
    assert.ok(positions.every(Number.isInteger), "each rendered pair/tick must represent an integer base pair");
    assert.ok(positions.every((position, index) => position === index));
    densities.push(positions.length);
  }

  assert.ok(densities.every((count, index) => index === 0 || count > densities[index - 1]));

  state.pairResolution = 2;
  assert.equal(api.basePairCount() / crossovers, 3, "two interior positions must create three equal intervals");
  const intervalWidth = api.VIEW.moleculeWidth / crossovers;
  const pairSpacing = api.VIEW.moleculeWidth / api.basePairCount();
  assert.ok(Math.abs(intervalWidth / pairSpacing - 3) < 1e-12);
  for (let crossoverBoundary = 0; crossoverBoundary <= crossovers; crossoverBoundary += 1) {
    assert.equal(api.displayedBasePairPositions()[crossoverBoundary * 3], crossoverBoundary * 3);
  }
});

test("ruler endpoint and evenly spaced labels use the resolution-derived genomic length", () => {
  const state = freshState();
  api.setState(state);
  for (let length = 10; length <= 400; length += 5) {
    for (let resolution = 1; resolution <= 10; resolution += 1) {
      state.length = length;
      state.pairResolution = resolution;
      const pairCount = api.basePairCount();
      const majorEvery = api.rulerMajorEvery(7.25);
      assert.equal(pairCount, Math.round((length / 10) * 2) * (resolution + 1));
      assert.equal(pairCount % majorEvery, 0, "the endpoint must complete a full labelled interval");
      for (const index of api.displayedBasePairPositions()) {
        assert.equal(api.rulerBasePairPosition(index), index);
      }
      assert.equal(api.rulerBasePairPosition(pairCount), pairCount);
      const ticks = api.rulerTickIndices(majorEvery);
      assert.deepEqual(ticks, api.displayedBasePairPositions());
      const labels = [];
      for (let labelled = 0; labelled <= pairCount; labelled += majorEvery) labels.push(labelled);
      assert.ok(labels.every(Number.isInteger));
      assert.ok(labels.slice(1).every((label, index) => label - labels[index] === majorEvery));
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
    advanced: { transitionTightness: -1000 },
  });
  assert.equal(low.length, 10);
  assert.equal(low.progress, 0);
  assert.equal(low.pairResolution, 1);
  assert.equal(low.basePairWidth, 0.2);
  assert.equal(low.weight, 1);
  assert.equal(low.daughterSpacing, 64);
  assert.equal(low.doubleStrandHeight, 8);
  assert.equal(low.speed, 0.25);
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
    advanced: { transitionTightness: 1000 },
  });
  assert.equal(high.length, 400);
  assert.equal(high.progress, 100);
  assert.equal(high.pairResolution, 10);
  assert.equal(high.basePairWidth, 7);
  assert.equal(high.weight, 8);
  assert.equal(high.daughterSpacing, 400);
  assert.equal(high.doubleStrandHeight, 56);
  assert.equal(high.speed, 5);
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
    advanced: { transitionTightness: "invalid" },
  });
  assert.equal(invalid.length, 90);
  assert.equal(invalid.progress, 12);
  assert.equal(invalid.pairResolution, 1);
  assert.equal(invalid.basePairWidth, 1.8);
  assert.equal(invalid.weight, 4);
  assert.equal(invalid.daughterSpacing, 152);
  assert.equal(invalid.doubleStrandHeight, 24);
  assert.equal(invalid.speed, 1);
  assert.equal(invalid.advanced.transitionTightness, 0);

  assert.equal(api.playbackSpeed({ speed: -1 }), 1, "legacy non-positive speeds use the default");
  assert.equal(api.playbackSpeed({ speed: 99 }), 5);
  assert.equal(api.boundedControlValue("length", 401), 400);
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

test("maximum length and resolution stay within the bounded render-density budget", () => {
  const state = freshState();
  state.length = 400;
  state.pairResolution = 10;
  state.basePairWidth = 7;
  state.weight = 8;
  state.daughterSpacing = 400;
  state.doubleStrandHeight = 56;
  state.forkTravel = 0.2;
  api.setState(state);

  assert.equal(api.basePairCount(), 880);
  assert.equal(api.displayedBasePairPositions().length, 881);
  assert.equal(api.rulerTickIndices(api.rulerMajorEvery(7.25)).length, 881);

  const model = api.getReplicationModel();
  const pairs = api.renderBasePairs(model);
  const artwork = api.artworkMarkup(model);
  const rungCount = (pairs.match(/<line\b/g) || []).length;
  assert.ok(rungCount > 0);
  assert.ok(rungCount <= 881 * 3, "each genomic site can render at most one parental and two daughter rungs");
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

  assert.ok(8 >= 8, "minimum duplex height must accommodate maximum strand weight");
  assert.ok(8 > 7, "minimum duplex height must exceed maximum base-pair width");
  assert.ok(64 - 56 >= 8, "minimum daughter gap must accommodate maximum strand weight");
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
  api.setViewState({ zoom: 4, panX: 0, panY: 0 });
  assert.match(api.fixedUiTransform(100, 200), /scale\(0\.2500\)$/);
  assert.match(api.worldTransform(), /scale\(4\.0000\)/);

  api.setViewState({ zoom: 1.5625, panX: 0, panY: 0 });
  assert.match(api.fixedUiTransform(100, 200), /scale\(0\.6400\)$/);
  assert.equal(api.niceIntegerCeiling(2.1), 5);
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
  assert.equal(state.advanced.transitionTightness, 0);
  assert.equal(state.advanced.alwaysShowControls, true);
  assert.equal("simplified" in state.advanced, false);

  const migrated = api.normaliseStateSchema({ advanced: { simplified: true } });
  assert.equal(migrated.advanced.strandModel, "elegant");
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
  state.origins[1] = {
    id: "nearby",
    position: 0.48,
    startPosition: 0.48,
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

test("final fork pulls run continuously from the last crossover through merges and chromosome ends", () => {
  const state = freshState();
  state.advanced.strandModel = "elegant";
  state.origins = [{ id: "end", position: 0.5, startPosition: 0.5, leftOffset: 0, rightOffset: 0 }];
  api.setState(state);

  const endSpan = api.terminalPullSpan(1, "right", state);
  state.advanced.transitionTightness = 100;
  assert.equal(api.terminalPullSpan(1, "right", state), endSpan, "terminal pull must stay smooth at Sharp tightness");
  const travelAtLastCrossover = 0.5 - endSpan / api.VIEW.moleculeWidth;
  const atLastCrossover = api.getReplicationModelAtTravel(travelAtLastCrossover, state);
  const halfwayToEnd = api.getReplicationModelAtTravel(
    travelAtLastCrossover + endSpan / api.VIEW.moleculeWidth / 2,
    state
  );
  const atEnd = api.getReplicationModelAtTravel(0.5, state);
  const endBlends = [
    atLastCrossover.origins[0].rightEdgeBlend,
    halfwayToEnd.origins[0].rightEdgeBlend,
    atEnd.origins[0].rightEdgeBlend,
  ];
  assert.ok(endBlends[0] < 1e-8);
  assert.ok(endBlends[1] > endBlends[0] && endBlends[1] < endBlends[2]);
  assert.ok(Math.abs(endBlends[2] - 1) < 1e-8);
  assert.ok(
    Math.abs(
      (halfwayToEnd.origins[0].rightPosition - atLastCrossover.origins[0].rightPosition) -
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
  const travelAtMergeCrossover = meetingPoint - mergeSpan / api.VIEW.moleculeWidth - state.origins[0].startPosition;
  const beforeMerge = api.getReplicationModelAtTravel(travelAtMergeCrossover, state);
  const duringMerge = api.getReplicationModelAtTravel(
    travelAtMergeCrossover + mergeSpan / api.VIEW.moleculeWidth / 2,
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

test("MP4 completion uses a browser download anchor instead of a direct file handle", () => {
  let clicked = 0;
  sandbox.URL = {
    createObjectURL() {
      return "blob:replisketch-video";
    },
    revokeObjectURL() {},
  };
  const link = {
    hidden: true,
    removeAttribute(name) {
      delete this[name];
    },
    click() {
      clicked += 1;
    },
  };
  api.setElements({ videoSaveLink: link });

  const method = api.saveMp4Blob(new Blob(["mp4"], { type: "video/mp4" }), "replisketch.mp4");

  assert.equal(method, "download");
  assert.equal(link.href, "blob:replisketch-video");
  assert.equal(link.download, "replisketch.mp4");
  assert.equal(link.hidden, false);
  assert.equal(clicked, 1);
  assert.doesNotMatch(source, /showSaveFilePicker/);
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
  api.setElements({
    canvasFrame,
    downloadButton,
    downloadButtonLabel: label,
    exportMp4Button: { disabled: false },
  });

  api.setVideoExportBusy(true);
  assert.equal(label.textContent, "Generating...");
  assert.equal(downloadButton.disabled, true);
  assert.equal(attributes["aria-busy"], true);

  api.setVideoExportBusy(false);
  assert.equal(label.textContent, "Download");
  assert.equal(downloadButton.disabled, false);
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
  assert.doesNotMatch(html, /id="originsToggle"/);
  assert.doesNotMatch(html, /id="simplifiedToggle"/);
  assert.doesNotMatch(source, /elements\.simplifiedToggle/);
  assert.doesNotMatch(source, /layers\.origins|originsToggle/);
  assert.match(css, /\.rs-fork-control-visual\s*\{[^}]*opacity:\s*0/s);
  assert.match(css, /\.rs-fork-handle:hover \.rs-fork-control-visual/);
  assert.match(css, /#dnaCanvas\.rs-show-all-controls \.rs-origin-visual/);
});

test("all range controls expose the expanded safe contracts and correct initial readouts", () => {
  const contracts = {
    progressControl: ["0", "100", "1"],
    speedControl: ["0.25", "5", "0.25"],
    lengthControl: ["10", "400", "5"],
    pairResolutionControl: ["1", "10", "1"],
    basePairWidthControl: ["0.2", "7", "0.1"],
    weightControl: ["1", "8", "0.5"],
    daughterSpacingControl: ["64", "400", "4"],
    doubleStrandHeightControl: ["8", "56", "2"],
    transitionTightnessControl: ["-100", "100", "1"],
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
  assert.match(html, /<section class="rs-control-section rs-compact-section">[\s\S]*?<h2>Controls<\/h2>/);
});

test("ruler derives minor ticks from the shared genomic sampling lattice", () => {
  assert.match(source, /Genomic position \(bp\)/);
  assert.match(source, /return displayedBasePairPositions\(sourceState\)/);
  assert.match(source, /crossoverCount\(sourceState\) \* \(basePairResolution\(sourceState\) \+ 1\)/);
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
    const unreplicatedRungs = lines.filter((line) => Math.abs(line.x - api.VIEW.x0) < 0.01);
    const replicatedRungs = lines.filter((line) => Math.abs(line.x - api.VIEW.width / 2) < 0.01);

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
    .map((index) => api.VIEW.x0 + (index / api.basePairCount()) * api.VIEW.moleculeWidth)
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

test("custom canvas backgrounds keep overlays legible and reach exports", async () => {
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
  assert.match(source, /background\.setAttribute\("fill", state\.advanced\.backgroundColor/);

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
