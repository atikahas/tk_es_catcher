import db from '$lib/db';

async function fetchNewsRetry(apiKeys, apiUrlBase) {
    for (let apiKey of apiKeys) {
        try {
            const response = await fetch(`${apiUrlBase}&apiKey=${apiKey}`, {
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            });
            if (response.ok) {
                return await response.json(); // Return the news data on successful fetch
            }
            console.log(`Failed with apiKey ${apiKey}: ${response.status} - ${response.statusText}`);
        } catch (error) {
            console.error(`Error with apiKey ${apiKey}: ${error.message}`);
        }
    }
    throw new Error('All API keys exhausted, failed to fetch news data.');
}

export async function GET() {
    const apiKeys = [
        '99aa5838305d45f6893a8513475ebb71',
        '0af6700fd4da4e6286d818c6fb340f49',
        '101fe00f13a44c4b923ab020e69e0e6e',
        '8fd2f3f34ffd4ca88800937c7bf20d7d',
        '7e01de3bf9cb480e9ba924c07ef0a9c1',
        '6f13007139174377b37acb0e9ae1c652',
        'd82b1b565a684d13a53a41fe18c7858b',
        '6d7ea9dce747423eb14a8285fa3e7e7c',
        'd4bee73e416e401bace2ab4f3e4f5cd5',
        '3248c5662e30444bb60bd0985a65052',
        '7849ad3d0b024a1ebd2187e8a3d11d1f',
        '7bc5c329c47e4306a9441c88219f6b01',
        'd093053d72bc40248998159804e0e67d',
        '0aaa70fc059f4d69ba439fabedd33834',
        '325209d6f52d4d5481b0983f650f40bf'
    ];

    const newsApiUrl = 'https://newsapi.org/v2/top-headlines?country=my&sortBy=popularity&pageSize=8';

    try {
        const news = await fetchNewsRetry(apiKeys, newsApiUrl);
        const [es_data] = await db.query('SELECT DISTINCT telegram_edisi_siasat.*, telegram_edisi_siasat_img.img_url FROM telegram_edisi_siasat JOIN telegram_edisi_siasat_img ON telegram_edisi_siasat.id = telegram_edisi_siasat_img.es_id ORDER BY telegram_edisi_siasat.date_posted DESC');
        const [es_img] = await db.query("SELECT a.*, b.* FROM (SELECT * FROM `telegram_edisi_siasat` ORDER BY created_at DESC LIMIT 20) a LEFT JOIN (SELECT es_id, msg_id, img_url FROM `telegram_edisi_siasat_img` WHERE img_url IS NOT NULL OR img_url = '' GROUP BY es_id, msg_id) b ON a.id = b.es_id AND a.msg_id = b.msg_id WHERE b.img_url IS NOT NULL OR b.img_url = '' LIMIT 3");

        return new Response(
            JSON.stringify({ success: true, data: { es_data, es_img, news } }),
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
            JSON.stringify({ success: false, message: 'Failed to fetch data' }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}