import type { CatalogRoutine, RoutineStep, TrainingCategory } from './types'

type TimedStep = [exerciseSlug: string, seconds: number, sides?: 'left-right', restSeconds?: number]

function timedRoutine(
  slug: string,
  name: string,
  category: TrainingCategory,
  style: CatalogRoutine['style'],
  description: string,
  steps: TimedStep[],
): CatalogRoutine {
  const elapsed = steps.reduce((total, [, seconds, sides, restSeconds]) => (
    total + seconds * (sides ? 2 : 1) + (restSeconds ?? 0)
  ), 0)

  return {
    slug,
    name,
    category,
    style,
    description,
    durationMinutes: elapsed / 60,
    steps: steps.map(([exerciseSlug, durationSeconds, sides, restSeconds]) => ({
      exerciseSlug, durationSeconds, sides, restSeconds,
    })),
  }
}

const mobilityRoutines = [
  timedRoutine('quick-mobility', '5-minute quick mobility', 'mobility', 'dynamic',
    'Take a short movement break for the hips, upper back and wrists.', [
      ['90-90-hip-switches', 60], ['cat-cow', 60], ['wrist-rocks', 60],
      ['wall-slides', 60], ['supported-squat-to-stand', 60],
    ]),
  timedRoutine('daily-mobility', '10-minute daily mobility', 'mobility', 'mixed',
    'Move through common grappling positions at an easy pace.', [
      ['90-90-hip-switches', 60], ['adductor-rockbacks', 60, 'left-right'],
      ['thoracic-open-book', 60, 'left-right'], ['ankle-dorsiflexion', 45, 'left-right'],
      ['wall-slides', 60], ['seated-ankle-circles', 45, 'left-right'],
      ['cat-cow', 60],
    ]),
  timedRoutine('hip-mobility', '15-minute hip mobility', 'mobility', 'mixed',
    'Develop active rotation, then finish with low-intensity hip and thigh holds.', [
      ['hip-cars', 60, 'left-right'], ['90-90-hip-switches', 90],
      ['adductor-rockbacks', 75, 'left-right'], ['shin-box-lift', 60, 'left-right'],
      ['supine-hamstring-glide', 60, 'left-right'], ['hip-flexor-lunge', 45, 'left-right'],
      ['figure-four-stretch', 60, 'left-right'], ['cat-cow', 60], ['deep-squat-hold', 30],
    ]),
  timedRoutine('shoulder-mobility', '15-minute shoulder mobility', 'mobility', 'mixed',
    'Start with active shoulder control and finish with supported stretches.', [
      ['shoulder-cars', 60, 'left-right'], ['wall-slides', 90],
      ['shoulder-wall-clock', 60, 'left-right'], ['wall-thoracic-extension', 90],
      ['thoracic-open-book', 60, 'left-right'], ['quadruped-thread-the-needle', 60, 'left-right'],
      ['cross-body-shoulder-stretch', 45, 'left-right'], ['doorway-pec-stretch', 45, 'left-right'],
      ['scapular-push-up', 60],
    ]),
  timedRoutine('pre-bjj-warm-up', '10-minute pre-BJJ warm-up', 'mobility', 'dynamic',
    'Keep moving and build range gradually before training. Each timed block allows easy repeats and resets.', [
      ['cat-cow', 60], ['wrist-rocks', 60], ['standing-hip-rotation', 45, 'left-right'],
      ['ankle-dorsiflexion', 45, 'left-right'], ['worlds-greatest-stretch', 60, 'left-right'],
      ['inchworm', 60], ['supported-squat-to-stand', 60], ['scapular-push-up', 60],
    ]),
  timedRoutine('post-bjj-cooldown', '15-minute post-BJJ cooldown', 'mobility', 'static',
    'Move gently after the session. Use short comfortable holds and reset between them.', [
      ['relaxed-belly-breathing', 120], ['figure-four-stretch', 60, 'left-right'],
      ['hip-flexor-lunge', 60, 'left-right'], ['bent-knee-calf-stretch', 60, 'left-right'],
      ['cross-body-shoulder-stretch', 60, 'left-right'], ['wrist-flexor-stretch', 45, 'left-right'],
      ['doorway-pec-stretch', 45, 'left-right'], ['side-lying-wind-down', 60, 'left-right'],
    ]),
  timedRoutine('full-body-mobility', '20-minute full-body mobility', 'mobility', 'mixed',
    'Move from the ground to standing with gentle hip, spine and shoulder work.', [
      ['cat-cow', 90], ['shoulder-cars', 60, 'left-right'], ['hip-cars', 60, 'left-right'],
      ['90-90-hip-switches', 90], ['wrist-rocks', 60], ['supine-hamstring-glide', 60, 'left-right'],
      ['worlds-greatest-stretch', 60, 'left-right'], ['thoracic-open-book', 60, 'left-right'],
      ['ankle-dorsiflexion', 60, 'left-right'], ['wall-slides', 90],
      ['supported-squat-to-stand', 60], ['comfortable-long-exhale', 90],
    ]),
  timedRoutine('guard-mobility', '20-minute guard mobility', 'mobility', 'mixed',
    'Build usable hip and spine movement for seated, open and half guard positions.', [
      ['90-90-hip-switches', 120], ['adductor-rockbacks', 60, 'left-right'],
      ['butterfly-rocks', 90], ['seated-straddle-shifts', 60, 'left-right'],
      ['shin-box-lift', 60, 'left-right'], ['prone-hip-internal-rotation', 60, 'left-right'],
      ['glute-march', 90], ['cat-cow', 90], ['thoracic-open-book', 60, 'left-right'],
      ['figure-four-stretch', 60, 'left-right'], ['supine-hamstring-glide', 45, 'left-right'],
    ]),
  timedRoutine('recovery-day-mobility', '15-minute recovery-day mobility', 'mobility', 'mixed',
    'Use gentle supported motions at a pace that still feels like recovery.', [
      ['relaxed-belly-breathing', 120], ['supine-knee-sways', 90],
      ['cat-cow', 90], ['figure-four-stretch', 60, 'left-right'],
      ['thoracic-open-book', 60, 'left-right'], ['recovery-ankle-pumps', 45, 'left-right'],
      ['seated-shoulder-release', 90], ['side-lying-wind-down', 90, 'left-right'],
    ]),
  timedRoutine('desk-worker-mobility', '10-minute desk-worker mobility', 'mobility', 'mixed',
    'Fit hips, neck, upper back and wrists into a short break with a chair and wall.', [
      ['seated-thoracic-turn', 45, 'left-right'], ['gentle-neck-turns', 45, 'left-right'],
      ['seated-chin-nod', 60], ['wrist-circles', 60], ['standing-hamstring-hinge', 45, 'left-right'],
      ['wall-slides', 90], ['seated-ankle-circles', 30, 'left-right'], ['doorway-pec-stretch', 30, 'left-right'],
    ]),
]

