import { setContext, getContext } from 'svelte';
import * as THREE from 'three';

const KEY = Symbol();
const PARENT = Symbol();

class CreateThreeContext {
	scene: THREE.Scene | undefined = $state();
	renderer: THREE.WebGLRenderer | undefined = $state();
	camera: THREE.PerspectiveCamera | undefined = $state();
}

const setup = (item: THREE.Object3D | THREE.Mesh) => {
	const { scene } = getThreeContext();
	const parent = getContext<THREE.Object3D | undefined>(PARENT);

	if (parent) {
		parent.add(item);
	} else if (scene) {
		// If an item is added as a direct child of the Pixi component
		// then its parent will be the app itself
		scene.add(item);
	}

	// Create a context so that this item can be a parent to any children
	// that are passed into it
	setContext(PARENT, item);

	return item;
};

const remove = (item: THREE.Object3D) => {
	const { scene } = getThreeContext();
	const parent = getContext<THREE.Object3D | undefined>(PARENT);

	if (parent) {
		parent.remove(item);
	} else if (scene) {
		scene.remove(item);
	}
};

const setThreeContext = () => {
	const context = new CreateThreeContext();
	setContext(KEY, context);
	return context;
}

const getThreeContext = () => {
	return getContext<CreateThreeContext>(KEY);
}

export { setup, remove, setThreeContext, getThreeContext };

