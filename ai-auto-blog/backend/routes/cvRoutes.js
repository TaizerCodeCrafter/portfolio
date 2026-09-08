const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');

// Download CV as attachment
router.get('/download', async (req, res) => {
  try {
    const cvSetting = await Setting.findOne({ key: 'cvUrl' });
    const nameSetting = await Setting.findOne({ key: 'cvName' });
    
    if (!cvSetting || !cvSetting.value) {
      return res.status(404).send('CV file not found. Please upload a CV from Admin Panel.');
    }

    const filename = (nameSetting && nameSetting.value) ? nameSetting.value : 'Supun_Dilshan_CV.pdf';
    const val = cvSetting.value;

    if (val.startsWith('data:')) {
      const parts = val.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
      const buffer = Buffer.from(parts[1], 'base64');

      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      return res.send(buffer);
    } else {
      return res.redirect(val);
    }
  } catch (err) {
    console.error('Error downloading CV:', err);
    res.status(500).send('Error downloading CV: ' + err.message);
  }
});

// View CV in browser (inline)
router.get('/view', async (req, res) => {
  try {
    const cvSetting = await Setting.findOne({ key: 'cvUrl' });
    const nameSetting = await Setting.findOne({ key: 'cvName' });
    
    if (!cvSetting || !cvSetting.value) {
      return res.status(404).send('CV file not found. Please upload a CV from Admin Panel.');
    }

    const filename = (nameSetting && nameSetting.value) ? nameSetting.value : 'Supun_Dilshan_CV.pdf';
    const val = cvSetting.value;

    if (val.startsWith('data:')) {
      const parts = val.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
      const buffer = Buffer.from(parts[1], 'base64');

      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
      return res.send(buffer);
    } else {
      return res.redirect(val);
    }
  } catch (err) {
    console.error('Error viewing CV:', err);
    res.status(500).send('Error viewing CV: ' + err.message);
  }
});

module.exports = router;
