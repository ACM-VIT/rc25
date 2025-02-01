import Link from 'next/link';

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Submissions Dashboard</h1>
      <div className="flex gap-4">
        <Link 
          href="/submissions/team"
          className="p-4 border rounded hover:bg-gray-100"
        >
          View by Team
        </Link>
        <Link 
          href="/submissions/question" 
          className="p-4 border rounded hover:bg-gray-100"
        >
          View by Question
        </Link>
      </div>
    </div>
  );
}