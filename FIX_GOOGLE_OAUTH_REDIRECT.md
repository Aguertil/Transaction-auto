# 🔧 Correction de l'erreur redirect_uri_mismatch

## ❌ Erreur
```
Erreur 400 : redirect_uri_mismatch
```

## 🔍 Cause
L'URI de redirection configurée dans Google Cloud Console ne correspond **PAS EXACTEMENT** à celle utilisée par votre application.

## ✅ Solution

### 1. Vérifier l'URI utilisée par votre application

L'URI de callback doit être exactement :
```
http://localhost:3001/api/auth/google/callback
```

**Points importants :**
- ✅ Doit commencer par `http://` (pas `https://` en développement)
- ✅ Doit inclure le port `:3001`
- ✅ Doit être exactement `/api/auth/google/callback` (pas de trailing slash `/` à la fin)
- ✅ Pas d'espaces avant ou après

### 2. Configurer dans Google Cloud Console

1. Allez sur https://console.cloud.google.com/
2. Sélectionnez votre projet
3. **APIs & Services** → **Credentials**
4. Cliquez sur votre **OAuth 2.0 Client ID**
5. Dans la section **Authorized redirect URIs**, vérifiez/modifiez :

   **Ajoutez exactement cette URI :**
   ```
   http://localhost:3001/api/auth/google/callback
   ```

6. **IMPORTANT :**
   - ✅ Vérifiez qu'il n'y a **PAS** de trailing slash à la fin
   - ✅ Vérifiez que c'est bien `http://` et non `https://`
   - ✅ Vérifiez que le port est bien `3001`
   - ✅ Supprimez les anciennes URIs qui ne correspondent pas
   - ✅ Cliquez sur **SAVE**

### 3. Vérifier votre fichier .env

Dans `backend/.env`, vérifiez que vous avez :
```env
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

### 4. Redémarrer le backend

```bash
pkill -f "node src/server.js"
cd backend
npm start
```

### 5. Tester à nouveau

1. Ouvrez http://localhost:5174/login
2. Cliquez sur "Continuer avec Google"
3. L'erreur devrait être résolue

## 🔍 Vérification

Pour vérifier quelle URI est utilisée, testez :
```bash
curl -I http://localhost:3001/api/auth/google
```

Vous devriez voir une redirection vers Google avec l'URI de callback correcte.

## ⚠️ Erreurs courantes

❌ **Mauvais :**
- `http://localhost:3001/api/auth/google/callback/` (trailing slash)
- `https://localhost:3001/api/auth/google/callback` (https au lieu de http)
- `http://localhost/api/auth/google/callback` (port manquant)
- `http://localhost:5174/api/auth/google/callback` (mauvais port)

✅ **Correct :**
- `http://localhost:3001/api/auth/google/callback`

## 📝 Pour la production

Quand vous déployez en production, vous devrez :
1. Ajouter l'URI de production dans Google Cloud Console
2. Mettre à jour `GOOGLE_CALLBACK_URL` dans `.env` de production
3. Utiliser `https://` au lieu de `http://`