const soloRoutines = [
  timedRoutine('solo-five-minute-fundamentals', '5-minute solo fundamentals', 'solo', 'dynamic',
    'Learn a small set of slow mat movements on a clear padded area.', [
      ['four-point-base', 60], ['shrimp', 30, 'left-right'], ['solo-bridge', 30, 'left-right'],
      ['seated-guard-pivots', 30, 'left-right'], ['technical-stand-up', 30, 'left-right'],
    ]),
  timedRoutine('solo-ten-minute-guard', '10-minute solo guard movement', 'solo', 'dynamic',
    'Practise opening space and restoring a balanced seated or supine guard position.', [
      ['four-point-base', 60], ['shrimp', 45, 'left-right'], ['seated-guard-pivots', 45, 'left-right'],
      ['seated-butt-scoot', 90], ['supine-leg-pummels', 45, 'left-right'],
      ['guard-knee-shield-switch', 45, 'left-right'], ['technical-stand-up', 45, 'left-right'],
    ]),
  timedRoutine('solo-fifteen-minute-footwork', '15-minute solo footwork', 'solo', 'dynamic',
    'Practise technical movement at a pace where feet land quietly.', [
      ['shadow-wrestling', 120], ['controlled-base-switch', 120], ['disengage-step', 60, 'left-right'],
      ['passing-angle-steps', 90, 'left-right'], ['penetration-step', 60, 'left-right'],
      ['knee-cut-line-step', 60, 'left-right'], ['shadow-wrestling', 120],
    ]),
  timedRoutine('solo-twenty-minute-transitions', '20-minute solo transitions', 'solo', 'dynamic',
    'Combine ground and standing transitions without rushing reps.', [
      ['four-point-base', 120], ['shrimp', 60, 'left-right'], ['reverse-shrimp', 60, 'left-right'],
      ['solo-bridge', 45, 'left-right'], ['hip-heist', 45, 'left-right'], ['sit-out', 45, 'left-right'],
      ['turtle-to-kneeling', 60, 'left-right'], ['bear-crawl', 120], ['technical-stand-up', 75, 'left-right'],
      ['shadow-wrestling', 120], ['passing-angle-steps', 30, 'left-right'],
    ]),
]

