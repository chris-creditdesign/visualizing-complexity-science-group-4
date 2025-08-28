import { onMount } from 'svelte';

export function onFrame(callback: Function) {
	onMount(() => {
		function frameCallback() {
			callback();
			frame = requestAnimationFrame(frameCallback);
		};
		let frame = requestAnimationFrame(frameCallback);

		return () => cancelAnimationFrame(frame);
	});
}
