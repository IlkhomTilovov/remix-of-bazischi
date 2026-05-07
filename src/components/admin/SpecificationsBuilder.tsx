import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  Trash2,
  GripVertical,
  Shield,
  Sun,
  Eye,
  Layers,
  Palette,
  Radio,
  Award,
  Ruler,
  Car,
  Thermometer,
  Sparkles,
  Zap,
  Snowflake,
  Wrench,
  Gauge,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface Specification {
  id: string;
  label: string;
  value: string;
  icon?: string;
}

export const SPEC_ICONS: Record<string, any> = {
  shield: Shield,
  sun: Sun,
  eye: Eye,
  layers: Layers,
  palette: Palette,
  radio: Radio,
  award: Award,
  ruler: Ruler,
  car: Car,
  thermometer: Thermometer,
  sparkles: Sparkles,
  zap: Zap,
  snowflake: Snowflake,
  wrench: Wrench,
  gauge: Gauge,
  shieldcheck: ShieldCheck,
  info: Info,
};

const ICON_OPTIONS = Object.keys(SPEC_ICONS);

const PRESETS: Omit<Specification, 'id'>[] = [
  { label: 'UV Himoya', value: '99%', icon: 'shield' },
  { label: 'IR Heat Rejection', value: '85%', icon: 'sun' },
  { label: 'VLT', value: '15%', icon: 'eye' },
  { label: 'Plyonka turi', value: 'Nano Ceramic', icon: 'layers' },
  { label: 'Rang', value: 'Deep Black', icon: 'palette' },
  { label: "Signalga ta'siri", value: "Yo'q", icon: 'radio' },
  { label: 'Kafolat', value: '5 yil', icon: 'award' },
  { label: 'Qalinligi', value: '2 mil', icon: 'ruler' },
  { label: "Qo'llanilish joyi", value: 'Avtomobil', icon: 'car' },
];

interface Props {
  value: Specification[];
  onChange: (specs: Specification[]) => void;
}

export function SpecificationsBuilder({ value, onChange }: Props) {
  const specs = value || [];

  const addSpec = (preset?: Omit<Specification, 'id'>) => {
    const newSpec: Specification = {
      id: crypto.randomUUID(),
      label: preset?.label || '',
      value: preset?.value || '',
      icon: preset?.icon || 'info',
    };
    onChange([...specs, newSpec]);
  };

  const updateSpec = (id: string, patch: Partial<Specification>) => {
    onChange(specs.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeSpec = (id: string) => {
    onChange(specs.filter((s) => s.id !== id));
  };

  const loadPresets = () => {
    const presetSpecs = PRESETS.map((p) => ({ ...p, id: crypto.randomUUID() }));
    onChange([...specs, ...presetSpecs]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Xususiyatlar</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Mahsulot uchun texnik ma'lumotlarni qo'shing
          </p>
        </div>
        <div className="flex gap-2">
          {specs.length === 0 && (
            <Button type="button" variant="outline" size="sm" onClick={loadPresets}>
              <Sparkles className="w-4 h-4 mr-1.5" />
              Namuna yuklash
            </Button>
          )}
          <Button type="button" size="sm" onClick={() => addSpec()}>
            <Plus className="w-4 h-4 mr-1.5" />
            Qo'shish
          </Button>
        </div>
      </div>

      {specs.length === 0 ? (
        <div className="border-2 border-dashed rounded-xl p-8 text-center">
          <Info className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">
            Hali xususiyatlar qo'shilmagan
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            "Qo'shish" yoki "Namuna yuklash" tugmasini bosing
          </p>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={specs}
          onReorder={onChange}
          className="space-y-2"
        >
          <AnimatePresence>
            {specs.map((spec) => {
              const IconComp = SPEC_ICONS[spec.icon || 'info'] || Info;
              return (
                <Reorder.Item
                  key={spec.id}
                  value={spec}
                  as="div"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-card border rounded-xl p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-2">
                    <div className="cursor-grab active:cursor-grabbing pt-2 text-muted-foreground/50 hover:text-foreground">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2">
                      {/* Icon */}
                      <div className="md:col-span-3">
                        <Select
                          value={spec.icon || 'info'}
                          onValueChange={(v) => updateSpec(spec.id, { icon: v })}
                        >
                          <SelectTrigger className="h-10">
                            <div className="flex items-center gap-2">
                              <IconComp className="w-4 h-4 text-primary" />
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {ICON_OPTIONS.map((key) => {
                              const I = SPEC_ICONS[key];
                              return (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    <I className="w-4 h-4" />
                                    <span className="capitalize">{key}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Label */}
                      <Input
                        className="md:col-span-5"
                        placeholder="Nomi (masalan: UV Himoya)"
                        value={spec.label}
                        onChange={(e) => updateSpec(spec.id, { label: e.target.value })}
                      />

                      {/* Value */}
                      <Input
                        className="md:col-span-4"
                        placeholder="Qiymat (masalan: 99%)"
                        value={spec.value}
                        onChange={(e) => updateSpec(spec.id, { value: e.target.value })}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="opacity-60 hover:opacity-100 hover:text-destructive"
                      onClick={() => removeSpec(spec.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Reorder.Item>
              );
            })}
          </AnimatePresence>
        </Reorder.Group>
      )}

      {specs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-4"
        >
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
            Frontend ko'rinishi
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {specs.map((spec) => {
              const IconComp = SPEC_ICONS[spec.icon || 'info'] || Info;
              return (
                <div
                  key={spec.id}
                  className="flex items-center gap-3 bg-background/60 backdrop-blur rounded-lg px-3 py-2 border"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IconComp className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate">
                      {spec.label || '—'}
                    </p>
                    <p className="text-sm font-semibold truncate">
                      {spec.value || '—'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
