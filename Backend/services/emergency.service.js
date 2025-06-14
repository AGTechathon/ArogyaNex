const axios = require('axios');
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');
require('dotenv').config();

class EmergencyService {
  constructor() {
    this.OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';
    this.initializeServices();
  }

  initializeServices() {
   
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.sendgridEnabled = true;
    } else {
      console.warn('SendGrid API key not found. Email alerts will be disabled.');
      this.sendgridEnabled = false;
    }

    
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      this.twilioEnabled = true;
    } else {
      console.warn('Twilio credentials not found. SMS alerts will be disabled.');
      this.twilioEnabled = false;
    }

    
    this.simulationMode = !this.sendgridEnabled && !this.twilioEnabled;
    if (this.simulationMode) {
      console.warn('No alert services configured. Running in simulation mode.');
    }

 
    this.validateEnvironmentVariables();
  }

  validateEnvironmentVariables() {
    const requiredVars = {
      'SENDGRID_FROM_EMAIL': this.sendgridEnabled,
      'TWILIO_PHONE_NUMBER': this.twilioEnabled
    };

    const missingVars = Object.entries(requiredVars)
      .filter(([_, isRequired]) => isRequired)
      .filter(([varName]) => !process.env[varName])
      .map(([varName]) => varName);

    if (missingVars.length > 0) {
      console.warn(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }

  async testServiceConnection() {
    const results = {
      sendgrid: { enabled: false, status: 'disabled' },
      twilio: { enabled: false, status: 'disabled' },
      openstreetmap: { enabled: true, status: 'unknown' }
    };

 
    if (this.sendgridEnabled) {
      try {
        const testEmail = {
          to: process.env.SENDGRID_FROM_EMAIL,
          from: process.env.SENDGRID_FROM_EMAIL,
          subject: 'Emergency Service Test',
          text: 'This is a test email from the Emergency Service.'
        };
        await sgMail.send(testEmail);
        results.sendgrid = { enabled: true, status: 'connected' };
      } catch (error) {
        results.sendgrid = { enabled: true, status: 'error', error: error.message };
      }
    }

   
    if (this.twilioEnabled) {
      try {
        await this.twilioClient.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
        results.twilio = { enabled: true, status: 'connected' };
      } catch (error) {
        results.twilio = { enabled: true, status: 'error', error: error.message };
      }
    }

    
    try {
      const testQuery = `
        [out:json][timeout:5];
        node["amenity"="hospital"](around:1000,0,0);
        out body;
      `;
      await axios.post(this.OVERPASS_API_URL, testQuery, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      results.openstreetmap.status = 'connected';
    } catch (error) {
      results.openstreetmap.status = 'error';
      results.openstreetmap.error = error.message;
    }

    return results;
  }

  async findNearbyHospitals(latitude, longitude) {
    try {
      
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:5000,${latitude},${longitude});
          way["amenity"="hospital"](around:5000,${latitude},${longitude});
          relation["amenity"="hospital"](around:5000,${latitude},${longitude});
        );
        out body;
        >;
        out skel qt;
      `;

      const response = await axios.post(this.OVERPASS_API_URL, query, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (!response.data.elements || response.data.elements.length === 0) {
        throw new Error('No hospitals found in the area');
      }

      
      const hospitals = response.data.elements
        .filter(element => element.tags && element.tags.amenity === 'hospital')
        .map(hospital => {
          const distance = this.calculateDistance(
            latitude,
            longitude,
            hospital.lat,
            hospital.lon
          );

          return {
            name: hospital.tags.name || 'Unnamed Hospital',
            distance: distance,
            address: this.formatAddress(hospital.tags),
            type: hospital.tags.hospital_type || 'General Hospital',
            emergency: hospital.tags.emergency === 'yes' ? 'Has Emergency Department' : 'No Emergency Department',
            placeId: hospital.id,
            coordinates: {
              latitude: hospital.lat,
              longitude: hospital.lon
            }
          };
        })
        .sort((a, b) => {
          const distA = parseFloat(a.distance);
          const distB = parseFloat(b.distance);
          return distA - distB;
        });

      return hospitals;
    } catch (error) {
      console.error('Error finding nearby hospitals:', error);
      throw new Error('Failed to find nearby hospitals');
    }
  }

  formatAddress(tags) {
    const addressParts = [];
    if (tags['addr:street']) addressParts.push(tags['addr:street']);
    if (tags['addr:housenumber']) addressParts.push(tags['addr:housenumber']);
    if (tags['addr:city']) addressParts.push(tags['addr:city']);
    if (tags['addr:postcode']) addressParts.push(tags['addr:postcode']);
    
    return addressParts.length > 0 ? addressParts.join(', ') : 'Address not available';
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return `${distance.toFixed(1)} km`;
  }

  toRad(degrees) {
    return degrees * (Math.PI/180);
  }

  async sendEmailAlert(contact, emergencyData) {
    if (!this.sendgridEnabled) {
      return {
        success: false,
        method: 'email',
        to: contact.email,
        error: 'SendGrid service is not configured'
      };
    }

    try {
      const nearestHospital = emergencyData.hospitalsNearBy[0];
      const msg = {
        to: contact.email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: '🚨 EMERGENCY ALERT: Medical Assistance Required',
        text: this.generateEmailText(contact, emergencyData, nearestHospital),
        html: this.generateEmailHtml(contact, emergencyData, nearestHospital)
      };

      await sgMail.send(msg);
      return { success: true, method: 'email', to: contact.email };
    } catch (error) {
      console.error('Error sending email alert:', error);
      return { success: false, method: 'email', to: contact.email, error: error.message };
    }
  }

  async sendSMSAlert(contact, emergencyData) {
    if (!this.twilioEnabled) {
      return {
        success: false,
        method: 'sms',
        to: contact.phone,
        error: 'Twilio service is not configured'
      };
    }

    try {
      const nearestHospital = emergencyData.hospitalsNearBy[0];
      const message = await this.twilioClient.messages.create({
        body: this.generateSMSText(contact, emergencyData, nearestHospital),
        from: process.env.TWILIO_PHONE_NUMBER,
        to: contact.phone
      });

      return { success: true, method: 'sms', to: contact.phone, messageId: message.sid };
    } catch (error) {
      console.error('Error sending SMS alert:', error);
      return { success: false, method: 'sms', to: contact.phone, error: error.message };
    }
  }

  generateEmailText(contact, emergencyData, nearestHospital) {
    return `
EMERGENCY ALERT - Medical Assistance Required

Dear ${contact.name},

This is an automated emergency alert. Medical assistance has been requested at the following location:
Latitude: ${emergencyData.coordinates.latitude}
Longitude: ${emergencyData.coordinates.longitude}

Nearest Hospital:
${nearestHospital.name}
${nearestHospital.address}
Distance: ${nearestHospital.distance}
${nearestHospital.emergency}

Additional Hospitals Nearby:
${emergencyData.hospitalsNearBy.slice(1, 3).map(h => 
  `- ${h.name} (${h.distance}): ${h.address}`
).join('\n')}

Ambulance Status: ${emergencyData.ambulance}

This is an automated message. Please respond immediately if you can provide assistance.

Timestamp: ${emergencyData.timestamp}
    `.trim();
  }

  generateEmailHtml(contact, emergencyData, nearestHospital) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff0000;">🚨 EMERGENCY ALERT - Medical Assistance Required</h2>
        
        <p>Dear ${contact.name},</p>
        
        <p>This is an automated emergency alert. Medical assistance has been requested at the following location:</p>
        <p><strong>Location:</strong><br>
        Latitude: ${emergencyData.coordinates.latitude}<br>
        Longitude: ${emergencyData.coordinates.longitude}</p>

        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="color: #dc3545;">Nearest Hospital:</h3>
          <p><strong>${nearestHospital.name}</strong><br>
          ${nearestHospital.address}<br>
          Distance: ${nearestHospital.distance}<br>
          ${nearestHospital.emergency}</p>
        </div>

        <h3>Additional Hospitals Nearby:</h3>
        <ul>
          ${emergencyData.hospitalsNearBy.slice(1, 3).map(h => 
            `<li><strong>${h.name}</strong> (${h.distance})<br>${h.address}</li>`
          ).join('')}
        </ul>

        <p><strong>Ambulance Status:</strong> ${emergencyData.ambulance}</p>
        
        <p style="color: #666; font-size: 0.9em;">This is an automated message. Please respond immediately if you can provide assistance.</p>
        
        <p style="color: #666; font-size: 0.8em;">Timestamp: ${emergencyData.timestamp}</p>
      </div>
    `.trim();
  }

  generateSMSText(contact, emergencyData, nearestHospital) {
    return `🚨 EMERGENCY ALERT for ${contact.name}:
Location: ${emergencyData.coordinates.latitude}, ${emergencyData.coordinates.longitude}
Nearest Hospital: ${nearestHospital.name} (${nearestHospital.distance})
${nearestHospital.address}
${emergencyData.ambulance}
Please respond immediately if you can help.`;
  }

  async simulateAlert(contact, emergencyData) {
    console.log(`[SIMULATION] Would send alert to ${contact.name}:`);
    if (contact.email) {
      console.log(`[SIMULATION] Email to ${contact.email}:`);
      console.log(this.generateEmailText(contact, emergencyData, emergencyData.hospitalsNearBy[0]));
    }
    if (contact.phone) {
      console.log(`[SIMULATION] SMS to ${contact.phone}:`);
      console.log(this.generateSMSText(contact, emergencyData, emergencyData.hospitalsNearBy[0]));
    }
    return {
      success: true,
      method: 'simulation',
      contact: contact.name,
      simulated: true,
      timestamp: new Date().toISOString()
    };
  }

  async sendAlerts(emergencyContacts, emergencyData) {
    const alertResults = [];
    
    
    if (this.simulationMode) {
      for (const contact of emergencyContacts) {
        const result = await this.simulateAlert(contact, emergencyData);
        alertResults.push(result);
      }
      return {
        results: alertResults,
        mode: 'simulation',
        message: 'Alerts simulated (no real alerts sent - services not configured)'
      };
    }

    let hasSuccessfulAlert = false;
    
    for (const contact of emergencyContacts) {
      let alertResult = { contact: contact.name };
      let contactSuccess = false;

      if (contact.email && this.sendgridEnabled) {
        const emailResult = await this.sendEmailAlert(contact, emergencyData);
        alertResult.email = emailResult;
        if (emailResult.success) contactSuccess = true;
      }

      if (contact.phone && this.twilioEnabled && (!contactSuccess || contact.preferredMethod === 'sms')) {
        const smsResult = await this.sendSMSAlert(contact, emergencyData);
        alertResult.sms = smsResult;
        if (smsResult.success) contactSuccess = true;
      }

      if (!contactSuccess) {
        if (contact.email && this.sendgridEnabled && (!alertResult.email || !alertResult.email.success)) {
          const emailResult = await this.sendEmailAlert(contact, emergencyData);
          alertResult.email = emailResult;
          if (emailResult.success) contactSuccess = true;
        }
        if (contact.phone && this.twilioEnabled && (!alertResult.sms || !alertResult.sms.success)) {
          const smsResult = await this.sendSMSAlert(contact, emergencyData);
          alertResult.sms = smsResult;
          if (smsResult.success) contactSuccess = true;
        }
      }

      if (contactSuccess) hasSuccessfulAlert = true;
      alertResult.success = contactSuccess;
      alertResults.push(alertResult);
    }

    return {
      results: alertResults,
      mode: 'production',
      message: hasSuccessfulAlert 
        ? 'Alerts sent successfully' 
        : 'No alerts could be sent through any available method',
      services: {
        sendgrid: this.sendgridEnabled ? 'enabled' : 'disabled',
        twilio: this.twilioEnabled ? 'enabled' : 'disabled'
      }
    };
  }

  async handleEmergencyAlert(latitude, longitude, emergencyContacts) {
    try {

      console.log(`Finding nearest hospitals for location: ${latitude}, ${longitude}`);
      const hospitals = await this.findNearbyHospitals(latitude, longitude);

      console.log("Simulating ambulance dispatch...");
      const ambulanceStatus = "Ambulance dispatched. ETA: 10 minutes.";

      const emergencyData = {
        coordinates: { latitude, longitude },
        hospitalsNearBy: hospitals,
        ambulance: ambulanceStatus,
        timestamp: new Date().toISOString(),
        source: "OpenStreetMap"
      };

      console.log("Sending emergency alerts to contacts:", emergencyContacts);
      const alertResults = await this.sendAlerts(emergencyContacts, emergencyData);

      return {
        message: "Emergency alert processed successfully.",
        hospitalsNearBy: hospitals,
        ambulance: ambulanceStatus,
        alerts: alertResults,
        timestamp: emergencyData.timestamp,
        source: "OpenStreetMap",
        mode: alertResults.mode
      };
    } catch (error) {
      console.error('Error in handleEmergencyAlert:', error);
      throw error;
    }
  }
}

module.exports = new EmergencyService(); 