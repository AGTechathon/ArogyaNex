import { Link } from 'react-router-dom';
import { HeartIcon, ClockIcon, GlobeAltIcon, BoltIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function FadeInSection(props) {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => setVisible(entry.isIntersecting));
    });
    
    // Observe the current DOM element
    if (domRef.current) {
      observer.observe(domRef.current);
    }

    // Disconnect observer on cleanup, but only if domRef.current exists
    return () => {
      if (domRef.current) {
        observer.unobserve(domRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`fade-in-section ${isVisible ? 'is-visible' : ''}`}
      ref={domRef}
    >
      {props.children}
    </div>
  );
}

export default function LandingPage() {
  const { currentUser } = useAuth();

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-700 pt-14 pb-24 sm:pb-32 lg:pb-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <HeartIcon className="mx-auto h-16 w-16 text-white" aria-hidden="true" />
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Rural Health Assistant
            </h1>
            <p className="mt-6 text-lg leading-8 text-indigo-200">
              Your complete healthcare companion - AI-powered health advice, emergency
              support, and medical report analysis in your local language
            </p>
            {!currentUser && (
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  to="/login"
                  className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Login
                </Link>
                <Link to="/signup" className="text-sm font-semibold leading-6 text-white">
                  Sign Up <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <FadeInSection>
        <div className="mx-auto -mt-20 max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
            {/* AI Health Chatbot Card */}
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mx-auto">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.75 9.75 0 01-5.044-1.176l-.44.978c-.307.769-1.399 1.125-2.247.872L3 20.25.228 17.594a1.002 1.002 0 01.872-2.247l.978-.44A9.75 9.75 0 011.5 12C1.5 7.444 5.53 3.75 10.5 3.75S19.5 7.444 19.5 12z" /></svg>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900 text-center">AI Health Chatbot</h3>
              <p className="mt-2 text-gray-600 text-center text-sm">Get instant health advice and symptom checks from our AI Assistant</p>
              <ul className="mt-4 text-gray-700 text-sm list-disc list-inside space-y-1">
                <li>24/7 health consultation</li>
                <li>Symptom analysis</li>
                <li>First-aid guidance</li>
                <li>Home remedy suggestions</li>
              </ul>
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
              <ul className="mt-4 text-gray-700 text-sm list-disc list-inside space-y-1">
                <li>GPS location tracking</li>
                <li>Nearest hospital finder</li>
                <li>Automatic ambulance dispatch</li>
                <li>Emergency contact alerts</li>
              </ul>
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
              <ul className="mt-4 text-gray-700 text-sm list-disc list-inside space-y-1">
                <li>PDF report analysis</li>
                <li>Simple explanations</li>
                <li>Health recommendations</li>
                <li>Diet & exercise tips</li>
              </ul>
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
              <ul className="mt-4 text-gray-700 text-sm list-disc list-inside space-y-1">
                <li>X-ray image analysis</li>
                <li>Clear explanations</li>
                <li>Visual highlights</li>
                <li>Next steps guidance</li>
              </ul>
              <div className="mt-6 text-center">
                <Link to="/xray-analyzer" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                  Analyze X-ray
                </Link>
              </div>
            </div>

            {/* Online Appointments Card */}
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 mx-auto">
                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5m18 7.5v-7.5m-9 5.25h.008v.008H12zm0 2.25h.008v.008H12z" /></svg>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900 text-center">Online Appointments</h3>
              <p className="mt-2 text-gray-600 text-center text-sm">Schedule consultations with qualified doctors</p>
              <ul className="mt-4 text-gray-700 text-sm list-disc list-inside space-y-1">
                <li>Video consultations</li>
                <li>Specialist doctors</li>
                <li>Flexible scheduling</li>
                <li>Multi-language support</li>
              </ul>
              <div className="mt-6 text-center">
                <Link to="/doctors" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                  Book Appointment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* Features Grid */}
      <FadeInSection>
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto">
              <ClockIcon className="h-8 w-8 text-green-600" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">24/7 Available</h3>
            <p className="mt-2 text-sm text-gray-600">Round-the-clock healthcare support whenever you need it.</p>
          </div>

          <div className="text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mx-auto">
              <GlobeAltIcon className="h-8 w-8 text-blue-600" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Multi-Language</h3>
            <p className="mt-2 text-sm text-gray-600">Support in your local language for better understanding.</p>
          </div>

          <div className="text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mx-auto">
              <BoltIcon className="h-8 w-8 text-red-600" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Instant Response</h3>
            <p className="mt-2 text-sm text-gray-600">Emergency alerts and quick healthcare assistance.</p>
          </div>

          <div className="text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 mx-auto">
              <ShieldCheckIcon className="h-8 w-8 text-purple-600" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Secure & Private</h3>
            <p className="mt-2 text-sm text-gray-600">Your health data is protected with enterprise-grade security.</p>
          </div>
        </div>
      </FadeInSection>

      {/* Footer */}
      {/* This footer content has been moved to its own Footer.jsx component and will be rendered globally in App.jsx */}

    </div>
  );
} 