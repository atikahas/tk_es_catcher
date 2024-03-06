import db from '$lib/db';

export async function GET() {
    try {
        const [es_map] = await db.query('SELECT negeri, COUNT(*) AS ttl FROM telegram_edisi_siasat_location WHERE negeri IS NOT NULL GROUP BY negeri');

        return new Response(
            JSON.stringify({ success: true, data: {es_map} }),
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