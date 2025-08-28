import { setContext, getContext } from "svelte";
import type { DrawFunction } from "../../../types";

function CreateCanvasContext() {
	let linkDrawFunctions: DrawFunction[] = $state([]);
	let circleDrawFunctions: DrawFunction[] = $state([]);
	let lineDrawFunctions: DrawFunction[] = $state([]);
	let textDrawFunctions: DrawFunction[] = $state([]);

	return {
		linkDrawFunctions,
		circleDrawFunctions,
		lineDrawFunctions,
		textDrawFunctions,
	};
}

const setCanvasContext = (key: string) => {
	const context = CreateCanvasContext();
	setContext(`canvas-${key}`, context);
	return context;
};

const getCanvasContext = (key: string) => {
	return getContext<{
		linkDrawFunctions: DrawFunction[];
		circleDrawFunctions: DrawFunction[];
		lineDrawFunctions: DrawFunction[];
		textDrawFunctions: DrawFunction[];
	}>(`canvas-${key}`);
};

export { setCanvasContext, getCanvasContext };
