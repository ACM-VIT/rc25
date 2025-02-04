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
            <span key={index} className="text-red-500 font-semibold inline">
              {part}
            </span>
          );
        }
        if (/^Reverse\s+Coding$/i.test(part)) {
          return (
            <span key={index} className="text-purple-500 font-semibold inline">
              {part}
            </span>
          );
        }
        if (/^Question\s*\d+$/i.test(part)) {
          return (
            <span key={index} className="text-yellow-500 font-semibold inline">
              {part}
            </span>
          );
        }
        return (
          <span key={index} className="inline">
            {part}
          </span>
        );
      });
  };

  return (
    <div className="p-4 flex flex-col bg-white bg-opacity-5 backdrop-filter backdrop-blur-lg border border-[#EEEEEE0D] rounded-lg shadow-md overflow-hidden">
      {/* Title & Time Section */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-lg font-bold flex-1 break-normal">
          {highlightText(title)}
        </h2>
        <span className="text-sm text-gray-400 shrink-0">{time}</span>
      </div>

      {/* Content Section */}
      <p className="mt-2 text-sm break-normal">{highlightText(content)}</p>
    </div>
  );
};

export default News;
