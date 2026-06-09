# DEVELOPMENT GUIDE

## Making Changes to Your Application

This guide explains how to modify code while using Docker for local testing.

---

## PROJECT RUNNING

**Assumption**: You have `docker-compose up` running in PowerShell

---

## MODIFYING FRONTEND CODE (Customer Website)

### Location
```
ecommerce-final/
└── amazon-customer-website/
    └── src/
```

### Edit and See Changes Immediately

1. **Open file** in VS Code:
   ```
   amazon-customer-website/src/pages/HomePage.js
   ```

2. **Make changes** (e.g., change text, colors, layout)

3. **Save file** (Ctrl+S)

4. **Browser reloads automatically** (React Hot Reload)

5. **See your changes at** http://localhost:3000

---

### Example 1: Change Product Display

**File**: `amazon-customer-website/src/pages/HomePage.js`

```javascript
// BEFORE
<h1>Welcome to Our Store</h1>

// AFTER
<h1>Welcome to ShopHub - Your Favorite Products Here!</h1>
```

**Result**: Change appears instantly on http://localhost:3000

---

### Example 2: Change Colors

**File**: `amazon-customer-website/src/styles/Header.css`

```css
/* BEFORE */
background-color: #131A22;

/* AFTER */
background-color: #FF6600; /* Bright orange */
```

**Result**: Header color changes instantly

---

## MODIFYING ADMIN DASHBOARD CODE

### Location
```
ecommerce-final/
└── admin-seller-dashboard/
    └── src/
```

### Same Process
1. Edit file in `admin-seller-dashboard/src/`
2. Save
3. Browser reloads at http://localhost:3001

---

## MODIFYING BACKEND CODE (API)

### Location
```
ecommerce-final/
└── backend-api/
    └── routes/
    └── models/
    └── middleware/
```

### Changes Require Server Restart

1. **Edit file** (e.g., `backend-api/routes/products.js`)

2. **Save file**

3. **Restart backend container**:
   ```powershell
   docker-compose restart backend
   ```

4. **Wait 3-5 seconds** for backend to restart

5. **Test in browser** or Postman

---

### Example: Add New API Endpoint

**File**: `backend-api/routes/products.js`

```javascript
// Add new endpoint
router.get('/featured', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products WHERE featured = true');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Then**:
1. Save file
2. Restart backend: `docker-compose restart backend`
3. Test: http://localhost:5000/api/products/featured

---

## MODIFYING DATABASE SCHEMA

### Location
```
ecommerce-final/
└── backend-api/
    └── init.sql
```

### Process

1. **Stop all services**:
   ```powershell
   docker-compose down
   ```

2. **Edit** `backend-api/init.sql` (add/remove tables)

3. **Start fresh**:
   ```powershell
   docker-compose up --build
   ```

4. **Database reinitializes** with new schema

---

### Example: Add New Column to Products

**File**: `backend-api/init.sql`

```sql
-- Find the CREATE TABLE products statement
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2),
  category VARCHAR(100),
  featured BOOLEAN DEFAULT false,  -- ADD THIS LINE
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Then**:
1. Save
2. `docker-compose down`
3. `docker-compose up --build`
4. Database created with new column

---

## ADDING NEW PAGES (Frontend)

### Customer Website

1. **Create page file**:
   ```
   amazon-customer-website/src/pages/NewPage.js
   ```

2. **Write component**:
   ```javascript
   import React from 'react';
   import '../styles/NewPage.css';

   const NewPage = () => {
     return (
       <div>
         <h1>New Page</h1>
       </div>
     );
   };

   export default NewPage;
   ```

3. **Add to router** in `amazon-customer-website/src/App.js`:
   ```javascript
   import NewPage from './pages/NewPage';
   // ...
   <Route path="/new-page" element={<NewPage />} />
   ```

4. **Create CSS file**:
   ```
   amazon-customer-website/src/styles/NewPage.css
   ```

