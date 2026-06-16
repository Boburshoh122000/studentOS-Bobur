import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
  CreativeTemplate,
  ExecutiveTemplate,
  SimpleTemplate,
  StarterTemplate,
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
          className={`material-symbols-outlined text-slate-400 text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
  const { t } = useTranslation();
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
          placeholder={t('CV.add_skill_ph')}
          className="flex-1 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
        />
        <button
          type="button"
          onClick={addSkill}
          className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
        >
          {t('CV.add')}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(index)}
              className="hover:text-red-500"
              title={t('CV.rm_skill')}
            >
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
}> = ({ exp, onChange, onRemove }) => {
  const { t } = useTranslation();
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-3 relative">
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
        title={t('CV.rm_experience')}
      >
        <TrashIcon className="w-3.5 h-3.5" />
      </button>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t('CV.l_job_title')}
          value={exp.role}
          onChange={(v) => onChange({ ...exp, role: v })}
          placeholder={t('CV.ph_role')}
        />
        <Input
          label={t('CV.l_company')}
          value={exp.company}
          onChange={(v) => onChange({ ...exp, company: v })}
          placeholder={t('CV.ph_company')}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t('CV.l_start')}
          value={exp.startDate}
          onChange={(v) => onChange({ ...exp, startDate: v })}
          placeholder={t('CV.ph_exp_start')}
        />
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-500 uppercase">
            {t('CV.l_end')}
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={exp.current ? '' : exp.endDate}
              onChange={(e) => onChange({ ...exp, endDate: e.target.value })}
              placeholder={exp.current ? t('CV.ph_present') : t('CV.ph_exp_end')}
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
              {t('CV.current')}
            </label>
          </div>
        </div>
      </div>
      <Textarea
        label={t('CV.l_description')}
        value={exp.description}
        onChange={(v) => onChange({ ...exp, description: v })}
        placeholder={t('CV.ph_exp_desc')}
        rows={4}
      />
    </div>
  );
};

const EducationItem: React.FC<{
  edu: Education;
  onChange: (edu: Education) => void;
  onRemove: () => void;
}> = ({ edu, onChange, onRemove }) => {
  const { t } = useTranslation();
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-3 relative">
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
        title={t('CV.rm_education')}
      >
        <TrashIcon className="w-3.5 h-3.5" />
      </button>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t('CV.l_degree')}
          value={edu.degree}
          onChange={(v) => onChange({ ...edu, degree: v })}
          placeholder={t('CV.ph_degree')}
        />
        <Input
          label={t('CV.l_school')}
          value={edu.school}
          onChange={(v) => onChange({ ...edu, school: v })}
          placeholder={t('CV.ph_school')}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t('CV.l_start')}
          value={edu.startDate}
          onChange={(v) => onChange({ ...edu, startDate: v })}
          placeholder={t('CV.ph_edu_start')}
        />
        <Input
          label={t('CV.l_end')}
          value={edu.endDate}
          onChange={(v) => onChange({ ...edu, endDate: v })}
          placeholder={t('CV.ph_edu_end')}
        />
      </div>
    </div>
  );
};

const LanguageItem: React.FC<{
  lang: Language;
  onChange: (lang: Language) => void;
  onRemove: () => void;
}> = ({ lang, onChange, onRemove }) => {
  const { t } = useTranslation();
  return (
    <div className="flex gap-3 items-center">
      <input
        type="text"
        value={lang.name}
        onChange={(e) => onChange({ ...lang, name: e.target.value })}
        placeholder={t('CV.ph_language')}
        className="flex-1 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
      />
      <select
        value={lang.proficiency}
        onChange={(e) =>
          onChange({ ...lang, proficiency: e.target.value as Language['proficiency'] })
        }
        className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
        aria-label={t('CV.prof_aria')}
      >
        <option value="native">{t('CV.prof_native')}</option>
        <option value="fluent">{t('CV.prof_fluent')}</option>
        <option value="advanced">{t('CV.prof_advanced')}</option>
        <option value="intermediate">{t('CV.prof_intermediate')}</option>
        <option value="beginner">{t('CV.prof_beginner')}</option>
      </select>
      <button
        type="button"
        onClick={onRemove}
        className="p-2 text-slate-400 hover:text-red-500"
        title={t('CV.rm_language')}
      >
        <TrashIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

const ProjectItem: React.FC<{
  item: Project;
  onChange: (item: Project) => void;
  onRemove: () => void;
}> = ({ item, onChange, onRemove }) => {
  const { t } = useTranslation();
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-3 relative">
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
        title={t('CV.rm_project')}
      >
        <TrashIcon className="w-3.5 h-3.5" />
      </button>
      <Input
        label={t('CV.l_project_title')}
        value={item.title}
        onChange={(v) => onChange({ ...item, title: v })}
        placeholder={t('CV.ph_project_title')}
      />
      <Input
        label={t('CV.l_technologies')}
        value={item.technologies}
        onChange={(v) => onChange({ ...item, technologies: v })}
        placeholder={t('CV.ph_technologies')}
      />
      <Input
        label={t('CV.l_url')}
        value={item.url}
        onChange={(v) => onChange({ ...item, url: v })}
        placeholder={t('CV.ph_project_url')}
      />
      <Textarea
        label={t('CV.l_description')}
        value={item.description}
        onChange={(v) => onChange({ ...item, description: v })}
        placeholder={t('CV.ph_project_desc')}
        rows={3}
      />
    </div>
  );
};

const VolunteeringItem: React.FC<{
  item: Volunteering;
  onChange: (item: Volunteering) => void;
  onRemove: () => void;
}> = ({ item, onChange, onRemove }) => {
  const { t } = useTranslation();
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-3 relative">
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
        title={t('CV.rm_volunteering')}
      >
        <TrashIcon className="w-3.5 h-3.5" />
      </button>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t('CV.l_role')}
          value={item.role}
          onChange={(v) => onChange({ ...item, role: v })}
          placeholder={t('CV.ph_vol_role')}
        />
        <Input
          label={t('CV.l_organization')}
          value={item.organization}
          onChange={(v) => onChange({ ...item, organization: v })}
          placeholder={t('CV.ph_organization')}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t('CV.l_start')}
          value={item.startDate}
          onChange={(v) => onChange({ ...item, startDate: v })}
          placeholder={t('CV.ph_vol_start')}
        />
        <Input
          label={t('CV.l_end')}
          value={item.endDate}
          onChange={(v) => onChange({ ...item, endDate: v })}
          placeholder={t('CV.ph_vol_end')}
        />
      </div>
      <Textarea
        label={t('CV.l_description')}
        value={item.description}
        onChange={(v) => onChange({ ...item, description: v })}
        placeholder={t('CV.ph_vol_desc')}
        rows={3}
      />
    </div>
  );
};

const AwardItem: React.FC<{
  item: Award;
  onChange: (item: Award) => void;
  onRemove: () => void;
}> = ({ item, onChange, onRemove }) => {
  const { t } = useTranslation();
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-3 relative">
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
        title={t('CV.rm_award')}
      >
        <TrashIcon className="w-3.5 h-3.5" />
      </button>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t('CV.l_award_title')}
          value={item.title}
          onChange={(v) => onChange({ ...item, title: v })}
          placeholder={t('CV.ph_award_title')}
        />
        <Input
          label={t('CV.l_issuer')}
          value={item.issuer}
          onChange={(v) => onChange({ ...item, issuer: v })}
          placeholder={t('CV.ph_issuer')}
        />
      </div>
      <Input
        label={t('CV.l_date')}
        value={item.date}
        onChange={(v) => onChange({ ...item, date: v })}
        placeholder={t('CV.ph_award_date')}
      />
      <Textarea
        label={t('CV.l_description')}
        value={item.description}
        onChange={(v) => onChange({ ...item, description: v })}
        placeholder={t('CV.ph_award_desc')}
        rows={2}
      />
    </div>
  );
};

const PublicationItem: React.FC<{
  item: Publication;
  onChange: (item: Publication) => void;
  onRemove: () => void;
}> = ({ item, onChange, onRemove }) => {
  const { t } = useTranslation();
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-3 relative">
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
        title={t('CV.rm_publication')}
      >
        <TrashIcon className="w-3.5 h-3.5" />
      </button>
      <Input
        label={t('CV.l_title')}
        value={item.title}
        onChange={(v) => onChange({ ...item, title: v })}
        placeholder={t('CV.ph_pub_title')}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t('CV.l_publisher')}
          value={item.publisher}
          onChange={(v) => onChange({ ...item, publisher: v })}
          placeholder={t('CV.ph_publisher')}
        />
        <Input
          label={t('CV.l_date')}
          value={item.date}
          onChange={(v) => onChange({ ...item, date: v })}
          placeholder={t('CV.ph_pub_date')}
        />
      </div>
      <Input
        label={t('CV.l_url')}
        value={item.url}
        onChange={(v) => onChange({ ...item, url: v })}
        placeholder={t('CV.ph_pub_url')}
      />
    </div>
  );
};

const CustomSectionEditor: React.FC<{
  section: CustomSection;
  onChange: (section: CustomSection) => void;
  onRemove: () => void;
}> = ({ section, onChange, onRemove }) => {
  const { t } = useTranslation();
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
      title={section.sectionTitle || t('CV.sec_custom')}
      icon="tune"
      isOpen={true}
      onToggle={() => {}}
      onRemove={onRemove}
    >
      <Input
        label={t('CV.l_section_title')}
        value={section.sectionTitle}
        onChange={(v) => onChange({ ...section, sectionTitle: v })}
        placeholder={t('CV.ph_section_title')}
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
              title={t('CV.rm_item')}
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
            <Input
              label={t('CV.l_title')}
              value={item.title}
              onChange={(v) => updateItem(item.id, { ...item, title: v })}
              placeholder={t('CV.ph_item_title')}
            />
            <Input
              label={t('CV.l_subtitle')}
              value={item.subtitle}
              onChange={(v) => updateItem(item.id, { ...item, subtitle: v })}
              placeholder={t('CV.ph_subtitle')}
            />
            <Textarea
              label={t('CV.l_description')}
              value={item.description}
              onChange={(v) => updateItem(item.id, { ...item, description: v })}
              placeholder={t('CV.ph_item_desc')}
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
          {t('CV.add_item')}
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

const SECTION_OPTIONS: { id: DynamicSectionType; labelKey: string; icon: string }[] = [
  { id: 'education', labelKey: 'CV.opt_education', icon: 'school' },
  { id: 'experience', labelKey: 'CV.opt_experience', icon: 'work' },
  { id: 'projects', labelKey: 'CV.opt_projects', icon: 'code' },
  { id: 'volunteering', labelKey: 'CV.opt_volunteering', icon: 'volunteer_activism' },
  { id: 'awards', labelKey: 'CV.opt_awards', icon: 'emoji_events' },
  { id: 'publications', labelKey: 'CV.opt_publications', icon: 'article' },
  { id: 'custom', labelKey: 'CV.opt_custom', icon: 'tune' },
];

// ─── TEMPLATE CONFIG ─────────────────────────────────────────────────────────

const TEMPLATES: { id: TemplateType; label: string }[] = [
  { id: 'modern', label: 'Modern' },
  { id: 'minimalist', label: 'Minimalist' },
  { id: 'professional', label: 'Professional' },
  { id: 'europass', label: 'Europass' },
  { id: 'grant', label: 'Academic' },
  { id: 'tech', label: 'Tech' },
  { id: 'creative', label: 'Creative' },
  { id: 'executive', label: 'Executive' },
  { id: 'simple', label: 'Simple' },
  { id: 'starter', label: 'Starter' },
];

// ─── TEMPLATE THUMBNAIL (mobile + desktop template picker) ───────────────────

const TEMPLATE_STYLES: Record<TemplateType, { header: string; accent: string }> = {
  modern: { header: 'bg-blue-600', accent: 'bg-blue-100' },
  minimalist: { header: 'bg-black', accent: 'bg-gray-200' },
  professional: { header: 'bg-slate-800', accent: 'bg-indigo-100' },
  europass: { header: 'bg-blue-800', accent: 'bg-blue-100' },
  grant: { header: 'bg-emerald-700', accent: 'bg-emerald-100' },
  tech: { header: 'bg-gray-900', accent: 'bg-cyan-100' },
  creative: { header: 'bg-violet-700', accent: 'bg-violet-100' },
  executive: { header: 'bg-slate-900', accent: 'bg-amber-100' },
  simple: { header: 'bg-white border border-gray-300', accent: 'bg-gray-100' },
  starter: { header: 'bg-teal-500', accent: 'bg-teal-100' },
};

function TemplateThumbnail({
  id,
  label,
  selected,
  onClick,
  compact = false,
}: {
  id: TemplateType;
  label: string;
  selected: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  const s = TEMPLATE_STYLES[id];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
        compact ? 'w-14' : 'w-full'
      } ${
        selected
          ? 'border-primary shadow-md'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
      }`}
    >
      <div className="w-full aspect-[3/4] bg-white p-1 flex flex-col gap-0.5">
        <div className={`${s.header} h-4 rounded-sm`} />
        <div className="flex gap-0.5 flex-1">
          <div className="w-1/3 flex flex-col gap-0.5 pt-0.5">
            <div className={`h-1.5 ${s.accent} rounded-sm`} />
            <div className="h-1 bg-slate-100 rounded-sm" />
            <div className="h-1 bg-slate-100 rounded-sm" />
          </div>
          <div className="flex-1 flex flex-col gap-0.5 pt-0.5">
            <div className="h-1 bg-slate-200 rounded-sm" />
            <div className="h-1 bg-slate-200 rounded-sm" />
            <div className="h-1 bg-slate-200 rounded-sm w-3/4" />
            <div className="h-1 bg-slate-200 rounded-sm mt-0.5" />
            <div className="h-1 bg-slate-200 rounded-sm w-2/3" />
          </div>
        </div>
      </div>
      <div className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] font-semibold text-center py-1 border-t border-slate-200 dark:border-slate-700 truncate px-1">
        {label}
      </div>
      {selected && (
        <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow">
          <CheckIcon className="w-2.5 h-2.5 text-white" />
        </div>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function CVBuilder() {
  const { t } = useTranslation();
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
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Responsive A4 preview scale — computed so the preview fills available width.
  // Uses 16px total margin (8px each side) on mobile for maximum width.
  // CSS `transform` doesn't affect layout, so we use a sized wrapper + `top left` origin.
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 768) {
        setPreviewScale((window.innerWidth - 16) / 794);
      } else {
        setPreviewScale(0.65);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Keep CSS custom properties in sync with previewScale.
  // ResizeObserver watches the actual page height (which can exceed one A4 page)
  // so the wrapper always matches the full scaled content — no cut-off.
  useEffect(() => {
    const page = previewRef.current;
    const wrapper = wrapperRef.current;
    if (!page || !wrapper) return;

    const sync = () => {
      const naturalH = page.offsetHeight; // actual rendered height (pre-scale)
      const scaledH = Math.max(
        Math.round(naturalH * previewScale),
        Math.round(1123 * previewScale)
      );
      wrapper.style.setProperty('--preview-w', `${Math.round(794 * previewScale)}px`);
      wrapper.style.setProperty('--preview-h', `${scaledH}px`);
      wrapper.style.setProperty('--preview-scale', `${previewScale}`);
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(page);
    return () => observer.disconnect();
  }, [previewScale]);

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

    // Safety net: if export hangs for more than 30s, unblock the button
    const safetyTimeout = setTimeout(() => {
      setIsExporting(false);
      toast.error(t('CV.export_timeout'));
    }, 30000);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const el = previewRef.current;
      const isMobile = window.innerWidth < 768;
      const captureScale = isMobile ? 1.5 : 2;

      // Clone the preview into a fixed off-screen container appended directly to
      // document.body. This bypasses the parent overflow-auto that clips the element
      // when its transform/position are reset — which caused empty PDFs on desktop
      // and "Export failed" errors on mobile.
      const offscreen = document.createElement('div');
      offscreen.style.cssText =
        'position:fixed;top:0;left:0;width:210mm;z-index:-9999;pointer-events:none;overflow:visible;';
      document.body.appendChild(offscreen);
      const clone = el.cloneNode(true) as HTMLDivElement;
      clone.style.cssText =
        'transform:none;transform-origin:top left;width:210mm;position:relative;';
      offscreen.appendChild(clone);

      let canvas: HTMLCanvasElement;
      try {
        canvas = await html2canvas(clone, {
          scale: captureScale,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          imageTimeout: 0,
        });
      } finally {
        document.body.removeChild(offscreen);
      }

      const buildPdf = (imgData: string) => {
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
        return pdf;
      };

      let imgData = canvas.toDataURL('image/jpeg', 0.85);
      let pdf = buildPdf(imgData);

      // Auto-reduce quality if PDF > 5 MB
      const MAX_BYTES = 5 * 1024 * 1024;
      if (pdf.output('blob').size > MAX_BYTES) {
        imgData = canvas.toDataURL('image/jpeg', 0.65);
        pdf = buildPdf(imgData);
      }

      const fileName = `${cvData.personalInfo.firstName || 'My'}_${cvData.personalInfo.lastName || 'Resume'}_CV.pdf`;

      // iOS Safari ignores the `download` attribute on blob URLs — open in new tab instead
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);

      if (isIOS) {
        window.open(blobUrl, '_blank');
        toast.success(t('CV.pdf_opened'));
        setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
      } else {
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1_000);
      }

      clearTimeout(safetyTimeout);
      setShowSyncModal(true);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast.error(t('CV.export_failed'));
    } finally {
      clearTimeout(safetyTimeout);
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

      toast.success(t('CV.profile_updated'));
      setShowSyncModal(false);
    } catch (error) {
      console.error('Failed to sync profile:', error);
      toast.error(t('CV.profile_update_failed'));
    } finally {
      setIsSyncing(false);
    }
  };

  const clearDraft = () => {
    if (confirm(t('CV.confirm_clear'))) {
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
      case 'creative':
        return <CreativeTemplate data={cvData} />;
      case 'executive':
        return <ExecutiveTemplate data={cvData} />;
      case 'simple':
        return <SimpleTemplate data={cvData} />;
      case 'starter':
        return <StarterTemplate data={cvData} />;
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
            title={t('CV.sec_experience')}
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
                {t('CV.add_experience')}
              </button>
            </div>
          </Accordion>
        );
      case 'education':
        return (
          <Accordion
            key="education"
            title={t('CV.sec_education')}
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
                {t('CV.add_education')}
              </button>
            </div>
          </Accordion>
        );
      case 'skills':
        return (
          <Accordion
            key="skills"
            title={t('CV.sec_skills')}
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
            title={t('CV.sec_languages')}
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
                {t('CV.add_language')}
              </button>
            </div>
          </Accordion>
        );
      case 'projects':
        return (
          <Accordion
            key="projects"
            title={t('CV.sec_projects')}
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
                {t('CV.add_project')}
              </button>
            </div>
          </Accordion>
        );
      case 'volunteering':
        return (
          <Accordion
            key="volunteering"
            title={t('CV.sec_volunteering')}
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
                {t('CV.add_volunteering')}
              </button>
            </div>
          </Accordion>
        );
      case 'awards':
        return (
          <Accordion
            key="awards"
            title={t('CV.sec_awards')}
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
                {t('CV.add_award')}
              </button>
            </div>
          </Accordion>
        );
      case 'publications':
        return (
          <Accordion
            key="publications"
            title={t('CV.sec_publications')}
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
                {t('CV.add_publication')}
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
            <span className="text-xs font-semibold text-primary">{t('CV.step_information')}</span>
          </div>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-1.5 opacity-40">
            <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 text-[10px] font-bold flex items-center justify-center">
              2
            </span>
            <span className="text-xs font-semibold text-slate-400">{t('CV.step_design')}</span>
          </div>
        </div>

        {/* Form content */}
        <div className="p-6 pb-4 space-y-4 flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              {t('CV.cv_editor')}
            </h2>
            <button
              onClick={clearDraft}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              {t('CV.clear_all')}
            </button>
          </div>

          {/* Personal Details — always fixed */}
          <Accordion
            title={t('CV.sec_personal')}
            icon="person"
            isOpen={openSections.includes('personal')}
            onToggle={() => toggleSection('personal')}
          >
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t('CV.l_first_name')}
                value={cvData.personalInfo.firstName}
                onChange={(v) => updatePersonalInfo('firstName', v)}
                placeholder={t('CV.ph_first_name')}
              />
              <Input
                label={t('CV.l_last_name')}
                value={cvData.personalInfo.lastName}
                onChange={(v) => updatePersonalInfo('lastName', v)}
                placeholder={t('CV.ph_last_name')}
              />
            </div>
            <Input
              label={t('CV.l_job_title')}
              value={cvData.personalInfo.jobTitle}
              onChange={(v) => updatePersonalInfo('jobTitle', v)}
              placeholder={t('CV.ph_job_title')}
            />
            <Input
              label={t('CV.l_email')}
              value={cvData.personalInfo.email}
              onChange={(v) => updatePersonalInfo('email', v)}
              placeholder={t('CV.ph_email')}
              type="email"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t('CV.l_phone')}
                value={cvData.personalInfo.phone}
                onChange={(v) => updatePersonalInfo('phone', v)}
                placeholder={t('CV.ph_phone')}
              />
              <Input
                label={t('CV.l_location')}
                value={cvData.personalInfo.location}
                onChange={(v) => updatePersonalInfo('location', v)}
                placeholder={t('CV.ph_location')}
              />
            </div>
            <Input
              label={t('CV.l_linkedin')}
              value={cvData.personalInfo.linkedin}
              onChange={(v) => updatePersonalInfo('linkedin', v)}
              placeholder={t('CV.ph_linkedin')}
            />
          </Accordion>

          {/* Summary — always fixed */}
          <Accordion
            title={t('CV.sec_summary')}
            icon="summarize"
            isOpen={openSections.includes('summary')}
            onToggle={() => toggleSection('summary')}
          >
            <Textarea
              label={t('CV.l_about_you')}
              value={cvData.summary}
              onChange={(v) => setCvData((prev) => ({ ...prev, summary: v }))}
              placeholder={t('CV.ph_summary')}
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
              {t('CV.add_section')}
            </button>

            {showAddMenu && (
              <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                {availableSections.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400">{t('CV.all_added')}</div>
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
                        {t(opt.labelKey)}
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
            {t('CV.choose_design')}
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
            {t('CV.back')}
          </button>
          <div className="flex items-center gap-2 flex-1 justify-center">
            <div className="flex items-center gap-1 opacity-40">
              <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 text-[10px] font-bold flex items-center justify-center">
                1
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {t('CV.step_information')}
              </span>
            </div>
            <div className="w-6 h-px bg-slate-300 dark:bg-slate-600" />
            <div className="flex items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                2
              </span>
              <span className="text-xs font-semibold text-primary">{t('CV.step_design')}</span>
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
            {isExporting ? t('CV.exporting') : t('CV.download_pdf')}
          </button>
        </div>

        {/* Desktop: template toolbar (hidden on mobile) */}
        <div className="hidden md:flex shrink-0 px-4 py-3 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-slate-700 items-center gap-4">
          <span className="text-[11px] font-semibold text-slate-500 uppercase shrink-0">
            {t('CV.template_label')}
          </span>
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-2 pb-1">
              {TEMPLATES.map((template) => (
                <TemplateThumbnail
                  key={template.id}
                  id={template.id}
                  label={template.label}
                  selected={selectedTemplate === template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  compact
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={exportToPDF}
            disabled={isExporting}
            className="shrink-0 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <ArrowPathIcon className="w-[18px] h-[18px] animate-spin" />
                {t('CV.exporting')}
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="w-[18px] h-[18px]" />
                {t('CV.download_pdf')}
              </>
            )}
          </button>
        </div>

        {/* Mobile: template thumbnail grid (hidden on desktop) */}
        <div className="md:hidden shrink-0 p-4 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-slate-700">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3">
            {t('CV.choose_template')}
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

        {/* Preview Area — A4 constrained, dynamic scale.
            CSS transform does NOT change layout size, so we use a wrapper div sized
            to the visual (post-scale) dimensions with transformOrigin top-left.
            This lets flex justify-center work correctly on mobile. */}
        <div className="flex-1 overflow-auto p-2 md:p-8 flex justify-center items-start">
          {/* Wrapper: takes up exactly the visual footprint of the scaled A4 */}
          <div className="cv-preview-wrapper" ref={wrapperRef}>
            <div id="cv-preview" ref={previewRef} className="cv-preview-page bg-white shadow-xl">
              {renderTemplate()}
            </div>
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
                {t('CV.sync_title')}
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('CV.sync_desc_pre')} <strong>{t('CV.sync_desc_bold')}</strong>.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSyncModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                {t('CV.sync_skip')}
              </button>
              <button
                onClick={syncToProfile}
                disabled={isSyncing}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSyncing ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    {t('CV.syncing')}
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    {t('CV.sync_confirm')}
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
