const { getSequelize, testConnection } = require('./database/config');

async function directSqlReset() {
    try {
        const sequelize = await getSequelize();
        await testConnection();
        
        // Use a known working hash for 'admin123'
        const knownWorkingHash = '$2b$10$izHRSv6KynUIKTRBil/7MuQwrqWZn0RCs0CI1w8fOQEe.RQPs8hQy';
        
        // Direct SQL update
        const [affectedRows] = await sequelize.query(
            'UPDATE users SET mot_passe = ? WHERE email = ?',
            {
                replacements: [knownWorkingHash, 'admin@shopease.com'],
                type: sequelize.QueryTypes.UPDATE
            }
        );
        
        console.log('Rows affected:', affectedRows);
        
        // Verify the update
        const [results] = await sequelize.query(
            'SELECT id, nom, email, mot_passe FROM users WHERE email = ?',
            {
                replacements: ['admin@shopease.com'],
                type: sequelize.QueryTypes.SELECT
            }
        );
        
        if (results.length > 0) {
            const admin = results[0];
            console.log('✅ Admin user found:', admin.email);
            console.log('Updated password hash:', admin.mot_passe);
            console.log('Hash matches expected:', admin.mot_passe === knownWorkingHash);
        } else {
            console.log('❌ Admin user not found');
        }
        
        await sequelize.close();
        console.log('✅ Admin password reset via direct SQL');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

directSqlReset(); 