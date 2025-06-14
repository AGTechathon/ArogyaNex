import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BloodReportAnalyzer.css';

const API_BASE_URL = 'http://localhost:3020/api';

const statusColor = {
  low: 'status-low',
  normal: 'status-normal',
  high: 'status-high',
};

const BloodReportAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);

  useEffect(() => {
    fetchReports();
    // Cleanup polling interval on component unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/blood-reports`);
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setUploadError('Failed to fetch reports. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setUploadError(null);

    if (!selectedFile) {
      return;
    }

    if (selectedFile.type !== 'application/pdf') {
      setFile(null);
      setUploadError('Please select a valid PDF file');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB
      setFile(null);
      setUploadError('File size should be less than 5MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('report', file);

    try {
      setUploading(true);
      setUploadError(null);
      const response = await axios.post(`${API_BASE_URL}/blood-reports/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Start polling for report status
      const pollReportStatus = async () => {
        try {
          const reportResponse = await axios.get(`${API_BASE_URL}/blood-reports/${response.data.reportId}`);
          const report = reportResponse.data;
          
          if (report.status === 'completed') {
            setReports(prevReports => [report, ...prevReports]);
            setSelectedReport(report);
            setUploading(false);
            if (pollingInterval) {
              clearInterval(pollingInterval);
              setPollingInterval(null);
            }
          } else if (report.status === 'failed') {
            setUploadError('Failed to analyze the report. Please ensure the PDF is valid and try again.');
            setUploading(false);
            if (pollingInterval) {
              clearInterval(pollingInterval);
              setPollingInterval(null);
            }
          }
        } catch (error) {
          console.error('Error polling report status:', error);
          setUploadError('Error checking report status. Please refresh the page.');
          setUploading(false);
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        }
      };

      // Poll every 2 seconds
      const interval = setInterval(pollReportStatus, 2000);
      setPollingInterval(interval);

      // Initial poll
      pollReportStatus();
    } catch (error) {
      console.error('Upload error:', error);
      let errorMessage = 'Failed to upload report';
      
      if (error.response) {
        // Handle specific error messages from the backend
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setUploadError(errorMessage);
      setUploading(false);
    }
  };

  const handleReportSelect = async (reportId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/blood-reports/${reportId}`);
      setSelectedReport(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
      setUploadError('Failed to fetch report details. Please try again.');
    }
  };

  return (
    <div className="blood-report-analyzer">
      <div className="upload-section">
        <h2>Upload Blood Report</h2>
        <div className="upload-container">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={uploading}
            className="file-input"
          />
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="upload-button"
          >
            {uploading ? 'Uploading...' : 'Upload Report'}
          </button>
        </div>
        {uploadError && <p className="error-message">{uploadError}</p>}
      </div>

      <div className="reports-section">
        <h2>Report History</h2>
        {loading ? (
          <p>Loading reports...</p>
        ) : (
          <div className="reports-list">
            {reports.map((report) => (
              <div
                key={report._id}
                className={`report-item ${selectedReport?._id === report._id ? 'selected' : ''}`}
                onClick={() => handleReportSelect(report._id)}
              >
                <div className="report-header">
                  <span className="report-name">{report.fileName}</span>
                  <span className={`report-status ${report.status}`}>{report.status}</span>
                </div>
                <div className="report-date">
                  {new Date(report.uploadDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedReport && selectedReport.status === 'completed' && selectedReport.analysis && (
        <div className="analysis-section">
          <h2>Detailed Analysis Results</h2>
          
          {/* Summary Section */}
          <div className="analysis-summary-card">
            <h3>Health Status Overview</h3>
            <p className="overall-health">{selectedReport.analysis.summary.overallHealth}</p>
            
            <div className="key-findings">
              <h4>Key Findings</h4>
              <ul>
                {selectedReport.analysis.summary.keyFindings.map((finding, idx) => (
                  <li key={idx}>{finding}</li>
                ))}
              </ul>
            </div>
            
            <div className="risk-factors">
              <h4>Risk Factors</h4>
              <ul>
                {selectedReport.analysis.summary.riskFactors.map((risk, idx) => (
                  <li key={idx}>{risk}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Parameters Section */}
          <div className="parameter-cards">
            {selectedReport.analysis.parameters && selectedReport.analysis.parameters.map((param, idx) => (
              <div className="parameter-card" key={idx}>
                <div className="parameter-header">
                  <span className="parameter-title">{param.parameter}</span>
                  <span className={`parameter-status ${statusColor[param.status] || ''}`}>{param.status}</span>
                </div>
                <div className="parameter-values">
                  <span className="parameter-value">{param.value}</span>
                  <span className="parameter-range">Ref: {param.referenceRange}</span>
                </div>
                <div className="parameter-explanation">
                  <strong>What is it?</strong>
                  <p>{param.explanation}</p>
                </div>

                {/* Dietary Recommendations */}
                {param.dietaryRecommendations && (
                  <div className="parameter-recommendations">
                    <strong>Dietary Recommendations:</strong>
                    <div className="recommendation-category">
                      <h5>{param.dietaryRecommendations.category}</h5>
                      <ul>
                        {param.dietaryRecommendations.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Exercise Recommendations */}
                {param.exerciseRecommendations && param.exerciseRecommendations.length > 0 && (
                  <div className="parameter-activities">
                    <strong>Exercise Recommendations:</strong>
                    {param.exerciseRecommendations.map((rec, i) => (
                      <div key={i} className="exercise-recommendation">
                        <h5>{rec.type}</h5>
                        <p>Frequency: {rec.frequency}</p>
                        <p>Duration: {rec.duration}</p>
                        <p>Intensity: {rec.intensity}</p>
                        <ul>
                          {rec.examples.map((example, j) => (
                            <li key={j}>{example}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Lifestyle Tips */}
                {param.lifestyleTips && param.lifestyleTips.length > 0 && (
                  <div className="lifestyle-tips">
                    <strong>Lifestyle Tips:</strong>
                    <ul>
                      {param.lifestyleTips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Supplementation */}
                {param.supplementation && param.supplementation.length > 0 && (
                  <div className="supplementation">
                    <strong>Supplementation:</strong>
                    <ul>
                      {param.supplementation.map((supp, i) => (
                        <li key={i}>{supp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* General Recommendations Section */}
          <div className="general-recommendations-card">
            <h3>General Recommendations</h3>
            
            {/* Diet Recommendations */}
            {selectedReport.analysis.generalRecommendations.diet && (
              <div className="diet-recommendations">
                <h4>Diet & Nutrition</h4>
                <div className="recommendation-section">
                  <h5>Meal Planning</h5>
                  <ul>
                    {selectedReport.analysis.generalRecommendations.diet.mealPlanning.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
                <div className="recommendation-section">
                  <h5>Hydration</h5>
                  <ul>
                    {selectedReport.analysis.generalRecommendations.diet.hydration.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
                <div className="recommendation-section">
                  <h5>Portion Control</h5>
                  <ul>
                    {selectedReport.analysis.generalRecommendations.diet.portionControl.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
                <div className="recommendation-section">
                  <h5>Meal Timing</h5>
                  <ul>
                    {selectedReport.analysis.generalRecommendations.diet.mealTiming.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Exercise Recommendations */}
            {selectedReport.analysis.generalRecommendations.exercise && (
              <div className="exercise-recommendations">
                <h4>Exercise & Physical Activity</h4>
                <div className="recommendation-section">
                  <h5>Weekly Plan</h5>
                  <ul>
                    {selectedReport.analysis.generalRecommendations.exercise.weeklyPlan.map((plan, i) => (
                      <li key={i}>{plan}</li>
                    ))}
                  </ul>
                </div>
                <div className="recommendation-section">
                  <h5>Activity Types</h5>
                  <ul>
                    {selectedReport.analysis.generalRecommendations.exercise.activityTypes.map((type, i) => (
                      <li key={i}>{type}</li>
                    ))}
                  </ul>
                </div>
                <div className="recommendation-section">
                  <h5>Precautions</h5>
                  <ul>
                    {selectedReport.analysis.generalRecommendations.exercise.precautions.map((precaution, i) => (
                      <li key={i}>{precaution}</li>
                    ))}
                  </ul>
                </div>
                <div className="recommendation-section">
                  <h5>Progression</h5>
                  <ul>
                    {selectedReport.analysis.generalRecommendations.exercise.progression.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Lifestyle Recommendations */}
            {selectedReport.analysis.generalRecommendations.lifestyle && (
              <div className="lifestyle-recommendations">
                <h4>Lifestyle Management</h4>
                <div className="recommendation-section">
                  <h5>Sleep</h5>
                  <ul>
                    {selectedReport.analysis.generalRecommendations.lifestyle.sleep.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
                <div className="recommendation-section">
                  <h5>Stress Management</h5>
                  <ul>
                    {selectedReport.analysis.generalRecommendations.lifestyle.stress.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
                <div className="recommendation-section">
                  <h5>Healthy Habits</h5>
                  <ul>
                    {selectedReport.analysis.generalRecommendations.lifestyle.habits.map((habit, i) => (
                      <li key={i}>{habit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Monitoring Section */}
          {selectedReport.analysis.monitoring && (
            <div className="monitoring-card">
              <h3>Monitoring & Follow-up</h3>
              <div className="monitoring-section">
                <h4>Recommended Follow-up Tests</h4>
                <ul>
                  {selectedReport.analysis.monitoring.followUpTests.map((test, i) => (
                    <li key={i}>{test}</li>
                  ))}
                </ul>
              </div>
              <div className="monitoring-section">
                <h4>Testing Frequency</h4>
                <p>{selectedReport.analysis.monitoring.frequency}</p>
              </div>
              <div className="monitoring-section">
                <h4>Warning Signs to Watch For</h4>
                <ul>
                  {selectedReport.analysis.monitoring.warningSigns.map((sign, i) => (
                    <li key={i}>{sign}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="disclaimer-card">
            <strong>Important Disclaimer</strong>
            <p>{selectedReport.analysis.disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodReportAnalyzer; 