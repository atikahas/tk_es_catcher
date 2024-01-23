<script>
    import { Card, Button, Label, Input, Textarea, Alert, Fileupload, Spinner, Span, Toast } from 'flowbite-svelte';
    import { CheckCircleOutline, CloseOutline, InfoCircleSolid } from 'flowbite-svelte-icons';
    import Tesseract from 'tesseract.js';
    import { onMount } from 'svelte';

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
    let isLoading = false;
    let imagePreviewUrl = null;


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

    onMount(() => {
        var myFile = document.getElementById('myFile');
        if (myFile) {
            myFile.addEventListener('change', recognizeText);
        }
    });

    async function recognizeText({ target: { files } }) {
        if (files.length === 0) {
            console.log('No file selected');
            return;
        }

        imagePreviewUrl = URL.createObjectURL(files[0]);
        isLoading = true;

        try {
            const result = await Tesseract.recognize(files[0]);
            const convertedTextElement = document.getElementById("convertedText");
            if (result && result.data.text) {
                convertedTextElement.value = result.data.text;
                console.log(result);
            } else {
                convertedTextElement.value = 'No text recognized';
            }
        } catch (error) {
            // console.error('Error during OCR processing:', error);
            displayErrorBanner('Error during text recognition');
        } finally {
            isLoading = false; // Set loading to false when done
        }
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

<div class="mx-auto max-w-6xl font-sans text-lg rounded-lg mt-10 ">
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
    <br>
    <Card size="xl">
        <Alert class="mb-6" color="yellow" border dismissable>
            <InfoCircleSolid slot="icon" class="w-4 h-4" />
            <span class="font-medium">Tesseract OCR Update : </span>
            Currently in Progress. Stay Tuned for Enhancements! 
        </Alert>
        <div class="grid grid-cols-2 gap-4">
            
            <div>
                <b>Upload image here:</b>
                <Fileupload id="myFile" name="filename" class="mb-4"/>
                <div class="text-center">
                    {#if imagePreviewUrl}
                        <img src={imagePreviewUrl} alt="" class="mt-2" style="height: 240px;"/>
                    {/if}
                    {#if isLoading}
                        <Span>
                            <Spinner/>
                            Processing ...
                        </Span>
                    {/if}
                </div>
                
            </div>
            <div>
                <b>Image converted text:</b>
                <Textarea cols="30" name="original" rows="15" id="convertedText">
                </Textarea>
            </div>
        </div>
    </Card>
</div>
