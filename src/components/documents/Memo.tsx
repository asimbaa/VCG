import React from 'react';
import Markdown from 'react-markdown';

interface MemoProps {
  data: any;
}

export const Memo: React.FC<MemoProps> = ({ data }) => {
  return (
    <div className="bg-white p-12 md:p-20 text-slate-800 font-serif max-w-4xl mx-auto shadow-sm border border-slate-100">
      <div className="border-b-4 border-slate-900 pb-6 mb-10">
        <h1 className="text-5xl font-bold text-slate-900 tracking-tight uppercase">MEMORANDUM</h1>
      </div>

      <div className="grid grid-cols-[120px_1fr] gap-y-6 mb-12 text-lg">
        <div className="font-bold text-slate-900 uppercase tracking-widest text-sm self-center">To:</div>
        <div className="text-slate-800">{data.to}</div>
        
        <div className="font-bold text-slate-900 uppercase tracking-widest text-sm self-center">From:</div>
        <div className="text-slate-800">{data.from}</div>
        
        <div className="font-bold text-slate-900 uppercase tracking-widest text-sm self-center">Date:</div>
        <div className="text-slate-800">{data.date}</div>
        
        <div className="font-bold text-slate-900 uppercase tracking-widest text-sm self-center">Subject:</div>
        <div className="text-slate-900 font-bold">{data.subject}</div>
      </div>

      <div className="border-t-2 border-slate-200 pt-10">
        <div className="prose prose-slate prose-lg max-w-none font-serif">
          <Markdown>{data.body}</Markdown>
        </div>
      </div>
    </div>
  );
};
