"use client";

import { Checkbox } from "@nextui-org/react";
import { useOptimistic, startTransition, useEffect, useState } from "react";
import { updateFlag } from "./actions";

interface Flag {
    name: string;
    value: boolean;
}

function MessageBanner({ message }: { message: string }) {
    if (!message) return null;
    return (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
            {message}
        </div>
    );
}

export default function FlagClient({ flags: initialFlags }: { flags: Flag[] }) {
    const [isClient, setIsClient] = useState(false);
    const [message, setMessage] = useState("");
    const [optimisticFlags, updateOptimisticFlags] = useOptimistic(
        initialFlags,
        (state, newFlag: Flag) =>
            state.map((flag) => (flag.name === newFlag.name ? newFlag : flag))
    );

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleToggle = async (name: string, value: boolean) => {
        startTransition(async () => {
            try {
                updateOptimisticFlags({ name, value });
                const result = await updateFlag(name, value);

                if (result.success) {
                    setMessage(`Successfully updated ${name}`);
                } else {
                    setMessage(`Failed to update ${name}`);
                    updateOptimisticFlags({ name, value: !value });
                }
            } catch (error) {
                console.log(error);
                setMessage(`Error updating ${name}`);
                updateOptimisticFlags({ name, value: !value });
            }

            setTimeout(() => setMessage(""), 3000);
        });
    };

    if (!isClient) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4">
            <MessageBanner message={message} />
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-4 text-left">Flag Name</th>
                        <th className="p-4 text-left">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {optimisticFlags.map((flag) => (
                        <tr key={flag.name} className="border-b">
                            <td className="p-4">{flag.name}</td>
                            <td className="p-4">
                                <Checkbox
                                    isSelected={flag.value}
                                    onValueChange={(checked) =>
                                        handleToggle(flag.name, checked)
                                    }
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
