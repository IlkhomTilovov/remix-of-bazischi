import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, Shield, Ruler, Gem, Truck, Star, Paintbrush, Users, ChevronRight, Phone, Send, Sparkles, BadgeCheck, Wrench, ThermometerSun, Layers3, ScanSearch, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { useFeaturedProducts, useCategories } from '@/hooks/useProducts';
import { useLanguage } from '@/hooks/useLanguage';
import { useSEO } from '@/hooks/useSEO';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { EditableText } from '@/components/EditableText';
import { EditableImage } from '@/components/EditableImage';
import { useState, useEffect, useRef } from 'react';

import serviceWardrobe from '@/assets/service-wardrobe.jpg';
import serviceKitchen from '@/assets/service-kitchen.jpg';
import serviceTvzone from '@/assets/service-tvzone.jpg';
import serviceBedroom from '@/assets/service-bedroom.jpg';

const defaultServiceImages: Record<string, string> = {
  'shkaflar': serviceWardrobe,
  'oshxona-mebellari': serviceKitchen,
  'tv-zonalar': serviceTvzone,
  'yotoqxona-mebellari': serviceBedroom,
};

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, isVisible };
}

const iconMap: Record<string, any> = {
  Shield, Ruler, Gem, Truck, Star, Paintbrush, Users, ThermometerSun, Sparkles, Layers3, Wrench, BadgeCheck,
};

