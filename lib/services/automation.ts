import { notificationService } from './notifications';
import { updateClient } from './clients';
import { updateTicket } from './tickets';
import { updateInvoice } from './invoices';
import { cloudService } from './cloud';
import { reportsService } from './reports'
import { Invoice } from '@/lib/types'



export const automationService = {
  // Automatisation lors de la création d'un client
  async onClientCreated(clientId: string, clientData: any) {
    try {
      // 1. Créer automatiquement le dossier cloud
      try {
        const { folderId, error: folderError } = await cloudService.createClientFolder(
          clientId, 
          `${clientData.firstName}_${clientData.lastName}`
        );

        if (folderError) {
          console.error('Error creating client folder:', folderError);
        }
      } catch (error) {
        console.error('Cloud service error:', error);
      }

      // 2. Envoyer notification de bienvenue
      await notificationService.createNotification({
        userId: clientId,
        type: 'system',
        title: 'Bienvenue chez TechÎle Solutions !',
        message: 'Votre compte a été créé avec succès. Votre espace cloud est maintenant disponible.',
        actionUrl: '/client'
      });

      // 3. Programmer la première sauvegarde automatique
      setTimeout(() => {
        this.scheduleAutoBackup(clientId);
      }, 24 * 60 * 60 * 1000); // 24h après création

      return { success: true };
    } catch (error) {
      console.error('Error in client creation automation:', error);
      return { success: false, error };
    }
  },

  // Automatisation lors de la mise à jour d'un ticket
  async onTicketStatusChanged(ticketId: string, oldStatus: string, newStatus: string, ticketData: any) {
    try {
      // 1. Notifier le client du changement de statut
      await notificationService.notifyTicketUpdate(
        ticketId,
        ticketData.clientId,
        newStatus,
        ticketData.title
      );

      // 2. Si le ticket est résolu, générer automatiquement le rapport
      if (newStatus === 'resolved' && oldStatus !== 'resolved') {
        const client = await this.getClientById(ticketData.clientId);
        if (client) {
          await reportsService.generateInterventionReport(ticketData, client, {
            summary: ticketData.completionNotes || 'Intervention complétée',
            workPerformed: ['Intervention technique réalisée'],
            technicianSignature: 'Signature électronique TechÎle'
          });
        }

        // 3. Créer automatiquement une facture si nécessaire
        if (ticketData.type === 'intervention' && ticketData.actualDuration) {
          await this.createAutoInvoice(ticketData);
        }
      }

      // 4. Programmer une intervention de suivi si nécessaire
      if (newStatus === 'resolved' && ticketData.type === 'intervention') {
        setTimeout(() => {
          this.scheduleFollowUp(ticketData.clientId, ticketId);
        }, 7 * 24 * 60 * 60 * 1000); // 7 jours après résolution
      }

      return { success: true };
    } catch (error) {
      console.error('Error in ticket status automation:', error);
      return { success: false, error };
    }
  },

  // Automatisation des factures en retard
  async processOverdueInvoices() {
    try {
      // Cette fonction serait appelée quotidiennement par un cron job
      console.log('Processing overdue invoices...');

      // Simuler la récupération des factures en retard
      const overdueInvoices: Invoice[] = []; // Récupérer depuis la base de données

      for (const invoice of overdueInvoices) {
        // Marquer comme en retard
        await updateInvoice(invoice.id, { status: 'overdue' });

        // Notifier le client
        await notificationService.notifyInvoiceDue(
          invoice.clientId,
          invoice.invoiceNumber,
          invoice.total,
          invoice.dueDate
        );

        // Envoyer un email de rappel (simulation)
        console.log(`Sending overdue notice for invoice ${invoice.invoiceNumber}`);
      }

      return { success: true, processed: overdueInvoices.length };
    } catch (error) {
      console.error('Error processing overdue invoices:', error);
      return { success: false, error };
    }
  },

  // Sauvegarde automatique programmée
  async scheduleAutoBackup(clientId: string) {
    try {
      console.log(`Scheduling auto backup for client ${clientId}`);

      // Simuler la création d'une sauvegarde automatique
      const backupData = {
        size: Math.floor(Math.random() * 1000000000), // Taille aléatoire
        checksum: 'auto_' + Date.now()
      };

      console.log('Creating auto backup for client:', clientId);
      const fileId = 'backup_' + Date.now();
      const error = null;

      if (!error && fileId) {
        // Notifier le client
        await notificationService.createNotification({
          userId: clientId,
          type: 'system',
          title: 'Sauvegarde automatique complétée',
          message: 'Votre sauvegarde automatique a été créée avec succès.',
          actionUrl: '/client/cloud'
        });

        // Programmer la prochaine sauvegarde (hebdomadaire)
        setTimeout(() => {
          this.scheduleAutoBackup(clientId);
        }, 7 * 24 * 60 * 60 * 1000);
      }

      return { success: true, fileId };
    } catch (error) {
      console.error('Error in auto backup:', error);
      return { success: false, error };
    }
  },

  // Suivi automatique post-intervention
  async scheduleFollowUp(clientId: string, originalTicketId: string) {
    try {
      console.log(`Scheduling follow-up for client ${clientId}`);

      // Créer automatiquement un ticket de suivi
      const followUpTicket = {
        clientId,
        title: 'Suivi d\'intervention automatique',
        description: `Suivi automatique de l'intervention précédente (Ticket #${originalTicketId}). Comment se passe le fonctionnement depuis notre intervention ?`,
        type: 'support' as const,
        priority: 'low' as const,
        status: 'open' as const,
      };

      // Cette fonction créerait le ticket de suivi
      console.log('Creating follow-up ticket:', followUpTicket);

      // Notifier le client
      await notificationService.createNotification({
        userId: clientId,
        type: 'system',
        title: 'Suivi de votre intervention',
        message: 'Comment se passe le fonctionnement depuis notre dernière intervention ? N\'hésitez pas à nous contacter si vous avez des questions.',
        actionUrl: '/client/tickets'
      });

      return { success: true };
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      return { success: false, error };
    }
  },

  // Création automatique de facture
  async createAutoInvoice(ticketData: any) {
    try {
      const hourlyRate = 75; // Tarif horaire par défaut
      const amount = (ticketData.actualDuration / 60) * hourlyRate; // Convertir minutes en heures
      const tax = amount * 0.15; // 15% de taxes

      const invoiceData = {
        clientId: ticketData.clientId,
        invoiceNumber: `AUTO-${Date.now()}`,
        amount,
        tax,
        total: amount + tax,
        description: `Intervention: ${ticketData.title}`,
        items: [{
          description: `Intervention technique - ${ticketData.actualDuration} minutes`,
          quantity: 1,
          unitPrice: amount,
          total: amount
        }],
        status: 'draft' as const,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      };

      console.log('Creating auto invoice:', invoiceData);
      // Cette fonction créerait la facture automatiquement

      return { success: true };
    } catch (error) {
      console.error('Error creating auto invoice:', error);
      return { success: false, error };
    }
  },

  // Maintenance préventive automatique
  async schedulePreventiveMaintenance() {
    try {
      console.log('Running preventive maintenance checks...');

      // 1. Vérifier l'espace disque des clients
      // 2. Vérifier les sauvegardes manquées
      // 3. Identifier les clients inactifs
      // 4. Générer des rapports de santé système

      // Simulation
      const maintenanceResults = {
        clientsChecked: 0,
        issuesFound: 0,
        notificationsSent: 0
      };

      return { success: true, results: maintenanceResults };
    } catch (error) {
      console.error('Error in preventive maintenance:', error);
      return { success: false, error };
    }
  },

  // Fonction utilitaire pour récupérer un client
  async getClientById(clientId: string) {
    // Cette fonction récupérerait le client depuis la base de données
    // Implémentation simplifiée
    return null;
  }
};

// Planificateur de tâches automatiques
export const taskScheduler = {
  // Démarrer tous les processus automatiques
  startAutomation() {
    console.log('Starting TechÎle Solutions automation...');

    // Vérifier les factures en retard tous les jours à 9h
    this.scheduleDaily('09:00', () => {
      automationService.processOverdueInvoices();
    });

    // Maintenance préventive tous les dimanches à 2h
    this.scheduleWeekly('sunday', '02:00', () => {
      automationService.schedulePreventiveMaintenance();
    });

    // Synchronisation cloud toutes les heures
    this.scheduleHourly(() => {
      console.log('Running cloud sync...');
    });
  },

  scheduleDaily(time: string, callback: () => void) {
    console.log(`Scheduled daily task at ${time}`);
    // Implémentation avec setInterval ou cron
  },

  scheduleWeekly(day: string, time: string, callback: () => void) {
    console.log(`Scheduled weekly task on ${day} at ${time}`);
    // Implémentation avec setInterval ou cron
  },

  scheduleHourly(callback: () => void) {
    console.log('Scheduled hourly task');
    // Implémentation avec setInterval
    setInterval(callback, 60 * 60 * 1000); // Toutes les heures
  }
};