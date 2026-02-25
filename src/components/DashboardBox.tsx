const DashboardBox: React.FC<{
  className?: string;
  children: React.ReactNode;
  noGradient?: boolean;
}> = ({ className, children, noGradient = false }) => {
    return (
        <div
            className={`p-6 border-2 border-weirdPurple hover:border-primary transition-colors rounded-lg ${className}`}
            style={{
                background: noGradient ? "#000000" : "linear-gradient(to bottom, #000000 70%, #2A2A2A)",
            }}
        >
            {children}
        </div>
    );
}; 

export default DashboardBox;
