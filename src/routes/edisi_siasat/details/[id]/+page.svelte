<script>
    import { Card, Badge, Gallery } from 'flowbite-svelte';
    import { onMount } from 'svelte';
    import { page } from '$app/stores'; 

    let newsDetails;
    let esDetails = '';
    let esImage = '';

    onMount(async () => {
        const id = $page.params.id; 
        newsDetails = await fetchNewsDetails(id);
    });

    async function fetchNewsDetails(id) {
        const response = await fetch(`/edisi_siasat/getDetail/${id}`);
            if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        esDetails = data.data.es_data[0];
        esImage = data.data.es_img;
    }

    const formatDate = (datetime) => {
        const date = new Date(datetime);
        const options = {day: 'numeric', month: 'short', year: 'numeric'};
        return date.toLocaleDateString('en-UK', options);
    };

    const formatTime = (datetime) => {
        const time = new Date(datetime);
        const options = { hour: 'numeric', minute: 'numeric', hour12: true };
        return time.toLocaleTimeString('en-US', options);
    };
    
    function formatWithLineBreaks(str) {
        return str.replace(/(?:\r\n|\r|\n)/g, '<br>');
    }

</script>

<div class="mx-auto max-w-6xl font-sans text-lg rounded-lg mt-10 shadow-lg">
    <Card size="xl">
        <div>
            <Badge class="font-semibold mb-6 text-xl">{formatDate(esDetails.date_posted)} - {formatTime(esDetails.date_posted)}</Badge>
        </div>
        
        {esDetails.details}
        <!-- {@html formatWithLineBreaks(esDetails.details)} -->
        <!-- <Gallery items={images} class="gap-4 grid-cols-2 md:grid-cols-3" /> -->

        {#if Array.isArray(esImage)}
            {#each esImage as ei}
                <div>
                    <img src="http://172.20.100.190/media/{ei.img_url}" class="h-auto w-auto rounded-lg" alt=""/> 
                </div>
            {/each}
        {/if}
    </Card>
</div>