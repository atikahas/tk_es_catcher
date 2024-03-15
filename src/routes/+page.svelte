<script>
    import {Heading, P, Mark} from "flowbite-svelte";
    import { onMount } from "svelte";
    import * as d3 from "d3";
    import cloud from "d3-cloud";

    let es = [];
    let es_news = [];
    let es_news_img = [];
    let es_entities = [];
    let ls = [];
    let now = new Date();

    function formatDate(date) {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('en-UK', options);
    }

    setInterval(() => {
        now = new Date();
    }, 60000);

    const truncateDetails = (details) => {
        return details ? details.split(" ").slice(0, 7).join(" ") + "..." : '...';
    };

    function timeAgo(dateString) {
        const newsDate = new Date(dateString);
        const now = new Date();
        const diff = now - newsDate; // difference in milliseconds
        const hours = Math.floor(diff / 3600000); // converting milliseconds to hours
        const minutes = Math.floor(diff / 60000); // converting milliseconds to minutes

        if (hours < 1) {
            return `${minutes} minutes ago`;
        } else {
            return `${hours} hours ago`;
        }
    }

    onMount(async () => {
        try {
            const [newsResponse, latestResponse, wordCloudResponse] = await Promise.all([
                fetch("/getNews"),
                fetch("/getLatest"),
                fetch("/getWordCloud")
            ]);

            if (newsResponse.ok) {
                const newsData = await newsResponse.json();
                es = newsData;
                es_news = newsData.data.es_data;
                es_news_img = newsData.data.es_img;
            } else {
                throw new Error('Error fetching news');
            }

            if (latestResponse.ok) {
                const latestData = await latestResponse.json();
                ls = latestData.data.latestnews;
            } else {
                throw new Error('Error fetching latest news');
            }

            if (wordCloudResponse.ok) {
                const wordData = await wordCloudResponse.json();
                if (wordData.success && Array.isArray(wordData.data.es_entities)) {
                    es_entities = wordData.data.es_entities.map(e => ({
                        text: e.text,
                        size: e.size
                    }));
                    wordCloud(); 
                } else {
                    throw new Error('Word cloud data not found');
                }
            } else {
                throw new Error('Error fetching word cloud');
            }
        } catch (error) {
            console.error(error.message);
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
                .attr("transform", `translate(${layout.size()[0] / 2}, ${layout.size()[1] / 2})`);

            svg.selectAll("text")
                .data(words)
                .enter()
                .append("text")
                .style("font-size", (d) => `${Math.min(d.size - 5, 150)}px`)
                .attr("text-anchor", "middle")
                .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
                .attr("fill", "#9CA3AF")
                .style("cursor", "pointer")
                .text((d) => d.text)
                .on("click", (event,d) => {
                    window.location.href = `/edisi_siasat/view?searchCloud=${encodeURIComponent(d.text)}`;
                })
                .on("mouseover", (event, d) => {
                    d3.select(event.currentTarget)
                        .attr("fill", "#1c64f2")
                        .style("font-size", (d) => `${Math.min(d.size + 5, 150)}px`)
                })
                .on("mouseout", (event, d) => {
                    d3.select(event.currentTarget)
                        .attr("fill", "#9CA3AF")
                        .style("font-size", (d) => `${Math.min(d.size - 5, 150)}px`)
                })
        }
    };
</script>

<section>
    <div class="text-center mb-4">
        <Heading tag="h2" class="mb-2 ">Siasat <Mark>latest</Mark> news</Heading>
        <P class="text-center">Stay updated, stay informed - your daily dose of news at your fingertips.</P>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        <div class="md:col-span-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div class="sm:col-span-3">
                    <div class="mb-3">
                        <div class="flex justify-between items-center dark:bg-gray-600">
                            <div class="text-gray-500 sm:text-lg dark:text-gray-400 mt-4">
                                <blockquote class="p-1 pl-2 border-s-8 border-blue-300">
                                    <p class="text-xl italic font-medium leading-relaxed text-gray-900 dark:text-white">{formatDate(now)}</p>
                                </blockquote>
                            </div>
                            <a href="/edisi_siasat/view" class="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-700">
                                More News
                                <svg class="ml-1 w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                            </a>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {#if Array.isArray(es_news)}
                        {#each es_news.slice( 0,5) as ei}
                            {#if ei.img_url.endsWith('.jpg') || ei.img_url.endsWith('.jpeg') || ei.img_url.endsWith('.png') || ei.img_url.endsWith('.gif')}
                                <div class="relative group">
                                    <a href="/edisi_siasat/details/{ei.id}" class="block hover:scale-[1.05] duration-300 ease-in-out hover:drop-shadow-xl overflow-hidden">
                                        <img src={`http://172.20.100.190/media/${ei.img_url}`} class="h-40 md:h-40 w-full md:w-full rounded-lg object-cover group-hover:grayscale-0 grayscale transition-all duration-300" alt=""/>
                                        <div class="absolute top-0 left-0 w-full h-40 flex items-center justify-center bg-black/50 rounded-lg opacity-100 transition-opacity duration-300 ease-in-out">
                                            <span class="text-white text-lg md:text-xl text-center font-semibold">{truncateDetails(ei.details)}</span>
                                        </div>
                                    </a>
                                </div>
                            {/if}
                        {/each}
                    {/if}

                    </div>
                </div>
                <div class="md:col-span-3 hidden lg:block">
                    <div class="mb-4">
                        <div class="flex justify-between items-center dark:bg-gray-600">
                            <div class="text-gray-500 sm:text-lg dark:text-gray-400">
                                <blockquote class="p-1 pl-2 border-s-8 border-blue-300">
                                    <p class="text-xl italic font-medium leading-relaxed text-gray-900 dark:text-white">Most Mentioned</p>
                                </blockquote>
                            </div>
                        </div>
                    </div>
                    <div class="rounded-lg">
                        <div id="word-cloud" class="word-cloud-container text-center content-center max-h-screen"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="md:col-span-1">
            <div class="mb-3">
                <div class="flex justify-between items-center dark:bg-gray-600">
                    <div class="text-gray-500 sm:text-lg dark:text-gray-400">
                        <blockquote class="p-1 pl-2 border-s-8 border-blue-300">
                            <p class="text-xl italic font-medium leading-relaxed text-gray-900 dark:text-white">Latest News</p>
                        </blockquote>
                    </div>
                </div>
            </div>
            <div class="rounded-lg">
                <ol class="relative border-s border-gray-200 dark:border-gray-700">  
                    {#if Array.isArray(ls)}
                        {#each ls as l}
                        <li class="mb-5 ms-4">
                            <div class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-white-900 dark:bg-gray-700"></div>
                            <time class="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                                {timeAgo(l.date_posted)}
                            </time>
                            <a href="/edisi_siasat/details/{l.id}">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{truncateDetails(l.details)}</h3>
                            </a>
                        </li>
                        {/each}
                    {/if}
                </ol>
            </div>
        </div>
    </div>
</section>

