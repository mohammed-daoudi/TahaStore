const { getSequelize } = require('./config');
const { initializeModels } = require('./models');

const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // Get database connection
    const sequelize = await getSequelize();
    
    // Initialize models
    const models = await initializeModels(sequelize);
    
    // Sync all models with database
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database tables synchronized successfully.');
    
    // Check if we need to seed data
    const userCount = await models.User.count();
    if (userCount === 0) {
      console.log('🌱 No data found. Running seed script...');
      const { seedDatabase } = require('../scripts/seedDatabase');
      await seedDatabase();
    } else {
      console.log(`✅ Database already contains ${userCount} users. Skipping seed.`);
    }
    
    console.log('✅ Database initialization completed successfully.');
    return { sequelize, models };
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

module.exports = { initializeDatabase }; 