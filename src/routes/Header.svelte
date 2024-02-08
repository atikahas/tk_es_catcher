<script>
import { Navbar, NavBrand, NavLi, NavUl, DarkMode, NavHamburger, Dropdown, DropdownItem } from 'flowbite-svelte';
import { ChevronDownOutline } from 'flowbite-svelte-icons';
import { page } from '$app/stores';
	$: activeUrl = $page.url.pathname;
</script>

<Navbar class="px-4 sm:px-4 py-2.5 fixed w-full z-20 top-0 start-0 border-b pt-0 pb-0">
	<NavBrand href="/">
		<img src="/gif/search.gif" class="me-3 h-6 sm:h-9" alt="Flowbite Logo" />
		<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Siasat</span>
	</NavBrand>
	<NavHamburger />
	<NavUl {activeUrl}>
		<NavLi href="/">Home</NavLi>
		<NavLi class="cursor-pointer">
			News<ChevronDownOutline class="w-3 h-3 ms-2 text-primary-800 dark:text-white inline" />
		</NavLi>
		<Dropdown class="w-44 z-20">
			<DropdownItem href="/edisi_siasat/view">List</DropdownItem>
			<DropdownItem href="/edisi_siasat/create">Create</DropdownItem>
		</Dropdown>
		<NavLi><DarkMode class="py-0"/></NavLi>
	</NavUl>

</Navbar>