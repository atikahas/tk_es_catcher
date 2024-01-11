import fs from 'fs';
import path from 'path';

export async function saveImage(imageFile) {
    const uploadPath = path.resolve('static/edisi_siasat');

    fs.mkdirSync(uploadPath, { recursive: true });

    const fileName = generateUniqueFileName(imageFile.name);
    const filePath = path.join(uploadPath, fileName);

    const buffer = await imageFile.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    return filePath;
}

function generateUniqueFileName(originalName) {
    const now = new Date();
    const datePart = now.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
    const timePart = now.toTimeString().split(' ')[0].replace(/:/g, ''); // HHMMSS

    return `${datePart}-${timePart}-${originalName}`;
}

// function generateUniqueFileName(originalName) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     return uniqueSuffix + '-' + originalName;
// }

