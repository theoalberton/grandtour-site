import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-6 w-6 text-primary-500" />
              <span className="font-heading font-bold text-xl">Grand Tour</span>
            </div>
            <p className="mt-2 text-gray-400">
              Seu guia turístico digital por áudio para conhecer a Espanha com exclusividade e comodidade.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-500">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Úteis</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary-500">Home</Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-primary-500">Login</Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-400 hover:text-primary-500">Criar Conta</Link>
              </li>
              <li>
                <Link to="/account" className="text-gray-400 hover:text-primary-500">Minha Conta</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail size={16} className="text-gray-400" />
                <span className="text-gray-400">contato@grandtour.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={16} className="text-gray-400" />
                <span className="text-gray-400">+34 123 456 789</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Grand Tour. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;