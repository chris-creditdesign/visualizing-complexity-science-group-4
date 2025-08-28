<script lang="ts">
	import { onMount } from "svelte";
	import { getCanvasContext } from "./create-canvas-context.svelte";

	type Props = {
		key: string;
		startX: number;
		startY: number;
		endX: number;
		endY: number;
		opacity?: number;
		color?: string;
	};

	let {
		key,
		startX,
		startY,
		endX,
		endY,
		opacity = 1,
		color = "#000000",
	}: Props = $props();

	const { lineDrawFunctions } = getCanvasContext(key);

	onMount(() => {
		lineDrawFunctions.push(drawFn);

		return () => {
			lineDrawFunctions.splice(lineDrawFunctions.indexOf(drawFn), 1);
		};
	});

	function drawFn(ctx: CanvasRenderingContext2D) {
		// Draw a line from the starting point to the ending point
		ctx.save();
		ctx.strokeStyle = color;
		ctx.lineWidth = 1;
		ctx.globalAlpha = opacity;
		ctx.beginPath();
		ctx.moveTo(startX, startY);
		ctx.lineTo(endX, endY);
		ctx.stroke();
		ctx.restore();
	}
</script>
