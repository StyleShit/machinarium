export const getDestination = Symbol('getDestination');

export class DestinationBuilder<TState extends string> {
	private destination: TState | undefined;

	transitionTo(state: TState) {
		this.destination = state;
	}

	// Use a symbol to make it invisible for users, but visible for internal use.
	[getDestination]() {
		return this.destination ?? null;
	}
}
