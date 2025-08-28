export function rouletteIndex(weights, rng) {
	const s = weights.reduce((a, b) => a + b, 0);
	if (s <= 0) return Math.floor(rng() * weights.length);
	let x = rng() * s;
	for (let i = 0; i < weights.length; i++) {
		x -= weights[i];
		if (x <= 0) return i;
	}
	return weights.length - 1;
}
