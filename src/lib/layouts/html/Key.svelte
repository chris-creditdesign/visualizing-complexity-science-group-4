<script lang="ts">
	interface Props {
		entries: { name: string, fill: string }[];
	}
	let { entries }: Props = $props();
</script>

{#snippet renderEntry({ name, fill }: { name: string, fill: string })}
	<div class="l-cluster" style="--cluster-space--component: var(--s-2); --cluster-align-items--component: baseline;">
		<svg 
			height="0.8em"
			viewBox="0 0 10 10"
			focusable="false"
			aria-hidden="true"
		>
			<rect x="0" y="0" width="10" height="10" fill={fill} />
		</svg>
		<p class="u-font-family:sans-serif">{name}</p>
	</div>
{/snippet}

<div
	class="l-cluster b-container"
	style="--cluster-space--component: var(--s1); row-gap: var(--s-4);"
	aria-hidden="true"
	>
	{#each entries as entry}
		{@render renderEntry(entry)}
	{/each}
</div>

<style>
	p {
		margin: 0;
		width: fit-content;
	}

	.b-container {
		position: absolute;
		top: 0;
		left: 0;
	}
</style>
