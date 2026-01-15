import { useState } from 'react';
import Viewer from 'react-viewer';
import { usePatientImages, useDeleteImage } from '../hooks/useImages';
import type { MedicalImage } from '../types';
import { Trash2, Eye, Image as ImageIcon } from 'lucide-react';
import { DicomViewerModal } from './DicomViewerModal';

interface PatientImageViewerProps {
  patientId: string;
}

export function PatientImageViewer({ patientId }: PatientImageViewerProps) {
  const [viewerVisible, setViewerVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dicomViewerOpen, setDicomViewerOpen] = useState(false);
  const [selectedDicomImage, setSelectedDicomImage] = useState<MedicalImage | null>(null);
  const { data: images, isLoading, error } = usePatientImages(patientId);
  const deleteImage = useDeleteImage();

  // Helper function to check if file is DICOM
  const isDicomFile = (imageUrl: string) => {
    return /\.(dcm|dicom|dic)$/i.test(imageUrl);
  };

  const handleViewImage = (index: number) => {
    const image = images?.[index];
    if (image && isDicomFile(image.imageUrl || '')) {
      // Open DICOM viewer for DICOM files
      setSelectedDicomImage(image);
      setDicomViewerOpen(true);
    } else {
      // For regular images, find the correct index in the filtered array
      const regularImages = images?.filter(img => !isDicomFile(img.imageUrl || '')) || [];
      const regularImageIndex = regularImages.findIndex(img => img.id === image?.id);
      
      setActiveIndex(regularImageIndex >= 0 ? regularImageIndex : 0);
      setViewerVisible(true);
    }
  };

  const handleDeleteImage = async (imageId: string, imageName: string) => {
    if (window.confirm(`Are you sure you want to delete this image: ${imageName}?`)) {
      try {
        await deleteImage.mutateAsync(imageId);
        alert('Image deleted successfully!');
      } catch (err) {
        alert('Failed to delete image');
      }
    }
  };

  // Transform ONLY non-DICOM images for react-viewer
  const viewerImages = images
    ?.filter(img => !isDicomFile(img.imageUrl || ''))
    .map((img) => ({
      src: `http://localhost:3000${img.imageUrl || ''}`,
      alt: `${img.type} - ${img.diseaseClassification}`,
      downloadUrl: `http://localhost:3000${img.imageUrl || ''}`,
    })) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        Error loading images: {error.message}
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">No medical images uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Medical Images ({images.length})</h3>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => {
          const isDicom = isDicomFile(image.imageUrl || '');
          
          return (
            <div
              key={image.id}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
            >
              {/* Image Preview */}
              <div className="relative aspect-video bg-gray-100">
                {isDicom ? (
                  // DICOM file placeholder - clickable
                  <div 
                    className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 cursor-pointer hover:from-blue-100 hover:to-blue-200 transition-colors"
                    onClick={() => handleViewImage(index)}
                  >
                    <svg className="w-20 h-20 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm font-semibold text-blue-800">DICOM File</p>
                    <p className="text-xs text-blue-600 mt-1">Click to view</p>
                  </div>
                ) : (
                  // Regular image
                  <img
                    src={`http://localhost:3000${image.imageUrl}`}
                    alt={`${image.type} scan`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => handleViewImage(index)}
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23e5e7eb"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af">Image Not Found</text></svg>';
                    }}
                  />
                )}
                <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                  {image.type}
                </div>
                {isDicom && (
                  <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    DICOM
                  </div>
                )}
              </div>

              {/* Image Info */}
              <div className="p-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Disease:</span>
                    <p className="text-sm text-gray-900">{image.diseaseClassification || 'Not classified'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Uploaded:</span>
                    <p className="text-sm text-gray-600">
                      {new Date(image.uploadedAt).toLocaleDateString()} at{' '}
                      {new Date(image.uploadedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Uploaded by:</span>
                    <p className="text-sm text-gray-600">{image.uploadedBy}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleViewImage(index)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteImage(image.id, `${image.type} - ${image.diseaseClassification}`)}
                    disabled={deleteImage.isPending}
                    className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Regular Image Viewer Modal */}
      <Viewer
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
        images={viewerImages}
        activeIndex={activeIndex}
        zoomable
        rotatable
        scalable
        downloadable
        drag
        attribute={false}
        zoomSpeed={0.1}
      />

      {/* DICOM Viewer Modal */}
      {selectedDicomImage && (
        <DicomViewerModal
          isOpen={dicomViewerOpen}
          onClose={() => {
            setDicomViewerOpen(false);
            setSelectedDicomImage(null);
          }}
          imageUrl={selectedDicomImage.imageUrl || ''}
          imageInfo={{
            type: selectedDicomImage.type,
            disease: selectedDicomImage.diseaseClassification || 'Unknown',
          }}
        />
      )}
    </div>
  );
}
