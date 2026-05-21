import { useEffect, useState } from 'react';
import { Eye, TrendingUp, Calendar, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { useSiteVisits } from '@/hooks/useSiteVisits';
import { Skeleton } from '@/components/ui/skeleton';

export default function Stats() {
  const { language } = useLanguage();
  const visits = useSiteVisits();
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    document.title = language === 'ru'
      ? 'Статистика сайта — посетителей'
      : 'Sayt statistikasi — tashrif buyuruvchilar';
  }, [language]);

  useEffect(() => {
    supabase
      .from('site_visits')
      .select('updated_at')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.updated_at) setUpdatedAt(data.updated_at);
      });
  }, [visits]);

  const t = (uz: string, ru: string) => (language === 'ru' ? ru : uz);

  const formattedDate = updatedAt
    ? new Date(updatedAt).toLocaleString(language === 'ru' ? 'ru-RU' : 'uz-UZ', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 md:py-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4">
            {t('Sayt statistikasi', 'Статистика сайта')}
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            {t(
              'Saytimizga tashrif buyurgan foydalanuvchilar soni real vaqtda',
              'Количество посетителей сайта в реальном времени',
            )}
          </p>
        </div>

        {/* Asosiy katta sanagich */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-secondary p-8 md:p-12 text-center shadow-lg">
          <div className="absolute inset-0 bg-black/5 pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">
              {t('Jami tashriflar', 'Всего посетителей')}
            </p>
            {visits === null ? (
              <Skeleton className="h-20 w-48 mx-auto" />
            ) : (
              <div className="font-serif text-6xl md:text-8xl font-bold text-foreground tabular-nums">
                {visits.toLocaleString(language === 'ru' ? 'ru-RU' : 'uz-UZ')}
              </div>
            )}
            {formattedDate && (
              <p className="mt-6 text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                {t('Oxirgi yangilanish: ', 'Последнее обновление: ')}
                {formattedDate}
              </p>
            )}
          </div>
        </div>

        {/* Ma'lumot kartochkalari */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">
                {t('Qanday hisoblanadi?', 'Как считается?')}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t(
                'Har bir yangi tashrif (brauzer sessiyasi) bir marta hisoblanadi. Bir foydalanuvchi sahifani qayta yuklasa, qayta sanalmaydi.',
                'Каждый новый визит (сессия браузера) считается один раз. Повторное обновление страницы не увеличивает счётчик.',
              )}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">
                {t('Real vaqtda', 'В реальном времени')}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t(
                "Ma'lumotlar to'g'ridan-to'g'ri serverdan olinadi va sahifa har ochilganda yangilanib turadi.",
                'Данные берутся напрямую с сервера и обновляются при каждом открытии страницы.',
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
