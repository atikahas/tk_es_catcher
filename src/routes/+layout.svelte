<script>
    import "../app.pcss";
    import Header from "./Header.svelte";
    import Footer from "./Footer.svelte";
    // import wordCloud from './edisi_siasat/wordCloud';
</script>

<div class="app">
    <Header />
    <div class="min-h-screen pt-20 p-5 lg:p-20 lg:pt-20 bg-white dark:bg-primary-700">
        <slot />
    </div>
    <Footer />
</div>
