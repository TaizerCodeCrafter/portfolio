const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// Create new project
router.post('/', async (req, res) => {
  try {
    const project = new Project(req.body);
    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all projects
router.get('/', async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=120, s-maxage=600, stale-while-revalidate=86400');
    const projects = await Project.find().sort({ createdAt: -1 }).lean();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like project
router.post('/:id/like', async (req, res) => {
  try {
    const { action } = req.body;
    const incValue = action === 'unlike' ? -1 : 1;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: incValue } },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.likes < 0) {
      project.likes = 0;
      await project.save();
    }
    res.json({ likes: project.likes, projectId: project._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
