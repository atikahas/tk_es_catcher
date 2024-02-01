<script>
    import "../app.pcss";
    import Header from "./Header.svelte";
    import { onMount, onDestroy } from "svelte";
    import * as d3 from "d3";
    import cloud from "d3-cloud";
    import { Hr, Heading, P, Mark } from "flowbite-svelte";
    import scrollama from "scrollama";
    // import Footer from "./Footer.svelte";

    let es_entities = [];

    onMount(async () => {
        const response = await fetch("/getWordCloud");
        if (response.ok) {
            const result = await response.json();
            console.log(result);
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
        // const width = window.innerWidth;
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

            // svg.selectAll('text')
            //     .data(words)
            //     .enter().append('text')
            //     .style('font-size', d => `${d.size}px`)
            //     .attr('text-anchor', 'middle')
            //     .attr('transform', d => `translate(${d.x}, ${d.y})`)
            //     .text(d => d.text)
            //     .on('mouseover', function (d) {
            //         d3.select(this)
            //             .attr('fill', '#1C64F2')
            //             .style('font-size', d => `${d.size+10}px`)
            //             .style('z-index', '2')
            //     })
            //     .on('mouseout', function (d) {
            //         d3.select(this)
            //             .transition()
            //             .duration(500)
            //             .attr('fill', 'black')
            //             .style('font-size', d => `${d.size}px`)
            //     });

            svg.selectAll("text")
                .data(words)
                .enter()
                .append("text")
                .style("font-size", (d) => `${d.size}px`)
                .attr("text-anchor", "middle")
                .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
                .attr("fill", "#9CA3AF") // Ensure default fill is set
                .text((d) => d.text);

            // Function to apply blink effect to three random texts simultaneously
            const blinkRandomTexts = () => {
                // Generate three unique random indices
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
                        .transition() // Chain another transition to revert
                        .duration(3000)
                        .attr("fill", "#9CA3AF")
                        .style("font-size", (d) => `${d.size}px`);
                });
            };

            // Set interval to blink text randomly
            d3.interval(blinkRandomTexts, 100); // Adjust time as needed
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
        totalSections = document.querySelectorAll("section").length;
        window.addEventListener("wheel", handleWheel);
    });
</script>

<div class="app">
    <Header />
    <section class="bg-white dark:bg-primary-700">
        <Hr classHr="w-48 h-1 mx-auto my-4 rounded md:my-10" />
        <div class="mb-6 text-center">
            <Heading tag="h1" class="mb-2"
                >Edisi Siasat <Mark>latest</Mark> news on Telegram
            </Heading>
            <P class="text-center"
                >Stay updated, stay informed - your daily dose of news at your
                fingertips.</P
            >
        </div>
        <div
            id="word-cloud"
            class="word-cloud-container text-center content-center"
        ></div>
    </section>
    <section class="bg-white dark:bg-primary-700">
        <div class="min-h-screen pt-20 p-20">
            <slot />
        </div>
    </section>

    <!-- <Footer /> -->
</div>
