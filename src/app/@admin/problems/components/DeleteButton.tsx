'use client'

import { deleteProblem } from "@/app/actions/delete-probelm";

export default function DeleteButton({ problemId }: { problemId: string }) {
  return (
    <form action={() => deleteProblem(problemId)}>
      <button
        type="submit"
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
      >
        Delete
      </button>
    </form>
  );
}