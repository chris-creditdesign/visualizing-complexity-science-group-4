<script lang="ts">
	import * as THREE from "three";
	import { getThreeContext } from "./create-three-context.svelte";

	interface Props {
		width: number;
		height: number;
		position: [number, number, number];
	}

	let { width, height, position = [0, 0, 0] }: Props = $props();

	const context = getThreeContext();

	const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

	context.camera = camera;

	$effect(() => {
		camera.aspect = width / height;
		camera.position.x = position[0];
		camera.position.y = position[1];
		camera.position.z = position[2];
		camera.updateProjectionMatrix();
	});
</script>
