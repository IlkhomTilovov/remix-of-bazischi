import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Settings2, Palette, Type as TypeIcon, Layout, Sparkles, Wand2,
  Check, X, Sun, Moon, Monitor, Smartphone, Bell, Search, Home,
  ShoppingBag, User, ChevronRight, Star, Save,
} from 'lucide-react';

export interface ThemeFormData {
  name: string;
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  foregroundColor: string;
  fontFamily: string;
  borderRadius: string;
  shadowLevel: string;
}

const FONT_OPTIONS = [
  { value: "'Inter', system-ui, sans-serif", label: 'Inter' },
  { value: "'Playfair Display', Georgia, serif", label: 'Playfair Display' },
  { value: "'Roboto', system-ui, sans-serif", label: 'Roboto' },
  { value: "'Montserrat', system-ui, sans-serif", label: 'Montserrat' },
  { value: "'Lora', Georgia, serif", label: 'Lora' },
  { value: "'Nunito Sans', system-ui, sans-serif", label: 'Nunito Sans' },
  { value: "'Work Sans', system-ui, sans-serif", label: 'Work Sans' },
  { value: "'Bebas Neue', sans-serif", label: 'Bebas Neue' },
  { value: "'Rubik', system-ui, sans-serif", label: 'Rubik' },
  { value: "'Oswald', sans-serif", label: 'Oswald' },
];

const RADIUS_OPTIONS = [
  { value: '0', label: 'Sharp' },
  { value: '0.25rem', label: 'XS' },
  { value: '0.5rem', label: 'S' },
  { value: '0.75rem', label: 'M' },
  { value: '1rem', label: 'L' },
  { value: '1.5rem', label: 'XL' },
];

const SHADOW_OPTIONS = [
  { value: 'none', label: "Yo'q" },
  { value: 'light', label: 'Engil' },
  { value: 'medium', label: "O'rta" },
  { value: 'heavy', label: 'Kuchli' },
];

const PRESETS: { name: string; data: Partial<ThemeFormData> }[] = [
  {
    name: 'Modern Dark',
    data: {
      isDark: true,
      primaryColor: '210 40% 96%',
      secondaryColor: '217 33% 17%',
      accentColor: '217 91% 60%',
      backgroundColor: '222 47% 6%',
      foregroundColor: '210 40% 98%',
      fontFamily: "'Inter', system-ui, sans-serif",
      borderRadius: '0.75rem',
      shadowLevel: 'heavy',
    },
  },
  {
    name: 'Luxury Gold',
    data: {
      isDark: true,
      primaryColor: '45 93% 58%',
      secondaryColor: '30 20% 14%',
      accentColor: '38 92% 50%',
      backgroundColor: '20 14% 8%',
      foregroundColor: '40 30% 96%',
      fontFamily: "'Playfair Display', Georgia, serif",
      borderRadius: '0.5rem',
      shadowLevel: 'heavy',
    },
  },
  {
    name: 'Scandinavian',
    data: {
      isDark: false,
      primaryColor: '215 25% 27%',
      secondaryColor: '210 17% 95%',
      accentColor: '199 89% 48%',
      backgroundColor: '0 0% 99%',
      foregroundColor: '215 25% 17%',
      fontFamily: "'Work Sans', system-ui, sans-serif",
      borderRadius: '0.5rem',
      shadowLevel: 'light',
    },
  },
  {
    name: 'Minimal White',
    data: {
      isDark: false,
      primaryColor: '0 0% 9%',
      secondaryColor: '0 0% 96%',
      accentColor: '0 0% 20%',
      backgroundColor: '0 0% 100%',
      foregroundColor: '0 0% 9%',
      fontFamily: "'Inter', system-ui, sans-serif",
      borderRadius: '0.25rem',
      shadowLevel: 'light',
    },
  },
  {
    name: 'Neo Green',
    data: {
      isDark: false,
      primaryColor: '142 76% 28%',
      secondaryColor: '138 25% 94%',
      accentColor: '142 71% 45%',
      backgroundColor: '120 20% 99%',
      foregroundColor: '140 40% 10%',
      fontFamily: "'Nunito Sans', system-ui, sans-serif",
      borderRadius: '1rem',
      shadowLevel: 'medium',
    },
  },
  {
    name: 'Royal Blue',
    data: {
      isDark: false,
      primaryColor: '221 83% 35%',
      secondaryColor: '214 32% 95%',
      accentColor: '221 83% 53%',
      backgroundColor: '0 0% 100%',
      foregroundColor: '222 47% 11%',
      fontFamily: "'Montserrat', system-ui, sans-serif",
      borderRadius: '0.75rem',
      shadowLevel: 'medium',
    },
  },
];

