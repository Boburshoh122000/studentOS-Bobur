import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CVData,
  defaultCVData,
  generateId,
  TemplateType,
  Experience,
  Education,
  Language,
} from '../../types/cv';
import { ModernTemplate, MinimalistTemplate, ProfessionalTemplate } from './CVTemplates';

const STORAGE_KEY = 'studentos_cv_draft';

// Accordion Section Component
interface AccordionProps {
  title: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ title, icon, isOpen, onToggle, children }) => (
  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-800/50">
    <button
      onClick={onToggle}
      className="w-full px-4 py-3 flex justify-between items-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-sm">{icon}</span>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</span>
      </div>
      <span
        className="material-symbols-outlined text-slate-400 text-sm transition-transform"
        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}
      >
        expand_more
      </span>
    </button>
    {isOpen && <div className="p-4 space-y-4">{children}</div>}
  </div>
);

// Form Input Component
interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

const Input: React.FC<InputProps> = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div className="space-y-1">
    <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary"
    />
  </div>
);

// Textarea Component
interface TextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const Textarea: React.FC<TextareaProps> = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div className="space-y-1">
    <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
      {label}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
    />
  </div>
);

// Skills Tag Input
interface SkillsInputProps {
  skills: string[];
  onChange: (skills: string[]) => void;
}

