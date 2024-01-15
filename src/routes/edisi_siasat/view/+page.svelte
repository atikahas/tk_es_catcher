<script>
    import { Card } from 'flowbite-svelte';
    import { onMount } from 'svelte';
    import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, ButtonGroup, Button, Modal, Textarea, Label, Input } from 'flowbite-svelte';
    import { EditOutline, EyeOutline, TrashBinOutline } from 'flowbite-svelte-icons';
    let textareaprops = {
        id: 'message',
        name: 'message',
        label: 'Your message',
        rows: 8,
        placeholder: 'Write details here...'
    };
    let esModal = false;
    let es = [];
    let es_data = [];
    let es_image = [];
    let eDetail = null;
    let isEditing = false;
    let editDetail = {};

    onMount(async () => {
        const response = await fetch('/edisi_siasat/getView');
        if (response.ok) {
            es = await response.json();
            es_data = es.data.es_data;
            es_image = es.data.es_img;
        } else {
            console.error('Error fetching es');
        }
    });

    const formatDate = (datetime) => {
        const date = new Date(datetime);
        return date.toLocaleDateString();
    };

    const formatTime = (datetime) => {
        const time = new Date(datetime);
        return time.toLocaleTimeString();
    };

    const truncateDetails = (details) => {
        return details.split(' ').slice(0, 5).join(' ') + '...';
    };

    function viewDetails(e) {
        eDetail = e;
        isEditing = false;
        esModal = true;
    }

    function formatWithLineBreaks(str) {
        return str.replace(/(?:\r\n|\r|\n)/g, '<br>');
    }

    function formatForDateTimeInput(datetime) {
        const date = new Date(datetime);
        return date.toISOString().slice(0, 16); // 'YYYY-MM-DDTHH:mm'
    }

    function editItem(e) {
        editDetail = { ...e, date_posted: formatForDateTimeInput(e.date_posted) };
        isEditing = true;
        esModal = true; 
    }

    async function submitEdit() {
        console.log('submitEdit called');

        // await fetch('/edisi_siasat/getUpdate', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(editDetail)
        // });
        // const result = await response.json();
        // if (result.success) {
        //     console.log('Item added:', result.data);
        // } else {
        //     console.error('Failed to add item:', result.message);
        // }

        // isEditing = false;
        // esModal = false;
    }

</script>

<div class="mx-auto max-w-6xl font-sans text-lg rounded-lg mt-10 shadow-lg">
    <Card size="xl">
        <Table shadow>
            <TableHead>
                <TableHeadCell>ID</TableHeadCell>
                <TableHeadCell>DATE</TableHeadCell>
                <TableHeadCell>TIME</TableHeadCell>
                <TableHeadCell>DETAILS</TableHeadCell>
                <TableHeadCell>OPTION</TableHeadCell>
            </TableHead>
            <TableBody>
                {#if Array.isArray(es_data)}
                {#each es_data as e, index}
                <TableBodyRow>
                    <TableBodyCell>{index + 1}</TableBodyCell>
                    <TableBodyCell>{formatDate(e.date_posted)}</TableBodyCell>
                    <TableBodyCell>{formatTime(e.date_posted)}</TableBodyCell>
                    <TableBodyCell>{truncateDetails(e.details)}</TableBodyCell>
                    <TableBodyCell>
                        <ButtonGroup>
                            <Button on:click={() => { viewDetails(e) }}><EyeOutline class="w-3 h-3" /></Button>
                            <Button on:click={() => { editItem(e) }}><EditOutline class="w-3 h-3" /></Button>
                            <Button disabled><TrashBinOutline class="w-3 h-3" /></Button>
                        </ButtonGroup>
                    </TableBodyCell>
                </TableBodyRow>
                {/each}
                {/if}
            </TableBody>
        </Table>

        <Modal title="ES Details" bind:open={esModal} autoclose>
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
                    <Table noborder={true}>
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
                                <TableBodyCell>{@html formatWithLineBreaks(eDetail.details)}</TableBodyCell>
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
