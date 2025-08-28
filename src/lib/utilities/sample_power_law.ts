// Continuous truncated power-law on [1, xmax], PDF ~ x^(-gamma)
export function samplePowerLaw(gamma, rng, xmax = 100) {
	const u = rng();
	if (Math.abs(gamma - 1.0) < 1e-12) return Math.pow(xmax, u);
	const oneMinusGamma = 1 - gamma;
	const base = u * (Math.pow(xmax, oneMinusGamma) - 1) + 1;
	return Math.pow(base, 1 / oneMinusGamma);
}
