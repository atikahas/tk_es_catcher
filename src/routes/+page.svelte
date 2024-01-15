<style>
    .image-size {
    width: 200px; /* desired fixed width */
    height: 150px; /* desired fixed height */
    object-fit: cover; /* this will ensure the aspect ratio is maintained */
    }

</style>
<script>
    import { Card, Button } from 'flowbite-svelte';
    import { ArrowRightOutline } from 'flowbite-svelte-icons';
    import { onMount } from 'svelte';

    let es = [];
    let es_news_img = [];
    let es_news_img2 = [];

    onMount(async () => {
        const response = await fetch('/getNews');
        if (response.ok) {
            es = await response.json();
            es_news_img = es.data.es_data;
            es_news_img2 = es.data.es_img;
            console.log(es_news_img2);
        } else {
            console.error('Error fetching es');
        }
    });

    const truncateDetails = (details) => {
        return details.split(' ').slice(0, 7).join(' ') + '...';
    };

    const formatDate = (datetime) => {
        const date = new Date(datetime);
        return date.toLocaleDateString();
    };

    const formatTime = (datetime) => {
        const time = new Date(datetime);
        return time.toLocaleTimeString();
    };

</script>

<div class="mx-auto max-w-6xl font-sans text-lg mt-1">
    <div class="grid grid-cols-4 gap-4">
        {#if Array.isArray(es_news_img)}
            {#each es_news_img as ei}
            <Card>
                <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{formatDate(ei.date_posted)} {formatTime(ei.date_posted)}</h5>
                <p class="mb-3 font-normal text-gray-700 dark:text-gray-400 leading-tight">{truncateDetails(ei.details)}</p>
                <Button class="w-fit">
                Read more <ArrowRightOutline class="w-3.5 h-3.5 ms-2 text-white" />
                </Button>
            </Card>
            {/each}
        {/if}
    </div>
</div>
