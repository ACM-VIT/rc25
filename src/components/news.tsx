import React from "react";

interface NewsProps {
  title: string;
  time: string;
  content: string;
}

const News = ({ title, time, content }: NewsProps) => {
  return (
    <div className="p-4 bg-white bg-opacity-5 backdrop-filter backdrop-blur-lg rounded-lg shadow-md">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm">{time}</p>
      </div>
      <div className="mt-2">
        <p className="text-sm">{content}</p>
      </div>
    </div>
  );
};
export default News;