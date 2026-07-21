import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { ensureAdminAccount } from "./services/adminBootstrap.js";
import { ensureStarterReviews } from "./services/reviewBootstrap.js";
import { ensureSiteData } from "./services/siteBootstrap.js";

async function startServer() {
  try {
    await connectDatabase();
    await ensureAdminAccount();
    await ensureStarterReviews();
    await ensureSiteData();
    app.listen(env.port, () => {
      console.log(`WashPanda API running on port ${env.port}`);
    });
  } catch (error) {
    console.error(`Unable to start WashPanda API: ${error.message}`);
    process.exitCode = 1;
  }
}

startServer();
