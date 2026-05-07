import { motion } from 'framer-motion';
import { SPEC_ICONS, type Specification } from '@/components/admin/SpecificationsBuilder';
import { Info } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface Props {
  specifications: Specification[] | null | undefined;
}

export function ProductSpecifications({ specifications }: Props) {
  const { language } = useLanguage();
  const specs = (specifications || []).filter((s) => s && (s.label || s.value));

  if (specs.length === 0) return null;

  return (
    <section className="relative mt-16 overflow-hidden rounded-3xl border border-white/10 bg-[#04060b] p-6 sm:p-10">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative">
        <div className="mb-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
            {language === 'uz' ? 'Texnik ma\'lumotlar' : 'Технические характеристики'}
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-white">
            {language === 'uz' ? 'Xususiyatlar' : 'Характеристики'}
          </h2>
          <div className="mx-auto mt-3 h-px w-16 bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {specs.map((spec, i) => {
            const IconComp = SPEC_ICONS[spec.icon || 'info'] || Info;
            return (
              <motion.div
                key={spec.id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 transition-all hover:border-primary/40 hover:bg-white/[0.05]"
              >
                {/* Hover glow */}
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                    <IconComp className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wider text-white/50 font-medium">
                      {spec.label}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white truncate">
                      {spec.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
