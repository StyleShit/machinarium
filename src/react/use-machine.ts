import { useSyncExternalStore } from 'react';
import type { StateMachine } from '../core/state-machine';

export function useMachine<TState extends string, TEvent extends string>(
	machine: StateMachine<TState, TEvent>,
) {
	const state = useSyncExternalStore(
		(cb) => machine.subscribe(cb),
		() => machine.getState(),
	);

	const send = (event: TEvent) => {
		machine.send(event);
	};

	const canTransition = (event: TEvent) => {
		return machine.can(event);
	};

	return {
		state,
		send,
		canTransition,
	};
}
