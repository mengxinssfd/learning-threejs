import { createMachine, interpret } from 'xstate';
import * as THREE from 'three';
export enum ACTION {
  walk = 'walk',
  idle = 'idle',
  walkBack = 'walkBack',
  jump = 'jump',
  attack = 'attack',
  block = 'block',
  crouchIdle = 'crouchIdle',
  crouchBlock = 'crouchBlock',
  crouchAttack = 'crouchAttack',
  turnLeft = 'turnLeft',
  turnRight = 'turnRight',
  run = 'run',
  runBack = 'runBack',
  powerJump = 'powerJump',
}

export enum ActionEvents {
  walk = 'walk',
  jump = 'jump',
  powerJump = 'powerJump',
  attack = 'attack',
  block = 'block',
  crouch = 'crouch',
  crouchBlock = 'crouchBlock',
  turnLeft = 'turnLeft',
  turnRight = 'turnRight',
  crouchAttack = 'crouchAttach',
  walkBack = 'walkBack',
  run = 'run',
  runBack = 'runBack',
}
export function useActionMachine(
  actions: Partial<Record<ACTION, THREE.AnimationAction>>,
  mixer: THREE.AnimationMixer,
) {
  function useAction() {
    let activeAction: THREE.AnimationAction | null = null;
    let inProgress = false;
    function onLoopFinished() {
      inProgress = false;
      console.log('done');
    }
    function hook({
      action: actionType,
      timeScale = 1,
      loop = false,
    }: {
      action: ACTION;
      timeScale?: number;
      loop?: boolean;
      // afterLoop?: () => void;
    }): void {
      //wait for loop
      if (inProgress) return;
      if (loop) {
        mixer.addEventListener('loop', () => {
          onLoopFinished();
          // afterLoop();
        });
        inProgress = true;
      }

      const action = actions[actionType] as THREE.AnimationAction;

      mixer.timeScale = timeScale;

      // action.clampWhenFinished = true;
      // action.setLoop(THREE.LoopRepeat, loop);

      if (!activeAction) {
        action.play();
        activeAction = action;
        return;
      }
      if (action === activeAction) return;
      action.reset();
      action.play();
      activeAction.crossFadeTo(action, 0.1, true);
      activeAction = action;
    }
    return hook;
  }
  const runAction = useAction();
  const jumpStates = {
    weak: {
      entry() {
        runAction({ action: ACTION.jump });
      },
    },
    power: {
      entry() {
        runAction({ action: ACTION.powerJump });
      },
    },
  };
  const currentState = 'idle';
  const actionMachine = createMachine({
    id: 'action',
    initial: currentState,
    on: {
      stop: { target: '#action.idle' },
    },

    states: {
      idle: {
        id: '#idle',
        entry() {
          console.log('空闲');
          runAction({ action: ACTION.idle });
        },
        on: {
          block: 'blocking.stand',
          walk: 'walking.stand',
          crouch: 'crouching',
          jump: 'jumping.up.weak',
          attack: 'attacking.stand.action1',
          impact: 'impacting',
          [ActionEvents.turnRight]: 'turning.right',
          [ActionEvents.turnLeft]: 'turning.left',
          [ActionEvents.walkBack]: 'walking.back',
          [ActionEvents.powerJump]: 'jumping.up.weak',
          [ActionEvents.run]: 'running',
        },
      },
      impacting: {
        states: {},
      },
      crouching: {
        id: 'crouching',
        on: {
          [ActionEvents.crouchBlock]: '#blocking.withCrouch',
          [ActionEvents.block]: '#blocking.stand',
          [ActionEvents.attack]: '#attacking.withCrouch',
          walk: 'walking.withCrouch',
        },
        entry() {
          console.log('蹲');
          runAction({ action: ACTION.crouchIdle });
        },
      },
      // 防御
      blocking: {
        id: 'blocking',
        states: {
          // 站防
          stand: {
            on: {
              walk: '#walking.withBlock',
              [ActionEvents.crouchBlock]: '#blocking.withCrouch',
              [ActionEvents.crouch]: '#crouching',
            },
            entry() {
              console.log('站防');
              runAction({ action: ACTION.block });
            },
          },
          // 蹲防
          withCrouch: {
            on: {
              walk: '#walking.withCrouchBlock',
              attack: '#attacking.withCrouchBlock',
              [ActionEvents.crouch]: '#crouching',
              [ActionEvents.block]: '#blocking.stand',
            },
            entry() {
              console.log('蹲防');
              runAction({ action: ACTION.crouchBlock });
            },
          },
        },
      },
      walking: {
        id: 'walking',
        initial: 'stand',
        states: {
          stand: {
            on: {
              run: '#running',
              jump: '#jumping.up.weak',
              attack: '#attacking.stand.action1',
              crouch: 'withCrouch',
            },
            entry() {
              runAction({ action: ACTION.walk });
            },
          },
          back: {
            entry() {
              console.log('后退');
              runAction({ action: ACTION.walkBack });
            },
          },
          withBlock: {
            on: {
              attack: '#attacking.withBlock',
            },
          },
          withCrouch: {
            on: {
              attack: '#attacking.withCrouch',
            },
          },
          withCrouchBlock: {
            on: {
              attack: '#attacking.withCrouchBlock',
            },
          },
        },
      },
      turning: {
        id: 'turning',
        states: {
          left: {
            entry() {
              runAction({ action: ACTION.turnLeft });
            },
          },
          right: {
            entry() {
              runAction({ action: ACTION.turnRight });
            },
          },
        },
      },
      running: {
        id: 'running',
        entry() {
          runAction({ action: ACTION.run });
        },
        on: {
          jump: 'jumping.up.power',
          attack: 'attacking.stand.powerAttack',
          crouch: 'crouching',
        },
      },
      jumping: {
        id: 'jumping',
        states: {
          up: {
            states: jumpStates,
            after: {
              500: 'down',
            },
          },
          down: {
            type: 'final',
            states: jumpStates,
            after: {
              500: '#action.idle',
            },
          },
        },
      },
      attacking: {
        id: 'attacking',
        states: {
          stand: {
            states: {
              action1: {
                entry() {
                  console.log('站立攻击');
                  runAction({ action: ACTION.attack });
                },
              },
              powerAttack: {
                type: 'final',
              },
            },
          },
          withCrouch: {
            on: {
              [ActionEvents.crouch]: '#crouching',
            },
            entry() {
              console.log('下蹲攻击');
              runAction({ action: ACTION.crouchAttack });
            },
          },
          withBlock: {},
          withCrouchBlock: {},
        },
      },
    },
  });
  const service = interpret(actionMachine);
  // service.onTransition(function (listener, event) {
  //   console.log(listener, event);
  // });
  return service;
}
