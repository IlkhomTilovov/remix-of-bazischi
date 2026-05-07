import { motion } from 'framer-motion';
import { SPEC_ICONS, type Specification } from '@/components/admin/SpecificationsBuilder';
import { Info } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface Props {
  specifications: Specification[] | null | undefined;
  variant?: 'full' | 'compact';
}

export function ProductSpecifications({ specifications, variant = 'full' }: Props) {
  const { language } = useLanguage();
  const specs = (specifications || []).filter((s) => s && (s.label || s.value));

  if (specs.length === 0) return null;

  if (variant === 'compact') {
    return (
      <div className="mb-6 rounded-2xl border border-border bg-muted/30 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            {language === 'uz' ? "Texnik ma'lumotlar" : 'Технические характеристики'}
          </span>
          <div className="h-px flex-1 ml-3 bg-gradient-to-r from-border to-transparent" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {specs.map((spec, i) => {
            const IconComp = SPEC_ICONS[spec.icon || 'info'] || Info;
            return (
              <motion.div
                key={spec.id || i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                className="group flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <IconComp className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium leading-tight">
                    {spec.label}
                  </p>
                  <p className="text-sm font-semibold text-foreground truncate leading-snug">
                    {spec.value}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <section className="relative mt-16 overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-10">
      <div className="relative">
        <div className="mb-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            {language === 'uz' ? "Texnik ma'lumotlar" : 'Технические характеристики'}
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-foreground">
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
                className="group relative overflow-hidden rounded-2xl border border-border bg-background p-5 transition-all hover:border-primary/40 hover:shadow-lg"
              >
                <div className="relative flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <IconComp className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                      {spec.label}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-foreground truncate">
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
