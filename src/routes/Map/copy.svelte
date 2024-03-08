<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import * as topojson from 'topojson-client';

    let svgMap, svgBar;
    let s = [];

    async function renderMap(year) {
        var width = 960, height = 400;

        const m = await fetch('data/malaysia.json');
        const mapinfo = await m.json();

        const r = await fetch("/getMap");
        const stateinfo = await r.json();
        s = stateinfo.data.smap;

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

        // const colorScale = d3.scaleSequential()
        //     .domain([d3.min(currentyearData, d => d.total), d3.max(currentyearData, d => d.total)])
        //     .interpolator(d3.interpolateBlues);

        d3.select(svgMap).append("g")
            .selectAll("path")
            .data(land.features)
            .enter()
            .append("path")
            .attr("class", "land")
            .attr("d", path)
            .style("stroke-width", 1)
            .style("stroke", '#cacaca')
            .style("fill", '#e5e5e5')

        d3.select(svgMap).append("g")
            .selectAll("path")
            .data(states.features)
            .enter()
            .append("path")
            .attr("class", "state")
            .attr("id", d => "state" + d.properties.id)
            .attr("d", path)
            // .style("fill", "grey")
            .style("fill", d => d.properties.total_negeri != null ? colorScale(d.properties.total_negeri) : "grey")
            .style("opacity", .8)
            .style("stroke", "black")
            .style("stroke-width", 1)

        renderBarChart(new Date().getFullYear());
    }

    function aggregateData() {
        const ttlmonth = {};
        s.forEach(d => {
            const date = new Date(d.date_posted);
            const month = date.getMonth(); 
            const year = date.getFullYear();
            const state = d.negeri; 
            if (!ttlmonth[state]) {
                ttlmonth[state] = {};
            }
            if (!ttlmonth[state][year]) {
                ttlmonth[state][year] = Array(12).fill(0);
            }
            ttlmonth[state][year][month]++;
        });
        return ttlmonth;
    }

    function renderBarChart(year) {
        const data = aggregateData();
        const states = Object.keys(data);

        const margin = { top: 20, right: 20, bottom: 30, left: 40 },
            width = 960 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        
        d3.select(svgBar).selectAll('*').remove(); 

        const x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
            y = d3.scaleLinear().rangeRound([height, 0]);

        const chart = d3.select(svgBar)
            .attr('viewBox', [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const currentyearData = states.map(state => ({
            state,
            total: data[state][year] ? data[state][year].reduce((sum, monthTotal) => sum + monthTotal, 0) : 0
        }));

        x.domain(states);
        y.domain([0, d3.max(currentyearData, d => d.total)]);

        chart.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));

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
            .domain([d3.min(currentyearData, d => d.total), d3.max(currentyearData, d => d.total)])
            .interpolator(d3.interpolateBlues);

        chart.selectAll('.bar')
            .data(currentyearData)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.state))
            .attr('y', height) 
            .attr('width', x.bandwidth())
            .attr('height', 0)
            .style('fill', d => colorScale(d.total)) 
            .on('mouseover', function(event, d) {
                d3.select(this).style('fill', 'orange'); 
            })
            .on('mouseout', function(event, d) {
                d3.select(this).style('fill', colorScale(d.total));
            })
            .transition() 
            .duration(750)
            .attr('y', d => y(d.total))
            .attr('height', d => height - y(d.total));

        chart.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(y)
                .tickSize(-width)
                .tickFormat('')
            );

    }

    onMount(() => {
        renderMap();
    });
</script>

<div>
    <svg bind:this={svgMap}></svg>
    <svg bind:this={svgBar}></svg>
</div>