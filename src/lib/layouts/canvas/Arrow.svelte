<script lang="ts">
	import { onMount } from "svelte";
	import { getCanvasContext } from "./create-canvas-context.svelte";

	type Props = {
		key: string;
		startX: number;
		startY: number;
		endX: number;
		endY: number;
		curvature?: number;
		lineWidth?: number;
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
		curvature = 0.15,
		lineWidth = 1,
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
        // don't draw degenerate arrows
        if (startX === endX && startY === endY) return;

        // compute a control point for a slight perpendicular offset (quadratic Bezier)
        const dx = endX - startX;
        const dy = endY - startY;
        const len = Math.hypot(dx, dy) || 1;

        // relative curvature (0 = straight line). tweak for more/less curve.
        // perpendicular unit vector
        const nx = -dy / len;
        const ny = dx / len;

        // control point placed at midpoint plus perpendicular offset
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const cx = midX + nx * (curvature * len);
        const cy = midY + ny * (curvature * len);

        // Draw the curved line (quadratic)
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = "round";
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(cx, cy, endX, endY);
        ctx.stroke();
        ctx.restore();

        // Compute tangent at t=1 for quadratic: derivative at t=1 is 2*(end - control)
        const tanX = endX - cx;
        const tanY = endY - cy;
        const angle = Math.atan2(tanY, tanX);

        // Draw the arrowhead at the end point, oriented with the tangent
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;

        const head = arrowHeadSize;
        const sideAngle = Math.PI / 6; // 30 degrees

        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - head * Math.cos(angle - sideAngle),
            endY - head * Math.sin(angle - sideAngle)
        );
        ctx.lineTo(
            endX - head * Math.cos(angle + sideAngle),
            endY - head * Math.sin(angle + sideAngle)
        );
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
</script>
