import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMachine } from '../use-machine';
import { createMachine } from '../../core/create-machine';

describe('useMachine', () => {
	it('should re-render on machine state changes', () => {
		// Arrange.
		const bulbMachine = createBulbMachine();

		// Act.
		const { result } = renderHook(() => useMachine(bulbMachine));

		// Assert.
		expect(result.current.state).toBe('off');

		// Act.
		act(() => {
			bulbMachine.send('turn-on');
		});

		// Assert.
		expect(result.current.state).toBe('on');
	});

	it('should send events to the machine', () => {
		// Arrange.
		const bulbMachine = createBulbMachine();

		// Act.
		const { result } = renderHook(() => useMachine(bulbMachine));

		// Assert.
		expect(result.current.state).toBe('off');

		// Act.
		act(() => {
			result.current.send('turn-on');
		});

		// Assert.
		expect(result.current.state).toBe('on');
	});

	it('should check whether a transition can be performed', () => {
		// Arrange.
		const bulbMachine = createBulbMachine();

		// Act.
		const { result } = renderHook(() => useMachine(bulbMachine));

		let canTurnOn = result.current.canTransition('turn-on');
		let canTurnOff = result.current.canTransition('turn-off');

		// Assert.
		expect(canTurnOn).toBe(true);
		expect(canTurnOff).toBe(false);

		// Act.
		act(() => {
			result.current.send('turn-on');
		});

		// Assert.
		canTurnOn = result.current.canTransition('turn-on');
		canTurnOff = result.current.canTransition('turn-off');

		expect(canTurnOn).toBe(false);
		expect(canTurnOff).toBe(true);
	});
});

function createBulbMachine() {
	type State = 'on' | 'off';
	type Event = 'turn-on' | 'turn-off';

	return createMachine<State, Event>({
		initialState: 'off',
	})
		.when('off', (b) => {
			b.on('turn-on').transitionTo('on');
		})
		.when('on', (b) => {
			b.on('turn-off').transitionTo('off');
		});
}
