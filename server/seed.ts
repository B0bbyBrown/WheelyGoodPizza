import { storage } from "./storage";

async function seed() {
  console.log("Starting seed process...");

  try {
    // Create admin user
    const adminUser = await storage.createUser({
      email: "admin@pizzatruck.com",
      password: "admin123",
      name: "John Smith",
      role: "ADMIN",
    });
    console.log("Created admin user:", adminUser.email);

    // Create cashier user
    const cashierUser = await storage.createUser({
      email: "cashier@pizzatruck.com",
      password: "cashier123",
      name: "Jane Doe",
      role: "CASHIER",
    });
    console.log("Created cashier user:", cashierUser.email);

    // Create supplier
    const supplier = await storage.createSupplier({
      name: "FreshCo",
      phone: "+1-555-0123",
      email: "orders@freshco.com",
    });
    console.log("Created supplier:", supplier.name);

    // Create ingredients
    const flour = await storage.createIngredient({
      name: "Flour",
      unit: "kg",
      lowStockLevel: "5.0",
    });

    const tomatoSauce = await storage.createIngredient({
      name: "Tomato Sauce",
      unit: "ml",
      lowStockLevel: "1000.0",
    });

    const mozzarella = await storage.createIngredient({
      name: "Mozzarella Cheese",
      unit: "g",
      lowStockLevel: "500.0",
    });

    const basil = await storage.createIngredient({
      name: "Basil",
      unit: "g",
      lowStockLevel: "100.0",
    });

    const oliveOil = await storage.createIngredient({
      name: "Olive Oil",
      unit: "ml",
      lowStockLevel: "500.0",
    });

    const softDrink = await storage.createIngredient({
      name: "Soft Drink Can",
      unit: "unit",
      lowStockLevel: "12.0",
    });

    console.log("Created ingredients");

    // Create initial purchase
    const purchase = await storage.createPurchase({
      supplierId: supplier.id,
      notes: "Initial inventory purchase",
      items: [
        {
          ingredientId: flour.id,
          quantity: "25.0",
          totalCost: "300.00",
        },
        {
          ingredientId: tomatoSauce.id,
          quantity: "5000.0",
          totalCost: "250.00",
        },
        {
          ingredientId: mozzarella.id,
          quantity: "5000.0",
          totalCost: "900.00",
        },
        {
          ingredientId: basil.id,
          quantity: "200.0",
          totalCost: "80.00",
        },
        {
          ingredientId: oliveOil.id,
          quantity: "2000.0",
          totalCost: "200.00",
        },
        {
          ingredientId: softDrink.id,
          quantity: "48.0",
          totalCost: "360.00",
        },
      ],
    });
    console.log("Created initial purchase");

    // Create products
    const margherita = await storage.createProduct({
      name: "Margherita Pizza",
      sku: "PIZ-MARG",
      price: "90.00",
      active: true,
    });

    const pepperoni = await storage.createProduct({
      name: "Pepperoni Pizza",
      sku: "PIZ-PEP",
      price: "95.00",
      active: true,
    });

    const coke = await storage.createProduct({
      name: "Coke 330ml",
      sku: "DRK-COKE",
      price: "20.00",
      active: true,
    });

    console.log("Created products");

    // Create recipes
    await storage.createRecipeItem({
      productId: margherita.id,
      ingredientId: flour.id,
      quantity: "0.25",
    });

    await storage.createRecipeItem({
      productId: margherita.id,
      ingredientId: tomatoSauce.id,
      quantity: "120.0",
    });

    await storage.createRecipeItem({
      productId: margherita.id,
      ingredientId: mozzarella.id,
      quantity: "150.0",
    });

    await storage.createRecipeItem({
      productId: margherita.id,
      ingredientId: basil.id,
      quantity: "2.0",
    });

    await storage.createRecipeItem({
      productId: margherita.id,
      ingredientId: oliveOil.id,
      quantity: "5.0",
    });

    // Pepperoni pizza recipe (same as margherita for simplicity)
    await storage.createRecipeItem({
      productId: pepperoni.id,
      ingredientId: flour.id,
      quantity: "0.25",
    });

    await storage.createRecipeItem({
      productId: pepperoni.id,
      ingredientId: tomatoSauce.id,
      quantity: "120.0",
    });

    await storage.createRecipeItem({
      productId: pepperoni.id,
      ingredientId: mozzarella.id,
      quantity: "150.0",
    });

    await storage.createRecipeItem({
      productId: pepperoni.id,
      ingredientId: oliveOil.id,
      quantity: "5.0",
    });

    // Coke recipe
    await storage.createRecipeItem({
      productId: coke.id,
      ingredientId: softDrink.id,
      quantity: "1.0",
    });

    console.log("Created recipes");

    // Open a cash session
    const session = await storage.openCashSession({
      openedBy: adminUser.id,
      openingFloat: "200.00",
      notes: "Morning shift start",
    });
    console.log("Opened cash session");

    // Create some sample sales
    await storage.createSale({
      sessionId: session.id,
      paymentType: "CASH",
      items: [
        { productId: margherita.id, qty: 2 },
        { productId: coke.id, qty: 1 },
      ],
    }, adminUser.id);

    await storage.createSale({
      sessionId: session.id,
      paymentType: "CARD",
      items: [
        { productId: pepperoni.id, qty: 1 },
        { productId: coke.id, qty: 2 },
      ],
    }, cashierUser.id);

    console.log("Created sample sales");

    // Create some expenses
    await storage.createExpense({
      label: "Truck fuel",
      amount: "85.00",
      paidVia: "CASH",
    });

    await storage.createExpense({
      label: "Napkins and utensils",
      amount: "45.00",
      paidVia: "CARD",
    });

    console.log("Created sample expenses");

    console.log("Seed process completed successfully!");
    console.log("\nLogin credentials:");
    console.log("Admin: admin@pizzatruck.com / admin123");
    console.log("Cashier: cashier@pizzatruck.com / cashier123");

  } catch (error) {
    console.error("Seed process failed:", error);
    process.exit(1);
  }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed();
}

export { seed };
