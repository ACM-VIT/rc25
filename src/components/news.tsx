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
            <span key={index} className="inline font-semibold text-[#EB5757]">
              {part}
            </span>
          );
        }
        if (/^Reverse\s+Coding$/i.test(part)) {
          return (
            <span key={index} className="inline font-semibold text-[#FAB258]">
              {part}
            </span>
          );
        }
        if (/^Question\s*\d+$/i.test(part)) {
          return (
            <span key={index} className="inline font-semibold text-[#FAB258]">
              {part}
            </span>
          );
        }
        if (/^ACM-VIT$/i.test(part)) {
          return (
            <span key={index} className="inline font-semibold text-[#FAB258]">
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
    <div className="flex w-full flex-col overflow-hidden border border-[rgba(128,128,128,0.2)] bg-[rgba(238,238,238,0.05)] p-[5px]">
      <div className="mb-[10px] flex items-center justify-between gap-2">
        <h2 className="min-w-0 truncate text-[18px] leading-[1.5] font-['Formula1-Bold'] text-white">
          {highlightText(title)}
        </h2>
        <span className="shrink-0 font-['Orbitron'] text-[14px] leading-[1.25] text-white">
          {time}
        </span>
      </div>

      <div className="mb-[10px] h-px bg-[rgba(255,255,255,0.2)]" />

      <p className="font-['Formula1-Regular'] text-[14px] leading-[1.25] text-white">
        {highlightText(content)}
      </p>
    </div>
  );
};

export default News;
