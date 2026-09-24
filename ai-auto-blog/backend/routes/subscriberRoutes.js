const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
const { sendSubscriptionAlert } = require('../services/notificationService');

// Subscribe to newsletter
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if already subscribed
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ message: 'You are already subscribed!' });
    }

    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    // Trigger alert
    sendSubscriptionAlert(email).catch(() => {});

    res.status(201).json({ message: 'Successfully subscribed to the newsletter!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all subscribers
router.get('/', async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ subscribedAt: -1 });
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Delete subscriber
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Subscriber.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Subscriber not found' });
    res.json({ message: 'Subscriber removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
