<script>
    import { Card, Button, Span, Badge, Hr, Heading, P, Mark} from 'flowbite-svelte';
    import { ArrowRightOutline } from 'flowbite-svelte-icons';
    import * as d3 from 'd3';
    import cloud from 'd3-cloud';
    import { onMount } from 'svelte';

    let es = [];
    let es_news_img = [];
    let es_entities = [];

    onMount(async () => {
        const response = await fetch('/getNews');
        if (response.ok) {
            es = await response.json();
            es_news_img = es.data.es_data;
        } else {
            console.error('Error fetching es');
        }
    });

    const truncateDetails = (details) => {
        return details.split(' ').slice(0, 7).join(' ') + '...';
    };

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

    onMount(async () => {
        const response = await fetch('/getWordCloud');
        if (response.ok) {
            const result = await response.json();
            if (result.success && Array.isArray(result.data.es_entities)) {
                es_entities = result.data.es_entities.map(e => ({
                    text: e.text,
                    size: e.size 
                }));
                wordCloud();
            } else {
                console.error('Data received from /getWordCloud does not have es_entities array');
            }
        } else {
            console.error('Error fetching word cloud data');
        }
    });

    const wordCloud = () => {
        const container = document.getElementById('word-cloud');
        const width = container.offsetWidth;
        const height = width * 0.75;

        d3.select('#word-cloud svg').remove();

        const layout = cloud()
            .size([width, height])
            .words(es_entities.map(d => ({ text: d.text, size: d.size })))
            .padding(5)
            .rotate(0)
            .fontSize(d => d.size)
            .on('end', draw);

        layout.start();

        function draw(words) {
            const svg = d3.select('#word-cloud').append('svg')
                .attr('width', layout.size()[0])
                .attr('height', layout.size()[1])
                .append('g')
                .attr('transform', `translate(${layout.size()[0] / 2},${layout.size()[1] / 2})`);

            svg.selectAll('text')
                .data(words)
                .enter().append('text')
                .style('font-size', d => `${d.size}px`)
                .attr('text-anchor', 'middle')
                .attr('transform', d => `translate(${d.x}, ${d.y})`)
                .text(d => d.text);

        }
    };



</script>
<style>
    .word-cloud-container {
        width: 100%;
        height: auto;
        margin-top: 2rem;
    }
</style>


<div class="mx-auto max-w-6xl font-sans text-lg mt-1">
    
    <Hr classHr="w-48 h-1 mx-auto my-4 rounded md:my-10" />
    <div class="mb-6 text-center">
        <Heading tag="h1" class="mb-2">Edisi Siasat <Mark>latest</Mark> news on Telegram </Heading>
        <P class="text-center">Stay updated, stay informed - your daily dose of news at your fingertips.</P>
    </div>
    
    <div class="grid gap-4 md:grid-cols-4">
        {#if Array.isArray(es_news_img)}
            {#each es_news_img as ei}
                <Card>
                    <div class="flex justify-between items-center">
                        <h5 class="font-bold tracking-tight text-gray-900 dark:text-white mb-6">
                            <Span underline decorationClass="decoration-8 decoration-blue-400 dark:decoration-blue-600">
                                {formatDate(ei.date_posted)}
                            </Span>
                        </h5>
                        <div>
                            <Badge class="font-semibold mb-6">{formatTime(ei.date_posted)}</Badge>
                        </div>
                    </div>
                    <p class="mb-3 font-normal text-gray-700 dark:text-gray-400 leading-tight">{truncateDetails(ei.details)}</p>
                    <Button size="xs" class="w-fit" href="/edisi_siasat/details/{ei.id}" >
                        Read more <ArrowRightOutline class="w-3.5 h-3.5 ms-2 text-white" />
                    </Button>
                </Card>
            {/each}
        {/if}
    </div>

    <div id="word-cloud" class="word-cloud-container text-center">
    </div>
</div>
