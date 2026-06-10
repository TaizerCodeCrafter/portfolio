const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// List all templates in public/templates
router.get('/', (req, res) => {
  const templatesDir = path.join(__dirname, '../../../public/templates');
  
  try {
    if (!fs.existsSync(templatesDir)) {
      return res.json([]);
    }
    
    const folders = fs.readdirSync(templatesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
      
    res.json(folders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
