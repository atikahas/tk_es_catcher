import db from '$lib/db';

export async function POST({ request }) {
    try {
        const data = await request.json();
        const { id, details } = data; 

        await db.query('UPDATE telegram_edisi_siasat SET details = ? WHERE id = ?', [details, id]);

        return new Response(
            JSON.stringify({ success: true, message: 'Item updated successfully' }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (err) {
        return new Response(
            JSON.stringify({ success: false, message: 'Internal Server Error'}),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}