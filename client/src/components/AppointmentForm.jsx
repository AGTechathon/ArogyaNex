import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

export default function AppointmentForm() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    date: null,
    time: null,
    reason: '',
  });

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/doctors/${doctorId}`, {
          headers: {
            Authorization: `Bearer ${await currentUser.getIdToken()}`
          }
        });
        setDoctor(response.data);
      } catch (err) {
        setError('Failed to fetch doctor details. Please try again later.');
        console.error('Error fetching doctor:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.time || !formData.reason) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const appointmentDateTime = new Date(formData.date);
      appointmentDateTime.setHours(formData.time.getHours());
      appointmentDateTime.setMinutes(formData.time.getMinutes());

      await axios.post(
        'http://localhost:5000/api/appointments',
        {
          doctorId,
          date: appointmentDateTime,
          reason: formData.reason,
        },
        {
          headers: {
            Authorization: `Bearer ${await currentUser.getIdToken()}`
          }
        }
      );

      navigate('/appointments');
    } catch (err) {
      console.error('Error booking appointment:', err);
      alert('Failed to book appointment. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading doctor details...</div>
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
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Book an Appointment</h2>
          <p className="mt-2 text-lg text-gray-600">
            with Dr. {doctor.name} - {doctor.specialization}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <div className="mt-1">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={formData.date}
                  onChange={(newValue) => setFormData({ ...formData, date: newValue })}
                  minDate={new Date()}
                  renderInput={(params) => <input {...params} />}
                  className="w-full"
                />
              </LocalizationProvider>
            </div>
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700">
              Time
            </label>
            <div className="mt-1">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  value={formData.time}
                  onChange={(newValue) => setFormData({ ...formData, time: newValue })}
                  renderInput={(params) => <input {...params} />}
                  className="w-full"
                />
              </LocalizationProvider>
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
              Reason for Visit
            </label>
            <div className="mt-1">
              <textarea
                id="reason"
                name="reason"
                rows={4}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Please describe your symptoms or reason for visit"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/doctors')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Book Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 