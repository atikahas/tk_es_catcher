import db from '$lib/db';

export async function GET() {
    try {
        const [es_entities] = await db.query("SELECT a.ntts AS 'text', COUNT(*) AS 'size' FROM (SELECT ntts, LENGTH(ntts) AS l FROM telegram_edisi_siasat_NTTS HAVING l > 2)a WHERE a.ntts != 'Ha3' AND a.ntts != 'hang' GROUP BY a.ntts");

        return new Response(
            JSON.stringify({ success: true, data: {es_entities} }),
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