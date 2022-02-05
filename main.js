import './style.css';
import { createMachine, interpret, assign } from 'xstate';

// Actor Model implementation
function countBehaviour(state, event){
  if (event.type === 'INC') {
    return {
      ...state,
      count: state.count + 1
    }
  }
  return state;
}

function createActor(behaviour, initialState) {
  let currentState = initialState;
  const listerners = new Set();

  return {
    send: (event) => {
      currentState = behaviour(currentState, event);
      listerners.forEach((listerner) => {
        listerner(currentState);
      });
    },
    subscribe: (listerner) => {
      listerners.add(listerner);
      listerner(currentState);
    },
    getSnapshot: () => currentState,
  }
}

const callback = (sendback, receive) => {
  receive(event => {
    console.log('Received', event);
  });

  timeout = setInterval(() => {
    sendback({ type: 'PING' })
  }, 1000);

  return () => {
    clearTimeout(timeout);
  }
}

// XState actor model
const actor = createActor(countBehaviour, { count: 42 });
window.actor = actor;

const machine = createMachine({
  initial: 'loading',
  states: {
    loading: {
      invoke: {
        id: 'fetchNumber',
        src: (context, event) => new Promise(res => {
          setTimeout(() => {
            res(43)
          }, 1000)
        }),
        onDone: {
          target: 'success',
          actions: (_, event) => {
            console.log('DONE', event);
          }
        },
      },
      on: {
        on: {
          CANCEL: 'canceled',
        }
      },
    },
    success: {},
    canceled: {},
  },
});

const service = state.interpret(machine).start()

service.subscribe((state) => {
  console.log(state.value)
});

window.service = service
