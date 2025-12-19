const bcrypt = require('bcryptjs');

// Helper script to generate password hashes for admin users
async function generatePasswordHashes() {
    const passwords = {
        'blu123': await bcrypt.hash('admin123', 10),
        'super123': await bcrypt.hash('super123', 10),
        'password123': await bcrypt.hash('password123', 10)
    };
    
    console.log('Generated password hashes:');
    for (const [password, hash] of Object.entries(passwords)) {
        console.log(`Password: ${password}`);
        console.log(`Hash: ${hash}`);
        console.log('---');
    }
    
    // SQL insert statements
    console.log('\nSQL Insert Statements (copy these to Supabase SQL editor):');
    console.log(`INSERT INTO admin_users (email, password_hash, name, role) VALUES ('admin@example.com', '${passwords['admin123']}', 'Admin User', 'admin');`);
    console.log(`INSERT INTO admin_users (email, password_hash, name, role) VALUES ('superadmin@example.com', '${passwords['super123']}', 'Super Admin', 'superadmin');`);
}

generatePasswordHashes().catch(console.error);