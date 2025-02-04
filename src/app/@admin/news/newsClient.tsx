'use client'

import { useState } from 'react';
import moment from 'moment-timezone';
import { createNews, updateNews, deleteNews } from './actions';

// Utility functions for date handling
const formatToKolkata = (date: Date) => {
    return moment(date).tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm');
};

const getCurrentKolkataTime = () => {
    return moment().tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm');
};

const formatDisplayTime = (date: Date) => {
    return moment(date).tz('Asia/Kolkata').format('DD MMM YYYY hh:mm A').toUpperCase();
};

interface NewsClientProps {
    initialNews: { id: string; title: string; content: string; time: Date }[];
}

export default function NewsClient({ initialNews }: NewsClientProps) {
    const [news, setNews] = useState(initialNews);
    const [editing, setEditing] = useState<string | null>(null);
    const [formData, setFormData] = useState({ 
        title: '', 
        content: '', 
        time: getCurrentKolkataTime()
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newsData = {
            ...formData,
            time: moment.tz(formData.time, 'Asia/Kolkata').toDate()
        };
        
        if (editing) {
            await updateNews(editing, newsData);
            setNews(news.map(item => 
                item.id === editing ? { ...item, ...newsData } : item
            ));
        } else {
            await createNews(newsData);
            setNews([{ 
                id: Date.now().toString(),
                ...newsData
            }, ...news]);
        }
        setFormData({ 
            title: '', 
            content: '', 
            time: getCurrentKolkataTime()
        });
        setEditing(null);
    };

    const handleEdit = (item: typeof news[0]) => {
        setEditing(item.id);
        setFormData({ 
            title: item.title, 
            content: item.content,
            time: formatToKolkata(item.time)
        });
    };

    const handleDelete = async (id: string) => {
        await deleteNews(id);
        setNews(news.filter(item => item.id !== id));
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">News Management</h1>
            
            <form onSubmit={handleSubmit} className="mb-8 space-y-4">
                <div>
                    <input
                        type="text"
                        placeholder="Title"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div>
                    <textarea
                        placeholder="Content"
                        value={formData.content}
                        onChange={e => setFormData({...formData, content: e.target.value})}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div>
                    <input
                        type="datetime-local"
                        value={formData.time}
                        onChange={e => setFormData({...formData, time: e.target.value})}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    {editing ? 'Update News' : 'Add News'}
                </button>
                {editing && (
                    <button 
                        type="button"
                        onClick={() => {
                            setEditing(null);
                            setFormData({ 
                                title: '', 
                                content: '', 
                                time: getCurrentKolkataTime()
                            });
                        }}
                        className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                )}
            </form>

            <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2">Title</th>
                            <th className="px-4 py-2">Content</th>
                            <th className="px-4 py-2">Time</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {news.map(item => (
                            <tr key={item.id} className="border-b">
                                <td className="px-4 py-2">{item.title}</td>
                                <td className="px-4 py-2">{item.content}</td>
                                <td className="px-4 py-2">
                                    {formatDisplayTime(item.time)}
                                </td>
                                <td className="px-4 py-2">
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(item)}
                                        className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(item.id)}
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
        </div>
    );
}
