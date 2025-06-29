const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('shopease_db', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

async function fixFavoritesTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Add missing timestamp columns
    await sequelize.query(`
      ALTER TABLE favorites 
      ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `);

    console.log('✅ Added created_at and updated_at columns to favorites table');

    // Verify the table structure
    const [results] = await sequelize.query('DESCRIBE favorites');
    console.log('✅ Current favorites table structure:');
    results.forEach(row => {
      console.log(`  ${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('✅ Timestamp columns already exist');
    } else {
      console.error('❌ Error fixing favorites table:', error);
    }
  } finally {
    await sequelize.close();
  }
}

fixFavoritesTable(); 