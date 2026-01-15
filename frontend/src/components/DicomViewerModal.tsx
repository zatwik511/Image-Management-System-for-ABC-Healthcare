import { useEffect, useRef, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import * as dicomParser from 'dicom-parser';
import { config } from '../config'; // ✅ IMPORT CONFIG

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

      const fullUrl = `${config.apiUrl}${imageUrl}`; // ✅ FIXED: Use config instead of hardcoded localhost
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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">DICOM Viewer</h2>
            <p className="text-sm text-gray-600">{imageInfo.type} - {imageInfo.disease}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-200">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          <button
            onClick={handleRotate}
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            title="Rotate 90°"
          >
            <RotateCw size={20} />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            title="Reset View"
          >
            <Maximize2 size={20} />
          </button>
        </div>

        {/* Viewer Area */}
        <div className="flex-1 relative bg-black overflow-hidden">
          <div
            ref={viewerRef}
            className="w-full h-full"
            style={{ minHeight: '400px' }}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-white text-lg">Loading DICOM image...</div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-red-500 text-lg">{error}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
