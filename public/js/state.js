export let currentPattern = 0;
export let currentPalette = 0;
export let seed = 42;
export let isInverted = true;
export let fitMode = 'crop'; // 'crop' or 'fit'
export let zoomLevel = 100;  // percentage e.g. 100 = 100%

export function setCurrentPattern(val) { currentPattern = val; }
export function setCurrentPalette(val) { currentPalette = val; }
export function setSeed(val) { seed = val; }
export function setInverted(val) { isInverted = val; }
export function setFitMode(val) { fitMode = val; }
export function setZoomLevel(val) { zoomLevel = Math.max(50, Math.min(200, val)); }
