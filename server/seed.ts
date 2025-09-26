import { storage } from "./storage";

export async function seed() {
  console.log("Starting seed process...");

  try {
    // Create admin user (idempotent) - this is the only required seed data
    let adminUser = await storage.getUserByEmail("admin@pizzatruck.com");
    if (!adminUser) {
      adminUser = await storage.createUser({
        email: "admin@pizzatruck.com",
        password: "password",
        name: "John Smith",
        role: "ADMIN",
      });
      console.log("Created admin user:", adminUser.email, "ID:", adminUser.id);
    } else {
      console.log(
        "Admin user already exists:",
        adminUser.email,
        "ID:",
        adminUser.id
      );
    }

    // All other tables will be empty until data is added through the UI
    console.log("Database initialized with empty tables");
    console.log("\nLogin credentials:");
    console.log("Admin: admin@pizzatruck.com / password");
  } catch (error) {
    console.error("Seed process failed:", error);
    process.exit(1);
  }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed();
}

// Create more suppliers
