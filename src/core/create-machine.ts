import { StateMachine } from './state-machine';

export function createMachine<
	TState extends string,
	TEvent extends string,
>(options: { initialState: TState }) {
	return new StateMachine<TState, TEvent>(options);
}
