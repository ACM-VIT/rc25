"use client";
import type React from "react";
import { useState, useCallback, useTransition } from "react";
import { teamAction } from "@/app/actions/team";
import Image from "next/image";
import SignOut from "@/app/(auth)/authactions/signout";

export default function Team({ name }: { name: string }) {
    const [mode, setMode] = useState<"CREATE" | "JOIN">("CREATE");
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState(0);
    const [randomCode, setRandomCode] = useState("");
    const [pending, startTransition] = useTransition();
    name = name.split(' ')[0]

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
        <div className="relative min-h-screen flex flex-col items-center justify-between text-white">
            <div
                className="fixed inset-0 w-full h-full bg-black"
                style={{
                    backgroundImage: `url('/backgrounds/createTeamBg.png')`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    zIndex: -1
                }}
            />

            <Image
                src='/RCLogo.svg'
                alt="rclogo"
                width={50}
                height={50}
                className="absolute bottom-4 left-8 w-auto h-[10%]"
            />

            <div className="flex justify-between w-full p-2">
                <div />
                <button
                    type="button"
                    onClick={SignOut}
                    className="transition-colors duration-150 motion-preset-blur-down-md
                px-4 py-2 border border-primary text-text w-fit hover:bg-white/20 bg-black/50 backdrop-blur-lg"
                >
                    LOGOUT
                </button>
            </div>

            <div className="relative px-6 py-2 flex justify-center items-center w-[85vw] motion-preset-slide-down-sm">
                <Image
                    src='/frameDecoration.svg'
                    alt="rclogo"
                    width={190}
                    height={100}
                    className="absolute w-auto top-0 left-0 h-[100px] z-50"
                />

                <Image
                    src='/frameDecoration.svg'
                    alt="rclogo"
                    width={190}
                    height={100}
                    className="rotate-180 absolute w-auto -bottom-4 right-0 h-[100px] z-50"
                />

                <div className="w-[65vw] lg:w-full sm:w-[75vw] phone:w-[85vw] phone:mt-[15%]
                      p-16 phone:p-3 mt-5 flex flex-col items-center box-border backdrop-blur-lg bg-black/50 border-4 border-weirdPurple ">
                    <div className="w-full mb-3 flex flex-col items-center justify-start gap-4">
                        <div className="flex justify-center items-center gap-2 w-full">
                            <div className="border border-weirdPurple w-1/2 h-3" />
                            <h4 className="font-custom text-weirdPurple md:text-base text-xs">A MESSAGE FROM ACM</h4>
                        </div>
                        <h1 className={`font-custom border-weirdPurple text-center text-transparent text-hollow
                                md:text-[58px] sm:text-3xl xs:text-[135%] phone:text-[135%]`}>
                            HELLO {name}
                        </h1>
                        <div className="flex justify-center items-center gap-2 w-full">
                            <h4 className="font-custom text-weirdPurple md:text-base text-xs">A MESSAGE FROM ACM</h4>
                            <div className="border border-weirdPurple w-1/2 h-3" />
                        </div>
                        <h1 className="text-4xl font-bold font-custom mb-4 text-center">
                            {mode === "CREATE" ? "CREATE A SQUADRON!" : "JOIN A TEAM!"}
                        </h1>
                        <h3 className="text-center text-xl text-weirdPurple">
                            {mode === "CREATE"
                                ? "What’s your squads’s epic name?"
                                : "Toss in the funky code of the team you’re eager to hop into!"}
                        </h3>
                    </div>
                    <div className="md:w-1/2 w-full flex flex-col items-center">
                        <div className="mb-4 w-full">
                            <label htmlFor="team-input" className="text-sm block font-semibold mb-2 font-custom">
                                {mode === "CREATE" ? "Squad Name" : "Squad Code"}
                            </label>
                            <input
                                id="team-input"
                                type="text"
                                className="w-full h-fit p-2 md:p-6 bg-weirdPurple/30 outline-none text-white text-center font-bold md:text-xl text-base"
                                value={inputValue}
                                onInput={(e) => {
                                    setError(0);
                                    setInputValue(
                                        (e.target as HTMLInputElement).value.toUpperCase()
                                    );
                                }}
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === "Enter") {
                                        handleSubmit();
                                    }
                                }}
                            />{" "}
                            {error > 0 && (
                                <p className="text-red-500 mt-2 text-sm font-custom">
                                    {error === 1 ? "Team not found :(" : null}
                                    {error === 2 ? "Team name already taken :(" : null}
                                    {error === 4 ? "Team max capacity reached :(" : null}
                                    {error === 5
                                        ? `Fill in Team ${mode === "CREATE" ? "Name" : "Code"}.`
                                        : null}
                                    {error === 6 ? "Invalid Team Code" : null}
                                    {error === 7 ? "Team Name too long" : null}
                                    {error === 8 ? "Team Name too short" : null}
                                    {error === 9 ? "Team Name contains invalid characters" : null}
                                    {error === 10
                                        ? "Unknown error occurred. Please try again later :("
                                        : null}
                                </p>
                            )}
                        </div>

                        {randomCode && (
                            <div className="mt-4 p-4 bg-primary/70 bg-opacity-20 border-2">
                                <p className="text-center font-bold">Your Team Code:</p>
                                <p className="text-center text-2xl text-purple-400">
                                    {randomCode}
                                </p>
                                <p className="text-center text-sm text-gray-400 mt-2">
                                    Share this code with your teammates!
                                </p>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="md:text-xl text-sm w-full h-fit p-2 md:p-6 bg-primary hover:bg-primary/80 outline-none text-white text-center font-bold transition-colors mb-2 mt-4"
                        >
                            {pending ? "ENTERING..." : "ENTER"}
                        </button>
                        <div className="md:text-xl text-sm text-center text-gray-400 font-bold mb-2">OR</div>
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="md:text-xl text-sm w-full h-fit p-2 md:p-6 bg-weirdPurple/30 hover:bg-weirdPurple/70 outline-none text-white text-center font-bold transition-colors"
                        >
                            {mode === "CREATE" ? "JOIN A SQUAD" : "CREATE A SQUAD"}
                        </button>
                    </div>
                </div>
            </div>
            <div />
            <div />
        </div>
    );
}
