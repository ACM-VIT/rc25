'use client'

import { useState, useEffect } from 'react';

interface NewsClientProps {
  initialNews: { id: string; title: string; content: string; time: string }[];
}

export default function NewsClient({ initialNews }: NewsClientProps) {
  const [news, setNews] = useState(initialNews);

  useEffect(() => {
    setNews(initialNews);
  }, [news]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Latest News</h1>
      <div className="space-y-4">
        {news.map(item => (
          <div key={item.id} className="border-b-2 pb-4">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="text-gray-500">{new Date(item.time).toLocaleDateString()}</p>
            <p>{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
