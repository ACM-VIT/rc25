'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Audiowide } from 'next/font/google';
import Image from 'next/image';
import rock from '@/app/assets/rock.svg';

const audiowide = Audiowide({
  subsets: ['latin'], 
  weight: ['400'],
  display: 'swap',
});

const prizes = [
  { title: '1st', amount: '₹00,000' },
  { title: '2nd', amount: '₹00,000' },
  { title: '3rd', amount: '₹00,000' },
  { title: '4th', amount: '₹00,000' }
];

export default function PrizePool() {
  const [isSpread, setIsSpread] = useState(false);
  const [flipped, setFlipped] = useState([false, false, false, false]);
  const [screenSize, setScreenSize] = useState('large');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 220 && window.innerWidth <= 480) {
        setScreenSize('phone');
      } else if (window.innerWidth < 640) {
        setScreenSize('small');
      } else if (window.innerWidth < 768) {
        setScreenSize('medium');
      } else {
        setScreenSize('large');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);

    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Trigger animations when component comes into view
            setIsSpread(true);
            setTimeout(() => {
              setFlipped([true, true, true, true]);
            }, 1000);
            
            // Disconnect observer after triggering
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.3, // Trigger when 30% of the component is visible
        rootMargin: '0px'
      }
    );

    // Start observing
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);

  const getPosition = (index: number) => {
    if (screenSize === 'phone') {
      return '50%';
    } else if (screenSize === 'small') {
      return index % 2 === 0 ? '25%' : '75%';
    } else if (screenSize === 'medium') {
      return index % 2 === 0 ? '25%' : '75%';
    } else {
      switch(index) {
        case 0: return '10%';
        case 1: return '35%';
        case 2: return '60%';
        case 3: return '85%';
        default: return '0%';
      }
    }
  };

  const getVerticalPosition = (index: number) => {
    if (screenSize === 'phone') {
      switch(index) {
        case 0: return '-150%';
        case 1: return '-30%';
        case 2: return '90%';
        case 3: return '210%';
        default: return '0%';
      }
    } else if (screenSize === 'small' || screenSize === 'medium') {
      return index < 2 ? '-80%' : '40%';
    } else {
      return '-90%';
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-y-auto md:overflow-hidden">
      {/* Top right rock */}
      <div className="absolute top-[-25%] hidden md:block right-[-55%] xs:right-[-130%] sm:right-[-100%] md:right-[-73%] lg:right-[-55%] xl:right-[-45%] z-0">
        <Image
          src={rock}
          alt="Rock decoration"
          width={900}
          height={800}
          priority
          className="opacity-50"
        />
      </div>

      {/* Bottom left rock */}
      <div className="absolute bottom-[-25%] hidden md:block left-[-45%] sm:left-[-30%] md:left-[-20%] lg:left-[-15%] xl:left-[-10%] z-0">
        <Image
          src={rock}
          alt="Rock decoration bottom"
          width={900}
          height={600}
          priority
          className="opacity-50"
        />
      </div>

      <h1 className={`text-4xl xs:text-[4rem] sm:text-[5rem] phone:mt-[-25%] md:text-[6.5rem] sm:mt-[-10%] md:mt-[5%] lg:text-[8rem] xl:text-[9rem] text-white lg:mb-[-2%] xl:mb-16 ${audiowide.className} relative z-10 whitespace-nowrap`}>
        PRIZE POOL
      </h1>
      
      <div ref={containerRef} className="relative w-full mt-[10%] max-w-[95%] ml-[5%] h-[70vh] md:h-[80vh] z-10">
        {prizes.map((prize, index) => (
          <motion.div
            key={index}
            className={`absolute top-1/2 ${
              screenSize === 'phone' ? 'w-[45%] aspect-square' : screenSize === 'small' || screenSize === 'medium' ? 'w-[40%] aspect-[3/4]' : 'w-[22%] md:w-[22%] lg:w-[20%] xl:w-[19%] aspect-[3/4]'
            }`}
            initial={{ 
              x: '-50%',
              left: '50%', 
              y: '-50%',
              rotate: index * 2 - 3
            }}
            animate={{
              x: '-50%',
              left: isSpread ? getPosition(index) : '50%',
              y: isSpread ? getVerticalPosition(index) : '-50%',
              rotate: 0,
              transition: { duration: 0.8, delay: index * 0.1 }
            }}
          >
            <motion.div 
              className="w-full h-full"
              initial={false}
              animate={{ rotateY: flipped[index] ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute w-full h-full rounded-xl shadow-xl border-4 border-purple-700 flex flex-col items-center justify-center p-2" style={{
                backfaceVisibility: 'hidden',
                backgroundImage: "url('/paper.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}>
                <h2 className={`text-[4rem] sm:text-[6rem] md:text-[10rem] lg:text-[15rem] ${audiowide.className} mb-1 md:mb-2 text-center`} style={{
                  color: '[#22222]',
                  WebkitTextStroke: '1px purple',
                  textShadow: 'xl'
                }}>?</h2>
              </div>
              <div className="absolute w-full h-full rounded-xl border-4 border-purple-700 shadow-xl shadow-purple-500 flex flex-col items-center justify-center p-2 [transform:rotateY(180deg)]" style={{
                backfaceVisibility: 'hidden',
                backgroundImage: "url('/paper.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}>
                <h2 className={`text-md sm:text-[200%] md:text-[300%] lg:text-[350%] sm:mb-6 text-center ${audiowide.className}`} style={{
                  color: '#22222',
                  WebkitTextStroke: '1px purple',
                  textShadow: 'none'
                }}>{prize.title}</h2>
                <p className={`text-md sm:text-lg md:text-xl lg:text-2xl mb-1 ${audiowide.className}`} style={{
                  color: '#22222',
                  WebkitTextStroke: '1px purple',
                  textShadow: 'none'
                }}>{prize.amount}</p>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}