// HSL <-> HEX
const hslToHex = (hsl: string): string => {
  try {
    const [h, s, l] = hsl.split(' ').map((v) => parseFloat(v));
    const sNorm = s / 100;
    const lNorm = l / 100;
    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lNorm - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  } catch {
    return '#000000';
  }
};

const hexToHsl = (hex: string): string => {
  try {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
        case g: h = ((b - r) / d + 2) * 60; break;
        case b: h = ((r - g) / d + 4) * 60; break;
      }
    }
    return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  } catch {
    return '0 0% 0%';
  }
};

interface PremiumColorFieldProps {
  label: string;
  description?: string;
  value: string;
  onChange: (v: string) => void;
}

const PremiumColorField = ({ label, description, value, onChange }: PremiumColorFieldProps) => {
  const hex = hslToHex(value);
  return (
    <div className="group rounded-xl border bg-card/50 p-3 transition-all hover:border-primary/40 hover:shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="text-xs font-semibold tracking-tight">{label}</div>
          {description && (
            <div className="text-[10px] text-muted-foreground truncate">{description}</div>
          )}
        </div>
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="h-8 w-8 rounded-lg border-2 border-white shadow-md ring-1 ring-border overflow-hidden"
            style={{ background: `hsl(${value})` }}
          />
          <input
            type="color"
            value={hex}
            onChange={(e) => onChange(hexToHsl(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-pointer"
            aria-label={label}
          />
        </div>
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 text-[11px] font-mono bg-background/60"
        placeholder="0 0% 100%"
      />
      <div className="text-[10px] text-muted-foreground mt-1 font-mono uppercase">{hex}</div>
    </div>
  );
};

interface PremiumThemeBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ThemeFormData;
  setFormData: (d: ThemeFormData) => void;
  builderMode: 'create' | 'edit' | 'clone';
  onSave: () => void | Promise<void>;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export const PremiumThemeBuilder = ({
  open,
  onOpenChange,
  formData,
  setFormData,
  builderMode,
  onSave,
}: PremiumThemeBuilderProps) => {
  const [activeTab, setActiveTab] = useState('general');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof ThemeFormData>(key: K, value: ThemeFormData[K]) =>
    setFormData({ ...formData, [key]: value });

  const applyPreset = (preset: Partial<ThemeFormData>) => {
    setFormData({ ...formData, ...preset });
  };

  const previewStyle = useMemo(
    () => ({
      '--p-bg': `hsl(${formData.backgroundColor})`,
      '--p-fg': `hsl(${formData.foregroundColor})`,
      '--p-primary': `hsl(${formData.primaryColor})`,
      '--p-secondary': `hsl(${formData.secondaryColor})`,
      '--p-accent': `hsl(${formData.accentColor})`,
      '--p-radius': formData.borderRadius,
      fontFamily: formData.fontFamily,
    }) as React.CSSProperties,
    [formData],
  );

  const title =
    builderMode === 'create'
      ? 'Yangi mavzu yaratish'
      : builderMode === 'clone'
      ? 'Mavzuni nusxalash'
      : 'Mavzuni tahrirlash';

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[1240px] w-[95vw] h-[92vh] p-0 gap-0 overflow-hidden border-border/60 bg-background/80 backdrop-blur-2xl shadow-2xl"
      >
        {/* Decorative gradient backdrop */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-background/60 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Wand2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold tracking-tight">{title}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Premium dizayn tizimini bir necha daqiqada quring
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="rounded-lg">
              <X className="h-4 w-4 mr-1.5" /> Bekor qilish
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-gradient-to-r from-primary to-primary/80 shadow-md shadow-primary/20"
            >
              <Save className="h-4 w-4 mr-1.5" />
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </Button>
          </div>
        </div>

        {/* Body: split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] flex-1 min-h-0">
          {/* SETTINGS PANEL */}
          <div className="border-r border-border/60 bg-background/40 backdrop-blur-sm min-h-0 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
              <div className="px-4 pt-4">
                <TabsList className="w-full grid grid-cols-5 h-10 bg-muted/40 rounded-xl p-1">
                  <TabsTrigger value="general" className="rounded-lg text-xs gap-1.5">
                    <Settings2 className="h-3.5 w-3.5" /> Asosiy
                  </TabsTrigger>
                  <TabsTrigger value="colors" className="rounded-lg text-xs gap-1.5">
                    <Palette className="h-3.5 w-3.5" /> Ranglar
                  </TabsTrigger>
                  <TabsTrigger value="typo" className="rounded-lg text-xs gap-1.5">
                    <TypeIcon className="h-3.5 w-3.5" /> Shrift
                  </TabsTrigger>
                  <TabsTrigger value="layout" className="rounded-lg text-xs gap-1.5">
                    <Layout className="h-3.5 w-3.5" /> Layout
                  </TabsTrigger>
                  <TabsTrigger value="presets" className="rounded-lg text-xs gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> Presets
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1 min-h-0">
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    {/* GENERAL */}
                    <TabsContent value="general" key="general" forceMount={activeTab === 'general' ? true : undefined} className="mt-0 data-[state=inactive]:hidden">
                      <motion.div
                        variants={sectionVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-5"
                      >
                        <SectionCard title="Mavzu nomi" description="Brendingizga mos qisqa nom kiriting">
                          <Input
                            value={formData.name}
                            onChange={(e) => update('name', e.target.value)}
                            placeholder="Masalan: Zamonaviy Oq"
                            className="h-11 rounded-xl bg-background/60"
                          />
                        </SectionCard>

                        <SectionCard
                          title="Qorong'i rejim"
                          description="Mavzuni qorong'i yoki yorug' sifatida belgilang"
                        >
                          <div className="flex items-center justify-between rounded-xl border bg-card/60 p-4">
                            <div className="flex items-center gap-3">
                              <motion.div
                                animate={{ rotate: formData.isDark ? 180 : 0 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                                className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
                              >
                                {formData.isDark ? (
                                  <Moon className="h-4 w-4 text-primary" />
                                ) : (
                                  <Sun className="h-4 w-4 text-primary" />
                                )}
                              </motion.div>
                              <div>
                                <div className="text-sm font-medium">
                                  {formData.isDark ? "Qorong'i rejim" : "Yorug' rejim"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Avtomatik kontrastli rang sxemasi
                                </div>
                              </div>
                            </div>
                            <Switch
                              checked={formData.isDark}
                              onCheckedChange={(v) => update('isDark', v)}
                            />
                          </div>
                        </SectionCard>
                      </motion.div>
                    </TabsContent>

                    {/* COLORS */}
                    <TabsContent value="colors" key="colors" forceMount={activeTab === 'colors' ? true : undefined} className="mt-0 data-[state=inactive]:hidden">
                      <motion.div
                        variants={sectionVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-5"
                      >
                        <SectionCard
                          title="Brand ranglar"
                          description="Asosiy aktsentlar va interaktiv elementlar"
                        >
                          <div className="grid grid-cols-2 gap-3">
                            <PremiumColorField
                              label="Primary"
                              description="Asosiy brend rang"
                              value={formData.primaryColor}
                              onChange={(v) => update('primaryColor', v)}
                            />
                            <PremiumColorField
                              label="Accent"
                              description="Urg'u va CTA"
                              value={formData.accentColor}
                              onChange={(v) => update('accentColor', v)}
                            />
                          </div>
                        </SectionCard>

                        <SectionCard
                          title="Yuza ranglar"
                          description="Background, surface va matn ranglari"
                        >
                          <div className="grid grid-cols-2 gap-3">
                            <PremiumColorField
                              label="Background"
                              description="Asosiy orqa fon"
                              value={formData.backgroundColor}
                              onChange={(v) => update('backgroundColor', v)}
                            />
                            <PremiumColorField
                              label="Secondary"
                              description="Yumshoq yuza"
                              value={formData.secondaryColor}
                              onChange={(v) => update('secondaryColor', v)}
                            />
                            <PremiumColorField
                              label="Foreground"
                              description="Asosiy matn"
                              value={formData.foregroundColor}
                              onChange={(v) => update('foregroundColor', v)}
                            />
                          </div>
                        </SectionCard>

                        <SectionCard title="Gradient" description="Primary va accent asosida">
                          <div
                            className="h-16 rounded-xl border shadow-inner"
                            style={{
                              background: `linear-gradient(135deg, hsl(${formData.primaryColor}), hsl(${formData.accentColor}))`,
                            }}
                          />
                        </SectionCard>
                      </motion.div>
                    </TabsContent>

                    {/* TYPOGRAPHY */}
                    <TabsContent value="typo" key="typo" forceMount={activeTab === 'typo' ? true : undefined} className="mt-0 data-[state=inactive]:hidden">
                      <motion.div
                        variants={sectionVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-5"
                      >
                        <SectionCard title="Shrift oilasi" description="Butun sayt bo'ylab ishlatiladigan shrift">
                          <Select
                            value={formData.fontFamily}
                            onValueChange={(v) => update('fontFamily', v)}
                          >
                            <SelectTrigger className="h-11 rounded-xl bg-background/60">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FONT_OPTIONS.map((f) => (
                                <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                                  {f.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div
                            className="mt-4 rounded-xl border bg-card/60 p-5 space-y-2"
                            style={{ fontFamily: formData.fontFamily }}
                          >
                            <div className="text-2xl font-bold tracking-tight">Aa Bb Cc 123</div>
                            <div className="text-sm text-muted-foreground">
                              Tezkor jigarrang tulki dangasa itdan sakrab o'tdi
                            </div>
                          </div>
                        </SectionCard>
                      </motion.div>
                    </TabsContent>

                    {/* LAYOUT */}
                    <TabsContent value="layout" key="layout" forceMount={activeTab === 'layout' ? true : undefined} className="mt-0 data-[state=inactive]:hidden">
                      <motion.div
                        variants={sectionVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-5"
                      >
                        <SectionCard title="Burchak radiusi" description="Komponentlarning yumaloqlik darajasi">
                          <div className="grid grid-cols-6 gap-2">
                            {RADIUS_OPTIONS.map((opt) => (
                              <motion.button
                                key={opt.value}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                type="button"
                                onClick={() => update('borderRadius', opt.value)}
                                className={`flex flex-col items-center gap-1.5 p-2 border bg-card/60 transition-all ${
                                  formData.borderRadius === opt.value
                                    ? 'border-primary ring-2 ring-primary/20 shadow-md'
                                    : 'border-border hover:border-primary/40'
                                }`}
                                style={{ borderRadius: '0.75rem' }}
                              >
                                <div
                                  className="h-8 w-8 bg-primary/80"
                                  style={{ borderRadius: opt.value }}
                                />
                                <span className="text-[10px] font-medium">{opt.label}</span>
                              </motion.button>
                            ))}
                          </div>
                        </SectionCard>

                        <SectionCard title="Soya darajasi" description="Komponentlarning chuqurlik effekti">
                          <div className="grid grid-cols-4 gap-2">
                            {SHADOW_OPTIONS.map((opt) => (
                              <motion.button
                                key={opt.value}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                type="button"
                                onClick={() => update('shadowLevel', opt.value)}
                                className={`p-3 rounded-xl border bg-card/60 text-xs font-medium transition-all ${
                                  formData.shadowLevel === opt.value
                                    ? 'border-primary ring-2 ring-primary/20'
                                    : 'border-border hover:border-primary/40'
                                }`}
                              >
                                {opt.label}
                              </motion.button>
                            ))}
                          </div>
                        </SectionCard>
                      </motion.div>
                    </TabsContent>

                    {/* PRESETS */}
                    <TabsContent value="presets" key="presets" forceMount={activeTab === 'presets' ? true : undefined} className="mt-0 data-[state=inactive]:hidden">
                      <motion.div
                        variants={sectionVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-3"
                      >
                        <div className="text-xs text-muted-foreground mb-1">
                          Bir bosish bilan tayyor mavzular qo'llang
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {PRESETS.map((preset) => (
                            <motion.button
                              key={preset.name}
                              type="button"
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => applyPreset(preset.data)}
                              className="group rounded-2xl border bg-card/60 p-3 text-left hover:border-primary/40 hover:shadow-lg transition-all"
                            >
                              <div
                                className="h-20 rounded-xl mb-3 p-2 flex flex-col gap-1.5 overflow-hidden border"
                                style={{ background: `hsl(${preset.data.backgroundColor})` }}
                              >
                                <div
                                  className="h-2 rounded-full"
                                  style={{ background: `hsl(${preset.data.primaryColor})`, width: '70%' }}
                                />
                                <div
                                  className="h-2 rounded-full"
                                  style={{ background: `hsl(${preset.data.secondaryColor})`, width: '50%' }}
                                />
                                <div className="flex gap-1.5 mt-auto">
                                  <div
                                    className="h-5 flex-1 rounded-md"
                                    style={{ background: `hsl(${preset.data.accentColor})` }}
                                  />
                                  <div
                                    className="h-5 w-5 rounded-md"
                                    style={{ background: `hsl(${preset.data.foregroundColor})` }}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-semibold">{preset.name}</div>
                                  <div className="flex gap-1 mt-1">
                                    {[
                                      preset.data.primaryColor,
                                      preset.data.accentColor,
                                      preset.data.secondaryColor,
                                    ].map((c, i) => (
                                      <div
                                        key={i}
                                        className="h-3 w-3 rounded-full ring-1 ring-border"
                                        style={{ background: `hsl(${c})` }}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    </TabsContent>
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </Tabs>
          </div>

          {/* LIVE PREVIEW */}
          <div className="bg-gradient-to-br from-muted/40 via-background/40 to-muted/30 min-h-0 flex flex-col">
            <div className="flex items-center justify-between px-6 py-3 border-b border-border/60 bg-background/40 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-muted-foreground">Jonli ko'rinish</span>
              </div>
              <div className="flex items-center gap-1 rounded-lg border bg-background/60 p-0.5">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-md transition-all ${
                    previewDevice === 'desktop' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-md transition-all ${
                    previewDevice === 'mobile' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="p-6 flex justify-center">
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  className={`${
                    previewDevice === 'mobile' ? 'w-[380px]' : 'w-full max-w-[720px]'
                  } rounded-2xl border shadow-2xl overflow-hidden`}
                  style={previewStyle}
                >
                  <PreviewSurface formData={formData} />
                </motion.div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SectionCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-5 shadow-sm">
    <div className="mb-4">
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
    {children}
  </div>
);

const PreviewSurface = ({ formData }: { formData: ThemeFormData }) => {
  const radius = formData.borderRadius;
  return (
    <div style={{ background: 'var(--p-bg)', color: 'var(--p-fg)' }}>
      {/* Navbar */}
      <div
        className="flex items-center justify-between px-5 py-3.5 border-b"
        style={{ borderColor: 'var(--p-secondary)' }}
      >
        <div className="flex items-center gap-2" />
        <div className="flex items-center gap-3">
          <Search className="h-4 w-4 opacity-60" />
          <Bell className="h-4 w-4 opacity-60" />
          <div
            className="h-7 w-7"
            style={{ background: 'var(--p-secondary)', borderRadius: '999px' }}
          />
        </div>
      </div>

      {/* Hero */}
      <div className="px-5 py-6">
        <div className="text-[10px] font-semibold uppercase tracking-wider opacity-60 mb-2">
          Premium Collection
        </div>
        <h1 className="text-2xl font-bold tracking-tight leading-tight mb-2">
          Bugungi mavzuni jonli ko'ring
        </h1>
        <p className="text-sm opacity-70 mb-4 leading-relaxed">
          Har bir o'zgarish darhol bu yerda aks etadi — ranglar, shriftlar, radiuslar.
        </p>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 text-xs font-semibold transition-transform hover:scale-105"
            style={{
              background: 'var(--p-primary)',
              color: 'var(--p-bg)',
              borderRadius: radius,
            }}
          >
            Boshlash
          </button>
          <button
            className="px-4 py-2 text-xs font-semibold border transition-transform hover:scale-105"
            style={{
              borderColor: 'var(--p-secondary)',
              color: 'var(--p-fg)',
              borderRadius: radius,
            }}
          >
            Batafsil
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Buyurtmalar', value: '2,401', icon: ShoppingBag },
          { label: 'Mijozlar', value: '1,328', icon: User },
          { label: 'Reyting', value: '4.92', icon: Star },
        ].map((s, i) => (
          <div
            key={i}
            className="p-3 border"
            style={{
              background: 'var(--p-secondary)',
              borderColor: 'var(--p-secondary)',
              borderRadius: radius,
            }}
          >
            <s.icon className="h-3.5 w-3.5 mb-1.5 opacity-60" />
            <div className="text-base font-bold leading-none">{s.value}</div>
            <div className="text-[10px] opacity-60 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Card list */}
      <div className="p-5 space-y-2.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 border transition-transform hover:translate-x-1"
            style={{
              background: 'var(--p-bg)',
              borderColor: 'var(--p-secondary)',
              borderRadius: radius,
            }}
          >
            <div
              className="h-10 w-10 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, var(--p-primary), var(--p-accent))`,
                borderRadius: radius,
              }}
            >
              <Home className="h-4 w-4" style={{ color: 'var(--p-bg)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">Mahsulot nomi #{i}</div>
              <div className="text-[11px] opacity-60">Premium kategoriya · sotuvda</div>
            </div>
            <div
              className="px-2 py-1 text-[10px] font-bold"
              style={{
                background: 'var(--p-accent)',
                color: 'var(--p-bg)',
                borderRadius: radius,
              }}
            >
              YANGI
            </div>
          </div>
        ))}
      </div>

      {/* Typography preview */}
      <div className="px-5 pb-6">
        <div
          className="p-4 border"
          style={{
            background: 'var(--p-secondary)',
            borderColor: 'var(--p-secondary)',
            borderRadius: radius,
          }}
        >
          <div className="text-xs font-semibold opacity-70 mb-2">TYPOGRAPHY</div>
          <div className="text-xl font-bold leading-tight">Heading bold</div>
          <div className="text-sm font-medium mt-1">Subheading medium</div>
          <div className="text-xs opacity-70 mt-1.5 leading-relaxed">
            Body matn uchun nusxa. Inter va boshqa shriftlar bilan to'liq mos.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumThemeBuilder;
