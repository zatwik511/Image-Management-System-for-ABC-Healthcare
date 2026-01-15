import { useState } from 'react';
import Viewer from 'react-viewer';
import { usePatientImages, useDeleteImage } from '../hooks/useImages';
import type { MedicalImage } from '../types';
import { Trash2, Eye, Image as ImageIcon } from 'lucide-react';
import { DicomViewerModal } from './DicomViewerModal';
import { config } from '../config'; // ✅ IMPORT CONFIG

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
      src: `${config.apiUrl}${img.imageUrl || ''}`, // ✅ FIXED: Use config
      alt: `${img.type} - ${img.diseaseClassification}`,
      downloadUrl: `${config.apiUrl}${img.imageUrl || ''}`, // ✅ FIXED: Use config
    })) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading images...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error loading images: {error.message}
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-600">
        <ImageIcon className="mx-auto mb-2 text-gray-400" size={48} />
        No medical images uploaded yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Medical Images ({images.length})
      </h3>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => {
          const isDicom = isDicomFile(image.imageUrl || '');
          return (
            <div key={image.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              {/* Image Preview */}
              {isDicom ? (
                // DICOM file placeholder - clickable
                <div
                  onClick={() => handleViewImage(index)}
                  className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:from-purple-200 hover:to-blue-200 transition-colors mb-3"
                >
                  <ImageIcon size={48} className="text-purple-600 mb-2" />
                  <p className="text-purple-700 font-semibold">DICOM File</p>
                  <p className="text-sm text-purple-600">Click to view</p>
                </div>
              ) : (
                // Regular image
                <img
                  src={`${config.apiUrl}${image.imageUrl || ''}`} // ✅ FIXED: Use config
                  alt={image.type}
                  className="h-48 w-full object-cover rounded-lg mb-3 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleViewImage(index)}
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><text x="50%" y="50%" text-anchor="middle">Image Not Found</text></svg>';
                  }}
                />
              )}

              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                  {image.type}
                </span>
                {isDicom && (
                  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                    DICOM
                  </span>
                )}
              </div>

              {/* Image Info */}
              <div className="space-y-1 text-sm mb-3">
                <p className="text-gray-700">
                  <span className="font-medium">Disease:</span>{' '}
                  {image.diseaseClassification || 'Not classified'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Uploaded:</span>{' '}
                  {new Date(image.uploadedAt).toLocaleDateString()} at{' '}
                  {new Date(image.uploadedAt).toLocaleTimeString()}
                </p>
                <p className="text-gray-600 text-xs truncate" title={image.uploadedBy}>
                  <span className="font-medium">Uploaded by:</span>{' '}
                  {image.uploadedBy}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewImage(index)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Eye size={16} />
                  View
                </button>
                <button
                  onClick={() => handleDeleteImage(image.id, `${image.type} - ${image.diseaseClassification}`)}
                  disabled={deleteImage.isPending}
                  className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
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
