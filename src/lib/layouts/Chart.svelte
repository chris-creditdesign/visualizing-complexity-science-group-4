<script>
	import { Plot, Line, Dot, LinearGradientX, RuleX, RuleY } from "svelteplot";
	// import aapl from './aapl.csv';
	import { getGroupContext } from "$lib/create_context.svelte";

	let key = "default";

	const groupContext = getGroupContext(key);

	let data = $derived(
		groupContext.inequality_gini.map((gini, index) => {
			return {
				me: groupContext.inequity_ME[index],
				gini: gini,
			};
		})
	);

	let dotPoint = $derived(data.at(-1));
</script>

<style>
	.legend-top {
		display: flex;
		justify-content: center;
	}

	.legend-bottom {
		display: flex;
		justify-content: space-between;
		font-size: 14px;
	}
	.center{
		text-align: center;
	}

	.right {
		text-align: right;
	}

	.homophily {
		font-size: 14px;
		display: flex;
		justify-content: space-between;
	}
</style>

<div class="l-stack" style="--stack-space: 0;">
	<div class="legend-top">
		<span>Unbalanced rank</span>
	</div>
	<Plot
		y={{ domain: [0.1, 0.8], label: false }}
		x={{ domain: [-0.4, 0.4], label: false }}
		marginRight={0}
		axes={false}
	>
		<defs>
			<LinearGradientX
				id="gradient-line-x"
				stops={[
					{
						x: -0.4,
						color: "cyan",
					},
					{
						x: 0,
						color: "magenta",
					},

					{
						x: 0.4,
						color: "gold",
					},
				]}
			/>
		</defs>
		<Line {data} x="me" y="gini" stroke="url(#gradient-line-x)" strokeWidth={4} />
		<Dot data={[dotPoint]} x="me" y="gini" r={8} fill="#000000" />
		<RuleY y={0.1} strokeWidth={4} />
		<RuleX x={0} strokeWidth={4} />
	</Plot>
	<div class="legend-bottom">
		<span class="left">Purple <br> overrepresented</span>
		<span class="center"> Fair garden</span>
		<span class="right">Orange <br> overrepressented</span>
	</div>
	<div class="homophily">
		<p><strong>Purple homophily:</strong> {groupContext.mag_homophily.at(-1)?.toFixed(2)}</p>
		<p><strong>Orange homophily:</strong> {groupContext.min_homophily.at(-1)?.toFixed(2)}</p>
	</div>
</div>
