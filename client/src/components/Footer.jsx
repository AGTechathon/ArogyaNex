import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  return (
    <footer className="mt-20 bg-gray-900 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="flex items-center text-white">
              <HeartIcon className="h-8 w-auto mr-3 text-indigo-500" aria-hidden="true" />
              <span className="text-2xl font-bold">Healthcare AI</span>
            </Link>
            <p className="mt-4 text-gray-400 max-w-sm">
              Empowering rural communities with AI-powered healthcare solutions. Get instant
              health advice, emergency support, and medical report analysis in your local
              language.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 className="mb-6 text-sm font-semibold text-white uppercase">Services</h2>
              <ul className="text-gray-400 font-medium space-y-2">
                <li><Link to="/chatbot" className="hover:text-white">AI Health Chatbot</Link></li>
                <li><Link to="/emergency" className="hover:text-white">Emergency Alert</Link></li>
                <li><Link to="/blood-reports" className="hover:text-white">Blood Report Analysis</Link></li>
                <li><Link to="/xray-analyzer" className="hover:text-white">X-ray Analysis</Link></li>
                <li><Link to="/doctors" className="hover:text-white">Online Appointments</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold text-white uppercase">Contact</h2>
              <ul className="text-gray-400 font-medium space-y-2">
                <li><a href="#" className="hover:text-white">+91 12345 67890</a></li>
                <li><a href="mailto:help@healthcareai.com" className="hover:text-white">help@healthcareai.com</a></li>
                <li><a href="#" className="hover:text-white">Rural Health Centers</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 