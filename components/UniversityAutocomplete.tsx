import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { universityApi } from '../src/services/api';
import { BuildingLibraryIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/solid';

export interface UniversityValue {
  id: number | null;
  name: string;
}

interface University {
  id: number;
  nameUz: string;
  nameRu: string | null;
  nameEn: string | null;
  region: string | null;
  type: string | null;
}

interface Props {
  value: UniversityValue;
  onChange: (val: UniversityValue) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  inputClassName?: string;
}

function highlight(text: string, query: string): React.ReactElement {
  if (!query || query.length < 2) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <strong className="font-bold text-blue-600 dark:text-blue-400">
        {text.slice(idx, idx + query.length)}
      </strong>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function UniversityAutocomplete({
  value,
  onChange,
  placeholder,
  label,
  required,
  inputClassName,
}: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState(value.name);
  const [allUniversities, setAllUniversities] = useState<University[]>([]);
  const [filtered, setFiltered] = useState<University[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  const listboxId = 'university-listbox';

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Load all universities once on mount
  useEffect(() => {
    setIsLoading(true);
    universityApi
      .search('', 250)
      .then((res) => {
        setAllUniversities(res.data?.universities ?? []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Client-side filter whenever query or list changes
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
      setFiltered([]);
      return;
    }
    const results = allUniversities.filter(
      (u) =>
        u.nameUz.toLowerCase().includes(q) ||
        (u.nameRu?.toLowerCase().includes(q) ?? false) ||
        (u.nameEn?.toLowerCase().includes(q) ?? false)
    );
    setFiltered(results.slice(0, 50));
  }, [query, allUniversities]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!listRef.current || highlighted < 0) return;
    const items = listRef.current.querySelectorAll('[data-option]');
    items[highlighted]?.scrollIntoView({ block: 'nearest' });
  }, [highlighted]);

  const selectItem = (u: University) => {
    const name = u.nameUz;
    setQuery(name);
    onChange({ id: u.id, name });
    setIsOpen(false);
    setFiltered([]);
  };

  const selectCustom = () => {
    const name = query.trim();
    setQuery(name);
    onChange({ id: null, name });
    setIsOpen(false);
    setFiltered([]);
  };

  const clear = () => {
    setQuery('');
    onChange({ id: null, name: '' });
    setFiltered([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const showCustomOption = query.trim().length >= 2;
  const totalOptions = filtered.length + (showCustomOption ? 1 : 0);

  // Plain function: handler goes to a native input, so memoization buys nothing
  // and the deps list (incl. selectItem/selectCustom) made useCallback pointless.
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' && query.trim().length >= 2) {
        setIsOpen(true);
        setHighlighted(0);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, totalOptions - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlighted === filtered.length) {
        selectCustom();
      } else if (highlighted >= 0 && filtered[highlighted]) {
        selectItem(filtered[highlighted]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlighted(-1);
    }
  };

  const isMatched = value.id !== null;

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Input */}
      <div className="relative">
        <BuildingLibraryIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            const v = e.target.value;
            setQuery(v);
            setHighlighted(-1);
            if (v.trim().length >= 2) {
              setIsOpen(true);
            } else {
              setIsOpen(false);
            }
            if (v === '') onChange({ id: null, name: '' });
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder={
            isLoading ? t('University.loading') : (placeholder ?? t('University.search_ph'))
          }
          disabled={isLoading}
          role="combobox"
          autoComplete="off"
          aria-label={label || t('University.aria_input')}
          aria-expanded={isOpen ? 'true' : 'false'}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          className={
            inputClassName ??
            'w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50'
          }
        />

        {/* Right indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          )}
          {!isLoading && query && (
            <button
              type="button"
              onClick={clear}
              aria-label={t('University.aria_clear')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          )}
          {!isLoading && !query && (
            <ChevronDownIcon
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          )}
        </div>
      </div>

      {/* Match badge */}
      {isMatched && (
        <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
          ✓ Verified university
        </p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={t('University.aria_suggestions')}
          className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {/* No results */}
          {filtered.length === 0 && !isLoading && (
            <li
              role="option"
              aria-selected="false"
              aria-disabled="true"
              className="px-4 py-3 text-sm text-slate-400 text-center select-none"
            >
              {t('University.no_results')}
            </li>
          )}

          {/* University items */}
          {filtered.map((u, i) => {
            const isHighlighted = highlighted === i;
            const q = query.trim();
            // Determine which name to show as secondary match context
            const hasRuMatch = u.nameRu?.toLowerCase().includes(q.toLowerCase());
            const hasEnMatch = u.nameEn?.toLowerCase().includes(q.toLowerCase());
            const matchedAlt = hasRuMatch ? u.nameRu : hasEnMatch ? u.nameEn : null;

            return (
              <li
                key={u.id}
                role="option"
                aria-selected={isHighlighted ? 'true' : 'false'}
                data-option
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectItem(u);
                }}
                onMouseEnter={() => setHighlighted(i)}
                className={`flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                  isHighlighted
                    ? 'bg-blue-50 dark:bg-blue-900/25'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <BuildingLibraryIcon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  {/* Primary: Uzbek name */}
                  <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight">
                    {highlight(u.nameUz, q)}
                  </p>
                  {/* Secondary: matched translation */}
                  {matchedAlt && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5 truncate">
                      {highlight(matchedAlt, q)}
                    </p>
                  )}
                  {/* Region */}
                  {u.region && <p className="text-[11px] text-slate-400 mt-0.5">{u.region}</p>}
                </div>
              </li>
            );
          })}

          {/* Custom entry option */}
          {showCustomOption && (
            <li
              role="option"
              aria-selected={highlighted === filtered.length ? 'true' : 'false'}
              data-option
              onMouseDown={(e) => {
                e.preventDefault();
                selectCustom();
              }}
              onMouseEnter={() => setHighlighted(filtered.length)}
              className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-t border-slate-100 dark:border-slate-700/60 transition-colors ${
                highlighted === filtered.length
                  ? 'bg-blue-50 dark:bg-blue-900/25'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-blue-500 text-base font-bold leading-none shrink-0">+</span>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {t('University.other')} &ldquo;
                <span className="font-semibold text-slate-800 dark:text-white">{query.trim()}</span>
                &rdquo;
              </span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
