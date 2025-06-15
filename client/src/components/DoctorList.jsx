import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/doctors', {
          headers: {
            Authorization: `Bearer ${await currentUser.getIdToken()}`
          }
        });
        setDoctors(response.data);
      } catch (err) {
        setError('Failed to fetch doctors. Please try again later.');
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading doctors...</div>
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
        <h2 className="text-3xl font-bold text-gray-900">Find a Doctor</h2>
        <p className="mt-2 text-lg text-gray-600">
          Book an appointment with our experienced healthcare professionals
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <div
            key={doctor._id}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-xl font-medium text-indigo-600">
                    {doctor.name.charAt(0)}
                  </span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Dr. {doctor.name}</h3>
                  <p className="text-sm text-gray-500">{doctor.specialization}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">{doctor.qualification}</p>
                <p className="mt-2 text-sm text-gray-600">
                  Experience: {doctor.experience} years
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">
                    Consultation Fee: ${doctor.consultationFee}
                  </span>
                  <Link
                    to={`/appointments/new/${doctor._id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Book Appointment
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {doctors.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No doctors available at the moment. Please check back later.
        </div>
      )}
    </div>
  );
} 