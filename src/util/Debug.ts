
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

	export let Active = true;
	export let Once = true;
	export let Times = 0;
	let TimesCount = 0;

	/////////////////////////////////////////////////////////////////////////// Create a hook
	
	let _onLogListener: (message: string, log: string) => void | undefined;

	let _onErrorListener: (message: string) => void | undefined;

	/**
	 * Highjack Debug.log, Debug.error, Debug.info and Debug.warn. This highjack ignores the active status of regular logging
	 */
	export function setLogListener(listener: (message: string, log: string) => void) {
		_onLogListener = listener;
	}

	export function setErrorListener(listener: (message: string) => void) {
		_onErrorListener = listener;
	}

	/**
	 * DANGEROUS.
	 * Does not work if no log listener has been defined 
	 */
	export function forceLogListenerUponConsole() {
		if (!hasLogListener()) return;

		console.log = (m, p) => onLog("log", m, p);
		console.info = (m, p) => onLog("info", m, p);
		console.warn = (m, p) => onLog("warn", m, p);
		console.error = (m, p) => onLog("error", m, p);
	}	

	function hasLogListener() : Boolean {
		return (_onLogListener != undefined);
	}

	function hasErrorListener() : Boolean {
		return (_onErrorListener != undefined);
	}

	function onLog(tag: string, message?: any, ...optionalParams: any[]) {
		if (!_onLogListener) return;
		_onLogListener(`${String([message, ...optionalParams])}`, tag)
	}

	function onError(tag: string, message?: any, ...optionalParams: any[]) {
		if (!_onErrorListener) return;
		_onErrorListener(`${String([message, ...optionalParams])}`)
	}

	/////////////////////////////////////////////////////////////////////////// Event based 

	export function dispatch(message: string, type="my-log-event") {
		let event = new CustomEvent(type, {
			detail: {message},
		});    
		document.dispatchEvent(event);
	}

	/////////////////////////////////////////////////////////////////////////// Additions

	export function logOnce(message?: any, ...optionalParams: any[]): void {
		if (!Active) return;
		if (!Once) return;
		console.log(message, ...optionalParams);
		Once = false;
	}

	export function logTimes(times: number, message?: any, ...optionalParams: any[]): void {
		if (!Active) return;
		Times = times
		TimesCount += 1;
		if (TimesCount > Times) return;
		console.log(message, ...optionalParams);
		Once = false;
	}

	/////////////////////////////////////////////////////////////////////////// Pass throughs

	export function assert(condition?: boolean, ...data: any[]): void {
		if (!Active) return;
		console.assert(condition, ...data);
	}

	export function clear(): void {
		if (!Active) return;
		console.clear();
	}

	export function count(label: string): void {
		if (!Active) return;
		console.count(label);
	}

	export function countReset(label: string): void {
		if (!Active) return;
		console.countReset(label);
	}

	export function debug(message?: any, ...optionalParams: any[]): void {
		if (!Active) return;
		console.debug(message, ...optionalParams);
	}

	export function dir(obj?: any, options?: any): void {
		if (!Active) return;
		console.dir(obj, options)
	}

	export function dirxml(...data: any[]): void {
		if (!Active) return;
		console.dir(...data);
	}

	export function error(message?: any, ...optionalParams: any[]): void {
		if (hasLogListener()) onLog("error", message, optionalParams);
		if (hasErrorListener()) onError("error", message, optionalParams);
		if (!Active) return;
		console.error(message, ...optionalParams)
	}

	export function group(...label: any[]): void {
		if (!Active) return;
		console.group(...label);
	}

	export function groupCollapsed(...label: any[]): void {
		if (!Active) return;
		console.groupCollapsed(...label);
	}

	export function groupEnd(): void {
		if (!Active) return;
		console.groupEnd()
	}

	export function info(message?: any, ...optionalParams: any[]): void {
		if (hasLogListener()) onLog("error", message, optionalParams);
		if (!Active) return;
		console.info(message, ...optionalParams);
	}

	export function log(message?: any, ...optionalParams: any[]): void {
		if (hasLogListener()) onLog("error", message, optionalParams);
		if (!Active) return;
		console.log(message, ...optionalParams);
	}

	export function table(tabularData?: any, properties?: string[]): void {
		if (!Active) return;
		console.log(tabularData, properties);
	}

	export function time(label?: string): void {
		if (!Active) return;
		console.time(label);
	}

	export function timeEnd(label?: string): void {
		if (!Active) return;
		console.timeEnd(label);
	}

	export function timeLog(label?: string, ...data: any[]): void {
		if (!Active) return;
		console.timeLog(label);
	}

	export function timeStamp(label?: string): void {
		if (!Active) return;
		console.timeStamp(label);
	}

	export function trace(message?: any, ...optionalParams: any[]): void {
		if (!Active) return;
		console.trace(message, ...optionalParams)
	}

	export function warn(message?: any, ...optionalParams: any[]): void {
		if (hasLogListener()) onLog("error", message, optionalParams);
		if (!Active) return;
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
