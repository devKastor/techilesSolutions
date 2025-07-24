'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast-utils';
import { TicketPriority, ServiceTicket } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type TicketFormData = {
  type: ServiceTicket['type'];
  priority: TicketPriority;
  title: string;
  description: string;
  urgentRequest: boolean;
};


export default function NewTicketPage() {
  const router = useRouter();
  const [ticketData, setTicketData] = useState<TicketFormData>({
    type: 'intervention',
    priority: 'normal',
    title: '',
    description: '',
    urgentRequest: false,
  });

  const handleSubmit = async () => {
    try {
      let priority: TicketPriority = ticketData.priority;
      if (ticketData.urgentRequest) {
        priority = 'urgent';
      }

      const newTicket: ServiceTicket = {
        id: uuidv4(),
        clientId: 'demo-client-id', // à remplacer dynamiquement
        title: ticketData.title,
        description: ticketData.description,
        type: ticketData.type,
        priority,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, 'tickets'), {
        ...newTicket,
        createdAt: Timestamp.fromDate(newTicket.createdAt),
        updatedAt: Timestamp.fromDate(newTicket.updatedAt),
      });

    toast.success('Ticket créé avec succès');


      router.push('/admin/tickets');
    } catch (error) {
	  toast.error('Échec de création du ticket');
	}
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Nouveau Ticket</h1>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Titre"
          value={ticketData.title}
          onChange={(e) => setTicketData({ ...ticketData, title: e.target.value })}
          className="w-full border px-4 py-2 rounded"
        />

        <textarea
          placeholder="Description"
          value={ticketData.description}
          onChange={(e) => setTicketData({ ...ticketData, description: e.target.value })}
          className="w-full border px-4 py-2 rounded"
        />

        <div className="flex gap-2">
          {['intervention', 'support', 'billing', 'general'].map((type) => (
            <button
              key={type}
              onClick={() => setTicketData({ ...ticketData, type: type as ServiceTicket['type'] })}
              className={`px-4 py-2 rounded border ${
                ticketData.type === type ? 'bg-blue-500 text-white' : 'bg-white border-gray-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={ticketData.urgentRequest}
              onChange={(e) =>
                setTicketData({ ...ticketData, urgentRequest: e.target.checked })
              }
            />
            Demande urgente
          </label>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Créer le ticket
        </button>
      </div>
    </div>
  );
}
