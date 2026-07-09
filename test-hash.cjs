const bcrypt = require('bcryptjs');
const hash = '$2a$10$lbFTW8zI4rDih.Twy22qUuQllpPpVMicf1wcsH.TZ0yhpHdaKGWuW';

const senhas = [
  'W01082128m#',
  'W01082128m',
  'w01082128m#',
  '01082128m',
  '01082128M#',
  'martinelli',
  'Martinelli',
  'martinelli2026',
  'Martinelli2026',
  'Admin@2026',
  'admin',
  'admin123',
  'Matheus2026!',
];

console.log('=== Teste hash atual ===');
for (const s of senhas) {
  if (bcrypt.compareSync(s, hash)) {
    console.log('✅ MATCH:', s);
  }
}
console.log('(fim)');

console.log('\n=== Gerando novo hash para W01082128m# ===');
const newHash = bcrypt.hashSync('W01082128m#', 10);
console.log('novo:', newHash);
console.log('verifica:', bcrypt.compareSync('W01082128m#', newHash));

console.log('\n=== Verifica o hash do .env (admin123) ===');
const envHash = '$2a$10$rlzcY9e9m.KLEFDD5REpz.ZASgAAaN9D/UZteXwRSXJ8LCMm96lm6';
console.log('admin123:', bcrypt.compareSync('admin123', envHash));