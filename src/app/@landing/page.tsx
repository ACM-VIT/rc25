import SignInButton from '@/components/buttons/sign-in';
import type React from 'react';
import LandOne from '@/components/landing/landone';

const Page: React.FC = () => {
  return (
    <div className='bg-black min-h-screen text-white'>
      <h1>Landing Page</h1>
      <SignInButton />
      <LandOne />
    </div>
  );
};

export default Page;