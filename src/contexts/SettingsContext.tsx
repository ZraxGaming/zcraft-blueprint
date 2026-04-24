import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { siteConfig } from '@/config/siteEnv';
import { settingsService } from '@/services/settingsService';
import { ensureIntegrityPulse } from '@/lib/_ig';

export interface SettingsMap {
  maintenanceMode: boolean;
  announcementEnabled: boolean;
  announcementMessage: string | null;
  announcementImage: string | null;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  seo_image: string;
  seo_type: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoImage: string;
  seoType: string;
  home_seo_title: string;
  home_seo_description: string;
  home_seo_keywords: string;
  support_seo_title: string;
  support_seo_description: string;
  support_seo_keywords: string;
  appeal_seo_title: string;
  appeal_seo_description: string;
  appeal_seo_keywords: string;
  homeSeoTitle: string;
  homeSeoDescription: string;
  homeSeoKeywords: string;
  supportSeoTitle: string;
  supportSeoDescription: string;
  supportSeoKeywords: string;
  appealSeoTitle: string;
  appealSeoDescription: string;
  appealSeoKeywords: string;
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
    announcementImage: null,
    announcement_image: null,
    seo_title: siteConfig.seo.title,
    seo_description: siteConfig.seo.description,
    seo_keywords: siteConfig.seo.keywords,
    seo_image: siteConfig.seo.image,
    seo_type: siteConfig.seo.type,
    seoTitle: siteConfig.seo.title,
    seoDescription: siteConfig.seo.description,
    seoKeywords: siteConfig.seo.keywords,
    seoImage: siteConfig.seo.image,
    seoType: siteConfig.seo.type,
    home_seo_title: siteConfig.pageSeo.home.title,
    home_seo_description: siteConfig.pageSeo.home.description,
    home_seo_keywords: siteConfig.pageSeo.home.keywords,
    support_seo_title: siteConfig.pageSeo.support.title,
    support_seo_description: siteConfig.pageSeo.support.description,
    support_seo_keywords: siteConfig.pageSeo.support.keywords,
    appeal_seo_title: siteConfig.pageSeo.appeal.title,
    appeal_seo_description: siteConfig.pageSeo.appeal.description,
    appeal_seo_keywords: siteConfig.pageSeo.appeal.keywords,
    homeSeoTitle: siteConfig.pageSeo.home.title,
    homeSeoDescription: siteConfig.pageSeo.home.description,
    homeSeoKeywords: siteConfig.pageSeo.home.keywords,
    supportSeoTitle: siteConfig.pageSeo.support.title,
    supportSeoDescription: siteConfig.pageSeo.support.description,
    supportSeoKeywords: siteConfig.pageSeo.support.keywords,
    appealSeoTitle: siteConfig.pageSeo.appeal.title,
    appealSeoDescription: siteConfig.pageSeo.appeal.description,
    appealSeoKeywords: siteConfig.pageSeo.appeal.keywords,
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
    seo_title: map['seo_title'] || siteConfig.seo.title,
    seo_description: map['seo_description'] || siteConfig.seo.description,
    seo_keywords: map['seo_keywords'] || siteConfig.seo.keywords,
    seo_image: map['seo_image'] || siteConfig.seo.image,
    seo_type: map['seo_type'] || siteConfig.seo.type,
    seoTitle: map['seo_title'] || siteConfig.seo.title,
    seoDescription: map['seo_description'] || siteConfig.seo.description,
    seoKeywords: map['seo_keywords'] || siteConfig.seo.keywords,
    seoImage: map['seo_image'] || siteConfig.seo.image,
    seoType: map['seo_type'] || siteConfig.seo.type,
    home_seo_title: map['home_seo_title'] || siteConfig.pageSeo.home.title,
    home_seo_description: map['home_seo_description'] || siteConfig.pageSeo.home.description,
    home_seo_keywords: map['home_seo_keywords'] || siteConfig.pageSeo.home.keywords,
    support_seo_title: map['support_seo_title'] || siteConfig.pageSeo.support.title,
    support_seo_description: map['support_seo_description'] || siteConfig.pageSeo.support.description,
    support_seo_keywords: map['support_seo_keywords'] || siteConfig.pageSeo.support.keywords,
    appeal_seo_title: map['appeal_seo_title'] || siteConfig.pageSeo.appeal.title,
    appeal_seo_description: map['appeal_seo_description'] || siteConfig.pageSeo.appeal.description,
    appeal_seo_keywords: map['appeal_seo_keywords'] || siteConfig.pageSeo.appeal.keywords,
    homeSeoTitle: map['home_seo_title'] || siteConfig.pageSeo.home.title,
    homeSeoDescription: map['home_seo_description'] || siteConfig.pageSeo.home.description,
    homeSeoKeywords: map['home_seo_keywords'] || siteConfig.pageSeo.home.keywords,
    supportSeoTitle: map['support_seo_title'] || siteConfig.pageSeo.support.title,
    supportSeoDescription: map['support_seo_description'] || siteConfig.pageSeo.support.description,
    supportSeoKeywords: map['support_seo_keywords'] || siteConfig.pageSeo.support.keywords,
    appealSeoTitle: map['appeal_seo_title'] || siteConfig.pageSeo.appeal.title,
    appealSeoDescription: map['appeal_seo_description'] || siteConfig.pageSeo.appeal.description,
    appealSeoKeywords: map['appeal_seo_keywords'] || siteConfig.pageSeo.appeal.keywords,
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

        setSettings(
          normalizeSettings({
            maintenance_mode: maintenanceMode || 'false',
            announcement_enabled: announcementEnabled || 'false',
            announcement_message: announcementMessage || '',
            announcement_image: announcementImage || '',
          })
        );
      } catch (fallbackErr) {
        console.error('Failed to load fallback settings:', fallbackErr);
        setSettings(normalizeSettings({}));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ensureIntegrityPulse();
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
