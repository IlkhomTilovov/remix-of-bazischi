import { Link, useParams } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Wrench } from 'lucide-react';
import { usePartnerDistricts, usePartnerRegion } from '@/hooks/usePartners';
import { useSEO } from '@/hooks/useSEO';
import { useLanguage } from '@/hooks/useLanguage';

const BRAND = '#24A8F2';

export default function PartnerDistricts() {
  const { regionId } = useParams();
  const { language } = useLanguage();
  const { region } = usePartnerRegion(regionId);
  const { districts, loading } = usePartnerDistricts(regionId);
  const tx = {
    back: language === 'uz' ? 'Orqaga' : 'Назад',
    title: language === 'uz' ? 'Tumanlar' : 'Районы',
    subtitle: language === 'uz' ? 'Tumanni tanlang' : 'Выберите район',
    empty: language === 'uz' ? 'Hozircha tumanlar mavjud emas.' : 'Пока нет районов.',
    workshops: language === 'uz' ? 'Ustaxonalar' : 'Мастерские',
    workshopsCount: language === 'uz' ? 'ta ustaxona' : 'мастерских',
  };
  useSEO({
    title: region ? `${region.name} — ${tx.title}` : tx.title,
    description: language === 'uz' ? 'Tumanlar bo\'yicha partner ustaxonalar.' : 'Партнёрские мастерские по районам.',
  });

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-10 sm:py-16 max-w-6xl">
        <Link to="/ustaxonalar" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> {tx.back}
        </Link>
        <header className="text-center mb-10 sm:mb-14">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-foreground">{region?.name || tx.title}</h1>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">{tx.subtitle}</p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : districts.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">{tx.empty}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {districts.map((d) => (
              <div key={d.id} className="group rounded-2xl border border-border bg-white p-6 shadow-sm hover:shadow-lg transition-all flex flex-col">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: `${BRAND}1a` }}>
                  <Wrench className="w-6 h-6" style={{ color: BRAND }} />
                </div>
                <h2 className="font-serif text-xl font-bold text-foreground mb-1">{d.name}</h2>
                <p className="text-sm text-muted-foreground">{d.workshop_count ?? 0} {tx.workshopsCount}</p>
                <div className="mt-auto pt-5">
                  <Link
                    to={`/ustaxonalar/${regionId}/${d.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: BRAND }}
                  >
                    {tx.workshops}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
