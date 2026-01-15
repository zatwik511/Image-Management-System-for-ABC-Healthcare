import { useState } from 'react';
import { useCreatePatient } from '../hooks/usePatients';
import { LoadingSpinnerInline } from './LoadingSpinner';

export function PatientForm() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [conditions, setConditions] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const createPatient = useCreatePatient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!name.trim() || !address.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await createPatient.mutateAsync({
        name: name.trim(),
        address: address.trim(),
        conditions: conditions
          .split(',')
          .map((c) => c.trim())
          .filter((c) => c),
      });

      setSuccess(true);
      setName('');
      setAddress('');
      setConditions('');

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create patient'
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card p-6 max-w-lg mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Add New Patient</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          Patient created successfully!
        </div>
      )}

      <div className="form-group">
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Full Name *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
          placeholder="e.g., John Doe"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="address" className="block text-sm font-medium mb-2">
          Address *
        </label>
        <input
          id="address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="input-field"
          placeholder="e.g., 123 Main Street, London"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="conditions" className="block text-sm font-medium mb-2">
          Medical Conditions (comma-separated)
        </label>
        <textarea
          id="conditions"
          value={conditions}
          onChange={(e) => setConditions(e.target.value)}
          className="input-field"
          placeholder="e.g., Diabetes, Hypertension, Asthma"
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={createPatient.isPending}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {createPatient.isPending && <LoadingSpinnerInline />}
        {createPatient.isPending ? 'Creating...' : 'Create Patient'}
      </button>
    </form>
  );
}
