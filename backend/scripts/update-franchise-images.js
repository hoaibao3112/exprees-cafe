const { Client } = require('pg');

async function run() {
  const client = new Client({
    host: 'db.rbjdrnfwpobgozsgcfhr.supabase.co',
    port: 5432,
    user: 'postgres',
    password: 'Kimloan@@311224',
    database: 'postgres',
  });

  await client.connect();
  try {
    const q1 = `UPDATE franchise_packages
      SET images = 'franchise_packages/fr_exp_1.jpg,franchise_packages/fr_exp_2.jpg,franchise_packages/fr_exp_3.png,franchise_packages/fr_exp_4.png'
      WHERE id = '4052c047-8694-45d6-bb78-4624475d7053';`;

    const q2 = `UPDATE franchise_packages
      SET images = 'franchise_packages/fr_kiosk_1.png,franchise_packages/fr_kiosk_2.png,franchise_packages/fr_kiosk_3.jpg,franchise_packages/fr_kiosk_4.png'
      WHERE id = '2b9a37dc-2fd6-4f90-9531-08fb85fb4cb6';`;

    console.log('Running update for EXPRESS package...');
    await client.query(q1);
    console.log('EXPRESS updated.');

    console.log('Running update for KIOSK package...');
    await client.query(q2);
    console.log('KIOSK updated.');
  } catch (err) {
    console.error('Error running queries:', err);
  } finally {
    await client.end();
  }
}

run();
