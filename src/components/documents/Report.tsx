import React from 'react';
import Markdown from 'react-markdown';

interface ReportProps {
  data: any;
}

export const Report: React.FC<ReportProps> = ({ data }) => {
  return (
    <div className="bg-white p-12 md:p-20 text-slate-800 font-sans max-w-4xl mx-auto shadow-sm border border-slate-100">
      <header className="mb-16 text-center border-b border-slate-200 pb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">{data.title}</h1>
        <div className="flex justify-center items-center gap-4 text-slate-500 font-medium uppercase tracking-widest text-sm">
          {data.author && <span>{data.author}</span>}
          {data.author && data.date && <span>•</span>}
          {data.date && <span>{data.date}</span>}
        </div>
      </header>

      <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-img:rounded-xl">
        <Markdown>{data.content}</Markdown>
      </div>
    </div>
  );
};
