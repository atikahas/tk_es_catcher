<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import * as topojson from 'topojson-client';
    import moment from 'moment';
    import SvelteHeatmap from 'svelte-heatmap';

    let heatmapData = [];
    let selectedYear = new Date().getFullYear(); 
    let startDate = moment().year(selectedYear).startOf('year').toDate();
    let endDate = moment().year(selectedYear).endOf('year').toDate();

    onMount(async () => {
        await updateData(); 
    });

    async function updateData() {
        const calResponse = await fetch('/dashboard/getCalendar');
        const calData = await calResponse.json();
        heatmapData = generateData(calData.data.cal, startDate, endDate);
    }

    function generateData(cal, start, end) {
        const dataMap = new Map(cal.map(item => [moment(item.date).format('YYYY-MM-DD'), item.total]));
        const datacal = [];
        const startTime = moment(start);
        const endTime = moment(end);

        while (startTime.isBefore(endTime)) {
            const formattedDate = startTime.format('YYYY-MM-DD');
            const value = dataMap.get(formattedDate) || 0;

            datacal.push({
                date: startTime.toDate(),
                value: value,
            });

            startTime.add(1, 'day');
        }

        return datacal;
    }

    let svgMap;
    let data = [];
    let labelsRendered = false;
    let yearOptions = [];

    onMount(async () => {
        const mapResponse = await fetch('/getMap');
        const mapData = await mapResponse.json();
        data = mapData.data.smap;

        setupYears();
        updateVisualizations(selectedYear);
    });

    function setupYears() {
        const years = new Set(data.map(d => new Date(d.date_posted).getFullYear()));
        yearOptions = Array.from(years).sort((a, b) => b - a);
        selectedYear = yearOptions.includes(new Date().getFullYear()) ? new Date().getFullYear() : yearOptions[0];
        updateData();
        updateVisualizations(selectedYear);
    }

    function updateVisualizations(year) {
        const aggregatedData = aggregateData(year);
        renderMap(aggregatedData);
    }

    function aggregateData(year) {
        const monthlyData = data.reduce((acc, cur) => {
            const date = new Date(cur.date_posted);
            if (date.getFullYear() === parseInt(year)) {
                const state = cur.negeri;
                acc[state] = (acc[state] || 0) + 1;
            }
            return acc;
        }, {});
        return Object.entries(monthlyData).map(([state, total]) => ({ state, total }));
    }

    async function renderMap(cd) {
        var width = 960, height = 400;

        if (!labelsRendered) {
            labelsRendered = true; 
            return;
        }

        d3.select(svgMap).selectAll(".label-line-group").remove(); 

        const cyd = cd || []; //current year data
        const m = await fetch('data/malaysia.json');
        const mapinfo = await m.json();

        const projection = d3.geoMercator() 
            .center([101.9758, 4.2105])
            .scale(2000 + 5 * 100)
            .translate([width / 3.3, height / 2])

        const path = d3.geoPath().projection(projection);

        d3.select(svgMap)
            .attr('viewBox', [0, 0, width, height].join(' '));

        const states = topojson.feature(mapinfo, mapinfo.objects.states);
        const land = topojson.feature(mapinfo, mapinfo.objects.land);

        [land, states].forEach(d => {
            d.features
                .forEach(d => {
                    d.geometry.coordinates.forEach(d => {
                        if (d.length == 2) {
                            _shift(d);
                        } else {
                            d[0].forEach(_shift);
                        }
                    });
                });
        });
        function _shift(d, n) {
            if (!n) n = 0;
            n++;
            if (typeof d == 'object' && d.length == 2) {
                if (d[0] > 105) d[0] += -5;
            }
            return d;
        }

        states.features.forEach(d => {
            const mapping = {
                1: { state_id: 1, negeri: "JOHOR" },
                2: { state_id: 2, negeri: "KEDAH" },
                3: { state_id: 3, negeri: "KELANTAN" },
                4: { state_id: 14, negeri: "W.P. KUALA LUMPUR" },
                5: { state_id: 15, negeri: "W.P. LABUAN" },
                6: { state_id: 4, negeri: "MELAKA" },
                7: { state_id: 5, negeri: "NEGERI SEMBILAN" },
                8: { state_id: 6, negeri: "PAHANG" },
                9: { state_id: 8, negeri: "PERAK" },
                10: { state_id: 9, negeri: "PERLIS" },
                11: { state_id: 7, negeri: "PULAU PINANG" },
                12: { state_id: 16, negeri: "W.P. PUTRAJAYA" },
                13: { state_id: 12, negeri: "SABAH" },
                14: { state_id: 13, negeri: "SARAWAK" },
                15: { state_id: 10, negeri: "SELANGOR" },
                16: { state_id: 11, negeri: "TERENGGANU" }
            };
            
            if (mapping[d.properties.id]) {
                d.properties.state_id = mapping[d.properties.id].state_id;
                d.properties.negeri = mapping[d.properties.id].negeri;

                const ttlnegeri = cyd.find(c => c.state === d.properties.negeri);
                if (ttlnegeri) {
                    d.properties.total = ttlnegeri.total;
                }

            } else {
                d.properties.state_id = null;
                d.properties.negeri = null;
                d.properties.total = null;
            }

        });

        const colorScale = d3.scaleSequential()
            .domain([d3.min(states.features, d => d.properties.total), d3.max(states.features, d => d.properties.total)])
            .interpolator(d3.interpolateBlues);

        d3.select(svgMap).append('g')
            .selectAll('path')
            .data(land.features)
            .enter()
            .append('path')
            .attr('class', 'land')
            .attr('d', path)
            .style('stroke-width', 1)
            .style('stroke', '#cacaca')
            .style('fill', '#e5e5e5')

        d3.select(svgMap).append('g')
            .selectAll('path')
            .data(states.features)
            .enter()
            .append('path')
            .attr('class', 'state')
            .attr('id', d => 'state' + d.properties.id)
            .attr('d', path)
            .style('fill', d => d.properties.total != null ? colorScale(d.properties.total) : 'grey')
            .style('opacity', .8)
            .style('stroke', 'black')
            .style('stroke-width', 0.5)

        const centroids = states.features.map(d => {
            return { ...d, centroid: path.centroid(d) };
        });

        const westStates = ['PERLIS', 'KEDAH', 'PERAK', 'PULAU PINANG', 'SELANGOR', 'W.P. KUALA LUMPUR', 'W.P. PUTRAJAYA', 'NEGERI SEMBILAN', 'MELAKA', 'JOHOR'];
        const eastStates = ['PAHANG', 'TERENGGANU', 'KELANTAN'];
        const borneoStates = ['SABAH', 'SARAWAK'];
        const borneoLabuan = ['W.P. LABUAN'];

        const labelsAndLines = d3.select(svgMap).selectAll(".label-line-group")
            .data(centroids)
            .enter().append("g")
            .attr("class", "label-line-group")
            .attr("id", d=> {
                return "label-"+d.properties.state_id
            });

        const labelAdjustments = {
            'SELANGOR': {xOffset: -75, yOffset: -20},
            'W.P. KUALA LUMPUR': {xOffset: -85, yOffset: 0},
            'W.P. PUTRAJAYA': {xOffset: -80, yOffset: 15},
            'NEGERI SEMBILAN': {xOffset: -55, yOffset: 30},
            'MELAKA': {xOffset: -55, yOffset: 30},
            'JOHOR': {xOffset: -55, yOffset: 35},
            'KELANTAN': {xOffset: 60, yOffset: -30}
        };

        labelsAndLines.each(function(d) {
            const [x, y] = d.centroid;
            let xOffset = 0, yOffset = 0;
            
            if (labelAdjustments[d.properties.negeri]) {
                xOffset = labelAdjustments[d.properties.negeri].xOffset;
                yOffset = labelAdjustments[d.properties.negeri].yOffset;
            } else if (westStates.includes(d.properties.negeri) || borneoLabuan.includes(d.properties.negeri)) {
                xOffset = -55;
            } else if (borneoStates.includes(d.properties.negeri)) {
                xOffset = 100;
            } else if (eastStates.includes(d.properties.negeri)) {
                xOffset = 55;
            }

            d3.select(this).append("line")
                .attr("x1", x)
                .attr("y1", y)
                .attr("x2", x)
                .attr("y2", y + yOffset)
                .attr("stroke", "black")
                .attr("stroke-width", "0.4px");

            d3.select(this).append("line")
                .attr("x1", x)
                .attr("y1", y + yOffset)
                .attr("x2", x + xOffset)
                .attr("y2", y + yOffset)
                .attr("stroke", "black")
                .attr("stroke-width", "0.4px");

            d3.select(this).append("circle")
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', d => {
                    return 1.5
                })
                .attr('fill', d => {
                    return 'black'
                })

            d3.select(this).append("text")
                .attr("x", x + xOffset)
                .attr("y", y + yOffset)
                .attr("dy", "0.35em")
                .style("text-anchor", function(d) {
                    return borneoStates.includes(d.properties.negeri) || eastStates.includes(d.properties.negeri) ? "start" : "end";
                })
                .style("font-size", "10px")
                .text(d => `${d.properties.negeri} (${d.properties.total || 0})`)
        })
            
    }

    function handleYearChange(event) {
        selectedYear = parseInt(event.target.value);
        startDate = moment().year(selectedYear).startOf('year').toDate();
        endDate = moment().year(selectedYear).endOf('year').toDate();

        updateData(); 
        updateVisualizations(selectedYear); 
    }

</script>

<section>
    <div class="mb-6">
        <label for="countries" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select Year</label>
        <select class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" bind:value={selectedYear} on:change={handleYearChange}>
            {#each yearOptions as year}
                <option value={year}>{year}</option>
            {/each}
        </select>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        <div class="md:col-span-4">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={20}
                colors={['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c']}
                data={heatmapData}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={endDate}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={14}
                startDate={startDate}
                view={'monthly'}
            />
        </div>
        <div class="md:col-span-4">
            <svg bind:this={svgMap}></svg>
        </div>
    </div>
</section>