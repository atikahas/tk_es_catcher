import db from '$lib/db';

export async function GET({params}) {
    const { id } = params;
    try {
        const es = 'SELECT * FROM telegram_edisi_siasat WHERE id = ?';
        const img = 'SELECT * FROM telegram_edisi_siasat_img WHERE es_id = ?';
        const [es_data] = await db.query(es, [id]);
        const [es_img] = await db.query(img, [id]);

        return new Response(
            JSON.stringify({ success: true, data: {es_data, es_img} }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (err) {
        console.error('Server error:', err);
        return new Response(
            JSON.stringify({ success: false, message: 'Internal Error' }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}