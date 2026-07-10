# 🔐 Configuration Google OAuth 2.0

## 📋 Étapes pour configurer l'authentification Google

### 1. Créer un projet Google Cloud

1. Allez sur https://console.cloud.google.com/
2. Connectez-vous avec votre compte Google
3. Cliquez sur "Sélectionner un projet" → "Nouveau projet"
4. Nommez le projet (ex: "Auto Documents Generator")
5. Cliquez sur "Créer"

### 2. Activer l'API Google+

1. Dans le menu latéral, allez dans **APIs & Services** → **Library**
2. Recherchez "Google+ API"
3. Cliquez sur "Google+ API" puis sur **Enable**

### 3. Créer les identifiants OAuth 2.0

1. Allez dans **APIs & Services** → **Credentials**
2. Cliquez sur **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Si c'est la première fois, configurez l'écran de consentement :
   - **User Type** : External (ou Internal si vous avez Google Workspace)
   - **App name** : Auto Documents Generator
   - **User support email** : Votre email
   - **Developer contact** : Votre email
   - Cliquez sur **Save and Continue**
   - Scopes : Gardez les valeurs par défaut, cliquez sur **Save and Continue**
   - Test users : Ajoutez votre email si nécessaire
   - Cliquez sur **Back to Dashboard**

4. Créer l'OAuth Client ID :
   - **Application type** : Web application
   - **Name** : Auto Documents Generator Web Client
   - **Authorized JavaScript origins** :
     ```
     http://localhost:3001
     http://localhost:5175
     ```
   - **Authorized redirect URIs** :
     ```
     http://localhost:3001/api/auth/google/callback
     ```
   - Cliquez sur **Create**

5. **Copiez les identifiants** :
   - **Client ID** : (ex: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
   - **Client Secret** : (ex: `GOCSPX-abcdefghijklmnopqrstuvwxyz`)

### 4. Configurer le backend

Éditez le fichier `.env` dans le dossier `backend/` :

```bash
cd backend
nano .env
```

Ajoutez ou modifiez ces lignes :

```env
GOOGLE_CLIENT_ID=votre-client-id-ici
GOOGLE_CLIENT_SECRET=votre-client-secret-ici
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

### 5. Redémarrer le backend

```bash
pkill -f "node src/server.js"
npm start
```

### 6. Tester la connexion

1. Ouvrez http://localhost:5175/login
2. Cliquez sur "Continuer avec Google"
3. Vous serez redirigé vers Google pour vous connecter
4. Après autorisation, vous serez redirigé vers le dashboard

## 🔧 Configuration pour la production

Pour la production, vous devez :

1. **Mettre à jour les URIs autorisées** dans Google Cloud Console :
   - **Authorized JavaScript origins** :
     ```
     https://votre-domaine.com
     ```
   - **Authorized redirect URIs** :
     ```
     https://votre-domaine.com/api/auth/google/callback
     ```

2. **Mettre à jour `.env`** :
   ```env
   GOOGLE_CALLBACK_URL=https://votre-domaine.com/api/auth/google/callback
   FRONTEND_URL=https://votre-domaine.com
   ```

## 🐛 Dépannage

### Erreur "redirect_uri_mismatch"
- Vérifiez que l'URI de callback dans `.env` correspond exactement à celle dans Google Cloud Console
- L'URI doit être identique (y compris http/https, port, trailing slash)

### Erreur "invalid_client"
- Vérifiez que le Client ID et Client Secret sont corrects
- Vérifiez qu'ils ne contiennent pas d'espaces supplémentaires

### Le bouton Google ne fonctionne pas
- Vérifiez que `GOOGLE_CLIENT_ID` est défini dans `.env`
- Vérifiez les logs du backend pour voir les erreurs
- Assurez-vous que le backend est démarré

## 📝 Notes importantes

- ⚠️ **Ne partagez jamais votre Client Secret** publiquement
- 🔒 Le Client Secret doit rester secret
- ✅ En développement, vous pouvez utiliser `http://localhost`
- 🌐 En production, vous devez utiliser `https://`

