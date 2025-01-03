"use client";
import React, { useState, useCallback, useTransition } from "react";
import { teamAction } from "@/app/actions/team";

export default function Team() {
    const [mode, setMode] = useState<"CREATE" | "JOIN">("CREATE");
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState(0);
    const [randomCode, setRandomCode] = useState("");
    const [pending, startTransition] = useTransition();

    const handleSubmit = useCallback(() => {
        if (!inputValue || !inputValue.length) return setError(5);
        if (mode === "CREATE" && inputValue.length > 16) return setError(7);
        if (mode === "CREATE" && inputValue.length < 3) return setError(8);
        if (mode === "CREATE" && !/^[a-zA-Z0-9_ ]*$/.test(inputValue))
            return setError(9);
        if (mode === "JOIN" && (inputValue.length > 6 || inputValue.length < 5))
            return setError(6);

        startTransition(async () => {
            const res = await teamAction(inputValue, mode === "CREATE");
            if (mode === "CREATE" && res?.randomCode) {
                setRandomCode(res.randomCode);
            }
            setError(res?.error?.code ?? 0);
        });
    }, [mode, inputValue]);

    const toggleMode = () => {
        setMode((prevMode) => (prevMode === "CREATE" ? "JOIN" : "CREATE"));
        setInputValue("");
        setError(0);
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-black text-white font-sans">
            <div className="w-[90vw] md:w-[50vw] lg:w-[40vw] p-6 rounded-lg bg-[#1c1c1c]">
                <h1 className="text-4xl font-bold mb-4">
                    {mode === "CREATE" ? "CREATE A TEAM!" : "JOIN A TEAM!"}
                </h1>
                <div className="mb-4">
                    <label className="block font-semibold mb-2">
                        {mode === "CREATE"
                            ? "What’s your team’s epic name?"
                            : "Toss in the funky code of the team you’re eager to hop into!"}
                    </label>
                    <input
                        type="text"
                        className="w-full p-2 rounded border-2 border-dashed border-white bg-transparent text-white placeholder-gray-400"
                        placeholder={mode === "CREATE" ? "Team Name" : "Team Code"}
                        value={inputValue}
                        onInput={(e) => {
                            setError(0);
                            setInputValue(
                                (e.target as HTMLInputElement).value.toUpperCase()
                            );
                        }}
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                handleSubmit();
                            }
                        }}
                    />
                    {error > 0 && (
                        <p className="text-red-500 mt-2 text-sm">
                            {error === 1 ? "Team not found :(" : null}
                            {error === 2 ? "Team name already taken :(" : null}
                            {error === 4 ? "Team max capacity reached :(" : null}
                            {error === 5
                                ? `Fill in Team ${
                                      mode === "CREATE" ? "Name" : "Code"
                                  }.`
                                : null}
                            {error === 6 ? "Invalid Team Code" : null}
                            {error === 7 ? "Team Name too long" : null}
                            {error === 8 ? "Team Name too short" : null}
                            {error === 9
                                ? "Team Name contains invalid characters"
                                : null}
                            {error === 10
                                ? "Unknown error occurred. Please try again later :("
                                : null}
                        </p>
                    )}
                </div>
                <button
                    onClick={handleSubmit}
                    className="w-full bg-gray-400 hover:bg-gray-700 text-purple-700 py-2 rounded-md mt-4"
                >
                    {pending ? "Submitting..." : "Submit"}
                </button>
                <div className="text-center text-gray-400 mt-4">OR</div>
                <button
                    onClick={toggleMode}
                    className="w-full bg-gray-400 hover:bg-gray-700 text-purple-700 py-2 rounded-md mt-4"
                >
                    {mode === "CREATE" ? "Join a Team" : "Create a Team"}
                </button>
            </div>
        </div>
    );
}
