const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  static async sendAppointmentConfirmation(appointment, doctor, patient) {
    const msg = {
      to: patient.email,
      cc: doctor.email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Appointment Confirmation - ArogyaNex',
      html: `
        <h2>Appointment Confirmation</h2>
        <p>Dear ${patient.name},</p>
        <p>Your appointment has been confirmed with Dr. ${doctor.name}.</p>
        <h3>Appointment Details:</h3>
        <ul>
          <li>Date: ${new Date(appointment.date).toLocaleDateString()}</li>
          <li>Time: ${appointment.startTime} - ${appointment.endTime}</li>
          <li>Consultation Type: ${appointment.consultationType}</li>
          ${appointment.consultationType === 'online' ? `<li>Meeting Link: ${appointment.meetingLink}</li>` : ''}
        </ul>
        <p>Please arrive 10 minutes before your scheduled time.</p>
        <p>If you need to cancel or reschedule, please do so at least 24 hours in advance.</p>
        <p>Best regards,<br>ArogyaNex Team</p>
      `
    };

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Error sending appointment confirmation email:', error);
      throw error;
    }
  }

  static async sendAppointmentReminder(appointment, doctor, patient) {
    const msg = {
      to: patient.email,
      cc: doctor.email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Appointment Reminder - ArogyaNex',
      html: `
        <h2>Appointment Reminder</h2>
        <p>Dear ${patient.name},</p>
        <p>This is a reminder for your upcoming appointment with Dr. ${doctor.name}.</p>
        <h3>Appointment Details:</h3>
        <ul>
          <li>Date: ${new Date(appointment.date).toLocaleDateString()}</li>
          <li>Time: ${appointment.startTime} - ${appointment.endTime}</li>
          <li>Consultation Type: ${appointment.consultationType}</li>
          ${appointment.consultationType === 'online' ? `<li>Meeting Link: ${appointment.meetingLink}</li>` : ''}
        </ul>
        <p>Please arrive 10 minutes before your scheduled time.</p>
        <p>Best regards,<br>ArogyaNex Team</p>
      `
    };

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Error sending appointment reminder email:', error);
      throw error;
    }
  }

  static async sendAppointmentCancellation(appointment, doctor, patient, reason) {
    const msg = {
      to: patient.email,
      cc: doctor.email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Appointment Cancellation - ArogyaNex',
      html: `
        <h2>Appointment Cancellation</h2>
        <p>Dear ${patient.name},</p>
        <p>Your appointment with Dr. ${doctor.name} has been cancelled.</p>
        <h3>Cancelled Appointment Details:</h3>
        <ul>
          <li>Date: ${new Date(appointment.date).toLocaleDateString()}</li>
          <li>Time: ${appointment.startTime} - ${appointment.endTime}</li>
          <li>Reason: ${reason}</li>
        </ul>
        <p>To reschedule, please visit our website or contact our support team.</p>
        <p>Best regards,<br>ArogyaNex Team</p>
      `
    };

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Error sending appointment cancellation email:', error);
      throw error;
    }
  }
}

module.exports = EmailService; 