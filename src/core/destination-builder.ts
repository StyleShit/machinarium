export const getDestination = Symbol('getDestination');

export class DestinationBuilder<TState extends string> {
	private destination: DestinationFn<TState> | undefined;

	transitionTo(destination: TState | DestinationFn<TState>) {
		const destinationFn =
			typeof destination === 'function'
				? destination
				: ((() => destination) as DestinationFn<TState>);

		this.destination = destinationFn;
	}

	// Use a symbol to make it invisible for users, but visible for internal use.
	[getDestination]() {
		return this.destination ?? null;
	}
}

type DestinationFn<TState extends string> = (prevState: TState) => TState;
