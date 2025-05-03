import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, User, LogOut, Menu, X } from 'lucide-react';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';

const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-primary-500" />
              <span className="font-heading font-bold text-xl text-primary-800">Grand Tour</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-500">
              Home
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/account" 
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-500"
                >
                  Minha Conta
                </Link>
                
                {user.isAdmin && (
                  <Link 
                    to="/admin" 
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-500"
                  >
                    Admin
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="ml-2 flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-500"
                >
                  <LogOut size={16} />
                  <span>Sair</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Criar Conta</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-500 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-md">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/account"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Minha Conta
                </Link>
                
                {user.isAdmin && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500"
                >
                  <LogOut size={16} className="mr-2" />
                  <span>Sair</span>
                </button>
              </>
            ) : (
              <div className="space-y-2 mt-2">
                <Link 
                  to="/login" 
                  className="block w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button variant="outline" fullWidth>Login</Button>
                </Link>
                <Link 
                  to="/register" 
                  className="block w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button fullWidth>Criar Conta</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;