const conditioningRoutines = [
  timedRoutine('conditioning-beginner-aerobic', 'Beginner aerobic base', 'conditioning', 'interval',
    'Warm up and cool down at a walk. Walk or jog in the centre block and keep a conversational effort.', [
      ['easy-walk', 240], ['easy-run', 480], ['easy-walk', 180],
    ]),
  timedRoutine('conditioning-grappling-rounds', 'Repeatable grappling rounds', 'conditioning', 'interval',
    'Four technical two-minute rounds separated by easy recovery. Keep footwork controlled throughout.', [
      ['easy-walk', 180], ['shadow-rounds', 120, undefined, 60],
      ['grappling-circuit', 120, undefined, 60], ['shadow-rounds', 120, undefined, 60],
      ['grappling-circuit', 120], ['easy-walk', 120],
    ]),
  timedRoutine('conditioning-air-bike-repeats', 'Advanced air bike repeats', 'conditioning', 'interval',
    'Six controlled twenty-second efforts. Shorten the effort or reduce the number of intervals if form or pace drops.', [
      ['easy-air-bike', 240],
      ...Array.from({ length: 6 }, (): TimedStep => ['air-bike-intervals', 20, undefined, 70]),
      ['easy-air-bike', 120],
    ]),
  timedRoutine('conditioning-cycle-endurance', 'Conversational aerobic ride', 'conditioning', 'interval',
    'Build an aerobic base without requiring heart-rate data. Use the talk test through the steady block.', [
      ['steady-cycle', 300], ['steady-cycle', 900], ['steady-cycle', 300],
    ]),
]

const recoveryRoutines = [
  timedRoutine('recovery-full-body', 'Gentle full-body recovery', 'recovery', 'recovery',
    'Try supported hip, spine, ankle and shoulder movement on a recovery day.', [
      ['relaxed-belly-breathing', 120], ['supine-knee-sways', 120], ['recovery-ankle-pumps', 60, 'left-right'],
      ['seated-shoulder-release', 120], ['side-lying-wind-down', 60, 'left-right'],
    ]),
  timedRoutine('recovery-active', 'Active recovery spin', 'recovery', 'recovery',
    'Recover with easy pedalling on light resistance. Keep the session deliberately easy.', [
      ['recovery-easy-cycle', 600],
    ]),
  timedRoutine('recovery-breathing', 'Relaxation and breathing', 'recovery', 'recovery',
    'Use quiet breathing and comfortable positions after class.', [
      ['relaxed-belly-breathing', 120], ['comfortable-long-exhale', 120], ['side-lying-wind-down', 30, 'left-right'],
    ]),
  timedRoutine('recovery-walking', 'Easy recovery walk', 'recovery', 'recovery',
    'Choose an easy flat route and finish feeling like you could go farther.', [
      ['easy-recovery-walk', 600],
    ]),
  timedRoutine('recovery-light-stretch', 'Light stretch reset', 'recovery', 'recovery',
    'Use mild supported stretches. Reset instead of staying past a comfortable hold.', [
      ['supported-child-pose', 60], ['gentle-calf-lengthen', 30, 'left-right'],
      ['supported-chest-rest', 60], ['figure-four-stretch', 30, 'left-right'],
      ['relaxed-belly-breathing', 60],
    ]),
  timedRoutine('recovery-day-reset', 'Recovery-day reset', 'recovery', 'recovery',
    'Combine light walking and a supported return to rest.', [
      ['easy-recovery-walk', 480], ['supine-knee-sways', 60], ['supported-child-pose', 60],
      ['side-lying-wind-down', 60, 'left-right'], ['relaxed-belly-breathing', 180],
    ]),
]

const strengthCircuit: RoutineStep[] = [
  { exerciseSlug: 'bodyweight-squat', repetitions: 8, restSeconds: 60 },
  { exerciseSlug: 'push-up', repetitions: 6, restSeconds: 60 },
  { exerciseSlug: 'band-row', repetitions: 8, restSeconds: 60 },
  { exerciseSlug: 'dead-bug', repetitions: 6, sides: 'left-right' },
]

export const routineCatalog: CatalogRoutine[] = [
  ...mobilityRoutines,
  ...conditioningRoutines,
  ...soloRoutines,
  ...recoveryRoutines,
  {
    slug: 'strength-beginner-circuit',
    name: 'Beginner full-body strength circuit',
    category: 'strength',
    style: 'strength',
    description: 'Two unhurried circuits with modest effort. Leave time to recover before the next hard mat session.',
    durationMinutes: 15,
    steps: [...strengthCircuit, ...strengthCircuit],
  },
]
