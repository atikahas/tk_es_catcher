<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import * as topojson from 'topojson-client';

    let svgMap, svgBar;
    let data = [];
    let selectedYear;
    let yearOptions = [];
    let tooltipContent = null;
    let tooltipX = 0;
    let tooltipY = 0;

    onMount(async () => {
        const mapResponse = await fetch('/getMap');
        const mapData = await mapResponse.json();
        data = mapData.data.smap;

        setupYears();
        updateVisualizations(selectedYear);
    });

    function setupYears() {
        const years = new Set(data.map(d => new Date(d.date_posted).getFullYear()));
        yearOptions = Array.from(years).sort();
        selectedYear = new Date().getFullYear();
    }

    function updateVisualizations(year) {
        const aggregatedData = aggregateData(year);
        renderMap(aggregatedData);
        renderBar(aggregatedData);
    }

    function aggregateData(year) {
        const monthlyData = {};
        data.forEach(d => {
        const date = new Date(d.date_posted);
        if (date.getFullYear() === year) {
            const state = d.negeri;
            monthlyData[state] = (monthlyData[state] || 0) + 1;
        }
        });
        return Object.entries(monthlyData).map(([state, total]) => ({ state, total }));
    }

    async function renderMap(cd) {
        var width = 960, height = 400;

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

        console.log(centroids);

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
            console.log(d)
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
                .text(d => `${d.properties.negeri} (${d.properties.total})`)
        })
            
    }

    function renderBar(cd) {
        const cyd = cd || []; // Current year data

        const margin = { top: 10, right: 20, bottom: 80, left: 40 },
            width = 960 - margin.left - margin.right,
            height = 200 - margin.top - margin.bottom;

        d3.select(svgBar).selectAll('*').remove(); 

        const x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
            y = d3.scaleLinear().rangeRound([height, 0]);

        const chart = d3.select(svgBar)
            .attr('viewBox', [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        x.domain(cyd.map(d => d.state));
        y.domain([0, d3.max(cyd, d => d.total)]);

        chart.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end").style("font-size", "10px");

        chart.append('g')
            .attr('class', 'y axis')
            .call(d3.axisLeft(y).ticks(10))
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '0.71em')
            .attr('text-anchor', 'end')
            .text('Frequency');

        const colorScale = d3.scaleSequential()
            .domain([0, d3.max(cyd, d => d.total)])
            .interpolator(d3.interpolateBlues);

        chart.selectAll('.bar')
            .data(cyd)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('id', d => `bar${d.state}`)
            .attr('x', d => x(d.state))
            .attr('y', d => y(d.total))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d.total))
            .style('fill', d => colorScale(d.total))
            .on('mouseover', function(event, d) {
                tooltipContent = `${d.state}: ${d.total}`;
                tooltipX = event.pageX;
                tooltipY = event.pageY;
            })
            .on('mousemove', function(event) {
                tooltipX = event.pageX;
                tooltipY = event.pageY;
            })
            .on('mouseout', function() {
                tooltipContent = '';
            });

        chart.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(y)
                .tickSize(-width)
                .tickFormat(''))
                .style("opacity", 0.1);
    }


    onMount(async () => {
        renderMap();
        renderBar();
    });

    $: if (selectedYear) {
        updateVisualizations(selectedYear);
    }
</script>
<style>
.tooltip {
    background: rgba(0, 0, 0, 0.75);
    color: white;
    padding: 8px;
    border-radius: 4px;
    z-index: 10;
    max-width: 200px;
    text-align: center;
    font-size: 12px;
}

</style>

<div>
    <select bind:value={selectedYear}>
        {#each yearOptions as year}
            <option value={year}>{year}</option>
        {/each}
    </select>
    <div class="tooltip" style="position: absolute; opacity: {tooltipContent ? 1 : 0}; pointer-events: none; transition: opacity 0.3s; left: {tooltipX}px; top: {tooltipY}px;">
        {tooltipContent}
    </div>
    <svg bind:this={svgMap}></svg>
    <svg bind:this={svgBar}></svg>
</div>
