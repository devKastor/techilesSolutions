'use client'

import { useEffect, useState } from 'react'
import { fetchDashboardStats } from '@/lib/services/dashboard'
import type { DashboardStats } from '@/lib/types'
import AdminLayout from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Globe, Users, DollarSign, AlertTriangle, Cloud } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
      .then(data => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading || !stats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Total clients</CardTitle>
            <Users className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats.totalClients}</CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Clients actifs</CardTitle>
            <Users className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats.activeClients}</CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Revenu mensuel</CardTitle>
            <DollarSign className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats.monthlyRevenue}€</CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Tickets en attente</CardTitle>
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats.pendingTickets}</CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Factures en retard</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats.overdueInvoices}</CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Utilisation Cloud</CardTitle>
            <Cloud className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {stats.cloudUsagePercent.toFixed(1)}%
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
