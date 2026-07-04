import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, MapPin, Wrench, Store, Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  usePartnerRegions, usePartnerDistricts, usePartnerAllDistricts, usePartnerWorkshops, partnersApi,
  PartnerRegion, PartnerDistrict, PartnerWorkshop,
} from '@/hooks/usePartners';

export default function Partners() {
  const { regions, refetch: refetchRegions } = usePartnerRegions(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const { districts, refetch: refetchDistricts } = usePartnerDistricts(selectedRegion || undefined, false);
  const { districts: allDistricts, refetch: refetchAllDistricts } = usePartnerAllDistricts(false);
  const { workshops, refetch: refetchWorkshops } = usePartnerWorkshops(selectedDistrict || undefined, false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ustaxonalar</h1>
        <p className="text-muted-foreground text-sm">Viloyat, tuman va ustaxonalarni boshqaring</p>
      </div>

      <Tabs defaultValue="regions">
        <TabsList>
          <TabsTrigger value="regions"><MapPin className="w-4 h-4 mr-1.5" /> Viloyatlar</TabsTrigger>
          <TabsTrigger value="districts"><Wrench className="w-4 h-4 mr-1.5" /> Tumanlar</TabsTrigger>
          <TabsTrigger value="workshops"><Store className="w-4 h-4 mr-1.5" /> Ustaxonalar</TabsTrigger>
        </TabsList>

        <TabsContent value="regions" className="mt-6">
          <RegionsTab regions={regions} refetch={refetchRegions} />
        </TabsContent>

        <TabsContent value="districts" className="mt-6">
          <DistrictsTab
            regions={regions}
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            districts={selectedRegion ? districts : allDistricts}
            refetch={() => { refetchDistricts(); refetchAllDistricts(); }}
          />
        </TabsContent>

        <TabsContent value="workshops" className="mt-6">
          <WorkshopsTab
            regions={regions}
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            districts={districts}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            workshops={workshops}
            refetch={refetchWorkshops}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------- Regions ---------------- */
function RegionsTab({ regions, refetch }: { regions: PartnerRegion[]; refetch: () => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PartnerRegion | null>(null);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewingRegionId, setViewingRegionId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { districts: regionDistricts } = usePartnerDistricts(viewingRegionId || undefined, false);
  const viewingRegion = regions.find((r) => r.id === viewingRegionId);

  const openNew = () => { setEditing(null); setName(''); setImageUrl(''); setSortOrder(''); setIsActive(true); setOpen(true); };
  const openEdit = (r: PartnerRegion) => { setEditing(r); setName(r.name); setImageUrl(r.image_url || ''); setSortOrder(r.sort_order != null ? String(r.sort_order) : ''); setIsActive(r.is_active ?? true); setOpen(true); };

  const handleUpload = async (file: File) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) { toast.error('Faqat JPG, PNG, WebP yoki GIF'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Rasm hajmi 5MB dan oshmasligi kerak'); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `regions/region-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('product-images').upload(filePath, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
      setImageUrl(publicUrl);
      toast.success('Rasm yuklandi');
    } catch (e: any) {
      toast.error('Rasm yuklanmadi: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!name.trim()) { toast.error('Viloyat nomini kiriting'); return; }
    const payload = { name: name.trim(), image_url: imageUrl || null, sort_order: sortOrder ? parseInt(sortOrder, 10) : null, is_active: isActive };
    const { error } = editing
      ? await partnersApi.from('partner_regions').update(payload).eq('id', editing.id)
      : await partnersApi.from('partner_regions').insert(payload);
    if (error) { toast.error('Xatolik: ' + error.message); return; }
    toast.success(editing ? 'Yangilandi' : "Qo'shildi");
    setOpen(false); refetch();
  };

  const remove = async () => {
    if (!deleteId) return;
    const { error } = await partnersApi.from('partner_regions').delete().eq('id', deleteId);
    if (error) { toast.error('Xatolik: ' + error.message); return; }
    toast.success("O'chirildi"); setDeleteId(null); refetch();
  };

  return (
    <div className="space-y-4">
      <Button onClick={openNew}><Plus className="w-4 h-4 mr-1.5" /> Viloyat qo'shish</Button>
      <div className="grid gap-3">
        {regions.length === 0 && <p className="text-muted-foreground text-sm">Viloyatlar yo'q.</p>}
        {regions.map((r, i) => (
          <div
            key={r.id}
            onClick={() => setViewingRegionId(r.id)}
            className="flex items-center justify-between rounded-lg border bg-card p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-wrap">
              <span className="w-6 shrink-0 text-sm font-semibold text-muted-foreground">{i + 1}.</span>
              {r.image_url ? (
                <img src={r.image_url} alt={r.name} className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <span className="font-medium">{r.name}</span>
              <Badge variant={r.is_active ? 'default' : 'secondary'}>{r.is_active ? 'Faol' : 'Nofaol'}</Badge>
              {(r.district_count ?? 0) > 0 ? (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                  {(r.district_count ?? 0)} ta tuman
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  0 ta tuman
                </Badge>
              )}
            </div>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => setDeleteId(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Viloyatni tahrirlash' : "Viloyat qo'shish"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Nomi</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Toshkent viloyati" /></div>
            <div><Label>Tartib raqami</Label><Input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} placeholder="Masalan: 1" /><p className="text-xs text-muted-foreground mt-1">Kichik raqam birinchi ko'rsatiladi.</p></div>
            <div>
              <Label>Rasm</Label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
              {imageUrl ? (
                <div className="relative mt-1 w-full h-40 rounded-lg overflow-hidden border">
                  <img src={imageUrl} alt="Viloyat rasmi" className="w-full h-full object-cover" />
                  <Button size="icon" variant="secondary" className="absolute top-2 right-2 h-8 w-8" onClick={() => setImageUrl('')}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="mt-1 w-full h-40 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                  <span className="text-sm">{uploading ? 'Yuklanmoqda...' : 'Rasm yuklash'}</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2"><Switch checked={isActive} onCheckedChange={setIsActive} /><Label>Faol</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Bekor</Button><Button onClick={save} disabled={uploading}>Saqlash</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingRegionId} onOpenChange={(v) => !v && setViewingRegionId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewingRegion?.name || 'Viloyat'} — Tumanlar</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto py-2">
            {regionDistricts.length === 0 && (
              <p className="text-muted-foreground text-sm">Tumanlar yo'q.</p>
            )}
            {regionDistricts.map((d, i) => (
              <div key={d.id} className="flex items-center gap-3 rounded-lg border p-3">
                <span className="w-6 shrink-0 text-sm font-semibold text-muted-foreground">{i + 1}.</span>
                <Wrench className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{d.name}</p>
                </div>
                <Badge variant={d.is_active ? 'default' : 'secondary'}>{d.is_active ? 'Faol' : 'Nofaol'}</Badge>
                {(d.workshop_count ?? 0) > 0 ? (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                    {(d.workshop_count ?? 0)} ta ustaxona
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    0 ta ustaxona
                  </Badge>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingRegionId(null)}>Yopish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirm open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)} onConfirm={remove} />
    </div>
  );
}

/* ---------------- Districts ---------------- */
function DistrictsTab({ regions, selectedRegion, setSelectedRegion, districts, refetch }: {
  regions: PartnerRegion[]; selectedRegion: string; setSelectedRegion: (v: string) => void;
  districts: PartnerDistrict[]; refetch: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PartnerDistrict | null>(null);
  const [name, setName] = useState('');
  const [regionId, setRegionId] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [viewingDistrictId, setViewingDistrictId] = useState<string | null>(null);

  const { workshops: districtWorkshops, loading: workshopsLoading } = usePartnerWorkshops(viewingDistrictId || undefined, false);
  const viewingDistrict = districts.find((d) => d.id === viewingDistrictId);

  const filteredDistricts = districts.filter((d) =>
    d.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const openNew = () => { setEditing(null); setName(''); setRegionId(selectedRegion || ''); setSortOrder(''); setIsActive(true); setOpen(true); };
  const openEdit = (d: PartnerDistrict) => { setEditing(d); setName(d.name); setRegionId(d.region_id); setSortOrder(d.sort_order != null ? String(d.sort_order) : ''); setIsActive(d.is_active ?? true); setOpen(true); };

  const save = async () => {
    if (!regionId) { toast.error('Viloyatni tanlang'); return; }
    if (!name.trim()) { toast.error('Tuman nomini kiriting'); return; }
    const payload = { name: name.trim(), region_id: regionId, sort_order: sortOrder ? parseInt(sortOrder, 10) : null, is_active: isActive };
    const { error } = editing
      ? await partnersApi.from('partner_districts').update(payload).eq('id', editing.id)
      : await partnersApi.from('partner_districts').insert(payload);
    if (error) { toast.error('Xatolik: ' + error.message); return; }
    toast.success(editing ? 'Yangilandi' : "Qo'shildi");
    setOpen(false); refetch();
  };

  const remove = async () => {
    if (!deleteId) return;
    const { error } = await partnersApi.from('partner_districts').delete().eq('id', deleteId);
    if (error) { toast.error('Xatolik: ' + error.message); return; }
    toast.success("O'chirildi"); setDeleteId(null); refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <Select value={selectedRegion || 'all'} onValueChange={(v) => setSelectedRegion(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full sm:w-64"><SelectValue placeholder="Barcha viloyatlar" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha viloyatlar</SelectItem>
            {regions.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tuman nomi bo'yicha qidirish..."
          className="w-full sm:w-64"
        />
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-1.5" /> Tuman qo'shish</Button>
      </div>

      <div className="grid gap-3">
        {filteredDistricts.length === 0 && <p className="text-muted-foreground text-sm">Tumanlar yo'q.</p>}
        {filteredDistricts.map((d, i) => {
          const regionName = regions.find((r) => r.id === d.region_id)?.name;
          return (
            <div
              key={d.id}
              onClick={() => setViewingDistrictId(d.id)}
              className="flex items-center justify-between rounded-lg border bg-card p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-wrap">
                <span className="w-6 shrink-0 text-sm font-semibold text-muted-foreground">{i + 1}.</span>
                <Wrench className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{d.name}</span>
                {regionName && <Badge variant="outline">{regionName}</Badge>}
                <Badge variant={d.is_active ? 'default' : 'secondary'}>{d.is_active ? 'Faol' : 'Nofaol'}</Badge>
                {(d.workshop_count ?? 0) > 0 ? (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                    {(d.workshop_count ?? 0)} ta ustaxona
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    0 ta ustaxona
                  </Badge>
                )}
              </div>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button size="icon" variant="ghost" onClick={() => openEdit(d)}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => setDeleteId(d.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Tumanni tahrirlash' : "Tuman qo'shish"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Viloyat</Label>
              <Select value={regionId} onValueChange={setRegionId}>
                <SelectTrigger><SelectValue placeholder="Viloyatni tanlang" /></SelectTrigger>
                <SelectContent>{regions.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Nomi</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Chilonzor tumani" /></div>
            <div><Label>Tartib raqami</Label><Input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} placeholder="Masalan: 1" /><p className="text-xs text-muted-foreground mt-1">Kichik raqam birinchi ko'rsatiladi.</p></div>
            <div className="flex items-center gap-2"><Switch checked={isActive} onCheckedChange={setIsActive} /><Label>Faol</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Bekor</Button><Button onClick={save}>Saqlash</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingDistrictId} onOpenChange={(v) => !v && setViewingDistrictId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewingDistrict?.name || 'Tuman'} — Ustaxonalar</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto py-2">
            {workshopsLoading && <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>}
            {!workshopsLoading && districtWorkshops.length === 0 && (
              <p className="text-muted-foreground text-sm">Ustaxonalar yo'q.</p>
            )}
            {!workshopsLoading && districtWorkshops.map((w, i) => (
              <div key={w.id} className="flex items-center gap-3 rounded-lg border p-3">
                <span className="w-6 shrink-0 text-sm font-semibold text-muted-foreground">{i + 1}.</span>
                <Store className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{w.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {w.phone} {w.experience_years ? `· ${w.experience_years} yil` : ''}
                  </p>
                </div>
                <Badge variant={w.is_active ? 'default' : 'secondary'}>{w.is_active ? 'Faol' : 'Nofaol'}</Badge>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingDistrictId(null)}>Yopish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirm open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)} onConfirm={remove} />
    </div>
  );
}

/* ---------------- Workshops ---------------- */
function WorkshopsTab({ regions, selectedRegion, setSelectedRegion, districts, selectedDistrict, setSelectedDistrict, workshops, refetch }: {
  regions: PartnerRegion[]; selectedRegion: string; setSelectedRegion: (v: string) => void;
  districts: PartnerDistrict[]; selectedDistrict: string; setSelectedDistrict: (v: string) => void;
  workshops: PartnerWorkshop[]; refetch: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PartnerWorkshop | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '', experience_years: '', description: '', sort_order: '', is_active: true });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const reset = () => setForm({ name: '', phone: '', address: '', experience_years: '', description: '', sort_order: '', is_active: true });
  const openNew = () => { setEditing(null); reset(); setOpen(true); };
  const openEdit = (w: PartnerWorkshop) => {
    setEditing(w);
    setForm({
      name: w.name, phone: w.phone || '', address: w.address || '',
      experience_years: w.experience_years != null ? String(w.experience_years) : '',
      description: w.description || '',
      sort_order: w.sort_order != null ? String(w.sort_order) : '',
      is_active: w.is_active ?? true,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!selectedDistrict) { toast.error('Tumanni tanlang'); return; }
    if (!form.name.trim()) { toast.error('Ustaxona nomini kiriting'); return; }
    const payload = {
      district_id: selectedDistrict,
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      experience_years: form.experience_years ? parseInt(form.experience_years, 10) : null,
      description: form.description.trim() || null,
      sort_order: form.sort_order ? parseInt(form.sort_order, 10) : null,
      is_active: form.is_active,
    };
    const { error } = editing
      ? await partnersApi.from('partner_workshops').update(payload).eq('id', editing.id)
      : await partnersApi.from('partner_workshops').insert(payload);
    if (error) { toast.error('Xatolik: ' + error.message); return; }
    toast.success(editing ? 'Yangilandi' : "Qo'shildi");
    setOpen(false); refetch();
  };

  const remove = async () => {
    if (!deleteId) return;
    const { error } = await partnersApi.from('partner_workshops').delete().eq('id', deleteId);
    if (error) { toast.error('Xatolik: ' + error.message); return; }
    toast.success("O'chirildi"); setDeleteId(null); refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center flex-wrap">
        <Select value={selectedRegion} onValueChange={(v) => { setSelectedRegion(v); setSelectedDistrict(''); }}>
          <SelectTrigger className="w-full sm:w-56"><SelectValue placeholder="Viloyat" /></SelectTrigger>
          <SelectContent>{regions.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedRegion}>
          <SelectTrigger className="w-full sm:w-56"><SelectValue placeholder="Tuman" /></SelectTrigger>
          <SelectContent>{districts.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
        </Select>
        <Button onClick={openNew} disabled={!selectedDistrict}><Plus className="w-4 h-4 mr-1.5" /> Ustaxona qo'shish</Button>
      </div>

      {!selectedDistrict ? (
        <p className="text-muted-foreground text-sm">Ustaxonalarni ko'rish uchun viloyat va tumanni tanlang.</p>
      ) : (
        <div className="grid gap-3">
          {workshops.length === 0 && <p className="text-muted-foreground text-sm">Ustaxonalar yo'q.</p>}
          {workshops.map((w, i) => (
            <div key={w.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 shrink-0 text-sm font-semibold text-muted-foreground">{i + 1}.</span>
                <Store className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{w.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{w.phone} {w.experience_years ? `· ${w.experience_years} yil` : ''}</p>
                </div>
                <Badge variant={w.is_active ? 'default' : 'secondary'}>{w.is_active ? 'Faol' : 'Nofaol'}</Badge>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => openEdit(w)}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => setDeleteId(w.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Ustaxonani tahrirlash' : "Ustaxona qo'shish"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto">
            <div><Label>Nomi</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Telefon raqami</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+998 90 123 45 67" /></div>
            <div><Label>Manzil</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div><Label>Tajriba (yil)</Label><Input type="number" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} /></div>
            <div><Label>Tavsif</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Tartib raqami</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} placeholder="Masalan: 1" /><p className="text-xs text-muted-foreground mt-1">Kichik raqam birinchi ko'rsatiladi.</p></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>Faol</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Bekor</Button><Button onClick={save}>Saqlash</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirm open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)} onConfirm={remove} />
    </div>
  );
}

function DeleteConfirm({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (v: boolean) => void; onConfirm: () => void }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>O'chirishni tasdiqlang</AlertDialogTitle>
          <AlertDialogDescription>Bu amalni qaytarib bo'lmaydi. Bog'liq ma'lumotlar ham o'chiriladi.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Bekor</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>O'chirish</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
