import express from 'express';
import { Settings } from '../models/Settings.js';

const router = express.Router();

// Get all settings
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.getAll();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Get setting by key
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const value = await Settings.get(key);
    if (value === null) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json({ key, value });
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

// Set single setting
router.post('/', async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ error: 'Setting key is required' });
    }
    const result = await Settings.set(key, value);
    res.json(result);
  } catch (error) {
    console.error('Error setting value:', error);
    res.status(500).json({ error: 'Failed to set value' });
  }
});

// Set multiple settings
router.post('/bulk', async (req, res) => {
  try {
    const settings = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings object is required' });
    }
    const result = await Settings.setMultiple(settings);
    res.json(result);
  } catch (error) {
    console.error('Error setting multiple values:', error);
    res.status(500).json({ error: 'Failed to set multiple values' });
  }
});

// Update setting
router.patch('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const result = await Settings.set(key, value);
    res.json(result);
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// Delete setting
router.delete('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const result = await Settings.delete(key);
    res.json(result);
  } catch (error) {
    console.error('Error deleting setting:', error);
    res.status(500).json({ error: 'Failed to delete setting' });
  }
});

export default router;
