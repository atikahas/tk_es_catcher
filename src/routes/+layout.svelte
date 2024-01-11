<script>
    import "../app.pcss";
    import Header from "./Header.svelte";
    // import Footer from "./Footer.svelte";
</script>

<div class="app">
    <Header />
    <div class="min-h-screen p-20 bg-white dark:bg-primary-700">
        <slot />
    </div>
    <!-- <Footer /> -->
</div>
