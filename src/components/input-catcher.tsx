"use client";
import { useCallback, useEffect } from "react";

function InputCatcher({
	setInput,
	input,
	lookup,
}: {
	setInput: (input: string | ((prev: string) => string)) => void;
	input: string;
	lookup: () => void;
}) {
	const handleKeyPress = useCallback(
		(e: KeyboardEvent) => {
			if ((e.target as HTMLElement).tagName !== "INPUT") {
				if (e.key === "Enter") {
					if (/^[0-9]{2}[A-Z]{3}[0-9]{4}$/.test(input)) {
						lookup();
					} else {
						alert("Invalid Registration Number");
					}
				} else if (e.key === "Backspace") {
					setInput((i) => i.slice(0, -1));
				} else if (e.key === "Escape") {
					setInput("");
				} else if (
					e.key.match(/^[A-Za-z0-9]$/) &&
					!e.ctrlKey &&
					!e.metaKey &&
					!e.altKey
				) {
					setInput((i) => i + (i.length < 9 ? e.key.toUpperCase() : ""));
				}
			}
		},
		[input, lookup, setInput],
	);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyPress);

		return () => {
			document.removeEventListener("keydown", handleKeyPress);
		};
	});
	return null;
}

export default InputCatcher;
