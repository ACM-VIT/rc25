'use client';

import { useState } from 'react';
import addTestCase from '../../../actions/upsert-case';

// Add custom type declaration for webkitdirectory
declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}

interface UploadFolderProps {
  problemId: string;
  onSuccess?: () => void;
}

interface TestCaseFiles {
  input: File | undefined;
  output: File | undefined;
  weight: File | undefined;
}

export default function UploadFolder({ problemId, onSuccess }: UploadFolderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true);
    try {
      const files = e.target.files;
      if (!files) return;

      // Create a map to store test cases
      const testCases = new Map<string, TestCaseFiles>();

      // Group files by test case
      for (const file of Array.from(files)) {
        const path = file.webkitRelativePath;
        const [, type, testCaseFolder, fileName] = path.split('/');
        
        if (!testCaseFolder || !fileName) continue;
        
        if (!testCases.has(`${type}_${testCaseFolder}`)) {
          testCases.set(`${type}_${testCaseFolder}`, {
            input: undefined,
            output: undefined,
            weight: undefined
          });
        }
        
        const testCase = testCases.get(`${type}_${testCaseFolder}`);
        if (!testCase) continue;
        if (fileName === 'input.txt') testCase.input = file;
        if (fileName === 'output.txt') testCase.output = file;
        if (fileName === 'weightage.txt') testCase.weight = file;
      }

      // Process each test case
      for (const [key, files] of testCases) {
        // Validate required files exist
        if (!files.input || !files.output || !files.weight) {
          console.error(`Missing required files for test case: ${key}`);
          continue;
        }

        const isEdge = key.startsWith('edge');
        
        try {
          const input = await files.input.text();
          const output = await files.output.text();
          const weight = Number.parseInt(await files.weight.text());

          if (Number.isNaN(weight)) {
            console.error(`Invalid weight for test case: ${key}`);
            continue;
          }

          await addTestCase(
            problemId,
            weight,
            input,
            output,
            isEdge
          );
        } catch (error) {
          console.error(`Error processing test case ${key}:`, error);
        }
      }

      alert('Test cases uploaded successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Error uploading test cases:', error);
      alert('Error uploading test cases');
    } finally {
      setIsUploading(false);
    }
  };

  const commonButtonStyle = "inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium";

  return (
    <div>
      <input
        type="file"
        webkitdirectory="true"
        directory=""
        multiple
        onChange={handleFolderSelect}
        disabled={isUploading}
        className="hidden"
        id="folder-upload"
      />
      <label
        htmlFor="folder-upload"
        className={`${commonButtonStyle} ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <title>Upload Icon</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        {isUploading ? 'Uploading...' : 'Upload Test Cases'}
      </label>
    </div>
  );
}