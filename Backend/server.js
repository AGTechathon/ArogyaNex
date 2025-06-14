require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');


const chatbotRoutes = require('./routes/chatbot.routes');
const emergencyRoutes = require('./routes/emergency.routes');
const bloodReportRoutes = require('./routes/bloodReportRoutes');

const app = express();


app.get('/', (req, res) => {
  res.send('Hello World');
});


app.use(helmet());
app.use(cors());
app.use(express.json());


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});
app.use(limiter);


app.use('/api/chatbot', chatbotRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/blood-reports', bloodReportRoutes);



app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
  });
});


mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = 3020;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log('MongoDB connection error:', error);
  }); 