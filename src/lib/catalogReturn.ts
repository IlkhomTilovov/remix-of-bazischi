export const CATALOG_LAST_RETURN_KEY = 'catalog-return:last';
export const CATALOG_RESTORE_REQUEST_KEY = 'catalog-restore-request';

export interface CatalogReturnState {
  productId?: string;
  scrollY?: number;
  productTop?: number | null;
  search?: string;
  savedAt?: number;
}

export interface CatalogLocationState {
  restoreCatalogScroll?: boolean;
  catalogProductId?: string;
  catalogScrollY?: number;
  catalogProductTop?: number | null;
  catalogSearchSignature?: string;
}

export const normalizeCatalogSearch = (search: string | URLSearchParams) => {
  const params = new URLSearchParams(
    typeof search === 'string' ? search.replace(/^\?/, '') : search.toString()
  );
  const entries = Array.from(params.entries())
    .filter(([key]) => !key.startsWith('__lovable'))
    .sort(([keyA, valueA], [keyB, valueB]) => keyA.localeCompare(keyB) || valueA.localeCompare(valueB));

  return new URLSearchParams(entries).toString();
};

export const getCatalogReturnKey = (search: string | URLSearchParams) =>
  `catalog-return:${normalizeCatalogSearch(search)}`;

export const getCatalogScrollKey = (search: string | URLSearchParams) =>
  `catalog-scroll:${normalizeCatalogSearch(search)}`;

export const getCatalogProductSelector = (productId: string) => {
  const escaped = typeof CSS !== 'undefined' && CSS.escape
    ? CSS.escape(productId)
    : productId.replace(/["\\]/g, '\\$&');

  return `[data-catalog-product-id="${escaped}"]`;
};

const parseCatalogState = (value: string | null): CatalogReturnState | null => {
  if (!value) return null;

  try {
    return JSON.parse(value) as CatalogReturnState;
  } catch {
    return null;
  }
};

export const persistCatalogReturnState = (state: CatalogReturnState) => {
  if (typeof window === 'undefined') return;

  const normalizedState = {
    ...state,
    search: normalizeCatalogSearch(state.search || ''),
    savedAt: state.savedAt || Date.now(),
  };
  const value = JSON.stringify(normalizedState);

  sessionStorage.setItem(getCatalogReturnKey(normalizedState.search), value);
  sessionStorage.setItem(CATALOG_LAST_RETURN_KEY, value);
};

export const readCatalogReturnState = (
  search: string | URLSearchParams,
  locationState?: CatalogLocationState | null
): CatalogReturnState | null => {
  if (typeof window === 'undefined') return null;

  const currentSearch = normalizeCatalogSearch(search);
  const exact = parseCatalogState(sessionStorage.getItem(getCatalogReturnKey(currentSearch)));
  if (exact) return exact;

  if (locationState?.catalogProductId) {
    return {
      productId: locationState.catalogProductId,
      scrollY: locationState.catalogScrollY,
      productTop: locationState.catalogProductTop,
      search: locationState.catalogSearchSignature || currentSearch,
    };
  }

  const latest = parseCatalogState(sessionStorage.getItem(CATALOG_LAST_RETURN_KEY));
  if (latest && normalizeCatalogSearch(latest.search || '') === currentSearch) {
    return latest;
  }

  return null;
};

export const requestCatalogRestore = (search?: string | URLSearchParams) => {
  if (typeof window === 'undefined') return;

  sessionStorage.setItem(
    CATALOG_RESTORE_REQUEST_KEY,
    JSON.stringify({ search: search ? normalizeCatalogSearch(search) : undefined })
  );
};

export const hasCatalogRestoreRequest = (search: string | URLSearchParams) => {
  if (typeof window === 'undefined') return false;

  const raw = sessionStorage.getItem(CATALOG_RESTORE_REQUEST_KEY);
  if (!raw) return false;
  if (raw === '1') return true;

  const parsed = parseCatalogState(raw);
  return !parsed?.search || normalizeCatalogSearch(parsed.search) === normalizeCatalogSearch(search);
};

export const clearCatalogRestoreRequest = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(CATALOG_RESTORE_REQUEST_KEY);
};