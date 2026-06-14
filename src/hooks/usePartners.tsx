import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PartnerRegion {
  id: string;
  name: string;
  sort_order: number | null;
  is_active: boolean | null;
  created_at?: string;
  updated_at?: string;
  district_count?: number;
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
      setRegions((data || []) as PartnerRegion[]);
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
      setDistricts((data || []) as PartnerDistrict[]);
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

export const partnersApi = db;
