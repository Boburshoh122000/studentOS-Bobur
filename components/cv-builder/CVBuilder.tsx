import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CVData,
  defaultCVData,
  generateId,
  TemplateType,
  Experience,
  Education,
  Language,
  Project,
  Volunteering,
  Award,
  Publication,
  CustomSection,
  CustomItem,
} from '../../types/cv';
import {
  ModernTemplate,
  MinimalistTemplate,
  ProfessionalTemplate,
  EuropassTemplate,
  GrantTemplate,
  TechTemplate,
} from './CVTemplates';
import { userApi } from '../../src/services/api';
import toast from 'react-hot-toast';
import {
  ArrowDownTrayIcon,
  CheckIcon,
  PlusCircleIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const STORAGE_KEY = 'studentos_cv_draft';

// ─── Re-usable sub-components ────────────────────────────────────────────────

interface AccordionProps {
  title: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  onRemove?: () => void;
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  icon,
  isOpen,
  onToggle,
  children,
  onRemove,
}) => (
  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-800/50">
    <button
      onClick={onToggle}
      className="w-full px-4 py-3 flex justify-between items-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-sm">{icon}</span>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</span>
      </div>
      <div className="flex items-center gap-1">
        {onRemove && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="material-symbols-outlined text-slate-400 hover:text-red-500 text-sm cursor-pointer p-1"
          >
            close
          </span>
        )}
        <span
          className="material-symbols-outlined text-slate-400 text-sm transition-transform"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}
        >
          expand_more
        </span>
      </div>
    </button>
    {isOpen && <div className="p-4 space-y-4">{children}</div>}
  </div>
);

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

// ─── Skills Tag Input ────────────────────────────────────────────────────────

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
              <XMarkIcon className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── Item Editors ────────────────────────────────────────────────────────────

