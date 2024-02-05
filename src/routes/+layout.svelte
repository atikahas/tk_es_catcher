<script>
    import "../app.pcss";
    import Header from "./Header.svelte";
    // import wordCloud from './edisi_siasat/wordCloud';
</script>

<div class="app">
    <Header />
    <div class="min-h-screen pt-20 p-20 bg-white dark:bg-primary-700">
        <slot />
    </div>

    <!-- <Footer /> -->
</div>
