import React from 'react'
import Image from 'next/image'
import acm from '@/app/assets/acm.svg'
import { Outfit } from 'next/font/google'
import { FaFacebookF, FaLinkedin, FaYoutube, FaInstagram } from "react-icons/fa"
import { FaXTwitter, FaHashnode } from "react-icons/fa6"
import rclogo from '@/app/assets/RCLogo.svg'
import Link from 'next/link';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap'
})

export default function Footer() {
  return (
    <div className='flex flex-col md:flex-row w-full h-auto md:min-h-[15vh]  p-2 md:p-4 bg-transparent backdrop-blur-md z-100'>
      {/* ACM Logo Section */}
      <div className='flex justify-center items-center w-full md:w-1/4 py-3 md:py-0 mb-3'>
        <Image
          src={acm}
          alt='acm logo'
          width={230}
          height={230}
          className='object-contain w-[100px] sm:w-[120px] md:w-[230px]'
        />
      </div>

      {/* Middle Section with Title and Social Icons */}
      <div className='flex flex-col w-full md:w-1/2 justify-center items-center space-y-2 md:space-y-4'>
        <div className={`flex justify-center text-md sm:text-xl md:text-2xl items-center ${outfit.className} bg-transparent mb-3`}
          style={{
            color: 'white',
            WebkitTextStroke: '0.5px white',
            textShadow: 'none'
          }}>
          <h2 className='drop-shadow-[0_0_8px_#fff]'>REACH US AT</h2>
        </div>
        <div className='flex justify-evenly md:flex-row md:justify-center md:gap-8 items-center w-full px-8 md:px-0 mt-4 sm:mt-6'>
  <Link href='https://www.facebook.com/acmvitvellore/'>
    <FaFacebookF size={18} className='hover:scale-110 transition-transform cursor-pointer md:w-[18px] sm:w-[16px] xs:w-[14px] phone:w-[12px] text-white' />
  </Link>
  <Link href='https://x.com/acm_vit'>
    <FaXTwitter size={18} className='hover:scale-110 transition-transform cursor-pointer md:w-[18px] sm:w-[16px] xs:w-[14px] phone:w-[12px] text-white' />
  </Link>
  <Link href='https://www.instagram.com/acmvit/?hl=en'>
    <FaInstagram size={18} className='hover:scale-110 transition-transform cursor-pointer md:w-[18px] sm:w-[16px] xs:w-[14px] phone:w-[12px] text-white' />
  </Link>
  <Link href='https://blog.acmvit.in/'>
    <FaHashnode size={18} className='hover:scale-110 transition-transform cursor-pointer md:w-[18px] sm:w-[16px] xs:w-[14px] phone:w-[12px] text-white' />
  </Link>
  <Link href='https://www.youtube.com/@acm_vit'>
    <FaYoutube size={18} className='hover:scale-110 transition-transform cursor-pointer md:w-[18px] sm:w-[16px] xs:w-[14px] phone:w-[12px] text-white' />
  </Link>
  <Link href='https://in.linkedin.com/company/acmvit'>
    <FaLinkedin size={18} className='hover:scale-110 transition-transform cursor-pointer md:w-[18px] sm:w-[16px] xs:w-[14px] phone:w-[12px] text-white' />
  </Link>
</div>
      </div>

      {/* RC Logo Section */}
      <div className='flex justify-center items-center w-full md:w-1/4 py-2 md:py-0'>
        <Image
          src={rclogo}
          alt='rclogo'
          width={200}
          height={200}
          className='object-cover w-[80px] sm:w-[100px] md:w-[200px] mb-0 md:mb-[10%]'
        />
      </div>
    </div>
  )
}