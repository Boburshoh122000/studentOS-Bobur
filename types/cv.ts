// CV Builder Data Types

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  phone: string;
  linkedin: string;
  location: string;
  photoUrl?: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'native' | 'fluent' | 'advanced' | 'intermediate' | 'beginner';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string;
  url: string;
}

export interface Volunteering {
  id: string;
  role: string;
  organization: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
}

export interface Publication {
  id: string;
  title: string;
  publisher: string;
  date: string;
  url: string;
}

export interface CustomItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface CustomSection {
  id: string;
  sectionTitle: string;
  items: CustomItem[];
}

export interface CVData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: Language[];
  projects: Project[];
  volunteering: Volunteering[];
  awards: Award[];
  publications: Publication[];
  customSections: CustomSection[];
}

export type TemplateType =
  | 'modern'
  | 'minimalist'
  | 'professional'
  | 'europass'
  | 'grant'
  | 'tech'
  | 'creative'
  | 'executive'
  | 'simple'
  | 'starter';

export const defaultCVData: CVData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    jobTitle: '',
    email: '',
    phone: '',
    linkedin: '',
    location: '',
    photoUrl: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  languages: [],
  projects: [],
  volunteering: [],
  awards: [],
  publications: [],
  customSections: [],
};

// Helper to generate unique IDs
export const generateId = () => Math.random().toString(36).substring(2, 9);
