import React from "react";

interface NewsProps {
  title: string;
  time: string;
  content: string;
}

const News = ({ title, time, content }: NewsProps) => {
  const highlightText = (text: string) => {
    return text
      .split(/(\bRound\s*\d+|\bReverse\s+Coding\b|\bQuestion\s*\d+\b|\bACM-VIT\b)/gi)
      .map((part, index) => {
        if (/^Round\s*\d+$/i.test(part)) {
          return (
            <span key={index} className="text-[#E10600] font-semibold inline">
              {part}
            </span>
          );
        }
        if (/^Reverse\s+Coding$/i.test(part)) {
          return (
            <span key={index} className="text-[#FF8C00] font-semibold inline">
              {part}
            </span>
          );
        }
        if (/^Question\s*\d+$/i.test(part)) {
          return (
            <span key={index} className="text-[#FFA500] font-semibold inline">
              {part}
            </span>
          );
        }
        if (/^ACM-VIT$/i.test(part)) {
          return (
            <span key={index} className="text-[#FF8C00] font-semibold inline">
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
    <div className="p-4 flex flex-col bg-[#1a1a1a] overflow-hidden">
      {/* Title & Time Section */}
      <div className="flex items-baseline gap-4 mb-3">
        <h2 className="text-xl font-['Formula1-Bold'] text-white">
          {highlightText(title)}
        </h2>
        <span className="text-sm text-gray-400 font-['Formula1-Regular']">{time}</span>
      </div>

      {/* Horizontal Rule */}
      <hr className="border-gray-600 mb-3" />

      {/* Content Section */}
      <p className="text-sm font-['Formula1-Regular'] text-white/90 leading-relaxed">{highlightText(content)}</p>
    </div>
  );
};

export default News;
