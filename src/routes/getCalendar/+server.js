import db from '$lib/db';

export async function GET() {
    try {

        var q = `
            SELECT DATE(date_posted), COUNT(*) FROM telegram_edisi_siasat 
            GROUP BY DATE(date_posted)
        `;
        const [cal] = await db.query(q);

        return new Response(
            JSON.stringify({ success: true, data: {cal} }),
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