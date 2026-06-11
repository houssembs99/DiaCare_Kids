using DiaCareKids.Api.Models;

namespace DiaCareKids.Api.Services
{
    public class DecisionSupportService
    {
        public AnalysisResult AnalyzeRecord(MedicalRecord record, Patient patient)
        {
            return AnalyzeRecord(record, patient.Targets);
        }

        public AnalysisResult AnalyzeRecord(MedicalRecord record, User kid)
        {
            // Par défaut, on utilise les cibles standards si non définies dans le profil User
            var targets = new GlucoseTargets(); 
            return AnalyzeRecord(record, targets);
        }

        private AnalysisResult AnalyzeRecord(MedicalRecord record, GlucoseTargets targets)
        {
            var result = new AnalysisResult { IsAlert = false, Level = "Normal", Recommendation = "Tout semble correct. Continuez le suivi." };

            if (record.GlucoseValue.HasValue)
            {
                double val = record.GlucoseValue.Value;

                // Règle 1: Hypoglycémie
                if (val < targets.AlertLow)
                {
                    result.IsAlert = true;
                    result.Level = "Critique (Hypo)";
                    result.Recommendation = "⚠️ ALERTE HYPO : Donnez du sucre rapide immédiatement (jus, 3 morceaux de sucre). Vérifiez à nouveau dans 15 min.";
                }
                // Règle 2: Hyperglycémie
                else if (val > targets.AlertHigh)
                {
                    result.IsAlert = true;
                    result.Level = "Attention (Hyper)";
                    result.Recommendation = "⚠️ VALEUR ÉLEVÉE : Vérifiez l'hydratation et les corps cétoniques si > 2.50 g/L. Contactez le médecin si la valeur persiste.";
                }
                // Règle 3: Légèrement au dessus des cibles
                else if (val > targets.Max)
                {
                    result.Level = "Légèrement Élevé";
                    result.Recommendation = "Valeur au dessus de la cible. Surveillez le prochain repas et l'activité physique.";
                }
            }

            return result;
        }
    }

    public class AnalysisResult
    {
        public bool IsAlert { get; set; }
        public string Level { get; set; } = string.Empty;
        public string Recommendation { get; set; } = string.Empty;
    }
}
