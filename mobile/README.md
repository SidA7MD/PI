# 📱 SchoolAbsence Mobile - Application React Native

Application mobile complète pour la gestion des absences scolaires, développée avec React Native et Expo.

## 🎯 Fonctionnalités

### 👨‍🏫 Pour les Professeurs
- ✅ Visualisation des classes assignées
- ✅ Marquage des absences et retards
- ✅ Historique complet des absences
- ✅ Gestion du profil et paramètres
- 📊 Statistiques de présence (à implémenter)
- 🔔 Notifications push

### 👨‍👩‍👧 Pour les Parents
- ✅ Visualisation des enfants liés
- ✅ Ajout d'enfants via code unique
- ✅ Consultation des absences
- ✅ Notifications en temps réel
- ✅ Gestion du profil et paramètres
- 📈 Statistiques détaillées par enfant (à implémenter)

## 🏗️ Architecture

```
mobile/
├── app/                          # Navigation Expo Router
│   ├── (auth)/                   # Écrans d'authentification
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (teacher)/                # Écrans professeur
│   │   ├── index.tsx            # Mes classes
│   │   ├── mark-absence.tsx     # Marquer absences
│   │   ├── history.tsx          # Historique
│   │   └── profile.tsx          # Profil
│   ├── (parent)/                 # Écrans parent
│   │   ├── index.tsx            # Mes enfants
│   │   ├── absences.tsx         # Toutes absences
│   │   ├── notifications.tsx    # Notifications
│   │   ├── link-child.tsx       # Lier enfant
│   │   └── profile.tsx          # Profil
│   ├── _layout.tsx              # Root layout
│   └── index.tsx                # Splash/Redirect
├── src/
│   ├── components/              # Composants réutilisables
│   │   ├── cards/              # StudentCard, ClassCard, etc.
│   │   └── ui/                 # Button, Input, Badge, etc.
│   ├── services/                # Services API
│   │   ├── api.ts              # Configuration Axios
│   │   ├── authService.ts
│   │   ├── teacherService.ts
│   │   ├── parentService.ts
│   │   └── notificationService.ts
│   ├── context/                 # State management
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── NotificationContext.tsx
│   ├── types/                   # Types TypeScript
│   ├── utils/                   # Utilitaires
│   └── theme/                   # Thème et styles
└── assets/                      # Images, fonts, icons

```

## 🚀 Installation

### Prérequis
- Node.js >= 18
- npm ou yarn
- Expo CLI
- Backend API en cours d'exécution sur `http://localhost:5000`

### Étapes d'installation

1. **Naviguer vers le dossier mobile**
   ```bash
   cd mobile
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   
   Créer un fichier `.env` à la racine du dossier mobile:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Démarrer l'application**
   ```bash
   npm start
   ```

   Ou pour une plateforme spécifique:
   ```bash
   npm run android  # Pour Android
   npm run ios      # Pour iOS
   npm run web      # Pour Web
   ```

## 📦 Dépendances Principales

- **expo**: ~54.0.32 - Framework React Native
- **expo-router**: ~6.0.22 - Navigation basée sur le système de fichiers
- **axios**: ^1.7.9 - Client HTTP
- **date-fns**: ^4.1.0 - Manipulation des dates
- **@react-native-async-storage/async-storage**: 2.1.0 - Stockage local
- **expo-notifications**: ~0.30.5 - Notifications push
- **react-native-chart-kit**: ^6.12.0 - Graphiques
- **react-native-svg**: 15.11.0 - Support SVG

## 🎨 Thème

L'application supporte les thèmes clair et sombre avec basculement automatique selon les préférences système.

### Couleurs principales
- **Primary**: #3B82F6 (Bleu)
- **Success**: #10B981 (Vert)
- **Warning**: #F59E0B (Orange)
- **Danger**: #EF4444 (Rouge)
- **Info**: #06B6D4 (Cyan)

## 🔐 Authentification

L'application utilise JWT pour l'authentification. Les tokens sont stockés dans AsyncStorage et automatiquement ajoutés aux requêtes API via les intercepteurs Axios.

### Connexion
- Téléphone, email ou nom d'utilisateur
- Mot de passe

### Inscription
- Choix du rôle (Professeur/Parent)
- Nom d'utilisateur
- Téléphone (requis)
- Email (optionnel)
- Mot de passe

## 📡 API Backend

L'application communique avec le backend via les endpoints suivants:

### Authentification
- `POST /auth/login` - Connexion
- `POST /auth/register` - Inscription
- `GET /auth/me` - Profil utilisateur

### Professeurs
- `GET /teacher/classes` - Mes classes
- `GET /teacher/class/:classId/students` - Élèves d'une classe
- `POST /teacher/mark-absence` - Marquer absence
- `GET /teacher/class/:classId/absences` - Absences d'une classe

### Parents
- `GET /parent/students` - Mes enfants
- `GET /parent/student/:studentId/absences` - Absences d'un enfant
- `POST /parent/link-student` - Lier enfant avec code unique

## 🔔 Notifications Push

Les notifications push sont configurées avec Expo Notifications:

1. Demande de permission au démarrage
2. Enregistrement du token push sur le backend
3. Réception des notifications en temps réel
4. Badge sur l'onglet Notifications

## 📱 Navigation

L'application utilise **Expo Router** avec une navigation basée sur les fichiers:

- **Stack Navigation** pour l'authentification
- **Tabs Navigation** pour les écrans principaux (professeur/parent)
- **Modal** pour certains écrans (lier un enfant)

## 🧪 Tests

```bash
npm test
```

## 📝 Scripts Disponibles

- `npm start` - Démarrer Expo
- `npm run android` - Lancer sur Android
- `npm run ios` - Lancer sur iOS
- `npm run web` - Lancer sur Web
- `npm run lint` - Linter le code

## 🔧 Configuration Expo

Voir `app.json` pour la configuration complète de l'application Expo.

## 🚧 Fonctionnalités à Implémenter

### Professeurs
- [ ] Écran détails classe avec statistiques
- [ ] Formulaire complet de marquage d'absences
- [ ] Filtres avancés dans l'historique
- [ ] Graphiques de présence
- [ ] Export PDF des rapports

### Parents
- [ ] Écran détails enfant avec graphiques
- [ ] Filtres dans les absences
- [ ] Scanner QR Code pour lier enfant
- [ ] Gestion des notifications par enfant

### Général
- [ ] Mode offline avec synchronisation
- [ ] Changement de mot de passe
- [ ] Paramètres de notifications
- [ ] Support multilingue (FR/EN)
- [ ] Animations et transitions
- [ ] Tests unitaires et E2E

## 🐛 Problèmes Connus

- Les erreurs de lint concernant `date-fns` nécessitent l'installation de la dépendance
- Certains écrans sont des placeholders et nécessitent une implémentation complète
- Les routes typées d'Expo Router peuvent afficher des warnings TypeScript

## 📄 Licence

Ce projet est sous licence MIT.

## 👥 Contributeurs

- Équipe de développement SchoolAbsence

## 📞 Support

Pour toute question ou problème, contactez l'équipe de support.

---

**Note**: Cette application est en cours de développement. Certaines fonctionnalités sont encore en cours d'implémentation.
