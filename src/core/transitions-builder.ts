import { DestinationBuilder } from './destination-builder';

export const getDestinationByEvent = Symbol('getDestinationByEvent');

export class TransitionsBuilder<TState extends string, TEvent extends string> {
	private destinations: {
		[event in TEvent]?: DestinationBuilder<TState>;
	} = {};

	on(event: TEvent) {
		const destinationBuilder = new DestinationBuilder<TState>();

		this.destinations[event] = destinationBuilder;

		return destinationBuilder;
	}

	// Use a symbol to make it invisible for users, but visible for internal use.
	[getDestinationByEvent](event: TEvent) {
		return this.destinations[event] ?? null;
	}
}
