import { DestinationBuilder } from './destination-builder';

export class TransitionsBuilder<TState extends string, TEvent extends string> {
	private destinations: {
		[event in TEvent]?: DestinationBuilder<TState>;
	} = {};

	on(event: TEvent) {
		const destinationBuilder = new DestinationBuilder<TState>();

		this.destinations[event] = destinationBuilder;

		return destinationBuilder;
	}

	get(event: TEvent) {
		return this.destinations[event] ?? null;
	}
}
