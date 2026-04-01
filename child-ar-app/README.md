# DiaCare Kids - Module AR Educatif (Unity)

## Objectif
Ce dossier contient la structure du projet Unity pour l'application de Réalité Augmentée destinée aux enfants. L'objectif est de déstigmatiser le diabète à travers des jeux interactifs en AR (ex: nourrir un petit monstre virtuel avec les bons glucides).

## Stack Technique
- **Moteur** : Unity 2022.3 LTS+
- **SDK AR** : AR Foundation + ARCore (Android) / ARKit (iOS)
- **Modélisation** : Blender (Assets low-poly pour performance mobile)
- **UI** : Canvas Unity avec assets exportés de Figma

## Structure des Dossiers
- `/Assets/Scenes` : Scène principale `AR_Learning_Room.unity`
- `/Assets/Scripts` : Scripts C# pour la logique du jeu et connexion API
- `/Assets/Models` : Personnage "DiaPote" et objets de nourriture
- `/Assets/UI` : Sprites et icônes premium

## Communication avec le Backend
L'application utilise des requêtes `UnityWebRequest` vers l'API .NET (port 5246) pour synchroniser les objectifs éducatifs de l'enfant.

## Instructions de Setup
1. Ouvrez Unity Hub et créez un nouveau projet "3D (URP)".
2. Importez le package `AR Foundation` via le Package Manager.
3. Copiez le contenu de ce dossier dans votre dossier `Assets`.
4. Configurez les `XR Plug-in Management` pour ARCore/ARKit.
