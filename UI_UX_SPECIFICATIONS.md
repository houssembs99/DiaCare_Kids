# 📔 Document de Spécification UI/UX - DiaCare Kids

Ce document définit l'identité visuelle, la structure de navigation et l'expérience utilisateur pour la plateforme DiaCare Kids. Il sert de guide de référence pour le développement Frontend (Next.js) et Mobile (AR).

---

## 🎨 1. CHARTE GRAPHIQUE GLOBALE

L'esthétique choisie est le **"Modern Health-Tech"** (style Apple/Premium), alliant propreté médicale et approche ludique pour les enfants.

### 🎨 Palette de Couleurs
| Élément | Usage | Code HEX |
| :--- | :--- | :--- |
| **Bleu Médical** | Couleur primaire, CTA, Navigation | `#0071E3` |
| **Vert Santé** | Succès, Stabilité, Validation | `#34C759` |
| **Rouge Alerte** | Critique, Hypoglycémie, Danger | `#FF3B30` |
| **Orange Warning** | Attention, Hyperglycémie | `#FF9500` |
| Fond général | Arrière-plan des pages | `#088395` |
| **Foncés** | Texte (si fond clair) | `#1D1D1F` |
| **Texte Clair** | Texte principal (fond foncé) | `#FFFFFF` |
| **Gris Doux** | Cartes secondaires, Bordures | `#F5F5F7` |

### 🔤 Typographie
- **Titres (H1, H2, H3)** : `Plus Jakarta Sans` ou `Outfit` - ExtraBold / Black.
- **Corps de texte** : `Inter` ou `Outfit` - Regular / Medium (Taille min : 14px).
- **Navigation & Boutons** : `Inter` - Semi-Bold / Bold.

---

## 🧭 2. STRUCTURE DE NAVIGATION

### 🖥 Version Web (Dashboard)
- **Top Navbar (Fixe)** :
    - **Gauche** : Logo DiaCare Kids + Menu Sandwich (Mobile).
    - **Centre** : Barre de recherche globale (Bords arrondis, icône loupe).
    - **Droite** : Sélecteur de langue (🌍 FR/EN/AR), Cloche notifications (🔔), Avatar Profil + Dropdown Déconnexion.
- **Side Sidebar (Gauche - 240px)** :
    - Arrière-plan blanc ou bleu très sombre.
    - Éléments : `Tableau de bord`, `Patients`, `Statistiques`, `Alertes`, `Rapports`, `Paramètres`.
    - État actif : Accent Bleu Primaire + Icône colorée.

---

## 🖥 3. INTERFACES WEB (DASHBOARDS)

### 👑 3.1 Admin & Clinique
- **Header Stats** : 4 Bento Cards (Chiffres XXL + Indicateur de tendance ↑↓).
- **Graphiques** : Evolution des abonnements et répartition géographique.
- **Tables** : Gestion des comptes avec filtres multi-critères.

### 👨‍⚕️ 3.2 Médecin
- **File Active** : Cartes de patients avec code couleur (Rouge = Urgence, Vert = Stable).
- **Monitoring** : Courbe glycémique interactive `Chart.js` avec zoom sur les dernières 24h.
- **Alertes** : Flux temps réel des anomalies détectées par l'IA `DiaPote`.

### 👩‍👦 3.3 Parent
- **Home Hero** : Large bouton d'action `➕ Ajouter une Mesure`.
- **Game-Loop** : Affichage du niveau de l'enfant et des prochains badges à débloquer.
- **Simplification** : Formulaires de saisie avec pavé numérique géant.

---

## 📱 4. APPLICATION MOBILE AR (ENFANT)

L'UI mobile est conçue pour être **immersive** et **non intrusive**.
- **Mascotte (DiaPote)** : Guide animé en 3D qui parle à l'enfant.
- **Module AR** :
    - Écran caméra plein écran.
    - Overlay translucide indiquant les points d'intérêt sur le corps humain.
    - Fenêtres d'informations de type "Pop-up" flottantes en 3D.
- **Badges** : Galerie 3D interactive pour visualiser les récompenses gagnées.

---

## 🌍 5. SYSTÈME MULTILINGUE

- **Gestion des Langues** : 
    - **Français** : Langue par défaut.
    - **Anglais** : International.
    - **Arabe** : Support complet du **RTL (Right-To-Left)** avec inversion automatique de la SideBar et du flux de lecture.
- **Traduction** : Utilisation de `next-intl` ou `i18next`.

---

## 🔔 6. NOTIFICATIONS & MICRO-INTERACTIONS

- **Visuels** : Notifications sous forme de "Toast" animés avec `framer-motion`.
- **Feedback** : Écran de succès vert avec étincelles après une saisie correcte.
- **Alertes** : Pulsation rouge discrète en bord d'écran si une glycémie critique est détectée.

---

## 📦 7. COMPOSANTS RÉUTILISABLES

- **`AppleCard`** : Rayon de bordure `24px`, Ombre portée douce, Flou d'arrière-plan.
- **`BtnHero`** : Largeur pleine, coins arrondis, effet d'élévation au survol.
- **`StatusBadge`** : Forme pillule avec icône + texte court.
- **`InputPremium`** : Champ de saisie avec icône intégrée et label flottant.

---

## 🧩 8. EXPÉRIENCE UTILISATEUR (UX FLOWS)

### 🔄 Flux Parent (Saisie)
1. **Action** : Clic sur "Ajouter Mesure" sur le Dashboard.
2. **Saisie** : Entrée du chiffre (ex: 120 mg/dL) + Choix "Avant Repas".
3. **Traitement** : L'IA analyse les données via l'API.
4. **Retour** : Affichage immédiat du conseil (ex: "Très bien, Yanis !") + Notification envoyée au médecin en cas d'alerte.

### 🔄 Flux Enfant (Éducation)
1. **Nav** : Clic sur "Explorer le corps".
2. **AR** : Pointer le téléphone vers le tapis/marqueur.
3. **Interagir** : Clic sur le pancréas 3D qui s'illumine.
4. **Apprendre** : Court texte/audio expliquant le rôle de l'insuline.

---

## 🎯 RÉSULTAT ATTENDU
L'interface finale doit inspirer la **confiance** (via le design épuré Apple) tout en restant **engageante** (via la gamification). Elle supprime la barrière de l'angoisse médicale pour la transformer en une gestion technologique simple et efficace.
