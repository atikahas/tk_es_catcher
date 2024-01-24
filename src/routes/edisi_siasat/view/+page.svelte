<script>
    import { Card, Span, Spinner } from 'flowbite-svelte';
    import { onMount } from 'svelte';
    import { Table, TableSearch, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, ButtonGroup, Button, Modal, Textarea, Label, Input } from 'flowbite-svelte';
    import { EditOutline, EyeOutline, TrashBinOutline } from 'flowbite-svelte-icons';

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

    onMount(async () => {
        const response = await fetch('/edisi_siasat/getView');
        if (response.ok) {
            const result = await response.json();
            es_data = result.data.es_data;
            es_image = result.data.es_img;
            totalPages = Math.ceil(es_data.length / itemsPerPage);
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
                // console.log('Item updated:', result.data);
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
                                    <Button disabled><TrashBinOutline class="w-3 h-3" /></Button>
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
                                <TableBodyCell>Detail</TableBodyCell>
                                <TableBodyCell class="whitespace-normal">{@html formatWithLineBreaks(eDetail.details)}</TableBodyCell>
                            </TableBodyRow>
                            <TableBodyRow>
                                <TableBodyCell>Attachment</TableBodyCell>
                                <TableBodyCell>
                                    <div class="grid grid-cols-2 gap-2">
                                        {#if Array.isArray(es_image)}
                                            {#each es_image as ei}
                                                {#if ei.es_id === eDetail.id}
                                                <div>
                                                    <img src="/edisi_siasat/{ei.img_url}" class="h-auto max-w-20 rounded-lg" alt=""/> 
                                                </div>
                                                {/if}
                                            {/each}
                                        {/if}
                                    </div>
                                </TableBodyCell>
                            </TableBodyRow>
                        </TableBody>
                    </Table>
                </div>
            {/if}
        </Modal>
    </Card>
</div>
