<script>
    import { Card, Span, Spinner } from 'flowbite-svelte';
    import { onMount } from 'svelte';
    import { Table, TableSearch, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, ButtonGroup, Button, Modal, Textarea, Label, Input } from 'flowbite-svelte';
    import { EditOutline, EyeOutline, TrashBinOutline, PlusSolid } from 'flowbite-svelte-icons';

    let textareaprops = {
        id: 'message',
        name: 'message',
        label: 'Your message',
        rows: 8,
        placeholder: 'Write details here...'
    };
    let esModal = false;
    let es_data = [];
    let es_image = [];
    let eDetail = null;
    let isEditing = false;
    let editDetail = {};
    let searchTerm = '';

      let divClass='bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden';
        let innerDivClass='flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4';
        let searchClass='w-full md:w-1/2 relative';
        let svgDivClass='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none';
        let classInput="text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2  pl-10";

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    onMount(async () => {
        const response = await fetch('/edisi_siasat/getView');
        if (response.ok) {
            const result = await response.json();
            es_data = result.data.es_data;
            es_image = result.data.es_img;
            totalPages = Math.ceil(es_data.length / itemsPerPage);
            const searchQueryParam = getQueryParam('searchCloud');
            searchTerm = searchQueryParam || '';
        } else {
            console.error('Error fetching es');
        }
    });

    const formatDate = (datetime) => new Date(datetime).toLocaleDateString();
    const formatTime = (datetime) => new Date(datetime).toLocaleTimeString();
    const truncateDetails = (details) => {if (details === null || details === undefined) {return '';}
    return details.split(' ').slice(0, 40).join(' ') + '...';
};

    const formatWithLineBreaks = (str) => str.replace(/(?:\r\n|\r|\n)/g, '<br>');
    const formatForDateTimeInput = (datetime) => new Date(datetime).toISOString().slice(0, 16);

    function viewDetails(e) {
        eDetail = e;
        isEditing = false;
        esModal = true;
    }

    function editDetails(e) {
        editDetail = { ...e, date_posted: formatForDateTimeInput(e.date_posted) };
        isEditing = true;
        esModal = true;
    }

    async function submitEdit() {
        const response = await fetch('/edisi_siasat/getUpdate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editDetail)
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                es_data = es_data.map(item => item.id === editDetail.id ? editDetail : item);
                location.reload();
            } else {
                console.error('Failed to update item:', result.message);
            }
        } else {
            console.error('Error submitting edit');
        }

        isEditing = false;
        esModal = false;
    }

    let currentPage = 1;
    let totalPages;
    const itemsPerPage = 10;

    $: filteredData = es_data.filter((item) => item.details && item.details.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1);
    $: totalPages = Math.ceil(filteredData.length / itemsPerPage);
    $: paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const goToPage = (page) => {currentPage = page;};

</script>

