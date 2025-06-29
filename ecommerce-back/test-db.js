const { sequelize, testConnection } = require('./database/config');

async function testDB() {
    try {
        console.log('Testing database connection...');
        await testConnection();
        console.log('Database connection successful!');
        
        // Try to sync models
        console.log('Syncing models...');
        await sequelize.sync({ force: false });
        console.log('Models synced successfully!');
        
    } catch (error) {
        console.error('Database test failed:', error.message);
        console.error('Full error:', error);
    } finally {
        process.exit(0);
    }
}

testDB(); 