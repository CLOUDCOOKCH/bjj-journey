import type { CatalogProgramme, Difficulty, ProgrammeExercise } from './types'

function strength(
  exerciseSlug: string,
  substitutions: string[],
  sets = 3,
  repetitions = 8,
  restSeconds = 90,
  effort = 6,
): ProgrammeExercise {
  return { exerciseSlug, substitutions, sets, repetitions, restSeconds, effort }
}

function programme(
  slug: string,
  name: string,
  description: string,
  weeks: number,
  difficulty: Difficulty,
  schedule: CatalogProgramme['schedule'],
): CatalogProgramme {
  return { slug, name, description, weeks, difficulty, optionalDeloadWeek: weeks, schedule }
}

const squat = strength('goblet-squat', ['bodyweight-squat', 'front-squat'])
const splitSquat = strength('reverse-lunge', ['bulgarian-split-squat', 'step-up'], 2)
const hinge = strength('romanian-deadlift', ['trap-bar-deadlift', 'single-leg-rdl'])
const bridge = strength('glute-bridge', ['hip-thrust', 'hamstring-slider-curl'], 2, 10)
const push = strength('push-up', ['dumbbell-floor-press', 'bench-press'])
const row = strength('dumbbell-row', ['band-row', 'inverted-row'])
const verticalPull = strength('band-assisted-pull-up', ['pull-up', 'band-row'], 3, 5)
const trunk = strength('dead-bug', ['bird-dog', 'pallof-press'], 2, 6, 60)
const carry = strength('farmers-carry', ['suitcase-carry', 'towel-hold'], 2, 1, 90)

export const programmeCatalog: CatalogProgramme[] = [
  programme('beginner-full-body', 'Beginner full-body strength',
    'Learn stable movements on two non-consecutive days. Keep a few good repetitions in reserve.', 4, 'beginner', [
      { day: 1, name: 'Squat and push', exercises: [squat, push, row, trunk] },
      { day: 4, name: 'Step and pull', exercises: [splitSquat, bridge, row, trunk] },
    ]),
  programme('two-day-bjj-strength', 'Two-day BJJ strength programme',
    'Cover major movement patterns twice a week, with space on either side of hard rolling.', 6, 'intermediate', [
      { day: 1, name: 'Squat, press and pull', exercises: [squat, push, verticalPull, carry] },
      { day: 4, name: 'Hinge and single-leg strength', exercises: [hinge, splitSquat, row, trunk] },
    ]),
  programme('three-day-bjj-strength', 'Three-day BJJ strength programme',
    'Use three short sessions only when mat frequency and recovery leave enough time for them.', 6, 'intermediate', [
      { day: 1, name: 'Squat and press', exercises: [squat, push, row] },
      { day: 3, name: 'Pull and trunk', exercises: [verticalPull, trunk, carry] },
      { day: 5, name: 'Hinge and unilateral work', exercises: [hinge, splitSquat, trunk] },
    ]),
  programme('minimal-equipment-home', 'Minimal-equipment home training',
    'Practise push, pull, lower-body and trunk patterns with a band and a stable anchor.', 4, 'beginner', [
      { day: 1, name: 'Home fundamentals', exercises: [
        strength('bodyweight-squat', ['reverse-lunge']), push,
        strength('band-row', ['dumbbell-row']), trunk,
      ] },
      { day: 4, name: 'Home single-leg and shoulder', exercises: [
        splitSquat, bridge, strength('band-external-rotation', ['scapular-push-up'], 2, 10), trunk,
      ] },
    ]),
  programme('kettlebell-only', 'Kettlebell-only programme',
    'Repeat controlled hinges, squats, rows and carries with one manageable bell.', 4, 'intermediate', [
      { day: 1, name: 'Squat, hinge and carry', exercises: [
        squat, strength('kettlebell-deadlift', ['single-leg-rdl']), strength('suitcase-carry', [], 2, 1),
      ] },
      { day: 4, name: 'Swing and row', exercises: [
        strength('kettlebell-swing', ['kettlebell-deadlift'], 3, 8),
        strength('kettlebell-row', []), splitSquat,
      ] },
    ]),
  programme('grappler-grip', 'Grip strength for grapplers',
    'Practise short grip bouts away from the heaviest gi rounds. End holds before the grip slips.', 4, 'intermediate', [
      { day: 2, name: 'Fabric grip and carry', exercises: [
        strength('towel-hold', ['dead-hang'], 3, 1), carry, row,
      ] },
      { day: 5, name: 'Pinch and vertical pull', exercises: [
        strength('plate-pinch', ['towel-hold'], 2, 1), verticalPull,
      ] },
    ]),
  programme('grappler-core', 'Core stability for grapplers',
    'Practise quiet trunk position while the arms and legs move.', 4, 'beginner', [
      { day: 2, name: 'Anti-extension and anti-rotation', exercises: [
        trunk, strength('pallof-press', ['band-anti-rotation-hold'], 2, 8),
      ] },
      { day: 5, name: 'Lateral stability', exercises: [
        strength('side-plank', ['front-plank'], 2, 1), strength('bird-dog', ['dead-bug'], 2, 6),
      ] },
    ]),
  programme('posterior-chain', 'Posterior-chain development',
    'Develop strength through controlled hip hinges and extensions using moderate effort.', 6, 'intermediate', [
      { day: 1, name: 'Hinge and hip extension', exercises: [hinge, bridge, row] },
      { day: 4, name: 'Single-leg hinge and hamstrings', exercises: [
        strength('single-leg-rdl', ['romanian-deadlift'], 2), strength('hamstring-slider-curl', ['glute-bridge'], 2, 6), trunk,
      ] },
    ]),
  programme('general-physical-preparation', 'General physical preparation',
    'Build repeatable strength and introduce a few deliberate explosive repetitions with full rest.', 6, 'intermediate', [
      { day: 1, name: 'Movement fundamentals', exercises: [squat, push, row, trunk] },
      { day: 4, name: 'Controlled power and carry', exercises: [
        strength('medicine-ball-chest-pass', ['push-up'], 3, 4, 120),
        strength('low-box-jump', ['step-up'], 3, 3, 120), carry,
      ] },
    ]),
  programme('reduced-volume-competition', 'Reduced-volume competition preparation',
    'Retain familiar strength movements with fewer sets. Keep the final days available for technical work and recovery.', 3, 'intermediate', [
      { day: 1, name: 'Low-volume full body', exercises: [
        strength('goblet-squat', ['bodyweight-squat'], 2, 5, 120, 5),
        strength('dumbbell-floor-press', ['push-up'], 2, 5, 120, 5),
        strength('dumbbell-row', ['band-row'], 2, 6, 120, 5),
      ] },
    ]),
]
