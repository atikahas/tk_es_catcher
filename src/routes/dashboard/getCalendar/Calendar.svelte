<script>
    import { onMount } from 'svelte';
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

    function handleYearChange(event) {
        selectedYear = event.target.value;
        startDate = moment().year(selectedYear).startOf('year').toDate();
        endDate = moment().year(selectedYear).endOf('year').toDate();
        updateData();
    }
</script>

<div class="year-selector">
    <select id="yearSelect" bind:value={selectedYear} on:change={handleYearChange}>
        {#each Array(10).fill().map((_, i) => new Date().getFullYear() - i) as year}
            <option value={year}>{year}</option>
        {/each}
    </select>
</div>

<div class="align-center">
    <SvelteHeatmap
        allowOverflow={true}
        cellGap={5}
        cellRadius={1}
        colors={['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c']}
        data={heatmapData}
        dayLabelWidth={20}
        emptyColor={'#ecedf0'}
        endDate={endDate}
        monthGap={20}
        monthLabelHeight={20}
        startDate={startDate}
        view={'monthly'}
    />
</div>
