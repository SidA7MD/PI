# 🏫 Khbarwelli - Système de Gestion des Absences Scolaires

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)

## 📝 Présentation du Projet

**Khbarwelli** est une solution numérique innovante conçue pour moderniser le suivi des absences dans les établissements scolaires en Mauritanie. Le projet remplace les registres papier par une plateforme interconnectée permettant un suivi en temps réel et une communication instantanée entre l'école et les parents.

## 🚀 Fonctionnalités Clés

### 👤 Super Admin & Admin
- **Gestion Globale** : Contrôle total sur les établissements, les classes et les utilisateurs.
- **Tableaux de Bord** : Statistiques détaillées sur les taux d'absentéisme par classe, niveau ou période.
- **Validation** : Processus de validation des nouveaux comptes professeurs et parents.

### 👨‍🏫 Interface Professeur (Web & Mobile)
- **Appel Numérique** : Marquage rapide des absences et retards via une interface intuitive.
- **Historique** : Consultation des absences passées et suivi de la progression des élèves.
- **Notifications** : Alertes en cas de seuil d'absence critique atteint par un élève.

### 👨‍👩‍👧 Interface Parent (Mobile)
- **Lien Enfant** : Ajout sécurisé des enfants via des codes uniques.
- **Alertes Instantanées** : Réception immédiate de notifications push lors d'une absence signalée.
- **Suivi Scolaire** : Consultation du calendrier des absences et statistiques de présence.

## 🛠️ Architecture Technique

Le projet repose sur une architecture moderne **MERN** (MongoDB, Express, React, Node.js) étendue avec **React Native**.

- **Backend** : Node.js & Express avec MongoDB (Mongoose).
- **Frontend Web** : React.js avec Vite pour le dashboard administrateur.
- **Application Mobile** : React Native & Expo pour les professeurs et les parents.
- **Temps Réel** : Socket.io pour les notifications instantanées.
- **Notifications Push** : Expo Server SDK.

## 📂 Structure du Projet

```text
PI/
├── backend/          # API REST, Modèles Mongoose, Middlewares, SocketHandler
├── mobile/           # Application React Native (Expo Router)
├── web/              # Dashboard Administrateur (React + Vite)
└── shared/           # Types et utilitaires partagés (en cours)
```

## ⚙️ Installation et Configuration

### Prérequis
- Node.js (v18+)
- MongoDB Atlas ou Local
- Expo Go (pour tester sur mobile)

### 1. Configuration du Backend
```bash
cd backend
npm install
# Créez un fichier .env avec :
# PORT=5000
# MONGO_URI=votre_url_mongodb
# JWT_SECRET=votre_secret
npm run dev
```

### 2. Configuration du Dashboard Web
```bash
cd web
npm install
npm run dev
```

### 3. Configuration du Mobile
```bash
cd mobile
npm install
# Configurez l'adresse IP de votre backend dans .env
npx expo start
```

## 📊 Impact et Perspectives

- **Transparence** : Réduction du décalage d'information entre l'école et la famille.
- **Prévention** : Identification précoce du décrochage scolaire.
- **Évolutivité** : Intégration prévue de rapports PDF automatisés et d'analyses par IA.

---
*Ce projet a été développé dans le cadre d'un rapport et d'une présentation académique/professionnelle.*
