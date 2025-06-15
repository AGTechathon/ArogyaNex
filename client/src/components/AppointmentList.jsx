import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/appointments', {
          headers: {
            Authorization: `Bearer ${await currentUser.getIdToken()}`
          }
        });
        setAppointments(response.data);
      } catch (err) {
        setError('Failed to fetch appointments. Please try again later.');
        console.error('Error fetching appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [currentUser]);

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await axios.delete(`http://localhost:5000/api/appointments/${appointmentId}`, {
        headers: {
          Authorization: `Bearer ${await currentUser.getIdToken()}`
        }
      });
      setAppointments(appointments.filter(apt => apt._id !== appointmentId));
    } catch (err) {
      console.error('Error canceling appointment:', err);
      alert('Failed to cancel appointment. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading appointments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">My Appointments</h2>
        <p className="mt-2 text-lg text-gray-600">
          View and manage your upcoming appointments
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {appointments.map((appointment) => (
            <li key={appointment._id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      Dr. {appointment.doctor.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(appointment.date).toLocaleDateString()} at{' '}
                      {new Date(appointment.date).toLocaleTimeString()}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{appointment.reason}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        appointment.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {appointment.status}
                    </span>
                    {appointment.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancelAppointment(appointment._id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {appointments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            You don't have any appointments yet. Book your first appointment now!
          </div>
        )}
      </div>
    </div>
  );
} 