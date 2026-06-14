import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Award, MapPin, Phone, Star, ShieldCheck } from 'lucide-react';
import { usePartnerWorkshops, usePartnerDistrict } from '@/hooks/usePartners';
import { useSEO } from '@/hooks/useSEO';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';

const BRAND = '#24A8F2';
const db = supabase as any;

function getId(key: string, prefix: string): string {
  try {
    const store = prefix === 's' ? sessionStorage : localStorage;
    let id = store.getItem(key);
    if (!id) {
      id = `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      store.setItem(key, id);
    }
    return id;
  } catch {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

export default function PartnerWorkshops() {
  const { regionId, districtId } = useParams();
  const { language } = useLanguage();
  const { district } = usePartnerDistrict(districtId);
  const { workshops, loading } = usePartnerWorkshops(districtId);
  const tx = {
    back: language === 'uz' ? 'Orqaga' : 'Назад',
    title: language === 'uz' ? 'Ustaxonalar' : 'Мастерские',
    subtitle: language === 'uz' ? 'Ustaxonani tanlang' : 'Выберите мастерскую',
    empty: language === 'uz' ? 'Hozircha ustaxonalar mavjud emas.' : 'Пока нет мастерских.',
    years: language === 'uz' ? 'yil' : 'лет',
    address: language === 'uz' ? 'Manzil' : 'Адрес',
    phone: language === 'uz' ? 'Telefon' : 'Телефон',
    experience: language === 'uz' ? 'Tajriba' : 'Опыт',
    call: language === 'uz' ? "Qo'ng'iroq qilish" : 'Позвонить',
    yearsExp: language === 'uz' ? 'yillik tajriba' : 'лет опыта',
    mainInfo: language === 'uz' ? "Asosiy ma'lumotlar" : 'Основная информация',
  };

  useSEO({
    title: district ? `${district.name} — ${tx.title}` : tx.title,
    description: language === 'uz' ? 'Tumandagi partner ustaxonalar ro\'yxati.' : 'Список партнёрских мастерских в районе.',
  });

  const logCall = (w: typeof workshops[number]) => {
    db.from('workshop_calls').insert({
      workshop_id: w.id,
      district_id: districtId ?? null,
      region_id: regionId ?? null,
      workshop_name: w.name,
      district_name: district?.name ?? null,
      region_name: null,
      phone: w.phone ?? null,
      session_id: getId('mm_session_id', 's'),
      device_id: getId('mm_device_id', 'd'),
    }).then(() => {}, () => {});
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-10 sm:py-16 max-w-6xl">
        <Link to={`/ustaxonalar/${regionId}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> {tx.back}
        </Link>
        <header className="text-center mb-10 sm:mb-14">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-foreground">{district?.name || tx.title}</h1>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">{tx.subtitle}</p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : workshops.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">{tx.empty}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
            {workshops.map((w) => (
              <div key={w.id} className="rounded-2xl border border-border bg-white p-6 shadow-sm hover:shadow-lg transition-all flex flex-col">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-3">{w.name}</h2>

                {w.experience_years ? (
                  <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground mb-4">
                    <Star className="w-4 h-4 fill-current" style={{ color: BRAND }} /> {w.experience_years} {tx.yearsExp}
                  </span>
                ) : null}

                {w.phone ? (
                  <a
                    href={`tel:${w.phone.replace(/\s/g, '')}`}
                    onClick={() => logCall(w)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 mb-5"
                    style={{ backgroundColor: BRAND }}
                  >
                    <Phone className="w-5 h-5" /> {tx.call}
                  </a>
                ) : null}

                {w.description ? (
                  <p className="text-sm text-muted-foreground whitespace-pre-line mb-4">{w.description}</p>
                ) : null}

                <p className="text-sm font-bold text-foreground mb-3">{tx.mainInfo}</p>

                <div className="divide-y divide-border border-t border-border">
                  {w.address ? (
                    <div className="flex items-center justify-between gap-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 shrink-0" style={{ color: BRAND }} />
                        <span className="text-sm font-medium text-foreground">{tx.address}</span>
                      </div>
                      <span className="text-sm text-muted-foreground text-right">{w.address}</span>
                    </div>
                  ) : null}
                  {w.phone ? (
                    <div className="flex items-center justify-between gap-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <Phone className="w-4 h-4 shrink-0" style={{ color: BRAND }} />
                        <span className="text-sm font-medium text-foreground">{tx.phone}</span>
                      </div>
                      <span className="text-sm text-muted-foreground text-right">{w.phone}</span>
                    </div>
                  ) : null}
                  {w.experience_years ? (
                    <div className="flex items-center justify-between gap-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: BRAND }} />
                        <span className="text-sm font-medium text-foreground">{tx.experience}</span>
                      </div>
                      <span className="text-sm text-muted-foreground text-right">{w.experience_years} {tx.years}</span>
                    </div>
                  ) : null}
                </div>
              </div>

            ))}
          </div>
        )}
      </div>
    </main>
  );
}
