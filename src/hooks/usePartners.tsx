import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PartnerRegion {
  id: string;
  name: string;
  image_url?: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  created_at?: string;
  updated_at?: string;
  district_count?: number;
  workshop_count?: number;
}

export interface PartnerDistrict {
  id: string;
  region_id: string;
  name: string;
  sort_order: number | null;
  is_active: boolean | null;
  created_at?: string;
  updated_at?: string;
  workshop_count?: number;
}

export interface PartnerWorkshop {
  id: string;
  district_id: string;
  name: string;
  phone: string | null;
  address: string | null;
  experience_years: number | null;
  description: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  created_at?: string;
  updated_at?: string;
}

// untyped client to support tables not yet in generated types
const db = supabase as any;

export function usePartnerRegions(activeOnly = true) {
  const [regions, setRegions] = useState<PartnerRegion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRegions = useCallback(async () => {
    setLoading(true);
    try {
      let q = db.from('partner_regions').select('*').order('sort_order', { ascending: true }).order('name', { ascending: true });
      if (activeOnly) q = q.eq('is_active', true);
      const { data, error } = await q;
      if (error) throw error;
      const regionsData = (data || []) as PartnerRegion[];
      // fetch district counts per region
      let dq = db.from('partner_districts').select('id, region_id');
      if (activeOnly) dq = dq.eq('is_active', true);
      const { data: districtsData } = await dq;
      const counts: Record<string, number> = {};
      const districtToRegion: Record<string, string> = {};
      (districtsData || []).forEach((d: any) => {
        counts[d.region_id] = (counts[d.region_id] || 0) + 1;
        districtToRegion[d.id] = d.region_id;
      });
      // fetch workshop counts per region (via districts)
      const districtIds = Object.keys(districtToRegion);
      const workshopCounts: Record<string, number> = {};
      if (districtIds.length) {
        let wq = db.from('partner_workshops').select('district_id').in('district_id', districtIds);
        if (activeOnly) wq = wq.eq('is_active', true);
        const { data: workshopsData } = await wq;
        (workshopsData || []).forEach((w: any) => {
          const regionId = districtToRegion[w.district_id];
          if (regionId) workshopCounts[regionId] = (workshopCounts[regionId] || 0) + 1;
        });
      }
      setRegions(regionsData.map((r) => ({ ...r, district_count: counts[r.id] || 0, workshop_count: workshopCounts[r.id] || 0 })));
    } catch (e) {
      console.error('Error fetching regions:', e);
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => { fetchRegions(); }, [fetchRegions]);

  return { regions, loading, refetch: fetchRegions };
}

export function usePartnerRegion(id: string | undefined) {
  const [region, setRegion] = useState<PartnerRegion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const { data } = await db.from('partner_regions').select('*').eq('id', id).maybeSingle();
      setRegion(data as PartnerRegion | null);
      setLoading(false);
    })();
  }, [id]);

  return { region, loading };
}

export function usePartnerDistricts(regionId: string | undefined, activeOnly = true) {
  const [districts, setDistricts] = useState<PartnerDistrict[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDistricts = useCallback(async () => {
    if (!regionId) { setDistricts([]); setLoading(false); return; }
    setLoading(true);
    try {
      let q = db.from('partner_districts').select('*').eq('region_id', regionId).order('sort_order', { ascending: true }).order('name', { ascending: true });
      if (activeOnly) q = q.eq('is_active', true);
      const { data, error } = await q;
      if (error) throw error;
      const districtsData = (data || []) as PartnerDistrict[];
      // fetch workshop counts per district
      const ids = districtsData.map((d) => d.id);
      let counts: Record<string, number> = {};
      if (ids.length) {
        let wq = db.from('partner_workshops').select('district_id').in('district_id', ids);
        if (activeOnly) wq = wq.eq('is_active', true);
        const { data: workshopsData } = await wq;
        (workshopsData || []).forEach((w: any) => {
          counts[w.district_id] = (counts[w.district_id] || 0) + 1;
        });
      }
      setDistricts(districtsData.map((d) => ({ ...d, workshop_count: counts[d.id] || 0 })));
    } catch (e) {
      console.error('Error fetching districts:', e);
    } finally {
      setLoading(false);
    }
  }, [regionId, activeOnly]);

  useEffect(() => { fetchDistricts(); }, [fetchDistricts]);

  return { districts, loading, refetch: fetchDistricts };
}

export function usePartnerDistrict(id: string | undefined) {
  const [district, setDistrict] = useState<PartnerDistrict | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const { data } = await db.from('partner_districts').select('*').eq('id', id).maybeSingle();
      setDistrict(data as PartnerDistrict | null);
      setLoading(false);
    })();
  }, [id]);

  return { district, loading };
}

export function usePartnerWorkshops(districtId: string | undefined, activeOnly = true) {
  const [workshops, setWorkshops] = useState<PartnerWorkshop[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkshops = useCallback(async () => {
    if (!districtId) { setWorkshops([]); setLoading(false); return; }
    setLoading(true);
    try {
      let q = db.from('partner_workshops').select('*').eq('district_id', districtId).order('sort_order', { ascending: true }).order('name', { ascending: true });
      if (activeOnly) q = q.eq('is_active', true);
      const { data, error } = await q;
      if (error) throw error;
      setWorkshops((data || []) as PartnerWorkshop[]);
    } catch (e) {
      console.error('Error fetching workshops:', e);
    } finally {
      setLoading(false);
    }
  }, [districtId, activeOnly]);

  useEffect(() => { fetchWorkshops(); }, [fetchWorkshops]);

  return { workshops, loading, refetch: fetchWorkshops };
}

export function usePartnerWorkshop(id: string | undefined) {
  const [workshop, setWorkshop] = useState<PartnerWorkshop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const { data } = await db.from('partner_workshops').select('*').eq('id', id).maybeSingle();
      setWorkshop(data as PartnerWorkshop | null);
      setLoading(false);
    })();
  }, [id]);

  return { workshop, loading };
}

export interface PartnerBrand {
  id: string;
  name: string;
  logo_url: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  created_at?: string;
  updated_at?: string;
}

export function usePartnerBrands(activeOnly = true) {
  const [brands, setBrands] = useState<PartnerBrand[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      let q = db.from('partner_brands').select('*').order('sort_order', { ascending: true }).order('name', { ascending: true });
      if (activeOnly) q = q.eq('is_active', true);
      const { data, error } = await q;
      if (error) throw error;
      setBrands((data || []) as PartnerBrand[]);
    } catch (e) {
      console.error('Error fetching brands:', e);
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  return { brands, loading, refetch: fetchBrands };
}

export const partnersApi = db;
