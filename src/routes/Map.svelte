<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import * as topojson from 'topojson-client';

    let svg;

    async function renderMap() {
        var width = 960, height = 400;

        const response = await fetch('data/malaysia.json');
        const casesinfo = await fetch('/getState');
        const malaysia = await response.json();
        const cases = await casesinfo.json();

        const projection = d3.geoMercator() 
            .center([101.9758, 4.2105])
            .scale(2000 + 5 * 100)
            .translate([width / 3.3, height / 2])

        const path = d3.geoPath().projection(projection);

        d3.select(svg)
            .attr('viewBox', [0, 0, width, height].join(' '));

        const states = topojson.feature(malaysia, malaysia.objects.states);
        const land = topojson.feature(malaysia, malaysia.objects.land);

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
            const cs = cases.data.es_map

            if (mapping[d.properties.id]) {
                d.properties.state_id = mapping[d.properties.id].state_id;
                d.properties.negeri = mapping[d.properties.id].negeri;

                const ttlnegeri = cs.find(c => c.negeri === d.properties.negeri);
                if (ttlnegeri) {
                    d.properties.total_negeri = ttlnegeri.ttl;
                }

            } else {
                d.properties.state_id = null;
                d.properties.negeri = null;
                d.properties.total_negeri = null;
            }
        });

        d3.select(svg).append("g")
            .selectAll("path")
            .data(land.features)
            .enter()
            .append("path")
            .attr("class", "land")
            .attr("d", path)
            .style("stroke-width", 1)
            .style("stroke", '#cacaca')
            .style("fill", '#e5e5e5')

        const colorScale = d3.scaleSequential()
            .domain([d3.min(states.features, d => d.properties.total_negeri), d3.max(states.features, d => d.properties.total_negeri)])
            .interpolator(d3.interpolateBlues);

        d3.select(svg).append("g")
            .selectAll("path")
            .data(states.features)
            .enter()
            .append("path")
            .attr("class", "state")
            .attr("id", d => "state" + d.properties.id)
            .attr("d", path)
            .style("fill", d => d.properties.total_negeri != null ? colorScale(d.properties.total_negeri) : "grey")
            .style("stroke", "#666")
            .style("stroke-width", "1px")
            .on("mouseover", function(event, d) {
                d3.select(this).style("fill", "lightblue");
            })
            .on("mouseout", function(event, d) {
                d3.select(this).style("fill", d => d.properties.total_negeri != null ? colorScale(d.properties.total_negeri) : "grey");
            });

        const centroids = states.features.map(d => {
            return { ...d, centroid: path.centroid(d) };
        });

        const westStates = ['PERLIS', 'KEDAH', 'PERAK', 'PULAU PINANG', 'SELANGOR', 'W.P. KUALA LUMPUR', 'W.P. PUTRAJAYA', 'NEGERI SEMBILAN', 'MELAKA', 'JOHOR'];
        const eastStates = ['PAHANG', 'TERENGGANU', 'KELANTAN'];
        const borneoStates = ['SABAH', 'SARAWAK'];
        const borneoLabuan = ['W.P. LABUAN'];

        const labelsAndLines = d3.select(svg).selectAll(".label-line-group")
            .data(centroids)
            .enter().append("g")
            .attr("class", "label-line-group");

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

            // d3.select(this).append("line")
            //     .attr("x1", x)
            //     .attr("y1", y)
            //     .attr("x2", x + xOffset)
            //     .attr("y2", y + yOffset)
            //     .attr("stroke", "black");

            d3.select(this).append("line")
                .attr("x1", x)
                .attr("y1", y)
                .attr("x2", x)
                .attr("y2", y + yOffset)
                .attr("stroke", "black");

            d3.select(this).append("line")
                .attr("x1", x)
                .attr("y1", y + yOffset)
                .attr("x2", x + xOffset)
                .attr("y2", y + yOffset)
                .attr("stroke", "black");

            d3.select(this).append("circle")
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', d => {
                    // var stateid = d.properties.flag_id
                    // var newData = dataset.filter(d => d.stateid == stateid)
                    // if (newData != '') {
                    //     return 3
                    // }
                    // else {
                    //     return null
                    // }
                    return 2
                })
                .attr('fill', d => {
                    // var stateid = d.properties.flag_id
                    // var newData = dataset.filter(d => d.stateid == stateid)
                    // if (newData != '') {
                    //     return 'white'
                    // }
                    // else {
                    //     return null
                    // }
                    return 'black'
                })

            d3.select(this).append("text")
                .attr("x", x + xOffset)
                .attr("y", y + yOffset)
                .attr("dy", "0.35em")
                .style("text-anchor", function(d) {
                    return borneoStates.includes(d.properties.negeri) || eastStates.includes(d.properties.negeri) ? "start" : "end";
                })
                .style("font-size", "12px")
                .text(d => `${d.properties.negeri} (${d.properties.total_negeri})`);
        });

        const legendData = colorScale.ticks(10); 
        const legendItemWidth = 20;
        const legendItemHeight = 10;

        const legendX = width - legendData.length * legendItemWidth - 20;
        const legendY = 0;

        const legend = d3.select(svg).append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${legendX}, ${legendY})`);

        legend.selectAll("rect")
            .data(legendData)
            .enter()
            .append("rect")
            .attr("x", (d, i) => i * legendItemWidth)
            .attr("y", 8)
            .attr("width", legendItemWidth)
            .attr("height", legendItemHeight)
            .style("fill", d => colorScale(d));

        legend.selectAll("text")
            .data(legendData)
            .enter()
            .append("text")
            .attr("x", (d, i) => i * legendItemWidth + legendItemWidth / 2)
            .attr("y", legendItemHeight + 15) 
            .text(d => d)
            .attr("text-anchor", "middle")
            .style("font-size", "6px");
    }

    onMount(() => {
        renderMap();
    });
</script>


<div>
    <svg bind:this={svg}></svg>
</div>
