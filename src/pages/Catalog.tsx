import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigationType, useLocation, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Loader2, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ProductCard } from '@/components/ProductCard';
import { useProducts, useCategories, useProductFilterOptions, ProductFilters } from '@/hooks/useProducts';
import { useLanguage } from '@/hooks/useLanguage';
import { useSEO } from '@/hooks/useSEO';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useAuth } from '@/hooks/useAuth';
import { CatalogFilterSidebar, SidebarFilters } from '@/components/CatalogFilterSidebar';
import {
  clearCatalogRestoreRequest,
  getCatalogProductSelector,
  getCatalogScrollKey,
  hasCatalogRestoreRequest,
  persistCatalogReturnState,
  readCatalogReturnState,
} from '@/lib/catalogReturn';

const PAGE_SIZE = 24;

const pageAffectingFilterKeys: (keyof SidebarFilters)[] = [
  'categoryId',
  'materials',
  'colors',
  'furLengths',
  'applications',
  'inStock',
  'discounted',
];

const areArraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((item, index) => item === b[index]);

const didPageAffectingFiltersChange = (current: SidebarFilters, next: SidebarFilters) =>
  pageAffectingFilterKeys.some(key => {
    const currentValue = current[key];
    const nextValue = next[key];
    if (Array.isArray(currentValue) && Array.isArray(nextValue)) {
      return !areArraysEqual(currentValue, nextValue);
    }
    return currentValue !== nextValue;
  });

