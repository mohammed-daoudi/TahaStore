const { Sequelize } = require('sequelize');

let sequelize = null;

// Create database if it doesn't exist and return connection
const getSequelize = async () => {
  if (sequelize) {
    return sequelize;
  }

  try {
    // First connect to MySQL without specifying database
    const tempSequelize = new Sequelize('mysql', 'root', '', {
      host: 'localhost',
      dialect: 'mysql',
      port: 3306,
      logging: false
    });

    await tempSequelize.authenticate();
    console.log('✅ MySQL connection established successfully.');
    
    // Create database if it doesn't exist
    await tempSequelize.query('CREATE DATABASE IF NOT EXISTS shopease_db;');
    console.log('✅ Database "shopease_db" created/verified successfully.');
    
    // Close temporary connection
    await tempSequelize.close();
    
    // Create connection to the specific database
    sequelize = new Sequelize('shopease_db', 'root', '', {
      host: 'localhost',
      dialect: 'mysql',
      port: 3306,
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    });
    
    return sequelize;
  } catch (error) {
    console.error('❌ Unable to connect to MySQL database:', error);
    throw error;
  }
};

// Test the connection
const testConnection = async () => {
  try {
    const dbSequelize = await getSequelize();
    await dbSequelize.authenticate();
    console.log('✅ MySQL Database connection established successfully.');
    return dbSequelize;
  } catch (error) {
    console.error('❌ Unable to connect to MySQL database:', error);
    throw error;
  }
};

module.exports = { getSequelize, testConnection }; 