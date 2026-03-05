import fs from 'fs';
import path from 'path';

// Read the logo file
const logoPath = '/home/ubuntu/webdev-static-assets/wildsaura-logo.png';
const logoBuffer = fs.readFileSync(logoPath);

// Use the storagePut from the project
const { storagePut } = await import('./server/storage.ts');

const key = `wilds-aura/branding/wildsaura-logo.png`;
const result = await storagePut(key, logoBuffer, 'image/png');
console.log('Logo uploaded to S3:', result.url);
