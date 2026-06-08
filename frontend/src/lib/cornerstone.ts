import * as cornerstone from 'cornerstone-core';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import * as dicomParser from 'dicom-parser';

let initialized = false;

export function initCornerstone(): void {
  if (initialized) return;
  cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
  cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
  // useWebWorkers requires codec worker files served as separate static assets,
  // which Vite does not bundle — disable to run decoding on the main thread instead
  cornerstoneWADOImageLoader.configure({ useWebWorkers: false });
  initialized = true;
}
