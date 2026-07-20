// @ts-nocheck
export type LFabMagnetic = 'x' | 'y';
export type LFabOffset = {
	x : number;
	y : number;
};
export type LFabAxis = 'x' | 'y' | 'xy' | 'lock';

export type LFabBoundary = {
	top : number;
	right : number;
	bottom : number;
	left : number;
};

// #ifndef UNI-APP-X
export interface CSSProperties {
	[key : string] : string | number
}
// #endif



export interface FabProps {
	offset: number[],
	// #ifdef APP-ANDROID
	gap : any,
	size ?: any,
	// #endif
	
	// #ifndef APP-ANDROID
	gap : string|number,
	size ?: string | number | (string|number)[],
	// #endif
	
	axis : string,
	icon ?: string,
	magnetic ?: string,
	bgColor ?: string,
}