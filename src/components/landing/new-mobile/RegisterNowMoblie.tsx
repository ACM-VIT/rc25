  import type React from "react";
  import Image from "next/image";
  import bg from "../../../../public/RegisterNowMobile.png";
  import v1 from "../../../../public/Vector.svg";
  import v2 from "../../../../public/Vector(1).svg";
  import v3 from "../../../../public/Vector(2).svg";
  import v5 from "../../../../public/Vector(3).svg"
  import v7 from "../../../../public/Vector(4).svg"
  import v8 from "../../../../public/Vector(5).svg"

  import dark from "../../../../public/dark-gray-darth.png"
  import acm from "../../../../public/ACMlLogo2.png"
  import rc from "../../../../public/RClogo2.png"
  const RegisterNowMobile: React.FC = () => {
    return (
      <>
      <div className="absolute inset-0 z-20">
              <Image
                alt="background"
                src={dark}
                fill
                className="object-center  transform fix"
                priority
                
              />
            </div>
            <div className="absolute bottom-0  z-30 w-full flex flex-row justify-between">
    <div className="relative w-20 h-20"> 
      <Image
        alt="ACM logo"
        src={acm}
        fill
        className="object-contain scale-50"
        priority
      />
    </div>
    <div className="relative w-20 h-20 ">
      <Image
        alt="RC logo"
        src={rc}
        fill
        className="object-contain scale-50"
        priority
      />
    </div>
  </div>

            
            <div className="absolute inset-0 z-20 w-full h-full flex flex-col content-center">
            <div className="how-it-works-heading text-white content-center text-center h-full  text-7xl lg:text-[80px] xl:text-[115px]">
              <h1>REGISTER <br/>NOW</h1>
            </div>
              
            </div>
      
      <div className="relative w-screen h-screen overflow-hidden">
      <div className="absolute inset-0 z-10">
        <Image
          src={bg}
          alt="bg"
          layout="fill"
          objectFit="cover"
          className="z-0"
        />
        </div>

        <div className="absolute z-40 flex flex-col h-full w-full">
        
        <div className="how-it-works-heading text-white content-center text-center h-3/4 w-full text-7xl lg:text-[80px] xl:text-[115px]">
        
        </div>
        <div className="how-it-works-heading text-white content-center text-center h-2/4 w-full text-3xl lg:text-[80px] xl:text-[115px]">
        <p>Reach us at</p>
        <div className="flex flex-row justify-center content-center m-8 items-start gap-6">
          {[
            { src: v1, href: "https://github.com/ACM-VIT" },
            { src: v2, href: "https://www.instagram.com/acmvit/" },
            { src: v3, href: "https://www.linkedin.com/company/acmvit/" },
            { src: v5, href: "https://www.facebook.com/acmvitvellore/" },
            { src: v7, href: "https://x.com/ACM_VIT" },
            { src: v8, href: "https://x.com/ACM_VIT" },

            

          ].map((item, index) => (
            <a
              key={`vector-${index}`}
              href={item.href}
              className="transition-transform hover:scale-110"
            >
              <Image
                alt={`Vector icon ${index + 1}`}
                src={item.src}
                width={48}
                height={48}
                className=" scale-120 transform fix"
                priority
              />
            </a>
          ))}
        </div>
        </div>
        </div>

      
      
      </div>
      </>
    );
  };

  export default RegisterNowMobile;
