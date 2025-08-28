import { setContext, getContext } from "svelte";

class GroupContext {
	nodes = $state([
		{ id: 0, group: "mag" },
		{ id: 1, group: "mag" },
		{ id: 2, group: "mag" },
		{ id: 3, group: "mag" },
		{ id: 4, group: "mag" },
		{ id: 5, group: "mag" },
		{ id: 6, group: "mag" },
		{ id: 7, group: "min" },
		{ id: 8, group: "min" }
	]);

	edges: { id: string; source: number; target: number }[] = $state([]);

	// layout config (keep in sync with Canvas props below)
	canvasWidth = 800;
	canvasHeight = 600;
	radius = 40;
	margin = 100;

	centerX = this.canvasWidth / 2;
	centerY = this.canvasHeight / 2;
	ringRadius = Math.min(this.canvasWidth, this.canvasHeight) / 2 - this.margin;

	// compute positions around a circle at equal intervals
	nodes_with_positions = $derived(
		this.nodes.map((node, i) => {
			const angle = (2 * Math.PI * i) / this.nodes.length - Math.PI / 2; // start at top
			return {
				...node,
				cx: this.centerX + this.ringRadius * Math.cos(angle),
				cy: this.centerY + this.ringRadius * Math.sin(angle),
			};
		})
	);
}

const setGroupContext = (key: string) => {
	const context = new GroupContext();
	setContext(key, context);
	return context;
};

const getGroupContext = (key: string) => {
	return getContext<GroupContext>(key);
};

export { setGroupContext, getGroupContext };
