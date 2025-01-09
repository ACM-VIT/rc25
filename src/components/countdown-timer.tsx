"use client";
import React, {useEffect, useState} from 'react';

interface CountdownTimerProps {
  getTimeUntil:string,
}

const CountdownTimer:React.FC<CountdownTimerProps> = ({getTimeUntil}) => {

  const [timer,setTimer]=useState<string>("00:00:00");

  const getTimeRemaining = (end:string) => {
    const total = Date.parse(end) - Date.now();
    if(total<0){
      return {
        total:0,hours:0,minutes:0,seconds:0,
      }
    }
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / 1000 / 60 / 60) % 24);
    return {
      total,hours,minutes,seconds,
    };
  };

  useEffect(()=>{
    if(isNaN((Date.parse(getTimeUntil)))){
      console.error("Invalid date format for `getTimeUntil`:", getTimeUntil);
      console.log(Date.now())
    }
    const updateTimer = () => {
      const timeRemaining = getTimeRemaining(getTimeUntil);
      setTimer(
          `${String(timeRemaining.hours)}:${String(timeRemaining.minutes)}:${String(timeRemaining.seconds)}`
      );
    };
    setTimer(`${getTimeRemaining(getTimeUntil).hours}:${ getTimeRemaining(getTimeUntil).minutes}:${getTimeRemaining(getTimeUntil).seconds}`);
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  },[getTimeUntil]);
  return (
      <div>
        {timer}
      </div>
  );
};

export default CountdownTimer;