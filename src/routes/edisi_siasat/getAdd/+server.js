import db from '$lib/db';
import { saveImage } from '$lib/image'; 

export async function POST({request}) {
    try {
        const formData = await request.formData();
        // console.log(formData);

        const esDetails = formData.get('esDetails');
        const esDate = formData.get('esDate');
        const esDateCreated = new Date();
        const images = formData.getAll('images[]');

        const [result] = await db.query('INSERT INTO telegram_edisi_siasat (details, date_posted, created_at) VALUES (?, ?, ?)', [esDetails, esDate, esDateCreated]);
        const entryId = result.insertId;

        for (const image of images) {
            const imagePath = await saveImage(image);
            await db.query('INSERT INTO telegram_edisi_siasat_img (es_id, img_url, created_at) VALUES (?, ?, ?)', [entryId, imagePath, esDateCreated]);
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
