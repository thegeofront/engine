
/**
 * javascript / typescript users would prefer `debug.log()` over `Debug.log()` for convention's sake
 * BUT this clashes with many libraries and build tooling, so this is not used at the moment...
 */
// export const debug = Debug;

/**
 * wraps the native `console`, so we can be specific about when and how we log
 * NOTE: Debug is intented to be used as a singleton, so a namespace is used instead of a class
 */
export namespace Debug {

	export let active = true;

	/////////////////////////////////////////////////////////////////////////// Pass throughs

	export function assert(condition?: boolean, ...data: any[]): void {
		if (!active) return;
		console.assert(condition, ...data);
	}

	export function clear(): void {
		if (!active) return;
		console.clear();
	}

	export function count(label: string): void {
		if (!active) return;
		console.count(label);
	}

	export function countReset(label: string): void {
		if (!active) return;
		console.countReset(label);
	}

	export function debug(message?: any, ...optionalParams: any[]): void {
		if (!active) return;
		console.debug(message, ...optionalParams);
	}

	export function dir(obj?: any, options?: any): void {
		if (!active) return;
		console.dir(obj, options)
	}

	export function dirxml(...data: any[]): void {
		if (!active) return;
		console.dir(...data);
	}

	export function error(message?: any, ...optionalParams: any[]): void {
		if (!active) return;
		console.error(message, ...optionalParams)
	}

	export function group(...label: any[]): void {
		if (!active) return;
		console.group(...label);
	}

	export function groupCollapsed(...label: any[]): void {
		if (!active) return;
		console.groupCollapsed(...label);
	}

	export function groupEnd(): void {
		if (!active) return;
		console.groupEnd()
	}

	export function info(message?: any, ...optionalParams: any[]): void {
		if (!active) return;
		console.info(message, ...optionalParams);
	}

	export function log(message?: any, ...optionalParams: any[]): void {
		if (!active) return;
		console.log(message, ...optionalParams);
	}

	export function table(tabularData?: any, properties?: string[]): void {
		if (!active) return;
		console.log(tabularData, properties);
	}

	export function time(label?: string): void {
		if (!active) return;
		console.time(label);
	}

	export function timeEnd(label?: string): void {
		if (!active) return;
		console.timeEnd(label);
	}

	export function timeLog(label?: string, ...data: any[]): void {
		if (!active) return;
		console.timeLog(label);
	}

	export function timeStamp(label?: string): void {
		if (!active) return;
		console.timeStamp(label);
	}

	export function trace(message?: any, ...optionalParams: any[]): void {
		if (!active) return;
		console.trace(message, ...optionalParams)
	}

	export function warn(message?: any, ...optionalParams: any[]): void {
		if (!active) return;
		console.warn(message, ...optionalParams);
	}

	// export function profile(label?: string): void {
	// 	if (!active) return;
	// 	console.profile(label);
	// }

	// export function profileEnd(label?: string): void {
	// 	if (!active) return;
	// 	console.profileEnd(label);
	// }
}
