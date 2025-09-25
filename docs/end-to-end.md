## End-to-End Walkthrough: Processing a Sale

This walkthrough demonstrates the core workflow of the application: creating the necessary data, processing a sale, and observing its impact on inventory and reports.

### 1. Prerequisites
- **Start the Application**: Run `npm run dev` in your terminal.
- **Login**: Open the application in your browser and log in. The default admin credentials are `admin@pizzatruck.com` / `admin123`.

### 2. Set Up Inventory and Products
- **Create Ingredients**:
  - Navigate to the "Inventory" page.
  - Create at least two ingredients (e.g., "Dough", "Cheese") with their respective units.
- **Record a Purchase**:
  - Go to the "Purchases" page and create a new purchase order.
  - Add the ingredients you just created to the purchase order to stock them. This creates inventory lots that will be consumed during sales.
- **Create a Product**:
  - Go to the "Products" page.
  - Create a new product (e.g., "Cheese Pizza").
  - Define a recipe for the product that uses the ingredients you stocked.

### 3. Process the Sale
- **Open a Cash Session**:
  - Navigate to the "Sessions" page.
  - Open a new cash session with an initial float amount.
- **Make a Sale**:
  - Go to the "Sales" page.
  - Create a new sale and add the "Cheese Pizza" to the order.
  - Complete the sale by selecting a payment method.

### 4. Verify the Impact
- **Inventory Consumption**:
  - On the "Inventory" page, check the current stock levels. You should see that the quantities of "Dough" and "Cheese" have decreased according to the recipe.
  - You can also view the "Stock Movements" for each ingredient to see the `SALE_CONSUME` transaction. The oldest inventory lots should be consumed first (FIFO).
- **Sales and Reports**:
  - On the "Sales" page, you will see the recorded sale, including line items and the calculated Cost of Goods Sold (COGS).
  - The "Dashboard" will be updated to reflect the new sale in the KPIs (Revenue, COGS, Gross Margin).
  - The "Recent Activity" feed on the dashboard will show both the sale and the corresponding stock movements.
- **Cash Session**:
  - Return to the "Sessions" page.
  - Close the cash session. You can now view a report for the session, which summarizes sales and cash flow.

For any issues during this process, refer to the troubleshooting guide in `docs/operations.md`.


