/**
 * Sets the admin mobile + password hash in .env.local.
 *
 *   npm run admin:set-password
 *
 * The password is read from stdin and only its scrypt hash is written to disk.
 */
import { createInterface } from "node:readline";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { hashPassword, validatePassword } from "../src/lib/password";

const ENV_PATH = resolve(process.cwd(), ".env.local");

function ask(question: string, muted = false): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  if (muted) {
    // Suppress echo so the password is not printed to the terminal.
    const out = process.stdout as unknown as { write: (s: string) => boolean };
    const original = out.write.bind(out);
    let armed = false;
    out.write = (chunk: string) => {
      if (armed) return true;
      return original(chunk);
    };
    rl.question(question, () => {});
    armed = true;
    return new Promise((res) => {
      rl.on("line", (line) => {
        armed = false;
        original("\n");
        rl.close();
        res(line.trim());
      });
    });
  }

  return new Promise((res) =>
    rl.question(question, (answer) => {
      rl.close();
      res(answer.trim());
    }),
  );
}

/** Replaces KEY=... in place, or appends it when absent. */
function upsert(content: string, key: string, value: string): string {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(content)) return content.replace(pattern, line);
  return content.replace(/\s*$/, "\n") + line + "\n";
}

async function main() {
  const mobile = (await ask("Admin mobile (10 digits): "))
    .replace(/[\s\-+]/g, "")
    .replace(/^91/, "");

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    console.error("Not a valid 10-digit Indian mobile number.");
    process.exit(1);
  }

  const password = await ask("New admin password: ", true);
  const invalid = validatePassword(password);
  if (invalid) {
    console.error(invalid);
    process.exit(1);
  }

  const confirm = await ask("Confirm password: ", true);
  if (password !== confirm) {
    console.error("Passwords do not match.");
    process.exit(1);
  }

  const hash = await hashPassword(password);

  let content = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf8") : "";
  content = upsert(content, "ADMIN_MOBILE", mobile);
  content = upsert(content, "ADMIN_PASSWORD_HASH", hash);
  writeFileSync(ENV_PATH, content, "utf8");

  console.log("\nSaved ADMIN_MOBILE and ADMIN_PASSWORD_HASH to .env.local.");
  console.log("Set the same two values in your production environment.");
  console.log("Restart the dev server for the change to take effect.");
}

main();
