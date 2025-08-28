<script lang="ts">
	import { onMount } from "svelte";
	import { getCanvasContext } from "./create-canvas-context.svelte";

	type Props = {
		key: string;
		startX: number;
		startY: number;
		endX: number;
		endY: number;
		arrowHeadSize?: number;
		opacity?: number;
		color?: string;
	};

	let {
		key,
		startX,
		startY,
		endX,
		endY,
		arrowHeadSize = 8,
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

		// Draw the arrowhead
		ctx.save();
		ctx.globalAlpha = opacity;
		ctx.fillStyle = color;
		const angle = Math.atan2(endY - startY, endX - startX);
		ctx.beginPath();
		ctx.moveTo(endX, endY);
		ctx.lineTo(
			endX - arrowHeadSize * Math.cos(angle - Math.PI / 6),
			endY - arrowHeadSize * Math.sin(angle - Math.PI / 6)
		);
		ctx.lineTo(
			endX - arrowHeadSize * Math.cos(angle + Math.PI / 6),
			endY - arrowHeadSize * Math.sin(angle + Math.PI / 6)
		);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}
</script>
