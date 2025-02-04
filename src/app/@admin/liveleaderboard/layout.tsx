export default function Layout({ children }: { children: React.ReactNode }) {
    return <div className="min-h-screen p-2  bg-background">{children}</div>;
}