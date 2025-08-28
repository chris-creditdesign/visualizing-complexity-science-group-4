<script lang="ts">
	import * as THREE from "three";
	import { onDestroy } from "svelte";
	import { setup, remove } from "./create-three-context.svelte";
	import type { ConicPolygonGeometry } from "three-conic-polygon-geometry";

	interface Props {
		material: THREE.Material;
		geometry: THREE.SphereGeometry | THREE.CircleGeometry | THREE.PlaneGeometry | ConicPolygonGeometry;
		position?: [number, number, number];
		rotation?: [number, number, number];
		opacity?: number;
	}

	let { material, geometry, position = [0, 0, 0], rotation = [0, 0, 0], opacity = 1 }: Props = $props();

	const mesh = setup(new THREE.Mesh(geometry, material));

	onDestroy(() => {
		if (mesh instanceof THREE.Mesh) {
			mesh.material.dispose();
			mesh.geometry.dispose();
		}
		remove(mesh);
	});

	$effect(() => {
		mesh.position.set(...position);
		mesh.rotation.set(...rotation);
		if (mesh instanceof THREE.Mesh) {
			mesh.material.opacity = opacity;
		}
	});
</script>
