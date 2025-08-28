<script>
	import { Plot, Line, Dot, LinearGradientX, RuleX, RuleY } from "svelteplot";
	// import aapl from './aapl.csv';
	import { getGroupContext } from "$lib/create_context.svelte";

	let key = "default";

	const groupContext = getGroupContext(key);

	let data = $derived(groupContext.inequality_gini.map((gini, index) => {
		return {
			me: groupContext.inequity_ME[index],
			gini: gini
		};
	}));
</script>
	
<Plot grid y={{ domain: [0.2, 0.8], label: '↑ Gini' }} x={{ domain: [-0.4, 0.4], label: '↑ ME' }}>
    <defs>
        <LinearGradientX
            id="gradient-line-x"
            stops={[
                {
                    x: -0.4,
                    color: 'cyan'
                },
                {
                    x: 0,
                    color: 'magenta'
                },

                {
                    x: 0.4,
                    color: 'gold'
                }
            ]} />
    </defs>
		<Dot data={data} x="me" y="gini" r={5} fill="red" />
		<Line data={data} x="me" y="gini"  stroke="url(#gradient-line-x)" />
		<RuleY y={0} />
		<!-- <RuleX x={0} /> -->
</Plot>
