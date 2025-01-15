"use client"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { TeamSubmissionProps } from "@/types/submission"

const TeamSubmissions = ({ submissions, teamName }: TeamSubmissionProps) => {
  return (
    <div className="bg-[radial-gradient(110.8%_70.71%_at_50%_50%,_#0B0014_55.41%,_#18181B_100%)] min-h-screen justify-items-center">
      <div className="text-left justify-center p-4">
        <div className="mb-4 justify-start">
          <h1 className="font-[Audiowide] text-4xl font-bold underline text-left text-white">
            {teamName}&apos;s Submissions
          </h1>
        </div>
      </div>
      <div className="text-white bg-[#2d1c3d] bg-opacity-70 w-[90vw] h-[70vh] rounded-lg overflow-auto">
        <div className="flex flex-row border-b mr-2 ml-2 p-2">
          <h1 className="w-1/6 text-center font-bold p-2">Sl.No</h1>
          <h1 className="w-1/6 text-center font-bold p-2">Time</h1>
          <h1 className="w-1/6 text-center font-bold p-2">Name</h1>
          <h1 className="w-1/6 text-center font-bold p-2">Problem</h1>
          <h1 className="w-1/6 text-center font-bold p-2">Difficulty</h1>
          <h1 className="w-1/6 text-center font-bold p-2">Status</h1>
        </div>
        <ScrollArea className="h-[70vh] rounded-md">
          <div className="pr-4">
            {submissions.map((sub, index) => (
              <div key={sub.id} className="flex flex-row mr-2 ml-2 p-2">
                <p className="w-1/6 text-center p-2">{index + 1}</p>
                <p className="w-1/6 text-center p-2">
                  {new Date(sub.createdAt).toLocaleTimeString()}
                </p>
                <p className="w-1/6 text-center p-2">{sub.user.name}</p>
                <p className="w-1/6 text-center p-2">{sub.problem.title}</p>
                <p className="w-1/6 text-center p-2">{sub.problem.difficulty}</p>
                <p className="w-1/6 text-center p-2">
                  {sub.testcasespassed.filter(Boolean).length}/{sub.testcasespassed.length}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default TeamSubmissions
