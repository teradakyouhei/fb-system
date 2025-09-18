import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface FilterState {
  [key: string]: string | number | boolean;
}

interface UseFilterStateOptions {
  defaultFilters: FilterState;
  storageKey?: string;
  useUrlParams?: boolean;
  useLocalStorage?: boolean;
}

export function useFilterState({
  defaultFilters,
  storageKey,
  useUrlParams = true,
  useLocalStorage = true,
}: UseFilterStateOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // フィルター状態の初期化
  const [filters, setFilters] = useState<FilterState>(() => {
    let initialFilters = { ...defaultFilters };

    // URLパラメータから復元
    if (useUrlParams && searchParams) {
      const urlFilters: FilterState = {};
      searchParams.forEach((value, key) => {
        if (key in defaultFilters) {
          // デフォルト値の型に合わせて変換
          const defaultValue = defaultFilters[key];
          if (typeof defaultValue === 'boolean') {
            urlFilters[key] = value === 'true';
          } else if (typeof defaultValue === 'number') {
            const numValue = parseInt(value);
            if (!isNaN(numValue)) {
              urlFilters[key] = numValue;
            }
          } else {
            urlFilters[key] = value;
          }
        }
      });
      initialFilters = { ...initialFilters, ...urlFilters };
    }

    // ローカルストレージから復元（URLパラメータが優先）
    if (useLocalStorage && storageKey && typeof window !== 'undefined') {
      try {
        const storedFilters = localStorage.getItem(storageKey);
        if (storedFilters) {
          const parsedFilters = JSON.parse(storedFilters);
          // URLパラメータで設定されていないもののみローカルストレージから復元
          Object.keys(parsedFilters).forEach(key => {
            if (key in defaultFilters && !(key in initialFilters)) {
              initialFilters[key] = parsedFilters[key];
            }
          });
        }
      } catch (error) {
        console.warn('Failed to load filters from localStorage:', error);
      }
    }

    return initialFilters;
  });

  // URLパラメータの更新
  const updateUrlParams = useCallback((newFilters: FilterState) => {
    if (!useUrlParams) return;

    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      // デフォルト値と異なる場合のみURLに追加
      if (value !== defaultFilters[key] && value !== '' && value !== null && value !== undefined) {
        params.set(key, String(value));
      }
    });

    const paramsString = params.toString();
    const newUrl = paramsString ? `${pathname}?${paramsString}` : pathname;
    
    // 現在のURLと異なる場合のみ更新
    const currentParams = searchParams?.toString();
    if (paramsString !== currentParams) {
      router.replace(newUrl, { scroll: false });
    }
  }, [useUrlParams, defaultFilters, pathname, searchParams, router]);

  // ローカルストレージの更新
  const updateLocalStorage = useCallback((newFilters: FilterState) => {
    if (!useLocalStorage || !storageKey || typeof window === 'undefined') return;

    try {
      // デフォルト値と異なるもののみ保存
      const filtersToStore: FilterState = {};
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== defaultFilters[key]) {
          filtersToStore[key] = value;
        }
      });

      if (Object.keys(filtersToStore).length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(filtersToStore));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.warn('Failed to save filters to localStorage:', error);
    }
  }, [useLocalStorage, storageKey, defaultFilters]);

  // フィルターの更新
  const updateFilter = useCallback((key: string, value: string | number | boolean) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters, [key]: value };
      updateUrlParams(newFilters);
      updateLocalStorage(newFilters);
      return newFilters;
    });
  }, [updateUrlParams, updateLocalStorage]);

  // 複数フィルターの一括更新
  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters, ...newFilters };
      updateUrlParams(updatedFilters);
      updateLocalStorage(updatedFilters);
      return updatedFilters;
    });
  }, [updateUrlParams, updateLocalStorage]);

  // フィルターのクリア
  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    updateUrlParams(defaultFilters);
    updateLocalStorage(defaultFilters);
  }, [defaultFilters, updateUrlParams, updateLocalStorage]);

  // 特定のフィルターをクリア
  const clearFilter = useCallback((key: string) => {
    const defaultValue = defaultFilters[key];
    updateFilter(key, defaultValue);
  }, [defaultFilters, updateFilter]);

  // アクティブなフィルター数を計算
  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => value !== defaultFilters[key] && value !== '' && value !== null && value !== undefined
  ).length;

  // アクティブなフィルターのリストを取得
  const activeFilters = Object.entries(filters)
    .filter(([key, value]) => value !== defaultFilters[key] && value !== '' && value !== null && value !== undefined)
    .map(([key, value]) => ({ key, value }));

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    clearFilter,
    activeFiltersCount,
    activeFilters,
  };
}