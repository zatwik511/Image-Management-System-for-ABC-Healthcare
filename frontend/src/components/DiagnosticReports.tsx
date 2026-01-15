import { useDiagnosticReport } from '../hooks/useReports';
import { LoadingSpinner } from './LoadingSpinner';
import { FileText } from 'lucide-react';

interface DiagnosticReportsProps {
  patientId: string;
}

export function DiagnosticReports({ patientId }: DiagnosticReportsProps) {
  const { data: report, isLoading, error } = useDiagnosticReport(patientId);

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Error loading diagnostic report
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-8 text-gray-500">
        No diagnostic report available
      </div>
    );
  }

  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText size={24} className="text-primary-500" />
        <h2 className="text-2xl font-bold">Diagnostic Report</h2>
      </div>

      <section>
        <h3 className="font-semibold text-lg mb-2">Patient Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Name</p>
            <p className="font-medium">{report.patientName}</p>
          </div>
          <div>
            <p className="text-gray-600">Patient ID</p>
            <p className="font-medium">{report.patientID}</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-lg mb-2">Diagnosis</h3>
        <p className="text-gray-700">{report.diagnosis || 'Not specified'}</p>
      </section>

      {report.conditions.length > 0 && (
        <section>
          <h3 className="font-semibold text-lg mb-2">Conditions</h3>
          <div className="flex gap-2 flex-wrap">
            {report.conditions.map((condition) => (
              <span
                key={condition}
                className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
              >
                {condition}
              </span>
            ))}
          </div>
        </section>
      )}

      {Object.keys(report.diseaseClassifications).length > 0 && (
        <section>
          <h3 className="font-semibold text-lg mb-2">Disease Classifications</h3>
          <div className="space-y-2">
            {Object.entries(report.diseaseClassifications).map(
              ([disease, count]) => (
                <div key={disease} className="flex justify-between text-sm">
                  <span>{disease}</span>
                  <span className="font-medium">{count} image(s)</span>
                </div>
              )
            )}
          </div>
        </section>
      )}

      <section>
        <h3 className="font-semibold text-lg mb-2">Report Generated</h3>
        <p className="text-sm text-gray-600">
          {new Date(report.reportGeneratedAt).toLocaleString()}
        </p>
      </section>
    </div>
  );
}
