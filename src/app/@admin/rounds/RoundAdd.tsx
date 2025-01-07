import { useState } from 'react';
import { upsertRound } from '../../actions/round-actions';
import  DateTimePicker24h  from '@/components/DateTimePicker24h';

interface RoundAddProps {
  onClose: () => void;
  onAdded: () => void;
  number: number;
}

export default function RoundAdd({ onClose, onAdded, number }: RoundAddProps) {
  const [start, setStart] = useState<Date>(new Date());
  const [end, setEnd] = useState<Date>(new Date());
  const [result, setResult] = useState<Date>(new Date());
  const [error, setError] = useState('');

  const handleAdd = async () => {
    const newRound = {
      number,
      start,
      end,
      result,
    };
    const res = await upsertRound(newRound);
    if (res.error) {
      setError(res.error);
    } else {
      onAdded();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow">
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <label className="block mb-2" htmlFor="start">
          Start:
        </label>
        <DateTimePicker24h 
          date={start} 
          onDateChange={setStart} 
          label="Start time" 
        />
        <label className="block mb-2" htmlFor="end">
          End:
        </label>
        <DateTimePicker24h 
          date={end} 
          onDateChange={setEnd} 
          label="End time"
        />
        <label className="block mb-2" htmlFor="result">
          Result:
        </label>
        <DateTimePicker24h 
          date={result} 
          onDateChange={setResult} 
          label="Result time"
        />
        <div className="flex justify-end space-x-2 mt-4">
          <button type="button" className="bg-gray-300 px-3 py-1 rounded" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="bg-green-500 text-white px-3 py-1 rounded" onClick={handleAdd}>
            Add Round
          </button>
        </div>
      </div>
    </div>
  );
}