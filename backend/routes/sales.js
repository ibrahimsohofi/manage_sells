import express from 'express';
import { Sales } from '../models/Sales.js';
import { Inventory } from '../models/Inventory.js';

const router = express.Router();

// Get all daily sales
router.get('/daily', async (req, res) => {
  try {
    const { storeId } = req.query;
    const sales = await Sales.getAllDailySales(storeId);
    res.json(sales);
  } catch (error) {
    console.error('Error fetching daily sales:', error);
    res.status(500).json({ error: 'Failed to fetch daily sales' });
  }
});

// Get individual sales (for compatibility)
router.get('/', async (req, res) => {
  try {
    const { storeId } = req.query;
    const sales = await Sales.getIndividualSales(storeId);
    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// Get sales by date range
router.get('/range', async (req, res) => {
  try {
    const { startDate, endDate, storeId } = req.query;
    const sales = await Sales.getDailySalesByDateRange(startDate, endDate, storeId);
    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales by date range:', error);
    res.status(500).json({ error: 'Failed to fetch sales by date range' });
  }
});

// Get sales items for a specific day
router.get('/day/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { storeId } = req.query;
    const items = await Sales.getSalesItemsByDay(date, storeId);
    res.json(items);
  } catch (error) {
    console.error('Error fetching sales items for day:', error);
    res.status(500).json({ error: 'Failed to fetch sales items for day' });
  }
});

// Add new sale
router.post('/', async (req, res) => {
  try {
    const saleData = req.body;

    // Add the sale
    const result = await Sales.addSale(saleData);

    // Update inventory
    if (saleData.productName && saleData.quantity) {
      await Inventory.updateStock(saleData.productName, -saleData.quantity, saleData.storeId);
    }

    res.json(result);
  } catch (error) {
    console.error('Error adding sale:', error);
    res.status(500).json({ error: 'Failed to add sale' });
  }
});

// Delete sale item
router.delete('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;

    // Get item details before deleting for inventory restoration
    const getItemQuery = `
      SELECT si.product_name, si.quantity, ds.store_id
      FROM sales_items si
      JOIN daily_sales ds ON si.daily_sale_id = ds.id
      WHERE si.id = ?
    `;

    const result = await Sales.deleteSaleItem(itemId);

    // Note: Inventory restoration could be added here if needed

    res.json(result);
  } catch (error) {
    console.error('Error deleting sale item:', error);
    res.status(500).json({ error: 'Failed to delete sale item' });
  }
});

// Get sales statistics
router.get('/stats', async (req, res) => {
  try {
    const { storeId } = req.query;
    const stats = await Sales.getSalesStats(storeId);
    res.json(stats[0] || {});
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    res.status(500).json({ error: 'Failed to fetch sales stats' });
  }
});

// Get sales by category
router.get('/categories', async (req, res) => {
  try {
    const { storeId } = req.query;
    const categoryStats = await Sales.getSalesByCategory(storeId);
    res.json(categoryStats);
  } catch (error) {
    console.error('Error fetching sales by category:', error);
    res.status(500).json({ error: 'Failed to fetch sales by category' });
  }
});

export default router;
