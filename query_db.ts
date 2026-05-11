import { ConvexHttpClient } from "convex/browser";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL || "");

async function main() {
  const members = await client.query("teamMembers:list");
  console.log(JSON.stringify(members, null, 2));
}

main().catch(console.error);
