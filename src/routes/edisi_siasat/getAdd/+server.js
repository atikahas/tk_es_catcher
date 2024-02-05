import db from '$lib/db';
import { saveImage } from '$lib/image'; 

export async function POST({request}) {
    try {
        const formData = await request.formData();

        const esDetails = formData.get('esDetails');
        const esDate = formData.get('esDate');
        const esSourceName = formData.get('esSourceName');
        const esSourceURL = formData.get('esSourceURL');
        const esDateCreated = new Date();

        const imageCount = formData.get('imageCount');
        const entryImages = [];
        for (let i = 0; i < imageCount; i++) {
            const image = formData.get(`image-${i}`);
            const imageDetail = formData.get(`imageDetails-${i}`);
            entryImages.push({ image, imageDetail });
        }

        const [result] = await db.query('INSERT INTO telegram_edisi_siasat (details, date_posted, source_name, source_url, created_at) VALUES (?, ?, ?, ?, ?)', [esDetails, esDate, esSourceName, esSourceURL, esDateCreated]);
        const entryId = result.insertId;

        for (const entryImage of entryImages) {
            const imagePath = await saveImage(entryImage.image);
            await db.query('INSERT INTO telegram_edisi_siasat_img (es_id, img_url, img_details, created_at) VALUES (?, ?, ?, ?)', [entryId, imagePath, entryImage.imageDetail, esDateCreated]);
        }

        return new Response(
            JSON.stringify({ success: true }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (err) {
        console.error(err);
        return new Response(
            JSON.stringify({ success: false, message: 'Internal Error'}),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}
