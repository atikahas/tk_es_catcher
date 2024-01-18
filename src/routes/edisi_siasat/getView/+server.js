import db from '$lib/db';

export async function GET() {
    try {
        const [es_data] = await db.query('SELECT * FROM telegram_edisi_siasat WHERE updated_at IS NULL ORDER BY date_posted DESC LIMIT 20');
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