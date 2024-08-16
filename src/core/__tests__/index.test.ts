/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/unbound-method */

import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { createMachine } from '../create-machine';

describe('Machinarium', () => {
	it('should set initial state', () => {
		// Arrange.
		const bulbMachine = createMachine({
			initialState: 'off',
		});

		// Act & Assert.
		expect(bulbMachine.getState()).toBe('off');
	});

	it('should transition between states', () => {
		// Arrange.
		type State = 'on' | 'off' | 'broken';
		type Event = 'turn-on' | 'turn-off' | 'break' | 'fix';

		const bulbMachine = createMachine<State, Event>({
			initialState: 'off',
		})
			.when('off', (b) => {
				b.on('turn-on').transitionTo('on');
				b.on('break').transitionTo('broken');
			})
			.when('on', (b) => {
				b.on('turn-off').transitionTo('off');
				b.on('break').transitionTo('broken');
			})
			.when('broken', (b) => {
				b.on('fix').transitionTo('off');
			});

		// Act - Transition to another state.
		bulbMachine.send('turn-on');

		// Assert.
		expect(bulbMachine.getState()).toBe('on');

		// Act - Transition to another state.
		bulbMachine.send('turn-off');

		// Assert.
		expect(bulbMachine.getState()).toBe('off');

		// Act - Transition to another state.
		bulbMachine.send('break');

		// Assert.
		expect(bulbMachine.getState()).toBe('broken');

		// Act - Transition to another state.
		bulbMachine.send('fix');

		// Assert.
		expect(bulbMachine.getState()).toBe('off');

		// Act - Transition to the same state.
		bulbMachine.send('turn-off');

		// Assert.
		expect(bulbMachine.getState()).toBe('off');
	});

	it('should not transition when there is no destination', () => {
		// Arrange.
		type State = 'on' | 'off';
		type Event = 'turn-on' | 'turn-off';

		const bulbMachine = createMachine<State, Event>({
			initialState: 'off',
		}).when('off', (b) => {
			// Don't set destination.
			b.on('turn-on');
		});

		// Act.
		bulbMachine.send('turn-on');

		// Assert.
		expect(bulbMachine.getState()).toBe('off');
	});

	it('should support multiple destination definition for the same state', () => {
		// Arrange.
		type State = 'on' | 'off' | 'broken';
		type Event = 'turn-on' | 'turn-off' | 'break';

		const bulbMachine = createMachine<State, Event>({
			initialState: 'off',
		})
			.when('off', (b) => {
				b.on('turn-on').transitionTo('on');
			})
			.when('on', (b) => {
				b.on('turn-off').transitionTo('off');
			})
			.when('off', (b) => {
				b.on('break').transitionTo('broken');
			});

		// Act.
		bulbMachine.send('turn-on');

		// Assert.
		expect(bulbMachine.getState()).toBe('on');

		// Act.
		bulbMachine.send('turn-off');
		bulbMachine.send('break');

		// Assert.
		expect(bulbMachine.getState()).toBe('broken');
	});

	it('should support defining multiple states transitions at once', () => {
		// Arrange.
		type State = 'on' | 'off' | 'broken';
		type Event = 'turn-on' | 'turn-off' | 'break';

		const bulbMachine = createMachine<State, Event>({
			initialState: 'off',
		})
			.when(['on', 'off'], (b) => {
				b.on('break').transitionTo('broken');
			})
			.when('broken', (b) => {
				b.on('turn-on').transitionTo('on');
				b.on('turn-off').transitionTo('off');
			});

		// Act.
		bulbMachine.send('break');

		// Assert.
		expect(bulbMachine.getState()).toBe('broken');

		// Act.
		bulbMachine.send('turn-on');

		// Assert.
		expect(bulbMachine.getState()).toBe('on');

		// Act.
		bulbMachine.send('break');

		// Assert.
		expect(bulbMachine.getState()).toBe('broken');
	});

	it('should support accepting function as destination', () => {
		// Arrange.
		type State = 'on' | 'off';
		type Event = 'toggle';

		const bulbMachine = createMachine<State, Event>({
			initialState: 'off',
		}).when(['on', 'off'], (b) => {
			b.on('toggle').transitionTo((prev) =>
				prev === 'on' ? 'off' : 'on',
			);
		});

		// Act.
		bulbMachine.send('toggle');

		// Assert.
		expect(bulbMachine.getState()).toBe('on');

		// Act.
		bulbMachine.send('toggle');

		// Assert.
		expect(bulbMachine.getState()).toBe('off');
	});

	it('should support checking if a transition can be performed', () => {
		// Arrange.
		type State = 'on' | 'off';
		type Event = 'turn-on' | 'turn-off';

		const bulbMachine = createMachine<State, Event>({
			initialState: 'off',
		})
			.when('off', (b) => {
				b.on('turn-on').transitionTo('on');
			})
			.when('on', (b) => {
				b.on('turn-off').transitionTo('off');
			});

		// Act & Assert.
		expect(bulbMachine.can('turn-on')).toBe(true);
		expect(bulbMachine.can('turn-off')).toBe(false);
	});

	it('should subscribe to state transitions', () => {
		// Arrange.
		type State = 'on' | 'off';
		type Event = 'turn-on' | 'turn-off';

		const bulbMachine = createMachine<State, Event>({
			initialState: 'off',
		})
			.when('off', (b) => {
				b.on('turn-on').transitionTo('on');
			})
			.when('on', (b) => {
				b.on('turn-off').transitionTo('off');
			});

		const subscriber = vi.fn();

		// Act - Transition to another state.
		const unsubscribe = bulbMachine.subscribe(subscriber);

		bulbMachine.send('turn-on');

		// Assert.
		expect(subscriber).toHaveBeenCalledOnce();

		// Act - Transition to the same state.
		bulbMachine.send('turn-on');

		// Assert.
		expect(subscriber).toHaveBeenCalledOnce();

		// Act - Unsubscribe
		unsubscribe();
		bulbMachine.send('turn-off');

		// Assert.
		expect(subscriber).toHaveBeenCalledOnce();
	});

	it('should have proper types', () => {
		// Arrange.
		type State = 'on' | 'off';
		type Event = 'turn-on' | 'turn-off';

		const bulbMachine = createMachine<State, Event>({
			initialState: 'off',
		});

		// Assert.
		expectTypeOf<Parameters<typeof bulbMachine.when>[0]>().toEqualTypeOf<
			State | State[]
		>();

		bulbMachine.when('on', (b) => {
			expectTypeOf<Parameters<typeof b.on>[0]>().toEqualTypeOf<Event>();

			const destinationBuilder = b.on('turn-on');

			expectTypeOf<
				Parameters<typeof destinationBuilder.transitionTo>[0]
			>().toEqualTypeOf<State | ((prev: State) => State)>();
		});

		expectTypeOf(bulbMachine.getState).toEqualTypeOf<() => State>();
		expectTypeOf(bulbMachine.send).toEqualTypeOf<(event: Event) => void>();

		expectTypeOf(bulbMachine.can).toEqualTypeOf<
			(event: Event) => boolean
		>();

		expectTypeOf(bulbMachine.subscribe).toEqualTypeOf<
			(subscriber: () => void) => () => void
		>();
	});
});
