const bcrypt = require('bcrypt');
const { getSequelize, testConnection } = require('./database/config');
const { initializeModels } = require('./database/models');

async function forceResetAdminPassword() {
    try {
        const sequelize = await getSequelize();
        await testConnection();
        const models = await initializeModels(sequelize);
        
        // Find admin user
        const admin = await models.User.findOne({ 
            where: { email: 'admin@shopease.com' } 
        });
        
        if (!admin) {
            console.error('❌ Admin user not found!');
            process.exit(1);
        }
        
        console.log('✅ Admin user found:', admin.email);
        console.log('Current password hash:', admin.mot_passe);
        
        // Generate new hash for admin123
        const newPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log('New password hash:', hashedPassword);
        
        // Update the password
        await admin.update({ mot_passe: hashedPassword });
        
        // Verify the update worked
        await admin.reload();
        console.log('Updated password hash:', admin.mot_passe);
        
        // Test password verification
        const isValid = await bcrypt.compare(newPassword, admin.mot_passe);
        console.log('Password verification test:', isValid);
        
        if (isValid) {
            console.log('✅ Admin password successfully reset to admin123');
        } else {
            console.log('❌ Password verification failed!');
        }
        
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

forceResetAdminPassword(); 