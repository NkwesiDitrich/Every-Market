require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");

function getArg(name) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

async function main() {
  const email = getArg("email") || process.env.ADMIN_EMAIL;
  const password = getArg("password") || process.env.ADMIN_PASSWORD;
  const name = getArg("name") || process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.error(
      "Missing admin credentials.\n" +
        "Provide via env vars ADMIN_EMAIL/ADMIN_PASSWORD or CLI args:\n" +
        '  node scripts/createAdmin.js --email="admin@example.com" --password="StrongPassword123" --name="Admin"\n'
    );
    process.exit(1);
  }
  if (!process.env.MONGO_URI) {
    console.error("Missing MONGO_URI in environment.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    existing.isAdmin = true;
    existing.isVerified = true;
    existing.role = 'admin';
    if (!existing.name) existing.name = name;
    await existing.save();
    console.log(`Updated existing user to admin: ${email}`);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 10);
  await User.create({
    name,
    email,
    password: hashed,
    isVerified: true,
    isAdmin: true,
    role: 'admin',
  });
  console.log(`Created admin user: ${email}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

