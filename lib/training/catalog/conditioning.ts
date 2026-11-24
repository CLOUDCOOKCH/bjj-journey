import { defineExercises } from './types'

export const conditioningExercises = defineExercises('conditioning', [
  {
    slug: "easy-walk",
    name: "Easy walk",
    description: "Use an easy pace to practise steady breathing.",
    instructions: ["Choose a flat route and start slowly.", "Maintain a pace that allows full sentences.", "Slow down for the final two minutes."],
    bodyRegions: ["full-body", "ankles"],
    difficulty: "beginner",
    equipment: [],
    dosage: "10 to 30 minutes",
    commonMistakes: ["Turning an easy walk into a hard uphill session."],
    safety: ["Choose a safe route and reduce pace in hot weather."],
    variations: {
      easier: "Walk for five minutes close to home.",
      harder: "Extend duration before pace or slope."
    },
    bjjRelevance: "Adds aerobic work with low fatigue between mat days.",
    movementPattern: "Low-impact aerobic base"
  },
  {
    slug: "incline-walk",
    name: "Incline treadmill walk",
    description: "Add a gentle slope to walking while keeping intensity manageable.",
    instructions: ["Start at a flat, easy pace.", "Raise incline a small amount and check your breathing.", "Reduce incline before stepping off."],
    bodyRegions: ["glutes", "hamstrings", "ankles"],
    difficulty: "beginner",
    equipment: ["Treadmill"],
    dosage: "12 to 25 minutes",
    commonMistakes: ["Leaning heavily on the handrails to maintain pace."],
    safety: ["Use the safety clip and make small setting changes."],
    variations: {
      easier: "Use a flat walk.",
      harder: "Increase time on a modest incline."
    },
    bjjRelevance: "Builds an aerobic base without adding running impact.",
    movementPattern: "Low-impact aerobic base"
  },
  {
    slug: "steady-cycle",
    name: "Conversational cycling",
    description: "Ride at a consistent conversational effort.",
    instructions: ["Set the saddle so the knee stays slightly bent at the bottom.", "Pedal easily for five minutes.", "Settle into an even pace where talking is comfortable."],
    bodyRegions: ["knees", "hips", "full-body"],
    difficulty: "beginner",
    equipment: ["Stationary bicycle"],
    dosage: "15 to 35 minutes",
    commonMistakes: ["Grinding against a resistance that slows cadence too far."],
    safety: ["Reduce resistance if your knee is irritated."],
    variations: {
      easier: "Use ten minutes of light spinning.",
      harder: "Extend the steady segment gradually."
    },
    bjjRelevance: "Adds work capacity while limiting impact before mat practice.",
    movementPattern: "Steady aerobic cycling"
  },
  {
    slug: "steady-row",
    name: "Steady rowing",
    description: "Use a smooth stroke sequence at a maintainable pace.",
    instructions: ["Set strap and resistance at comfortable values.", "Push with legs, then swing the torso and draw the handle.", "Return arms, torso and knees in that order."],
    bodyRegions: ["back", "hips", "arms", "knees"],
    difficulty: "intermediate",
    equipment: ["Rowing machine"],
    dosage: "12 to 25 minutes",
    commonMistakes: ["Pulling the arms before using the legs."],
    safety: ["Keep resistance moderate and stop if back position deteriorates."],
    variations: {
      easier: "Use shorter steady segments.",
      harder: "Extend the steady segment while keeping stroke quality."
    },
    bjjRelevance: "Trains sustained whole-body output during longer sessions.",
    movementPattern: "Steady aerobic rowing"
  },
  {
    slug: "easy-run",
    name: "Easy run or run-walk",
    description: "Use comfortable short bouts of running and walking.",
    instructions: ["Walk for several minutes to warm up.", "Jog slowly or alternate a minute of jogging with a minute of walking.", "Finish with an easy walk."],
    bodyRegions: ["ankles", "knees", "full-body"],
    difficulty: "beginner",
    equipment: [],
    dosage: "12 to 25 minutes",
    commonMistakes: ["Increasing pace and duration in the same session."],
    safety: ["Use a safe route and replace running with cycling if impact is uncomfortable."],
    variations: {
      easier: "Walk briskly throughout.",
      harder: "Lengthen jog segments while keeping the same effort."
    },
    bjjRelevance: "Supports endurance across multiple rounds.",
    movementPattern: "Steady aerobic running"
  },
  {
    slug: "air-bike-intervals",
    name: "Air bike intervals",
    description: "Alternate controlled hard efforts with generous recovery.",
    instructions: ["Spin easily for four minutes.", "Drive the pedals and handles for each work interval.", "Keep moving easily until breathing settles again."],
    bodyRegions: ["full-body", "hips", "shoulders"],
    difficulty: "intermediate",
    equipment: ["Air bike"],
    dosage: "6 rounds of 20 seconds work and 70 seconds easy",
    commonMistakes: ["Making the first interval so hard later rounds fail."],
    safety: ["Stop hard work if you feel faint and leave time before the next hard mat day."],
    variations: {
      easier: "Use four rounds at a moderate pace.",
      harder: "Extend to eight rounds at the same sustainable effort."
    },
    bjjRelevance: "Practises short bursts and recovery between grappling exchanges.",
    movementPattern: "High-intensity cycling interval"
  },
  {
    slug: "rower-intervals",
    name: "Rower intervals",
    description: "Alternate a strong stroke and a slow recovery rhythm.",
    instructions: ["Warm up and settle the stroke sequence.", "Row firmly for the timed work period.", "Return to relaxed, lower-rate strokes for rest."],
    bodyRegions: ["back", "hips", "arms", "full-body"],
    difficulty: "intermediate",
    equipment: ["Rowing machine"],
    dosage: "6 rounds of 30 seconds work and 60 seconds easy",
    commonMistakes: ["Chasing speed by collapsing the finish position."],
    safety: ["Finish the effort when form breaks down."],
    variations: {
      easier: "Use four intervals with 90 seconds rest.",
      harder: "Add one interval before raising stroke intensity."
    },
    bjjRelevance: "Builds the ability to repeat hard work and recover.",
    movementPattern: "High-intensity rowing interval"
  },
  {
    slug: "jump-rope-basic",
    name: "Basic jump rope",
    description: "Practise low, rhythmic hops with the rope driven by the wrists.",
    instructions: ["Set rope length to reach around the lower chest from underfoot.", "Keep elbows close and turn the rope with small wrist movements.", "Land softly after each low hop."],
    bodyRegions: ["ankles", "forearms", "shoulders"],
    difficulty: "beginner",
    equipment: ["Jump rope"],
    dosage: "6 rounds of 30 seconds with 30 seconds rest",
    commonMistakes: ["Jumping too high or winding with the upper arms."],
    safety: ["Use a non-slip surface and stop if calves or ankles become painful."],
    variations: {
      easier: "Rehearse the rhythm without a rope.",
      harder: "Keep jumps low while extending each round."
    },
    bjjRelevance: "Builds nimble footwork while adding short conditioning bouts.",
    movementPattern: "Rhythmic low hops"
  },
  {
    slug: "shadow-rounds",
    name: "Shadow movement rounds",
    description: "Practise stance changes continuously at an easy technical pace.",
    instructions: ["Set a balanced grappling stance.", "Alternate small steps, level changes and resets.", "Restore posture whenever footwork becomes rushed."],
    bodyRegions: ["hips", "ankles", "knees", "full-body"],
    difficulty: "beginner",
    equipment: ["Clear floor"],
    dosage: "4 rounds of 90 seconds with 60 seconds rest",
    commonMistakes: ["Crossing your feet for speed."],
    safety: ["Use open space away from obstacles."],
    variations: {
      easier: "Use step-only rounds.",
      harder: "Add controlled pivots within the same time."
    },
    bjjRelevance: "Links aerobic work directly to BJJ movement quality.",
    movementPattern: "Grappling aerobic footwork"
  },
  {
    slug: "technical-stand-up-intervals",
    name: "Technical stand-up intervals",
    description: "Repeat familiar floor-to-standing transitions at a controlled pace.",
    instructions: ["Start from a stable seated position.", "Perform technical stand-ups, alternating sides.", "Use the rest interval to reset without rushing."],
    bodyRegions: ["full-body", "wrists", "hips"],
    difficulty: "intermediate",
    equipment: ["Mat"],
    dosage: "5 rounds of 30 seconds with 60 seconds rest",
    commonMistakes: ["Slapping the post hand down before controlling balance."],
    safety: ["Learn the drill in isolation before adding time pressure."],
    variations: {
      easier: "Use seated position changes only.",
      harder: "Increase the round to 40 seconds."
    },
    bjjRelevance: "Practises repeated floor-to-standing transitions with planned recovery.",
    movementPattern: "Floor-to-stand interval"
  },
  {
    slug: "step-up-intervals",
    name: "Low step-up intervals",
    description: "Alternate leading legs on a low step at a moderate pace.",
    instructions: ["Place the full lead foot on the step.", "Step up and down without jumping.", "Alternate the lead leg each interval."],
    bodyRegions: ["hips", "knees", "ankles"],
    difficulty: "beginner",
    equipment: ["Stable low step"],
    dosage: "5 rounds of 40 seconds with 40 seconds rest",
    commonMistakes: ["Pushing off the floor before the lead foot is stable."],
    safety: ["Use a low step and stop if balance degrades."],
    variations: {
      easier: "Use a lower step and longer rest.",
      harder: "Alternate the lead foot each repetition."
    },
    bjjRelevance: "Builds sustained leg drive while limiting landing impact.",
    movementPattern: "Low-impact step interval"
  },
  {
    slug: "cycling-cadence-builds",
    name: "Cycling cadence builds",
    description: "Use short cadence increases without chasing maximal output.",
    instructions: ["Start at an easy pace with light resistance.", "Increase pedal cadence until it feels brisk and controlled.", "Return to the easy baseline before the next round."],
    bodyRegions: ["hips", "knees", "ankles"],
    difficulty: "beginner",
    equipment: ["Stationary bicycle"],
    dosage: "5 rounds of 30 seconds brisk and 60 seconds easy",
    commonMistakes: ["Bouncing on the saddle as you spin faster."],
    safety: ["Reduce cadence if the hips rock or the knee becomes sore."],
    variations: {
      easier: "Use 15-second builds.",
      harder: "Add 10 seconds to each build."
    },
    bjjRelevance: "Practises smooth intensity changes similar to transitions between grappling exchanges.",
    movementPattern: "Cadence interval"
  },
  {
    slug: "walk-jog-intervals",
    name: "Walk-jog intervals",
    description: "Gradually accumulate jogging exposure with walking breaks.",
    instructions: ["Warm up with a brisk walk.", "Jog at a steady effort until the interval ends.", "Walk until your breathing settles."],
    bodyRegions: ["ankles", "knees", "full-body"],
    difficulty: "beginner",
    equipment: [],
    dosage: "8 rounds of 45 seconds jog and 75 seconds walk",
    commonMistakes: ["Using the jog as a sprint."],
    safety: ["Use a flat route and reduce impact if joint soreness rises."],
    variations: {
      easier: "Use 20 seconds of jogging.",
      harder: "Add one round at the same effort."
    },
    bjjRelevance: "Builds aerobic capacity without making every effort hard.",
    movementPattern: "Run-walk interval"
  },
  {
    slug: "tempo-row",
    name: "Tempo rowing blocks",
    description: "Practise a repeatable moderate-hard effort over several minutes.",
    instructions: ["Warm up until strokes feel coordinated.", "Row at an effort you could hold beyond the work interval.", "Ease off fully during recovery segments."],
    bodyRegions: ["back", "hips", "arms", "core"],
    difficulty: "intermediate",
    equipment: ["Rowing machine"],
    dosage: "3 rounds of 4 minutes with 2 minutes easy",
    commonMistakes: ["Using a race pace on the first block."],
    safety: ["Keep distance and pace secondary to controlled movement."],
    variations: {
      easier: "Use two short blocks.",
      harder: "Extend a block by one minute."
    },
    bjjRelevance: "Develops sustained effort across long BJJ rounds.",
    movementPattern: "Sustained rowing effort"
  },
  {
    slug: "grappling-circuit",
    name: "Grappling conditioning circuit",
    description: "Combine simple mat movements with scheduled recovery.",
    instructions: ["Alternate stance steps, bridges and seated hip moves in small blocks.", "Switch exercises while keeping posture organised.", "Walk or breathe easily in the rest interval."],
    bodyRegions: ["full-body", "hips", "shoulders"],
    difficulty: "intermediate",
    equipment: ["Mat", "Clear floor"],
    dosage: "4 rounds of 2 minutes with 1 minute rest",
    commonMistakes: ["Skipping clean transitions to increase the count."],
    safety: ["Use a mat and omit any component that causes joint pain."],
    variations: {
      easier: "Use step-only and seated movement blocks.",
      harder: "Add rounds while keeping effort steady."
    },
    bjjRelevance: "Integrates movement patterns used in rolling with pacing practice.",
    movementPattern: "Mixed grappling conditioning"
  },
  {
    slug: "easy-air-bike",
    name: "Easy air bike spin",
    description: "Use the air bike at a light steady pace with relaxed shoulders.",
    instructions: ["Adjust the saddle and practice a few easy pedal turns.", "Add light arm movement and keep breathing comfortable.", "Ease off slowly before stepping down."],
    bodyRegions: ["hips", "shoulders", "knees"],
    difficulty: "beginner",
    equipment: ["Air bike"],
    dosage: "10 to 20 minutes",
    commonMistakes: ["Treating the display as a target for maximum output."],
    safety: ["Keep feet secure and retain a safe cadence."],
    variations: {
      easier: "Use five easy minutes.",
      harder: "Extend the session by a few minutes."
    },
    bjjRelevance: "Provides low-load conditioning when mat volume is already high.",
    movementPattern: "Low-intensity full-body aerobic"
  }
])
