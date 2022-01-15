<script>
	import Header from "./Header.svelte";
	import Roadmap from "./Roadmap.svelte";
	import Footer from "./Footer.svelte";
</script>

<!-- COMPONENTS -->
<header>
	<Header/>
</header>

<main>
	<Roadmap/>
</main>

<footer>
	<Footer/>
</footer>	

<style>
	:root {
    
    /* colors */
    --clr-light: #ffffff;
    --clr-dark: #007cba;
    --clr-darker: #005596;
    --clr-accent: #E7A614;

    --bs: 0.25em 0.25em 0.75em rgba(0, 0, 0, 0.25),
    0.125em 0.125em 0.25em rgba(0,0,0,.15);
}
	header {
		background-color: var(--clr-dark);
		color: var(--clr-light);
		display: flex; 
		flex-direction: column;
		margin: auto;
		align-items: center;
		width: 100%;

		box-shadow: var(--bs);
	}

	footer {
		background-color: var(--clr-dark);

		display: flex; 
		flex-direction: column;
		margin: auto;
		align-items: center;
		padding: 40px;
		width: 100%;
	}
</style>