export default function Index() {
  const { language } = useLanguage();
  useSEO({});
  const { products: featuredProducts, loading: productsLoading } = useFeaturedProducts(8);
  const { settings } = useSystemSettings();
  const { categories, loading: categoriesLoading } = useCategories();
  const contactPhone = settings?.contact_phone || '+998 95 707 00 08';

  const whyUsItems = [
    { key: 'whyus_1', icon: 'Shield', titleFallback: 'UV Himoya', descFallback: 'Quyosh nuri va zararli UV nurlardan ishonchli himoya' },
    { key: 'whyus_2', icon: 'ThermometerSun', titleFallback: 'Issiqlikni kamaytirish', descFallback: 'Premium plyonkalar salon haroratini sezilarli pasaytiradi' },
    { key: 'whyus_3', icon: 'Sparkles', titleFallback: "Elegant ko'rinish", descFallback: "Avtomobilingizga premium va sport ko'rinish baxsh etadi" },
    { key: 'whyus_4', icon: 'Layers3', titleFallback: 'Keramika plyonkalar', descFallback: 'Yuqori sifatli nano-keramik tanirovka plyonkalari' },
    { key: 'whyus_5', icon: 'Wrench', titleFallback: "Professional o'rnatish", descFallback: "Tajribali ustalar tomonidan aniq va sifatli o'rnatish" },
    { key: 'whyus_6', icon: 'BadgeCheck', titleFallback: 'Kafolatlangan sifat', descFallback: 'Uzoq muddatga chidamli premium materiallar' },
  ];

  const steps = [
    { key: 'step_1', num: '01', icon: ScanSearch, titleFallback: 'Diagnostika', descFallback: 'Avtomobil oynalari tekshiriladi va optimal tanirovka yechimi tanlanadi.' },
    { key: 'step_2', num: '02', icon: Layers3, titleFallback: 'Premium plyonka tanlash', descFallback: "Keramika, carbon yoki premium UV himoya plyonkalari tavsiya qilinadi." },
    { key: 'step_3', num: '03', icon: Wrench, titleFallback: 'Precision montaj', descFallback: "Maxsus uskunalar yordamida professional o'rnatish amalga oshiriladi." },
    { key: 'step_4', num: '04', icon: ShieldCheck, titleFallback: 'Himoya va komfort', descFallback: "Salon issiqlikdan himoyalanadi va avtomobil premium ko'rinishga ega bo'ladi." },
  ];

  const testimonials = [
    { key: 'testimonial_1', nameFallback: 'Sardor Karimov', textFallback: "BAROKAT MEBEL bilan ishlaganim uchun juda mamnunman. Sifat a'lo darajada, dizayn zamonaviy.", roleFallback: 'Mijoz' },
    { key: 'testimonial_2', nameFallback: 'Nilufar Rahimova', textFallback: "Oshxona mebelini buyurtma qildik, natija kutganimizdan ham yaxshi chiqdi. Rahmat!", roleFallback: 'Mijoz' },
    { key: 'testimonial_3', nameFallback: 'Bobur Toshmatov', textFallback: "TV zona va shkaf buyurtma qildim. Professional yondashuv va sifatli ish.", roleFallback: 'Mijoz' },
  ];

  const trustBadges = [
    { key: 'trust_1', icon: Shield, fallback: 'Quyoshdan maksimal himoya' },
    { key: 'trust_2', icon: Sparkles, fallback: "Elegant va sport uslub" },
    { key: 'trust_3', icon: BadgeCheck, fallback: 'Uzoq muddatli sifat' },
    { key: 'trust_4', icon: Wrench, fallback: 'Professional servis' },
  ];

  const sectionServices = useInView();
  const sectionWhyUs = useInView();
  const sectionProcess = useInView();
  const sectionProducts = useInView();
  const sectionTestimonials = useInView();
  const sectionCta = useInView();

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative flex items-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="absolute inset-0 z-0">
          <EditableImage
            contentKey="hero_background_image"
            fallbackSrc="/images/hero-default.jpg"
            alt="Premium mebel showroom"
            className="w-full h-full object-cover"
            wrapperClassName="w-full h-full"
            section="hero"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30 z-20 pointer-events-none" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10 py-20 pointer-events-none">
          <div className="max-w-4xl [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_[data-editable]]:pointer-events-auto">
            <div className="inline-block mb-6 px-4 py-1.5 border border-primary/40 rounded-sm">
              <EditableText
                contentKey="hero_badge"
                fallback="Premium mebel"
                as="span"
                className="text-primary text-xs font-medium tracking-[0.3em] uppercase"
                section="hero"
              />
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 break-words">
              <EditableText
                contentKey="hero_title"
                fallback={language === 'ru' ? 'DAÇ премиальные пленки. Профессиональный центр тонировки.' : 'DAÇ premium plyonkalar. Professional tonirovka markazi.'}
                as="span"
                className="font-serif text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold break-words"
                section="hero"
              />
            </h1>
            <p className="text-lg md:text-xl text-white/70 mb-10 max-w-lg leading-relaxed">
              <EditableText
                contentKey="hero_subtitle"
                fallback="Zamonaviy, sifatli va individual buyurtma asosida ishlab chiqariladi"
                as="span"
                className="text-lg md:text-xl"
                section="hero"
              />
            </p>
            <div className="flex flex-wrap gap-4 mb-16">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm px-8 sm:px-16 tracking-wider text-sm uppercase h-14 w-full sm:w-auto sm:min-w-[420px]">
                <Link to="/catalog">
                  <EditableText contentKey="hero_cta_primary" fallback={language === 'ru' ? 'Заказать' : "Buyurtma berish"} as="span" section="hero" />
                </Link>
              </Button>
            </div>

            {/* Trust badges - editable */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
              {trustBadges.map((badge) => (
                <div
                  key={badge.key}
                  className="group relative overflow-hidden rounded-xl md:rounded-2xl p-[1px] bg-gradient-to-br from-white/10 via-white/5 to-transparent transition-all duration-500 hover:from-primary/40 hover:via-primary/10 hover:to-transparent"
                >
                  <div className="pointer-events-none absolute -inset-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.25),transparent_60%)]" />

                  <div className="relative h-full flex items-center gap-2.5 sm:gap-3 md:gap-3.5 rounded-xl md:rounded-2xl px-2.5 py-2.5 sm:px-3.5 sm:py-3.5 md:px-4 md:py-4 bg-[linear-gradient(135deg,rgba(15,18,28,0.35),rgba(8,10,18,0.45))] backdrop-blur-xl">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 rounded-lg md:rounded-xl bg-primary/30 blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-gradient-to-br from-primary/25 via-primary/10 to-transparent border border-primary/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-500 group-hover:scale-105 group-hover:border-primary/60">
                        <badge.icon className="w-[18px] h-[18px] sm:w-5 sm:h-5 md:w-[22px] md:h-[22px] text-primary transition-transform duration-500 group-hover:scale-110" strokeWidth={1.75} />
                      </div>
                    </div>

                    <EditableText
                      contentKey={badge.key}
                      fallback={badge.fallback}
                      as="span"
                      className="min-w-0 flex-1 text-white/90 text-[11px] sm:text-xs md:text-[13px] font-semibold leading-snug tracking-tight break-words"
                      section="hero"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES - editable */}
      <section ref={sectionServices.ref} className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${sectionServices.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <EditableText contentKey="services_label" fallback="Xizmatlar" as="span" className="text-primary text-xs tracking-[0.3em] uppercase font-medium" section="services" />
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4">
              <EditableText contentKey="services_title" fallback="Biz nimalar qilamiz" as="span" className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold" section="services" />
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {categoriesLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : categories.length > 0 ? (
              categories.map((cat, i) => {
                const name = language === 'uz' ? cat.name_uz : cat.name_ru;
                const fallbackImage = defaultServiceImages[cat.slug] || serviceWardrobe;
                return (
                  <Link
                    to={`/catalog?category=${cat.slug}`}
                    key={cat.id}
                    className={`group relative aspect-square rounded-sm overflow-hidden cursor-pointer bg-white transition-all duration-700 ${sectionServices.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                    style={{ transitionDelay: `${i * 150}ms` }}
                  >
                    <img
                      src={cat.image || fallbackImage}
                      alt={name}
                      className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                    <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
                      {cat.product_count ?? 0} {language === 'uz' ? 'ta' : 'шт'}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                      <h3 className="font-serif text-xl font-semibold text-white mb-1">
                        {name}
                      </h3>
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-12">
                {language === 'uz' ? 'Hozircha toifalar yo\'q' : 'Категорий пока нет'}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* WHY US - editable */}
      <section ref={sectionWhyUs.ref} className="py-20 md:py-28 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${sectionWhyUs.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <EditableText contentKey="whyus_label" fallback="Afzalliklar" as="span" className="text-primary text-xs tracking-[0.3em] uppercase font-medium" section="whyus" />
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4">
              <EditableText contentKey="whyus_title" fallback="Nega aynan biz" as="span" className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold" section="whyus" />
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {whyUsItems.map((item, i) => {
              const IconComp = iconMap[item.icon] || Shield;
              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 30 }}
                  animate={sectionWhyUs.isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4 }}
                  className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-white/15 via-white/5 to-transparent hover:from-primary/40 hover:via-primary/20 hover:to-transparent transition-all duration-500"
                >
                  <div className="relative h-full rounded-2xl bg-gradient-to-br from-card/95 via-card/90 to-card/80 backdrop-blur-xl p-7 md:p-8 overflow-hidden">
                    {/* sheen */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    {/* radial glow on hover */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: 'radial-gradient(600px circle at 50% 0%, hsl(var(--primary) / 0.12), transparent 60%)' }}
                    />

                    <div className="relative z-10">
                      {/* Icon container */}
                      <div className="relative inline-flex mb-6">
                        <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <motion.div
                          whileHover={{ scale: 1.08, rotate: -3 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                          className="relative w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 shadow-[inset_0_1px_0_0_hsl(var(--foreground)/0.08),0_8px_24px_-8px_hsl(var(--primary)/0.4)]"
                        >
                          <IconComp className="w-6 h-6 text-primary" strokeWidth={1.75} />
                        </motion.div>
                      </div>

                      <h3 className="font-serif text-lg md:text-xl font-semibold text-foreground mb-2 tracking-tight">
                        <EditableText contentKey={`${item.key}_title`} fallback={item.titleFallback} as="span" className="font-serif text-lg md:text-xl font-semibold" section="whyus" />
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        <EditableText contentKey={`${item.key}_desc`} fallback={item.descFallback} as="span" className="text-sm leading-relaxed" section="whyus" />
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROCESS - premium automotive timeline */}
      <section ref={sectionProcess.ref} className="relative py-24 md:py-32 overflow-hidden bg-[#05070d]">
        {/* Ambient backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(var(--primary)/0.10),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(hsl(var(--primary))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary))_1px,transparent_1px)] [background-size:48px_48px]" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center mb-20 max-w-3xl mx-auto"
          >
            <EditableText contentKey="process_label" fallback="Jarayon" as="span" className="inline-block text-primary text-[11px] tracking-[0.4em] uppercase font-semibold px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm" section="process" />
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-6 leading-tight tracking-tight">
              <EditableText contentKey="process_title" fallback="Qanday ishlaymiz" as="span" className="font-serif" section="process" />
            </h2>
            <EditableText
              contentKey="process_subtitle"
              fallback="DAC premium plyonkalari, atermal yechimlar va tanirovka ustalari uchun professional uskunalar."
              as="p"
              className="text-white/50 text-base md:text-lg mt-5 font-light"
              section="process"
              multiline
            />
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Desktop horizontal connector line */}
            <div className="hidden lg:block absolute top-[88px] left-[8%] right-[8%] h-px">
              <div className="h-full w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: i * 0.12, ease: 'easeOut' }}
                    className="relative group h-full flex flex-col"
                  >
                    {/* Icon node */}
                    <div className="relative flex justify-center mb-8">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-xl flex items-center justify-center transition-all duration-500 group-hover:border-primary/40 group-hover:-translate-y-1 group-hover:shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.5)]">
                          <Icon className="w-8 h-8 text-primary transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
                        </div>
                      </div>
                    </div>

                    {/* Card */}
                    <div className="relative flex-1 flex flex-col rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-sm p-6 md:p-7 text-center transition-all duration-500 group-hover:border-primary/20 group-hover:bg-white/[0.05]">
                      <div className="font-serif text-5xl md:text-6xl font-bold bg-gradient-to-b from-white/15 to-white/[0.02] bg-clip-text text-transparent leading-none">
                        {step.num}
                      </div>
                      <h3 className="text-white text-lg md:text-xl font-semibold mt-4 mb-3 tracking-tight">
                        <EditableText contentKey={`${step.key}_title`} fallback={step.titleFallback} as="span" className="font-semibold" section="process" />
                      </h3>
                      <p className="text-white/55 text-sm leading-relaxed font-light">
                        <EditableText contentKey={`${step.key}_desc`} fallback={step.descFallback} as="span" className="text-sm" section="process" />
                      </p>
                    </div>

                    {/* Connector arrow (desktop) */}
                    {i < steps.length - 1 && (
                      <div className="hidden lg:flex absolute top-[72px] -right-4 z-20 items-center justify-center w-8 h-8 rounded-full bg-[#05070d] border border-primary/20">
                        <ChevronRight className="w-4 h-4 text-primary/70" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>


      {/* FEATURED PRODUCTS */}
      <section ref={sectionProducts.ref} className="py-20 md:py-28 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4 transition-all duration-700 ${sectionProducts.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div>
              <EditableText contentKey="products_label" fallback="Katalog" as="span" className="text-primary text-xs tracking-[0.3em] uppercase font-medium" section="products" />
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mt-2">
                <EditableText contentKey="featured_title" fallback={language === 'ru' ? 'Избранные товары' : 'Tanlangan mahsulotlar'} as="span" className="font-serif text-3xl md:text-4xl font-bold" section="products" />
              </h2>
            </div>
            <Button asChild variant="outline" className="gap-2 rounded-sm border-border hover:border-primary text-sm tracking-wider uppercase">
              <Link to="/catalog">{language === 'ru' ? 'Смотреть все' : "Barchasini ko'rish"} <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
          
          {productsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-20">
              Hozircha tanlangan mahsulotlar yo'q
            </p>
          )}
        </div>
      </section>

      {/* CTA - premium automotive conversion */}
      <section ref={sectionCta.ref} className="relative py-28 md:py-36 overflow-hidden bg-[#04060b]">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: "url('/images/hero-default.jpg')" }}
        />
        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#04060b] via-[#04060b]/85 to-[#04060b]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#04060b_75%)]" />
        {/* Blue accent glows */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/25 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-primary/15 rounded-full blur-[100px]" />
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(hsl(var(--primary))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary))_1px,transparent_1px)] [background-size:56px_56px]" />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/60"
            style={{ left: `${15 + i * 13}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="container mx-auto px-4 lg:px-8 relative z-10 text-center max-w-4xl"
        >
          <EditableText
            contentKey="cta_label"
            fallback="PREMIUM TANIROVKA"
            as="span"
            className="inline-block text-primary text-[11px] tracking-[0.4em] uppercase font-semibold px-4 py-1.5 rounded-full border border-primary/25 bg-primary/[0.08] backdrop-blur-md"
            section="cta"
          />

          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-7 leading-[1.1] tracking-tight">
            <EditableText
              contentKey="cta_title"
              fallback="Avtomobilingizga premium himoya bering"
              as="span"
              className="font-serif"
              section="cta"
            />
          </h2>

          <p className="text-white/60 text-base md:text-lg lg:text-xl mt-6 max-w-2xl mx-auto font-light leading-relaxed">
            <EditableText
              contentKey="cta_subtitle"
              fallback="Nano-keramika va premium UV himoya plyonkalari bilan avtomobilingizni issiqlik, quyosh va begona nigohlardan himoya qiling."
              as="span"
              className="font-light"
              section="cta"
            />
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <a
              href={`tel:${contactPhone.replace(/\s/g, '')}`}
              className="group relative inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl text-sm font-semibold tracking-[0.15em] uppercase text-white border border-white/15 bg-white/[0.04] backdrop-blur-xl transition-all duration-300 hover:border-primary/40 hover:bg-white/[0.08] hover:shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.4)]"
            >
              <Phone className="w-4 h-4" strokeWidth={2.2} />
              {language === 'ru' ? 'Свяжитесь с нами' : "Biz bilan bog'laning"}
            </a>

            <a
              href={settings?.social_telegram || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl text-sm font-semibold tracking-[0.15em] uppercase text-white overflow-hidden transition-transform duration-300 hover:scale-[1.03]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/80" />
              <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="absolute -inset-1 bg-primary/50 blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative flex items-center gap-2">
                <Send className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.2} />
                {language === 'ru' ? 'Написать в Telegram' : 'Telegram orqali yozish'}
              </span>
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-12 text-white/50 text-xs md:text-sm tracking-wide">
            {[
              { key: 'cta_badge_1', uz: 'Bepul konsultatsiya', ru: 'Бесплатная консультация' },
              { key: 'cta_badge_2', uz: "Professional o'rnatish", ru: 'Профессиональная установка' },
              { key: 'cta_badge_3', uz: 'Premium materiallar', ru: 'Премиум материалы' },
            ].map((b) => (
              <div key={b.key} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/80 shadow-[0_0_8px_hsl(var(--primary))]" />
                <EditableText
                  contentKey={b.key}
                  fallback={language === 'ru' ? b.ru : b.uz}
                  as="span"
                  section="cta"
                />
              </div>
            ))}
          </div>
        </motion.div>
      </section>


    </div>
  );
}


