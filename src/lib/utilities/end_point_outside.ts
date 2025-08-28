export function endpointOutside(
	source: { cx: number; cy: number },
	target: { cx: number; cy: number },
	radius: number,
	padding = 0
) {
	const dx = target.cx - source.cx;
	const dy = target.cy - source.cy;
	const dist = Math.hypot(dx, dy) || 1;
	const ux = dx / dist;
	const uy = dy / dist;
	// point on the target circle perimeter plus padding outside it
	return {
		x: target.cx - ux * (radius + padding),
		y: target.cy - uy * (radius + padding),
	};
}
