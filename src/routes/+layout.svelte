<script>
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/scss/index.scss';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;700;900&family=Lora:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
</svelte:head>

{@render children?.()}
