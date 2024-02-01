<script>
    import {
        Card,
        Button,
        Span,
        Badge,
        Hr,
        Heading,
        P,
        Mark,
    } from "flowbite-svelte";
    import { ArrowRightOutline } from "flowbite-svelte-icons";
    import { onMount } from "svelte";

    let es = [];
    let es_news_img = [];

    onMount(async () => {
        const response = await fetch("/getNews");
        if (response.ok) {
            es = await response.json();
            es_news_img = es.data.es_data;
        } else {
            console.error("Error fetching es");
        }
    });

    const truncateDetails = (details) => {
        return details.split(" ").slice(0, 7).join(" ") + "...";
    };

    const formatDate = (datetime) => {
        const date = new Date(datetime);
        const options = { day: "numeric", month: "short", year: "numeric" };
        return date.toLocaleDateString("en-UK", options);
    };

    const formatTime = (datetime) => {
        const time = new Date(datetime);
        const options = { hour: "numeric", minute: "numeric", hour12: true };
        return time.toLocaleTimeString("en-US", options);
    };

    

    
</script>

<div class="mx-auto max-w-6xl font-sans text-lg mt-1">
    

    <div class="grid gap-4 md:grid-cols-4">
        {#if Array.isArray(es_news_img)}
            {#each es_news_img as ei}
                <Card>
                    <div class="flex justify-between items-center">
                        <h5
                            class="font-bold tracking-tight text-gray-900 dark:text-white mb-6"
                        >
                            <Span
                                underline
                                decorationClass="decoration-8 decoration-blue-400 dark:decoration-blue-600"
                            >
                                {formatDate(ei.date_posted)}
                            </Span>
                        </h5>
                        <div>
                            <Badge class="font-semibold mb-6"
                                >{formatTime(ei.date_posted)}</Badge
                            >
                        </div>
                    </div>
                    <p
                        class="mb-3 font-normal text-gray-700 dark:text-gray-400 leading-tight"
                    >
                        {truncateDetails(ei.details)}
                    </p>
                    <Button
                        size="xs"
                        class="w-fit"
                        href="/edisi_siasat/details/{ei.id}"
                    >
                        Read more <ArrowRightOutline
                            class="w-3.5 h-3.5 ms-2 text-white"
                        />
                    </Button>
                </Card>
            {/each}
        {/if}
    </div>

</div>

<style>
</style>
