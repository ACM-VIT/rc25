import { Navbar } from "@/components/AdminNavbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-auto bg-background">
      <Navbar />
      {children}
    </div>
  );
}