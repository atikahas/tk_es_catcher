import db from '$lib/db';

export async function GET() {
    try {

        var q = `
            select a.es_id, a.negeri, b.date_posted
            from
            (select es_id, negeri from telegram_edisi_siasat_location where negeri is not null)a
            left join 
            (select id, date_posted from telegram_edisi_siasat)b
            on a.es_id = b.id
            order by b.date_posted
        `;
        const [smap] = await db.query(q);

        return new Response(
            JSON.stringify({ success: true, data: {smap} }),
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