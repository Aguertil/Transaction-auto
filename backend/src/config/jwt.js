import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

console.log('🔑 JWT_SECRET configuré:', JWT_SECRET.substring(0, 20) + '...');

