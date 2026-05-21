import { useEffect, useMemo, useState } from 'react';
import { Activity, Eye, Users, ShoppingCart, Calendar, TrendingUp } from 'lucide-react';
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
  const [totalVisits, setTotalVisits] = useState(0);
  const [todayVisits, setTodayVisits] = useState(0);
  const [onlineNow, setOnlineNow] = useState(0);
  const [productViews, setProductViews] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [weekData, setWeekData] = useState<DayPoint[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);

  useEffect(() => {
    document.title = t('Sayt statistikasi', 'Статистика сайта');
  }, [language]);

  useEffect(() => {
    async function load() {
      setLoading(true);
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

      const [
        totalRes,
        todayRes,
        onlineRes,
        productRes,
        ordersRes,
        weekRes,
        topRes,
      ] = await Promise.all([
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
        supabase
          .from('page_visits')
          .select('created_at')
          .gte('created_at', start7.toISOString())
          .order('created_at', { ascending: true }),
        supabase
          .from('page_visits')
          .select('path')
          .gte('created_at', start30.toISOString()),
      ]);

      setTotalVisits(totalRes.count ?? 0);
      setTodayVisits(todayRes.count ?? 0);

      const distinctSessions = new Set(
        (onlineRes.data ?? []).map((r: any) => r.session_id),
      );
      setOnlineNow(distinctSessions.size);

      setProductViews(productRes.count ?? 0);
      setOrdersCount(ordersRes.count ?? 0);

      // So'nggi 7 kun
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

      // Eng mashhur sahifalar
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

      setLoading(false);
    }
    load();
  }, [language]);

  const cards = useMemo(
    () => [
      {
        label: t('Hozir onlayn', 'Сейчас онлайн'),
        value: onlineNow,
        icon: Activity,
        sub: t("Oxirgi 5 daqiqa", 'Последние 5 минут'),
        accent: 'text-emerald-500',
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
    [onlineNow, todayVisits, totalVisits, productViews, ordersCount, language],
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
        </div>

        {/* Kartochkalar */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-8">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className="rounded-xl border border-border bg-card p-4 md:p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className="text-xs md:text-sm text-muted-foreground leading-tight">
                    {c.label}
                  </p>
                  <Icon className={`w-4 h-4 ${c.accent} flex-shrink-0`} />
                </div>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">
                    {c.value.toLocaleString(lang === 'ru' ? 'ru-RU' : 'uz-UZ')}
                  </div>
                )}
                {c.sub && (
                  <p className="text-[11px] text-muted-foreground mt-1">{c.sub}</p>
                )}
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
      </div>
    </div>
  );
}