const ExperienceItem: React.FC<{
  exp: Experience;
  onChange: (exp: Experience) => void;
  onRemove: () => void;
}> = ({ exp, onChange, onRemove }) => (
  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-3 relative">
    <button
      type="button"
      onClick={onRemove}
      className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
    >
      <TrashIcon className="w-3.5 h-3.5" />
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

const EducationItem: React.FC<{
  edu: Education;
  onChange: (edu: Education) => void;
  onRemove: () => void;
}> = ({ edu, onChange, onRemove }) => (
  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-3 relative">
    <button
      type="button"
      onClick={onRemove}
      className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
    >
      <TrashIcon className="w-3.5 h-3.5" />
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

const LanguageItem: React.FC<{
  lang: Language;
  onChange: (lang: Language) => void;
  onRemove: () => void;
}> = ({ lang, onChange, onRemove }) => (
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
      <TrashIcon className="w-3.5 h-3.5" />
    </button>
  </div>
);

const ProjectItem: React.FC<{
  item: Project;
  onChange: (item: Project) => void;
  onRemove: () => void;
}> = ({ item, onChange, onRemove }) => (
  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-3 relative">
    <button
      type="button"
      onClick={onRemove}
      className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
    >
      <TrashIcon className="w-3.5 h-3.5" />
    </button>
    <Input
      label="Project Title"
      value={item.title}
      onChange={(v) => onChange({ ...item, title: v })}
      placeholder="My Awesome Project"
    />
    <Input
      label="Technologies"
      value={item.technologies}
      onChange={(v) => onChange({ ...item, technologies: v })}
      placeholder="React, Node.js, PostgreSQL"
    />
    <Input
      label="URL"
      value={item.url}
      onChange={(v) => onChange({ ...item, url: v })}
      placeholder="https://github.com/..."
    />
    <Textarea
      label="Description"
      value={item.description}
      onChange={(v) => onChange({ ...item, description: v })}
      placeholder="What the project does..."
      rows={3}
    />
  </div>
);

const VolunteeringItem: React.FC<{
  item: Volunteering;
  onChange: (item: Volunteering) => void;
  onRemove: () => void;
}> = ({ item, onChange, onRemove }) => (
  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-3 relative">
    <button
      type="button"
      onClick={onRemove}
      className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
    >
      <TrashIcon className="w-3.5 h-3.5" />
    </button>
    <div className="grid grid-cols-2 gap-3">
      <Input
        label="Role"
        value={item.role}
        onChange={(v) => onChange({ ...item, role: v })}
        placeholder="Volunteer Tutor"
      />
      <Input
        label="Organization"
        value={item.organization}
        onChange={(v) => onChange({ ...item, organization: v })}
        placeholder="Red Cross"
      />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <Input
        label="Start Date"
        value={item.startDate}
        onChange={(v) => onChange({ ...item, startDate: v })}
        placeholder="Jan 2021"
      />
      <Input
        label="End Date"
        value={item.endDate}
        onChange={(v) => onChange({ ...item, endDate: v })}
        placeholder="Dec 2022"
      />
    </div>
    <Textarea
      label="Description"
      value={item.description}
      onChange={(v) => onChange({ ...item, description: v })}
      placeholder="Responsibilities..."
      rows={3}
    />
  </div>
);

const AwardItem: React.FC<{
  item: Award;
  onChange: (item: Award) => void;
  onRemove: () => void;
}> = ({ item, onChange, onRemove }) => (
  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-3 relative">
    <button
      type="button"
      onClick={onRemove}
      className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
    >
      <TrashIcon className="w-3.5 h-3.5" />
    </button>
    <div className="grid grid-cols-2 gap-3">
      <Input
        label="Award Title"
        value={item.title}
        onChange={(v) => onChange({ ...item, title: v })}
        placeholder="Dean's List"
      />
      <Input
        label="Issuer"
        value={item.issuer}
        onChange={(v) => onChange({ ...item, issuer: v })}
        placeholder="University of..."
      />
    </div>
    <Input
      label="Date"
      value={item.date}
      onChange={(v) => onChange({ ...item, date: v })}
      placeholder="2023"
    />
    <Textarea
      label="Description"
      value={item.description}
      onChange={(v) => onChange({ ...item, description: v })}
      placeholder="Optional details..."
      rows={2}
    />
  </div>
);

const PublicationItem: React.FC<{
  item: Publication;
  onChange: (item: Publication) => void;
  onRemove: () => void;
}> = ({ item, onChange, onRemove }) => (
  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-3 relative">
    <button
      type="button"
      onClick={onRemove}
      className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
    >
      <TrashIcon className="w-3.5 h-3.5" />
    </button>
    <Input
      label="Title"
      value={item.title}
      onChange={(v) => onChange({ ...item, title: v })}
      placeholder="Research Paper Title"
    />
    <div className="grid grid-cols-2 gap-3">
      <Input
        label="Publisher"
        value={item.publisher}
        onChange={(v) => onChange({ ...item, publisher: v })}
        placeholder="IEEE, Springer..."
      />
      <Input
        label="Date"
        value={item.date}
        onChange={(v) => onChange({ ...item, date: v })}
        placeholder="2023"
      />
    </div>
    <Input
      label="URL"
      value={item.url}
      onChange={(v) => onChange({ ...item, url: v })}
      placeholder="https://doi.org/..."
    />
  </div>
);

const CustomSectionEditor: React.FC<{
  section: CustomSection;
  onChange: (section: CustomSection) => void;
  onRemove: () => void;
}> = ({ section, onChange, onRemove }) => {
  const addItem = () => {
    onChange({
      ...section,
      items: [...section.items, { id: generateId(), title: '', subtitle: '', description: '' }],
    });
  };
  const updateItem = (id: string, updated: CustomItem) => {
    onChange({ ...section, items: section.items.map((i) => (i.id === id ? updated : i)) });
  };
  const removeItem = (id: string) => {
    onChange({ ...section, items: section.items.filter((i) => i.id !== id) });
  };

  return (
    <Accordion
      title={section.sectionTitle || 'Custom Section'}
      icon="tune"
      isOpen={true}
      onToggle={() => {}}
      onRemove={onRemove}
    >
      <Input
        label="Section Title"
        value={section.sectionTitle}
        onChange={(v) => onChange({ ...section, sectionTitle: v })}
        placeholder="Certifications, Hobbies, etc."
      />
      <div className="space-y-3 mt-3">
        {section.items.map((item) => (
          <div
            key={item.id}
            className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-2 relative"
          >
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
            <Input
              label="Title"
              value={item.title}
              onChange={(v) => updateItem(item.id, { ...item, title: v })}
              placeholder="Item title"
            />
            <Input
              label="Subtitle"
              value={item.subtitle}
              onChange={(v) => updateItem(item.id, { ...item, subtitle: v })}
              placeholder="Optional subtitle"
            />
            <Textarea
              label="Description"
              value={item.description}
              onChange={(v) => updateItem(item.id, { ...item, description: v })}
              placeholder="Optional description"
              rows={2}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 text-sm font-medium hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-2"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          Add Item
        </button>
      </div>
    </Accordion>
  );
};

// ─── Section type definitions ────────────────────────────────────────────────

type DynamicSectionType =
  | 'experience'
  | 'education'
  | 'projects'
  | 'volunteering'
  | 'awards'
  | 'publications'
  | 'custom';

const SECTION_OPTIONS: { id: DynamicSectionType; label: string; icon: string }[] = [
  { id: 'education', label: 'Education', icon: 'school' },
  { id: 'experience', label: 'Experience', icon: 'work' },
  { id: 'projects', label: 'Projects', icon: 'code' },
  { id: 'volunteering', label: 'Volunteering', icon: 'volunteer_activism' },
  { id: 'awards', label: 'Awards / Grants', icon: 'emoji_events' },
  { id: 'publications', label: 'Publications', icon: 'article' },
  { id: 'custom', label: 'Custom Section', icon: 'tune' },
];

// ─── TEMPLATE CONFIG ─────────────────────────────────────────────────────────

const TEMPLATES: { id: TemplateType; label: string }[] = [
  { id: 'modern', label: 'Modern' },
  { id: 'minimalist', label: 'Minimalist' },
  { id: 'professional', label: 'Professional' },
  { id: 'europass', label: 'Europass' },
  { id: 'grant', label: 'Academic' },
  { id: 'tech', label: 'Tech' },
];

// ─── TEMPLATE THUMBNAIL (mobile template picker) ─────────────────────────────

const TEMPLATE_STYLES: Record<TemplateType, { header: string; accent: string }> = {
  modern: { header: 'bg-blue-600', accent: 'bg-blue-100' },
  minimalist: { header: 'bg-black', accent: 'bg-gray-200' },
  professional: { header: 'bg-slate-800', accent: 'bg-indigo-100' },
  europass: { header: 'bg-blue-800', accent: 'bg-blue-100' },
  grant: { header: 'bg-emerald-700', accent: 'bg-emerald-100' },
  tech: { header: 'bg-gray-900', accent: 'bg-cyan-100' },
};

function TemplateThumbnail({
  id,
  label,
  selected,
  onClick,
}: {
  id: TemplateType;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  const s = TEMPLATE_STYLES[id];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-xl overflow-hidden border-2 transition-all ${
        selected
          ? 'border-primary shadow-lg'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
      }`}
    >
      <div className="w-full aspect-[3/4] bg-white p-1.5 flex flex-col gap-1">
        <div className={`${s.header} h-5 rounded-sm`} />
        <div className="flex gap-1 flex-1">
          <div className="w-1/3 flex flex-col gap-1 pt-1">
            <div className={`h-2 ${s.accent} rounded-sm`} />
            <div className="h-1.5 bg-slate-100 rounded-sm" />
            <div className="h-1.5 bg-slate-100 rounded-sm" />
          </div>
          <div className="flex-1 flex flex-col gap-1 pt-1">
            <div className="h-1.5 bg-slate-200 rounded-sm" />
            <div className="h-1.5 bg-slate-200 rounded-sm" />
            <div className="h-1.5 bg-slate-200 rounded-sm w-3/4" />
            <div className="h-1.5 bg-slate-200 rounded-sm mt-1" />
            <div className="h-1.5 bg-slate-200 rounded-sm w-2/3" />
          </div>
        </div>
      </div>
      <div className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold text-center py-1.5 border-t border-slate-200 dark:border-slate-700">
        {label}
      </div>
      {selected && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow">
          <CheckIcon className="w-3 h-3 text-white" />
        </div>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function CVBuilder() {
  const [cvData, setCvData] = useState<CVData>(defaultCVData);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');
  const [openSections, setOpenSections] = useState<string[]>(['personal']);
  const [isExporting, setIsExporting] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [activeSections, setActiveSections] = useState<string[]>([
    'experience',
    'education',
    'skills',
    'languages',
  ]);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [mobileStep, setMobileStep] = useState<1 | 2>(1);
  const [previewScale, setPreviewScale] = useState(0.65);
  const previewRef = useRef<HTMLDivElement>(null);

  // Responsive A4 preview scale — fits within viewport on mobile
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 768) {
        setPreviewScale(Math.min((window.innerWidth - 32) / 794, 0.65));
      } else {
        setPreviewScale(0.65);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

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
    const savedSections = localStorage.getItem(STORAGE_KEY + '_sections');
    if (savedSections) {
      try {
        setActiveSections(JSON.parse(savedSections));
      } catch {
        // ignore
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
    }, 500);
    return () => clearTimeout(timer);
  }, [cvData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_sections', JSON.stringify(activeSections));
  }, [activeSections]);

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

  // ─── Generic array handlers ──────────────────────────────────────────────

  const addExperience = () =>
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
  const updateExperience = (id: string, updated: Experience) =>
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? updated : e)),
    }));
  const removeExperience = (id: string) =>
    setCvData((prev) => ({ ...prev, experience: prev.experience.filter((e) => e.id !== id) }));

  const addEducation = () =>
    setCvData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { id: generateId(), degree: '', school: '', startDate: '', endDate: '', gpa: '' },
      ],
    }));
  const updateEducation = (id: string, updated: Education) =>
    setCvData((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? updated : e)),
    }));
  const removeEducation = (id: string) =>
    setCvData((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));

  const addLanguage = () =>
    setCvData((prev) => ({
      ...prev,
      languages: [...prev.languages, { id: generateId(), name: '', proficiency: 'intermediate' }],
    }));
  const updateLanguage = (id: string, updated: Language) =>
    setCvData((prev) => ({
      ...prev,
      languages: prev.languages.map((l) => (l.id === id ? updated : l)),
    }));
  const removeLanguage = (id: string) =>
    setCvData((prev) => ({ ...prev, languages: prev.languages.filter((l) => l.id !== id) }));

  const addProject = () =>
    setCvData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        { id: generateId(), title: '', description: '', technologies: '', url: '' },
      ],
    }));
  const updateProject = (id: string, updated: Project) =>
    setCvData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? updated : p)),
    }));
  const removeProject = (id: string) =>
    setCvData((prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== id) }));

  const addVolunteering = () =>
    setCvData((prev) => ({
      ...prev,
      volunteering: [
        ...prev.volunteering,
        {
          id: generateId(),
          role: '',
          organization: '',
          startDate: '',
          endDate: '',
          description: '',
        },
      ],
    }));
  const updateVolunteering = (id: string, updated: Volunteering) =>
    setCvData((prev) => ({
      ...prev,
      volunteering: prev.volunteering.map((v) => (v.id === id ? updated : v)),
    }));
  const removeVolunteering = (id: string) =>
    setCvData((prev) => ({ ...prev, volunteering: prev.volunteering.filter((v) => v.id !== id) }));

  const addAward = () =>
    setCvData((prev) => ({
      ...prev,
      awards: [
        ...prev.awards,
        { id: generateId(), title: '', issuer: '', date: '', description: '' },
      ],
    }));
  const updateAward = (id: string, updated: Award) =>
    setCvData((prev) => ({ ...prev, awards: prev.awards.map((a) => (a.id === id ? updated : a)) }));
  const removeAward = (id: string) =>
    setCvData((prev) => ({ ...prev, awards: prev.awards.filter((a) => a.id !== id) }));

  const addPublication = () =>
    setCvData((prev) => ({
      ...prev,
      publications: [
        ...prev.publications,
        { id: generateId(), title: '', publisher: '', date: '', url: '' },
      ],
    }));
  const updatePublication = (id: string, updated: Publication) =>
    setCvData((prev) => ({
      ...prev,
      publications: prev.publications.map((p) => (p.id === id ? updated : p)),
    }));
  const removePublication = (id: string) =>
    setCvData((prev) => ({ ...prev, publications: prev.publications.filter((p) => p.id !== id) }));

  const addCustomSection = () => {
    const newSection: CustomSection = {
      id: generateId(),
      sectionTitle: '',
      items: [{ id: generateId(), title: '', subtitle: '', description: '' }],
    };
    setCvData((prev) => ({ ...prev, customSections: [...prev.customSections, newSection] }));
    setActiveSections((prev) => [...prev, `custom_${newSection.id}`]);
  };
  const updateCustomSection = (id: string, updated: CustomSection) =>
    setCvData((prev) => ({
      ...prev,
      customSections: prev.customSections.map((cs) => (cs.id === id ? updated : cs)),
    }));
  const removeCustomSection = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      customSections: prev.customSections.filter((cs) => cs.id !== id),
    }));
    setActiveSections((prev) => prev.filter((s) => s !== `custom_${id}`));
  };

  // ─── Section management ──────────────────────────────────────────────────

  const addSection = (type: DynamicSectionType) => {
    if (type === 'custom') {
      addCustomSection();
    } else {
      setActiveSections((prev) => [...prev, type]);
    }
    setShowAddMenu(false);
  };

  const removeSection = (sectionId: string) => {
    setActiveSections((prev) => prev.filter((s) => s !== sectionId));
  };

  // Check if section is available to add (non-custom can only appear once)
  const availableSections = SECTION_OPTIONS.filter((opt) => {
    if (opt.id === 'custom') return true; // Can always add more custom sections
    return !activeSections.includes(opt.id);
  });

  // ─── PDF Export — A4 fix with multi-page ─────────────────────────────────

  const exportToPDF = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(previewRef.current, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let position = 0;

      while (position < imgHeight) {
        if (position > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, -position, imgWidth, imgHeight);
        position += pageHeight;
      }

      const fileName = `${cvData.personalInfo.firstName || 'My'}_${cvData.personalInfo.lastName || 'Resume'}_CV.pdf`;
      pdf.save(fileName);
      // After successful export, offer to sync profile
      setShowSyncModal(true);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // ─── CV → Profile Sync ─────────────────────────────────────────────────

  const syncToProfile = async () => {
    setIsSyncing(true);
    try {
      const fullName = `${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}`.trim();

      const educationHistory = cvData.education.map((edu) => ({
        school: edu.school,
        degree: edu.degree,
        year: edu.endDate || edu.startDate,
        description: edu.gpa ? `GPA: ${edu.gpa}` : '',
      }));

      const workExperience = cvData.experience.map((exp) => ({
        company: exp.company,
        role: exp.role,
        duration: `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`,
        description: exp.description,
      }));

      await userApi.updateProfile({
        fullName: fullName || undefined,
        headline: cvData.personalInfo.jobTitle || undefined,
        bio: cvData.summary || undefined,
        skills: cvData.skills.length > 0 ? cvData.skills : undefined,
        educationHistory: educationHistory.length > 0 ? educationHistory : undefined,
        workExperience: workExperience.length > 0 ? workExperience : undefined,
      });

      toast.success('Profile updated successfully!');
      setShowSyncModal(false);
    } catch (error) {
      console.error('Failed to sync profile:', error);
      toast.error('Failed to update profile.');
    } finally {
      setIsSyncing(false);
    }
  };

  const clearDraft = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      setCvData(defaultCVData);
      localStorage.removeItem(STORAGE_KEY);
      setActiveSections(['experience', 'education', 'skills', 'languages']);
    }
  };

  // ─── Template Renderer ───────────────────────────────────────────────────

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'modern':
        return <ModernTemplate data={cvData} />;
      case 'minimalist':
        return <MinimalistTemplate data={cvData} />;
      case 'professional':
        return <ProfessionalTemplate data={cvData} />;
      case 'europass':
        return <EuropassTemplate data={cvData} />;
      case 'grant':
        return <GrantTemplate data={cvData} />;
      case 'tech':
        return <TechTemplate data={cvData} />;
      default:
        return <ModernTemplate data={cvData} />;
    }
  };

  // ─── Render dynamic section editor ───────────────────────────────────────

  const renderSectionEditor = (sectionId: string) => {
    // Custom sections have IDs like "custom_abc1234"
    if (sectionId.startsWith('custom_')) {
      const csId = sectionId.replace('custom_', '');
      const cs = cvData.customSections.find((s) => s.id === csId);
      if (!cs) return null;
      return (
        <CustomSectionEditor
          key={sectionId}
          section={cs}
          onChange={(updated) => updateCustomSection(csId, updated)}
          onRemove={() => removeCustomSection(csId)}
        />
      );
    }

    switch (sectionId) {
      case 'experience':
        return (
          <Accordion
            key="experience"
            title="Work Experience"
            icon="work"
            isOpen={openSections.includes('experience')}
            onToggle={() => toggleSection('experience')}
            onRemove={() => removeSection('experience')}
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
                <PlusIcon className="w-3.5 h-3.5" />
                Add Experience
              </button>
            </div>
          </Accordion>
        );
      case 'education':
        return (
          <Accordion
            key="education"
            title="Education"
            icon="school"
            isOpen={openSections.includes('education')}
            onToggle={() => toggleSection('education')}
            onRemove={() => removeSection('education')}
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
                <PlusIcon className="w-3.5 h-3.5" />
                Add Education
              </button>
            </div>
          </Accordion>
        );
      case 'skills':
        return (
          <Accordion
            key="skills"
            title="Skills"
            icon="psychology"
            isOpen={openSections.includes('skills')}
            onToggle={() => toggleSection('skills')}
            onRemove={() => removeSection('skills')}
          >
            <SkillsInput
              skills={cvData.skills}
              onChange={(skills) => setCvData((prev) => ({ ...prev, skills }))}
            />
          </Accordion>
        );
      case 'languages':
        return (
          <Accordion
            key="languages"
            title="Languages"
            icon="translate"
            isOpen={openSections.includes('languages')}
            onToggle={() => toggleSection('languages')}
            onRemove={() => removeSection('languages')}
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
                <PlusIcon className="w-3.5 h-3.5" />
                Add Language
              </button>
            </div>
          </Accordion>
        );
      case 'projects':
        return (
          <Accordion
            key="projects"
            title="Projects"
            icon="code"
            isOpen={openSections.includes('projects')}
            onToggle={() => toggleSection('projects')}
            onRemove={() => removeSection('projects')}
          >
            <div className="space-y-3">
              {cvData.projects.map((p) => (
                <ProjectItem
                  key={p.id}
                  item={p}
                  onChange={(updated) => updateProject(p.id, updated)}
                  onRemove={() => removeProject(p.id)}
                />
              ))}
              <button
                type="button"
                onClick={addProject}
                className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 text-sm font-medium hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-2"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Add Project
              </button>
            </div>
          </Accordion>
        );
      case 'volunteering':
        return (
          <Accordion
            key="volunteering"
            title="Volunteering"
            icon="volunteer_activism"
            isOpen={openSections.includes('volunteering')}
            onToggle={() => toggleSection('volunteering')}
            onRemove={() => removeSection('volunteering')}
          >
            <div className="space-y-3">
              {cvData.volunteering.map((v) => (
                <VolunteeringItem
                  key={v.id}
                  item={v}
                  onChange={(updated) => updateVolunteering(v.id, updated)}
                  onRemove={() => removeVolunteering(v.id)}
                />
              ))}
              <button
                type="button"
                onClick={addVolunteering}
                className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 text-sm font-medium hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-2"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Add Volunteering
              </button>
            </div>
          </Accordion>
        );
      case 'awards':
        return (
          <Accordion
            key="awards"
            title="Awards / Grants"
            icon="emoji_events"
            isOpen={openSections.includes('awards')}
            onToggle={() => toggleSection('awards')}
            onRemove={() => removeSection('awards')}
          >
            <div className="space-y-3">
              {cvData.awards.map((a) => (
                <AwardItem
                  key={a.id}
                  item={a}
                  onChange={(updated) => updateAward(a.id, updated)}
                  onRemove={() => removeAward(a.id)}
                />
              ))}
              <button
                type="button"
                onClick={addAward}
                className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 text-sm font-medium hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-2"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Add Award
              </button>
            </div>
          </Accordion>
        );
      case 'publications':
        return (
          <Accordion
            key="publications"
            title="Publications"
            icon="article"
            isOpen={openSections.includes('publications')}
            onToggle={() => toggleSection('publications')}
            onRemove={() => removeSection('publications')}
          >
            <div className="space-y-3">
              {cvData.publications.map((pub) => (
                <PublicationItem
                  key={pub.id}
                  item={pub}
                  onChange={(updated) => updatePublication(pub.id, updated)}
                  onRemove={() => removePublication(pub.id)}
                />
              ))}
              <button
                type="button"
                onClick={addPublication}
                className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 text-sm font-medium hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-2"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Add Publication
              </button>
            </div>
          </Accordion>
        );
      default:
        return null;
    }
  };

  // ─── Main Render ─────────────────────────────────────────────────────────

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── LEFT PANEL: Form ───────────────────────────────────────────────────
          Desktop (md+): always visible, fixed 420px width
          Mobile (<md):  full screen on step 1, hidden on step 2              */}
      <div
        className={`border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark
          md:w-[420px] md:shrink-0 md:flex md:flex-col md:overflow-y-auto
          ${mobileStep === 1 ? 'flex flex-1 flex-col overflow-y-auto' : 'hidden'}`}
      >
        {/* Mobile step indicator */}
        <div className="md:hidden flex items-center gap-3 px-4 pt-4 pb-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
              1
            </span>
            <span className="text-xs font-semibold text-primary">Information</span>
          </div>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-1.5 opacity-40">
            <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 text-[10px] font-bold flex items-center justify-center">
              2
            </span>
            <span className="text-xs font-semibold text-slate-400">Design</span>
          </div>
        </div>

        {/* Form content */}
        <div className="p-6 pb-4 space-y-4 flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">CV Editor</h2>
            <button
              onClick={clearDraft}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Personal Details — always fixed */}
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

          {/* Summary — always fixed */}
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

          {/* Dynamic Sections */}
          {activeSections.map((sectionId) => renderSectionEditor(sectionId))}

          {/* + Add Section */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="w-full py-3 border-2 border-dashed border-primary/30 rounded-xl text-primary text-sm font-semibold hover:bg-primary/5 hover:border-primary/50 transition-all flex items-center justify-center gap-2"
            >
              <PlusCircleIcon className="w-3.5 h-3.5" />
              Add Section
            </button>

            {showAddMenu && (
              <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                {availableSections.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400">All sections added</div>
                ) : (
                  availableSections.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => addSection(opt.id)}
                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-primary text-sm">
                        {opt.icon}
                      </span>
                      <span className="text-sm text-slate-700 dark:text-slate-200">
                        {opt.label}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile: sticky "Choose Design" CTA */}
        <div className="md:hidden shrink-0 sticky bottom-0 p-4 bg-white dark:bg-card-dark border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setMobileStep(2)}
            className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            Choose Design
            <ArrowDownTrayIcon className="w-4 h-4 -rotate-90" />
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL: Template picker + Preview ─────────────────────────────
          Desktop (md+): always visible, flex-1
          Mobile (<md):  full screen on step 2, hidden on step 1              */}
      <div
        className={`bg-slate-100 dark:bg-[#0B0D15]
          md:flex md:flex-1 md:flex-col md:overflow-hidden
          ${mobileStep === 2 ? 'flex flex-1 flex-col overflow-hidden' : 'hidden'}`}
      >
        {/* Mobile: step indicator + Back + Download PDF */}
        <div className="md:hidden shrink-0 flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setMobileStep(1)}
            className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4 rotate-180" />
            Back
          </button>
          <div className="flex items-center gap-2 flex-1 justify-center">
            <div className="flex items-center gap-1 opacity-40">
              <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 text-[10px] font-bold flex items-center justify-center">
                1
              </span>
              <span className="text-xs font-semibold text-slate-400">Information</span>
            </div>
            <div className="w-6 h-px bg-slate-300 dark:bg-slate-600" />
            <div className="flex items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                2
              </span>
              <span className="text-xs font-semibold text-primary">Design</span>
            </div>
          </div>
          <button
            type="button"
            onClick={exportToPDF}
            disabled={isExporting}
            className="bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {isExporting ? (
              <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ArrowDownTrayIcon className="w-3.5 h-3.5" />
            )}
            {isExporting ? 'Exporting...' : 'Download PDF'}
          </button>
        </div>

        {/* Desktop: template toolbar (hidden on mobile) */}
        <div className="hidden md:flex shrink-0 px-6 py-3 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-slate-700 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Template:</span>
            <div className="flex gap-1 flex-wrap">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedTemplate === template.id
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={exportToPDF}
            disabled={isExporting}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <ArrowPathIcon className="w-[18px] h-[18px] animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="w-[18px] h-[18px]" />
                Download PDF
              </>
            )}
          </button>
        </div>

        {/* Mobile: template thumbnail grid (hidden on desktop) */}
        <div className="md:hidden shrink-0 p-4 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-slate-700">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3">
            Choose a Template
          </p>
          <div className="grid grid-cols-3 gap-2">
            {TEMPLATES.map((t) => (
              <TemplateThumbnail
                key={t.id}
                id={t.id}
                label={t.label}
                selected={selectedTemplate === t.id}
                onClick={() => setSelectedTemplate(t.id)}
              />
            ))}
          </div>
        </div>

        {/* Preview Area — A4 constrained, dynamic scale */}
        <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center">
          <div
            id="cv-preview"
            ref={previewRef}
            className="bg-white shadow-xl"
            style={{
              width: '210mm',
              minHeight: '297mm',
              transform: `scale(${previewScale})`,
              transformOrigin: 'top center',
            }}
          >
            {renderTemplate()}
          </div>
        </div>
      </div>

      {/* ─── CV → Profile Sync Modal ─────────────────────────────────── */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowPathIcon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Update your Portfolio?
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Would you like to update your main Profile with data from this CV? This will sync your{' '}
              <strong>name, headline, bio, education, experience, and skills</strong>.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSyncModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                No, Skip
              </button>
              <button
                onClick={syncToProfile}
                disabled={isSyncing}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSyncing ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    Yes, Update Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
