'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useClientAuth } from '@/hooks/useClientAuth';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function SiteRequestForm() {
  const { user } = useClientAuth();
  const [form, setForm] = useState({
    businessName: '',
    objective: '',
    preferredColors: '',
    pages: '',
    tone: '',
    content: '',
    logoFile: null as File | null,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    if (name === 'logoFile') {
      setForm(prev => ({ ...prev, logoFile: files[0] }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    let logoUrl = '';

    try {
      if (form.logoFile) {
        const storageRef = ref(storage, `logos/${user.clientId}_${form.logoFile.name}`);
        const snap = await uploadBytes(storageRef, form.logoFile);
        logoUrl = await getDownloadURL(snap.ref);
      }

      await addDoc(collection(db, 'siteRequests'), {
        clientId: user.clientId,
        clientName: user.clientName,
        businessName: form.businessName,
        objective: form.objective,
        preferredColors: form.preferredColors,
        pages: form.pages.split(',').map(p => p.trim()),
        tone: form.tone,
        content: form.content,
        logoUrl: logoUrl || '',
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setForm({
        businessName: '',
        objective: '',
        preferredColors: '',
        pages: '',
        tone: '',
        content: '',
        logoFile: null,
      });
    } catch (err) {
      console.error('Erreur soumission site :', err);
      alert("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label>Nom de l’entreprise / du site</Label>
        <Input name="businessName" required value={form.businessName} onChange={handleChange} />
      </div>

      <div>
        <Label>Objectif du site</Label>
        <Textarea name="objective" required value={form.objective} onChange={handleChange} />
      </div>

      <div>
        <Label>Pages souhaitées (ex: Accueil, À propos, Contact)</Label>
        <Input name="pages" required value={form.pages} onChange={handleChange} />
      </div>

      <div>
        <Label>Ambiance / style / ton (ex: professionnel, chaleureux, fun)</Label>
        <Input name="tone" required value={form.tone} onChange={handleChange} />
      </div>

      <div>
        <Label>Couleurs ou style visuel préféré</Label>
        <Input name="preferredColors" value={form.preferredColors} onChange={handleChange} />
      </div>

      <div>
        <Label>Contenu fourni (textes bruts, messages clés)</Label>
        <Textarea name="content" value={form.content} onChange={handleChange} />
      </div>

      <div>
        <Label>Logo (optionnel)</Label>
        <Input name="logoFile" type="file" accept="image/*" onChange={handleChange} />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Envoi en cours...' : 'Soumettre ma demande'}
      </Button>

      {success && <p className="text-green-600">Votre demande a bien été enregistrée !</p>}
    </form>
  );
}
