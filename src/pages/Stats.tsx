import { useEffect, useMemo, useState } from 'react';
import { Activity, Eye, Users, ShoppingCart, Calendar, TrendingUp, Smartphone, Globe2, Instagram, Send, Facebook, Search, Youtube, MessageCircle, Link2, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

type DayPoint = { date: string; label: string; visits: number };
type TopPage = { path: string; count: number; title: string };
type SourceItem = { source: string; count: number };
type CallItem = { key: string; region: string; district: string; workshop: string; phone: string; count: number };

const SOURCE_META: Record<string, { label_uz: string; label_ru: string; icon: any; color: string }> = {
  direct: { label_uz: "To'g'ridan-to'g'ri", label_ru: 'Прямые заходы', icon: Link2, color: 'text-slate-500' },
  instagram: { label_uz: 'Instagram', label_ru: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  telegram: { label_uz: 'Telegram', label_ru: 'Telegram', icon: Send, color: 'text-sky-500' },
  facebook: { label_uz: 'Facebook', label_ru: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  tiktok: { label_uz: 'TikTok', label_ru: 'TikTok', icon: Activity, color: 'text-fuchsia-500' },
  youtube: { label_uz: 'YouTube', label_ru: 'YouTube', icon: Youtube, color: 'text-red-500' },
  twitter: { label_uz: 'Twitter / X', label_ru: 'Twitter / X', icon: Globe2, color: 'text-slate-700' },
  google: { label_uz: 'Google qidiruv', label_ru: 'Поиск Google', icon: Search, color: 'text-emerald-500' },
  bing: { label_uz: 'Bing', label_ru: 'Bing', icon: Search, color: 'text-emerald-500' },
  yandex: { label_uz: 'Yandex', label_ru: 'Yandex', icon: Search, color: 'text-yellow-500' },
  duckduckgo: { label_uz: 'DuckDuckGo', label_ru: 'DuckDuckGo', icon: Search, color: 'text-emerald-500' },
  whatsapp: { label_uz: 'WhatsApp', label_ru: 'WhatsApp', icon: MessageCircle, color: 'text-green-500' },
  linkedin: { label_uz: 'LinkedIn', label_ru: 'LinkedIn', icon: Globe2, color: 'text-blue-700' },
  pinterest: { label_uz: 'Pinterest', label_ru: 'Pinterest', icon: Globe2, color: 'text-red-600' },
  reddit: { label_uz: 'Reddit', label_ru: 'Reddit', icon: Globe2, color: 'text-orange-500' },
  other: { label_uz: 'Boshqa saytlar', label_ru: 'Другие сайты', icon: Globe2, color: 'text-muted-foreground' },
};

function sourceLabel(source: string, lang: 'uz' | 'ru'): { label: string; Icon: any; color: string } {
  const meta = SOURCE_META[source] || SOURCE_META.other;
  return { label: lang === 'ru' ? meta.label_ru : meta.label_uz, Icon: meta.icon, color: meta.color };
}

const PAGE_TITLES_UZ: Record<string, string> = {
  '/': 'Bosh sahifa',
  '/catalog': 'Katalog',
  '/about': 'Biz haqimizda',
  '/contact': 'Aloqa',
  '/faq': 'Savol-javoblar',
  '/cart': 'Savatcha',
  '/checkout': 'Buyurtma berish',
  '/thank-you': 'Rahmat sahifasi',
  '/stats': 'Sayt statistikasi',
};
const PAGE_TITLES_RU: Record<string, string> = {
  '/': 'Главная',
  '/catalog': 'Каталог',
  '/about': 'О нас',
  '/contact': 'Контакты',
  '/faq': 'Вопросы и ответы',
  '/cart': 'Корзина',
  '/checkout': 'Оформление заказа',
  '/thank-you': 'Спасибо',
  '/stats': 'Статистика сайта',
};

function titleForPath(path: string, lang: 'uz' | 'ru'): string {
  const dict = lang === 'ru' ? PAGE_TITLES_RU : PAGE_TITLES_UZ;
  if (dict[path]) return dict[path];
  if (path.startsWith('/product/')) {
    const slug = path.replace('/product/', '');
    return `${lang === 'ru' ? 'Товар' : 'Mahsulot'}: ${slug}`;
  }
  if (path.startsWith('/catalog')) return dict['/catalog'];
  return path;
}

export default function Stats() {
  const { language } = useLanguage();
  const { settings } = useSystemSettings();
  const t = (uz: string, ru: string) => (language === 'ru' ? ru : uz);
  const lang = language === 'ru' ? 'ru' : 'uz';
  const brand = 'Tanirovka.uz';

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [todayVisits, setTodayVisits] = useState(0);
  const [onlineNow, setOnlineNow] = useState(0);
  const [productViews, setProductViews] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [uniqueDevices, setUniqueDevices] = useState(0);
  const [weekData, setWeekData] = useState<DayPoint[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [calls, setCalls] = useState<CallItem[]>([]);
  const [callsTotal, setCallsTotal] = useState(0);

  useEffect(() => {
    document.title = t('Sayt statistikasi', 'Статистика сайта');
  }, [language]);

  // Jonli "Hozir onlayn" — Realtime Presence
  useEffect(() => {
    const channel = supabase.channel('online-users', {
      config: { presence: { key: `stats_${Math.random().toString(36).slice(2, 10)}` } },
    });
    const update = () => {
      const state = channel.presenceState();
      setOnlineNow(Object.keys(state).length);
    };
    channel
      .on('presence', { event: 'sync' }, update)
      .on('presence', { event: 'join' }, update)
      .on('presence', { event: 'leave' }, update)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') update();
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  useEffect(() => {
    let cancelled = false;

    // Bitta so'rovni xatolikda 1 marta qayta urinish bilan bajaradi
    async function runWithRetry<T>(fn: () => Promise<T>): Promise<T> {
      try {
        return await fn();
      } catch {
        await new Promise((r) => setTimeout(r, 400));
        return await fn();
      }
    }

    async function load() {
      setLoading(true);
      setLoadError(false);
      const now = new Date();
      const startToday = new Date(now);
      startToday.setHours(0, 0, 0, 0);
      const start7 = new Date(now);
      start7.setDate(start7.getDate() - 6);
      start7.setHours(0, 0, 0, 0);
      const start30 = new Date(now);
      start30.setDate(start30.getDate() - 29);
      start30.setHours(0, 0, 0, 0);
      const start5min = new Date(now.getTime() - 5 * 60 * 1000);

      try {
        // 1-batch: oddiy count va onlayn
        const [totalRes, todayRes, onlineRes, productRes, ordersRes] = await runWithRetry(() =>
          Promise.all([
            supabase.from('page_visits').select('id', { count: 'exact', head: true }),
            supabase
              .from('page_visits')
              .select('id', { count: 'exact', head: true })
              .gte('created_at', startToday.toISOString()),
            supabase
              .from('page_visits')
              .select('session_id')
              .gte('created_at', start5min.toISOString()),
            supabase
              .from('page_visits')
              .select('id', { count: 'exact', head: true })
              .like('path', '/product/%'),
            supabase.from('orders').select('id', { count: 'exact', head: true }),
          ]),
        );
        if (cancelled) return;

        setTotalVisits(totalRes.count ?? 0);
        setTodayVisits(todayRes.count ?? 0);
        const distinctSessions = new Set(
          (onlineRes.data ?? []).map((r: any) => r.session_id),
        );
        setOnlineNow(distinctSessions.size);
        setProductViews(productRes.count ?? 0);
        setOrdersCount(ordersRes.count ?? 0);

        // 2-batch: 7-kun grafigi va eng mashhur sahifalar
        const [weekRes, topRes] = await runWithRetry(() =>
          Promise.all([
            supabase
              .from('page_visits')
              .select('created_at')
              .gte('created_at', start7.toISOString())
              .order('created_at', { ascending: true }),
            supabase
              .from('page_visits')
              .select('path')
              .gte('created_at', start30.toISOString()),
          ]),
        );
        if (cancelled) return;

        const buckets: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          buckets[key] = 0;
        }
        (weekRes.data ?? []).forEach((row: any) => {
          const key = String(row.created_at).slice(0, 10);
          if (key in buckets) buckets[key]++;
        });
        setWeekData(
          Object.entries(buckets).map(([date, visits]) => ({
            date,
            label: date.slice(5),
            visits,
          })),
        );

        const pageCounts: Record<string, number> = {};
        (topRes.data ?? []).forEach((row: any) => {
          pageCounts[row.path] = (pageCounts[row.path] ?? 0) + 1;
        });
        const sorted = Object.entries(pageCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([path, count]) => ({
            path,
            count,
            title: titleForPath(path, lang),
          }));
        setTopPages(sorted);

        // 3-batch: unikal qurilmalar va trafik manbalari
        const [devicesRes, sourcesRes] = await runWithRetry(() =>
          Promise.all([
            supabase
              .from('page_visits')
              .select('device_id')
              .not('device_id', 'is', null),
            supabase
              .from('page_visits')
              .select('referrer_source, device_id, session_id')
              .gte('created_at', start30.toISOString()),
          ]),
        );
        if (cancelled) return;

        const distinctDevices = new Set(
          (devicesRes.data ?? []).map((r: any) => r.device_id).filter(Boolean),
        );
        setUniqueDevices(distinctDevices.size);

        const knownSources = new Set([
          'direct', 'google', 'instagram', 'facebook', 'telegram',
          'whatsapp', 'youtube', 'tiktok', 'twitter', 'linkedin',
          'yandex', 'bing', 'duckduckgo',
        ]);
        const srcDevices: Record<string, Set<string>> = {};
        (sourcesRes.data ?? []).forEach((row: any) => {
          const raw = (row.referrer_source as string) || 'direct';
          const key = knownSources.has(raw) ? raw : 'other';
          const uniqueKey = row.device_id || row.session_id;
          if (!uniqueKey) return;
          if (!srcDevices[key]) srcDevices[key] = new Set();
          srcDevices[key].add(uniqueKey);
        });
        const sourcesSorted = Object.entries(srcDevices)
          .map(([source, set]) => ({ source, count: set.size }))
          .sort((a, b) => b.count - a.count);
        setSources(sourcesSorted);

        // 4-batch: ustaxonalarga qo'ng'iroqlar (xavfsiz: faqat jamlangan sonlar, shaxsiy ma'lumotsiz)
        const callsRes = await runWithRetry(async () =>
          (supabase as any).rpc('get_workshop_call_counts'),
        );
        if (cancelled) return;

        const callsSorted: CallItem[] = (callsRes.data ?? []).map((row: any) => ({
          key: row.workshop_id || `${row.region_name}|${row.district_name}|${row.workshop_name}`,
          region: row.region_name || '—',
          district: row.district_name || '—',
          workshop: row.workshop_name || '—',
          phone: '',
          count: Number(row.call_count) || 0,
        }));
        callsSorted.sort((a, b) => b.count - a.count);
        setCalls(callsSorted);
        setCallsTotal(callsSorted.reduce((s, c) => s + c.count, 0));
      } catch (err) {
        console.error('[Stats] load error:', err);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [language, reloadKey]);


  const cards = useMemo(
    () => [
      {
        label: t('Hozir onlayn', 'Сейчас онлайн'),
        value: onlineNow,
        icon: Activity,
        sub: t("Hozirgi vaqtda", 'Прямо сейчас'),
        accent: 'text-emerald-500',
      },
      {
        label: t('Unikal qurilmalar', 'Уникальные устройства'),
        value: uniqueDevices,
        icon: Smartphone,
        sub: t("Har xil qurilmalar soni", 'Количество разных устройств'),
        accent: 'text-blue-500',
      },
      {
        label: t('Bugungi tashriflar', 'Посетители сегодня'),
        value: todayVisits,
        icon: Eye,
        sub: null,
        accent: 'text-primary',
      },
      {
        label: t('Jami tashriflar', 'Всего посетителей'),
        value: totalVisits,
        icon: Users,
        sub: null,
        accent: 'text-primary',
      },
      {
        label: t("Mahsulot ko'rishlar", 'Просмотры товаров'),
        value: productViews,
        icon: Calendar,
        sub: null,
        accent: 'text-primary',
      },
      {
        label: t('Buyurtmalar', 'Заказы'),
        value: ordersCount,
        icon: ShoppingCart,
        sub: null,
        accent: 'text-primary',
      },
    ],
    [onlineNow, uniqueDevices, todayVisits, totalVisits, productViews, ordersCount, language],
  );

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 md:py-16">
      <div className="max-w-6xl mx-auto">
        {/* Sarlavha */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-3">
            {t('Sayt statistikasi', 'Статистика сайта')}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
            {t(
              `${brand} saytidagi tashriflar va faollik haqida ochiq ma'lumotlar. Hech qanday shaxsiy ma'lumot saqlanmaydi.`,
              `Открытые данные о посетителях и активности на сайте ${brand}. Никакие персональные данные не сохраняются.`,
            )}
          </p>
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card hover:bg-accent px-4 py-2 text-sm font-medium text-foreground transition-colors disabled:opacity-60"
            >
              <Activity className={`w-4 h-4 ${loading ? 'animate-pulse text-primary' : 'text-muted-foreground'}`} />
              {loading ? t('Yuklanmoqda…', 'Загрузка…') : t('Yangilash', 'Обновить')}
            </button>
          </div>
          {loadError && !loading && (
            <div className="mt-4 mx-auto max-w-xl rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {t(
                "Ma'lumotlarni yuklab bo'lmadi. Internet aloqasini tekshirib, yuqoridagi “Yangilash” tugmasini bosing.",
                'Не удалось загрузить данные. Проверьте интернет и нажмите «Обновить» выше.',
              )}
            </div>
          )}
        </div>


        {/* Kartochkalar */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-8">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className="rounded-xl border border-border bg-card p-4 md:p-5 hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex items-start justify-between gap-2 mb-3 min-h-[2.5rem]">
                  <p className="text-xs md:text-sm text-muted-foreground leading-tight line-clamp-2">
                    {c.label}
                  </p>
                  <Icon className={`w-4 h-4 ${c.accent} flex-shrink-0`} />
                </div>
                <div className="min-h-[2.25rem] md:min-h-[2.5rem] flex items-center">
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">
                      {c.value.toLocaleString(lang === 'ru' ? 'ru-RU' : 'uz-UZ')}
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 min-h-[1rem]">
                  {c.sub || '\u00A0'}
                </p>
              </div>
            );
          })}
        </div>

        {/* Grafik */}
        <div className="rounded-xl border border-border bg-card p-5 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-base md:text-lg text-foreground">
              {t("So'nggi 7 kun tashriflari", 'Посетители за последние 7 дней')}
            </h2>
          </div>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-64 md:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weekData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="label"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    allowDecimals={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="visits"
                    name={t('Tashriflar', 'Посещения')}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Eng mashhur sahifalar */}
        <div className="rounded-xl border border-border bg-card p-5 md:p-6">
          <h2 className="font-semibold text-base md:text-lg text-foreground mb-5">
            {t("Eng mashhur sahifalar (30 kun)", 'Самые популярные страницы (30 дней)')}
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : topPages.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {t("Hozircha ma'lumot yo'q", 'Пока нет данных')}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {topPages.map((p) => (
                <li
                  key={p.path}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {p.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {p.path}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary tabular-nums flex-shrink-0">
                    {p.count.toLocaleString(lang === 'ru' ? 'ru-RU' : 'uz-UZ')}{' '}
                    {t("ko'rish", 'просм.')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Trafik manbalari */}
        <div className="rounded-xl border border-border bg-card p-5 md:p-6 mt-6">
          <div className="flex items-center gap-2 mb-1">
            <Globe2 className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-base md:text-lg text-foreground">
              {t('Trafik manbalari (30 kun)', 'Источники трафика (30 дней)')}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-5 ml-7">
            {t('Unikal odamlar soni', 'Количество уникальных людей')}
          </p>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : sources.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {t("Hozircha ma'lumot yo'q", 'Пока нет данных')}
            </p>
          ) : (
            (() => {
              const totalSrc = sources.reduce((s, x) => s + x.count, 0) || 1;
              return (
                <ul className="space-y-3">
                  {sources.map((s) => {
                    const { label, Icon, color } = sourceLabel(s.source, lang);
                    const pct = Math.round((s.count / totalSrc) * 100);
                    return (
                      <li key={s.source}>
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
                            <span className="text-sm font-medium text-foreground truncate">
                              {label}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-foreground tabular-nums flex-shrink-0">
                            {s.count.toLocaleString(lang === 'ru' ? 'ru-RU' : 'uz-UZ')}
                            <span className="text-muted-foreground font-normal ml-2">
                              {pct}%
                            </span>
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              );
            })()
          )}
        </div>

        {/* Ustaxonalarga qo'ng'iroqlar */}
        <div className="rounded-xl border border-border bg-card p-5 md:p-6 mt-6">
          <div className="flex items-center gap-2 mb-1">
            <Phone className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-base md:text-lg text-foreground">
              {t('Ustaxonalarga qo\'ng\'iroqlar', 'Звонки в мастерские')}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-5 ml-7">
            {t(
              `Jami ${callsTotal.toLocaleString('uz-UZ')} ta qo'ng'iroq tugmasi bosilgan`,
              `Всего нажатий на кнопку звонка: ${callsTotal.toLocaleString('ru-RU')}`,
            )}
          </p>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : calls.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {t("Hozircha qo'ng'iroqlar yo'q", 'Пока нет звонков')}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {calls.map((c) => (
                <li key={c.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{c.workshop}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {c.region} · {c.district}{c.phone ? ` · ${c.phone}` : ''}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary tabular-nums flex-shrink-0">
                    {c.count.toLocaleString(lang === 'ru' ? 'ru-RU' : 'uz-UZ')}{' '}
                    {t("qo'ng'iroq", 'звон.')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
