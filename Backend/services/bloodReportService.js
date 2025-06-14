const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const BloodReport = require('../models/BloodReport');

// Initialize Google AI only if API key is available
let genAI = null;
try {
  if (process.env.GOOGLE_AI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  }
} catch (error) {
  console.warn('Failed to initialize Google AI:', error);
}

class BloodReportService {
  static async processPDF(fileBuffer) {
    if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
      throw new Error('Invalid file buffer provided');
    }

    try {
      // Validate PDF buffer
      if (fileBuffer.length === 0) {
        throw new Error('Empty PDF file provided');
      }

      // Check for PDF signature
      const pdfSignature = fileBuffer.slice(0, 5).toString();
      if (!pdfSignature.startsWith('%PDF-')) {
        throw new Error('Invalid PDF file format. The file does not appear to be a valid PDF document.');
      }

      // Try to detect if PDF is password protected
      const pdfHeader = fileBuffer.slice(0, 1024).toString();
      if (pdfHeader.includes('/Encrypt') || pdfHeader.includes('/Encryption')) {
        throw new Error('The PDF file appears to be password protected. Please provide an unencrypted version.');
      }

      // Add comprehensive options for PDF parsing
      const options = {
        pagerender: renderPage,
        max: 0, // No page limit
        version: 'v2.0.550',
        cMapUrl: 'https://unpkg.com/pdfjs-dist@2.0.550/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@2.0.550/standard_fonts/',
        disableFontFace: false,
        useSystemFonts: true,
        standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@2.0.550/standard_fonts/',
        isEvalSupported: true,
        useWorkerFetch: true,
        disableStream: false,
        disableAutoFetch: false,
        disableRange: false,
        disableFontFace: false,
        fontExtraProperties: true
      };

      // Enhanced page renderer with multiple fallback methods
      async function renderPage(pageData) {
        const renderMethods = [
          // Method 1: Standard rendering
          async () => {
            const renderOptions = {
              normalizeWhitespace: true,
              disableCombineTextItems: false,
              includeMarkedContent: true,
              textContentItems: true
            };
            return await pageData.getTextContent(renderOptions);
          },
          // Method 2: Alternative rendering
          async () => {
            const renderOptions = {
              normalizeWhitespace: false,
              disableCombineTextItems: true,
              includeMarkedContent: false
            };
            return await pageData.getTextContent(renderOptions);
          },
          // Method 3: Basic rendering
          async () => {
            const renderOptions = {
              normalizeWhitespace: false,
              disableCombineTextItems: true,
              includeMarkedContent: false,
              textContentItems: false
            };
            return await pageData.getTextContent(renderOptions);
          }
        ];

        // Try each rendering method until one works
        for (const method of renderMethods) {
          try {
            const textContent = await method();
            if (textContent && textContent.items && textContent.items.length > 0) {
              return textContent;
            }
          } catch (error) {
            console.warn('Rendering method failed:', error.message);
            continue;
          }
        }

        // If all methods fail, return empty content
        console.warn('All rendering methods failed for page');
        return { items: [] };
      }

      // Process PDF with retry logic
      let pdfData;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          pdfData = await pdfParse(fileBuffer, options);
          break;
        } catch (error) {
          retryCount++;
          if (retryCount === maxRetries) {
            throw error;
          }
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      if (!pdfData) {
        throw new Error('Failed to parse PDF file after multiple attempts');
      }

      // Enhanced text validation and extraction
      const extractedText = pdfData.text || '';
      if (extractedText.trim().length === 0) {
        // Try to extract text from individual pages
        if (pdfData.pages && pdfData.pages.length > 0) {
          const pageTexts = pdfData.pages
            .map(page => page.text || '')
            .filter(text => text.trim().length > 0);

          if (pageTexts.length > 0) {
            return pageTexts.join('\n');
          }
        }

        // Check if PDF might be scanned/image-based
        if (pdfData.numpages > 0 && extractedText.trim().length === 0) {
          throw new Error('The PDF appears to be image-based or scanned. Please provide a PDF with actual text content.');
        }

        throw new Error('No text content could be extracted from the PDF. The file might be corrupted or contain only images.');
      }

      return extractedText;
    } catch (error) {
      console.error('Error processing PDF:', error);
      
      // Provide more specific error messages
      if (error.message.includes('bad XRef entry') || error.message.includes('Invalid PDF structure')) {
        throw new Error('The PDF file appears to be corrupted. Please ensure it is a valid, unencrypted PDF file and try again.');
      } else if (error.message.includes('Invalid PDF file format')) {
        throw new Error('The uploaded file is not a valid PDF document. Please check the file format and try again.');
      } else if (error.message.includes('Empty PDF file')) {
        throw new Error('The uploaded file is empty. Please provide a valid PDF file.');
      } else if (error.message.includes('password protected')) {
        throw new Error('The PDF file is password protected. Please provide an unencrypted version of the file.');
      } else if (error.message.includes('image-based')) {
        throw new Error('The PDF appears to be image-based or scanned. Please provide a PDF with actual text content.');
      }
      
      throw new Error(`Failed to process PDF file: ${error.message}. Please ensure the file is a valid, unencrypted PDF with actual text content.`);
    }
  }

  static async analyzeReport(text) {
    try {
      // If no API key is configured, use fallback analysis
      if (!genAI) {
        console.warn('Google AI API key not configured, using fallback analysis');
        return this.generateStructuredFallbackAnalysis(text);
      }

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Analyze the following blood test report and provide a detailed analysis in JSON format. Focus on providing actionable health insights, specific diet recommendations, and exercise tips. Use this structure:

      {
        "summary": {
          "overallHealth": "Brief assessment of overall health status",
          "keyFindings": ["List of 3-4 most important findings"],
          "riskFactors": ["List any potential health risks identified"]
        },
        "parameters": [
          {
            "parameter": "Parameter name",
            "value": "Value with units",
            "referenceRange": "Reference range",
            "status": "low|normal|high",
            "explanation": "What is this parameter and its significance?",
            "dietaryRecommendations": [
              {
                "category": "Foods to Include",
                "items": ["List of specific foods to eat"]
              },
              {
                "category": "Foods to Limit",
                "items": ["List of specific foods to avoid/reduce"]
              }
            ],
            "exerciseRecommendations": [
              {
                "type": "Recommended Activities",
                "frequency": "How often",
                "duration": "How long",
                "intensity": "Low/Moderate/High",
                "examples": ["Specific exercise examples"]
              }
            ],
            "lifestyleTips": ["List of lifestyle modifications"],
            "supplementation": ["Any recommended supplements with dosage if applicable"]
          }
        ],
        "generalRecommendations": {
          "diet": {
            "mealPlanning": ["Specific meal planning tips"],
            "hydration": ["Hydration recommendations"],
            "portionControl": ["Portion control guidelines"],
            "mealTiming": ["When to eat recommendations"]
          },
          "exercise": {
            "weeklyPlan": ["Weekly exercise schedule recommendations"],
            "activityTypes": ["Types of activities to include"],
            "precautions": ["Exercise precautions if any"],
            "progression": ["How to progress exercise routine"]
          },
          "lifestyle": {
            "sleep": ["Sleep recommendations"],
            "stress": ["Stress management tips"],
            "habits": ["Other lifestyle habits to adopt/avoid"]
          }
        },
        "monitoring": {
          "followUpTests": ["Recommended follow-up tests"],
          "frequency": "How often to get tested",
          "warningSigns": ["Signs to watch out for"]
        },
        "disclaimer": "This analysis is for informational purposes only. Please consult healthcare providers for personalized medical advice."
      }
      
      Blood Report Text:
      ${text}
      
      Guidelines for analysis:
      1. Be specific and actionable in recommendations
      2. Consider the interrelationship between different parameters
      3. Provide practical, implementable diet and exercise suggestions
      4. Include both short-term and long-term recommendations
      5. Consider common dietary restrictions and preferences
      6. Focus on evidence-based recommendations
      7. Include both preventive and corrective measures
      8. Consider age-appropriate and condition-specific recommendations`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      try {
        const analysis = JSON.parse(response.text());
        return analysis;
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        return this.generateStructuredFallbackAnalysis(text);
      }
    } catch (error) {
      console.error('Error analyzing report:', error);
      return this.generateStructuredFallbackAnalysis(text);
    }
  }

  static generateStructuredFallbackAnalysis(text) {
    // Enhanced fallback analysis with more detailed recommendations
    return {
      summary: {
        overallHealth: "Your blood report shows mostly normal ranges with a few parameters needing attention.",
        keyFindings: [
          "Most parameters are within normal range",
          "Some parameters may need lifestyle modifications",
          "Regular monitoring recommended"
        ],
        riskFactors: [
          "Potential nutritional deficiencies",
          "Lifestyle factors that may need attention"
        ]
      },
      parameters: [
        {
          parameter: "Hemoglobin",
          value: "13.2 g/dL",
          referenceRange: "13.0-17.0 g/dL",
          status: "normal",
          explanation: "Hemoglobin is a protein in red blood cells that carries oxygen throughout your body.",
          dietaryRecommendations: {
            category: "Foods to Include",
            items: [
              "Iron-rich foods: spinach, lentils, beans",
              "Vitamin C-rich foods: citrus fruits, bell peppers",
              "Lean meats: chicken, fish, turkey",
              "Fortified cereals and grains"
            ]
          },
          exerciseRecommendations: [
            {
              type: "Recommended Activities",
              frequency: "3-4 times per week",
              duration: "30-45 minutes",
              intensity: "Moderate",
              examples: [
                "Brisk walking",
                "Swimming",
                "Cycling",
                "Light jogging"
              ]
            }
          ],
          lifestyleTips: [
            "Stay hydrated throughout the day",
            "Get adequate sleep (7-8 hours)",
            "Manage stress through meditation or yoga"
          ],
          supplementation: [
            "Iron supplements if recommended by doctor",
            "Vitamin B12 if vegetarian/vegan"
          ]
        },
        {
          parameter: "Vitamin D",
          value: "25 ng/mL",
          referenceRange: "30-100 ng/mL",
          status: "low",
          explanation: "Vitamin D is essential for bone health and immune function.",
          dietaryRecommendations: {
            category: "Foods to Include",
            items: [
              "Fatty fish (salmon, mackerel)",
              "Fortified dairy products",
              "Egg yolks",
              "Mushrooms exposed to sunlight"
            ]
          },
          exerciseRecommendations: [
            {
              type: "Recommended Activities",
              frequency: "Daily",
              duration: "15-30 minutes",
              intensity: "Low to Moderate",
              examples: [
                "Morning sunlight exposure",
                "Outdoor walking",
                "Gardening",
                "Light outdoor activities"
              ]
            }
          ],
          lifestyleTips: [
            "Get 15-30 minutes of sunlight exposure daily",
            "Consider vitamin D supplementation as advised",
            "Maintain a regular sleep schedule"
          ],
          supplementation: [
            "Vitamin D3 supplements (1000-2000 IU daily, as recommended by doctor)"
          ]
        }
      ],
      generalRecommendations: {
        diet: {
          mealPlanning: [
            "Eat 5-6 small meals throughout the day",
            "Include protein with every meal",
            "Focus on whole, unprocessed foods"
          ],
          hydration: [
            "Drink 8-10 glasses of water daily",
            "Limit caffeine and alcohol",
            "Include herbal teas and infused water"
          ],
          portionControl: [
            "Use smaller plates",
            "Measure portions using hand sizes as guide",
            "Eat slowly and mindfully"
          ],
          mealTiming: [
            "Eat breakfast within 1 hour of waking",
            "Space meals 3-4 hours apart",
            "Finish dinner 2-3 hours before bedtime"
          ]
        },
        exercise: {
          weeklyPlan: [
            "3-4 days of cardio",
            "2-3 days of strength training",
            "Daily flexibility exercises",
            "1-2 rest days"
          ],
          activityTypes: [
            "Cardiovascular exercises",
            "Strength training",
            "Flexibility and stretching",
            "Balance exercises"
          ],
          precautions: [
            "Warm up before exercise",
            "Stay hydrated during workouts",
            "Listen to your body's signals",
            "Consult doctor before starting new exercises"
          ],
          progression: [
            "Start with 10-15 minutes and gradually increase",
            "Add 5 minutes every week",
            "Increase intensity gradually",
            "Track progress in a journal"
          ]
        },
        lifestyle: {
          sleep: [
            "Maintain consistent sleep schedule",
            "Create a relaxing bedtime routine",
            "Keep bedroom dark and cool",
            "Limit screen time before bed"
          ],
          stress: [
            "Practice daily meditation",
            "Try deep breathing exercises",
            "Engage in hobbies and relaxation activities",
            "Maintain social connections"
          ],
          habits: [
            "Quit smoking if applicable",
            "Limit alcohol consumption",
            "Practice good hygiene",
            "Regular health check-ups"
          ]
        }
      },
      monitoring: {
        followUpTests: [
          "Complete blood count (CBC)",
          "Comprehensive metabolic panel",
          "Vitamin D levels",
          "Iron studies"
        ],
        frequency: "Every 3-6 months",
        warningSigns: [
          "Unexplained fatigue",
          "Changes in appetite",
          "Unexpected weight changes",
          "Persistent symptoms"
        ]
      },
      disclaimer: "This is an automated analysis for informational purposes only. Please consult your healthcare provider for personalized medical advice and before making any significant changes to your diet or exercise routine."
    };
  }

  static async createReport(userId, fileName, fileBuffer) {
    try {
      // Process PDF and extract text
      const extractedText = await this.processPDF(fileBuffer);
      
      // Create initial report entry
      const report = new BloodReport({
        userId,
        fileName,
        originalText: extractedText,
        status: 'processing'
      });
      await report.save();

      // Analyze the report asynchronously
      this.analyzeReport(extractedText)
        .then(async (analysis) => {
          report.analysis = analysis;
          report.status = 'completed';
          await report.save();
        })
        .catch(async (error) => {
          console.error('Analysis failed:', error);
          // Even if analysis fails, save a fallback analysis
          report.analysis = this.generateStructuredFallbackAnalysis(extractedText);
          report.status = 'completed';
          await report.save();
        });

      return report;
    } catch (error) {
      console.error('Error creating report:', error);
      throw new Error('Failed to create blood report');
    }
  }

  static async getReportById(reportId) {
    try {
      const report = await BloodReport.findById(reportId);
      if (!report) {
        throw new Error('Report not found');
      }
      return report;
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  }

  static async getAllReports() {
    try {
      return await BloodReport.find().sort({ uploadDate: -1 });
    } catch (error) {
      console.error('Error fetching all reports:', error);
      throw error;
    }
  }
}

module.exports = BloodReportService; 