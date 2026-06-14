import { Link, useNavigate } from 'react-router-dom';
import { MapPin, ChevronRight, ArrowLeft } from 'lucide-react';
import { usePartnerRegions } from '@/hooks/usePartners';
import { useSEO } from '@/hooks/useSEO';
import { useLanguage } from '@/hooks/useLanguage';

const BRAND = '#24A8F2';

export default function PartnerRegions() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { regions, loading } = usePartnerRegions();
  const tx = {
    back: language === 'uz' ? 'Orqaga' : 'Назад',
    title: language === 'uz' ? 'Ustaxonalar' : 'Мастерские',
    subtitle: language === 'uz' ? 'Hududingizni tanlang' : 'Выберите свой регион',
    empty: language === 'uz' ? 'Hozircha viloyatlar mavjud emas.' : 'Пока нет регионов.',
    workshops: language === 'uz' ? 'Ustaxonalar' : 'Мастерские',
  };
  useSEO({
    title: language === 'uz' ? 'Ustaxonalar — Viloyatlar' : 'Мастерские — Регионы',
    description: language === 'uz' ? 'Hududlar bo\'yicha rasmiy partner ustaxonalar ro\'yxati.' : 'Список официальных партнёрских мастерских по регионам.',
  });

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-10 sm:py-16 max-w-6xl">
        <button onClick={() => navigate('/#partner-ustaxonalar')} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> {tx.back}
        </button>
        <header className="text-center mb-10 sm:mb-14">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-foreground">{tx.title}</h1>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">{tx.subtitle}</p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : regions.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">{tx.empty}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {regions.map((r) => (
              <div
                key={r.id}
                className="group rounded-2xl border border-border bg-white shadow-sm hover:shadow-lg transition-all flex flex-col overflow-hidden"
              >
                {r.image_url ? (
                  <img src={r.image_url} alt={r.name} className="w-full h-44 object-cover" />
                ) : (
                  <div
                    className="w-full h-44 flex items-center justify-center"
                    style={{ backgroundColor: `${BRAND}1a` }}
                  >
                    <MapPin className="w-10 h-10" style={{ color: BRAND }} />
                  </div>
                )}
                <div className="flex flex-col flex-1 p-6">
                  <h2 className="font-serif text-xl font-bold text-foreground mb-1">{r.name}</h2>
                  <div className="mt-auto pt-5">
                    <Link
                      to={`/ustaxonalar/${r.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: BRAND }}
                    >
                      {tx.workshops}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
