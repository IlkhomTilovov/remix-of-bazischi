import { Link, useParams } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Wrench, Award } from 'lucide-react';
import { usePartnerWorkshops, usePartnerDistrict } from '@/hooks/usePartners';
import { useSEO } from '@/hooks/useSEO';

const BRAND = '#24A8F2';

export default function PartnerWorkshops() {
  const { regionId, districtId } = useParams();
  const { district } = usePartnerDistrict(districtId);
  const { workshops, loading } = usePartnerWorkshops(districtId);
  useSEO({
    title: district ? `${district.name} — Ustaxonalar` : 'Ustaxonalar',
    description: 'Tumandagi partner ustaxonalar ro\'yxati.',
  });

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-10 sm:py-16 max-w-6xl">
        <Link to={`/ustaxonalar/${regionId}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Orqaga
        </Link>
        <header className="text-center mb-10 sm:mb-14">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-foreground">{district?.name || 'Ustaxonalar'}</h1>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">Ustaxonani tanlang</p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : workshops.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">Hozircha ustaxonalar mavjud emas.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {workshops.map((w) => (
              <div key={w.id} className="group rounded-2xl border border-border bg-white p-6 shadow-sm hover:shadow-lg transition-all flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${BRAND}1a` }}>
                    <Wrench className="w-6 h-6" style={{ color: BRAND }} />
                  </div>
                  {w.experience_years ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                      <Award className="w-3.5 h-3.5" style={{ color: BRAND }} /> {w.experience_years} yil
                    </span>
                  ) : null}
                </div>
                <h2 className="font-serif text-xl font-bold text-foreground mb-1">{w.name}</h2>
                {w.address ? <p className="text-sm text-muted-foreground line-clamp-1">{w.address}</p> : null}
                <div className="mt-auto pt-5">
                  <Link
                    to={`/ustaxona/${w.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: BRAND }}
                  >
                    Batafsil
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
