import { setContext, getContext } from "svelte";

class GroupContext {
	nodes = $state([
		{ id: 0, group: "mag", score: 0 },
		{ id: 1, group: "mag", score: 0 },
		{ id: 2, group: "mag", score: 0 },
		{ id: 3, group: "mag", score: 0 },
		{ id: 4, group: "mag", score: 0 },
		{ id: 5, group: "mag", score: 0 },
		{ id: 6, group: "mag", score: 0 },
		{ id: 7, group: "min", score: 0 },
		{ id: 8, group: "min", score: 0 }
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

	activeNode: null | number = $state(null);

	handleNodeClick = (nodeId: number) => {
		if (this.activeNode === null) { 
			this.activeNode = nodeId;
			return;
		} else {
			let source = this.activeNode;
			let target = nodeId;
			let id = `${source}-${target}`;

			let id_array = this.edges.map((e) => e.id);

			if (id_array.includes(id)) {
				this.edges = this.edges.filter((e) => e.id !== id);
			} else {
				this.edges = [...this.edges, { id, source, target }];
			}
		}
		this.activeNode = null;
	};

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
