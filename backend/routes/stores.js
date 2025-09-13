import express from 'express';
import { Stores } from '../models/Stores.js';

const router = express.Router();

// Get all stores
router.get('/', async (req, res) => {
  try {
    const stores = await Stores.getAll();
    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// Get store by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Stores.getById(id);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    res.json(store);
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

// Get store comparison with sales data
router.get('/comparison/all', async (req, res) => {
  try {
    const comparison = await Stores.getStoreComparison();
    res.json(comparison);
  } catch (error) {
    console.error('Error fetching store comparison:', error);
    res.status(500).json({ error: 'Failed to fetch store comparison' });
  }
});

// Add new store
router.post('/', async (req, res) => {
  try {
    const storeData = req.body;
    const result = await Stores.add(storeData);
    res.json(result);
  } catch (error) {
    console.error('Error adding store:', error);
    res.status(500).json({ error: 'Failed to add store' });
  }
});

// Update store
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const result = await Stores.update(id, updates);
    res.json(result);
  } catch (error) {
    console.error('Error updating store:', error);
    res.status(500).json({ error: 'Failed to update store' });
  }
});

// Delete store
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Stores.delete(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting store:', error);
    res.status(500).json({ error: 'Failed to delete store' });
  }
});

export default router;