5. **Save all files**
6. **Access at** http://localhost:3000/new-page

---

## ADDING NEW API ENDPOINTS

### Backend

1. **Create route file** (if needed):
   ```
   backend-api/routes/newfeature.js
   ```

2. **Write endpoints**:
   ```javascript
   const express = require('express');
   const router = express.Router();

   router.get('/test', (req, res) => {
     res.json({ message: 'Hello from new endpoint' });
   });

   module.exports = router;
   ```

3. **Register in** `backend-api/server.js`:
   ```javascript
   const newFeatureRoutes = require('./routes/newfeature');
   app.use('/api/newfeature', newFeatureRoutes);
   ```

4. **Save**
5. **Restart backend**: `docker-compose restart backend`
6. **Test**: http://localhost:5000/api/newfeature/test

---

## ADDING NPM PACKAGES

### Frontend (Customer or Admin)

**In PowerShell:**

```powershell
# Navigate to project folder
cd amazon-customer-website

# Install package
npm install axios

# Or with docker
docker-compose exec customer npm install axios

# Stop, rebuild, restart
docker-compose down
docker-compose up --build
```

---

### Backend

```powershell
# Navigate to backend
cd backend-api

# Install package
npm install lodash

# Or with docker
docker-compose exec backend npm install lodash

# Stop, rebuild, restart
docker-compose down
docker-compose up --build
```

---

## DEBUGGING

### View Frontend Console
1. Open http://localhost:3000
2. Right-click → "Inspect" or press F12
3. Click "Console" tab
4. See errors and logs

### View Backend Logs
```powershell
# Real-time logs
docker-compose logs -f backend

# All backend output shown
```

### View Database Queries
1. Connect to database:
   ```powershell
   docker-compose exec postgres psql -U ecommerce_user -d ecommerce_db
   ```

2. Run SQL:
   ```sql
   SELECT * FROM users;
   SELECT * FROM products;
   \dt  -- List all tables
   ```

---

## COMMON DEVELOPMENT TASKS

### Clear Cache
```powershell
# Frontend cache
docker-compose exec customer npm cache clean --force

# Backend cache
docker-compose exec backend npm cache clean --force
```

### Rebuild Everything
```powershell
docker-compose down
docker-compose up --build
```

### Reset Database (Delete All Data)
```powershell
docker-compose down -v
docker-compose up
```

### Check What's Running
```powershell
docker ps

# Should show 5 containers:
# - postgres
# - redis
# - backend
# - customer (frontend)
# - admin (dashboard)
```

---

## DEVELOPMENT WORKFLOW

### Daily Workflow

```powershell
# Start of day
docker-compose up

# Throughout day
1. Edit code
2. Save file
3. See changes in browser (instant for frontend)
4. For backend: docker-compose restart backend
5. Test changes

# End of day
docker-compose down
```

---

## BEST PRACTICES

### Frontend
- Keep components small
- Use CSS classes, not inline styles
- Reuse components in multiple pages
- Use Context for shared state

### Backend
- Keep routes in separate files
- Use middleware for common tasks
- Return proper HTTP status codes
- Log important events

### Database
- Use indexes on frequently queried columns
- Use foreign keys for relationships
- Backup before making schema changes

---

## TESTING YOUR CHANGES

### Before Deploying to Production

1. **Test locally with docker-compose**
2. **Check all pages load**
3. **Test all buttons work**
4. **Check console for errors**
5. **View backend logs**
6. **Test database operations**

---

## NEXT STEPS

When you're happy with your changes:
1. Read PRODUCTION_DEPLOYMENT.md
2. Deploy to cloud
3. Monitor in production

---

## NEED TO MODIFY?

Everything is modifiable:
- ✅ Colors, fonts, layout
- ✅ Page content
- ✅ API endpoints
- ✅ Database structure
- ✅ Business logic

Just restart the relevant service and test!
