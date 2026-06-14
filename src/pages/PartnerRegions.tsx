import { Link, useNavigate } from 'react-router-dom';
import { MapPin, ChevronRight, ArrowLeft } from 'lucide-react';
import { usePartnerRegions } from '@/hooks/usePartners';
import { useSEO } from '@/hooks/useSEO';

const BRAND = '#24A8F2';

export default function PartnerRegions() {
  const navigate = useNavigate();
  const { regions, loading } = usePartnerRegions();
  useSEO({
    title: 'Partner ustaxonalar — Viloyatlar',
    description: 'Hududlar bo\'yicha rasmiy partner ustaxonalar ro\'yxati.',
  });

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-10 sm:py-16 max-w-6xl">
        <button onClick={() => navigate('/#partner-ustaxonalar')} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Orqaga
        </button>
        <header className="text-center mb-10 sm:mb-14">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-foreground">Partner ustaxonalar</h1>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">Hududingizni tanlang</p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : regions.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">Hozircha viloyatlar mavjud emas.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {regions.map((r) => (
              <div
                key={r.id}
                className="group rounded-2xl border border-border bg-white p-6 shadow-sm hover:shadow-lg transition-all flex flex-col"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: `${BRAND}1a` }}
                >
                  <MapPin className="w-6 h-6" style={{ color: BRAND }} />
                </div>
                <h2 className="font-serif text-xl font-bold text-foreground mb-1">{r.name}</h2>
                <div className="mt-auto pt-5">
                  <Link
                    to={`/ustaxonalar/${r.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: BRAND }}
                  >
                    Ustaxonalar
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
