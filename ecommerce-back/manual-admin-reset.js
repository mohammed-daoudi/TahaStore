const { getSequelize, testConnection } = require('./database/config');
const { initializeModels } = require('./database/models');

async function manualAdminReset() {
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
        
        // Use a known working hash for 'admin123'
        // This hash was generated with bcrypt and verified to work
        const knownWorkingHash = '$2b$10$izHRSv6KynUIKTRBil/7MuQwrqWZn0RCs0CI1w8fOQEe.RQPs8hQy';
        
        // Update the password with the known working hash
        await admin.update({ mot_passe: knownWorkingHash });
        
        // Verify the update worked
        await admin.reload();
        console.log('Updated password hash:', admin.mot_passe);
        
        await sequelize.close();
        console.log('✅ Admin password manually reset with known working hash');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

manualAdminReset(); 