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
            searchTerm = getQueryParam('searchCloud') || '';
        } else {
            console.error('Error fetching es');
        }
    });

    const formatDate = (datetime) => new Date(datetime).toLocaleDateString();
    const formatTime = (datetime) => new Date(datetime).toLocaleTimeString();
    const truncateDetails = (details) => details.split(' ').slice(0, 20).join(' ') + '...';
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

    $: filteredData = es_data.filter((item) => item.details.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1);
    $: totalPages = Math.ceil(filteredData.length / itemsPerPage);
    $: paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const goToPage = (page) => {currentPage = page;};

</script>

<div class="mx-auto max-w-6xl font-sans text-lg rounded-lg mt-10 ">
    <Card size="xl">
        <TableSearch hoverable={true} shadow bind:inputValue={searchTerm}>
            <!-- <div slot="header" class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                <Button>
                <PlusSolid class="h-3.5 w-3.5 mr-2" />Add product
                </Button>
            </div> -->
            <TableHead>
                <TableHeadCell>ID</TableHeadCell>
                <TableHeadCell>DATE</TableHeadCell>
                <TableHeadCell>TIME</TableHeadCell>
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
                                                    <img src="/edisi_siasat/{ei.img_url}" class="max-h-30 max-w-auto rounded-lg m-2" alt=""/> 
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
</div>
