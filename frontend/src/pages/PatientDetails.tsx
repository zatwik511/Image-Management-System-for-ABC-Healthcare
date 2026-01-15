import { useParams } from 'react-router-dom';
import { usePatient } from '../hooks/usePatients';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PatientImageViewer } from '../components/PatientImageViewer';
import { ImageUploader } from '../components/ImageUploader';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PatientDetails() {
  const { patientId } = useParams<{ patientId: string }>();
  const { data: patient, isLoading, error } = usePatient(patientId!);

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        Error loading patient: {error.message}
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="bg-yellow-50 text-yellow-600 p-4 rounded-md">
        Patient not found
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Link
        to="/patients"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Patients
      </Link>

      {/* Patient Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{patient.name}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-700">Address:</span>
            <p className="text-gray-900">{patient.address}</p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-700">Total Cost:</span>
            <p className="text-gray-900 text-lg font-semibold">£{patient.totalCost.toFixed(2)}</p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-700">Diagnosis:</span>
            <p className="text-gray-900">{patient.diagnosis || 'Not diagnosed yet'}</p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-700">Conditions:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {patient.conditions.length > 0 ? (
                patient.conditions.map((condition, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {condition}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">No conditions listed</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <ImageUploader patientId={patient.id} />
      </div>

      {/* Image Viewer Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <PatientImageViewer patientId={patient.id} />
      </div>
    </div>
  );
}
