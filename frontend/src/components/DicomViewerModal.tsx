import { useEffect, useRef, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import * as dicomParser from 'dicom-parser';

cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

cornerstoneWADOImageLoader.configure({
  useWebWorkers: true,
});

interface DicomViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageInfo: {
    type: string;
    disease: string;
  };
}

export function DicomViewerModal({ isOpen, onClose, imageUrl, imageInfo }: DicomViewerModalProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const element = viewerRef.current;
    if (!element) return;

    setIsLoading(true);
    setError('');

    try {
      cornerstone.enable(element);

      const fullUrl = `http://localhost:3000${imageUrl}`;
      const imageId = `wadouri:${fullUrl}`;

      cornerstone.loadImage(imageId)
        .then((image) => {
          cornerstone.displayImage(element, image);
          cornerstone.resize(element, true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Error loading DICOM:', err);
          setError('Failed to load DICOM image');
          setIsLoading(false);
        });

      return () => {
        try {
          cornerstone.disable(element);
        } catch (e) {
          // Element might already be disabled
        }
      };
    } catch (err) {
      console.error('Error initializing viewer:', err);
      setError('Failed to initialize DICOM viewer');
      setIsLoading(false);
    }
  }, [isOpen, imageUrl]);

  const handleZoomIn = () => {
    const element = viewerRef.current;
    if (!element) return;

    const viewport = cornerstone.getViewport(element);
    viewport.scale += 0.25;
    cornerstone.setViewport(element, viewport);
  };

  const handleZoomOut = () => {
    const element = viewerRef.current;
    if (!element) return;

    const viewport = cornerstone.getViewport(element);
    viewport.scale -= 0.25;
    cornerstone.setViewport(element, viewport);
  };

  const handleRotate = () => {
    const element = viewerRef.current;
    if (!element) return;

    const viewport = cornerstone.getViewport(element);
    viewport.rotation += 90;
    cornerstone.setViewport(element, viewport);
  };

  const handleReset = () => {
    const element = viewerRef.current;
    if (!element) return;

    cornerstone.reset(element);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">DICOM Viewer</h2>
            <p className="text-sm text-gray-600">
              {imageInfo.type} - {imageInfo.disease}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Close"  // ✅ ADDED: Tooltip
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 p-4 border-b bg-gray-50">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Zoom In"  // ✅ ADDED: Tooltip
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Zoom Out"  // ✅ ADDED: Tooltip
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={handleRotate}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Rotate 90°"  // ✅ ADDED: Tooltip
          >
            <RotateCw className="w-5 h-5" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Reset View"  // ✅ ADDED: Tooltip
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>

        {/* Viewer Area */}
        <div className="flex-1 relative bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white">Loading DICOM image...</div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-red-500">{error}</div>
            </div>
          )}
          <div
            ref={viewerRef}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </div>
      </div>
    </div>
  );
}
