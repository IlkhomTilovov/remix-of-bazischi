import { useEffect, useState } from 'react';
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
  Save,
  FolderOpen,
  Loader2,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Specification {
  id: string;
  label: string;
  value: string;
  icon?: string;
}

interface SpecTemplate {
  id: string;
  name: string;
  specs: Specification[];
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
  const [templates, setTemplates] = useState<SpecTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    const { data, error } = await (supabase as any)
      .from('spec_templates')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setTemplates(
        data.map((t: any) => ({ id: t.id, name: t.name, specs: t.specs || [] }))
      );
    }
    setLoadingTemplates(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

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

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error('Shablon nomini kiriting');
      return;
    }
    if (specs.length === 0) {
      toast.error("Saqlash uchun xususiyatlar yo'q");
      return;
    }
    setSaving(true);
    const cleanSpecs = specs.map((s) => ({
      id: s.id,
      label: s.label,
      value: s.value,
      icon: s.icon || 'info',
    }));
    const { error } = await (supabase as any).from('spec_templates').insert({
      name: templateName.trim(),
      specs: cleanSpecs,
    });
    setSaving(false);
    if (error) {
      toast.error('Saqlashda xatolik: ' + error.message);
      return;
    }
    toast.success('Shablon saqlandi');
    setTemplateName('');
    setSaveOpen(false);
    fetchTemplates();
  };

  const handleLoadTemplate = (tpl: SpecTemplate, mode: 'replace' | 'append') => {
    const loaded = (tpl.specs || []).map((s) => ({
      ...s,
      id: crypto.randomUUID(),
      icon: s.icon || 'info',
    }));
    onChange(mode === 'replace' ? loaded : [...specs, ...loaded]);
    toast.success(`"${tpl.name}" yuklandi`);
    setLoadOpen(false);
  };

  const handleDeleteTemplate = async () => {
    if (!deleteId) return;
    const { error } = await (supabase as any)
      .from('spec_templates')
      .delete()
      .eq('id', deleteId);
    if (error) {
      toast.error("O'chirishda xatolik");
      return;
    }
    toast.success("Shablon o'chirildi");
    setDeleteId(null);
    fetchTemplates();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Label className="text-base font-semibold">Xususiyatlar</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Mahsulot uchun texnik ma'lumotlarni qo'shing
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLoadOpen(true)}
          >
            <FolderOpen className="w-4 h-4 mr-1.5" />
            Shablonlar ({templates.length})
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSaveOpen(true)}
            disabled={specs.length === 0}
          >
            <Save className="w-4 h-4 mr-1.5" />
            Shablon sifatida saqlash
          </Button>
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
            "Shablonlar"dan tanlang yoki "Qo'shish" tugmasini bosing
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

                      <Input
                        className="md:col-span-5"
                        placeholder="Nomi (masalan: UV Himoya)"
                        value={spec.label}
                        onChange={(e) => updateSpec(spec.id, { label: e.target.value })}
                      />

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

      {/* Save Template Dialog */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shablon sifatida saqlash</DialogTitle>
            <DialogDescription>
              Joriy {specs.length} ta xususiyatni keyinchalik qayta ishlatish uchun nom bilan saqlang.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Shablon nomi</Label>
            <Input
              placeholder="Masalan: Avtomobil tanirovkasi"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleSaveTemplate} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Template Dialog */}
      <Dialog open={loadOpen} onOpenChange={setLoadOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Saqlangan shablonlar</DialogTitle>
            <DialogDescription>
              Shablonni tanlang — joriy xususiyatlar ustiga qo'shish yoki almashtirish.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-2">
            {loadingTemplates ? (
              <div className="py-8 text-center text-muted-foreground">
                <Loader2 className="w-5 h-5 mx-auto animate-spin" />
              </div>
            ) : templates.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Hali shablonlar saqlanmagan
              </div>
            ) : (
              templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="border rounded-xl p-3 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{tpl.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {tpl.specs.length} ta xususiyat
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {tpl.specs.slice(0, 5).map((s, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                          >
                            {s.label}: {s.value}
                          </span>
                        ))}
                        {tpl.specs.length > 5 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            +{tpl.specs.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleLoadTemplate(tpl, 'replace')}
                      >
                        Almashtirish
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLoadTemplate(tpl, 'append')}
                      >
                        Qo'shish
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(tpl.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Shablonni o'chirish?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu amalni qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
