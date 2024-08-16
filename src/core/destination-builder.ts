export class DestinationBuilder<TState extends string> {
	private destination: TState | undefined;

	transitionTo(state: TState) {
		this.destination = state;
	}

	getDestination() {
		return this.destination ?? null;
	}
}
