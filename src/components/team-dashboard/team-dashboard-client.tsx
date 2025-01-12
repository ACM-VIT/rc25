import { LeaveButton } from "@/components/buttons/leave";
import type { User } from "@prisma/client";

interface TeamMembersProps {
  teamMembers: User[];
}

export function TeamMembers({ teamMembers }: TeamMembersProps) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Team Members</h2>
            <LeaveButton />
          </div>
  
          <div className="grid gap-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
                <div className="text-sm text-gray-500">Member</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }