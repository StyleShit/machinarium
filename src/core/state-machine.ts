import { TransitionsBuilder } from './transitions-builder';

export class StateMachine<TState extends string, TEvent extends string> {
	private state: TState;

	private transitions: {
		[state in TState]?: TransitionsBuilder<TState, TEvent>;
	} = {};

	private subscribers: Set<() => void> = new Set();

	constructor({ initialState }: { initialState: TState }) {
		this.state = initialState;
	}

	when(
		state: TState,
		builderCallback: (builder: TransitionsBuilder<TState, TEvent>) => void,
	) {
		const transitionBuilder = new TransitionsBuilder<TState, TEvent>();

		builderCallback(transitionBuilder);

		this.transitions[state] = transitionBuilder;

		return this;
	}

	getState() {
		return this.state;
	}

	send(event: TEvent) {
		const currentTransition = this.transitions[this.state];
		const destination = currentTransition?.get(event)?.getDestination();

		if (!destination) {
			return;
		}

		this.state = destination;

		this.notify();
	}

	subscribe(subscriber: () => void) {
		this.subscribers.add(subscriber);

		return () => {
			this.subscribers.delete(subscriber);
		};
	}

	private notify() {
		this.subscribers.forEach((subscriber) => {
			subscriber();
		});
	}
}
