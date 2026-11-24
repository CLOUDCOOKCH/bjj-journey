import { defineExercises } from './types'

export const recoveryExercises = defineExercises('recovery', [
  {
    slug: "easy-recovery-walk",
    name: "Easy recovery walk",
    description: "Walk slowly enough to keep breathing and conversation easy.",
    instructions: ["Choose a flat familiar route.", "Walk at a pace that feels deliberately light.", "Shorten the route before adding effort."],
    bodyRegions: ["full-body", "ankles"],
    difficulty: "beginner",
    equipment: [],
    dosage: "5 to 20 minutes",
    commonMistakes: ["Treating pace as a score on a recovery day."],
    safety: ["Choose a safe route and stop if symptoms worsen."],
    variations: {
      easier: "Make a short indoor loop.",
      harder: "Increase time while retaining the same easy effort."
    },
    bjjRelevance: "Provides a low-intensity option between demanding mat days.",
    movementPattern: "Easy active recovery"
  },
  {
    slug: "relaxed-belly-breathing",
    name: "Relaxed belly breathing",
    description: "Practise unforced, comfortable breathing in a supported position.",
    instructions: ["Sit or lie with shoulders supported.", "Breathe softly and notice the lower ribs move.", "Let the exhale finish on its own before inhaling."],
    bodyRegions: ["core", "full-body"],
    difficulty: "beginner",
    equipment: ["Mat or chair"],
    dosage: "1 to 3 minutes",
    commonMistakes: ["Forcing very deep breaths or holding the breath."],
    safety: ["Return to ordinary breathing if you feel lightheaded."],
    variations: {
      easier: "Practise for 30 seconds while seated.",
      harder: "Extend the practice without deliberately slowing breaths."
    },
    bjjRelevance: "Gives athletes a quiet transition after a demanding class.",
    movementPattern: "Quiet breathing"
  },
  {
    slug: "comfortable-long-exhale",
    name: "Comfortable longer exhale",
    description: "Explore a slightly longer exhale during quiet breathing.",
    instructions: ["Sit or lie comfortably.", "Inhale normally and exhale gently for a little longer if comfortable.", "Return to your usual rhythm after several breaths."],
    bodyRegions: ["core", "full-body"],
    difficulty: "beginner",
    equipment: ["Mat or chair"],
    dosage: "1 to 2 minutes",
    commonMistakes: ["Forcing a count when short of breath."],
    safety: ["Skip the timing if it creates air hunger or dizziness."],
    variations: {
      easier: "Use your normal rhythm without timing.",
      harder: "Stay with the comfortable rhythm for several more breaths."
    },
    bjjRelevance: "Can help athletes wind down after training without extra effort.",
    movementPattern: "Relaxed breathing rhythm"
  },
  {
    slug: "supported-child-pose",
    name: "Supported resting kneel",
    description: "Find a comfortable supported position with the hips back.",
    instructions: ["Kneel on a mat with a cushion ready in front.", "Shift hips back and rest your chest or arms on the support.", "Rise slowly when finished."],
    bodyRegions: ["back", "hips", "shoulders", "knees"],
    difficulty: "beginner",
    equipment: ["Mat", "Cushion"],
    dosage: "20 to 40 seconds",
    commonMistakes: ["Sinking into an uncomfortable knee angle."],
    safety: ["Use a chair instead if kneeling bothers the knees."],
    variations: {
      easier: "Raise the support or sit upright.",
      harder: "Rest for an extra easy breath within a comfortable position."
    },
    bjjRelevance: "Offers a gentle change of posture between hard training days.",
    movementPattern: "Supported resting flexion"
  },
  {
    slug: "supine-knee-sways",
    name: "Supine knee sways",
    description: "Move the knees side to side while upper back stays supported.",
    instructions: ["Lie back with knees bent and feet flat.", "Let both knees travel a short distance to one side.", "Return slowly and repeat the other way."],
    bodyRegions: ["hips", "back"],
    difficulty: "beginner",
    equipment: ["Mat"],
    dosage: "6 repetitions each side",
    commonMistakes: ["Dropping both knees to the floor with momentum."],
    safety: ["Use a small range if the back feels sensitive."],
    variations: {
      easier: "Move only a few centimetres per side.",
      harder: "Pause for a relaxed breath at each side."
    },
    bjjRelevance: "Provides easy hip and lower-trunk movement after mat sessions.",
    movementPattern: "Gentle trunk rotation"
  },
  {
    slug: "recovery-easy-cycle",
    name: "Easy recovery spin",
    description: "Pedal at light resistance for a short active recovery session.",
    instructions: ["Adjust the saddle for a slight knee bend at the bottom.", "Pedal at a relaxed pace on light resistance.", "Ease off and step down slowly."],
    bodyRegions: ["hips", "knees", "ankles"],
    difficulty: "beginner",
    equipment: ["Stationary bicycle"],
    dosage: "8 to 15 minutes",
    commonMistakes: ["Adding resistance because the effort feels too easy."],
    safety: ["Reduce time if the movement increases soreness or irritates a knee."],
    variations: {
      easier: "Spin for five minutes.",
      harder: "Extend the time at the same easy effort."
    },
    bjjRelevance: "Adds gentle lower-body movement without another hard conditioning session.",
    movementPattern: "Low-load active recovery"
  },
  {
    slug: "gentle-calf-lengthen",
    name: "Gentle calf lengthening",
    description: "Use a comfortable split stance to stretch the calf lightly.",
    instructions: ["Set your palms on a wall and step one foot back.", "Keep the rear heel down until you feel a light stretch.", "Release by stepping toward the wall."],
    bodyRegions: ["ankles"],
    difficulty: "beginner",
    equipment: ["Wall"],
    dosage: "15 to 20 seconds each side",
    commonMistakes: ["Driving the rear knee hard into lockout."],
    safety: ["Avoid sharp Achilles or ankle sensations."],
    variations: {
      easier: "Shorten the stance.",
      harder: "Use a slightly longer hold with the same gentle tension."
    },
    bjjRelevance: "Offers a quiet change of position after long periods on the feet.",
    movementPattern: "Light static lower-leg stretch"
  },
  {
    slug: "supported-chest-rest",
    name: "Supported chest opening rest",
    description: "Let the upper body rest with a small amount of support under the back.",
    instructions: ["Place a folded towel across the upper back and lie down carefully.", "Rest the arms by your sides where the shoulders feel supported.", "Roll to one side before standing."],
    bodyRegions: ["thoracic-spine", "chest", "shoulders"],
    difficulty: "beginner",
    equipment: ["Mat", "Folded towel"],
    dosage: "30 to 60 seconds",
    commonMistakes: ["Using a thick roll that forces the neck backward."],
    safety: ["Use head support or remove the towel if the neck feels strained."],
    variations: {
      easier: "Lie flat with arms supported.",
      harder: "Move arms a little farther from the body if comfortable."
    },
    bjjRelevance: "Offers a relaxed change from the posture used in prolonged gripping.",
    movementPattern: "Supported low-load chest opening"
  },
  {
    slug: "seated-shoulder-release",
    name: "Seated shoulder release",
    description: "Explore gentle shoulder motion with the trunk supported.",
    instructions: ["Sit with feet grounded and elbows relaxed.", "Raise the shoulders lightly as you breathe in.", "Let them settle down as you exhale."],
    bodyRegions: ["shoulders", "neck"],
    difficulty: "beginner",
    equipment: ["Chair"],
    dosage: "6 slow repetitions",
    commonMistakes: ["Circling the neck to create a larger movement."],
    safety: ["Avoid adding external weight and stop on symptoms."],
    variations: {
      easier: "Lift only slightly.",
      harder: "Pause briefly at the relaxed bottom position."
    },
    bjjRelevance: "Gives the shoulders an easy movement option after long grip exchanges.",
    movementPattern: "Gentle shoulder elevation and release"
  },
  {
    slug: "side-lying-wind-down",
    name: "Side-lying wind-down",
    description: "Rest in a side-lying position with gentle support.",
    instructions: ["Lie on a comfortable side and support the head with a pillow.", "Stack bent knees or put padding between them.", "Breathe normally before rolling to change sides."],
    bodyRegions: ["thoracic-spine", "back", "hips"],
    difficulty: "beginner",
    equipment: ["Mat", "Pillow"],
    dosage: "1 to 2 minutes each side",
    commonMistakes: ["Trying to force both shoulders flat."],
    safety: ["Use an alternative position if the lower shoulder becomes uncomfortable."],
    variations: {
      easier: "Use extra padding between the knees.",
      harder: "Add a short easy upper-arm reach without rolling backward."
    },
    bjjRelevance: "Offers a low-effort rest option after a crowded training week.",
    movementPattern: "Supported relaxation"
  },
  {
    slug: "recovery-ankle-pumps",
    name: "Seated ankle pumps",
    description: "Move the ankles slowly with your thighs supported.",
    instructions: ["Sit with one heel light on the floor.", "Raise and lower the toes while keeping the knee still.", "Pause before changing feet."],
    bodyRegions: ["ankles"],
    difficulty: "beginner",
    equipment: ["Chair"],
    dosage: "10 to 15 pumps per side",
    commonMistakes: ["Swinging the entire leg to lift the toes."],
    safety: ["Use a shorter range if the ankle feels irritated."],
    variations: {
      easier: "Keep the heel fully grounded.",
      harder: "Combine with a short comfortable calf stretch."
    },
    bjjRelevance: "Offers gentle ankle movement on a day away from the mats.",
    movementPattern: "Unloaded ankle movement"
  }
])
