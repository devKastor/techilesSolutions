# TechÎle Solutions - Plateforme de Gestion

## Configuration Firebase Requise

Cette application nécessite une configuration Firebase complète. Voici les étapes :

### 1. Créer un projet Firebase
1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet
3. Activez Authentication et Firestore Database

### 2. Configuration des variables d'environnement
Créez un fichier `.env.local` avec vos clés Firebase :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Règles de sécurité Firestore
Dans Firebase Console > Firestore Database > Rules, utilisez ces règles :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // RÈGLES TEMPORAIRES POUR LE DÉVELOPPEMENT (À SÉCURISER EN PRODUCTION)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    /* RÈGLES DE PRODUCTION (à utiliser une fois l'app configurée) :
    // Règles pour les utilisateurs
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
    
    // Règles pour les clients (admin seulement)
    match /clients/{clientId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Règles pour les tickets
    match /tickets/{ticketId} {
      allow read, write: if request.auth != null && (
        resource.data.clientId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
      allow create: if request.auth != null;
    }
    
    // Règles pour les factures
    match /invoices/{invoiceId} {
      allow read: if request.auth != null && (
        resource.data.clientId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    */
  }
}
```

### 4. Configuration Authentication
Dans Firebase Console > Authentication > Sign-in method :
- Activez "Email/Password"
- Désactivez "Email link (passwordless sign-in)" si activé

## Erreurs courantes

### "Missing or insufficient permissions"
Cette erreur indique que les règles Firestore ne sont pas configurées correctement. Assurez-vous d'avoir appliqué les règles ci-dessus.

### "Firebase not configured"
Vérifiez que toutes les variables d'environnement sont correctement définies dans `.env.local`.

## Démarrage

```bash
npm install
npm run dev
```

L'application sera disponible sur http://localhost:3000

## Comptes par défaut

### Accès CRM Administrateur

**Compte admin par défaut :**
- Email : `dev@kastor.ca`
- Mot de passe : (à définir lors de l'inscription)

**Étapes pour accéder au CRM :**
1. Allez sur `http://localhost:3000/auth/register`
2. Créez un compte avec l'email `dev@kastor.ca` (sera automatiquement admin)
3. Connectez-vous sur `http://localhost:3000/auth/login`
4. Vous serez redirigé vers `http://localhost:3000/admin` (CRM)

### Accès Client
- Tout autre email sera automatiquement un compte client
- Redirection vers `http://localhost:3000/client`

### Accès Technicien
- Depuis le CRM admin : bouton "Mode Technicien"
- URL directe : `http://localhost:3000/technician`