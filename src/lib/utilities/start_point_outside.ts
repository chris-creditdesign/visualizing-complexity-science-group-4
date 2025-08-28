export function startpointOutside(
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
	// point on the source circle perimeter moved outward towards the target
	return {
		x: source.cx + ux * (radius + padding),
		y: source.cy + uy * (radius + padding),
	};
}
