import React from 'react';

interface ResumeProps {
  data: any;
}

export const Resume: React.FC<ResumeProps> = ({ data }) => {
  return (
    <div className="bg-white p-12 md:p-16 text-slate-800 font-sans max-w-4xl mx-auto shadow-sm border border-slate-100">
      <header className="border-b-4 border-slate-900 pb-10 mb-10 text-center">
        <h1 className="text-5xl font-bold text-slate-900 mb-3 tracking-tight">{data.fullName}</h1>
        <h2 className="text-2xl text-blue-600 font-medium mb-6">{data.title}</h2>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500 font-medium">
          {data.contact?.email && <span className="flex items-center gap-1">{data.contact.email}</span>}
          {data.contact?.phone && <span className="flex items-center gap-1">• {data.contact.phone}</span>}
          {data.contact?.location && <span className="flex items-center gap-1">• {data.contact.location}</span>}
          {data.contact?.website && <span className="flex items-center gap-1">• {data.contact.website}</span>}
        </div>
      </header>

      {data.summary && (
        <section className="mb-10">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Professional Summary</h3>
          <p className="text-slate-700 leading-relaxed text-lg">{data.summary}</p>
        </section>
      )}

      <section className="mb-10">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Experience</h3>
        <div className="space-y-8">
          {data.experience?.map((exp: any, index: number) => (
            <div key={index} className="relative pl-6 border-l-2 border-slate-200">
              <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
                <h4 className="text-xl font-bold text-slate-900">{exp.position}</h4>
                <span className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1 sm:mt-0">{exp.startDate} - {exp.endDate || 'Present'}</span>
              </div>
              <div className="text-lg text-blue-600 font-medium mb-3">{exp.company}</div>
              <ul className="list-disc list-outside ml-5 text-slate-700 space-y-2">
                {exp.description?.map((desc: string, i: number) => (
                  <li key={i} className="leading-relaxed">{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Education</h3>
        <div className="space-y-6">
          {data.education?.map((edu: any, index: number) => (
            <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
              <div>
                <h4 className="text-lg font-bold text-slate-900">{edu.degree}</h4>
                <div className="text-slate-600 text-lg">{edu.institution}</div>
              </div>
              <span className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1 sm:mt-0">{edu.year}</span>
            </div>
          ))}
        </div>
      </section>

      {data.skills && data.skills.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill: string, index: number) => (
              <span key={index} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
