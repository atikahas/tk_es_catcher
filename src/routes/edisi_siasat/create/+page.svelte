
<script>
    import { Card, Button, Label, Input, Textarea, Alert, Fileupload } from 'flowbite-svelte';
    import { CheckCircleOutline, CloseOutline } from 'flowbite-svelte-icons';
    let textareaprops = {
        id: 'message',
        name: 'message',
        label: 'Your message',
        rows: 5,
        placeholder: 'Write details here...'
    };
    let esDetails = '';
    let esDate = '';
    let images = [];

    async function addItem() {
        const formData = new FormData();
        formData.append('esDetails', esDetails);
        formData.append('esDate', esDate);

        for (let i = 0; i < images.length; i++) {
            formData.append('images[]', images[i]);
        }

        const response = await fetch('/edisi_siasat/getAdd', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            displaySuccessBanner('Info added.');
            resetForm();
        } else {
            displayErrorBanner('Failed to add.');
        }
    }

    function handleFiles(event) {
        images = event.target.files;
    }

    function resetForm() {
        esDetails = '';
        esDate = '';
    }

    function displaySuccessBanner(message) {
        const successDiv = document.getElementById('successMessage');
        successDiv.style.display = 'block';
        successDiv.innerHTML = message;

        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 3000);
    }

    function displayErrorBanner(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.style.display = 'block';
        errorDiv.textContent = message;

        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
</script>

<div class="mx-auto max-w-6xl font-sans mt-10">
    <Alert color="green" id="successMessage" style="display:none;">
        <CheckCircleOutline slot="icon" class="w-4 h-4"/>
    </Alert>
    <Alert color="red" id="errorMessage" style="display:none;">
        <CloseOutline slot="icon" class="w-4 h-4"/>
    </Alert>
</div>

<div class="mx-auto max-w-6xl font-sans text-lg rounded-lg mt-10 shadow-lg">
    <Card size="xl">
        <form on:submit|preventDefault={addItem}>
            <div class="mb-6">
                <Label for="default-input" class="block mb-2">Posted Date</Label>
                <Input type="datetime-local" bind:value={esDate}  />
            </div>
            <div class="mb-6">
                <Label for="default-input" class="block mb-2">Details</Label>
                <Textarea {...textareaprops} bind:value={esDetails} />
            </div>
            <div class="mb-6">
                <Label for="image-upload" class="block mb-2">Upload Images</Label>
                <Fileupload id="image-upload" multiple on:change={handleFiles} />
            </div>
            <Button class="w-fit" type="submit">Add Item</Button>
        </form>
    </Card>
</div>
