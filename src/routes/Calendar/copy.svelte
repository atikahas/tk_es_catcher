<script>
import { onMount } from 'svelte';
import * as d3 from 'd3';

function drawCalendar(data) {
    const container = d3.select("#calendar-heatmap");
    const containerWidth = container.node().getBoundingClientRect().width;
    const cellSize = Math.floor(containerWidth / 53);
    const height = cellSize * 9; 
    const tooltip = d3.select("#tooltip");

    container.selectAll("*").remove();

    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("height", height)
        .append("g");

    const colorScale = d3.scaleSequential(d => d === null ? "#d3d3d3" : d3.interpolateBlues(d))
        .domain([0, d3.max(data, d => d.count)]);

    const mouseover = function(event, d) {
        tooltip.style("opacity", 1);
        d3.select(this).style("stroke", "black").style("opacity", 1);
    };
    const mousemove = function(event, d) {
        tooltip.html(`Date: ${d3.timeFormat("%Y-%m-%d")(d.date)}<br>Count: ${d.count}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY + 10) + "px");
    };
    const mouseleave = function(event, d) {
        tooltip.style("opacity", 0);
        d3.select(this).style("stroke", "none").style("opacity", 0.8);
    };

    svg.selectAll("rect")
        .data(data)
        .join("rect")
        .attr("width", cellSize - 1)
        .attr("height", cellSize - 1)
        .attr("x", d => d3.utcSunday.count(d3.utcYear(d.date), d.date) * cellSize)
        .attr("y", d => d.date.getUTCDay() * cellSize)
        .attr("fill", d => d.count != null ? colorScale(d.count) : "red")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const firstDate = new Date(data[0].date.getFullYear(), 0, 1);
    const lastDate = new Date(data[0].date.getFullYear() + 1, 0, 1);
    const monthPaths = d3.timeMonths(firstDate, lastDate);
    // svg.selectAll(".month-label")
    //     .data(monthPaths)
    //     .join("text")
    //     .attr("class", "month-label")
    //     .attr("x", (d, i) => (d3.utcSunday.count(d3.utcYear(d), d) + (d3.utcSunday.count(d3.utcYear(d), d3.timeMonth.offset(d, 1)) - d3.utcSunday.count(d3.utcYear(d), d)) / 2) * cellSize)
    //     .attr("y", -5)
    //     .text(d => monthNames[d.getMonth()]);

	svg.selectAll(".month-label")
    .data(monthPaths)
    .join("text")
    .attr("class", "month-label")
    .attr("x", d => {
        const firstDayOfWeek = d3.utcSunday.count(d3.utcYear(d), d);
        return firstDayOfWeek * cellSize + cellSize / 1;
    })
    .attr("y", cellSize * 8) // Modify based on your SVG layout
    .text(d => monthNames[d.getMonth()]);

}

let cachedData;
onMount(() => {
    fetchData();
    window.addEventListener('resize', fetchData);
    return () => {
        window.removeEventListener('resize', fetchData);
    };
});

function fetchData() {
    if (cachedData) {
        drawCalendar(cachedData);
    } else {
        fetch('/getCalendar')
            .then(response => response.json())
            .then(data => {
                const currentYear = new Date().getFullYear();
                cachedData = data.data.cal.map(item => ({
                    date: new Date(item['DATE(date_posted)']),
                    count: item['COUNT(*)']
                })).filter(d => d.date.getFullYear() === currentYear);
                drawCalendar(cachedData);
            });
    }
}
</script>

<style>
	.tooltip {
		position: absolute;
		text-align: center;
		width: auto;
		height: auto;
		padding: 8px;
		font: 12px sans-serif;
		background: lightsteelblue;
		border: 0px;
		border-radius: 8px;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.3s;
	}
</style>

<div id="calendar-heatmap"></div>
<div id="tooltip" class="tooltip"></div>
