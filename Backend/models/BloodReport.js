const mongoose = require('mongoose');

// Define sub-schemas for better organization
const exerciseRecommendationSchema = new mongoose.Schema({
  type: String,
  frequency: String,
  duration: String,
  intensity: String,
  examples: [String]
}, { _id: false });

const dietaryRecommendationSchema = new mongoose.Schema({
  category: String,
  items: [String]
}, { _id: false });

const dietRecommendationsSchema = new mongoose.Schema({
  mealPlanning: [String],
  hydration: [String],
  portionControl: [String],
  mealTiming: [String]
}, { _id: false });

const exerciseRecommendationsSchema = new mongoose.Schema({
  weeklyPlan: [String],
  activityTypes: [String],
  precautions: [String],
  progression: [String]
}, { _id: false });

const lifestyleRecommendationsSchema = new mongoose.Schema({
  sleep: [String],
  stress: [String],
  habits: [String]
}, { _id: false });

const monitoringSchema = new mongoose.Schema({
  followUpTests: [String],
  frequency: String,
  warningSigns: [String]
}, { _id: false });

const summarySchema = new mongoose.Schema({
  overallHealth: String,
  keyFindings: [String],
  riskFactors: [String]
}, { _id: false });

const parameterSchema = new mongoose.Schema({
  parameter: String,
  value: String,
  referenceRange: String,
  status: {
    type: String,
    enum: ['low', 'normal', 'high']
  },
  explanation: String,
  dietaryRecommendations: dietaryRecommendationSchema,
  exerciseRecommendations: [exerciseRecommendationSchema],
  lifestyleTips: [String],
  supplementation: [String]
}, { _id: false });

const generalRecommendationsSchema = new mongoose.Schema({
  diet: dietRecommendationsSchema,
  exercise: exerciseRecommendationsSchema,
  lifestyle: lifestyleRecommendationsSchema
}, { _id: false });

const bloodReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalText: {
    type: String,
    required: true
  },
  analysis: {
    summary: summarySchema,
    parameters: [parameterSchema],
    generalRecommendations: generalRecommendationsSchema,
    monitoring: monitoringSchema
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  }
});

module.exports = mongoose.model('BloodReport', bloodReportSchema); 