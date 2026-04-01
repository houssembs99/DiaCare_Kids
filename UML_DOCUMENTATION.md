# Documentation UML - DiaCare Kids

Ce document regroupe les modélisations UML du système DiaCare Kids, structurées pour répondre aux exigences du cahier des charges.

## 1. Diagramme de Cas d’Utilisation

```mermaid
usecaseDiagram
    actor "Médecin" as Doc
    actor "Parent" as Par
    actor "Enfant" as Kid
    actor "Admin" as Adm

    package "DiaCare Kids Web/Mobile" {
        Doc --> (Suivi Médical)
        Doc --> (Analyse Historique)
        Doc --> (Générer Rapport PDF)
        
        Par --> (Saisie Glycémie/Insuline)
        Par --> (Consultation Conseils IA)
        Par --> (Recevoir Alertes)
        
        Adm --> (Gestion Cliniques)
        Adm --> (Gestion Utilisateurs)
    }

    package "DiaCare Kids AR" {
        Kid --> (Visualisation 3D Corps)
        Kid --> (Mini-jeux Éducatifs)
    }
```

## 2. Diagramme de Classes (Backend)

```mermaid
classDiagram
    class User {
        +String Id
        +String FullName
        +String Email
        +String Password
        +String Role
    }

    class Patient {
        +String Id
        +String FullName
        +DateTime DateOfBirth
        +String DoctorId
        +String ParentEmail
        +String CurrentTreatment
    }

    class MedicalRecord {
        +String Id
        +String PatientId
        +Double GlucoseValue
        +Double InsulinDose
        +String Timing
        +DateTime Timestamp
    }

    class DecisionSupportService {
        +AnalyzeRecord(record) AnalysisResult
    }

    User "1" -- "0..*" Patient : Suit
    Patient "1" -- "0..*" MedicalRecord : Possède
```

## 3. Diagramme de Séquence : Saisie Parent → Analyse → Recommandation

```mermaid
sequenceDiagram
    participant P as Parent (App)
    participant B as Backend (API)
    participant D as DecisionSupportService
    participant DB as MongoDB

    P->>B: POST /api/medicalrecords (valeur = 55 mg/dL)
    B->>D: AnalyzeRecord(record)
    D-->>B: AnalysisResult (Hypoglycémie, Alerte!)
    B->>DB: Sauvegarder Record
    B-->>P: 201 Created + AnalysisResult
    Note over P: L'interface affiche l'alerte rouge et le conseil "Sucre rapide"
```

## 4. Diagramme d’Architecture

```mermaid
graph TD
    A[Frontend React - Vite] -->|HTTPS / JWT| B[.NET 8 Web API]
    B -->|Driver| C[(MongoDB Atlas)]
    D[Unity AR App] -->|HTTPS| B
    B -.->|Notifications| E[Service Email/Push]
```

---
*Document généré par DiaCare GPT pour le projet de fin d'études.*
