<script>
    import { Alert,  } from 'flowbite-svelte';
    import { InfoCircleSolid } from 'flowbite-svelte-icons';
    import { fly } from 'svelte/transition';
</script>

<div>
    <Alert color="gray" dismissable transition={fly} params={{ x: 200 }}>
        <InfoCircleSolid slot="icon" />
        An alert with non default animation - fly away.
    </Alert>
</div>
