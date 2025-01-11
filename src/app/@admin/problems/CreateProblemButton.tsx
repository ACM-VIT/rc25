"use client"

import Link from "next/link"

export default function CreateProblemButton() {
  return (
    <Link 
      href="/problems/create"
      className="bg-gradient-to-r from-purple-600 to-indigo-600 
        hover:from-purple-700 hover:to-indigo-700
        text-white font-medium px-6 py-2.5 rounded-lg
        shadow-lg hover:shadow-xl
        transition-all duration-200
        flex items-center space-x-2"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        fill="none"
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <title>Create New Problem Icon</title>
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 4v16m8-8H4"
        />
      </svg>
      <span>Create New Problem</span>
    </Link>
  )
}