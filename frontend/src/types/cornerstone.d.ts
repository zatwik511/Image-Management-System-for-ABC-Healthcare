declare module 'cornerstone-core' {
  export interface Viewport {
    scale: number;
    rotation: number;
    translation: {
      x: number;
      y: number;
    };
    voi: {
      windowWidth: number;
      windowCenter: number;
    };
    invert: boolean;
    pixelReplication: boolean;
    hflip: boolean;
    vflip: boolean;
    modalityLUT: any;
    voiLUT: any;
  }

  export interface Image {
    imageId: string;
    minPixelValue: number;
    maxPixelValue: number;
    slope: number;
    intercept: number;
    windowCenter: number;
    windowWidth: number;
    render: any;
    getPixelData: () => Uint8Array | Int16Array | Uint16Array;
    rows: number;
    columns: number;
    height: number;
    width: number;
    color: boolean;
    columnPixelSpacing: number;
    rowPixelSpacing: number;
    invert: boolean;
    sizeInBytes: number;
  }

  export interface EnabledElement {
    element: HTMLElement;
    image?: Image;
    viewport: Viewport;
    canvas: HTMLCanvasElement;
    invalid: boolean;
    needsRedraw: boolean;
  }

  export function enable(element: HTMLElement, options?: any): void;
  export function disable(element: HTMLElement): void;
  export function displayImage(element: HTMLElement, image: Image, viewport?: Viewport): void;
  export function loadImage(imageId: string): Promise<Image>;
  export function getViewport(element: HTMLElement): Viewport;
  export function setViewport(element: HTMLElement, viewport: Viewport): void;
  export function resize(element: HTMLElement, forcedResize?: boolean): void;
  export function reset(element: HTMLElement): void;
  export function getEnabledElement(element: HTMLElement): EnabledElement;
  export function updateImage(element: HTMLElement, invalidated?: boolean): void;
  export function draw(element: HTMLElement): void;
  export function invalidate(element: HTMLElement): void;
}

declare module 'cornerstone-wado-image-loader' {
  export const external: {
    cornerstone: any;
    dicomParser: any;
  };

  export function configure(options: {
    useWebWorkers?: boolean;
    decodeConfig?: any;
    [key: string]: any;
  }): void;

  export function wadouri(imageId: string, options?: any): any;
}

declare module 'dicom-parser' {
  export interface DataSet {
    byteArray: Uint8Array;
    elements: any;
  }

  export function parseDicom(byteArray: Uint8Array, options?: any): DataSet;
}
