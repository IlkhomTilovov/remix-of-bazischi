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
  const { workshop, loading } = usePartnerWorkshop(workshopId);
  const [place, setPlace] = useState<{ region_id?: string; region_name?: string; district_id?: string; district_name?: string }>({});

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
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <div className="h-8 w-40 rounded bg-muted animate-pulse mb-8" />
          <div className="h-64 rounded-2xl bg-muted animate-pulse" />
        </div>
      </main>
    );
  }

  if (!workshop) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-20 max-w-3xl text-center">
          <p className="text-muted-foreground">Ustaxona topilmadi.</p>
          <button onClick={() => navigate(-1)} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: BRAND }}>
            <ArrowLeft className="w-4 h-4" /> Orqaga
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-10 sm:py-16 max-w-3xl">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Orqaga
        </button>

        <div className="rounded-2xl border border-border bg-white p-6 sm:p-10 shadow-sm">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: `${BRAND}1a` }}>
            <Wrench className="w-7 h-7" style={{ color: BRAND }} />
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-foreground">{workshop.name}</h1>
          </div>


          {workshop.description ? (
            <p className="text-muted-foreground whitespace-pre-line mb-8">{workshop.description}</p>
          ) : null}

          <div className="space-y-4 mb-8">
            {workshop.address ? (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 shrink-0" style={{ color: BRAND }} />
                <div>
                  <p className="text-xs text-muted-foreground">Manzil</p>
                  <p className="text-foreground font-medium">{workshop.address}</p>
                </div>
              </div>
            ) : null}
            {workshop.phone ? (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 mt-0.5 shrink-0" style={{ color: BRAND }} />
                <div>
                  <p className="text-xs text-muted-foreground">Telefon</p>
                  <p className="text-foreground font-medium">{workshop.phone}</p>
                </div>
              </div>
            ) : null}
            {workshop.experience_years ? (
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 mt-0.5 shrink-0" style={{ color: BRAND }} />
                <div>
                  <p className="text-xs text-muted-foreground">Tajriba</p>
                  <p className="text-foreground font-medium">{workshop.experience_years} yil</p>
                </div>
              </div>
            ) : null}
          </div>

          {workshop.phone ? (
            <a
              href={`tel:${workshop.phone.replace(/\s/g, '')}`}
              onClick={logCall}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: BRAND }}
            >
              <Phone className="w-5 h-5" /> Qo'ng'iroq qilish
            </a>
          ) : null}
        </div>
      </div>
    </main>
  );
}
