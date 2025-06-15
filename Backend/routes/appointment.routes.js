const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const EmailService = require('../services/emailService');
const { isAuthenticated } = require('../middleware/auth');
const { auth, authorize } = require('../middleware/auth.middleware');

router.get('/doctors', async (req, res) => {
  try {
    const { specialty, search, sortBy = 'rating', sortOrder = 'desc' } = req.query;
    
    let query = {};
    
  
    if (specialty) {
      query.specialty = specialty;
    }
    
  
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { qualification: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const doctors = await Doctor.find(query)
      .sort(sort)
      .select('-__v')
      .lean();
    
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
});


router.get('/doctors/:doctorId/slots', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    

    const appointments = await Appointment.find({
      doctor: doctorId,
      date: new Date(date),
      status: { $in: ['confirmed', 'pending'] }
    });
    

    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const availableSlots = doctor.availableSlots.find(slot => slot.day === dayOfWeek);
    
    if (!availableSlots) {
      return res.json({ message: 'Doctor not available on this day', slots: [] });
    }
 
    const bookedSlots = appointments.map(apt => ({
      startTime: apt.startTime,
      endTime: apt.endTime
    }));
    
 
    res.json({
      availableSlots,
      bookedSlots
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ message: 'Error fetching available slots', error: error.message });
  }
});

router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('doctor', 'name specialization')
      .populate('user', 'name email phone');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/my-appointments', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id })
      .populate('doctor', 'name specialization');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/doctor-appointments', auth, authorize('doctor'), async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate('user', 'name email phone');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post('/', auth, async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;


    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

  
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date,
      time,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    const appointment = new Appointment({
      user: req.user._id,
      doctor: doctorId,
      date,
      time,
      reason,
      status: 'pending'
    });

    await appointment.save();

  
    await EmailService.sendAppointmentConfirmation({
      userEmail: req.user.email,
      userName: req.user.name,
      doctorName: doctor.name,
      date,
      time,
      appointmentId: appointment._id
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id/status', auth, authorize('doctor'), async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }

    appointment.status = status;
    await appointment.save();

    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 