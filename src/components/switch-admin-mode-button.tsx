"use client"
import React from 'react';
import SwitchAdminMode from "@/app/actions/switch-admin-mode";
import {Button} from "@/components/ui/button";

function SwitchAdminModeButton() {
    // function handleClick() {
    //     useSwitchAdminMode();
    // }
    return (
        <Button onClick={()=>SwitchAdminMode("admin")} className="fixed bottom-6 z-[100] right-6">
            Switch to Admin Mode
        </Button>
    );
}

export default SwitchAdminModeButton;

