import { useState, useEffect, useMemo } from 'react';

const CACHE: Record<string, any> = {};

export function useLocationData(countryName?: string, stateName?: string) {
  const [countries, setCountries] = useState<{value: string, label: string, code: string}[]>([]);
  const [countryData, setCountryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCountries() {
      if (CACHE.countries) {
        setCountries(CACHE.countries);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch('https://api.openadmindata.org/api/v1/countries.json');
        if (!res.ok) throw new Error("Failed to fetch countries");
        const data = await res.json();
        
        // Sort India to top, then alphabetical
        const sorted = data.countries.sort((a: any, b: any) => {
          if (a.name_en === "India") return -1;
          if (b.name_en === "India") return 1;
          return a.name_en.localeCompare(b.name_en);
        });

        const formatted = sorted.map((c: any) => ({
          value: c.name_en,
          label: c.name_en,
          code: c.code,
        }));
        CACHE.countries = formatted;
        setCountries(formatted);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!countryName || countries.length === 0) {
      setCountryData(null);
      return;
    }

    const countryObj = countries.find(c => c.value === countryName);
    if (!countryObj) {
      setCountryData(null);
      return;
    }

    async function fetchCountryData() {
      const code = countryObj.code;
      if (CACHE[code]) {
        setCountryData(CACHE[code]);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`https://api.openadmindata.org/api/v1/countries/${code}.json`);
        if (!res.ok) throw new Error("Failed to fetch country data");
        const data = await res.json();
        CACHE[code] = data;
        setCountryData(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCountryData();
  }, [countryName, countries]);

  const { states, districts, levels } = useMemo(() => {
    if (!countryData) return { states: [], districts: [], levels: { l1: 'State', l2: 'District' } };
    
    const metaLevels = countryData.meta.levels || [];
    const l1Key = metaLevels[0]?.key;
    const l2Key = metaLevels[1]?.key;
    
    const levels = {
      l1: metaLevels[0]?.name_en || 'State / Province',
      l2: metaLevels[1]?.name_en || 'District / County'
    };

    let states: any[] = [];
    if (l1Key && countryData.data[l1Key]) {
      states = countryData.data[l1Key].map((s: any) => ({
        value: s.name_en,
        label: s.name_en,
        id: s.id
      })).sort((a: any, b: any) => a.label.localeCompare(b.label));
    }

    let districts: any[] = [];
    if (stateName && l2Key && countryData.data[l2Key]) {
      const stObj = states.find(s => s.value === stateName);
      if (stObj) {
        districts = countryData.data[l2Key]
          .filter((d: any) => d.parent_id === stObj.id)
          .map((d: any) => ({
            value: d.name_en,
            label: d.name_en
          })).sort((a: any, b: any) => a.label.localeCompare(b.label));
      }
    }

    return { states, districts, levels };
  }, [countryData, stateName]);

  return { countries, states, districts, loading, error, levels };
}