<section>
    <Card class="max-w-full">
        <TableSearch placeholder="Search" hoverable={true} shadow bind:inputValue={searchTerm}  {innerDivClass} {searchClass} {classInput}>
            <div slot="header" class="flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                <a href="/edisi_siasat/create" class="text-white bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-gray-500 dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 me-2 mb-2">
                + Add News
                </a>
            </div>
            <TableHead>
                <TableHeadCell>ID</TableHeadCell>
                <TableHeadCell>DATE</TableHeadCell>
                <TableHeadCell>TIME</TableHeadCell>
                <TableHeadCell>SOURCE</TableHeadCell>
                <TableHeadCell>DETAILS</TableHeadCell>
                <TableHeadCell>OPTION</TableHeadCell>
            </TableHead>
            <TableBody>
                {#if Array.isArray(es_data) && es_data.length > 0}
                    {#each paginatedData as e, index (e.id)}
                        <TableBodyRow>
                            <TableBodyCell>{index + 1 + (currentPage - 1) * itemsPerPage}</TableBodyCell>
                            <TableBodyCell>{formatDate(e.date_posted)}</TableBodyCell>
                            <TableBodyCell>{formatTime(e.date_posted)}</TableBodyCell>
                            <TableBodyCell>{e.source_name}</TableBodyCell>
                            <TableBodyCell class="whitespace-normal">{truncateDetails(e.details)}</TableBodyCell>
                            <TableBodyCell>
                                <ButtonGroup>
                                    <Button on:click={() => viewDetails(e)}><EyeOutline class="w-3 h-3" /></Button>
                                    <Button on:click={() => editDetails(e)}><EditOutline class="w-3 h-3" /></Button>
                                    <Button disabled class="cursor-not-allowed"><TrashBinOutline class="w-3 h-3" /></Button>
                                </ButtonGroup>
                            </TableBodyCell>
                        </TableBodyRow>
                    {/each}
                {:else}
                    <TableBodyRow>
                        <TableBodyCell colspan="5" class="text-center">
                            <Span>
                                <Spinner/>
                                Loading ...
                            </Span>
                        </TableBodyCell>
                    </TableBodyRow>
                {/if}
            </TableBody>
        </TableSearch>

        <div class="flex justify-between items-center mt-4">
            <button on:click={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button on:click={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
        </div>

        <Modal title="ES Details" bind:open={esModal}>
            {#if isEditing}
                <form on:submit|preventDefault={submitEdit}>
                    <div class="mb-6">
                        <Label for="default-input" class="block mb-2">Posted Date</Label>
                        <Input id="default-input" type="datetime-local" bind:value={editDetail.date_posted} />
                    </div>
                    <div class="mb-6">
                        <Label for="default-input" class="block mb-2">Details</Label>
                        <Textarea {...textareaprops} bind:value={editDetail.details}/>
                    </div>
                    <Button type="submit">SAVE</Button>
                    <Button type="button" color="alternative" on:click={() => isEditing = false}>CANCEL</Button>
                </form>
            {:else if eDetail}
                <div class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                    <Table noborder={true} striped={true}>
                        <TableBody>
                            <TableBodyRow>
                                <TableBodyCell>Date</TableBodyCell>
                                <TableBodyCell>{formatDate(eDetail.date_posted)}</TableBodyCell>
                            </TableBodyRow>
                            <TableBodyRow>
                                <TableBodyCell>Time</TableBodyCell>
                                <TableBodyCell>{formatTime(eDetail.date_posted)}</TableBodyCell>
                            </TableBodyRow>
                            <TableBodyRow>
                                <TableBodyCell>Source</TableBodyCell>
                                <TableBodyCell>
                                    {#if eDetail.source_name}
                                        {eDetail.source_name}
                                    {:else}
                                        -
                                    {/if}
                                    {#if eDetail.source_url}
                                        <a href="{eDetail.source_url}" target="_blank" rel="noopener noreferrer" class="inline-block hover:bg-blue-50 text-white font-bold py-1 px-2 rounded">
                                            <svg class="w-4 h-4 text-blue-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 14v4.8a1.2 1.2 0 0 1-1.2 1.2H5.2A1.2 1.2 0 0 1 4 18.8V7.2A1.2 1.2 0 0 1 5.2 6h4.6m4.4-2H20v5.8m-7.9 2L20 4.2"/>
                                            </svg>
                                        </a>
                                    {/if}
                                </TableBodyCell>
                            </TableBodyRow>
                            <TableBodyRow>
                                <TableBodyCell>Detail</TableBodyCell>
                                <TableBodyCell class="whitespace-normal">{@html formatWithLineBreaks(eDetail.details)}</TableBodyCell>
                            </TableBodyRow>
                            <TableBodyRow>
                                <TableBodyCell>Attachment</TableBodyCell>
                                <TableBodyCell>
                                    <!-- <div class="grid grid-cols-2 gap-2"> -->
                                        {#if Array.isArray(es_image)}
                                            {#each es_image as ei}
                                                {#if ei.es_id === eDetail.id}
                                                <div class="relative">
                                                    <img src="http://172.20.100.190/img/{ei.img_url}" class="max-h-30 max-w-auto rounded-lg m-2" alt=""/> 
                                                </div>
                                                {/if}
                                            {/each}
                                        {/if}
                                    <!-- </div> -->
                                </TableBodyCell>
                            </TableBodyRow>
                        </TableBody>
                    </Table>
                </div>
            {/if}
        </Modal>
    </Card>
</section>
