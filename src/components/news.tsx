import React from "react";

interface NewsProps {
  title: string;
  time: string;
  content: string;
}

const News = ({ title, time, content }: NewsProps) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm">{time}</p>
      <p className="text-sm">{content}</p>
    </div>
  );
};
export default News;
