import { 
  collection, 
  doc,
  getDoc,
  setDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PricingConfig {
  id: string;
  interventionHourlyRate: number;
  travelRate: number;
  urgentSurcharge: number;
  cloudStorageBase: number;
  cloudStoragePerGB: number;
  websiteVitrine: number;
  websitePME: number;
  websiteEcommerce: number;
  maintenanceBase: number;
  maintenanceStandard: number;
  maintenancePlus: number;
  maintenancePrestige: number;
  taxRate: number;
  updatedAt: Date;
  updatedBy: string;
}

export const pricingService = {
  // Obtenir la configuration de prix actuelle
  async getCurrentPricing(): Promise<{ pricing: PricingConfig | null, error: string | null }> {
    try {
      if (!db) {
        return { pricing: null, error: 'Firebase not configured' };
      }

      const docRef = doc(db, 'settings', 'pricing');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          pricing: {
            id: docSnap.id,
            ...data,
            updatedAt: data.updatedAt?.toDate(),
          } as PricingConfig,
          error: null
        };
      } else {
        // Retourner configuration par défaut
        const defaultPricing: PricingConfig = {
          id: 'pricing',
          interventionHourlyRate: 75,
          travelRate: 0.65,
          urgentSurcharge: 50,
          cloudStorageBase: 10,
          cloudStoragePerGB: 2,
          websiteVitrine: 25,
          websitePME: 60,
          websiteEcommerce: 90,
          maintenanceBase: 25,
          maintenanceStandard: 45,
          maintenancePlus: 75,
          maintenancePrestige: 120,
          taxRate: 15,
          updatedAt: new Date(),
          updatedBy: 'system'
        };

        return { pricing: defaultPricing, error: null };
      }
    } catch (error: any) {
      return { pricing: null, error: error.message };
    }
  },

  // Mettre à jour la configuration de prix
  async updatePricing(pricing: Omit<PricingConfig, 'id' | 'updatedAt'>, updatedBy: string): Promise<{ error: string | null }> {
    try {
      if (!db) {
        return { error: 'Firebase not configured' };
      }

      const docRef = doc(db, 'settings', 'pricing');
      await setDoc(docRef, {
        ...pricing,
        updatedAt: Timestamp.now(),
        updatedBy
      });

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Calculer le prix d'une intervention
  calculateInterventionPrice(
    durationMinutes: number, 
    travelKm: number = 0, 
    isUrgent: boolean = false,
    pricing?: PricingConfig
  ): { subtotal: number, travel: number, urgent: number, tax: number, total: number } {
    const config = pricing || {
      interventionHourlyRate: 75,
      travelRate: 0.65,
      urgentSurcharge: 50,
      taxRate: 15
    };

    const hours = durationMinutes / 60;
    const subtotal = hours * config.interventionHourlyRate;
    const travel = travelKm * config.travelRate;
    const urgent = isUrgent ? config.urgentSurcharge : 0;
    const beforeTax = subtotal + travel + urgent;
    const tax = beforeTax * (config.taxRate / 100);
    const total = beforeTax + tax;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      travel: Math.round(travel * 100) / 100,
      urgent: Math.round(urgent * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  },

  // Calculer le prix d'un forfait cloud
  calculateCloudPrice(storageGB: number, pricing?: PricingConfig): number {
    const config = pricing || {
      cloudStorageBase: 10,
      cloudStoragePerGB: 2
    };

    if (storageGB <= 50) {
      return config.cloudStorageBase;
    }

    const extraGB = storageGB - 50;
    return config.cloudStorageBase + (extraGB * config.cloudStoragePerGB);
  },

  // Obtenir le prix d'un forfait maintenance
  getMaintenancePrice(plan: 'base' | 'standard' | 'plus' | 'prestige', pricing?: PricingConfig): number {
    const config = pricing || {
      maintenanceBase: 25,
      maintenanceStandard: 45,
      maintenancePlus: 75,
      maintenancePrestige: 120
    };

    switch (plan) {
      case 'base':
        return config.maintenanceBase;
      case 'standard':
        return config.maintenanceStandard;
      case 'plus':
        return config.maintenancePlus;
      case 'prestige':
        return config.maintenancePrestige;
      default:
        return config.maintenanceBase;
    }
  },

  // Obtenir le prix d'un site web
  getWebsitePrice(type: 'vitrine' | 'pme' | 'ecommerce', pricing?: PricingConfig): number {
    const config = pricing || {
      websiteVitrine: 25,
      websitePME: 60,
      websiteEcommerce: 90
    };

    switch (type) {
      case 'vitrine':
        return config.websiteVitrine;
      case 'pme':
        return config.websitePME;
      case 'ecommerce':
        return config.websiteEcommerce;
      default:
        return config.websiteVitrine;
    }
  },

  // Générer un devis automatique
  async generateQuote(
    services: {
      intervention?: { durationMinutes: number, travelKm?: number, isUrgent?: boolean };
      cloud?: { storageGB: number };
      website?: { type: 'vitrine' | 'pme' | 'ecommerce' };
      maintenance?: { plan: 'base' | 'standard' | 'plus' | 'prestige' };
    }
  ): Promise<{ quote: any, error: string | null }> {
    try {
      const { pricing, error } = await this.getCurrentPricing();
      if (error || !pricing) {
        return { quote: null, error: error || 'Pricing not found' };
      }

      const quote = {
        items: [] as any[],
        subtotal: 0,
        tax: 0,
        total: 0,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        createdAt: new Date()
      };

      // Intervention
      if (services.intervention) {
        const interventionPrice = this.calculateInterventionPrice(
          services.intervention.durationMinutes,
          services.intervention.travelKm || 0,
          services.intervention.isUrgent || false,
          pricing
        );

        quote.items.push({
          type: 'intervention',
          description: `Intervention technique (${services.intervention.durationMinutes} min)`,
          price: interventionPrice.subtotal,
          details: {
            duration: services.intervention.durationMinutes,
            travel: interventionPrice.travel,
            urgent: interventionPrice.urgent
          }
        });

        quote.subtotal += interventionPrice.subtotal + interventionPrice.travel + interventionPrice.urgent;
      }

      // Cloud
      if (services.cloud) {
        const cloudPrice = this.calculateCloudPrice(services.cloud.storageGB, pricing);
        quote.items.push({
          type: 'cloud',
          description: `Sauvegarde cloud (${services.cloud.storageGB} GB)`,
          price: cloudPrice,
          recurring: 'monthly'
        });
        quote.subtotal += cloudPrice;
      }

      // Website
      if (services.website) {
        const websitePrice = this.getWebsitePrice(services.website.type, pricing);
        quote.items.push({
          type: 'website',
          description: `Site web ${services.website.type}`,
          price: websitePrice,
          recurring: 'monthly'
        });
        quote.subtotal += websitePrice;
      }

      // Maintenance
      if (services.maintenance) {
        const maintenancePrice = this.getMaintenancePrice(services.maintenance.plan, pricing);
        quote.items.push({
          type: 'maintenance',
          description: `Forfait maintenance ${services.maintenance.plan}`,
          price: maintenancePrice,
          recurring: 'monthly'
        });
        quote.subtotal += maintenancePrice;
      }

      quote.tax = quote.subtotal * (pricing.taxRate / 100);
      quote.total = quote.subtotal + quote.tax;

      return { quote, error: null };
    } catch (error: any) {
      return { quote: null, error: error.message };
    }
  }
};