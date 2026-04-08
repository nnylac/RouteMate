import { ArrowDataTransferVerticalIcon, Location01Icon, Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchPanelProps {
  from?: string;
  to?: string;
  initialFrom?: string;
  initialTo?: string;
  recentSearches?: string[];
}

type ActiveField = 'from' | 'to' | null;

export function SearchPanel({
  from,
  to,
  initialFrom = '',
  initialTo = '',
  recentSearches = [],
}: SearchPanelProps) {
  const navigate = useNavigate();
  const [fromValue, setFromValue] = useState(from ?? initialFrom);
  const [toValue, setToValue] = useState(to ?? initialTo);
  const [activeField, setActiveField] = useState<ActiveField>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const fromInputRef = useRef<HTMLInputElement | null>(null);
  const toInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setActiveField(null);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    setFromValue(from ?? initialFrom);
  }, [from, initialFrom]);

  useEffect(() => {
    setToValue(to ?? initialTo);
  }, [to, initialTo]);

  useEffect(() => {
    if (activeField === 'from') {
      fromInputRef.current?.focus();
    }

    if (activeField === 'to') {
      toInputRef.current?.focus();
    }
  }, [activeField]);

  const suggestions = useMemo(() => {
    const query = (activeField === 'from' ? fromValue : toValue).trim().toLowerCase();

    if (!query) {
      return recentSearches;
    }

    return recentSearches.filter((search) => search.toLowerCase().includes(query));
  }, [activeField, fromValue, recentSearches, toValue]);

  function handleSwap() {
    setFromValue(toValue);
    setToValue(fromValue);
  }

  function activateField(field: Exclude<ActiveField, null>) {
    setActiveField(field);

    if (field === 'from') {
      fromInputRef.current?.focus();
      return;
    }

    toInputRef.current?.focus();
  }

  function handleSuggestionClick(value: string) {
    if (activeField === 'to') {
      setToValue(value);
    } else {
      setFromValue(value);
    }

    setActiveField(null);
  }

  function handleSearch() {
    const origin = fromValue.trim();
    const destination = toValue.trim();

    if (!origin || !destination) {
      return;
    }

    navigate({
      pathname: '/routes',
      search: `?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`,
    });
  }

  return (
    <div className="search-panel-stack" ref={panelRef}>
      <section className="glass-card search-panel">
        <div className="search-panel__fields">
          <div
            className={`search-panel__row search-panel__row--button ${
              activeField === 'from' || fromValue ? 'search-panel__row--active' : ''
            }`}
            onMouseDown={(event) => {
              event.preventDefault();
              activateField('from');
            }}
          >
            <span className="search-panel__icon search-panel__icon--origin" aria-hidden="true" />
            <div className="search-panel__field">
              <span className="search-panel__label">Leaving from</span>
              <input
                ref={fromInputRef}
                className="search-panel__input"
                value={fromValue}
                onChange={(event) => setFromValue(event.target.value)}
                onFocus={() => setActiveField('from')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSearch();
                  }
                }}
                placeholder="Choose your starting point"
              />
            </div>
          </div>

          <div className="search-panel__divider-row" aria-hidden="true">
            <div className="search-panel__divider" />
            <button type="button" className="swap-button" onClick={handleSwap} aria-label="Swap locations">
              <HugeiconsIcon icon={ArrowDataTransferVerticalIcon} size={24} strokeWidth={1.8} />
            </button>
            <div className="search-panel__divider" />
          </div>

          <div
            className={`search-panel__row search-panel__row--button ${
              activeField === 'to' || toValue ? 'search-panel__row--active' : ''
            }`}
            onMouseDown={(event) => {
              event.preventDefault();
              activateField('to');
            }}
          >
            <span className="search-panel__icon search-panel__icon--destination" aria-hidden="true">
              <HugeiconsIcon icon={Location01Icon} size={32} strokeWidth={1.7} />
            </span>
            <div className="search-panel__field">
              <span className="search-panel__label">Going to</span>
              <input
                ref={toInputRef}
                className="search-panel__input"
                value={toValue}
                onChange={(event) => setToValue(event.target.value)}
                onFocus={() => setActiveField('to')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSearch();
                  }
                }}
                placeholder="Choose your destination"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          className="primary-button search-panel__button"
          onClick={handleSearch}
        >
          <span className="search-panel__button-content">
            <HugeiconsIcon icon={Search01Icon} size={20} strokeWidth={1.8} />
            <span>Search</span>
          </span>
        </button>
      </section>

      {activeField && suggestions.length > 0 ? (
        <section className="glass-card search-suggestions">
          <div className="search-suggestions__title">Recent</div>
          <div className="search-suggestions__list">
            {suggestions.map((search) => (
              <button
                key={`${activeField}-${search}`}
                type="button"
                className="search-suggestions__item"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSuggestionClick(search)}
              >
                <span className="search-suggestions__icon" aria-hidden="true">
                  {'o'}
                </span>
                <span>{search}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
