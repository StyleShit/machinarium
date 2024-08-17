import { getDestination } from './destination-builder';
import {
	getDestinationByEvent,
	TransitionsBuilder,
} from './transitions-builder';

export class StateMachine<TState extends string, TEvent extends string> {
	private state: TState;

	private transitions: {
		[state in TState]?: Array<TransitionsBuilder<TState, TEvent>>;
	} = {};

	private subscribers: Set<() => void> = new Set();

	constructor({ initialState }: { initialState: TState }) {
		this.state = initialState;
	}

	when(
		states: TState | TState[],
		builderCallback: (builder: TransitionsBuilder<TState, TEvent>) => void,
	) {
		const transitionsBuilder = new TransitionsBuilder<TState, TEvent>();

		builderCallback(transitionsBuilder);

		if (!Array.isArray(states)) {
			states = [states];
		}

		states.forEach((state) => {
			if (!this.transitions[state]) {
				this.transitions[state] = [];
			}

			this.transitions[state].push(transitionsBuilder);
		});

		return this;
	}

	getState() {
		return this.state;
	}

	send(event: TEvent) {
		const nextDestination = this.getNextDestination(event);

		if (!nextDestination) {
			return;
		}

		this.state = nextDestination(this.state);

		this.notify();
	}

	can(event: TEvent) {
		const nextDestination = this.getNextDestination(event);

		return !!nextDestination;
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

	private getNextDestination(event: TEvent) {
		const possibleTransitions = this.transitions[this.state];

		const nextDestination = possibleTransitions
			?.map((transition) =>
				transition[getDestinationByEvent](event)?.[getDestination](),
			)
			.find((destination) => !!destination);

		return nextDestination ?? null;
	}
}
