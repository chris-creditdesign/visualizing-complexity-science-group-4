<script lang="ts">
	import { onMount } from "svelte";
	import { getCanvasContext } from "./create-canvas-context.svelte";

	type Props = {
		key: string;
		x: number;
		y: number;
		text: string;
		align?: CanvasTextAlign;
		withBox?: boolean;
	};

	let {
		key,
		x,
		y,
		text,
		align = "center",
		withBox = false,
	}: Props = $props();

	const { lineDrawFunctions: textDrawFunctions } = getCanvasContext(key);

	let padding = 10;
	let width: number | undefined = undefined;
	let height: number | undefined = undefined;

	onMount(() => {
		textDrawFunctions.push(drawFn);

		return () => {
			textDrawFunctions.splice(textDrawFunctions.indexOf(drawFn), 1);
		};
	});

	function drawFn(ctx: CanvasRenderingContext2D) {
		ctx.font = "bold 16px 'Helvetica'";
		if (withBox) {
			width = ctx.measureText(text).width + padding;
			height = parseInt(ctx.font, 10) + padding;
			let rectX = x - width / 2;
			let rectY = y - height * 0.75;
			// Draw a rectangle behind the text
			ctx.save();
			ctx.fillStyle = "#ffffff";
			ctx.fillRect(rectX, rectY, width, height);
			ctx.strokeStyle = "#000000";
			ctx.lineWidth = 1;
			ctx.strokeRect(rectX, rectY, width, height);
			ctx.restore();
		}
		// Draw the text
		ctx.save();
		ctx.fillStyle = "#000000";
		ctx.textAlign = align;
		ctx.fillText(text, x, y);
		ctx.restore();
	}
</script>
