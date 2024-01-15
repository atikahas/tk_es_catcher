import db from '$lib/db';

export async function GET() {
    try {
        const [es_data] = await db.query('SELECT DISTINCT telegram_edisi_siasat.* FROM telegram_edisi_siasat JOIN telegram_edisi_siasat_img ON telegram_edisi_siasat.id = telegram_edisi_siasat_img.es_id ORDER BY telegram_edisi_siasat.date_posted DESC LIMIT 8');
        const [es_img] = await db.query('SELECT * FROM (SELECT telegram_edisi_siasat_img.*, ROW_NUMBER() OVER (PARTITION BY telegram_edisi_siasat_img.es_id) as rn FROM telegram_edisi_siasat JOIN telegram_edisi_siasat_img ON telegram_edisi_siasat.id = telegram_edisi_siasat_img.es_id) t WHERE t.rn = 1');

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