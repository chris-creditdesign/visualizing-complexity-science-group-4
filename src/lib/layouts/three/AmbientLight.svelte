<script lang="ts">
	import * as THREE from "three";
	import { setup } from "./create-three-context.svelte";

	setup(new THREE.AmbientLight(0xffffff, Math.PI));
</script>
