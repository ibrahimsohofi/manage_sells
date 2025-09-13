import express from 'express';
import { Inventory } from '../models/Inventory.js';

const router = express.Router();

// Get all inventory
router.get('/', async (req, res) => {
  try {
    const { storeId = 'main' } = req.query;
    const inventory = await Inventory.getAllInventory(storeId);
    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Get low stock items
router.get('/low-stock', async (req, res) => {
  try {
    const { storeId = 'main' } = req.query;
    const lowStockItems = await Inventory.getLowStockItems(storeId);
    res.json(lowStockItems);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ error: 'Failed to fetch low stock items' });
  }
});

// Get inventory by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { storeId = 'main' } = req.query;
    const inventory = await Inventory.getByCategory(category, storeId);
    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory by category:', error);
    res.status(500).json({ error: 'Failed to fetch inventory by category' });
  }
});

// Find product by barcode
router.get('/barcode/:barcode', async (req, res) => {
  try {
    const { barcode } = req.params;
    const product = await Inventory.findByBarcode(barcode);
    res.json(product);
  } catch (error) {
    console.error('Error finding product by barcode:', error);
    res.status(500).json({ error: 'Failed to find product by barcode' });
  }
});

// Add new product/inventory item
router.post('/', async (req, res) => {
  try {
    const productData = req.body;
    const result = await Inventory.addProduct(productData);
    res.json(result);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Update stock quantity
router.patch('/stock', async (req, res) => {
  try {
    const { productName, quantityChange, storeId = 'main' } = req.body;
    const result = await Inventory.updateStock(productName, quantityChange, storeId);
    res.json(result);
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// Update product details
router.patch('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const updates = req.body;
    const result = await Inventory.updateProduct(productId, updates);
    res.json(result);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { storeId = 'main' } = req.query;
    const result = await Inventory.deleteProduct(productId, storeId);
    res.json(result);
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
