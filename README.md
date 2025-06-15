# 🚀 AarogyaNex – Multilingual AI Health Assistant for Rural India


## 👥 Team Name

**AarogyaNex**\
📌 The name reflects our mission to build next-gen healthcare for Bharat.

---

## 🧠 Problem Statement

Rural populations lack timely access to quality healthcare due to:

- **Absence of 24x7 medical guidance**\
  📌 Villagers struggle to get urgent health advice, especially at night.

- **Inability to understand complex health reports**\
  📌 Most patients can’t read or interpret medical documents.

- **Lack of immediate emergency response systems**\
  📌 No quick way to alert hospitals or call an ambulance.

- **Difficulty in scheduling appointments**\
  📌 People must travel far to book or attend doctor visits.

- **Language barriers in medical communication**\
  📌 English-only systems create accessibility gaps in rural India.

---

## 💡 Idea

**AarogyaNex** is a unified **Multilingual AI-powered Health Assistant** that empowers rural patients by combining:

- Real-time symptom analysis
- Emergency alerting
- Medical report explanation
- Doctor connectivity

All in **regional languages** with **voice/text** support.\
📌 A one-stop digital health buddy for rural India.

---

## ✨ Key Features

- 🗣️ **Multilingual AI Chatbot**\
  24x7 health advice in regional languages via voice/text\
  📌 Understands symptoms, remedies, and health tips easily.

- 🧾 **Blood Report Analyzer**\
  Upload PDF reports and get simplified summaries\
  📌 Uses OCR + NLP to explain medical terms in plain language.

- 🨻 **X-Ray Analyzer**\
  AI-based image analysis with readable feedback\
  📌 Understand radiology results without a doctor.

- 📍 **Emergency GPS Alert System**\
  Sends real-time location to hospitals, alerts ambulances\
  📌 Enables faster help during critical health emergencies.

- 🗓 **Doctor Appointment Booking**\
  Book virtual or in-person appointments easily\
  📌 Reduces travel and increases access to doctors.

---

## ✅ Solution Highlights

- **AI + NLP + Computer Vision** to simplify healthcare in native languages
- **Telemedicine support** without expensive devices
- **OCR + ML** to decode health reports and X-rays
- **Real-time GPS alerts** for emergencies
- **Offline-first design** to fit rural infrastructure

---

## 🏗️ System Architecture (Based on Project Flow)

```
              👤 USER INTERFACE
            (Mobile App / Web App)
                  │
                  ▼
    ┌──────────────────────────────────────┐
    │ 🔊 Multilingual AI Health Chatbot    │
    │ - Symptom Analysis                   │
    │ - First-Aid Suggestions              │
    │ - Home Remedies                      │
    └──────────────────────────────────────┘
📌 Provides 24x7 multilingual guidance for common health issues.
                  │
                  ▼
    ┌──────────────────────────────────────┐
    │ 🧾 Health Report Analyzer            │
    │ - OCR & NLP on Blood Reports         │
    │ - Simple Term Explanation            │
    │ - Healthy Tips Generation            │
    └──────────────────────────────────────┘
📌 Extracts and simplifies blood report content into understandable language.
                  │
                  ▼
    ┌──────────────────────────────────────┐
    │ 🩻 X-Ray Report Analyzer             │
    │ - ML Model Prediction                │
    │ - Human-Friendly Explanation         │
    └──────────────────────────────────────┘
📌 Uses AI to interpret X-ray images and give clear feedback to patients.
                  │
                  ▼
    ┌──────────────────────────────────────┐
    │ 📍 Emergency Alert System           │
    │ - One-tap GPS Send                  │
    │ - Nearest Hospital Alert            │
    │ - Ambulance Dispatch via Twilio     │
    └──────────────────────────────────────┘
📌 Instantly sends location to hospitals and calls an ambulance in emergencies.
                  │
                  ▼
    ┌──────────────────────────────────────┐
    │ 📅 Online Appointment Scheduler      │
    │ - Nearby Doctor Availability         │
    │ - Easy Remote Booking                │
    └──────────────────────────────────────┘
📌 Lets users book consultations with doctors without traveling far.
```

![Camera Captures Driver's Face](https://github.com/user-attachments/assets/2b81dc2e-7d4a-419e-8fd0-fc423caf64dc)

---

## 🧰 Tech Stack

| Area                | Technology Stack                                | Description                             |
| ------------------- | ----------------------------------------------- | --------------------------------------- |
| **Frontend**        | React.js, Tailwind CSS, HTML5, JavaScript       | UI and user input handling              |
| **Backend**         | Node.js,  Firebase Auth, JWT                    | API endpoints, auth, session management |
| **AI**              | Python, TensorFlow,  OpenCV                     | Model training and prediction           |
| **Chatbot**         | OpenAI API, custom symptom logic                | AI-powered health dialogue engine       |
| **APIs & Services** | Google Maps API , Firebase FCM                  | GPS, alerts, notifications              |
| **Report Parsing**  | Tesseract OCR, Flask                            | Blood report text/image analysis        |
| **Deployment**      | Firebase, Render.com, Cloud Storage             | Hosting and storage                     |

---

## ⚙️ How to Install Locally

### 🔽 Prerequisites

- **Node.js** – for running the frontend
- **Python 3.x** – for Flask backend
- **npm or yarn** – for dependency management
- **Git** – for cloning the repository

---

### 📁 Frontend Setup

```bash
git clone https://github.com/AGTechathon/ArogyaNex.git
cd ArogyaNex/frontend
npm install
npm start
```

📌 Runs the frontend on `http://localhost:3000`

---

### ⚙️ Backend + AI Server Setup

```bash
cd ../backend
pip install -r requirements.txt
python app.py
```

📌 Starts Flask-based backend for OCR + report analysis\
📌 Ensure environment variables and Firebase credentials are configured.

---

## 👩‍💻 Author Info

| Name                 | Role                        | Skills                             |
| -------------------- | --------------------------- | ---------------------------------- |
| **Archana Shegur**   | Full Stack + AI Developer   | React, Flask, TensorFlow, OCR      |
| **Shrishail Bidave** | Backend/API Integrator      | Node.js, Express.js, Firebase      |
| **Pallavi Patil**    | UI/UX Designer              | Figma, Tailwind, Accessibility     |
| **Rutuja Jetagi**    | ML Model & Integration Lead | Python, OpenCV, NLP, Symptom Logic |

📌 Each team member contributed to turning the idea into a reality.

---

## 🏁 Let’s Transform Rural Healthcare, Together

> Empowering every village with intelligent, accessible, and reliable healthcare —\
> that’s the **AarogyaNex** vision.


---

## Output

![image](https://github.com/user-attachments/assets/3c27f037-ab1b-46c5-a800-cf081dab4519)
![image](https://github.com/user-attachments/assets/20686af2-0b71-442c-b3d1-c048fa8bae2e)
![image](https://github.com/user-attachments/assets/497e97ae-1157-405c-a132-305b70bee705)
![image](https://github.com/user-attachments/assets/f230b110-ac57-4af2-b846-e10a90f4f772)
![image](https://github.com/user-attachments/assets/700b8c60-c4a1-4574-a0e2-46e829dd4e82)
![image](https://github.com/user-attachments/assets/a33f795d-9202-473a-9ec3-051c9a02c0e1)
![image](https://github.com/user-attachments/assets/0364d0d6-3c7c-40f5-b413-3082058d3024)
![image](https://github.com/user-attachments/assets/9797600f-f7f8-4bbd-b550-5ba3287f1359)





