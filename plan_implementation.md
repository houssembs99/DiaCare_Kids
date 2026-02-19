# DiaCare Kids - Plan d'Implémentation

## 1. Stack Technique
- **Backend**: ASP.NET Core API (.NET 8.0)
- **Base de données**: MongoDB
- **Frontend Web**: React (+ Tailwind CSS pour le design premium)
- **Mobile Parent**: React Native (ou PWA)
- **AR Enfant**: Unity + AR Foundation (ARCore)
- **Auth**: JWT (JSON Web Tokens)

## 2. Modèle de Données (MongoDB)
- **Users**: Admin, Clinique, Médecin, Parent, Enfant.
- **Patients**: Profil de l'enfant, objectifs, clinique associée.
- **MedicalHistory**: Glycémies, doses d'insuline, glucides, activités.
- **Alerts**: Historique des alertes générées.

## 3. Structure des Dossiers
- `/backend` : Code source de l'API ASP.NET.
- `/frontend-web` : Application React pour la gestion.
- `/docs` : Diagrammes UML et documentation.

## 4. Prochaines Étapes Immédiates
1. [ ] Initialisation du projet Backend .NET.
2. [ ] Configuration de la connexion MongoDB.
3. [ ] Création des modèles d'utilisateurs et de l'authentification.
4. [ ] Création de la structure Frontend React.
