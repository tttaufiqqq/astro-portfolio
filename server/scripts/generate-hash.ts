import bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password) {
  console.error('Usage: ts-node scripts/generate-hash.ts YOUR_PASSWORD');
  process.exit(1);
}

bcrypt.hash(password, 12).then(hash => {
  console.log('\nPaste this into your .env as ADMIN_PASSWORD_HASH:');
  console.log(hash);
});
