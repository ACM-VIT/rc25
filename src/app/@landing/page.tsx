import type React from 'react';
import LandOne from '@/components/landing/landone';
import LandingNavbar from '@/components/landing/landing-navbar';
import HowItWorks from '@/components/landing/howitworks';

const Page: React.FC = () => {
  return (
    <div className='bg-black min-h-screen text-white'>
      <LandingNavbar/>
      <LandOne />
      <HowItWorks />
    </div>
  );
};

export default Page;