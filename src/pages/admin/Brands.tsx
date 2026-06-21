import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Tag, Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePartnerBrands, partnersApi, PartnerBrand } from '@/hooks/usePartners';

export default function Brands() {
  const { brands, refetch } = usePartnerBrands(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PartnerBrand | null>(null);
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const openNew = () => { setEditing(null); setName(''); setLogoUrl(''); setSortOrder(''); setIsActive(true); setOpen(true); };
  const openEdit = (b: PartnerBrand) => { setEditing(b); setName(b.name); setLogoUrl(b.logo_url || ''); setSortOrder(b.sort_order != null ? String(b.sort_order) : ''); setIsActive(b.is_active ?? true); setOpen(true); };

  const handleUpload = async (file: File) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowed.includes(file.type)) { toast.error('Faqat JPG, PNG, WebP, SVG yoki GIF'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Rasm hajmi 5MB dan oshmasligi kerak'); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `brands/brand-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('product-images').upload(filePath, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
      setLogoUrl(publicUrl);
      toast.success('Logo yuklandi');
    } catch (e: any) {
      toast.error('Logo yuklanmadi: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!name.trim()) { toast.error('Brend nomini kiriting'); return; }
    const payload = { name: name.trim(), logo_url: logoUrl || null, sort_order: sortOrder ? parseInt(sortOrder, 10) : null, is_active: isActive };
    const { error } = editing
      ? await partnersApi.from('partner_brands').update(payload).eq('id', editing.id)
      : await partnersApi.from('partner_brands').insert(payload);
    if (error) { toast.error('Xatolik: ' + error.message); return; }
    toast.success(editing ? 'Yangilandi' : "Qo'shildi");
    setOpen(false); refetch();
  };

  const remove = async () => {
    if (!deleteId) return;
    const { error } = await partnersApi.from('partner_brands').delete().eq('id', deleteId);
    if (error) { toast.error('Xatolik: ' + error.message); return; }
    toast.success("O'chirildi"); setDeleteId(null); refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Brendlar</h1>
        <p className="text-muted-foreground text-sm">Hamkor brendlar va logotiplarni boshqaring</p>
      </div>

      <Button onClick={openNew}><Plus className="w-4 h-4 mr-1.5" /> Brend qo'shish</Button>

      <div className="grid gap-3">
        {brands.length === 0 && <p className="text-muted-foreground text-sm">Brendlar yo'q.</p>}
        {brands.map((b, i) => (
          <div key={b.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
              <span className="w-6 shrink-0 text-sm font-semibold text-muted-foreground">{i + 1}.</span>
              {b.logo_url ? (
                <img src={b.logo_url} alt={b.name} className="w-12 h-12 rounded-lg object-contain bg-muted" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <Tag className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <span className="font-medium">{b.name}</span>
              <Badge variant={b.is_active ? 'default' : 'secondary'}>{b.is_active ? 'Faol' : 'Nofaol'}</Badge>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => openEdit(b)}><Pencil className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => setDeleteId(b.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Brendni tahrirlash' : "Brend qo'shish"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Nomi</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: 3M" /></div>
            <div><Label>Tartib raqami</Label><Input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} placeholder="Masalan: 1" /><p className="text-xs text-muted-foreground mt-1">Kichik raqam birinchi ko'rsatiladi.</p></div>
            <div>
              <Label>Logo</Label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
              {logoUrl ? (
                <div className="relative mt-1 w-full h-40 rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
                  <img src={logoUrl} alt="Brend logosi" className="max-w-full max-h-full object-contain" />
                  <Button size="icon" variant="secondary" className="absolute top-2 right-2 h-8 w-8" onClick={() => setLogoUrl('')}>
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
                  <span className="text-sm">{uploading ? 'Yuklanmoqda...' : 'Logo yuklash'}</span>
                </button>
              )}
              <p className="text-xs text-muted-foreground mt-1">Logo bo'lmasa, brend nomi matn ko'rinishida ko'rsatiladi.</p>
            </div>
            <div className="flex items-center gap-2"><Switch checked={isActive} onCheckedChange={setIsActive} /><Label>Faol</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Bekor</Button><Button onClick={save} disabled={uploading}>Saqlash</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Brendni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>Bu amalni qaytarib bo'lmaydi. Brend butunlay o'chiriladi.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">O'chirish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
