import db from '$lib/db';

export async function GET() {
    try {

        let query = `

                        SELECT a.ntts AS 'text', COUNT(*) AS 'size' 
                        FROM 
                        (SELECT a.ntts, a.l 
                        FROM 
                        (SELECT es_id, ntts, LENGTH(ntts) AS l 
                        FROM telegram_edisi_siasat_NTTS 
                        HAVING l > 2)a
                        LEFT JOIN 
                        (SELECT id, date_posted FROM telegram_edisi_siasat)b
                        ON a.es_id = b.id
                        ORDER BY b.date_posted DESC)a 
                        WHERE a.ntts not in ('Ha3', 'hang', 'Assalammualaikum', 'Assalamualaikum', 'judi', 'ker', 'urine', 'ler', 'hah', 'ni hah', 'korang', 'lembik', 'yer', '---', 'allah', 'al-quran', 'Ya Allah' ) 
                        GROUP BY a.ntts
                        order by size desc
                        limit 100
                        
                    `
        const [es_entities] = await db.query(query);

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