const DashboardBox: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => {
    return (
        <div
            className={`p-6 border-2 border-weirdPurple hover:border-primary transition-colors rounded-lg ${className}`}
            style={{
                background: 'linear-gradient(to bottom, #000000 70%, #2A2A2A)'
            }}
        >
            {children}
        </div>
    );
}; 

export default DashboardBox;
