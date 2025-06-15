import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { HeartIcon, ClockIcon, GlobeAltIcon, BoltIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/appointments/upcoming', {
          headers: {
            Authorization: `Bearer ${await currentUser.getIdToken()}`
          }
        });
        setUpcomingAppointments(response.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch appointments if currentUser is available
    if (currentUser) {
      fetchAppointments();
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen-minus-navbar py-8 bg-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate text-center md:text-left">
              Welcome back, {currentUser?.displayName || 'User'}!
            </h2>
          </div>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
          {/* AI Health Chatbot Card */}
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mx-auto">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.75 9.75 0 01-5.044-1.176l-.44.978c-.307.769-1.399 1.125-2.247.872L3 20.25.228 17.594a1.002 1.002 0 01.872-2.247l.978-.44A9.75 9.75 0 011.5 12C1.5 7.444 5.53 3.75 10.5 3.75S19.5 7.444 19.5 12z" /></svg>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900 text-center">AI Health Chatbot</h3>
            <p className="mt-2 text-gray-600 text-center text-sm">Get instant health advice and symptom checks from our AI Assistant</p>
            <div className="mt-6 text-center">
              <Link to="/chatbot" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Start Chatting
              </Link>
            </div>
          </div>

          {/* Emergency Alert Card */}
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mx-auto">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.174 3.352 1.9 3.352h13.713c1.726 0 2.766-1.852 1.9-3.352l-6.835-11.383c-.47-.78-.47-1.72 0-2.5L12 9z" /></svg>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900 text-center">Emergency Alert</h3>
            <p className="mt-2 text-gray-600 text-center text-sm">Instant ambulance dispatch from GPS location to nearest hospital</p>
            <div className="mt-6 text-center">
              <Link to="/emergency" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                Open Emergency Alert
              </Link>
            </div>
          </div>

          {/* Blood Report Analyzer Card */}
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mx-auto">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0h.008v.008H21zm-12 8.25h.008v.008H9zm8.25-6.75h.008v.008H17.25z" /></svg>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900 text-center">Blood Report Analyzer</h3>
            <p className="mt-2 text-gray-600 text-center text-sm">Understand your blood test results in simple language</p>
            <div className="mt-6 text-center">
              <Link to="/blood-reports" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Analyze Report
              </Link>
            </div>
          </div>

          {/* X-ray Analyzer Card */}
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 mx-auto">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3h4.5a2.25 2.25 0 012.25 2.25V16.5m-10.5 0V5.25a2.25 2.25 0 012.25-2.25h4.5M12 18.75L15 21m-3-2.25L9 21M12 18.75V21M10.5 6H13.5M6 18H18" /></svg>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900 text-center">X-ray Analyzer</h3>
            <p className="mt-2 text-gray-600 text-center text-sm">Get simple explanations of your X-ray results</p>
            <div className="mt-6 text-center">
              <Link to="/xray-analyzer" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                Analyze X-ray
              </Link>
            </div>
          </div>

          {/* Online Appointments Card - Find a Doctor */}
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 mx-auto">
              <HeartIcon className="h-6 w-6 text-orange-600" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900 text-center">Find a Doctor</h3>
            <p className="mt-2 text-gray-600 text-center text-sm">Book appointments with qualified doctors</p>
            <div className="mt-6 text-center">
              <Link to="/doctors" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Find Doctors
              </Link>
            </div>
          </div>

          {/* Online Appointments Card - My Appointments */}
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 mx-auto">
              <ClockIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900 text-center">My Appointments</h3>
            <p className="mt-2 text-gray-600 text-center text-sm">View and manage your scheduled appointments</p>
            <div className="mt-6 text-center">
              <Link to="/appointments" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                View Appointments
              </Link>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments Section - Retained */}
        <div className="mt-12 bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Appointments</h3>
              {loading ? (
                <div className="mt-4 text-center text-gray-500">Loading appointments...</div>
              ) : upcomingAppointments.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            Dr. {appointment.doctor.name}
                          </h4>
                          <p className="mt-1 text-sm text-gray-500">
                            {new Date(appointment.date).toLocaleDateString()} at{' '}
                            {new Date(appointment.date).toLocaleTimeString()}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">{appointment.reason}</p>
                        </div>
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
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 text-center text-gray-500">
                  No upcoming appointments. Book your first appointment now!
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
} 