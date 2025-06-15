import { Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <Disclosure as="nav" className="bg-transparent absolute top-0 left-0 w-full z-10 ">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-9">
            <div className="flex h-16 justify-between">
              <div className="flex items-center">
                <Link to="/" className="flex items-center text-indigo-600">
                  <HeartIcon className="h-8 w-auto mr-2" aria-hidden="true" />
                  <span className="text-2xl font-bold">Healthcare AI</span>
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {currentUser ? (
                  <Link
                    to="#"
                    onClick={handleLogout}
                    className="ml-4 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Logout
                  </Link>
                ) : (
                  <div className="flex space-x-4">
                    {/* No login/signup links in Navbar per image, rely on Landing Page or specific auth routes */}
                  </div>
                )}
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {currentUser && (
                <Disclosure.Button
                  as="button"
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                >
                  Logout
                </Disclosure.Button>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
} 