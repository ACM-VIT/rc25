"use client";

// import Image from "next/image";
// import instrock from "@/app/assets/instrock.png";
import DashboardBox from "@/components/DashboardBox";

export default function Instructions() {
  const instructions = [
    {
      title: "Login to Your Account",
      description:
        "• Use the credentials provided in your registration email to log into your account. This will give you access to all the features available on the platform.\n• If you encounter any issues with logging in, ensure your email address and password are correctly entered.\n• You can reset your password if necessary by following the 'Forgot Password' link.",
    },
    {
      title: "Navigate to the Dashboard",
      description:
        "• Once logged in, you'll be directed to the dashboard where you can get an overview of your activity, recent updates, and system notifications.\n• The dashboard displays key statistics, such as your current progress, recent achievements, and upcoming events.\n• You can access detailed views of each section by clicking on the relevant icons or links.",
    },
    {
      title: "Customize Your Preferences",
      description:
        "• Go to the 'Settings' section to modify your preferences, update your account details, or change the theme of the platform to suit your needs.\n• You can update your personal information, such as your email address, profile picture, and notification preferences.\n• The platform allows you to choose a light or dark mode to enhance your user experience.",
    },
    {
      title: "Visit the Help Center",
      description:
        "• If you need assistance or have any questions, the 'Help Center' offers FAQs, user guides, and a way to contact support for further help.\n• The Help Center contains a variety of resources, including step-by-step tutorials and troubleshooting tips.\n• If you can’t find the answer you're looking for, feel free to reach out to the support team through the contact form.",
    },
    {
      title: "Track Your Progress",
      description:
        "• The platform allows you to monitor your progress on various tasks and goals.\n• You can track completed and pending tasks, as well as your overall progress through visual charts and reports.\n• Make sure to check this section regularly to stay on top of your tasks.",
    },
    {
      title: "Connect with Other Users",
      description:
        "• The platform allows you to connect with other users for collaboration and networking.\n• You can send messages, join groups, and share updates with fellow users.\n• To start connecting, go to the 'Community' section and explore the available options.",
    },
    {
      title: "Set Up Notifications",
      description:
        "• You can set up notifications to keep you informed about updates on the platform.\n• Go to 'Settings' and configure notification preferences for new messages, updates, and reminders.\n• Choose between email notifications, push notifications, or both to stay informed.",
    },
    {
      title: "Log Out Securely",
      description:
        "• When you're finished using the platform, make sure to log out to protect your account.\n• To log out, click on the 'Logout' button in the top right corner of the screen.\n• Logging out ensures that no one else can access your account without your credentials.",
    },
  ];

  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundImage: "url('./submissionsbg.png')", backgroundSize: "cover" }}
    >
      <div className="p-6 text-white">
        <h1 className="text-5xl font-bold mb-8 underline">Instructions</h1>
      </div>
      <div className="flex items-center justify-center mt-19 relative">
       <DashboardBox className="shadow-lg w-[80vw] h-[68vh] rounded-lg p-8 overflow-y-auto border text-white">
          <ol className="list-decimal pl-6 text-lg">
            {instructions.map((instruction) => (
              <li key={instruction.title}>
                <h3 className="text-xl font-bold mt-4">{instruction.title}</h3>
                <p className="mt-2 text-sm">
                  <ul className="list-inside">
                    {instruction.description.split("\n").map((line, idx) => (
                      <li key={`${instruction.title}-${idx}`}>{line}</li>
                    ))}
                  </ul>
                </p>
              </li>
            ))}
          </ol>
          </DashboardBox>
      </div>
    </div>
      
  );
}
