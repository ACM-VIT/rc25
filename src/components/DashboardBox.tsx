const DashboardBox: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => {
    return (
        <div
            className={`p-6 shadow-lg ${className}`}
            style={{
                borderRadius: "8px",
                border: "2px solid #CEB7FF",
                background:
                    "linear-gradient(0deg, rgba(0, 0, 0, 0.70) 0%, rgba(0, 0, 0, 0.70) 100%), rgba(57, 35, 78, 0.60)",
                backdropFilter: "blur(2.5px)",
                WebkitBackdropFilter: "blur(2.5px)", 
            }}
        >
            {children}
        </div>
    );
};

export default DashboardBox;
