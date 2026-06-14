import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, ShieldCheck, Star } from 'lucide-react';
import { usePartnerWorkshop } from '@/hooks/usePartners';
import { useSEO } from '@/hooks/useSEO';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';

const BRAND = '#2563EB';
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

export default function WorkshopDetails() {
  const { workshopId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { workshop, loading } = usePartnerWorkshop(workshopId);
  const [place, setPlace] = useState<{ region_id?: string; region_name?: string; district_id?: string; district_name?: string }>({});

  const tx = {
    back: language === 'uz' ? 'Barcha ustaxonalar' : 'Все мастерские',
    info: language === 'uz' ? "Asosiy ma'lumotlar" : 'Основная информация',
    address: language === 'uz' ? 'Manzil' : 'Адрес',
    phone: language === 'uz' ? 'Telefon' : 'Телефон',
    experience: language === 'uz' ? 'Tajriba' : 'Опыт',
    years: language === 'uz' ? 'yil' : 'лет',
    expBadge: (n: number) => (language === 'uz' ? `${n} yillik tajriba` : `Опыт ${n} лет`),
    call: language === 'uz' ? "Qo'ng'iroq qilish" : 'Позвонить',
    notFound: language === 'uz' ? 'Ustaxona topilmadi.' : 'Мастерская не найдена.',
  };

  // Tuman va viloyat nomlarini yuklab olamiz (qo'ng'iroqni hisobga olish uchun)
  useEffect(() => {
    if (!workshop?.district_id) return;
    (async () => {
      const { data: d } = await db
        .from('partner_districts')
        .select('id, name, region_id')
        .eq('id', workshop.district_id)
        .maybeSingle();
      if (!d) return;
      let regionName: string | undefined;
      if (d.region_id) {
        const { data: r } = await db
          .from('partner_regions')
          .select('name')
          .eq('id', d.region_id)
          .maybeSingle();
        regionName = r?.name;
      }
      setPlace({ region_id: d.region_id, region_name: regionName, district_id: d.id, district_name: d.name });
    })();
  }, [workshop?.district_id]);

  const loggedRef = useRef(false);
  const logCall = () => {
    if (loggedRef.current || !workshop) return;
    loggedRef.current = true;
    db.from('workshop_calls').insert({
      workshop_id: workshop.id,
      district_id: place.district_id ?? null,
      region_id: place.region_id ?? null,
      workshop_name: workshop.name,
      district_name: place.district_name ?? null,
      region_name: place.region_name ?? null,
      phone: workshop.phone ?? null,
      session_id: getId('mm_session_id', 's'),
      device_id: getId('mm_device_id', 'd'),
    }).then(() => {}, () => {});
  };

  useSEO({
    title: workshop ? workshop.name : 'Ustaxona',
    description: workshop?.description || 'Partner ustaxona haqida batafsil.',
  });

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-10 sm:py-16 max-w-2xl">
          <div className="h-6 w-40 rounded bg-muted animate-pulse mb-8" />
          <div className="h-10 w-64 rounded bg-muted animate-pulse mb-4" />
          <div className="h-64 rounded-2xl bg-muted animate-pulse" />
        </div>
      </main>
    );
  }

  if (!workshop) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
          <p className="text-muted-foreground">{tx.notFound}</p>
          <button onClick={() => navigate(-1)} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: BRAND }}>
            <ArrowLeft className="w-4 h-4" /> {tx.back}
          </button>
        </div>
      </main>
    );
  }

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
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-semibold mb-8" style={{ color: BRAND }}>
          <ArrowLeft className="w-4 h-4" /> {tx.back}
        </button>

        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-foreground mb-5">{workshop.name}</h1>

        {workshop.experience_years ? (
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold" style={{ backgroundColor: `${BRAND}1a`, color: BRAND }}>
              <Star className="w-4 h-4 fill-current" /> {tx.expBadge(workshop.experience_years)}
            </span>
          </div>
        ) : null}

        {workshop.phone ? (
          <a
            href={`tel:${workshop.phone.replace(/\s/g, '')}`}
            onClick={logCall}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl px-8 py-4 text-lg font-bold text-white transition-opacity hover:opacity-90 mb-10"
            style={{ backgroundColor: BRAND }}
          >
            <Phone className="w-5 h-5" /> {tx.call}
          </a>
        ) : null}

        {workshop.description ? (
          <p className="text-muted-foreground whitespace-pre-line mb-8">{workshop.description}</p>
        ) : null}

        <h2 className="font-serif text-xl font-bold text-foreground mb-4">{tx.info}</h2>
        <div className="space-y-3">
          {workshop.address ? (
            <Row icon={<MapPin className="w-5 h-5" />} label={tx.address} value={workshop.address} />
          ) : null}
          {workshop.phone ? (
            <Row icon={<Phone className="w-5 h-5" />} label={tx.phone} value={workshop.phone} />
          ) : null}
          {workshop.experience_years ? (
            <Row icon={<ShieldCheck className="w-5 h-5" />} label={tx.experience} value={`${workshop.experience_years} ${tx.years}`} />
          ) : null}
        </div>
      </div>
    </main>
  );
}
