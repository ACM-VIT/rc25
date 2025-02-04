import React from "react";

interface NewsProps {
  title: string;
  time: string;
  content: string;
}

const News = ({ title, time, content }: NewsProps) => {
  const highlightText = (text: string) => {
    return text
      .split(/(\bRound\s*\d+|\bReverse\s+Coding\b|\bQuestion\s*\d+\b)/gi)
      .map((part, index) => {
        if (/^Round\s*\d+$/i.test(part)) {
          return (
            <span key={index} className="text-red-500 font-semibold">
              {part}
            </span>
          );
        }
        if (/^Reverse\s+Coding$/i.test(part)) {
          return (
            <span key={index} className="text-purple-500 font-semibold">
              {part}
            </span>
          );
        }
        if (/^Question\s*\d+$/i.test(part)) {
          return (
            <span key={index} className="text-yellow-500 font-semibold">
              {part}
            </span>
          );
        }
        return part;
      });
  };

  return (
    <div className="p-4 flex flex-col bg-white bg-opacity-5 backdrop-filter backdrop-blur-lg border border-[#EEEEEE0D] rounded-lg shadow-md overflow-hidden">
      {/* Title & Time Section */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-lg font-bold max-w-[75%] whitespace-normal overflow-hidden text-ellipsis break-all">
          {highlightText(title)}
        </h2>
        <span className="text-sm text-gray-400">{time}</span>
      </div>

      {/* Content Section */}
      <p className="mt-2 text-sm whitespace-normal overflow-hidden text-ellipsis break-all">
        {highlightText(content)}
      </p>
    </div>
  );
};

export default News;
