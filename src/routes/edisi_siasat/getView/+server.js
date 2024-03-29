import db from '$lib/db';

export async function GET() {
    try {
        const [es_data] = await db.query('SELECT a.*,b.location, b.negeri, b.daerah FROM telegram_edisi_siasat a LEFT JOIN (SELECT * FROM telegram_edisi_siasat_location WHERE negeri IS NOT NULL GROUP BY es_id, msg_id) b ON a.id = b.es_id AND a.msg_id = b.msg_id ORDER BY date_posted DESC');
        const [es_img] = await db.query('SELECT * FROM telegram_edisi_siasat_img');

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