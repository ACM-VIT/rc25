'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import rock from '@/app/assets/rock.svg';

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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsSpread(true);
            setTimeout(() => {
              setFlipped([true, true, true, true]);
            }, 1000);
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.8,
        rootMargin: '0px'
      }
    );

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
        case 0: return '15%';
        case 1: return '38%';
        case 2: return '61%';
        case 3: return '84%';
        default: return '0%';
      }
    }
  };

  const getVerticalPosition = (index: number) => {
    if (screenSize === 'phone') {
      // Adjusted vertical spacing for better gaps on phone screens
      switch(index) {
        case 0: return '-240%';  // Move first card up more
        case 1: return '-130%';   // More space between 1st and 2nd
        case 2: return '-20%';    // More space between 3rd and 4th
        case 3: return '100%';   // Push last card down more
        default: return '0%';
      }
    } else if (screenSize === 'small') {
      // Adjusted vertical spacing for small screens - 2x2 grid
      return index < 2 ? '-87%' : '3%';  // Increased gap between rows
    } else if (screenSize === 'medium') {
      return index < 2 ? '-80%' : '12%';
    } else {
      return '-50%';
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Rock decorations */}
      <div className="absolute top-[-20%] hidden md:block right-[-55%] xs:right-[-130%] sm:right-[-100%] md:right-[-73%] lg:right-[-55%] xl:right-[-45%] z-0 animate-float">
        <Image
          src={rock}
          alt="Rock decoration"
          width={900}
          height={800}
          priority
          className="opacity-50"
        />
      </div>

      <div className="absolute bottom-[-25%] hidden md:block left-[-45%] sm:left-[-30%] md:left-[-20%] lg:left-[-15%] xl:left-[-10%] z-0 animate-float">
        <Image
          src={rock}
          alt="Rock decoration bottom"
          width={900}
          height={600}
          priority
          className="opacity-50"
        />
      </div>

      {/* Adjusted title positioning for small/phone screens */}
      <h1 className={`text-4xl xs:text-[3.5rem] sm:text-[4rem] phone:mt-0 md:text-[6.5rem] sm:mt-0 md:mt-[2%] lg:text-[7rem] xl:text-[8rem] text-white mb-4 relative z-10 whitespace-nowrap`}>
        PRIZE POOL
      </h1>
      
      {/* Adjusted container height for better card distribution */}
      <div ref={containerRef} className="relative w-full mt-[2%] max-w-[90%] mx-auto h-[85vh] xs:h-[90vh] sm:h-[85vh] md:h-[80vh] z-10">
        {prizes.map((prize, index) => (
          <motion.div
            key={index}
            className={`absolute top-1/2 ${
              screenSize === 'phone' ? 'w-[30%] h-[22%] aspect-[2/3]' : // Adjusted aspect ratio for phone
              screenSize === 'small' ? 'w-[40%] aspect-[2/3]' : // Adjusted aspect ratio for small
              screenSize === 'medium' ? 'w-[33%] aspect-[3/4]' : 
              'w-[18%] aspect-[3/4]'
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
              className="w-full h-full mb-[30%]"
              initial={false}
              animate={{ rotateY: flipped[index] ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Card front */}
              <div className="absolute w-full h-full rounded-xl shadow-xl border-4 border-purple-700 flex flex-col items-center justify-center p-2 " style={{
                backfaceVisibility: 'hidden',
                backgroundImage: "url('/paper.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}>
                <h2 className={`text-[2.5rem] xs:text-[10rem] sm:text-[10rem] md:text-[8rem] lg:text-[10rem] mb-1 md:mb-2 text-center`} style={{
                  color: '#222222',
                  WebkitTextStroke: '1px purple',
                  textShadow: 'xl'
                }}>?</h2>
              </div>
              {/* Card back */}
              <div className="absolute w-full h-full rounded-xl border-4 border-purple-700 shadow-xl shadow-purple-500 flex flex-col items-center justify-center p-2 [transform:rotateY(180deg)]" style={{
                backfaceVisibility: 'hidden',
                backgroundImage: "url('/paper.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}>
                <h2 className={`text-sm xs:text-[280%] sm:text-[270%] md:text-[250%] lg:text-[300%] mb-4 xs:mb-5 text-center`} style={{
                  color: '#222222',
                  WebkitTextStroke: '1px purple',
                  textShadow: 'none'
                }}>{prize.title}</h2>
                <p className={`text-xs xs:text-xl sm:text-xl md:text-lg lg:text-xl`} style={{
                  color: '#222222',
                  WebkitTextStroke: '1px purple',
                  textShadow: 'none'
                }}>{prize.amount}</p>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
      <div className={`hidden md:block  md:text-[3rem] lg:text-[4rem] xl:text-[5rem] mt-4`} style={{
        color: 'black',
        WebkitTextStroke: '1px white',
        textShadow: 'none'
      }}>
        <h1>while (true)&#123;&#125;</h1>
      </div>
    </div>
  );
}
