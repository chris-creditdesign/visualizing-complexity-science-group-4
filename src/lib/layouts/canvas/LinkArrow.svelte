<script lang="ts">
	import { onMount } from "svelte";
	import { tweened } from "svelte/motion";
	import { expoOut } from "svelte/easing";
	import { getCanvasContext } from "./create-canvas-context.svelte";

	type Props = {
		key: string;
		startX: number;
		startY: number;
		endX: number;
		endY: number;
		arrowHeadSize?: number;
		opacity?: number;
		index?: number;
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
		index = 0,
		color = "#000000",
	}: Props = $props();

	const { linkDrawFunctions } = getCanvasContext(key);

	const tweenedOpacity = tweened(opacity, {
		duration: 400,
		easing: expoOut,
		delay: index * 0.25,
	});

	$effect(() => {
		tweenedOpacity.set(opacity);
	});

	onMount(() => {
		linkDrawFunctions.push(drawFn);

		return () => {
			linkDrawFunctions.splice(linkDrawFunctions.indexOf(drawFn), 1);
		};
	});

	function drawFn(ctx: CanvasRenderingContext2D) {
		ctx.save();
		ctx.globalAlpha = $tweenedOpacity;
		ctx.strokeStyle = color;
		ctx.lineWidth = 1;
		ctx.fillStyle = color;

		// Draw a line from the starting point to the ending point
		ctx.beginPath();
		ctx.moveTo(startX, startY);
		ctx.lineTo(endX, endY);
		ctx.stroke();

		// Draw the arrowhead
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
