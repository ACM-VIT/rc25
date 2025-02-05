"use client";

import DashboardBox from "@/components/DashboardBox";

export default function Instructions() {
  const instructions = [
    {
      title: "General Guidelines",
      description:
        "• Team Formation: Teams can consist of [X] to [Y] members. Ensure all team members are registered.\n• Project Scope: Your project must align with the hackathon's theme or challenges. Off-topic projects may be disqualified.\n• Original Work: All work must be original and created during the hackathon. Pre-existing projects are not allowed.\n• Time Limit: You have [specific duration, e.g., 24 or 48 hours] to complete your project.",
    },
    {
      title: "Submission Guidelines",
      description:
        "• Platform: Submit your project through [platform, e.g., Devpost, Google Forms, etc.].\n• Deliverables: Source code in a publicly accessible repository (e.g., GitHub). A short description of your project and its purpose.\n• [Optional] A video or presentation explaining your project.\n• Deadline: Submissions must be completed by [specific deadline]. Late entries will not be accepted.",
    },
    {
      title: "Judging Criteria",
      description:
        "• Projects will be evaluated based on:\n  - Innovation: How unique and creative is the idea?\n  - Implementation: How well is the idea executed?\n  - Impact: What is the potential impact or usefulness of the project?\n  - Presentation: How clearly and effectively is the project explained?",
    },
    {
      title: "Rules and Conduct",
      description:
        "• Code of Conduct: Participants must adhere to the hackathon's [Code of Conduct]. Harassment or inappropriate behavior will not be tolerated.\n• External Help: You may use open-source libraries, APIs, or tools but must disclose them in your submission. Plagiarism will result in disqualification.\n• Collaboration Tools: Use appropriate tools (e.g., GitHub, Figma) to collaborate effectively with your team.",
    },
    {
      title: "Technical Support",
      description:
        "• Workshops and Mentorship: Attend scheduled workshops or connect with mentors for guidance.\n• Resources: Use provided resources, APIs, and datasets for your project.",
    },
    {
      title: "Communication",
      description:
        "• Updates: Check [communication platform, e.g., Discord, Slack] regularly for updates and announcements.\n• Support Channels: For queries or technical assistance, use the designated support channels.",
    },
    {
      title: "Prizes and Recognition",
      description:
        "• Winners Announcement: Winners will be announced on [date and platform].\n• Prizes: Details of prizes will be shared at the start of the hackathon.\n• Participation Certificates: All participants completing a project will receive certificates.",
    },
    {
      title: "Miscellaneous",
      description:
        "• Hardware and Venue: If in-person, bring necessary hardware (laptops, chargers, etc.). Wi-Fi and power outlets will be provided.\n• Breaks and Refreshments: Stay hydrated and take regular breaks! Food and refreshments will be available [details].\n• Have Fun! The hackathon is a great opportunity to learn, collaborate, and innovate. Good luck and happy hacking! 🚀",
    },
  ];

  return (
    <div
      className="min-h-screen relative flex flex-col items-center justify-center p-6"
      style={{
        backgroundImage: "url(https://rc25-assets.acmvit.in/submissionsbg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1 className="text-5xl font-bold text-white mb-6 underline">Instructions</h1>
      <DashboardBox className="shadow-lg w-[85vw] max-w-4xl h-[70vh] rounded-lg p-6 overflow-y-auto border text-white bg-opacity-80 backdrop-blur-md">
        <ol className="list-decimal pl-6 space-y-6 text-lg">
          {instructions.map((instruction) => (
            <li key={instruction.title}>
              <h3 className="text-xl font-bold">{instruction.title}</h3>
              <ul className="list-inside mt-2 text-sm leading-relaxed">
                {instruction.description.split("\n").map((line, idx) => (
                  <li key={`${instruction.title}-${idx}`}>{line}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </DashboardBox>
    </div>
  );
}
