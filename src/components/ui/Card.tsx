import React from 'react';
import { Link } from 'react-router-dom';

interface CardProps {
  imageUrl: string;
  title: string;
  subtitle?: string;
  href: string;
  badge?: string | number;
}

const Card: React.FC<CardProps> = ({ imageUrl, title, subtitle, href, badge }) => {
  // Log the image URL being used
  console.log('Card Image URL:', imageUrl);

  return (
    <Link 
      to={href} 
      className="relative block overflow-hidden rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-300"
    >
      <div 
        className="h-48 w-full bg-cover bg-center bg-no-repeat"
        // Use a placeholder if imageUrl is invalid or empty for debugging
        style={{ backgroundImage: `url(${imageUrl || '/placeholder.png'})` }} 
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70"></div>
      </div>
      
      <div className="absolute bottom-0 w-full p-4 text-white">
        <h3 className="text-xl font-semibold">{title}</h3>
        {subtitle && <p className="text-sm text-gray-200">{subtitle}</p>}
      </div>
      
      {badge && (
        <div className="absolute top-3 right-3 px-2 py-1 text-xs font-medium bg-primary-500 text-white rounded-md">
          {typeof badge === 'number' ? `${badge} tours` : badge}
        </div>
      )}
    </Link>
  );
};

export default Card;

