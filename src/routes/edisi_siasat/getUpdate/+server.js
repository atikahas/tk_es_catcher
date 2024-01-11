import db from '$lib/db';

export async function POST({ request }) {
    try {
        const data = await request.json();
        console.log(data);
        const { id, details } = data; 

        await db.query('UPDATE telegram_edisi_siasat SET details = ? WHERE id = ?', [details, id]);

        return {
            status: 200,
            body: { success: true, message: 'Item updated successfully' }
        };
    } catch (err) {
        console.error('Server error:', err);
        return {
            status: 500,
            body: { success: false, message: 'Internal Server Error' }
        };
    }
}