const SkillsInput: React.FC<SkillsInputProps> = ({ skills, onChange }) => {
  const [inputValue, setInputValue] = useState('');

  const addSkill = () => {
    const skill = inputValue.trim();
    if (skill && !skills.includes(skill)) {
      onChange([...skills, skill]);
      setInputValue('');
    }
  };

  const removeSkill = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
          placeholder="Add a skill and press Enter"
          className="flex-1 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
        />
        <button
          type="button"
          onClick={addSkill}
          className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
          >
            {skill}
            <button type="button" onClick={() => removeSkill(index)} className="hover:text-red-500">
              <span className="material-symbols-outlined text-xs">close</span>
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

// Experience Item Editor
interface ExperienceItemProps {
  exp: Experience;
  onChange: (exp: Experience) => void;
  onRemove: () => void;
}

const ExperienceItem: React.FC<ExperienceItemProps> = ({ exp, onChange, onRemove }) => (
  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-3 relative">
    <button
      type="button"
      onClick={onRemove}
      className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
    >
      <span className="material-symbols-outlined text-sm">delete</span>
    </button>
    <div className="grid grid-cols-2 gap-3">
      <Input
        label="Job Title"
        value={exp.role}
        onChange={(v) => onChange({ ...exp, role: v })}
        placeholder="Frontend Developer"
      />
      <Input
        label="Company"
        value={exp.company}
        onChange={(v) => onChange({ ...exp, company: v })}
        placeholder="TechCorp Inc."
      />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <Input
        label="Start Date"
        value={exp.startDate}
        onChange={(v) => onChange({ ...exp, startDate: v })}
        placeholder="Jan 2022"
      />
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-slate-500 uppercase">End Date</label>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={exp.current ? '' : exp.endDate}
            onChange={(e) => onChange({ ...exp, endDate: e.target.value })}
            placeholder={exp.current ? 'Present' : 'Dec 2023'}
            disabled={exp.current}
            className="flex-1 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm disabled:opacity-50"
          />
          <label className="flex items-center gap-1 text-xs text-slate-500">
            <input
              type="checkbox"
              checked={exp.current}
              onChange={(e) => onChange({ ...exp, current: e.target.checked, endDate: '' })}
              className="rounded border-slate-300"
            />
            Current
          </label>
        </div>
      </div>
    </div>
    <Textarea
      label="Description"
      value={exp.description}
      onChange={(v) => onChange({ ...exp, description: v })}
      placeholder="• Developed new features..."
      rows={4}
    />
  </div>
);

// Education Item Editor
interface EducationItemProps {
  edu: Education;
  onChange: (edu: Education) => void;
  onRemove: () => void;
}

const EducationItem: React.FC<EducationItemProps> = ({ edu, onChange, onRemove }) => (
  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-3 relative">
    <button
      type="button"
      onClick={onRemove}
      className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
    >
      <span className="material-symbols-outlined text-sm">delete</span>
    </button>
    <div className="grid grid-cols-2 gap-3">
      <Input
        label="Degree"
        value={edu.degree}
        onChange={(v) => onChange({ ...edu, degree: v })}
        placeholder="Bachelor of Science"
      />
      <Input
        label="School"
        value={edu.school}
        onChange={(v) => onChange({ ...edu, school: v })}
        placeholder="University of..."
      />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <Input
        label="Start Date"
        value={edu.startDate}
        onChange={(v) => onChange({ ...edu, startDate: v })}
        placeholder="2018"
      />
      <Input
        label="End Date"
        value={edu.endDate}
        onChange={(v) => onChange({ ...edu, endDate: v })}
        placeholder="2022"
      />
    </div>
  </div>
);

// Language Item Editor
interface LanguageItemProps {
  lang: Language;
  onChange: (lang: Language) => void;
  onRemove: () => void;
}

const LanguageItem: React.FC<LanguageItemProps> = ({ lang, onChange, onRemove }) => (
  <div className="flex gap-3 items-center">
    <input
      type="text"
      value={lang.name}
      onChange={(e) => onChange({ ...lang, name: e.target.value })}
      placeholder="Language"
      className="flex-1 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
    />
    <select
      value={lang.proficiency}
      onChange={(e) =>
        onChange({ ...lang, proficiency: e.target.value as Language['proficiency'] })
      }
      className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
      aria-label="Language proficiency level"
    >
      <option value="native">Native</option>
      <option value="fluent">Fluent</option>
      <option value="advanced">Advanced</option>
      <option value="intermediate">Intermediate</option>
      <option value="beginner">Beginner</option>
    </select>
    <button type="button" onClick={onRemove} className="p-2 text-slate-400 hover:text-red-500">
      <span className="material-symbols-outlined text-sm">delete</span>
    </button>
  </div>
);

// Main CV Builder Component
export default function CVBuilder() {
  const [cvData, setCvData] = useState<CVData>(defaultCVData);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');
  const [openSections, setOpenSections] = useState<string[]>(['personal']);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCvData({ ...defaultCVData, ...parsed });
      } catch (e) {
        console.error('Failed to parse saved CV data:', e);
      }
    }
  }, []);

  // Save to localStorage on change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
    }, 500);
    return () => clearTimeout(timer);
  }, [cvData]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const updatePersonalInfo = useCallback((field: string, value: string) => {
    setCvData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  }, []);

  // Experience handlers
  const addExperience = () => {
    setCvData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: generateId(),
          role: '',
          company: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
        },
      ],
    }));
  };

  const updateExperience = (id: string, updated: Experience) => {
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? updated : e)),
    }));
  };

  const removeExperience = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.filter((e) => e.id !== id),
    }));
  };

  // Education handlers
  const addEducation = () => {
    setCvData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { id: generateId(), degree: '', school: '', startDate: '', endDate: '', gpa: '' },
      ],
    }));
  };

  const updateEducation = (id: string, updated: Education) => {
    setCvData((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? updated : e)),
    }));
  };

  const removeEducation = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));
  };

  // Language handlers
  const addLanguage = () => {
    setCvData((prev) => ({
      ...prev,
      languages: [...prev.languages, { id: generateId(), name: '', proficiency: 'intermediate' }],
    }));
  };

  const updateLanguage = (id: string, updated: Language) => {
    setCvData((prev) => ({
      ...prev,
      languages: prev.languages.map((l) => (l.id === id ? updated : l)),
    }));
  };

  const removeLanguage = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l.id !== id),
    }));
  };

  // PDF Export using html2canvas + jspdf
  const exportToPDF = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);

    try {
      // Dynamic imports for PDF generation
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const fileName = `${cvData.personalInfo.firstName || 'My'}_${cvData.personalInfo.lastName || 'Resume'}_CV.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const clearDraft = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      setCvData(defaultCVData);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Template renderer
  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'modern':
        return <ModernTemplate data={cvData} />;
      case 'minimalist':
        return <MinimalistTemplate data={cvData} />;
      case 'professional':
        return <ProfessionalTemplate data={cvData} />;
      default:
        return <ModernTemplate data={cvData} />;
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Panel - Editor */}
      <div className="w-[420px] shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark overflow-y-auto">
        <div className="p-6 pb-20 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">CV Editor</h2>
            <button
              onClick={clearDraft}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Personal Details */}
          <Accordion
            title="Personal Details"
            icon="person"
            isOpen={openSections.includes('personal')}
            onToggle={() => toggleSection('personal')}
          >
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                value={cvData.personalInfo.firstName}
                onChange={(v) => updatePersonalInfo('firstName', v)}
                placeholder="John"
              />
              <Input
                label="Last Name"
                value={cvData.personalInfo.lastName}
                onChange={(v) => updatePersonalInfo('lastName', v)}
                placeholder="Doe"
              />
            </div>
            <Input
              label="Job Title"
              value={cvData.personalInfo.jobTitle}
              onChange={(v) => updatePersonalInfo('jobTitle', v)}
              placeholder="Frontend Developer"
            />
            <Input
              label="Email"
              value={cvData.personalInfo.email}
              onChange={(v) => updatePersonalInfo('email', v)}
              placeholder="john@example.com"
              type="email"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Phone"
                value={cvData.personalInfo.phone}
                onChange={(v) => updatePersonalInfo('phone', v)}
                placeholder="+1 234 567 8900"
              />
              <Input
                label="Location"
                value={cvData.personalInfo.location}
                onChange={(v) => updatePersonalInfo('location', v)}
                placeholder="New York, USA"
              />
            </div>
            <Input
              label="LinkedIn"
              value={cvData.personalInfo.linkedin}
              onChange={(v) => updatePersonalInfo('linkedin', v)}
              placeholder="linkedin.com/in/johndoe"
            />
          </Accordion>

          {/* Summary */}
          <Accordion
            title="Professional Summary"
            icon="summarize"
            isOpen={openSections.includes('summary')}
            onToggle={() => toggleSection('summary')}
          >
            <Textarea
              label="About You"
              value={cvData.summary}
              onChange={(v) => setCvData((prev) => ({ ...prev, summary: v }))}
              placeholder="A brief introduction about yourself, your experience, and career goals..."
              rows={5}
            />
          </Accordion>

          {/* Experience */}
          <Accordion
            title="Work Experience"
            icon="work"
            isOpen={openSections.includes('experience')}
            onToggle={() => toggleSection('experience')}
          >
            <div className="space-y-3">
              {cvData.experience.map((exp) => (
                <ExperienceItem
                  key={exp.id}
                  exp={exp}
                  onChange={(updated) => updateExperience(exp.id, updated)}
                  onRemove={() => removeExperience(exp.id)}
                />
              ))}
              <button
                type="button"
                onClick={addExperience}
                className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 text-sm font-medium hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Experience
              </button>
            </div>
          </Accordion>

          {/* Education */}
          <Accordion
            title="Education"
            icon="school"
            isOpen={openSections.includes('education')}
            onToggle={() => toggleSection('education')}
          >
            <div className="space-y-3">
              {cvData.education.map((edu) => (
                <EducationItem
                  key={edu.id}
                  edu={edu}
                  onChange={(updated) => updateEducation(edu.id, updated)}
                  onRemove={() => removeEducation(edu.id)}
                />
              ))}
              <button
                type="button"
                onClick={addEducation}
                className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 text-sm font-medium hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Education
              </button>
            </div>
          </Accordion>

          {/* Skills */}
          <Accordion
            title="Skills"
            icon="psychology"
            isOpen={openSections.includes('skills')}
            onToggle={() => toggleSection('skills')}
          >
            <SkillsInput
              skills={cvData.skills}
              onChange={(skills) => setCvData((prev) => ({ ...prev, skills }))}
            />
          </Accordion>

          {/* Languages */}
          <Accordion
            title="Languages"
            icon="translate"
            isOpen={openSections.includes('languages')}
            onToggle={() => toggleSection('languages')}
          >
            <div className="space-y-3">
              {cvData.languages.map((lang) => (
                <LanguageItem
                  key={lang.id}
                  lang={lang}
                  onChange={(updated) => updateLanguage(lang.id, updated)}
                  onRemove={() => removeLanguage(lang.id)}
                />
              ))}
              <button
                type="button"
                onClick={addLanguage}
                className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 text-sm font-medium hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Language
              </button>
            </div>
          </Accordion>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 bg-slate-100 dark:bg-[#0B0D15] flex flex-col overflow-hidden">
        {/* Template Toolbar */}
        <div className="shrink-0 px-6 py-3 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Template:</span>
            <div className="flex gap-1">
              {(['modern', 'minimalist', 'professional'] as TemplateType[]).map((template) => (
                <button
                  key={template}
                  onClick={() => setSelectedTemplate(template)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                    selectedTemplate === template
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={exportToPDF}
            disabled={isExporting}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                Exporting...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download PDF
              </>
            )}
          </button>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto p-8 flex justify-center">
          <div
            ref={previewRef}
            className="bg-white shadow-xl"
            style={{
              width: '210mm',
              minHeight: '297mm',
              transform: 'scale(0.75)',
              transformOrigin: 'top center',
            }}
          >
            {renderTemplate()}
          </div>
        </div>
      </div>
    </div>
  );
}
