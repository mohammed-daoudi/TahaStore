const bcrypt = require('bcrypt');
const { getSequelize, testConnection } = require('./database/config');
const { initializeModels } = require('./database/models');

async function checkAdminPassword() {
    try {
        const sequelize = await getSequelize();
        await testConnection();
        const models = await initializeModels(sequelize);
        
        const adminUser = await models.User.findOne({
            where: { email: 'admin@shopease.com' }
        });
        
        if (!adminUser) {
            console.log('Admin user not found');
            return;
        }
        
        console.log('Admin user found:');
        console.log('ID:', adminUser.id);
        console.log('Name:', adminUser.nom);
        console.log('Email:', adminUser.email);
        console.log('Role:', adminUser.role);
        console.log('Password hash:', adminUser.mot_passe);
        
        // Test password comparison
        const testPassword = 'admin123';
        const isValid = await bcrypt.compare(testPassword, adminUser.mot_passe);
        console.log('Password "admin123" is valid:', isValid);
        
        // Generate new hash for comparison
        const newHash = await bcrypt.hash(testPassword, 10);
        console.log('New hash for "admin123":', newHash);
        
        await sequelize.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkAdminPassword(); 