const express = require('express');
const router = express.Router();
const Package = require('../models/Package');

// Get active packages for clients
router.get('/', async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all packages (including inactive)
router.get('/admin/all', async (req, res) => {
  try {
    const packages = await Package.find().sort({ order: 1, createdAt: 1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new package
router.post('/', async (req, res) => {
  try {
    const { title, subtitle, price, currency, billingPeriod, deliveryTime, features, isPopular, badge, color, order, isActive } = req.body;
    if (!title || price === undefined) {
      return res.status(400).json({ message: 'Title and price are required.' });
    }

    const newPackage = new Package({
      title,
      subtitle: subtitle || '',
      price: Number(price),
      currency: currency || '$',
      billingPeriod: billingPeriod || 'One-time',
      deliveryTime: deliveryTime || '3-5 Days',
      features: Array.isArray(features) ? features : (typeof features === 'string' ? features.split('\n').map(f => f.trim()).filter(Boolean) : []),
      isPopular: !!isPopular,
      badge: badge || '',
      color: color || '#b35a00',
      order: order !== undefined ? Number(order) : 0,
      isActive: isActive !== undefined ? isActive : true
    });

    const savedPackage = await newPackage.save();
    res.status(201).json(savedPackage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update package
router.put('/:id', async (req, res) => {
  try {
    const { title, subtitle, price, currency, billingPeriod, deliveryTime, features, isPopular, badge, color, order, isActive } = req.body;
    
    const updateData = {
      title,
      subtitle: subtitle || '',
      price: Number(price),
      currency: currency || '$',
      billingPeriod: billingPeriod || 'One-time',
      deliveryTime: deliveryTime || '3-5 Days',
      features: Array.isArray(features) ? features : (typeof features === 'string' ? features.split('\n').map(f => f.trim()).filter(Boolean) : []),
      isPopular: !!isPopular,
      badge: badge || '',
      color: color || '#b35a00',
      order: order !== undefined ? Number(order) : 0,
      isActive: isActive !== undefined ? isActive : true
    };

    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after' }
    );

    if (!updatedPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.json(updatedPackage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete package
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Package.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
