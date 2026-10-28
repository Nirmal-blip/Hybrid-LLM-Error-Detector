import React from 'react';

function PageHeader({ icon, title, subtitle, className = '' }) {
  return (
    <div className={`text-center mb-8 ${className}`}>
      {icon && <div className="text-6xl mb-4">{icon}</div>}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg md:text-lg text-gray-600 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default PageHeader;
