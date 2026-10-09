import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items }) => {
  return (
    <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
      <Link to="/" className="text-neutral-400 hover:text-neutral-600 transition-colors">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
          {item.path && index < items.length - 1 ? (
            <Link to={item.path} className="text-neutral-500 hover:text-neutral-800 transition-colors font-medium">
              {item.label}
            </Link>
          ) : (
            <span className="text-neutral-800 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
