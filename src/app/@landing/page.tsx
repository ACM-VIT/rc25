import SignInButton from '@/components/buttons/sign-in';
import type React from 'react';
import LandOne from '@/components/landing/landone';
import LandingNavbar from '@/components/landing/landing-navbar';

const Page: React.FC = () => {
  return (
    <div className='bg-black min-h-screen h-full text-white'>
      <LandingNavbar/>
      <LandOne />
    </div>
  );
};

export default Page;