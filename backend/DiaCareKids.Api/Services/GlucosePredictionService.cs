using Microsoft.ML;
using DiaCareKids.Api.MachineLearning;

namespace DiaCareKids.Api.Services
{
    public class GlucosePredictionService
    {
        private readonly MLContext _mlContext;
        private ITransformer? _model;
        private readonly string _modelPath = Path.Combine(Environment.CurrentDirectory, "MachineLearning", "Models", "glucose_model.zip");
        private readonly string _dataPath = Path.Combine(Environment.CurrentDirectory, "MachineLearning", "Data", "t1d_glucose_data.csv");

        public GlucosePredictionService()
        {
            _mlContext = new MLContext(seed: 0);
        }

        public void TrainModel()
        {
            var modelDir = Path.GetDirectoryName(_modelPath);
            if (!Directory.Exists(modelDir)) Directory.CreateDirectory(modelDir!);

            // 1. Lire toutes les données pour pouvoir faire le décalage (Shift)
            IDataView rawData = _mlContext.Data.LoadFromTextFile<GlucoseData>(_dataPath, hasHeader: true, separatorChar: ',');
            var dataList = _mlContext.Data.CreateEnumerable<GlucoseData>(rawData, reuseRowObject: false).ToList();
            
            // 2. Créer une nouvelle liste d'entraînement décalée
            var trainingList = new List<GlucoseTrainingData>();
            int shift = 6; // On veut prédire dans 30 minutes (6 mesures de 5 min)
            
            for (int i = 0; i < dataList.Count - shift; i++)
            {
                trainingList.Add(new GlucoseTrainingData
                {
                    GlucoseValue = dataList[i].GlucoseValue,
                    Carbs = dataList[i].Carbs,
                    InsulinDose = dataList[i].InsulinDose,
                    Label = dataList[i + shift].GlucoseValue // LA CIBLE EST DANS LE FUTUR
                });
            }

            // 3. Charger la liste décalée dans ML.NET
            IDataView trainingData = _mlContext.Data.LoadFromEnumerable(trainingList);

            // 4. Pipeline d'entraînement
            var pipeline = _mlContext.Transforms.Concatenate("Features", 
                    nameof(GlucoseTrainingData.GlucoseValue), 
                    nameof(GlucoseTrainingData.Carbs), 
                    nameof(GlucoseTrainingData.InsulinDose),
                    nameof(GlucoseTrainingData.TimingIndex),
                    nameof(GlucoseTrainingData.ActivityIndex))
                .Append(_mlContext.Regression.Trainers.FastTree());

            _model = pipeline.Fit(trainingData);
            _mlContext.Model.Save(_model, trainingData.Schema, _modelPath);
        }

        public float Predict(float currentGlucose, float carbs, float insulin, string timing = "before", string activity = "Faible")
        {
            if (_model == null)
            {
                if (!File.Exists(_modelPath)) 
                    throw new Exception("Le modèle n'est pas encore entraîné. Appelez TrainModel d'abord.");
                
                _model = _mlContext.Model.Load(_modelPath, out _);
            }

            // Mappage des chaînes vers des index numériques
            float timingIdx = timing.ToLower() switch {
                "fasting" => 0,
                "before" => 1,
                "after" => 2,
                "bedtime" => 3,
                _ => 4
            };

            float activityIdx = activity.ToLower() switch {
                "faible" => 0,
                "modérée" => 1,
                "intense" => 2,
                _ => 1
            };

            var predictionEngine = _mlContext.Model.CreatePredictionEngine<GlucoseTrainingData, GlucosePrediction>(_model);
            
            var input = new GlucoseTrainingData 
            { 
                GlucoseValue = currentGlucose, 
                Carbs = carbs, 
                InsulinDose = insulin,
                TimingIndex = timingIdx,
                ActivityIndex = activityIdx
            };
            
            var result = predictionEngine.Predict(input);
            return result.PredictedGlucose;
        }
    }
}
