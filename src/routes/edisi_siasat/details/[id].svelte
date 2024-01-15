<script>
    import { Card } from 'flowbite-svelte';
    import { onMount } from 'svelte';
    import { page } from '$app/stores'; 

    onMount(async () => {
        const id = $page.params.id; 
        console.log(id); 
    });
    
</script>

<div class="mx-auto max-w-6xl font-sans text-lg rounded-lg mt-10 shadow-lg">
    <Card size="xl">

    </Card>
</div>