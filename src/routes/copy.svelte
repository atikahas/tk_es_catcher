<script>
    import {Card, Button, Span, Badge, Hr, Heading, P, Mark} from "flowbite-svelte";
    import { ArrowRightOutline } from "flowbite-svelte-icons";
    import { onMount } from "svelte";
    import * as d3 from "d3";
    import cloud from "d3-cloud";

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

    let es_entities = [];

    onMount(async () => {
        const response = await fetch("/getWordCloud");
        if (response.ok) {
            const result = await response.json();
            // console.log(result);
            if (result.success && Array.isArray(result.data.es_entities)) {
                es_entities = result.data.es_entities.map((e) => ({
                    text: e.text,
                    size: e.size,
                }));
                wordCloud();
            } else {
                console.error(
                    "Data received from /getWordCloud does not have es_entities array",
                );
            }
        } else {
            console.error("Error fetching word cloud data");
        }
    });

    const wordCloud = () => {
        const container = document.getElementById("word-cloud");
        const width = container.offsetWidth;
        const height = width * 0.35;

        d3.select("#word-cloud svg").remove();

        const layout = cloud()
            .size([width, height])
            .words(es_entities.map((d) => ({ text: d.text, size: d.size })))
            .padding(5)
            .rotate(0)
            .fontSize((d) => d.size)
            .on("end", draw);

        layout.start();

        function draw(words) {
            const svg = d3
                .select("#word-cloud")
                .append("svg")

                .attr("width", layout.size()[0])
                .attr("height", layout.size()[1])
                .append("g")
                .attr(
                    "transform",
                    `translate(${layout.size()[0] / 2},${
                        layout.size()[1] / 2
                    })`,
                );

            svg.selectAll("text")
                .data(words)
                .enter()
                .append("text")
                .style("font-size", (d) => `${d.size}px`)
                .attr("text-anchor", "middle")
                .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
                .attr("fill", "#9CA3AF")
                .text((d) => d.text);

            const blinkRandomTexts = () => {
                let indices = [];
                while (indices.length < 1) {
                    let r = Math.floor(Math.random() * words.length);
                    if (indices.indexOf(r) === -1) indices.push(r);
                }

                indices.forEach((index) => {
                    const textElement = svg
                        .selectAll("text")
                        .filter((d, i) => i === index);

                    textElement
                        .transition()
                        .duration(500)
                        .attr("fill", "#1C64F2")
                        .style("font-size", (d) => `${d.size + 10}px`)
                        .transition() 
                        .duration(3000)
                        .attr("fill", "#9CA3AF")
                        .style("font-size", (d) => `${d.size}px`);
                });
            };

            d3.interval(blinkRandomTexts, 100);
        }
    };

    let page = 0;
    let totalSections;
    let clock = 0;

    function handleWheel(event) {
        if (clock === 0) {
            clock = 1;

            let go = event.deltaY < 0 ? -1 : 1;
            page += go;
            if (page < 0) page = 0;
            if (page >= totalSections) page = totalSections - 1;

            window.scrollTo(0, window.innerHeight * page);

            setTimeout(() => (clock = 0), 1000);
        }
    }

    onMount(() => {
        document.documentElement.style.scrollBehavior = "smooth";
        document.documentElement.style.overflow = "hidden";
        totalSections = document.querySelectorAll("section").length;
        window.addEventListener("wheel", handleWheel);
    });
</script>

<!-- <Hr classHr="w-48 h-1 mx-auto my-4 rounded md:my-10" /> -->
<section>
    <div class="mb-6 text-center">
        <Heading tag="h1" class="mb-2">Siasat <Mark>latest</Mark> news
        </Heading>
        <P class="text-center pb-6">Stay updated, stay informed - your daily dose of news at your fingertips.</P>
    </div>
    <div id="word-cloud" class="word-cloud-container text-center content-center"></div>
</section>

<section>
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
</section>

<style>
    section {
        height: 100vh;
    }
</style>
