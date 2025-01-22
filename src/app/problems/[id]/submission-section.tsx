import React, { useState } from "react";

const SubmissionSection: React.FC = () => {
  // State to track the selected option
  const [selectedOption, setSelectedOption] = useState<string>("option1");

  // Handler for dropdown change
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
  };

  return (
    <div className="dropdown-container border-5 border-yellow-400 text-white">
      {/* Dropdown with two options */}
      <select
        value={selectedOption}
        onChange={handleChange}
        className="dropdown text-black"
      >
        <option value="best-submission">Best Submission</option>
        <option value="latest-submission">Latest Submission</option>
      </select>

      {/* Conditionally render sections based on the selected option */}
      {selectedOption === "best-submission" && (
        <div className="section">
          <h2>Section for Option 1</h2>
          <p>This section is displayed when Option 1 is selected.</p>
        </div>
      )}

      {selectedOption === "latest-submission" && (
        <div className="section">
          <h2>Section for Option 2</h2>
          <p>This section is displayed when Option 2 is selected.</p>
        </div>
      )}
    </div>
  );
};

export default SubmissionSection;
