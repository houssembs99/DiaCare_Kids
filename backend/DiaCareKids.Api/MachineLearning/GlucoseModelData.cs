using Microsoft.ML.Data;

namespace DiaCareKids.Api.MachineLearning
{
    // Classe pour charger les données du fichier CSV (doit correspondre exactement au fichier)
    public class GlucoseData
    {
        [LoadColumn(1)] 
        public float GlucoseValue { get; set; }

        [LoadColumn(2)] 
        public float Carbs { get; set; }

        [LoadColumn(3)] 
        public float InsulinDose { get; set; }
    }

    // Classe utilisée pour l'entraînement et la prédiction
    public class GlucoseTrainingData : GlucoseData
    {
        [ColumnName("Label")]
        public float Label { get; set; }

        public float TimingIndex { get; set; } // 0: fasting, 1: before, 2: after, 3: bedtime, 4: other
        public float ActivityIndex { get; set; } // 0: low, 1: med, 2: high
    }

    // Classe pour le résultat de la prédiction
    public class GlucosePrediction
    {
        [ColumnName("Score")]
        public float PredictedGlucose { get; set; }
    }
}
