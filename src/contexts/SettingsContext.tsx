import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { settingsService } from '@/services/settingsService';

export interface SettingsMap {
  maintenanceMode: boolean;
  announcementEnabled: boolean;
  announcementMessage: string | null;
  announcementImage: string | null;
  [key: string]: any;
}

const SettingsContext = createContext<{ settings: SettingsMap | null; loading: boolean; refresh: () => Promise<void> } | undefined>(undefined);
const fallbackSettingsContext = {
  settings: {
    maintenanceMode: false,
    maintenance_mode: 'false',
    announcementEnabled: false,
    announcement_enabled: 'false',
    announcementMessage: null,
    announcement_message: null,
    seo_title: 'ZCraft Network — Premium Minecraft Lifesteal & Skyblock SMP Server',
    seo_description: 'Join ZCraft Network, the ultimate Minecraft network with Lifesteal and Skyblock SMP, survival gameplay, custom economy, factions, and active community events.',
    seo_keywords: 'zcraft, zcraft network, minecraft server, minecraft lifesteal, skyblock, lifesteal skyblock, minecraft survival, minecraft factions, minecraft economy, minecraft pvp, minecraft smp, best minecraft server',
    seo_image: '/zcraft.png',
    seo_type: 'website',
  } as SettingsMap,
  loading: false,
  refresh: async () => {},
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsMap | null>(null);
  const [loading, setLoading] = useState(true);

  const normalizeSettings = (map: Record<string, string>) => ({
    ...map,
    maintenanceMode: map['maintenance_mode'] === 'true',
    maintenance_mode: map['maintenance_mode'] || 'false',
    announcementEnabled: map['announcement_enabled'] === 'true',
    announcement_enabled: map['announcement_enabled'] || 'false',
    announcementMessage: map['announcement_message'] || null,
    announcement_message: map['announcement_message'] || null,
    announcementImage: map['announcement_image'] || null,
    announcement_image: map['announcement_image'] || null,
    seo_title: map['seo_title'] || 'ZCraft Network — Premium Minecraft Lifesteal & Skyblock SMP Server',
    seo_description: map['seo_description'] || 'Join ZCraft Network, the ultimate Minecraft network with Lifesteal and Skyblock SMP, survival gameplay, custom economy, factions, and active community events.',
    seo_keywords: map['seo_keywords'] || 'zcraft, zcraft network, minecraft server, minecraft lifesteal, skyblock, lifesteal skyblock, minecraft survival, minecraft factions, minecraft economy, minecraft pvp, minecraft smp, best minecraft server',
    seo_image: map['seo_image'] || '/zcraft.png',
    seo_type: map['seo_type'] || 'website',
  });

  const load = async () => {
    setLoading(true);
    try {
      const rows = await settingsService.getSettings();
      const map: Record<string, string> = {};
      rows.forEach((r: any) => (map[r.key] = r.value));

      setSettings(normalizeSettings(map));
    } catch (err) {
      console.error('Failed to load settings:', err);
      try {
        const [maintenanceMode, announcementEnabled, announcementMessage, announcementImage] = await Promise.all([
          settingsService.getSetting('maintenance_mode'),
          settingsService.getSetting('announcement_enabled'),
          settingsService.getSetting('announcement_message'),
          settingsService.getSetting('announcement_image'),
        ]);

        setSettings(normalizeSettings({
          maintenance_mode: maintenanceMode || 'false',
          announcement_enabled: announcementEnabled || 'false',
          announcement_message: announcementMessage || '',
          announcement_image: announcementImage || '',
        }));
      } catch (fallbackErr) {
        console.error('Failed to load fallback settings:', fallbackErr);
        setSettings(normalizeSettings({}));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh: load }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    console.warn('useSettings was called outside SettingsProvider. Returning fallback settings.');
    return fallbackSettingsContext;
  }
  return ctx;
}

export default SettingsProvider;
