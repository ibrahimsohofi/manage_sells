# Droguerie Jamal Sales Tracking Website - MVP Todo

## Requirements
- Track daily sales with: date, dayName, ProductName, price, category, totalPrice
- React with Tailwind CSS (no TypeScript)
- MySQL backend (will use localStorage for MVP since Supabase is disabled)

## Files to Create/Modify
1. **index.html** - Update title to "Droguerie Jamal - Sales Tracker"
2. **src/App.jsx** - Main application with sales form and sales list
3. **src/components/SalesForm.jsx** - Form to add new sales entries
4. **src/components/SalesList.jsx** - Display list of sales with filtering
5. **src/components/SalesStats.jsx** - Show daily/category totals
6. **src/utils/storage.js** - localStorage utilities for data persistence

## Features (MVP)
- Add new sale entry (date, day, product, price, category)
- View all sales in a table format
- Calculate total price automatically
- Filter by date/category
- Show daily totals
- Moroccan styling theme (green/red colors)
- Responsive design

## Data Structure
```javascript
{
  id: string,
  date: string,
  dayName: string,
  productName: string,
  price: number,
  category: string,
  totalPrice: number (calculated)
}
```

## Implementation Priority
1. Basic form to add sales
2. Display sales list
3. Calculate totals
4. Add filtering
5. Styling with Moroccan theme