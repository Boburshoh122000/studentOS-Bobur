import { useState, useEffect, useRef, useCallback } from 'react';
import { universityApi } from '../src/services/api';
import { BuildingLibraryIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export interface UniversityValue {
  id: number | null;
  name: string;
}

interface University {
  id: number;
  nameUz: string;
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

function useDebounce<T>(val: T, ms: number): T {
  const [debounced, setDebounced] = useState(val);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(val), ms);
    return () => clearTimeout(t);
  }, [val, ms]);
  return debounced;
}

export default function UniversityAutocomplete({
  value,
  onChange,
  placeholder = 'e.g. Toshkent Davlat Texnika Universiteti',
  label,
  required,
  inputClassName,
}: Props) {
  const [query, setQuery] = useState(value.name);
  const [results, setResults] = useState<University[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [touched, setTouched] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Fetch suggestions
  useEffect(() => {
    if (!touched) return;
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    universityApi
      .search(debouncedQuery)
      .then((res) => {
        if (cancelled) return;
        setResults(res.data?.universities ?? []);
        setIsOpen(true);
        setHighlighted(-1);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, touched]);

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

  // Keyboard navigation
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) return;
      const total = results.length + (query.trim().length >= 2 ? 1 : 0); // +1 for custom entry

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlighted((h) => Math.min(h + 1, total - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlighted((h) => Math.max(h - 1, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlighted === results.length) {
          // Custom entry
          selectCustom();
        } else if (highlighted >= 0 && results[highlighted]) {
          selectItem(results[highlighted]);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    },
    [isOpen, results, highlighted, query]
  );

  // Scroll highlighted item into view
  useEffect(() => {
    if (!listRef.current || highlighted < 0) return;
    const items = listRef.current.querySelectorAll('[data-option]');
    items[highlighted]?.scrollIntoView({ block: 'nearest' });
  }, [highlighted]);

  const selectItem = (u: University) => {
    const name = u.nameEn || u.nameUz;
    setQuery(name);
    onChange({ id: u.id, name });
    setIsOpen(false);
    setResults([]);
  };

  const selectCustom = () => {
    const name = query.trim();
    setQuery(name);
    onChange({ id: null, name });
    setIsOpen(false);
    setResults([]);
  };

  const clear = () => {
    setQuery('');
    onChange({ id: null, name: '' });
    setResults([]);
    setIsOpen(false);
    setTouched(false);
    inputRef.current?.focus();
  };

  const isSelected = value.id !== null || (value.name !== '' && !touched);

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
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
            setQuery(e.target.value);
            setTouched(true);
            if (e.target.value === '') onChange({ id: null, name: '' });
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          aria-label={label || 'University or school'}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          className={
            inputClassName ??
            'w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all'
          }
        />

        {/* Right-side indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          )}
          {!isLoading && query && (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear university"
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          )}
          {!isLoading && !query && (
            <ChevronDownIcon
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          )}
        </div>
      </div>

      {/* Selected badge */}
      {isSelected && value.id !== null && (
        <p className="mt-1 text-[11px] text-blue-600 font-medium">✓ Matched from database</p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label="University suggestions"
          className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-72 overflow-y-auto"
        >
          {results.length === 0 && !isLoading && (
            <li className="px-4 py-3 text-sm text-slate-400 text-center select-none">
              No results for &ldquo;{query}&rdquo;
            </li>
          )}

          {results.map((u, i) => {
            const displayName = u.nameEn || u.nameUz;
            const isHighlighted = highlighted === i;
            return (
              <li
                key={u.id}
                role="option"
                aria-selected={isHighlighted}
                data-option
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectItem(u);
                }}
                onMouseEnter={() => setHighlighted(i)}
                className={`flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                  isHighlighted
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight truncate">
                    {displayName}
                  </p>
                  {u.nameEn && u.nameUz !== displayName && (
                    <p className="text-[11px] text-slate-400 truncate">{u.nameUz}</p>
                  )}
                  {u.region && <p className="text-[11px] text-slate-400">{u.region}</p>}
                </div>
              </li>
            );
          })}

          {/* Custom entry */}
          {query.trim().length >= 2 && (
            <li
              role="option"
              aria-selected={highlighted === results.length}
              data-option
              onMouseDown={(e) => {
                e.preventDefault();
                selectCustom();
              }}
              onMouseEnter={() => setHighlighted(results.length)}
              className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-t border-slate-100 dark:border-slate-700 transition-colors ${
                highlighted === results.length
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-blue-500 text-lg leading-none">+</span>
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Use &ldquo;<span className="font-semibold">{query.trim()}</span>&rdquo;
              </span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
