import { useState } from 'react';
import { useStaff, useCreateStaff, useDeleteStaff } from '../hooks/useStaff';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Trash2 } from 'lucide-react';

export function StaffManagement() {
  const { data: staff, isLoading } = useStaff();
  const createStaff = useCreateStaff();
  const deleteStaff = useDeleteStaff();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    role: 'doctor' as 'radiologist' | 'doctor' | 'admin',
    specialization: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStaff.mutateAsync(formData);
      setFormData({
        name: '',
        address: '',
        role: 'doctor',
        specialization: '',
      });
    } catch (error) {
      console.error('Failed to create staff:', error);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Staff Management</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Staff Form */}
          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-6">Add Staff Member</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input-field"
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
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="role" className="block text-sm font-medium mb-2">
                  Role *
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as 'radiologist' | 'doctor' | 'admin',
                    })
                  }
                  className="input-field"
                >
                  <option value="doctor">Doctor</option>
                  <option value="radiologist">Radiologist</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label
                  htmlFor="specialization"
                  className="block text-sm font-medium mb-2"
                >
                  Specialization
                </label>
                <input
                  id="specialization"
                  type="text"
                  value={formData.specialization}
                  onChange={(e) =>
                    setFormData({ ...formData, specialization: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                {createStaff.isPending ? 'Adding...' : 'Add Staff Member'}
              </button>
            </form>
          </div>

          {/* Staff List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Current Staff</h2>

            {staff && staff.length > 0 ? (
              <div className="space-y-4">
                {staff.map((member) => (
                  <div key={member.id} className="card p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.address}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Role:</span>{' '}
                            <span className="capitalize bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                              {member.role}
                            </span>
                          </p>
                          {member.specialization && (
                            <p className="text-sm">
                              <span className="font-medium">Specialization:</span>{' '}
                              {member.specialization}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteStaff.mutate(member.id)}
                        disabled={deleteStaff.isPending}
                        className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-6 text-center text-gray-500">
                No staff members yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
