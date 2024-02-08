<script>
    import { Card, Button, Label, Input, Textarea, Alert, Fileupload, Spinner, Span, Tooltip } from 'flowbite-svelte';
    import { CheckCircleOutline, CloseOutline } from 'flowbite-svelte-icons';
    import Tesseract from 'tesseract.js';
    import { onMount, onDestroy } from 'svelte';

    let textareaprops = {
        id: 'message',
        name: 'message',
        label: 'Your message',
        rows: 5,
        placeholder: 'Write details here...'
    };
    let placement = 'right';
    let esDetails = '';
    let esDate = '';
    let esSourceName = '';
    let esSourceURL = '';
    let images = [];
    let imagePreviewUrls = [];
    let imageDetailsArray = [];
    let isLoadingArray = [];
    

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

    function handleFiles(event) {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            images = files;
            imagePreviewUrls = files.map(file => URL.createObjectURL(file));
        }
    }


    onMount(() => {
        var myFile = document.getElementById('image-upload');
        if (myFile) {
            myFile.addEventListener('change', recognizeText);
        }
    });

    onDestroy(() => {
        if (imagePreviewUrls) {
            URL.revokeObjectURL(imagePreviewUrls);
        }
    });

    async function recognizeText() {
        if (!images.length) {
            console.log('No files selected');
            return;
        }

        imageDetailsArray = [];
        isLoadingArray = images.map(() => true);

        try {
            for (const [index, image] of images.entries()) {
                const result = await Tesseract.recognize(image);
                const text = result && result.data.text ? result.data.text : 'No text recognized';
                imageDetailsArray[index] = text;
                isLoadingArray[index] = false;
            }
        } catch (error) {
            displayErrorBanner('Error during text recognition: ' + error.message);
        } finally {
            isLoadingArray = isLoadingArray.map(() => false);
        }
    }


    async function addItem() {
        const formData = new FormData();
        formData.append('esDetails', esDetails);
        formData.append('esDate', esDate);
        formData.append('esSourceName', esSourceName);
        formData.append('esSourceURL', esSourceURL);

        for (let i = 0; i < images.length; i++) {
            formData.append(`image-${i}`, images[i]);
            formData.append(`imageDetails-${i}`, imageDetailsArray[i] || '');
        }

        formData.append('imageCount', images.length);

        try {
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
        } catch (error) {
            displayErrorBanner('Error: ' + error.message);
        }
    }

    function resetForm() {
        esDetails = '';
        esDate = '';
        esSourceName = '';
        esSourceURL = '';
        images = [];
        imagePreviewUrls = [];
        imageDetailsArray = []; 
        isLoadingArray = []; 

        const fileInput = document.getElementById('image-upload');
        if (fileInput) {
            fileInput.value = '';
        }

        const textAreas = document.querySelectorAll('.image-detail-textarea');
        textAreas.forEach(textArea => {
            textArea.value = '';
        });
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

<section>
    <Card class="max-w-full">
        <form on:submit|preventDefault={addItem}>
            <div class="grid gap-4 sm:grid-cols-2 sm:gap-6">
                <div class="sm:col-span-2">
                    <Label for="default-input" class="block mb-2">Posted Date</Label>
                    <Input type="datetime-local" bind:value={esDate}  />
                </div>
                <div class="sm:col-span-1">
                    <Label for="default-input" class="block mb-2">Source Name</Label>
                    <Input type="text" bind:value={esSourceName} placeholder="Enter source name" />
                </div>
                <div class="sm:col-span-1">
                    <Label for="default-input" class="block mb-2">Source URL</Label>
                    <Input type="text" bind:value={esSourceURL} placeholder="https://example.com" />
                </div>
                <div class="sm:col-span-2">
                    <Label for="default-input" class="block mb-2">Details</Label>
                    <Textarea {...textareaprops} bind:value={esDetails} />
                </div>
                <div class="sm:col-span-2">
                    <div>
                        <Label for="default-input" class="block mb-2">Upload Image <strong class="text-blue-600/100 text-xs" data-tooltip-target="tooltip-dun" data-tooltip-placement="right">(?)</strong></Label>
                                <div id="tooltip-dun" role="tooltip" class="text-xs absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-blue-600/100 rounded-lg shadow-sm opacity-0 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 tooltip">
                                    Users may upload multiple images and must wait until the OCR processing is completed for each uploaded image before submit.
                                </div>
                        <Fileupload id="image-upload" class="mb-4" name="img_url" multiple on:change={handleFiles}/>
                        <div class="grid grid-cols-2 gap-4">
                            {#each imagePreviewUrls as url, index}
                                <div>
                                    <img src={url} alt={`Image ${index + 1}`} class="mt-2" style="height: 200px;"/>
                                    {#if isLoadingArray[index]}
                                        <Span>
                                            <Spinner/>
                                            Processing ...
                                        </Span>
                                    {/if}
                                </div>
                                <div>
                                    <Textarea cols="30" rows="10" bind:value={imageDetailsArray[index]}></Textarea>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
                <div class="sm:col-span-2">
                    <Button class="w-fit" type="submit">Submit</Button>
                </div>
            </div>
        </form>
    </Card>
</section>
