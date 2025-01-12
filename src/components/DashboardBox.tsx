export default function DashboardBox({ children, className }: { className?: string, children: React.ReactNode }) {
    return (
        <div className={`${className} p-4 bg-secondary/25 border border-rcgrey/20 hover:border-primary/60 rounded-lg overflow-hidden transition-colors`}>
            {children}
        </div>
    );
}
