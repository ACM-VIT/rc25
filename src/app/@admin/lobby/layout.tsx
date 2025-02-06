export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute top-0 left-0 w-screen h-screen bg-background z-50 overflow-hidden">
      <main className="h-full w-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}
