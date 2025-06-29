const { getSequelize } = require('./database/config');
const { initializeModels } = require('./database/models');
const bcrypt = require('bcrypt');

async function resetAdminPassword() {
    const sequelize = await getSequelize();
    const models = await initializeModels(sequelize);
    const admin = await models.User.findOne({ where: { email: 'admin@shopease.com' } });
    if (!admin) {
        console.error('Admin user not found!');
        process.exit(1);
    }
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await admin.update({ mot_passe: hashedPassword });
    console.log('✅ Admin password reset to admin123');
    process.exit(0);
}

resetAdminPassword(); 