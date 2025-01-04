import { prisma } from "@/utils/prisma";
import Link from "next/link";
import DeleteButton from "./components/DeleteButton";

async function getProblems() {
  const problems = await prisma.problem.findMany({
    orderBy: {
      roundNumber: 'asc'
    }
  });
  return problems;
}

const Page = async () =>  {
  const problems = await getProblems();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Problems</h1>
        <Link 
          href="/admin/problems/create" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Problem
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg text-gray-900">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3 text-left">Nickname</th>
              <th className="px-6 py-3 text-left">Difficulty</th>
              <th className="px-6 py-3 text-left">Round</th>
              <th className="px-6 py-3 text-left">Max Score</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem) => (
              <tr key={problem.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{problem.title}</td>
                <td className="px-6 py-4">{problem.nickname}</td>
                <td className="px-6 py-4">{problem.difficulty}</td>
                <td className="px-6 py-4">{problem.roundNumber}</td>
                <td className="px-6 py-4">{problem.maxScore}</td>
                <td className="px-6 py-4 flex justify-center gap-2">
                  <Link
                    href={`/problems/${problem.id}`}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/problems/${problem.id}/edit`}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </Link>
                  <DeleteButton problemId={problem.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Page;