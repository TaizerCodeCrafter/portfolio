const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

// Get active companies for public website
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all companies (including inactive)
router.get('/admin/all', async (req, res) => {
  try {
    const companies = await Company.find().sort({ order: 1, createdAt: -1 });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new company
router.post('/', async (req, res) => {
  try {
    const { name, logo, website, order, isActive } = req.body;
    if (!name || !logo) {
      return res.status(400).json({ message: 'Company name and logo are required.' });
    }

    const company = new Company({
      name,
      logo,
      website: website || '',
      order: order !== undefined ? Number(order) : 0,
      isActive: isActive !== undefined ? isActive : true
    });

    const savedCompany = await company.save();
    res.status(201).json(savedCompany);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update company
router.put('/:id', async (req, res) => {
  try {
    const { name, logo, website, order, isActive } = req.body;
    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      {
        name,
        logo,
        website: website || '',
        order: order !== undefined ? Number(order) : 0,
        isActive: isActive !== undefined ? isActive : true
      },
      { returnDocument: 'after' }
    );

    if (!updatedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(updatedCompany);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete company
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Company.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
