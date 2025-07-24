import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WebsiteProject } from '@/lib/types';

export const createWebsite = async (websiteData: Omit<WebsiteProject, 'id' | 'createdAt'>) => {
  try {
    if (!db) {
      return { id: null, error: 'Firebase not configured' };
    }
    
    const docRef = await addDoc(collection(db, 'websites'), {
      ...websiteData,
      createdAt: Timestamp.now(),
      launchedAt: websiteData.launchedAt ? Timestamp.fromDate(websiteData.launchedAt) : null,
    });
    
    // Générer automatiquement le site web avec Bolt
    try {
      await generateWebsiteWithBolt(docRef.id, websiteData);
    } catch (error) {
      console.error('Website generation error:', error);
    }
    
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const updateWebsite = async (websiteId: string, updates: Partial<WebsiteProject>) => {
  try {
    if (!db) {
      return { error: 'Firebase not configured' };
    }
    
    const updateData: any = { ...updates };
    
    if (updates.launchedAt) {
      updateData.launchedAt = Timestamp.fromDate(updates.launchedAt);
    }
    
    await updateDoc(doc(db, 'websites', websiteId), updateData);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getClientWebsites = async (clientId: string) => {
  try {
    if (!db) {
      return { websites: [], error: 'Firebase not configured' };
    }
    
    const q = query(
      collection(db, 'websites'),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const websites = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      launchedAt: doc.data().launchedAt?.toDate(),
    })) as WebsiteProject[];
    
    return { websites, error: null };
  } catch (error: any) {
    return { websites: [], error: error.message };
  }
};

export const getAllWebsites = async () => {
  try {
    if (!db) {
      return { websites: [], error: 'Firebase not configured' };
    }
    
    const q = query(collection(db, 'websites'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const websites = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      launchedAt: doc.data().launchedAt?.toDate(),
    })) as WebsiteProject[];
    
    return { websites, error: null };
  } catch (error: any) {
    return { websites: [], error: error.message };
  }
};

// Génération automatique de site web avec Bolt
const generateWebsiteWithBolt = async (websiteId: string, websiteData: Omit<WebsiteProject, 'id' | 'createdAt'>) => {
  try {
    // Template de base selon le type de site
    const templates = {
      vitrine: generateVitrineTemplate(websiteData),
      pme: generatePMETemplate(websiteData),
      ecommerce: generateEcommerceTemplate(websiteData)
    };
    
    const template = templates[websiteData.type];
    
    // Créer les fichiers du site web
    await createWebsiteFiles(websiteId, template, websiteData);
    
    // Mettre à jour le statut
    await updateWebsite(websiteId, {
      status: 'development',
      subdomain: generateSubdomain(websiteData.name)
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error generating website:', error);
    return { success: false, error };
  }
};

const generateVitrineTemplate = (data: any) => {
  return {
    'index.html': `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.content.companyName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        :root {
            --primary-color: ${data.content.colors.primary};
            --secondary-color: ${data.content.colors.secondary};
        }
    </style>
</head>
<body class="bg-white">
    <!-- Header -->
    <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-6">
                <h1 class="text-2xl font-bold" style="color: var(--primary-color)">${data.content.companyName}</h1>
                <nav class="hidden md:flex space-x-8">
                    <a href="#accueil" class="text-gray-600 hover:text-gray-900">Accueil</a>
                    <a href="#services" class="text-gray-600 hover:text-gray-900">Services</a>
                    <a href="#apropos" class="text-gray-600 hover:text-gray-900">À propos</a>
                    <a href="#contact" class="text-gray-600 hover:text-gray-900">Contact</a>
                </nav>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section id="accueil" class="py-20" style="background: linear-gradient(135deg, ${data.content.colors.primary}20, ${data.content.colors.secondary}20)">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">${data.content.companyName}</h2>
            <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">${data.content.description}</p>
            <a href="#contact" class="inline-block px-8 py-3 rounded-lg text-white font-semibold" style="background-color: var(--primary-color)">
                Nous contacter
            </a>
        </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="py-20 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Nos services</h2>
                <p class="text-xl text-gray-600">Découvrez ce que nous pouvons faire pour vous</p>
            </div>
            <!-- Services content will be added here -->
        </div>
    </section>

    <!-- About Section -->
    <section id="apropos" class="py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-8">À propos de nous</h2>
                <p class="text-lg text-gray-600 max-w-3xl mx-auto">${data.content.description}</p>
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="py-20 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Contactez-nous</h2>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                    <h3 class="text-xl font-semibold mb-4">Informations de contact</h3>
                    <div class="space-y-4">
                        <p><strong>Email:</strong> ${data.content.contact.email}</p>
                        ${data.content.contact.phone ? `<p><strong>Téléphone:</strong> ${data.content.contact.phone}</p>` : ''}
                        ${data.content.contact.address ? `<p><strong>Adresse:</strong> ${data.content.contact.address}</p>` : ''}
                    </div>
                </div>
                <div>
                    <form class="space-y-4" onsubmit="handleContactForm(event)">
                        <input type="text" placeholder="Votre nom" class="w-full p-3 border border-gray-300 rounded-lg" required>
                        <input type="email" placeholder="Votre email" class="w-full p-3 border border-gray-300 rounded-lg" required>
                        <textarea placeholder="Votre message" rows="4" class="w-full p-3 border border-gray-300 rounded-lg" required></textarea>
                        <button type="submit" class="w-full py-3 rounded-lg text-white font-semibold" style="background-color: var(--primary-color)">
                            Envoyer le message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2025 ${data.content.companyName}. Tous droits réservés.</p>
            <p class="mt-2 text-gray-400">Site créé par TechÎle Solutions</p>
        </div>
    </footer>

    <script>
        function handleContactForm(event) {
            event.preventDefault();
            alert('Merci pour votre message ! Nous vous contacterons bientôt.');
        }
    </script>
</body>
</html>`,
    'style.css': `/* Styles personnalisés pour ${data.content.companyName} */
:root {
    --primary-color: ${data.content.colors.primary};
    --secondary-color: ${data.content.colors.secondary};
}

.btn-primary {
    background-color: var(--primary-color);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    text-decoration: none;
    display: inline-block;
    transition: all 0.3s ease;
}

.btn-primary:hover {
    opacity: 0.9;
    transform: translateY(-2px);
}`
  };
};

const generatePMETemplate = (data: any) => {
  // Template plus complexe pour PME avec plusieurs pages
  return generateVitrineTemplate(data); // Simplifié pour l'exemple
};

const generateEcommerceTemplate = (data: any) => {
  // Template e-commerce avec panier
  return generateVitrineTemplate(data); // Simplifié pour l'exemple
};

const createWebsiteFiles = async (websiteId: string, template: any, websiteData: any) => {
  // Simulation de création de fichiers
  // En production, cela créerait les fichiers sur le serveur
  console.log(`Creating website files for ${websiteId}`, template);
  
  // Simuler un délai de génération
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return true;
};

const generateSubdomain = (name: string) => {
  return name.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};