import db from '$lib/db';

export async function GET() {
    try {

        var q = `
            SELECT *, DATE(date_posted) AS date_news, TIME(date_posted) AS time_news FROM telegram_edisi_siasat 
            ORDER BY date_posted DESC
            LIMIT 7
        `;
        const [latestnews] = await db.query(q);

        return new Response(
            JSON.stringify({ success: true, data: {latestnews} }),
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