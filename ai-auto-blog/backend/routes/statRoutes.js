const express = require('express');
const router = express.Router();
const Stat = require('../models/Stat');

// Get all stats
router.get('/', async (req, res) => {
  try {
    const stats = await Stat.find().sort({ order: 1 });
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new stat
router.post('/', async (req, res) => {
  const stat = new Stat(req.body);
  try {
    const newStat = await stat.save();
    res.status(201).json(newStat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update stat
router.put('/:id', async (req, res) => {
  try {
    const updated = await Stat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete stat
router.delete('/:id', async (req, res) => {
  try {
    await Stat.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted Successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
