import type React from 'react';
import LandOne from '@/components/landing/landone';
import LandingNavbar from '@/components/landing/landing-navbar';
import { Timeline } from '@/components/landing/timeline';

const Page: React.FC = () => {
  const timelineData = [
    {
      title: "8:30 am",
      content: <p className="text-neutral-300">Report At the Venue</p>
    },
    {
      title: "9:30 am",
      content: <p className="text-neutral-300">Registrations Close</p>
    },
    {
      title: "10:00 am",
      content: <p className="text-neutral-300">Round 1</p>
    },
    {
      title: "1:00 pm",
      content: <p className="text-neutral-300">Lunch Break</p>
    },
    {
      title: "2:00 pm",
      content: <p className="text-neutral-300">Round 2</p>
    },
    {
      title: "5:00 pm",
      content: <p className="text-neutral-300">Closing Ceremony</p>
    }
  ];

  return (
    <div className='bg-black min-h-screen text-white'>
      <LandingNavbar/>
      <LandOne />
      {/* <Timeline data={timelineData} /> */}
    </div>
  );
};

export default Page;