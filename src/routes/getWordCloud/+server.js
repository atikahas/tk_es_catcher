import db from '$lib/db';

export async function GET() {
    try {

        let query = `
                        SELECT a.ntts AS 'text', COUNT(*) AS 'size' 
                        FROM 
                            (SELECT ntts, LENGTH(ntts) AS l 
                            FROM telegram_edisi_siasat_NTTS 
                            HAVING l > 2)a 
                            WHERE a.ntts not in ('Ha3', 'hang', 'Assalamualaikum', 'judi', 'ker', 'urine', 'ler', 'hah', 'ni hah', 'korang', 'lembik', 'yer', '---', 'allah', 'al-quran' ) 
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