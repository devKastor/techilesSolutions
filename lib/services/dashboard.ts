import { collection, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { DashboardStats, ServiceTicket, Invoice } from '@/lib/types'

// Types bruts renvoyés par Firestore pour typer doc.data()
interface ClientFirestore {
  status: string
  cloudQuota?: number
  cloudUsed?: number
  createdAt?: Timestamp
  lastActivity?: Timestamp
}

interface TicketFirestore {
  status: ServiceTicket['status']
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

interface InvoiceFirestore {
  status: Invoice['status']
  paidAt?: Timestamp
  createdAt?: Timestamp
  total?: number
}

/**
 * Récupère et calcule toutes les statistiques du dashboard
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  // --- Clients ---
  const clientsSnap = await getDocs(collection(db, 'clients'))
  // On ne mappe plus vers Client, mais vers un type interne juste pour les stats
  type ClientStat = {
    status: string
    cloudQuota: number
    cloudUsed: number
  }
  const clients: ClientStat[] = clientsSnap.docs.map(doc => {
    const d = doc.data() as ClientFirestore
    return {
      status: d.status,
      cloudQuota: d.cloudQuota ?? 0,
      cloudUsed: d.cloudUsed ?? 0
    }
  })

  const totalClients = clients.length
  const activeClients = clients.filter(c => c.status === 'active').length
  const totalCloudQuota = clients.reduce((sum, c) => sum + c.cloudQuota, 0)
  const totalCloudUsed = clients.reduce((sum, c) => sum + c.cloudUsed, 0)
  const cloudUsagePercent = totalCloudQuota > 0
    ? (totalCloudUsed / totalCloudQuota) * 100
    : 0

  // --- Tickets ---
  const ticketsSnap = await getDocs(collection(db, 'tickets'))
  const tickets: ServiceTicket[] = ticketsSnap.docs.map(doc => {
    const d = doc.data() as TicketFirestore
    return {
      id: doc.id,
      status: d.status,
      createdAt: d.createdAt?.toDate(),
      updatedAt: d.updatedAt?.toDate()
    } as ServiceTicket
  })
  const pendingTickets = tickets.filter(t =>
    t.status === 'open' || t.status === 'in_progress'
  ).length

  // --- Invoices ---
  const invoicesSnap = await getDocs(collection(db, 'invoices'))
  const invoices: Invoice[] = invoicesSnap.docs.map(doc => {
    const d = doc.data() as InvoiceFirestore
    return {
      id: doc.id,
      status: d.status,
      paidAt: d.paidAt?.toDate(),
      createdAt: d.createdAt?.toDate(),
      total: d.total ?? 0
    } as Invoice
  })
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length

  // --- Chiffre d'affaires mensuel ---
  const now = new Date()
  const monthlyRevenue = invoices
    .filter(i =>
      i.status === 'paid' &&
      i.paidAt &&
      i.paidAt.getMonth() === now.getMonth() &&
      i.paidAt.getFullYear() === now.getFullYear()
    )
    .reduce((sum, i) => sum + i.total, 0)

  return {
    totalClients,
    activeClients,
    monthlyRevenue,
    pendingTickets,
    overdueInvoices,
    cloudUsagePercent
  }
}
