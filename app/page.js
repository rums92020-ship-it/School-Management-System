import { readFileSync } from "node:fs";
import { join } from "node:path";
import LegacyDashboard from "./legacy-dashboard";

const source = readFileSync(join(process.cwd(), "index.html"), "utf8");
const body = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

if (!body) {
  throw new Error("Could not find the dashboard body in index.html.");
}

const markup = body[1].replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");

export default function HomePage() {
  return <LegacyDashboard markup={markup} />;
}
