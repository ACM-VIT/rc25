"use client";

import { formula1Bold } from "@/lib/fonts";

interface DetailsFieldProps {
  fieldType: string;
  value1: string;
  value2: string;
  selected: string;
  onSelect: (value: string) => void;
}

const DetailsField = ({ fieldType, value1, value2, selected, onSelect }: DetailsFieldProps) => {
  const isValue1Selected = selected === value1;
  const isValue2Selected = selected === value2;

  return (
    <div className="flex flex-col bg-transparent">
      <label
        className={`${formula1Bold.className} mb-2 text-[12px] leading-[1.5] text-white sm:mb-3 sm:text-[14px] md:mb-4 md:text-[20px]`}
      >
        {fieldType}
      </label>

      <div className="grid grid-cols-2 gap-3 md:gap-[13px]">
        <button
          type="button"
          aria-pressed={isValue1Selected}
          onClick={() => onSelect(value1)}
          className="text-left focus-visible:outline-none"
        >
          <div
            className={`relative w-full bg-[#080a0d] ${
              isValue1Selected ? "shadow-[0_0_18px_rgba(167,40,45,0.25)]" : ""
            } md:h-[66.922px]`}
          >
            <div className="flex items-center gap-2 px-3 py-3 sm:px-[14px] sm:py-5 md:gap-3 md:py-[23px]">
              <img
                src="/ParticipantDetails/InputIcon.svg"
                alt=""
                aria-hidden="true"
                className="h-4 w-4 shrink-0 sm:h-5 sm:w-5 md:h-6 md:w-6"
              />
              <span
                className={`${formula1Bold.className} truncate text-[11px] leading-[normal] text-white sm:text-[12px] md:text-[18.779px]`}
              >
                {value1}
              </span>
            </div>
            <div className="absolute left-0 right-0 bottom-[8px] h-[2px] bg-[#a7282d]" />
          </div>
          <div className="relative h-[5px] w-full overflow-hidden bg-[#222221] sm:h-[7.078px]">
            <div
              aria-hidden="true"
              className={`absolute inset-0 origin-left bg-[#a7282d] transition-transform duration-300 ease-out ${
                isValue1Selected ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </div>
        </button>

        <button
          type="button"
          aria-pressed={isValue2Selected}
          onClick={() => onSelect(value2)}
          className="text-left focus-visible:outline-none"
        >
          <div
            className={`relative w-full bg-[#080a0d] ${
              isValue2Selected ? "shadow-[0_0_18px_rgba(167,40,45,0.25)]" : ""
            } md:h-[66.922px]`}
          >
            <div className="flex items-center gap-2 px-3 py-3 sm:px-[14px] sm:py-5 md:gap-3 md:py-[23px]">
              <img
                src="/ParticipantDetails/InputIcon.svg"
                alt=""
                aria-hidden="true"
                className="h-4 w-4 shrink-0 sm:h-5 sm:w-5 md:h-6 md:w-6"
              />
              <span
                className={`${formula1Bold.className} truncate text-[11px] leading-[normal] text-white sm:text-[12px] md:text-[18.779px]`}
              >
                {value2}
              </span>
            </div>
            <div className="absolute left-0 right-0 bottom-[8px] h-[2px] bg-[#a7282d]" />
          </div>
          <div className="relative h-[5px] w-full overflow-hidden bg-[#222221] sm:h-[7.078px]">
            <div
              aria-hidden="true"
              className={`absolute inset-0 origin-left bg-[#a7282d] transition-transform duration-300 ease-out ${
                isValue2Selected ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </div>
        </button>
      </div>
    </div>
  );
};

export default DetailsField;
