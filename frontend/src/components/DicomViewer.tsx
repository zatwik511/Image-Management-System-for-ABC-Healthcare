import { useEffect, useRef } from 'react';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import * as dicomParser from 'dicom-parser';

// Configure the WADO Image Loader
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

cornerstoneWADOImageLoader.configure({
  useWebWorkers: true,
});

interface DicomViewerProps {
  imageUrl: string;
  className?: string;
}

export function DicomViewer({ imageUrl, className = '' }: DicomViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = viewerRef.current;
    if (!element) return;

    // Enable the element for Cornerstone
    cornerstone.enable(element);

    // Construct the full URL for the DICOM file
    const fullUrl = `http://localhost:3000${imageUrl}`;
    
    // Create a Cornerstone-compatible image ID
    const imageId = `wadouri:${fullUrl}`;

    // Load and display the DICOM image
    cornerstone.loadImage(imageId).then((image) => {
      cornerstone.displayImage(element, image);
      
      // Fit image to viewport
      cornerstone.resize(element, true);
    }).catch((error) => {
      console.error('Error loading DICOM image:', error);
    });

    // Cleanup when component unmounts
    return () => {
      cornerstone.disable(element);
    };
  }, [imageUrl]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const element = viewerRef.current;
      if (element && cornerstone.getEnabledElement(element)) {
        cornerstone.resize(element, true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={viewerRef}
      className={`dicom-viewer ${className}`}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        backgroundColor: '#000',
      }}
    />
  );
}
