import path from 'path';

export const PORT = process.env.PORT || 3000;
export const STORAGE = 'dist';
export const DB_PATH = path.join(STORAGE, 'picturama.db');
export const STATIC_FILES = path.join(STORAGE, 'client');
export const APP_PATH = path.join(__dirname, '../../dist/client', 'index.html');

export default {};
