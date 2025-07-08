export const jwtSecret = process.env.JWT_SECRET || 'default_j'
export const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

export const emailConfigs = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD
};
