'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Round } from "@/db/schema";
import moment from 'moment-timezone';
import { upsertRound, deleteRound } from '../../actions/round-actions';

// Utility functions for date handling
const formatToKolkata = (date: Date) => {
    return moment(date).tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm');
};

const getMinKolkataDate = () => {
    return moment().tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm');
};

const getMaxKolkataDate = () => {
    return moment().tz('Asia/Kolkata').add(1, 'year').format('YYYY-MM-DDTHH:mm');
};

interface RoundClientProps {
    initialRounds: Round[];
}

export default function RoundClient({ initialRounds }: RoundClientProps) {
    const [rounds, setRounds] = useState(initialRounds);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const handleChange = (
        roundNumber: number,
        field: keyof Round,
        value: string
    ) => {
        setRounds(prev =>
            prev.map(round => {
                if (round.number === roundNumber) {
                    return {
                        ...round,
                        [field]: moment.tz(value, 'Asia/Kolkata').toDate()
                    };
                }
                return round;
            })
        );
    };

    const handleSave = async (round: Round) => {
        const result = await upsertRound({
            number: round.number,
            start: round.start,
            end: round.end,
            result: round.result,
        });
        
        if (result.error) {
            setError(result.error);
            setSuccess('');
        } else {
            router.refresh();
            setError('');
            setSuccess('Round updated successfully');
        }
    };

    const handleDelete = async (number: number) => {
        if (confirm('Are you sure you want to delete this round?')) {
            const result = await deleteRound(number);
            if (result.error) {
                setError(result.error);
                setSuccess('');
            } else {
                router.refresh();
                setError('');
                setSuccess('Round deleted successfully');
            }
        }
    };

    return (
        <div className="p-4">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                </div>
            )}
            <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Round Number</th>
                        <th className="border p-2">Start Time</th>
                        <th className="border p-2">End Time</th>
                        <th className="border p-2">Result Time</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rounds.map(round => (
                        <tr key={round.number}>
                            <td className="border p-2">
                                <input
                                    type="number"
                                    value={round.number}
                                    disabled
                                    className="w-full p-1 bg-gray-100 appearance-none"
                                    aria-label="Round number"
                                />
                            </td>
                            <td className="border p-2">
                                <input
                                    type="datetime-local"
                                    value={formatToKolkata(round.start)}
                                    min={getMinKolkataDate()}
                                    max={getMaxKolkataDate()}
                                    onChange={(e) => handleChange(round.number, 'start', e.target.value)}
                                    className="w-full p-1 border rounded"
                                    required
                                />
                            </td>
                            <td className="border p-2">
                                <input
                                    type="datetime-local"
                                    value={formatToKolkata(round.end)}
                                    min={formatToKolkata(round.start)}
                                    max={getMaxKolkataDate()}
                                    onChange={(e) => handleChange(round.number, 'end', e.target.value)}
                                    className="w-full p-1 border rounded"
                                    required
                                />
                            </td>
                            <td className="border p-2">
                                <input
                                    type="datetime-local"
                                    value={formatToKolkata(round.result)}
                                    min={formatToKolkata(round.end)}
                                    max={getMaxKolkataDate()}
                                    onChange={(e) => handleChange(round.number, 'result', e.target.value)}
                                    className="w-full p-1 border rounded"
                                    required
                                />
                            </td>
                            <td className="border p-2">
                                <button
                                    type="button"
                                    onClick={() => handleSave(round)}
                                    className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(round.number)}
                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
