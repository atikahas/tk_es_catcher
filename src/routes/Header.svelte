<script>
import { Navbar, NavBrand, NavLi, NavUl, DarkMode, NavHamburger} from 'flowbite-svelte';
import { page } from '$app/stores';
	$: activeUrl = $page.url.pathname;
</script>

<Navbar class="px-4 sm:px-4 py-2.5 fixed w-full z-20 top-0 start-0 border-b pt-0 pb-0">
	<NavBrand href="/">
		<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Edisi Siasat</span>
	</NavBrand>
	<NavHamburger />
	<NavUl {activeUrl}>
		<NavLi href="/edisi_siasat/view">Home</NavLi>
		<NavLi href="/edisi_siasat/create">Create</NavLi>
		<NavLi><DarkMode class="py-0"/></NavLi>
	</NavUl>
</Navbar>