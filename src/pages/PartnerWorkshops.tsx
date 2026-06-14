import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, ShieldCheck, Star } from 'lucide-react';
import { usePartnerWorkshops, usePartnerDistrict, type PartnerWorkshop } from '@/hooks/usePartners';
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
    empty: language === 'uz' ? 'Hozircha ustaxonalar mavjud emas.' : 'Пока нет мастерских.',
    years: language === 'uz' ? 'yil' : 'лет',
    address: language === 'uz' ? 'Manzil' : 'Адрес',
    phone: language === 'uz' ? 'Telefon' : 'Телефон',
    experience: language === 'uz' ? 'Tajriba' : 'Опыт',
    call: language === 'uz' ? "Qo'ng'iroq qilish" : 'Позвонить',
    info: language === 'uz' ? "Asosiy ma'lumotlar" : 'Основная информация',
    expBadge: (n: number) => (language === 'uz' ? `${n} yillik tajriba` : `Опыт ${n} лет`),
  };

  useSEO({
    title: district ? `${district.name} — ${tx.title}` : tx.title,
    description: language === 'uz' ? 'Tumandagi partner ustaxonalar ro\'yxati.' : 'Список партнёрских мастерских в районе.',
  });

  const logCall = (w: PartnerWorkshop) => {
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

  const Row = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-muted/50 px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="shrink-0" style={{ color: BRAND }}>{icon}</span>
        <span className="font-bold text-foreground">{label}</span>
      </div>
      <span className="text-right text-muted-foreground font-medium">{value}</span>
    </div>
  );

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
        <Link to={`/ustaxonalar/${regionId}`} className="inline-flex items-center gap-1.5 text-sm font-semibold mb-8" style={{ color: BRAND }}>
          <ArrowLeft className="w-4 h-4" /> {tx.back}
        </Link>

        {loading ? (
          <div>
            <div className="h-10 w-64 rounded bg-muted animate-pulse mb-5" />
            <div className="h-9 w-40 rounded-xl bg-muted animate-pulse mb-6" />
            <div className="h-14 w-52 rounded-2xl bg-muted animate-pulse mb-10" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        ) : workshops.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">{tx.empty}</p>
        ) : (
          <div className="space-y-16">
            {workshops.map((w) => (
              <section key={w.id}>
                <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-foreground mb-5">{w.name}</h1>

                {w.experience_years ? (
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold" style={{ backgroundColor: `${BRAND}1a`, color: BRAND }}>
                      <Star className="w-4 h-4 fill-current" /> {tx.expBadge(w.experience_years)}
                    </span>
                  </div>
                ) : null}

                {w.phone ? (
                  <a
                    href={`tel:${w.phone.replace(/\s/g, '')}`}
                    onClick={() => logCall(w)}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl px-8 py-4 text-lg font-bold text-white transition-opacity hover:opacity-90 mb-10"
                    style={{ backgroundColor: BRAND }}
                  >
                    <Phone className="w-5 h-5" /> {tx.call}
                  </a>
                ) : null}

                {w.description ? (
                  <p className="text-muted-foreground whitespace-pre-line mb-8">{w.description}</p>
                ) : null}

                <h2 className="font-serif text-xl font-bold text-foreground mb-4">{tx.info}</h2>
                <div className="space-y-3">
                  {w.address ? (
                    <Row icon={<MapPin className="w-5 h-5" />} label={tx.address} value={w.address} />
                  ) : null}
                  {w.phone ? (
                    <Row icon={<Phone className="w-5 h-5" />} label={tx.phone} value={w.phone} />
                  ) : null}
                  {w.experience_years ? (
                    <Row icon={<ShieldCheck className="w-5 h-5" />} label={tx.experience} value={`${w.experience_years} ${tx.years}`} />
                  ) : null}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
