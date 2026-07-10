# 🚀 Configuration Rapide Google OAuth

## ⚡ Étapes Express (5 minutes)

### 1. Créer les identifiants Google (3 min)

1. **Allez sur** : https://console.cloud.google.com/
2. **Créez un projet** :
   - Cliquez sur "Sélectionner un projet" → "Nouveau projet"
   - Nom : `Auto Documents Generator`
   - Cliquez "Créer"

3. **Activez l'API** :
   - Menu → **APIs & Services** → **Library**
   - Recherchez "Google+ API"
   - Cliquez "Enable"

4. **Créez OAuth Client ID** :
   - **APIs & Services** → **Credentials**
   - **+ CREATE CREDENTIALS** → **OAuth client ID**
   - Si première fois, configurez l'écran de consentement :
     - User Type : **External**
     - App name : `Auto Documents Generator`
     - Email : Votre email
     - Cliquez "Save and Continue" (2 fois)
   - **Application type** : **Web application**
   - **Name** : `Auto Documents Web`
   - **Authorized JavaScript origins** :
     ```
     http://localhost:5175
     ```
   - **Authorized redirect URIs** :
     ```
     http://localhost:3001/api/auth/google/callback
     ```
   - Cliquez **Create**

5. **Copiez les identifiants** :
   - **Client ID** : `xxxxx.apps.googleusercontent.com`
   - **Client Secret** : `GOCSPX-xxxxx`

### 2. Configurez dans le projet (1 min)

Exécutez le script interactif :

```bash
cd backend
./configure-google-oauth.sh
```

Ou éditez manuellement `backend/.env` :

```env
GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-votre-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

### 3. Redémarrez le backend (30 sec)

```bash
pkill -f "node src/server.js"
cd backend
npm start
```

### 4. Testez (30 sec)

1. Ouvrez : http://localhost:5175/login
2. Cliquez "Continuer avec Google"
3. Connectez-vous avec votre compte Google
4. ✅ Vous êtes connecté !

---

## 🔍 Vérification

Testez si Google OAuth est configuré :

```bash
curl http://localhost:3001/api/auth/google
```

- ✅ Si redirection → Google OAuth fonctionne
- ❌ Si `{"error":"Google OAuth non configuré"}` → Ajoutez les identifiants

---

## 🐛 Problèmes courants

**Erreur "redirect_uri_mismatch"**
- Vérifiez que l'URI dans Google Console = `http://localhost:3001/api/auth/google/callback`
- Doit être exactement identique (pas de trailing slash)

**Le bouton Google ne fonctionne pas**
- Vérifiez que `GOOGLE_CLIENT_ID` est dans `.env`
- Redémarrez le backend après modification


