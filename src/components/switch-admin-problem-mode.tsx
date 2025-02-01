"use client"
import React from 'react';
import SwitchAdminProblemMode from "@/app/actions/switch-admin-problem";
import {Button} from "@/components/ui/button";

interface Props {
    problemId: string;
}

export default function SwitchAdminProblemModeButton({ problemId }: Props) {
    return (
        <Button 
            onClick={() => SwitchAdminProblemMode("user", problemId)} 
            className="fixed bottom-6 right-6"
        >
            Switch to User Mode
        </Button>
    );
}