export default function Catalog() {
  const { language, t } = useLanguage();
  const { settings } = useSystemSettings();
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigationType = useNavigationType();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const initialCategoryParam = searchParams.get('category') || 'all';
  const pageParam = Number.parseInt(searchParams.get('page') || '1', 10);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  // Derive currentPage directly from URL — single source of truth, no race conditions
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  // When user navigates to a different category via footer/header links
  // (same /catalog route, only ?category= changes), reset scroll to top.
  // Skip on POP (back/forward) — we restore the saved scroll position below.
  useEffect(() => {
    if (navigationType === 'POP') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [initialCategoryParam, navigationType]);

  const { options: filterOptions } = useProductFilterOptions();
  const { categories } = useCategories();

  // Resolve slug to category ID for filtering - only return UUID or 'all'
  const resolvedCategoryId = useMemo(() => {
    if (initialCategoryParam === 'all') return 'all';
    if (categories.length === 0) return null; // categories still loading
    const found = categories.find(c => c.slug === initialCategoryParam || c.id === initialCategoryParam);
    return found ? found.id : 'all';
  }, [initialCategoryParam, categories]);

  // True while we know the URL has a category slug but categories haven't loaded yet
  const isResolvingCategory = initialCategoryParam !== 'all' && resolvedCategoryId === null;

  const [sidebarFilters, setSidebarFilters] = useState<SidebarFilters>({
    categoryId: 'all',
    priceMin: 1,
    priceMax: filterOptions.maxPrice,
    materials: [],
    colors: [],
    furLengths: [],
    applications: [],
    inStock: false,
    discounted: false,
  });

  // Update category filter when slug is resolved to a valid UUID
  useEffect(() => {
    if (resolvedCategoryId !== null && resolvedCategoryId !== sidebarFilters.categoryId) {
      setSidebarFilters(prev => ({ ...prev, categoryId: resolvedCategoryId }));
    }
  }, [resolvedCategoryId, sidebarFilters.categoryId]);

  // Sync priceMax with dynamic maxPrice once it loads (only first time, before user customizes)
  const priceMaxSynced = useRef(false);
  useEffect(() => {
    if (!priceMaxSynced.current && filterOptions.maxPrice > 1) {
      priceMaxSynced.current = true;
      setSidebarFilters(prev => ({ ...prev, priceMax: filterOptions.maxPrice }));
    }
  }, [filterOptions.maxPrice]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(prev => {
        if (prev !== search) {
          // Reset to page 1 when search query actually changes
          const params = new URLSearchParams(searchParams);
          params.delete('page');
          setSearchParams(params, { replace: true });
          return search;
        }
        return prev;
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, searchParams, setSearchParams]);

  // Map sidebar filters to DB query filters
  const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
  
  const filters: ProductFilters = useMemo(() => {
    const f: ProductFilters = { isActive: true };

    if (debouncedSearch) f.search = debouncedSearch;
    // Use URL-resolved category as source of truth so products match URL immediately
    const effectiveCategoryId = resolvedCategoryId ?? sidebarFilters.categoryId;
    if (effectiveCategoryId !== 'all' && isUUID(effectiveCategoryId)) {
      f.categoryId = effectiveCategoryId;
    }
    // Price filter removed from UI — do not apply
    if (sidebarFilters.materials.length > 0) f.materials = sidebarFilters.materials;
    if (sidebarFilters.colors.length > 0) f.colors = sidebarFilters.colors;
    if (sidebarFilters.furLengths.length > 0) f.furLengths = sidebarFilters.furLengths;
    if (sidebarFilters.applications.length > 0) f.applications = sidebarFilters.applications;
    if (sidebarFilters.inStock) f.inStock = true;
    if (sidebarFilters.discounted) f.discounted = true;

    return f;
  }, [debouncedSearch, sidebarFilters, resolvedCategoryId]);

  const { products, totalCount, totalPages, loading: productsLoading } = useProducts(currentPage, filters, PAGE_SIZE);
  const loading = productsLoading || isResolvingCategory;

  // Persist scroll position per URL so back-navigation lands exactly where the user was.
  const scrollKey = getCatalogScrollKey(searchParams);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    let raf = 0;
    const save = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        sessionStorage.setItem(scrollKey, String(window.scrollY));
      });
    };
    window.addEventListener('scroll', save, { passive: true });
    return () => {
      window.removeEventListener('scroll', save);
      cancelAnimationFrame(raf);
    };
  }, [scrollKey]);

  const rememberCatalogPosition = useCallback((productId: string) => {
    const element = document.querySelector(getCatalogProductSelector(productId));
    const productTop = element?.getBoundingClientRect().top ?? null;
    persistCatalogReturnState({ productId, scrollY: window.scrollY, productTop, search: searchParams.toString() });
    sessionStorage.setItem(scrollKey, String(window.scrollY));
  }, [searchParams, scrollKey]);

  // Restore scroll once products have rendered, only for back/forward navigation
  // or when explicitly requested via location.state.restoreCatalogScroll.
  // We lock restoration to the first eligible run after a navigation event so
  // subsequent filter / page changes don't re-trigger an old scroll position.
  const restoredRef = useRef(false);
  const lastNavSignatureRef = useRef<string>('');
  useEffect(() => {
    const locationState = location.state as { restoreCatalogScroll?: boolean; catalogProductId?: string; catalogScrollY?: number; catalogProductTop?: number | null; catalogSearchSignature?: string } | null;
    const stateFlag = Boolean(locationState?.restoreCatalogScroll);
    const navSignature = `${navigationType}:${location.key}`;
    // Reset the lock whenever a fresh navigation arrives (POP back/forward, or new push with flag).
    if (lastNavSignatureRef.current !== navSignature) {
      lastNavSignatureRef.current = navSignature;
      restoredRef.current = false;
    }
    const shouldRestore = navigationType === 'POP' || stateFlag || hasCatalogRestoreRequest(searchParams);
    if (!shouldRestore) return;
    if (loading) return;
    if (restoredRef.current) return;

    const returnState = readCatalogReturnState(searchParams, locationState);
    const performScroll = () => {
      if (returnState) {
        const selector = returnState.productId ? getCatalogProductSelector(returnState.productId) : '';
        const element = selector ? document.querySelector(selector) : null;
        if (element && typeof returnState.productTop === 'number') {
          const nextTop = window.scrollY + element.getBoundingClientRect().top - returnState.productTop;
          window.scrollTo({ top: Math.max(0, nextTop), left: 0, behavior: 'instant' as ScrollBehavior });
          return;
        }
        if (typeof returnState.scrollY === 'number') {
          window.scrollTo({ top: returnState.scrollY, left: 0, behavior: 'instant' as ScrollBehavior });
          return;
        }
        if (element) {
          element.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
          return;
        }
      }
      const saved = sessionStorage.getItem(scrollKey);
      if (saved) {
        const y = parseInt(saved, 10);
        if (Number.isFinite(y)) {
          window.scrollTo({ top: y, left: 0, behavior: 'instant' as ScrollBehavior });
        }
      }
    };
    // Two RAFs to ensure layout is fully painted (images may shift content).
    requestAnimationFrame(() => requestAnimationFrame(performScroll));
    restoredRef.current = true;

    // Clear the one-shot flag so subsequent filter/page edits don't re-restore.
    if (stateFlag) {
      window.history.replaceState({ ...(window.history.state || {}), usr: null }, '');
    }
    clearCatalogRestoreRequest();
  }, [loading, location.state, location.key, navigationType, searchParams, scrollKey]);

  const selectedCategory = categories?.find(c => c.slug === sidebarFilters.categoryId || c.id === sidebarFilters.categoryId);
  const categoryName = selectedCategory
    ? (language === 'uz' ? selectedCategory.name_uz : selectedCategory.name_ru)
    : null;

  useSEO({
    title: categoryName || t.catalog.title,
    description: selectedCategory
      ? (language === 'uz' ? selectedCategory.meta_description_uz : selectedCategory.meta_description_ru) || categoryName || undefined
      : undefined,
    keywords: selectedCategory?.meta_keywords || undefined,
    canonical: currentPage > 1 ? '/catalog' : undefined,
  });

  useEffect(() => {
    // Wait until slug→UUID resolution finishes.
    if (resolvedCategoryId === null) return;
    // Avoid race conditions: only write URL when sidebarFilters.categoryId is
    // already in sync with the URL-derived resolvedCategoryId. Otherwise we'd
    // overwrite the freshly-changed URL with the stale category.
    if (sidebarFilters.categoryId !== resolvedCategoryId) return;

    const params = new URLSearchParams();
    if (sidebarFilters.categoryId !== 'all') {
      const cat = categories.find(c => c.id === sidebarFilters.categoryId);
      params.set('category', cat?.slug || sidebarFilters.categoryId);
    }
    if (sidebarFilters.priceMin > 1) params.set('min_price', sidebarFilters.priceMin.toString());
    if (sidebarFilters.priceMax < filterOptions.maxPrice) params.set('max_price', sidebarFilters.priceMax.toString());
    if (sidebarFilters.materials.length > 0) params.set('material', sidebarFilters.materials.join(','));
    if (sidebarFilters.colors.length > 0) params.set('color', sidebarFilters.colors.join(','));
    if (sidebarFilters.furLengths.length > 0) params.set('fur_length', sidebarFilters.furLengths.join(','));
    if (sidebarFilters.applications.length > 0) params.set('application', sidebarFilters.applications.join(','));
    if (sidebarFilters.inStock) params.set('in_stock', '1');
    if (sidebarFilters.discounted) params.set('discount', '1');
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [sidebarFilters, filterOptions.maxPrice, resolvedCategoryId, categories, currentPage, searchParams, setSearchParams]);

  const handleApplyFilters = useCallback((newFilters: SidebarFilters) => {
    // If user changed the category via the dropdown, push it into the URL
    // immediately so the URL stays the source of truth.
    const filtersChanged = didPageAffectingFiltersChange(sidebarFilters, newFilters);

    if (newFilters.categoryId !== sidebarFilters.categoryId) {
      const params = new URLSearchParams(searchParams);
      if (newFilters.categoryId === 'all') {
        params.delete('category');
      } else {
        const cat = categories.find(c => c.id === newFilters.categoryId);
        params.set('category', cat?.slug || newFilters.categoryId);
      }
      params.delete('page');
      setSearchParams(params, { replace: true });
    } else if (filtersChanged && currentPage > 1) {
      // Reset to page 1 when filters change
      const params = new URLSearchParams(searchParams);
      params.delete('page');
      setSearchParams(params, { replace: true });
    }
    setSidebarFilters(newFilters);
  }, [sidebarFilters, categories, searchParams, setSearchParams, currentPage]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }
    setSearchParams(params, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPaginationNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div id="hero" className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
              className="gap-2 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" /> Ortga
            </Button>
            <h1 className="font-serif text-3xl md:text-4xl font-bold">{t.catalog.title}</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={t.catalog.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden gap-2 rounded-xl">
                  <SlidersHorizontal className="w-4 h-4" /> {t.catalog.filters}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>{t.catalog.filters}</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <CatalogFilterSidebar
                    categories={categories}
                    onApply={handleApplyFilters}
                    initialFilters={{ categoryId: sidebarFilters.categoryId }}
                    dynamicOptions={filterOptions}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 bg-card p-6 rounded-2xl shadow-warm border border-border/50 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <CatalogFilterSidebar
                categories={categories}
                onApply={handleApplyFilters}
                initialFilters={{ categoryId: sidebarFilters.categoryId }}
                dynamicOptions={filterOptions}
              />
            </div>
          </aside>

          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-4">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {language === 'uz' ? 'Yuklanmoqda...' : 'Загрузка...'}
                </span>
              ) : (
                <>
                  {t.catalog.showing} {products.length} {t.catalog.of} {totalCount} {t.catalog.products}
                </>
              )}
            </p>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-warm animate-pulse">
                    <div className="aspect-[4/3] bg-muted" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpen={() => rememberCatalogPosition(product.id)}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {getPaginationNumbers().map((page, idx) =>
                      page === 'ellipsis' ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                      ) : (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      )
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">{t.catalog.noProducts}</p>
                <Button
                  variant="link"
                  onClick={() => handleApplyFilters({
                    categoryId: 'all', priceMin: 1, priceMax: filterOptions.maxPrice,
                    materials: [], colors: [], furLengths: [],
                    applications: [], inStock: false, discounted: false,
                  })}
                >
                  {t.catalog.clearFilters}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
