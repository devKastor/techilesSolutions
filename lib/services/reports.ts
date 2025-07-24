import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ServiceTicket, Client, Invoice } from '@/lib/types';

export interface TechReport {
  id: string;
  ticketId: string;
  clientId: string;
  technicianId: string;
  reportType: 'intervention' | 'diagnostic' | 'maintenance' | 'installation';
  title: string;
  summary: string;
  workPerformed: string[];
  partsUsed: ReportPart[];
  timeSpent: number;
  issues: ReportIssue[];
  recommendations: string[];
  clientSignature?: string;
  technicianSignature: string;
  photos: string[];
  createdAt: Date;
  completedAt: Date;
}

export interface ReportPart {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  supplier?: string;
}

export interface ReportIssue {
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  solution?: string;
}

export const reportsService = {
  // Générer un rapport d'intervention automatique
  async generateInterventionReport(ticket: ServiceTicket, client: Client, workDetails: any) {
    try {
      if (!db) {
        return { reportId: null, error: 'Firebase not configured' };
      }

      const report: Omit<TechReport, 'id'> = {
        ticketId: ticket.id,
        clientId: ticket.clientId,
        technicianId: ticket.assignedTo || 'system',
        reportType: 'intervention',
        title: `Rapport d'intervention - ${ticket.title}`,
        summary: workDetails.summary || ticket.description,
        workPerformed: workDetails.workPerformed || [],
        partsUsed: workDetails.partsUsed || [],
        timeSpent: ticket.actualDuration || 0,
        issues: workDetails.issues || [],
        recommendations: workDetails.recommendations || [],
        technicianSignature: workDetails.technicianSignature || 'Signature électronique',
        photos: workDetails.photos || [],
        createdAt: new Date(),
        completedAt: ticket.resolvedAt || new Date()
      };

      const docRef = await addDoc(collection(db, 'reports'), {
        ...report,
        createdAt: Timestamp.fromDate(report.createdAt),
        completedAt: Timestamp.fromDate(report.completedAt)
      });

      // Générer le PDF du rapport
      const pdfUrl = await this.generateReportPDF(docRef.id, report, client);

      return { reportId: docRef.id, pdfUrl, error: null };
    } catch (error: any) {
      return { reportId: null, error: error.message };
    }
  },

  // Générer un rapport PDF
  async generateReportPDF(reportId: string, report: Omit<TechReport, 'id'>, client: Client) {
    try {
      // En production, utiliser une librairie comme jsPDF ou Puppeteer
      console.log('Generating PDF for report:', reportId);
      
      const pdfContent = this.createPDFContent(report, client);
      
      // Simuler la génération
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const pdfUrl = `/reports/${reportId}.pdf`;
      return pdfUrl;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return null;
    }
  },

  // Créer le contenu HTML du rapport
  createPDFContent(report: Omit<TechReport, 'id'>, client: Client) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rapport d'intervention - ${report.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .section { margin: 20px 0; }
        .client-info { background: #f5f5f5; padding: 15px; border-radius: 5px; }
        .work-details { margin: 15px 0; }
        .parts-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .parts-table th, .parts-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .parts-table th { background-color: #f2f2f2; }
        .signature-section { margin-top: 40px; display: flex; justify-content: space-between; }
        .signature-box { width: 200px; height: 80px; border: 1px solid #333; text-align: center; padding-top: 60px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>TechÎle Solutions</h1>
        <h2>Rapport d'intervention</h2>
        <p>Date: ${report.completedAt.toLocaleDateString('fr-CA')}</p>
    </div>

    <div class="section client-info">
        <h3>Informations client</h3>
        <p><strong>Nom:</strong> ${client.firstName} ${client.lastName}</p>
        <p><strong>Email:</strong> ${client.email}</p>
        <p><strong>Téléphone:</strong> ${client.phone || 'N/A'}</p>
        <p><strong>Adresse:</strong> ${client.address}, ${client.city}</p>
    </div>

    <div class="section">
        <h3>Détails de l'intervention</h3>
        <p><strong>Titre:</strong> ${report.title}</p>
        <p><strong>Type:</strong> ${report.reportType}</p>
        <p><strong>Durée:</strong> ${report.timeSpent} minutes</p>
        <p><strong>Résumé:</strong> ${report.summary}</p>
    </div>

    <div class="section work-details">
        <h3>Travaux effectués</h3>
        <ul>
            ${report.workPerformed.map(work => `<li>${work}</li>`).join('')}
        </ul>
    </div>

    ${report.partsUsed.length > 0 ? `
    <div class="section">
        <h3>Pièces utilisées</h3>
        <table class="parts-table">
            <thead>
                <tr>
                    <th>Pièce</th>
                    <th>Quantité</th>
                    <th>Prix unitaire</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${report.partsUsed.map(part => `
                    <tr>
                        <td>${part.name}</td>
                        <td>${part.quantity}</td>
                        <td>${part.unitPrice.toFixed(2)}$</td>
                        <td>${part.total.toFixed(2)}$</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    ${report.issues.length > 0 ? `
    <div class="section">
        <h3>Problèmes identifiés</h3>
        <ul>
            ${report.issues.map(issue => `
                <li>
                    <strong>${issue.description}</strong> 
                    (Sévérité: ${issue.severity}) 
                    - ${issue.resolved ? 'Résolu' : 'Non résolu'}
                    ${issue.solution ? `<br>Solution: ${issue.solution}` : ''}
                </li>
            `).join('')}
        </ul>
    </div>
    ` : ''}

    ${report.recommendations.length > 0 ? `
    <div class="section">
        <h3>Recommandations</h3>
        <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
    ` : ''}

    <div class="signature-section">
        <div>
            <p>Signature du technicien:</p>
            <div class="signature-box">${report.technicianSignature}</div>
        </div>
        <div>
            <p>Signature du client:</p>
            <div class="signature-box">${report.clientSignature || ''}</div>
        </div>
    </div>

    <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
        <p>TechÎle Solutions - Services informatiques aux Îles-de-la-Madeleine</p>
        <p>dev@kastor.ca - Rapport généré le ${new Date().toLocaleString('fr-CA')}</p>
    </div>
</body>
</html>
    `;
  },

  // Obtenir tous les rapports d'un client
  async getClientReports(clientId: string) {
    try {
      if (!db) {
        return { reports: [], error: 'Firebase not configured' };
      }

      const q = query(
        collection(db, 'reports'),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const reports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
      })) as TechReport[];

      return { reports, error: null };
    } catch (error: any) {
      return { reports: [], error: error.message };
    }
  },

  // Générer un rapport mensuel pour l'admin
  async generateMonthlyReport(year: number, month: number) {
    try {
      if (!db) {
        return { report: null, error: 'Firebase not configured' };
      }

      // Récupérer toutes les données du mois
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      // Simuler la génération du rapport mensuel
      const monthlyReport = {
        period: `${month}/${year}`,
        totalInterventions: 0,
        totalRevenue: 0,
        clientsServed: 0,
        averageResolutionTime: 0,
        topIssues: [],
        generatedAt: new Date()
      };

      return { report: monthlyReport, error: null };
    } catch (error: any) {
      return { report: null, error: error.message };
    }
  }
};