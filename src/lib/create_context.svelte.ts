import { setContext, getContext } from "svelte";
import { pagerank } from "$lib/utilities/page_rank";
import { computeHomophily } from "./utilities/compute_homophily";
import { computeEqualityEquity } from "$lib/utilities/compute-equality_equity";

class GroupContext {
	nodes: { id: number; group: string; score: 0; name: string }[] = $state([]);

	edges: { id: string; source: number; target: number }[] = $state([]);

	mag_homophily: number[] = $state([]);
	min_homophily: number[] = $state([]);
	inequality_gini: number[] = $state([]);
	inequity_ME: number[] = $state([]);

	// layout config (keep in sync with Canvas props below)
	canvasWidth = 800;
	canvasHeight = 600;
	radius = 40;
	margin = 100;

	centerX = this.canvasWidth / 2;
	centerY = this.canvasHeight / 2;
	ringRadius = Math.min(this.canvasWidth, this.canvasHeight) / 2 - this.margin;

	// distance to push the arrow past the target center (radius + padding)
	arrowPadding = 4;

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

		// PageRank and write back to nodes
		const pr = pagerank(this.nodes.length, this.edges);

		for (let i = 0; i < this.nodes.length; i++) {
			this.nodes[i].score = pr[i];
		}

		const homophily = computeHomophily(this.nodes, this.edges);
		const equalityEquity = computeEqualityEquity(this.nodes);

		this.mag_homophily.push(homophily.h_MM);
		this.min_homophily.push(homophily.h_mm);
		this.inequality_gini.push(equalityEquity.inequality_gini);
		this.inequity_ME.push(equalityEquity.inequity_ME);

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
