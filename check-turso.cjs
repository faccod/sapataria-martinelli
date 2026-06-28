const { createClient } = require('@libsql/client');
(async () => {
  const c = createClient({
    url: 'libsql://sapataria-martinelli-faccod.aws-us-east-1.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODI2NTkwMDAsImlkIjoiMDE5ZjBlYmYtODQwMS03YzEzLTk0MTUtMzcwMDZiYzlkMzVkIiwicmlkIjoiMGYzZWIxMmItYTZkMy00MTdiLWE4MGUtYWJkYTRiMDIyNmYyIn0.gyUcNW1gTxYgDLDX0XsMbyAlcuXvZ0_7I8jKxkYBW-HZOeXX4YeuNPBmCGsEzKdaJ8S_fPKypzQ_Gb2cX8UlBQ',
  });
  try {
    const r = await c.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    console.log('TABLES:', r.rows.map(x => x.name).join(', '));
    const p = await c.execute('SELECT COUNT(*) as c FROM Post');
    console.log('POSTS:', p.rows[0].c);
    const l = await c.execute('SELECT COUNT(*) as c FROM Lista');
    console.log('LISTA:', l.rows[0].c);
    const u = await c.execute('SELECT COUNT(*) as c FROM AdminUser');
    console.log('ADMINS:', u.rows[0].c);
  } catch (e) {
    console.error('ERRO:', e.message);
  }
})();