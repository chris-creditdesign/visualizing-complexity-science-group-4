<script lang="ts">
	import { onMount } from "svelte";
	import { tweened } from "svelte/motion";
	import { expoOut } from "svelte/easing";
	import { getCanvasContext } from "./create-canvas-context.svelte";

	type Props = {
		key: string;
		r: number;
		cx: number;
		cy: number;
		fill: string;
		opacity?: number;
		index?: number;
	};

	let { key, r, cx, cy, fill, opacity = 1.0, index = 0 }: Props = $props();

	const { circleDrawFunctions } = getCanvasContext(key);

	const tweenedOpacity = tweened(opacity, {
		duration: 400,
		easing: expoOut,
		delay: index * 0.5,
	});

	$effect(() => {
		tweenedOpacity.set(opacity);
	});

	onMount(() => {
		circleDrawFunctions.push(drawFn);

		return () => {
			circleDrawFunctions.splice(circleDrawFunctions.indexOf(drawFn), 1);
		};
	});

	const drawFn = (ctx: CanvasRenderingContext2D) => {
		ctx.save();
		ctx.globalAlpha = $tweenedOpacity;
		ctx.beginPath();
		ctx.fillStyle = fill;
		ctx.arc(cx, cy, r, 0, 2 * Math.PI, true);
		ctx.fill();
		ctx.restore();
	};
</script>
