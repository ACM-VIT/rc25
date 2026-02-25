"use client"
import React from 'react';
import SwitchAdminMode from "@/app/actions/switch-admin-mode";

function SwitchAdminModeButton() {
    return (
        <button
            onClick={() => SwitchAdminMode("admin")}
            className="fixed bottom-20 right-6 z-[100] px-4 py-2 bg-[#A7282D] text-white text-sm font-['Formula1-Bold'] border border-white/20 rounded hover:bg-[#c53038] transition-colors shadow-lg"
        >
            Go to Admin Portal
        </button>
    );
}

export default SwitchAdminModeButton;

