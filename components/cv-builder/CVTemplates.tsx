import React from 'react';
import { CVData } from '../../types/cv';

interface TemplateProps {
  data: CVData;
}

// Modern Template - Two-column layout with blue accents
export const ModernTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, summary, experience, education, skills, languages } = data;
  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim() || 'Your Name';

  return (
    <div className="w-full h-full bg-white text-black font-sans text-[11px] leading-relaxed">
      {/* Header with Photo */}
      <div className="flex gap-6 p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        {personalInfo.photoUrl && (
          <div className="shrink-0">
            <img
              src={personalInfo.photoUrl}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-white/30"
            />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
          <p className="text-blue-100 font-medium mt-1">
            {personalInfo.jobTitle || 'Professional Title'}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[10px] text-blue-100">
            {personalInfo.email && (
              <span className="flex items-center gap-1">
                <span>✉</span> {personalInfo.email}
              </span>
            )}
            {personalInfo.phone && (
              <span className="flex items-center gap-1">
                <span>☎</span> {personalInfo.phone}
              </span>
            )}
            {personalInfo.location && (
              <span className="flex items-center gap-1">
                <span>📍</span> {personalInfo.location}
              </span>
            )}
            {personalInfo.linkedin && (
              <span className="flex items-center gap-1">
                <span>🔗</span> {personalInfo.linkedin}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-1/3 bg-slate-50 p-5 space-y-5">
          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 pb-1 border-b border-blue-200">
                Skills
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-[9px] font-medium rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 pb-1 border-b border-blue-200">
                Languages
              </h2>
              <div className="space-y-2">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between items-center">
                    <span className="font-medium text-slate-700">{lang.name}</span>
                    <span className="text-[9px] text-slate-500 capitalize">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 pb-1 border-b border-blue-200">
                Education
              </h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <h3 className="font-bold text-slate-800 text-[10px]">{edu.degree}</h3>
                    <p className="text-blue-600 text-[10px]">{edu.school}</p>
                    <p className="text-[9px] text-slate-400">
                      {edu.startDate} - {edu.endDate}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Content */}
        <div className="w-2/3 p-5 space-y-5">
          {/* Summary */}
          {summary && (
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-2 pb-1 border-b border-slate-200">
                Profile
              </h2>
              <p className="text-slate-600 leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3 pb-1 border-b border-slate-200">
                Experience
              </h2>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-bold text-slate-800">{exp.role}</h3>
                        <p className="text-blue-600 font-medium text-[10px]">{exp.company}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 shrink-0">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[10px] leading-relaxed whitespace-pre-line">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Minimalist Template - Single column, black & white
export const MinimalistTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, summary, experience, education, skills, languages } = data;
  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim() || 'Your Name';

  return (
    <div className="w-full h-full bg-white text-black font-serif p-8 text-[11px] leading-relaxed">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-3xl font-light tracking-[0.2em] uppercase">{fullName}</h1>
        <p className="text-sm text-slate-600 mt-1 tracking-wide">
          {personalInfo.jobTitle || 'Professional Title'}
        </p>
        <div className="flex justify-center flex-wrap gap-x-6 gap-y-1 mt-3 text-[10px] text-slate-500">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-6">
          <p className="text-slate-700 text-center italic leading-relaxed max-w-xl mx-auto">
            "{summary}"
          </p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-center mb-4">
            Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="border-l-2 border-slate-200 pl-4">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold">{exp.role}</h3>
                  <span className="text-[9px] text-slate-400">
                    {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <p className="text-slate-600 text-[10px] mb-1">{exp.company}</p>
                <p className="text-slate-600 text-[10px] leading-relaxed whitespace-pre-line">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-center mb-4">
            Education
          </h2>
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold">{edu.degree}</span>
                  <span className="text-slate-500">, {edu.school}</span>
                </div>
                <span className="text-[9px] text-slate-400">{edu.endDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills & Languages */}
      <div className="flex gap-8">
        {skills.length > 0 && (
          <div className="flex-1">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-center mb-3">
              Skills
            </h2>
            <p className="text-center text-slate-600">{skills.join(' • ')}</p>
          </div>
        )}
        {languages.length > 0 && (
          <div className="flex-1">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-center mb-3">
              Languages
            </h2>
            <p className="text-center text-slate-600">
              {languages.map((l) => `${l.name} (${l.proficiency})`).join(' • ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Professional Template - Traditional layout with horizontal separators
export const ProfessionalTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, summary, experience, education, skills, languages } = data;
  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim() || 'Your Name';

  return (
    <div className="w-full h-full bg-white text-black font-sans p-6 text-[11px] leading-relaxed">
      {/* Header */}
      <div className="border-b-4 border-slate-800 pb-4 mb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 uppercase tracking-tight">
          {fullName}
        </h1>
        <p className="text-lg text-indigo-600 font-semibold mt-0.5">
          {personalInfo.jobTitle || 'Professional Title'}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] text-slate-600">
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              <span className="font-bold">Email:</span> {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1">
              <span className="font-bold">Phone:</span> {personalInfo.phone}
            </span>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1">
              <span className="font-bold">Location:</span> {personalInfo.location}
            </span>
          )}
          {personalInfo.linkedin && (
            <span className="flex items-center gap-1">
              <span className="font-bold">LinkedIn:</span> {personalInfo.linkedin}
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-slate-800 uppercase mb-2 pb-1 border-b-2 border-slate-200">
            Professional Summary
          </h2>
          <p className="text-slate-700 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-slate-800 uppercase mb-3 pb-1 border-b-2 border-slate-200">
            Work Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-slate-900">{exp.role}</h3>
                  <span className="text-[9px] text-slate-500 font-medium">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <p className="text-indigo-600 font-semibold text-[10px] mb-1">{exp.company}</p>
                <ul className="list-disc list-inside text-slate-600 text-[10px] space-y-0.5">
                  {exp.description
                    .split('\n')
                    .filter(Boolean)
                    .map((line, i) => (
                      <li key={i}>{line.replace(/^[-•]\s*/, '')}</li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Education */}
        {education.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase mb-2 pb-1 border-b-2 border-slate-200">
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id}>
                  <h3 className="font-bold text-slate-900 text-[10px]">{edu.degree}</h3>
                  <p className="text-indigo-600 text-[10px]">{edu.school}</p>
                  <p className="text-[9px] text-slate-500">
                    {edu.startDate} - {edu.endDate}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        <div>
          {skills.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase mb-2 pb-1 border-b-2 border-slate-200">
                Technical Skills
              </h2>
              <div className="flex flex-wrap gap-1">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-medium rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase mb-2 pb-1 border-b-2 border-slate-200">
                Languages
              </h2>
              <div className="space-y-1">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between text-[10px]">
                    <span className="font-medium text-slate-700">{lang.name}</span>
                    <span className="text-slate-500 capitalize">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
