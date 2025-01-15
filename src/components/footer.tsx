import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black w-full py-4 absolute bottom-0 overflow-hidden">
      <div className="flex flex-row animate-slide-left gap-20">
        <div className="bg-gray-600 text-white w-40 h-10 flex items-center justify-center rounded-lg">
          Sponsor 1
        </div>
        <div className="bg-gray-600 text-white w-40 h-10 flex items-center justify-center rounded-lg">
          Sponsor 2
        </div>
        <div className="bg-gray-600 text-white w-40 h-10 flex items-center justify-center rounded-lg">
          Sponsor 3
        </div>
       
      </div>
    </footer>
  );
};

export default Footer;
