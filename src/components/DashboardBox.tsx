const DashboardBox: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => {
    return (
        <div
            className={`p-6 border-2 border-weirdPurple hover:border-primary transition-colors rounded-lg bg-black/50 backdrop-blur-md ${className}`}
        >
            {children}
        </div>
    );
}; 

export default DashboardBox;
