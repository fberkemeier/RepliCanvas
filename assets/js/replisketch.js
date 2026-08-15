(() => {
  "use strict";

  const VIEW = {
    width: 1200,
    height: 640,
    x0: 48,
    x1: 1152,
    centerY: 310,
  };
  VIEW.moleculeWidth = VIEW.x1 - VIEW.x0;

  const EPSILON = 0.0001;
  const BASE_PAIRS_PER_TURN = 10;
  const CONTROL_RANGES = Object.freeze({
    progress: { min: 0, max: 100 },
    speed: { min: 0.25, max: 5 },
    length: { min: 10, max: 400 },
    pairResolution: { min: 1, max: 10 },
    basePairWidth: { min: 0.2, max: 7 },
    weight: { min: 1, max: 8 },
    daughterSpacing: { min: 64, max: 400 },
    doubleStrandHeight: { min: 8, max: 56 },
    transitionTightness: { min: -100, max: 100 },
  });
  const MIN_PAIR_RESOLUTION = CONTROL_RANGES.pairResolution.min;
  const MAX_PAIR_RESOLUTION = CONTROL_RANGES.pairResolution.max;
  const NASCENT_PROFILE_THRESHOLD = 0.38;
  const PARENTAL_PAIR_FADE_END = 0.12;
  const BASE_PAIR_MAX_SPACING_RATIO = 1 / 3;
  const HISTORY_LIMIT = 30;
  const EXPORT_PADDING = 12;
  const MIN_ZOOM = 0.5;
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
  const VIDEO_FRAME_RATE = 60;
  const VIDEO_BITS_PER_SECOND = 5_000_000;
  const PROGRESS_PER_MILLISECOND = 0.006;
  // Match the former default four-fork pace, then keep that world-space speed
  // constant as forks merge or reach chromosome ends.
  const FORK_TRAVEL_PER_MILLISECOND = PROGRESS_PER_MILLISECOND / 400;

  const DEFAULTS = {
    length: 90,
    progress: 12,
    forkTravel: 0,
    pairResolution: 3,
    basePairWidth: 1.8,
    weight: 4,
    doubleStrandHeight: 24,
    daughterSpacing: 152,
    speed: 1,
    colors: {
      templateA: "#067e94",
      templateB: "#022851",
      newDna: "#8b1e2d",
      basePair: "#022851",
    },
    layers: {
      pairs: true,
      newDna: true,
      labels: true,
    },
    advanced: {
      strandModel: "standard",
      transitionTightness: 0,
      crossoverGaps: false,
      grid: true,
      alwaysShowControls: true,
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
  let modifierState = { shift: false, pan: false };

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
  const fixed = (value) => Number(value).toFixed(1);
  const precise = (value) => Number(value).toFixed(4);
  const fixedUiTransform = (x, y) => `translate(${fixed(x)} ${fixed(y)}) scale(${precise(1 / viewState.zoom)})`;
  const smoothstep = (value) => {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  };

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

  function normaliseStateSchema(sourceState) {
    sourceState.colors = { ...DEFAULTS.colors, ...(sourceState.colors || {}) };
    sourceState.layers = { ...DEFAULTS.layers, ...(sourceState.layers || {}) };
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
    sourceState.length = boundedControlValue("length", sourceState.length);
    sourceState.progress = boundedControlValue("progress", sourceState.progress);
    sourceState.basePairWidth = boundedControlValue("basePairWidth", sourceState.basePairWidth);
    sourceState.weight = boundedControlValue("weight", sourceState.weight);
    sourceState.doubleStrandHeight = boundedControlValue("doubleStrandHeight", sourceState.doubleStrandHeight);
    sourceState.daughterSpacing = boundedControlValue("daughterSpacing", sourceState.daughterSpacing);
    sourceState.speed = playbackSpeed(sourceState);
    sourceState.pairResolution = basePairResolution(sourceState);
    return sourceState;
  }

  function backgroundLuminance(sourceState = state) {
    const fallback = DEFAULTS.advanced.backgroundColor;
    const hex = sourceState?.advanced?.backgroundColor || fallback;
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

  function terminalPullSpan(terminalPosition, direction, sourceState = state) {
    const count = crossoverCount(sourceState);
    const step = 1 / count;
    // Use the same half-crossover pull span on both sides of a terminal.
    // Directional nearest-crossover distances differ at an off-lattice merge,
    // which made one fork flatten earlier than its opposing partner.
    return (step * VIEW.moleculeWidth) / 2;
  }

  function terminalEdgeBlend(distance, pullSpan = FORK_TERMINAL_BLEND_PX) {
    return 1 - smoothstep(distance / Math.max(0.75, pullSpan));
  }
  const daughterDetailFade = (profile) => smoothstep((profile - NASCENT_PROFILE_THRESHOLD) / 0.18);
  // Parental pairs should visually end at the fork. Keep only a very short
  // fade across the edge so a rung on the sampling lattice cannot pop.
  const parentalPairFade = (profile) => 1 - smoothstep(profile / PARENTAL_PAIR_FADE_END);

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

  function makeOrigins(count) {
    return Array.from({ length: count }, (_, index) => {
      const position = (index + 1) / (count + 1);
      return {
        id: `origin-${nextOriginId++}`,
        position,
        startPosition: position,
        leftOffset: 0,
        rightOffset: 0,
      };
    });
  }

  function makeDefaultState() {
    const defaultState = normaliseStateSchema({
      ...DEFAULTS,
      colors: { ...DEFAULTS.colors },
      layers: { ...DEFAULTS.layers },
      advanced: { ...DEFAULTS.advanced },
      origins: makeOrigins(2),
      cuts: [],
      selectedOriginId: null,
      playing: false,
    });
    defaultState.forkTravel = findForkTravelForReplicatedFraction(defaultState.progress, defaultState);
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

  function buildRegions(origins) {
    const intervals = origins
      .map((origin) => ({
        start: origin.flags.left ? origin.leftPosition : origin.startPosition,
        end: origin.flags.right ? origin.rightPosition : origin.startPosition,
        startBlend: origin.flags.left ? origin.leftEdgeBlend : 1,
        endBlend: origin.flags.right ? origin.rightEdgeBlend : 1,
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
        } else if (Math.abs(interval.end - current.end) <= EPSILON) {
          current.endBlend = Math.max(current.endBlend, interval.endBlend);
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
    }));
  }

  function getReplicationModelAtTravel(travel, sourceState = state) {
    const origins = [...sourceState.origins]
      .sort((a, b) => a.startPosition - b.startPosition)
      .map((origin, index) => {
        const flags = forkFlags(index);
        const leftTravel = Math.max(0, travel + origin.leftOffset);
        const rightTravel = Math.max(0, travel + origin.rightOffset);
        const leftPosition = flags.left ? Math.max(0, origin.startPosition - leftTravel) : origin.startPosition;
        const rightPosition = flags.right ? Math.min(1, origin.startPosition + rightTravel) : origin.startPosition;

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
        };
      });

    for (let index = 0; index < origins.length - 1; index += 1) {
      const leftOrigin = origins[index];
      const rightOrigin = origins[index + 1];

      if (leftOrigin.flags.right && rightOrigin.flags.left) {
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

    origins.forEach((origin) => {
      origin.leftTerminalOpacity = 1 - origin.leftEdgeBlend;
      origin.rightTerminalOpacity = 1 - origin.rightEdgeBlend;
    });

    return {
      origins,
      regions: buildRegions(origins),
      activeForkCount: origins.reduce((count, origin) => count + Number(origin.leftActive) + Number(origin.rightActive), 0),
    };
  }

  function forkTravelBounds(sourceState = state) {
    if (!sourceState.origins.length) return { zero: 0, full: 0 };
    const offsets = sourceState.origins.flatMap((origin) => [origin.leftOffset, origin.rightOffset]);
    const zero = -Math.max(...offsets);
    const full = Math.max(
      ...sourceState.origins.map((origin) =>
        Math.max(origin.startPosition - origin.leftOffset, 1 - origin.startPosition - origin.rightOffset)
      )
    );
    return { zero, full: Math.max(zero, full) };
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

  function minimalReplicationAt(x, model) {
    const position = (x - VIEW.x0) / VIEW.moleculeWidth;
    const region = model.regions.find((item) => position >= item.start - EPSILON && position <= item.end + EPSILON);
    if (!region) return { amount: 0, profile: 0, region: null };

    const startX = VIEW.x0 + region.start * VIEW.moleculeWidth;
    const endX = VIEW.x0 + region.end * VIEW.moleculeWidth;
    const leftProfile = region.openStart
      ? 1
      : transitionProfile((x - startX) / minimalRegionEdgeTransitionWidth(region, "start", model));
    const rightProfile = region.openEnd
      ? 1
      : transitionProfile((endX - x) / minimalRegionEdgeTransitionWidth(region, "end", model));
    const profile = Math.min(leftProfile, rightProfile);

    return {
      amount: (state.daughterSpacing / 2) * profile,
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

  function helixWave(x) {
    if (strandModel() !== "standard") return 0;
    const fraction = (x - VIEW.x0) / VIEW.moleculeWidth;
    const turns = state.length / BASE_PAIRS_PER_TURN;
    return Math.cos(fraction * turns * Math.PI * 2) * doubleStrandHalfHeight();
  }

  function crossoverCount(sourceState = state) {
    return Math.max(1, Math.round((sourceState.length / BASE_PAIRS_PER_TURN) * 2));
  }

  function basePairCount(sourceState = state) {
    // Resolution is the number of interior pair positions between consecutive
    // 180-degree crossovers. N interiors divide each crossover interval into
    // exactly N + 1 equal genomic/base-pair intervals.
    return crossoverCount(sourceState) * (basePairResolution(sourceState) + 1);
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

  function crossoverNear(x) {
    const count = crossoverCount();
    const fraction = (x - VIEW.x0) / VIEW.moleculeWidth;
    const index = Math.round(fraction * count - 0.5);
    if (index < 0 || index >= count) return null;
    const crossoverX = VIEW.x0 + ((index + 0.5) / count) * VIEW.moleculeWidth;
    const halfGap = Math.max(3.5, state.weight * 1.15);
    return Math.abs(x - crossoverX) <= halfGap ? { index, x: crossoverX } : null;
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
    const wave = helixWave(x);
    return strand === "a" ? VIEW.centerY - replication.amount + wave : VIEW.centerY + replication.amount - wave;
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
    const wave = helixWave(x);
    return daughter === "top" ? VIEW.centerY - daughterOffset - wave : VIEW.centerY + daughterOffset + wave;
  }

  function regionTransitionWidth(region, sourceState = state) {
    const width = Math.max(1, (region.end - region.start) * VIEW.moleculeWidth);
    const tightness = transitionTightness(sourceState);
    const smoothWidth = 52;
    const maximumWidth =
      tightness < 0
        ? smoothWidth + (sourceState.daughterSpacing / 2 - smoothWidth) * -tightness
        : 0.75 + 51.25 * (1 - tightness) ** 2;
    return Math.min(maximumWidth, width / 2);
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
    const open = side === "start" ? region.openStart : region.openEnd;
    const blend = clamp(side === "start" ? region.startBlend || 0 : region.endBlend || 0, 0, 1);
    const width = regionEdgeTransitionWidth(region, side, model, sourceState);
    // Keep the unreplicated gap/tail closed in the one-line model. As the fork
    // approaches a terminal, collapse the transition on its replicated side;
    // this makes the contact frame the limit of the preceding geometry without
    // using edgeBlend to open DNA that the fork has not reached yet.
    return open ? width : Math.max(0.75, width * (1 - blend));
  }

  function visualRegionEdgeTransitionWidth(region, side, model, sourceState = state) {
    return strandModel(sourceState) === "minimal"
      ? minimalRegionEdgeTransitionWidth(region, side, model, sourceState)
      : regionEdgeTransitionWidth(region, side, model, sourceState);
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
    const minimumActiveGap = SCHEMATIC_NASCENT_MIN_GAP_PX * (1 - clamp(edgeBlend, 0, 1));
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
    const startWeight = region.openStart
      ? 0
      : 1 - smoothstep((x - span.fromX) / SCHEMATIC_NASCENT_CONNECTION_PX);
    const endWeight = region.openEnd
      ? 0
      : 1 - smoothstep((span.toX - x) / SCHEMATIC_NASCENT_CONNECTION_PX);
    const totalWeight = startWeight + endWeight;
    if (totalWeight <= EPSILON) return naturalY;
    const normaliser = Math.max(1, totalWeight);
    const correction =
      ((startY - nascentY(span.fromX, daughter, model)) * startWeight +
        (endY - nascentY(span.toX, daughter, model)) * endWeight) /
      normaliser;
    return naturalY + correction;
  }

  function nascentSpan(region, model = getReplicationModel()) {
    const regionStart = VIEW.x0 + region.start * VIEW.moleculeWidth;
    const regionEnd = VIEW.x0 + region.end * VIEW.moleculeWidth;
    if (strandModel() === "elegant") {
      const startInset = schematicNascentEdgeInset(region, "start", model);
      const endInset = schematicNascentEdgeInset(region, "end", model);
      return {
        fromX: Math.min(regionEnd, regionStart + startInset),
        toX: Math.max(regionStart, regionEnd - endInset),
      };
    }
    if (strandModel() !== "standard") return { fromX: regionStart, toX: regionEnd };
    return {
      fromX: regionStart + nascentEdgeInset(region, "start", model),
      toX: regionEnd - nascentEdgeInset(region, "end", model),
    };
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
    return anchors
      .sort((first, second) => first - second)
      .filter((value, index, values) => index === 0 || Math.abs(value - values[index - 1]) > EPSILON);
  }

  function replicationPathSampling(model, sampleStep = 3) {
    const anchorXs = [];
    const localWindows = [];
    const step = Math.max(EPSILON, Math.abs(sampleStep));
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

  function previewCutRange() {
    if (dragState?.role !== "cut-range" || !dragState.moved) return null;
    return cutRange({ start: dragState.anchor, end: dragState.current });
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
    const delta = 0.25;
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

    const step = Math.max(EPSILON, Math.abs(sampleStep));
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
    if (distance <= width + EPSILON) return null;
    const direction = Math.sign(secondY - firstY);
    const inset = width / 2;
    return {
      firstY: firstY + direction * inset,
      secondY: secondY - direction * inset,
    };
  }

  function renderBasePairLine(x, firstY, secondY, opacity) {
    const segment = insetBasePairSegment(firstY, secondY);
    if (!segment) return "";
    return `<line x1="${fixed(x)}" y1="${precise(segment.firstY)}" x2="${fixed(x)}" y2="${precise(
      segment.secondY
    )}" stroke="${state.colors.basePair}" stroke-width="${fixed(
      state.basePairWidth
    )}" stroke-linecap="round" opacity="${precise(opacity)}"/>`;
  }

  function renderBasePairs(model) {
    if (!state.layers.pairs || !modelSupportsDoubleStrandDetails()) return "";

    const pairCount = basePairCount();
    const pairs = [];

    displayedBasePairPositions().forEach((index) => {
      const x = VIEW.x0 + (index / pairCount) * VIEW.moleculeWidth;
      if (isCutGap(x, 3)) return;
      const replication = replicationAt(x, model);
      const yA = templateY(x, "a", model);
      const yB = templateY(x, "b", model);

      if (!replication.region || replication.profile < PARENTAL_PAIR_FADE_END) {
        const parentalFade =
          (replication.region ? parentalPairFade(replication.profile) : 1) *
          basePairForkDistanceFade(x, yA, yB, model, replication);
        const pair = renderBasePairLine(x, yA, yB, 0.76 * parentalFade);
        if (pair && parentalFade > EPSILON) pairs.push(pair);
      }

      if (state.layers.newDna && replication.region && replication.profile >= NASCENT_PROFILE_THRESHOLD) {
        const topNewY = nascentY(x, "top", model);
        const bottomNewY = nascentY(x, "bottom", model);
        const daughterFade = daughterDetailFade(replication.profile);
        const daughterOpacity = (0.48 + replication.profile * 0.32) * daughterFade;
        const topDistanceFade = basePairForkDistanceFade(x, yA, topNewY, model, replication);
        const bottomDistanceFade = basePairForkDistanceFade(x, yB, bottomNewY, model, replication);
        const topPair = renderBasePairLine(x, yA, topNewY, daughterOpacity * topDistanceFade);
        const bottomPair = renderBasePairLine(x, yB, bottomNewY, daughterOpacity * bottomDistanceFade);
        if (topPair && topDistanceFade > EPSILON) pairs.push(topPair);
        if (bottomPair && bottomDistanceFade > EPSILON) pairs.push(bottomPair);
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
      const width = fixed(Math.max(2, state.weight * 0.9));
      const opacity = precise(smoothstep(spanWidth / 18));
      strands.push(
        `<path d="${topPath}" fill="none" stroke="${state.colors.newDna}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"/>`,
        `<path d="${bottomPath}" fill="none" stroke="${state.colors.newDna}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"/>`
      );
    });

    return `<g aria-label="Newly synthesised DNA">${strands.join("")}</g>`;
  }

  function renderCrossoverOverpasses(model) {
    if (strandModel() !== "standard" || state.advanced.crossoverGaps) return "";
    const overpasses = [];
    const count = crossoverCount();
    const halfWidth = Math.max(7, state.weight * 1.8);
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
        nascent ? (sampleX) => replicationAt(sampleX, model).profile < NASCENT_PROFILE_THRESHOLD : null,
        sampling.anchorXs,
        sampling.localWindows,
        (sampleX) => numericalPathTangent(yForX, sampleX, VIEW.x0, VIEW.x1)
      );
      if (!path) return;
      overpasses.push(
        `<path d="${path}" fill="none" stroke="${color}" stroke-width="${
          strand === "a" || strand === "b" ? state.weight : fixed(Math.max(2, state.weight * 0.9))
        }" stroke-linecap="round" stroke-linejoin="round" opacity="${precise(opacity)}"/>`
      );
    };

    for (let index = 0; index < count; index += 1) {
      const x = VIEW.x0 + ((index + 0.5) / count) * VIEW.moleculeWidth;
      const replication = replicationAt(x, model);
      const even = index % 2 === 0;

      if (!replication.region || !state.layers.newDna) {
        addOverpass(x, even ? "a" : "b", even ? state.colors.templateA : state.colors.templateB);
        continue;
      }

      const daughterMix = daughterDetailFade(replication.profile);
      addOverpass(x, even ? "a" : "b", even ? state.colors.templateA : state.colors.templateB);
      addOverpass(x, even ? "bottom" : "top", state.colors.newDna, daughterMix);
    }

    return `<g aria-label="Alternating strand overpasses">${overpasses.join("")}</g>`;
  }

  function interactionHalfHeight() {
    return state.daughterSpacing / 2;
  }

  function renderOrigins(model) {
    return model.origins
      .map((origin) => {
        const selected = state.selectedOriginId === origin.id;
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
          ? `<circle class="rs-ui-only" cx="0" cy="0" r="17" fill="none" stroke="#067e94" stroke-width="3" opacity="0.55"/>`
          : "";
        const label = state.layers.labels
          ? `<g class="rs-ui-only" transform="${fixedUiTransform(x, labelY)}"><text x="0" y="4" fill="${canvasInkColor()}" font-family="Inter, Segoe UI, sans-serif" font-size="13" font-weight="700" text-anchor="middle">O${
              origin.index + 1
            }</text></g>`
          : "";

        return `<g class="rs-origin-marker${dragged ? " is-dragged" : ""}" data-origin-id="${origin.id}">
          <rect class="rs-origin-hover-zone rs-ui-only" data-role="bubble-hover" data-origin-id="${origin.id}" x="${fixed(
            x + hitX
          )}" y="${fixed(VIEW.centerY - hitHalfHeight)}" width="${fixed(hitWidth)}" height="${fixed(
            hitHalfHeight * 2
          )}" fill="transparent"/>
          <g transform="${fixedUiTransform(x, VIEW.centerY)}">
            <g class="rs-origin-visual">
              ${selectionRing}
              <circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#142126" stroke-width="2.5"/>
              <circle cx="0" cy="0" r="3.5" fill="${state.colors.basePair}"/>
            </g>
            <circle class="rs-origin-control-hit rs-ui-only" data-role="origin" data-origin-id="${origin.id}" cx="0" cy="0" r="24" fill="transparent"/>
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
    const terminalOpacity = clamp(isLeft ? origin.leftTerminalOpacity ?? 1 : origin.rightTerminalOpacity ?? 1, 0, 1);

    return `<g transform="${fixedUiTransform(x, VIEW.centerY)}" style="--rs-fork-terminal-opacity:${precise(
      terminalOpacity
    )}"><g class="rs-fork-terminal-indicator">${arrow}${label}</g><g class="rs-fork-handle rs-ui-only${
      dragged ? " is-dragged" : ""
    }" data-role="fork" data-origin-id="${
      origin.id
    }" data-side="${side}">
        <g class="rs-fork-control-visual">
          <circle cx="0" cy="0" r="11" fill="#ffffff" stroke="#142126" stroke-width="2"/>
          <path d="${chevron}" fill="none" stroke="#142126" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <circle cx="0" cy="0" r="24" fill="transparent"/>
      </g>
    </g>`;
  }

  function renderForks(model) {
    let forkNumber = 1;
    const forks = [];
    model.origins.forEach((origin) => {
      if (origin.leftActive) forks.push(renderFork(origin, "left", forkNumber++));
      if (origin.rightActive) forks.push(renderFork(origin, "right", forkNumber++));
    });
    return `<g aria-label="Active replication forks">${forks.join("")}</g>`;
  }

  function renderCuts() {
    const cuts = state.cuts.map((cut, index) => ({ range: cutRange(cut), index, preview: false }));
    const preview = previewCutRange();
    if (preview) cuts.push({ range: preview, index: "preview", preview: true });

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
          ? `<rect x="${fixed(leftX)}" y="180" width="${fixed(rightX - leftX)}" height="260" fill="#b8384b" opacity="0.08"/>
             <line x1="${fixed(leftX)}" y1="180" x2="${fixed(leftX)}" y2="440" stroke="#b8384b" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.62" vector-effect="non-scaling-stroke"/>
             <line x1="${fixed(rightX)}" y1="180" x2="${fixed(rightX)}" y2="440" stroke="#b8384b" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.62" vector-effect="non-scaling-stroke"/>`
          : `<line x1="${fixed(centerX)}" y1="180" x2="${fixed(centerX)}" y2="440" stroke="#b8384b" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.55" vector-effect="non-scaling-stroke"/>`;

        return `<g class="rs-cut-marker${isPreview ? " is-preview" : ""}" data-role="cut" data-cut-index="${index}">
          ${guide}
          <g class="rs-ui-only" transform="${fixedUiTransform(centerX, 164)}">
            <circle cx="0" cy="0" r="17" fill="#ffffff" stroke="#b8384b" stroke-width="2"/>
            <text x="0" y="6" fill="#b8384b" font-family="Segoe UI Symbol, sans-serif" font-size="18" text-anchor="middle">&#9986;</text>
          </g>
          <rect class="rs-ui-only" x="${fixed(leftX - 12)}" y="139" width="${fixed(rightX - leftX + 24)}" height="326" fill="transparent"/>
        </g>`;
      })
      .join("");
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

    // Use a divisor of the full length so every labelled interval, including
    // the final one, has identical visual and genomic spacing.
    for (let step = minimumStep; step <= pairCount; step += 1) {
      if (pairCount % step === 0) return step;
    }
    return pairCount;
  }

  function rulerBasePairPosition(index, sourceState = state) {
    return clamp(Math.round(index), 0, basePairCount(sourceState));
  }

  function rulerTickPosition(basePairPosition, start, end, sourceState = state) {
    return start + (rulerBasePairPosition(basePairPosition, sourceState) / basePairCount(sourceState)) * (end - start);
  }

  function rulerTickIndices(majorEvery, sourceState = state) {
    return displayedBasePairPositions(sourceState);
  }

  function updateGrid() {
    const frame = elements.canvasFrame;
    frame.style.setProperty("--rs-canvas-background", state.advanced.backgroundColor || DEFAULTS.advanced.backgroundColor);
    frame.style.setProperty("--rs-canvas-ink", canvasInkColor());
    frame.style.setProperty("--rs-grid-line", canvasGridColor());
    frame.classList.toggle("is-grid-hidden", !state.advanced.grid);
    if (!state.advanced.grid) return;

    const matrix = elements.canvas.querySelector("#rs-world")?.getScreenCTM();
    if (!matrix) return;
    const bounds = frame.getBoundingClientRect();
    const originX = bounds.left + frame.clientLeft;
    const originY = bounds.top + frame.clientTop;
    const anchor = transformedSvgPoint(VIEW.x0, VIEW.centerY, matrix);
    const xStep = transformedSvgPoint(VIEW.x0 + 96, VIEW.centerY, matrix);
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
    const matrix = elements.canvas.querySelector("#rs-world")?.getScreenCTM();
    if (!ruler || !matrix) return;

    const bounds = ruler.getBoundingClientRect();
    const start = transformedSvgPoint(VIEW.x0, VIEW.centerY, matrix).x - bounds.left;
    const end = transformedSvgPoint(VIEW.x1, VIEW.centerY, matrix).x - bounds.left;
    const pairCount = basePairCount();
    const pairSpacing = (end - start) / pairCount;
    if (!Number.isFinite(pairSpacing) || pairSpacing <= 0) return;

    const firstVisible = clamp(Math.ceil((0 - start) / pairSpacing), 0, pairCount);
    const lastVisible = clamp(Math.floor((ruler.clientWidth - start) / pairSpacing), 0, pairCount);
    const majorEvery = rulerMajorEvery(pairSpacing);
    const ticks = [];

    rulerTickIndices(majorEvery).forEach((index) => {
      if (index < firstVisible || index > lastVisible) return;
      const position = rulerTickPosition(index, start, end);
      const endpoint = index === 0 || index === pairCount;
      const labelled = endpoint || index % majorEvery === 0;
      const endpointClass = index === 0 ? " is-start" : index === pairCount ? " is-end" : "";
      const label = String(rulerBasePairPosition(index));
      ticks.push(
        `<span class="rs-ruler-tick${labelled ? " is-labelled" : ""}${endpointClass}" style="left:${fixed(position)}px">${
          labelled ? `<output>${label}</output>` : ""
        }</span>`
      );
    });

    ruler.innerHTML = `<div class="rs-ruler-title">Genomic position (bp)</div><div class="rs-ruler-track"><span class="rs-ruler-axis"></span>${ticks.join(
      ""
    )}</div>`;
  }

  function renderContextAction() {
    return `<g id="rs-context-action" class="rs-context-action rs-ui-only" data-action="add" visibility="hidden">
      <line x1="0" y1="${VIEW.centerY - 40}" x2="0" y2="${
        VIEW.centerY + 40
      }" fill="none" stroke="${canvasInkColor()}" stroke-width="1.6" stroke-dasharray="5 5" vector-effect="non-scaling-stroke"/>
      <g id="rs-context-symbol" transform="${fixedUiTransform(0, VIEW.centerY)}">
        <circle cx="0" cy="0" r="14" fill="${
          state.advanced.backgroundColor || DEFAULTS.advanced.backgroundColor
        }" stroke="${canvasInkColor()}" stroke-width="1.7"/>
        <text x="0" y="5" fill="${canvasInkColor()}" font-family="Inter, Segoe UI Symbol, sans-serif" font-size="16" font-weight="700" text-anchor="middle">+</text>
      </g>
    </g>`;
  }

  function updateCanvasLegend() {
    const items = [
      [state.colors.templateA, "Template A"],
      [state.colors.templateB, "Template B"],
    ];
    if (state.layers.newDna && strandModel() !== "minimal") items.push([state.colors.newDna, "New strands"]);
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
      <path d="${pathA}" fill="none" stroke="${state.colors.templateA}" stroke-width="${state.weight}" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${pathB}" fill="none" stroke="${state.colors.templateB}" stroke-width="${state.weight}" stroke-linecap="round" stroke-linejoin="round"/>
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
    sourceState.forkTravel = findForkTravelForReplicatedFraction(target, sourceState);
    const model = getReplicationModelAtTravel(sourceState.forkTravel, sourceState);
    synchroniseSPhaseFromGeometry(model, sourceState);
    synchroniseOriginPositions(sourceState);
    return model;
  }

  function advanceForkPlayback(elapsedMilliseconds, sourceState = state) {
    const elapsed = Math.max(0, Number(elapsedMilliseconds) || 0);
    const speed = playbackSpeed(sourceState);
    const bounds = forkTravelBounds(sourceState);
    sourceState.forkTravel = clamp(
      sourceState.forkTravel + elapsed * FORK_TRAVEL_PER_MILLISECOND * speed,
      bounds.zero,
      bounds.full
    );
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
    let model = getReplicationModel();
    if (synchroniseOriginPositions()) model = getReplicationModel();
    synchroniseSPhaseFromGeometry(model);
    const selectedOrigin = model.origins.find((origin) => origin.id === state.selectedOriginId);
    elements.canvas.classList.toggle("rs-show-all-controls", state.advanced.alwaysShowControls);

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
          ${artworkMarkup(model)}
        </g>
        ${renderEndLabels(model)}
        <g class="rs-ui-only" aria-label="Replication origins">${renderOrigins(model)}</g>
        ${renderForks(model)}
        <g aria-label="DNA breaks">${renderCuts()}</g>
        ${renderContextAction()}
      </g>
    `;

    updateReadouts(model);
    updateCanvasLegend();
    elements.selectionMessage.textContent = selectedOrigin
      ? `O${selectedOrigin.index + 1} at ${Math.round(selectedOrigin.position * basePairCount())} bp`
      : "No selection";
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
    if (elements.transitionTightnessOutput) {
      elements.transitionTightnessOutput.textContent = transitionTightnessLabel();
    }
    elements.speedOutput.textContent = `${state.speed.toFixed(2).replace(/0$/, "")}x`;
    elements.zoomOutput.textContent = `${Math.round(viewState.zoom * 100)}%`;
    elements.lengthStat.textContent = `${basePairCount()} bp`;
    elements.originStat.textContent = state.origins.length;
    elements.forkStat.textContent = model.activeForkCount;
    elements.replicatedStat.textContent = `${replicated}%`;
    elements.progressControl.value = state.progress;
    elements.clearCutsButton.disabled = state.cuts.length === 0;
    elements.deleteOriginButton.disabled = !state.origins.some((origin) => origin.id === state.selectedOriginId);
    elements.playButton.disabled = state.origins.length === 0;
    updateHistoryButtons();
  }

  function syncControls() {
    synchroniseSPhaseFromGeometry();
    const modelName = strandModel();
    const doubleStrandDetails = modelSupportsDoubleStrandDetails();
    if (elements.modelControl) elements.modelControl.value = modelName;
    elements.lengthControl.value = state.length;
    elements.progressControl.value = state.progress;
    elements.progressControl.disabled = state.origins.length === 0;
    elements.pairResolutionControl.value = basePairResolution();
    elements.basePairWidthControl.value = state.basePairWidth;
    elements.weightControl.value = state.weight;
    if (elements.doubleStrandHeightControl) elements.doubleStrandHeightControl.value = state.doubleStrandHeight;
    elements.daughterSpacingControl.value = state.daughterSpacing;
    if (elements.transitionTightnessControl) {
      elements.transitionTightnessControl.value = state.advanced.transitionTightness;
    }
    elements.speedControl.value = state.speed;
    elements.templateAColor.value = state.colors.templateA;
    elements.templateBColor.value = state.colors.templateB;
    elements.newDnaColor.value = state.colors.newDna;
    elements.basePairColor.value = state.colors.basePair;
    elements.pairsToggle.checked = state.layers.pairs;
    elements.newDnaToggle.checked = state.layers.newDna;
    elements.labelsToggle.checked = state.layers.labels;
    elements.crossoverGapsToggle.checked = state.advanced.crossoverGaps;
    elements.gridToggle.checked = state.advanced.grid;
    elements.alwaysShowControlsToggle.checked = state.advanced.alwaysShowControls;
    elements.backgroundColorControl.value = state.advanced.backgroundColor || DEFAULTS.advanced.backgroundColor;
    elements.pairResolutionControl.disabled = !doubleStrandDetails;
    elements.basePairWidthControl.disabled = !doubleStrandDetails;
    if (elements.doubleStrandHeightControl) elements.doubleStrandHeightControl.disabled = !doubleStrandDetails;
    elements.pairsToggle.disabled = !doubleStrandDetails;
    elements.newDnaToggle.disabled = modelName === "minimal";
    elements.basePairColor.disabled = !doubleStrandDetails;
    elements.newDnaColor.disabled = modelName === "minimal";
    elements.crossoverGapsToggle.disabled = modelName !== "standard";
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
    return {
      x: VIEW.width / 2 + (point.x - VIEW.width / 2 - viewState.panX) / viewState.zoom,
      y: VIEW.centerY + (point.y - VIEW.centerY - viewState.panY) / viewState.zoom,
    };
  }

  function hideContextAction() {
    const action = elements.canvas.querySelector("#rs-context-action");
    if (action) action.setAttribute("visibility", "hidden");
    delete elements.canvas.dataset.contextAction;
  }

  function refreshContextAction() {
    const action = elements.canvas.querySelector("#rs-context-action");
    elements.canvas.classList.toggle("is-pan-ready", Boolean(hoverState && modifierState.pan && !dragState));
    if (!action || !hoverState || dragState || modifierState.pan) {
      hideContextAction();
      return;
    }

    const point = screenToWorld(hoverState.point);
    if (
      point.x < VIEW.x0 ||
      point.x > VIEW.x1 ||
      point.y < 120 ||
      point.y > 500 ||
      (!modifierState.shift && ["origin", "fork", "cut"].includes(hoverState.role))
    ) {
      hideContextAction();
      return;
    }

    const replication = replicationAt(point.x, getReplicationModel());
    const halfHeight = interactionHalfHeight();
    if (Math.abs(point.y - VIEW.centerY) > halfHeight) {
      hideContextAction();
      return;
    }

    const actionName = modifierState.shift ? "cut" : replication.region ? "split" : "add";
    const color = actionName === "cut" ? "#b8384b" : canvasInkColor();
    const symbols = { add: "+", split: "\u2194", cut: "\u2702" };
    const labels = { add: "Add origin", split: "Split bubble", cut: "Cut or repair DNA" };
    const line = action.querySelector("line");
    const symbolGroup = action.querySelector("#rs-context-symbol");
    const circle = symbolGroup.querySelector("circle");
    const symbol = symbolGroup.querySelector("text");
    const symbolY = clamp(point.y, VIEW.centerY - halfHeight + 16, VIEW.centerY + halfHeight - 16);

    action.dataset.action = actionName;
    action.setAttribute("aria-label", labels[actionName]);
    action.setAttribute("transform", `translate(${fixed(point.x)} 0)`);
    action.setAttribute("visibility", "visible");
    line.setAttribute("y1", fixed(VIEW.centerY - halfHeight));
    line.setAttribute("y2", fixed(VIEW.centerY + halfHeight));
    line.setAttribute("stroke", color);
    symbolGroup.setAttribute("transform", fixedUiTransform(0, symbolY));
    circle.setAttribute("stroke", color);
    symbol.setAttribute("fill", color);
    symbol.textContent = symbols[actionName];
    elements.canvas.dataset.contextAction = actionName;
  }

  function rememberPointer(event) {
    const target = event.target.closest?.("[data-role]");
    hoverState = {
      point: pointFromEvent(event),
      role: target?.dataset.role || null,
    };
    modifierState.shift = event.shiftKey;
    modifierState.pan = event.ctrlKey || event.metaKey;
    refreshContextAction();
  }

  function clearPointerHover() {
    hoverState = null;
    elements.canvas.classList.remove("is-pan-ready");
    hideContextAction();
  }

  function setZoom(zoom, focus = { x: VIEW.width / 2, y: VIEW.centerY }) {
    const nextZoom = clamp(zoom, MIN_ZOOM, MAX_ZOOM);
    const worldX = VIEW.width / 2 + (focus.x - VIEW.width / 2 - viewState.panX) / viewState.zoom;
    const worldY = VIEW.centerY + (focus.y - VIEW.centerY - viewState.panY) / viewState.zoom;
    viewState.panX = focus.x - VIEW.width / 2 - (worldX - VIEW.width / 2) * nextZoom;
    viewState.panY = focus.y - VIEW.centerY - (worldY - VIEW.centerY) * nextZoom;
    viewState.zoom = nextZoom;
    render();
  }

  function resetView() {
    viewState = { zoom: 1, panX: 0, panY: 0 };
    render();
    setStatus("Preview reset");
  }

  function normalisedX(x) {
    return clamp((x - VIEW.x0) / VIEW.moleculeWidth, 0, 1);
  }

  function forksShouldCollapse(side, desiredPosition, oppositePosition) {
    const screenDistance = Math.abs(desiredPosition - oppositePosition) * VIEW.moleculeWidth * viewState.zoom;
    const crossedPartner = side === "left" ? desiredPosition >= oppositePosition : desiredPosition <= oppositePosition;
    return crossedPartner || screenDistance <= FORK_COLLAPSE_PX;
  }

  function addOrRepairCut(x) {
    const position = normalisedX(x);
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
      setStatus(`Break added at ${Math.round(position * basePairCount())} bp`);
    } else {
      setStatus("Break limit reached");
    }
    render();
  }

  function commitCutRange(start, end, startSnapshot) {
    const range = cutRange({ start, end });
    const nextCuts = normaliseCutRegions([...state.cuts, range]);
    if (nextCuts.length > 10) {
      setStatus("Break limit reached");
      render();
      return;
    }

    pushSnapshot(startSnapshot);
    state.cuts = nextCuts;
    const startBp = Math.round(range.start * basePairCount());
    const endBp = Math.round(range.end * basePairCount());
    setStatus(`Region removed from ${startBp}\u2013${endBp} bp`);
    render();
  }

  function addOrigin(x) {
    const position = normalisedX(x);
    const nearby = state.origins.find((origin) => Math.abs(origin.position - position) * VIEW.moleculeWidth < 28);
    if (nearby) {
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
      id: `origin-${nextOriginId++}`,
      position,
      startPosition: position,
      leftOffset: initialOffset,
      rightOffset: initialOffset,
    };
    state.origins.push(origin);
    state.origins.sort((a, b) => a.startPosition - b.startPosition);
    state.selectedOriginId = origin.id;
    synchroniseOriginPositions();
    syncControls();
    render();
    setStatus(`Origin added at ${Math.round(origin.position * basePairCount())} bp`);
  }

  function bubbleFromBounds(start, end, sourceState = state) {
    const center = (start + end) / 2;
    const halfWidth = Math.max(0, end - start) / 2;
    const offset = halfWidth - sourceState.forkTravel;
    return {
      id: `origin-${nextOriginId++}`,
      position: center,
      startPosition: center,
      leftOffset: offset,
      rightOffset: offset,
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
    const translation = clamp(desiredTranslation, activeDrag.minimumTranslation, activeDrag.maximumTranslation);
    origin.startPosition = clamp(activeDrag.originStartPosition + translation, 0, 1);
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

  function mergeTouchingBubbles(originId) {
    const result = mergeOverlappingBubbleState(originId);
    if (!result) return false;
    syncControls();
    return true;
  }

  function splitBubble(x) {
    const position = normalisedX(x);
    const model = getReplicationModel();
    const region = model.regions.find((item) => position >= item.start && position <= item.end);
    if (!region || region.end - region.start < 0.08) {
      setStatus("Choose a wider replication bubble");
      return;
    }
    const gap = Math.min(0.03, (region.end - region.start) / 5);
    const minimumWidth = Math.max(0.025, gap);
    const split = clamp(position, region.start + minimumWidth + gap / 2, region.end - minimumWidth - gap / 2);
    const left = bubbleFromBounds(region.start, split - gap / 2);
    const right = bubbleFromBounds(split + gap / 2, region.end);
    const replacedIds = new Set(region.originIds);
    pushSnapshot();
    state.origins = state.origins.filter((origin) => !replacedIds.has(origin.id));
    state.origins.push(left, right);
    state.origins.sort((a, b) => a.startPosition - b.startPosition);
    state.selectedOriginId = position <= split ? left.id : right.id;
    synchroniseOriginPositions();
    syncControls();
    render();
    setStatus("Replication bubble split");
  }

  function deleteSelectedOrigin() {
    const index = state.origins.findIndex((origin) => origin.id === state.selectedOriginId);
    if (index < 0) return;
    pushSnapshot();
    state.origins.splice(index, 1);
    state.selectedOriginId = null;
    synchroniseOriginPositions();
    syncControls();
    render();
    setStatus("Origin deleted");
  }

  function clearCuts() {
    if (!state.cuts.length) return;
    pushSnapshot();
    state.cuts = [];
    render();
    setStatus("All breaks repaired");
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

  function beginCutRange(event, x) {
    const position = normalisedX(x);
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

  function handlePointerDown(event) {
    const screenPoint = pointFromEvent(event);
    if (event.button === 1 || (event.button === 0 && (event.ctrlKey || event.metaKey))) {
      beginPan(event, screenPoint);
      return;
    }
    if (event.button !== 0 && event.pointerType !== "touch") return;
    const point = screenToWorld(screenPoint);
    if (point.x < VIEW.x0 - 12 || point.x > VIEW.x1 + 12 || point.y < 130 || point.y > 480) return;

    const target = event.target.closest("[data-role]");
    const role = target?.dataset.role || null;
    const replication = replicationAt(point.x, getReplicationModel());
    const halfHeight = interactionHalfHeight();
    if (event.shiftKey) {
      if (role !== "cut" && Math.abs(point.y - VIEW.centerY) > halfHeight) return;
      beginCutRange(event, point.x);
      return;
    }

    if (role !== "origin" && role !== "fork") {
      if (role === "cut") {
        setStatus("Shift-click the break to repair it");
        return;
      }

      if (Math.abs(point.y - VIEW.centerY) <= halfHeight) {
        if (replication.region) splitBubble(point.x);
        else addOrigin(point.x);
        event.preventDefault();
        return;
      }

      state.selectedOriginId = null;
      render();
      return;
    }

    const originId = target.dataset.originId;
    const origin = state.origins.find((item) => item.id === originId);
    const model = getReplicationModel();
    const geometry = model.origins.find((item) => item.id === originId);
    if (!origin || !geometry) return;

    state.selectedOriginId = originId;
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
    if (dragState.role === "cut-range") {
      const point = screenToWorld(screenPoint);
      dragState.current = normalisedX(point.x);
      const distance = Math.hypot(event.clientX - dragState.startClientX, event.clientY - dragState.startClientY);
      if (!dragState.moved && distance >= CUT_DRAG_THRESHOLD_PX) {
        dragState.moved = true;
        elements.canvas.classList.add("is-cutting");
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
      const dragResult = applyOriginDragPosition(dragState, normalisedX(point.x));
      if (!dragResult) return;
      setStatus(
        dragResult.consumed
          ? "Overlapping origin and its forks were consumed"
          : `Replication bubble moved to ${Math.round(dragResult.origin.position * basePairCount())} bp`
      );
    } else {
      const desiredPosition = normalisedX(point.x);
      const globalTravel = state.forkTravel;
      const hasTwoForks = dragState.pairedForks;

      if (hasTwoForks) {
        const oppositePosition = dragState.side === "left" ? dragState.rightPosition : dragState.leftPosition;
        dragState.collapsePending = forksShouldCollapse(dragState.side, desiredPosition, oppositePosition);
        const movingPosition = dragState.collapsePending
          ? oppositePosition
          : dragState.side === "left"
            ? clamp(desiredPosition, 0, oppositePosition)
            : clamp(desiredPosition, oppositePosition, 1);
        const leftPosition = dragState.side === "left" ? movingPosition : oppositePosition;
        const rightPosition = dragState.side === "right" ? movingPosition : oppositePosition;
        const center = (leftPosition + rightPosition) / 2;
        const halfWidth = (rightPosition - leftPosition) / 2;
        origin.startPosition = center;
        origin.position = center;
        origin.leftOffset = halfWidth - globalTravel;
        origin.rightOffset = halfWidth - globalTravel;
      } else if (dragState.side === "left" && geometry.leftActive) {
        const travel = geometry.startPosition - clamp(desiredPosition, 0, geometry.startPosition);
        origin.leftOffset = travel - globalTravel;
      } else if (dragState.side === "right" && geometry.rightActive) {
        const travel = clamp(desiredPosition, geometry.startPosition, 1) - geometry.startPosition;
        origin.rightOffset = travel - globalTravel;
      }
      synchroniseOriginPositions();
      setStatus(`${dragState.side === "left" ? "Left" : "Right"} fork adjusted`);
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

    let collapsed = false;
    if (event.type !== "pointercancel" && completedDrag.moved && completedDrag.role === "fork" && completedDrag.collapsePending) {
      const index = state.origins.findIndex((origin) => origin.id === completedDrag.originId);
      if (index >= 0) {
        state.origins.splice(index, 1);
        state.selectedOriginId = null;
        collapsed = true;
        syncControls();
      }
    }
    const merged =
      !collapsed &&
      shouldMergeCompletedBubbleDrag(completedDrag, event.type) &&
      mergeTouchingBubbles(completedDrag.originId);
    render();
    if (collapsed) setStatus("Overlapping forks snapped together and the bubble was removed");
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
    if (state) state.playing = false;
    if (elements.playButton) updatePlayButton();
  }

  function animateForks(time) {
    if (!state.playing) return;
    if (!previousAnimationTime) previousAnimationTime = time;
    const elapsed = Math.min(64, time - previousAnimationTime);
    previousAnimationTime = time;
    advanceForkPlayback(elapsed);
    const model = render();

    if (model.activeForkCount === 0 || state.progress >= 100) {
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
    if (getReplicationModel().activeForkCount === 0 || state.progress >= 100) {
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
    const background = document.createElementNS(namespace, "rect");
    title.textContent = "DNA replication diagram created with RepliSketch";
    svg.setAttribute("xmlns", namespace);
    svg.setAttribute("viewBox", `${fixed(x)} ${fixed(y)} ${fixed(width)} ${fixed(height)}`);
    svg.setAttribute("width", fixed(width));
    svg.setAttribute("height", fixed(height));
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    background.setAttribute("x", fixed(x));
    background.setAttribute("y", fixed(y));
    background.setAttribute("width", fixed(width));
    background.setAttribute("height", fixed(height));
    background.setAttribute("fill", state.advanced.backgroundColor || DEFAULTS.advanced.backgroundColor);
    background.setAttribute("aria-hidden", "true");
    svg.append(title, background, artwork.cloneNode(true));
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
      const context = canvas.getContext("2d");
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
      )}</title><style>@page{size:${pageWidth}px ${pageHeight}px;margin:0}html,body{width:${pageWidth}px;height:${pageHeight}px;margin:0;overflow:hidden}svg{display:block;width:100%;height:100%;}</style></head><body>${new XMLSerializer().serializeToString(
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
    try {
      return callback();
    } finally {
      state = liveState;
      dragState = liveDragState;
    }
  }

  function fixedVideoSvgSource(videoState, forkTravel) {
    return withVideoRenderState(videoState, () => {
      const model = getReplicationModelAtTravel(forkTravel, videoState);
      const maxStroke = Math.max(videoState.weight, videoState.basePairWidth);
      const halfExtent = Math.max(
        80,
        videoState.daughterSpacing / 2 + doubleStrandHalfHeight(videoState) + maxStroke + EXPORT_PADDING
      );
      const x = VIEW.x0 - EXPORT_PADDING;
      const y = VIEW.centerY - halfExtent;
      const width = VIEW.moleculeWidth + EXPORT_PADDING * 2;
      const height = halfExtent * 2;
      const source = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${fixed(x)} ${fixed(y)} ${fixed(width)} ${fixed(height)}" width="${fixed(
        width
      )}" height="${fixed(height)}" preserveAspectRatio="xMidYMid meet">
  <title>Animated DNA replication diagram created with RepliSketch</title>
  <g aria-label="DNA molecule">${artworkMarkup(model)}</g>
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

      context.fillStyle = videoState.advanced.backgroundColor || DEFAULTS.advanced.backgroundColor;
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

  function saveMp4Blob(blob, filename) {
    publishVideoDownload(blob, filename);
    return "download";
  }

  function forkCompletionTravel(sourceState = state) {
    if (!sourceState.origins.length) return forkTravelBounds(sourceState).zero;
    const bounds = forkTravelBounds(sourceState);
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
    const travelPerFrame = FORK_TRAVEL_PER_MILLISECOND * (1000 / VIDEO_FRAME_RATE) * speed;
    const travelSpan = Math.max(0, completionTravel - startTravel);
    return {
      startTravel,
      completionTravel,
      travelPerFrame,
      lastFrameIndex: travelPerFrame > 0 ? Math.ceil(travelSpan / travelPerFrame) : 0,
      frameDurationSeconds: 1 / VIDEO_FRAME_RATE,
    };
  }

  function videoTravelAtFrame(plan, frameIndex) {
    return clamp(
      plan.startTravel + Math.max(0, frameIndex) * plan.travelPerFrame,
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

      saveMp4Blob(video, filename);
      setStatus("MP4 download started — click Save MP4 if the browser did not open its Downloads notification");
    } catch (error) {
      console.error("MP4 export failed", error);
      setStatus(`MP4 export failed: ${error instanceof Error ? error.message : "no compatible encoder was available"}`);
    } finally {
      setVideoExportBusy(false);
    }
  }

  function setDownloadMenu(open, focusFirst = false) {
    elements.downloadMenu.hidden = !open;
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
      state.length = boundedControlValue("length", value);
      render();
    });
    bindContinuousControl(elements.progressControl, (value) => {
      stopAnimation();
      setSPhaseTime(boundedControlValue("progress", value));
      render();
    });
    bindContinuousControl(elements.pairResolutionControl, (value) => {
      state.pairResolution = basePairResolution({ pairResolution: value });
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
      state.speed = playbackSpeed({ speed: value });
      updateReadouts();
    });
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

    [
      [elements.templateAColor, "templateA"],
      [elements.templateBColor, "templateB"],
      [elements.newDnaColor, "newDna"],
      [elements.basePairColor, "basePair"],
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
    ].forEach(([control, key]) => {
      control.addEventListener("change", () => {
        pushSnapshot();
        state.advanced[key] = control.checked;
        render();
      });
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
      state.advanced.backgroundColor = elements.backgroundColorControl.value;
      render();
    });
    elements.backgroundColorControl.addEventListener("change", finishControlChange);

    elements.undoButton.addEventListener("click", undo);
    elements.redoButton.addEventListener("click", redo);
    elements.resetButton.addEventListener("click", reset);
    elements.downloadButton.addEventListener("click", () => {
      setDownloadMenu(elements.downloadMenu.hidden, !elements.downloadMenu.hidden);
    });
    elements.downloadButton.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowDown") return;
      event.preventDefault();
      setDownloadMenu(true, true);
    });
    elements.exportPngButton.addEventListener("click", () => runDownload(exportPng));
    elements.exportSvgButton.addEventListener("click", () => runDownload(exportSvg));
    elements.exportPdfButton.addEventListener("click", () => runDownload(exportPdf));
    elements.exportMp4Button.addEventListener("click", () => runDownload(exportMp4));
    elements.playButton.addEventListener("click", toggleAnimation);
    elements.deleteOriginButton.addEventListener("click", deleteSelectedOrigin);
    elements.clearCutsButton.addEventListener("click", clearCuts);
    elements.canvas.addEventListener("pointerdown", handlePointerDown);
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

    document.addEventListener("pointerdown", (event) => {
      if (!elements.downloadControl.contains(event.target)) closeDownloadMenu();
    });

    document.addEventListener("keydown", (event) => {
      const modifier = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      if (event.key === "Shift") {
        modifierState.shift = true;
        refreshContextAction();
      }
      if (event.key === "Control" || event.key === "Meta") {
        modifierState.pan = true;
        refreshContextAction();
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
      if ((event.key === "Delete" || event.key === "Backspace") && state.selectedOriginId) {
        if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
        event.preventDefault();
        deleteSelectedOrigin();
      }
    });

    document.addEventListener("keyup", (event) => {
      if (event.key === "Shift") modifierState.shift = false;
      if (event.key === "Control" || event.key === "Meta") modifierState.pan = false;
      refreshContextAction();
    });

    window.addEventListener("blur", () => {
      modifierState = { shift: false, pan: false };
      refreshContextAction();
    });
    window.addEventListener("beforeunload", () => {
      if (videoDownloadUrl) URL.revokeObjectURL(videoDownloadUrl);
    });
    window.addEventListener("resize", render);
  }

  function collectElements() {
    [
      "dnaCanvas",
      "canvasFrame",
      "canvasLegend",
      "chromosomeRuler",
      "undoButton",
      "redoButton",
      "resetButton",
      "downloadControl",
      "downloadButton",
      "downloadButtonLabel",
      "downloadMenu",
      "exportPngButton",
      "exportSvgButton",
      "exportPdfButton",
      "exportMp4Button",
      "deleteOriginButton",
      "clearCutsButton",
      "playButton",
      "playIcon",
      "playLabel",
      "statusMessage",
      "videoSaveLink",
      "selectionMessage",
      "modelControl",
      "lengthControl",
      "progressControl",
      "pairResolutionControl",
      "basePairWidthControl",
      "weightControl",
      "doubleStrandHeightControl",
      "daughterSpacingControl",
      "transitionTightnessControl",
      "speedControl",
      "lengthOutput",
      "progressOutput",
      "pairResolutionOutput",
      "basePairWidthOutput",
      "weightOutput",
      "doubleStrandHeightOutput",
      "daughterSpacingOutput",
      "transitionTightnessOutput",
      "speedOutput",
      "zoomOutButton",
      "zoomInButton",
      "fitViewButton",
      "zoomOutput",
      "lengthStat",
      "originStat",
      "forkStat",
      "replicatedStat",
      "templateAColor",
      "templateBColor",
      "newDnaColor",
      "basePairColor",
      "backgroundColorControl",
      "pairsToggle",
      "newDnaToggle",
      "labelsToggle",
      "crossoverGapsToggle",
      "gridToggle",
      "alwaysShowControlsToggle",
    ].forEach((id) => {
      elements[id === "dnaCanvas" ? "canvas" : id] = byId(id);
    });
  }

  function initialise() {
    collectElements();
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
