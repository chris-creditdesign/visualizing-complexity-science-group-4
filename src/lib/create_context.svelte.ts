import { setContext, getContext } from "svelte";

class GroupContext {
	nodes: { id: number; group: string; score: 0; name: string }[] = $state([]);

	edges: { id: string; source: number; target: number }[] = $state([]);

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

	endpointOutside(
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

	// new: compute the start point on the source perimeter towards the target
	startpointOutside(
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
