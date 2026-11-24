import { defineExercises } from './types'

export const strengthExercises = defineExercises('strength', [
  {
    slug: "back-squat",
    name: "Back squat",
    description: "Practise a loaded squat with the bar supported across your upper back.",
    instructions: ["Set the bar in a rack with safety arms.", "Brace, sit between your hips and keep your feet grounded.", "Drive through both feet to stand."],
    bodyRegions: ["hips", "glutes", "knees", "core"],
    difficulty: "intermediate",
    equipment: ["Barbell", "Rack"],
    dosage: "3 sets of 5 to 8",
    commonMistakes: ["Losing balance toward the toes."],
    safety: ["Use a rack with safeties and leave repetitions in reserve."],
    variations: {
      easier: "Use a goblet squat.",
      harder: "Use a brief pause with a lighter bar."
    },
    bjjRelevance: "Strengthens the legs and trunk for standing exchanges and passing.",
    movementPattern: "Bilateral knee-dominant squat",
    targetMuscles: ["Quadriceps", "Gluteus maximus", "Spinal erectors"],
    substitutions: ["goblet-squat", "front-squat"]
  },
  {
    slug: "front-squat",
    name: "Front squat",
    description: "Squat with the load supported by the front of the shoulders.",
    instructions: ["Set the bar on your shoulders and lift the elbows.", "Brace and sit straight down as far as you can maintain posture.", "Keep your elbows up as you stand."],
    bodyRegions: ["hips", "knees", "core", "thoracic-spine"],
    difficulty: "intermediate",
    equipment: ["Barbell", "Rack"],
    dosage: "3 sets of 5 to 8",
    commonMistakes: ["Supporting the entire load in the wrists."],
    safety: ["Use rack safeties and avoid wrist discomfort."],
    variations: {
      easier: "Use a goblet squat.",
      harder: "Add a controlled pause at moderate load."
    },
    bjjRelevance: "Challenges upright trunk position while changing levels.",
    movementPattern: "Bilateral front-loaded squat",
    targetMuscles: ["Quadriceps", "Gluteus maximus", "Upper back muscles"],
    substitutions: ["goblet-squat", "back-squat"]
  },
  {
    slug: "goblet-squat",
    name: "Goblet squat",
    description: "Learn the squat pattern with a centrally held weight.",
    instructions: ["Hold a dumbbell or kettlebell near your sternum.", "Lower between your hips with feet grounded.", "Stand while keeping the weight close."],
    bodyRegions: ["hips", "glutes", "knees", "core"],
    difficulty: "beginner",
    equipment: ["Dumbbell or kettlebell"],
    dosage: "2 to 3 sets of 8 to 12",
    commonMistakes: ["Holding the weight at arm’s length."],
    safety: ["Use a manageable load and stop before painful depth."],
    variations: {
      easier: "Squat to a stable box without a weight.",
      harder: "Pause briefly at the bottom."
    },
    bjjRelevance: "Develops stronger low passing stances.",
    movementPattern: "Bilateral front-loaded squat",
    targetMuscles: ["Quadriceps", "Gluteus maximus", "Abdominals"],
    substitutions: ["bodyweight-squat", "front-squat"]
  },
  {
    slug: "romanian-deadlift",
    name: "Romanian deadlift",
    description: "Develop the posterior chain through a slow loaded hinge.",
    instructions: ["Hold the weight against your thighs with soft knees.", "Send your hips back while the weight tracks close.", "Stand when you reach moderate hamstring tension."],
    bodyRegions: ["hamstrings", "glutes", "back"],
    difficulty: "intermediate",
    equipment: ["Barbell or dumbbells"],
    dosage: "3 sets of 6 to 10",
    commonMistakes: ["Reaching toward the floor by rounding the back."],
    safety: ["Use only the range you can control."],
    variations: {
      easier: "Practise with a light kettlebell.",
      harder: "Use a three-second descent."
    },
    bjjRelevance: "Strengthens hip extension and posture used in clinch exchanges.",
    movementPattern: "Bilateral hip hinge",
    targetMuscles: ["Hamstrings", "Gluteus maximus", "Spinal erectors"],
    substitutions: ["kettlebell-deadlift", "single-leg-rdl"]
  },
  {
    slug: "trap-bar-deadlift",
    name: "Trap-bar deadlift",
    description: "Build standing strength with the load centred around the body.",
    instructions: ["Stand inside the bar and hold both handles evenly.", "Brace and push the floor away.", "Lower the bar under control and reset each repetition."],
    bodyRegions: ["glutes", "hamstrings", "knees", "back", "forearms"],
    difficulty: "intermediate",
    equipment: ["Trap bar"],
    dosage: "3 sets of 4 to 6",
    commonMistakes: ["Jerking the bar off the floor."],
    safety: ["Start with high handles and a modest load."],
    variations: {
      easier: "Use a kettlebell deadlift.",
      harder: "Use low handles within a controlled range."
    },
    bjjRelevance: "Develops full-body force for standing grappling.",
    movementPattern: "Ground-to-standing hinge",
    targetMuscles: ["Gluteus maximus", "Quadriceps", "Hamstrings", "Spinal erectors"],
    substitutions: ["kettlebell-deadlift", "romanian-deadlift"]
  },
  {
    slug: "bulgarian-split-squat",
    name: "Bulgarian split squat",
    description: "Load the front leg using an elevated rear foot.",
    instructions: ["Set the rear foot on a low bench.", "Lower the rear knee while the front foot stays flat.", "Stand by pressing through the front foot."],
    bodyRegions: ["hips", "glutes", "knees"],
    difficulty: "intermediate",
    equipment: ["Stable bench"],
    dosage: "2 to 3 sets of 6 to 10 each side",
    commonMistakes: ["Pushing most of the effort through the back leg."],
    safety: ["Start with bodyweight and secure the support."],
    variations: {
      easier: "Use a floor-based split squat.",
      harder: "Hold light dumbbells by your sides."
    },
    bjjRelevance: "Supports uneven stances and single-leg base.",
    movementPattern: "Unilateral knee-dominant squat",
    targetMuscles: ["Quadriceps", "Gluteus maximus", "Gluteus medius"],
    substitutions: ["reverse-lunge", "step-up"]
  },
  {
    slug: "pull-up",
    name: "Pull-up",
    description: "Build upper-back and grip strength with an overhand pull.",
    instructions: ["Grab a securely mounted bar just outside shoulder width.", "Pull your elbows down until your chin reaches bar height.", "Lower with control."],
    bodyRegions: ["back", "shoulders", "arms", "forearms"],
    difficulty: "intermediate",
    equipment: ["Pull-up bar"],
    dosage: "3 sets of 3 to 8",
    commonMistakes: ["Kicking or throwing the head over the bar."],
    safety: ["Use assistance if you cannot lower smoothly."],
    variations: {
      easier: "Use a foot-assisted or band-assisted pull-up.",
      harder: "Add a slow controlled descent."
    },
    bjjRelevance: "Builds pulling capacity for grip exchanges.",
    movementPattern: "Vertical pull",
    targetMuscles: ["Latissimus dorsi", "Biceps", "Forearm flexors"],
    substitutions: ["band-assisted-pull-up", "chin-up"]
  },
  {
    slug: "chin-up",
    name: "Chin-up",
    description: "Use an underhand grip to train vertical pulling.",
    instructions: ["Grip the bar underhand at shoulder width.", "Draw the chest up as the elbows bend.", "Lower without bouncing at the bottom."],
    bodyRegions: ["back", "arms", "forearms"],
    difficulty: "intermediate",
    equipment: ["Pull-up bar"],
    dosage: "3 sets of 3 to 8",
    commonMistakes: ["Swinging or bending the wrists sharply."],
    safety: ["Choose a neutral-grip option if your elbows object."],
    variations: {
      easier: "Use foot assistance.",
      harder: "Pause at the top with no swing."
    },
    bjjRelevance: "Supports grip and upper-body pulling strength.",
    movementPattern: "Vertical pull",
    targetMuscles: ["Biceps", "Latissimus dorsi", "Forearm flexors"],
    substitutions: ["band-assisted-pull-up", "pull-up"]
  },
  {
    slug: "gi-pull-up",
    name: "Gi pull-up",
    description: "Combine a cloth grip with a controlled vertical pull.",
    instructions: ["Drape an intact gi securely over a bar.", "Grip both sides evenly and pull up under control.", "Lower and step down before grip failure."],
    bodyRegions: ["forearms", "back", "arms"],
    difficulty: "advanced",
    equipment: ["Pull-up bar", "Gi jacket"],
    dosage: "2 to 3 sets of 3 to 6",
    commonMistakes: ["Starting a repetition with a visibly slipping grip."],
    safety: ["Confirm the cloth and anchor are secure and keep a stable step nearby."],
    variations: {
      easier: "Use a foot-assisted gi hold.",
      harder: "Increase rest and add another quality set."
    },
    bjjRelevance: "Develops sustained fabric grip for gi rounds.",
    movementPattern: "Grip-limited vertical pull",
    targetMuscles: ["Finger flexors", "Latissimus dorsi", "Biceps"],
    substitutions: ["towel-pull-up", "towel-hold"]
  },
  {
    slug: "towel-pull-up",
    name: "Towel pull-up",
    description: "Use a towel to challenge full-hand gripping in pull-ups.",
    instructions: ["Loop a sturdy towel over a securely mounted bar.", "Grip both ends and pull your elbows toward your ribs.", "Lower slowly and step down."],
    bodyRegions: ["forearms", "back", "arms"],
    difficulty: "advanced",
    equipment: ["Pull-up bar", "Towel"],
    dosage: "2 to 3 sets of 3 to 5",
    commonMistakes: ["Wrapping the towel tightly around your wrists."],
    safety: ["Inspect the towel and avoid taking sets to grip failure."],
    variations: {
      easier: "Use a feet-supported towel hold.",
      harder: "Pause at the top of a controlled repetition."
    },
    bjjRelevance: "Trains grip endurance for hard hand-fighting rounds.",
    movementPattern: "Grip-limited vertical pull",
    targetMuscles: ["Finger flexors", "Latissimus dorsi", "Biceps"],
    substitutions: ["gi-pull-up", "towel-hold"]
  },
  {
    slug: "dumbbell-row",
    name: "One-arm dumbbell row",
    description: "Build pulling strength without rotating the trunk.",
    instructions: ["Support one hand on a bench and hinge forward.", "Pull the dumbbell toward your hip.", "Lower slowly without turning your ribs."],
    bodyRegions: ["back", "arms", "forearms", "core"],
    difficulty: "beginner",
    equipment: ["Dumbbell", "Stable bench"],
    dosage: "3 sets of 8 to 12 each side",
    commonMistakes: ["Yanking the torso upward to lift the weight."],
    safety: ["Check the bench is stable before loading."],
    variations: {
      easier: "Use less weight and brace with both feet.",
      harder: "Hold for one second near the ribs."
    },
    bjjRelevance: "Supports pulling while maintaining a stable base.",
    movementPattern: "Unilateral horizontal pull",
    targetMuscles: ["Latissimus dorsi", "Middle trapezius", "Biceps"],
    substitutions: ["kettlebell-row", "band-row", "inverted-row"]
  },
  {
    slug: "bench-press",
    name: "Barbell bench press",
    description: "Train pressing strength with the torso supported.",
    instructions: ["Set rack safeties and plant both feet.", "Lower the bar smoothly toward the lower chest.", "Press up while keeping wrists above elbows."],
    bodyRegions: ["chest", "shoulders", "arms"],
    difficulty: "intermediate",
    equipment: ["Barbell", "Bench", "Rack"],
    dosage: "3 sets of 5 to 8",
    commonMistakes: ["Bouncing the bar from the chest."],
    safety: ["Use safeties or a spotter and avoid maximal efforts alone."],
    variations: {
      easier: "Use dumbbell floor presses.",
      harder: "Pause lightly above the chest."
    },
    bjjRelevance: "Develops pushing strength for frames and distance management.",
    movementPattern: "Bilateral horizontal push",
    targetMuscles: ["Pectoralis major", "Triceps", "Anterior deltoid"],
    substitutions: ["dumbbell-floor-press", "push-up"]
  },
  {
    slug: "push-up",
    name: "Push-up",
    description: "Press away from the ground while keeping the body organised.",
    instructions: ["Set your hands slightly outside shoulder width.", "Lower shoulders and hips together.", "Press the floor away and finish tall through the shoulders."],
    bodyRegions: ["chest", "shoulders", "arms", "core"],
    difficulty: "beginner",
    equipment: [],
    dosage: "2 to 3 sets of 6 to 12",
    commonMistakes: ["Letting the hips sag before the chest lowers."],
    safety: ["Use an incline if full range or wrists are uncomfortable."],
    variations: {
      easier: "Do incline push-ups on a stable surface.",
      harder: "Pause near the bottom without relaxing."
    },
    bjjRelevance: "Builds pressing and trunk strength for framing.",
    movementPattern: "Bilateral horizontal push",
    targetMuscles: ["Pectoralis major", "Triceps", "Anterior deltoid", "Abdominals"],
    substitutions: ["dumbbell-floor-press", "bench-press"]
  },
  {
    slug: "landmine-press",
    name: "Half-kneeling landmine press",
    description: "Press on an upward diagonal with a supported lower-body stance.",
    instructions: ["Secure the bar in a landmine and kneel with one foot ahead.", "Brace your torso and press the bar up and forward.", "Lower slowly without twisting."],
    bodyRegions: ["shoulders", "chest", "arms", "core"],
    difficulty: "intermediate",
    equipment: ["Barbell", "Landmine anchor", "Mat"],
    dosage: "3 sets of 6 to 10 each side",
    commonMistakes: ["Leaning backward as the bar rises."],
    safety: ["Confirm the anchor is secure and pad the rear knee."],
    variations: {
      easier: "Use a light resistance-band press.",
      harder: "Hold the finish without rotating."
    },
    bjjRelevance: "Strengthens upward framing while controlling torso position.",
    movementPattern: "Angled unilateral push",
    targetMuscles: ["Anterior deltoid", "Triceps", "Upper pectoralis major"],
    substitutions: ["standing-dumbbell-press", "dumbbell-floor-press"]
  },
  {
    slug: "kettlebell-swing",
    name: "Two-hand kettlebell swing",
    description: "Produce quick hip extension with the arms guiding a kettlebell.",
    instructions: ["Start with the bell ahead and hike it between your thighs.", "Stand sharply by driving your hips forward.", "Let the bell fall back into a controlled hinge."],
    bodyRegions: ["glutes", "hamstrings", "core", "forearms"],
    difficulty: "intermediate",
    equipment: ["Kettlebell"],
    dosage: "3 sets of 8 to 12",
    commonMistakes: ["Lifting the bell with the shoulders or squatting beneath it."],
    safety: ["Practise a deadlift first and clear the area around you."],
    variations: {
      easier: "Use kettlebell deadlifts.",
      harder: "Add sets with full rest before adding load."
    },
    bjjRelevance: "Builds fast hip extension while limiting unnecessary shoulder effort.",
    movementPattern: "Explosive hip hinge",
    targetMuscles: ["Gluteus maximus", "Hamstrings", "Spinal erectors"],
    substitutions: ["kettlebell-deadlift", "romanian-deadlift"]
  },
  {
    slug: "farmers-carry",
    name: "Farmer’s carry",
    description: "Walk with equal loads while staying tall.",
    instructions: ["Lift two weights with a controlled hinge.", "Walk with steady short steps and level shoulders.", "Set the weights down under control."],
    bodyRegions: ["forearms", "core", "back", "shoulders"],
    difficulty: "beginner",
    equipment: ["Two dumbbells or kettlebells"],
    dosage: "3 carries of 20 to 40 metres",
    commonMistakes: ["Rushing or leaning forward as grip tires."],
    safety: ["Use a clear path and stop while the grip is secure."],
    variations: {
      easier: "Use shorter carries with light loads.",
      harder: "Extend distance before raising load."
    },
    bjjRelevance: "Develops whole-body and grip endurance for repeated exchanges.",
    movementPattern: "Bilateral loaded carry",
    targetMuscles: ["Finger flexors", "Trapezius", "Obliques"],
    substitutions: ["suitcase-carry", "towel-hold"]
  },
  {
    slug: "suitcase-carry",
    name: "Suitcase carry",
    description: "Resist leaning while walking with one weight.",
    instructions: ["Lift one weight and stand tall.", "Walk without tilting to either side.", "Set it down and switch hands."],
    bodyRegions: ["core", "forearms", "back"],
    difficulty: "beginner",
    equipment: ["Dumbbell or kettlebell"],
    dosage: "3 carries of 20 metres each side",
    commonMistakes: ["Counterbalancing by leaning away from the load."],
    safety: ["Use open space and a weight you can put down quietly."],
    variations: {
      easier: "Use a short distance or a static hold.",
      harder: "Increase distance with the same level posture."
    },
    bjjRelevance: "Challenges trunk stability when grappling forces are uneven.",
    movementPattern: "Unilateral anti-lateral-flexion carry",
    targetMuscles: ["Obliques", "Quadratus lumborum", "Finger flexors"],
    substitutions: ["farmers-carry", "side-plank"]
  },
  {
    slug: "dead-hang",
    name: "Dead hang",
    description: "Practise a supported or full hang to measure grip endurance.",
    instructions: ["Step to a safely mounted bar and grip both hands evenly.", "Hang only within a comfortable shoulder position.", "Step down before the grip slips."],
    bodyRegions: ["forearms", "shoulders"],
    difficulty: "intermediate",
    equipment: ["Pull-up bar"],
    dosage: "3 holds of 10 to 25 seconds",
    commonMistakes: ["Dropping from a height when the hands tire."],
    safety: ["Use a low bar or a step and avoid hangs with shoulder instability."],
    variations: {
      easier: "Keep feet partly supported.",
      harder: "Extend the hold in small increments."
    },
    bjjRelevance: "Builds grip endurance for prolonged exchanges.",
    movementPattern: "Isometric overhead grip",
    targetMuscles: ["Finger flexors", "Forearm flexors"],
    substitutions: ["towel-hold", "plate-pinch"]
  },
  {
    slug: "pallof-press",
    name: "Pallof press",
    description: "Resist sideways pull as the hands move away from the chest.",
    instructions: ["Secure a band at sternum height and stand sideways to it.", "Press both hands forward without turning your ribs.", "Bring them back slowly."],
    bodyRegions: ["core", "hips", "shoulders"],
    difficulty: "beginner",
    equipment: ["Resistance band", "Stable anchor"],
    dosage: "2 to 3 sets of 8 each side",
    commonMistakes: ["Letting the band turn the pelvis."],
    safety: ["Inspect the band and verify the anchor."],
    variations: {
      easier: "Stand closer to the anchor.",
      harder: "Pause with arms extended."
    },
    bjjRelevance: "Builds trunk control against rotational pull from a partner.",
    movementPattern: "Anti-rotation press",
    targetMuscles: ["Internal and external obliques", "Transversus abdominis"],
    substitutions: ["band-anti-rotation-hold", "bird-dog"]
  },
  {
    slug: "copenhagen-plank",
    name: "Short-lever Copenhagen plank",
    description: "Build inner-thigh and lateral trunk strength with a short lever.",
    instructions: ["Lie on your side with the top knee supported on a padded bench.", "Lift your hips while pressing the top leg down gently.", "Lower slowly when alignment fades."],
    bodyRegions: ["adductors", "core", "shoulders"],
    difficulty: "intermediate",
    equipment: ["Stable bench", "Mat"],
    dosage: "2 holds of 10 to 20 seconds each side",
    commonMistakes: ["Putting the bench edge against the side of the knee."],
    safety: ["Pad the bench and use a conventional side plank if the groin hurts."],
    variations: {
      easier: "Keep the bottom knee on the floor.",
      harder: "Increase hold length before using a longer lever."
    },
    bjjRelevance: "Strengthens inner-thigh support for guard and base changes.",
    movementPattern: "Isometric adduction and lateral stability",
    targetMuscles: ["Hip adductors", "Obliques"],
    substitutions: ["side-plank", "adductor-rockbacks"]
  },
  {
    slug: "side-plank",
    name: "Side plank",
    description: "Hold a stable side position while breathing steadily.",
    instructions: ["Set the lower elbow under your shoulder.", "Lift your hips until your trunk is in line.", "Lower when you can no longer maintain position."],
    bodyRegions: ["core", "shoulders", "glutes"],
    difficulty: "beginner",
    equipment: ["Mat"],
    dosage: "2 to 3 holds of 15 to 30 seconds each side",
    commonMistakes: ["Hanging into the lower shoulder."],
    safety: ["If the shoulder is sore, shorten the lever or switch exercises."],
    variations: {
      easier: "Bend both knees.",
      harder: "Stack the feet to narrow the base."
    },
    bjjRelevance: "Supports lateral trunk control for frames and escapes.",
    movementPattern: "Isometric lateral trunk stability",
    targetMuscles: ["Obliques", "Gluteus medius", "Quadratus lumborum"],
    substitutions: ["front-plank", "band-anti-rotation-hold"]
  },
  {
    slug: "dead-bug",
    name: "Dead bug",
    description: "Move opposite limbs while keeping rib and pelvis position steady.",
    instructions: ["Lie back with hips and knees bent and arms reaching up.", "Lower opposite arm and leg slowly.", "Exhale and return without arching."],
    bodyRegions: ["core", "hip-flexors"],
    difficulty: "beginner",
    equipment: ["Mat"],
    dosage: "2 sets of 6 to 8 each side",
    commonMistakes: ["Lowering beyond the range you can control."],
    safety: ["Keep the head supported and reduce the leg reach as needed."],
    variations: {
      easier: "Tap one heel at a time.",
      harder: "Straighten the reaching leg farther."
    },
    bjjRelevance: "Builds trunk control as legs and arms move independently in guard.",
    movementPattern: "Anti-extension control",
    targetMuscles: ["Transversus abdominis", "Rectus abdominis", "Obliques"],
    substitutions: ["bird-dog", "front-plank"]
  },
  {
    slug: "bird-dog",
    name: "Bird dog",
    description: "Train stability as opposite hand and leg reach away.",
    instructions: ["Start on hands and knees.", "Reach one arm and opposite leg without tipping the pelvis.", "Set both down softly and switch."],
    bodyRegions: ["core", "glutes", "back", "shoulders"],
    difficulty: "beginner",
    equipment: ["Mat"],
    dosage: "2 sets of 6 to 8 each side",
    commonMistakes: ["Lifting the leg high enough to arch the lower back."],
    safety: ["Pad knees and limit reach to a stable range."],
    variations: {
      easier: "Move only one limb at a time.",
      harder: "Pause for two easy breaths."
    },
    bjjRelevance: "Helps resist rotation while moving from a four-point base.",
    movementPattern: "Anti-rotation extension",
    targetMuscles: ["Gluteus maximus", "Multifidus", "Abdominals"],
    substitutions: ["dead-bug", "band-anti-rotation-hold"]
  },
  {
    slug: "turkish-get-up",
    name: "Turkish get-up",
    description: "Connect floor-to-standing positions with a stable overhead arm.",
    instructions: ["Practise unloaded: roll to an elbow, support on the hand, then sweep the leg to kneel.", "From kneeling stand while tracking the raised hand.", "Reverse through the same positions."],
    bodyRegions: ["shoulders", "hips", "core", "full-body"],
    difficulty: "advanced",
    equipment: ["Kettlebell", "Mat"],
    dosage: "2 sets of 1 to 3 each side",
    commonMistakes: ["Adding load before owning the transitions."],
    safety: ["Learn unloaded and stop if overhead support is unstable."],
    variations: {
      easier: "Practise the unloaded roll to elbow only.",
      harder: "Use a light kettlebell after every step is repeatable."
    },
    bjjRelevance: "Develops coordinated floor-to-standing strength and shoulder stability.",
    movementPattern: "Unilateral loaded floor-to-stand",
    targetMuscles: ["Deltoids", "Rotator cuff", "Abdominals", "Gluteus maximus"],
    substitutions: ["landmine-press", "side-plank"]
  },
  {
    slug: "medicine-ball-chest-pass",
    name: "Medicine-ball chest pass",
    description: "Train intent to press quickly against a safe rebound surface.",
    instructions: ["Face an appropriate wall with the ball at your chest.", "Press the ball forward explosively and let it rebound.", "Reset fully between repetitions."],
    bodyRegions: ["chest", "arms", "core"],
    difficulty: "intermediate",
    equipment: ["Medicine ball", "Rebound-rated wall"],
    dosage: "3 sets of 4 to 6",
    commonMistakes: ["Trying to catch without space or control."],
    safety: ["Use a rebound-rated wall and clear the rebound area."],
    variations: {
      easier: "Use a lighter ball.",
      harder: "Add a step before each pass."
    },
    bjjRelevance: "Develops quick pressing force for framing changes.",
    movementPattern: "Explosive horizontal push",
    targetMuscles: ["Pectoralis major", "Triceps", "Anterior deltoid"],
    substitutions: ["push-up", "dumbbell-floor-press"]
  },
  {
    slug: "medicine-ball-rotational-throw",
    name: "Medicine-ball rotational throw",
    description: "Transfer force from the hips through the trunk in a controlled throw.",
    instructions: ["Stand side-on to an appropriate wall.", "Turn the hips and release the ball at mid-torso height.", "Reset your stance before every throw."],
    bodyRegions: ["core", "hips", "shoulders"],
    difficulty: "intermediate",
    equipment: ["Medicine ball", "Rebound-rated wall"],
    dosage: "3 sets of 4 each side",
    commonMistakes: ["Twisting over a planted knee."],
    safety: ["Allow the feet to pivot and clear the rebound area."],
    variations: {
      easier: "Use a lighter ball and smaller turn.",
      harder: "Step into each throw without speeding the reset."
    },
    bjjRelevance: "Builds coordinated rotational force for standing movement.",
    movementPattern: "Explosive rotation",
    targetMuscles: ["Internal and external obliques", "Gluteus maximus", "Pectoralis major"],
    substitutions: ["standing-band-chop", "pallof-press"]
  },
  {
    slug: "band-row",
    name: "Standing resistance-band row",
    description: "Train rowing with portable resistance.",
    instructions: ["Anchor the band around chest height.", "Step back and draw both elbows toward your ribs.", "Return slowly while keeping shoulders relaxed."],
    bodyRegions: ["back", "shoulders", "arms"],
    difficulty: "beginner",
    equipment: ["Resistance band", "Stable anchor"],
    dosage: "2 to 3 sets of 10 to 15",
    commonMistakes: ["Leaning backward to increase range."],
    safety: ["Inspect the band and make sure the anchor cannot shift."],
    variations: {
      easier: "Stand closer to the anchor.",
      harder: "Pause at the back of the pull."
    },
    bjjRelevance: "Builds repeatable upper-back pulling for grip exchanges.",
    movementPattern: "Bilateral horizontal pull",
    targetMuscles: ["Latissimus dorsi", "Middle trapezius", "Biceps"],
    substitutions: ["dumbbell-row", "inverted-row"]
  },
  {
    slug: "band-external-rotation",
    name: "Band shoulder external rotation",
    description: "Practise shoulder rotation under light resistance.",
    instructions: ["Anchor a light band near elbow height.", "Keep one elbow by your ribs and rotate the forearm outward.", "Return without moving the upper arm."],
    bodyRegions: ["shoulders"],
    difficulty: "beginner",
    equipment: ["Resistance band", "Stable anchor"],
    dosage: "2 sets of 10 each side",
    commonMistakes: ["Turning the torso to stretch the band farther."],
    safety: ["Stay within a comfortable shoulder range."],
    variations: {
      easier: "Use very light resistance.",
      harder: "Pause at the end of each controlled repetition."
    },
    bjjRelevance: "Supports shoulder control during posting and framing.",
    movementPattern: "Shoulder external rotation",
    targetMuscles: ["Infraspinatus", "Teres minor"],
    substitutions: ["shoulder-wall-clock", "shoulder-cars"]
  },
  {
    slug: "bodyweight-squat",
    name: "Bodyweight squat",
    description: "Build a repeatable squat pattern without external load.",
    instructions: ["Set feet where you can keep heels planted.", "Sit down between your hips with knees tracking your toes.", "Stand without shifting to one leg."],
    bodyRegions: ["hips", "knees", "glutes"],
    difficulty: "beginner",
    equipment: [],
    dosage: "2 to 3 sets of 8 to 15",
    commonMistakes: ["Collapsing the knees toward each other."],
    safety: ["Use a tolerable depth and hold a rail for balance."],
    variations: {
      easier: "Squat to a stable chair.",
      harder: "Use a slow three-second descent."
    },
    bjjRelevance: "Builds leg endurance for low movement on the mats.",
    movementPattern: "Bilateral knee-dominant squat",
    targetMuscles: ["Quadriceps", "Gluteus maximus"],
    substitutions: ["goblet-squat", "reverse-lunge"]
  },
  {
    slug: "reverse-lunge",
    name: "Reverse lunge",
    description: "Step backward and return to a balanced stance.",
    instructions: ["Stand tall and take one step back.", "Lower both knees within a controlled range.", "Push through the front foot to stand."],
    bodyRegions: ["hips", "knees", "glutes"],
    difficulty: "beginner",
    equipment: [],
    dosage: "3 sets of 6 to 10 each side",
    commonMistakes: ["Stepping onto a narrow line and losing balance."],
    safety: ["Use support if balance limits control."],
    variations: {
      easier: "Use a stationary split stance.",
      harder: "Hold light dumbbells."
    },
    bjjRelevance: "Rehearses controlled stance changes under load.",
    movementPattern: "Unilateral knee-dominant lunge",
    targetMuscles: ["Quadriceps", "Gluteus maximus", "Gluteus medius"],
    substitutions: ["step-up", "bulgarian-split-squat"]
  },
  {
    slug: "step-up",
    name: "Controlled step-up",
    description: "Build single-leg drive from a stable platform.",
    instructions: ["Set one whole foot on a low stable step.", "Stand up using the top leg with minimal push from the floor.", "Step down slowly."],
    bodyRegions: ["glutes", "knees", "hips"],
    difficulty: "beginner",
    equipment: ["Step or low box"],
    dosage: "2 to 3 sets of 6 to 10 each side",
    commonMistakes: ["Launching upward from the trailing foot."],
    safety: ["Use a low step and avoid unstable furniture."],
    variations: {
      easier: "Choose a lower step or light hand support.",
      harder: "Hold light weights by your sides."
    },
    bjjRelevance: "Improves unilateral drive for standing transitions.",
    movementPattern: "Unilateral knee-dominant step",
    targetMuscles: ["Quadriceps", "Gluteus maximus", "Gluteus medius"],
    substitutions: ["reverse-lunge", "bodyweight-squat"]
  },
  {
    slug: "single-leg-rdl",
    name: "Single-leg Romanian deadlift",
    description: "Develop hinge strength and single-leg balance.",
    instructions: ["Stand on one leg with a soft knee.", "Reach the free leg back as the torso hinges forward.", "Return while keeping hips level."],
    bodyRegions: ["hamstrings", "glutes", "ankles", "core"],
    difficulty: "intermediate",
    equipment: [],
    dosage: "2 to 3 sets of 6 to 10 each side",
    commonMistakes: ["Twisting the pelvis open."],
    safety: ["Use wall support until you can balance reliably."],
    variations: {
      easier: "Keep rear toes lightly down.",
      harder: "Add a light weight in the opposite hand."
    },
    bjjRelevance: "Builds single-leg stability for uneven grappling stances.",
    movementPattern: "Unilateral hip hinge",
    targetMuscles: ["Hamstrings", "Gluteus maximus", "Gluteus medius"],
    substitutions: ["romanian-deadlift", "kettlebell-deadlift"]
  },
  {
    slug: "glute-bridge",
    name: "Glute bridge",
    description: "Practise hip extension with the upper back supported.",
    instructions: ["Lie back with both feet down and knees bent.", "Squeeze your glutes to lift the pelvis.", "Lower slowly without shifting your feet."],
    bodyRegions: ["glutes", "hamstrings", "core"],
    difficulty: "beginner",
    equipment: ["Mat"],
    dosage: "3 sets of 8 to 12",
    commonMistakes: ["Arching to lift higher."],
    safety: ["Keep your neck relaxed and avoid pushing from the head."],
    variations: {
      easier: "Lift through a smaller range.",
      harder: "Pause for two seconds at the top."
    },
    bjjRelevance: "Strengthens hip extension used in bridges and escapes.",
    movementPattern: "Bilateral hip extension",
    targetMuscles: ["Gluteus maximus", "Hamstrings"],
    substitutions: ["hip-thrust", "glute-march"]
  },
  {
    slug: "hip-thrust",
    name: "Hip thrust",
    description: "Train hip extension with shoulders on a stable support.",
    instructions: ["Set your upper back against a secured bench.", "Drive through your feet to raise your hips.", "Lower with the chin still and ribs down."],
    bodyRegions: ["glutes", "hamstrings", "core"],
    difficulty: "intermediate",
    equipment: ["Stable bench", "Pad"],
    dosage: "3 sets of 8 to 12",
    commonMistakes: ["Finishing through a lower-back arch."],
    safety: ["Stabilise the bench and use padding if you add load."],
    variations: {
      easier: "Use a floor bridge.",
      harder: "Add a modest padded load."
    },
    bjjRelevance: "Builds strong hip extension without requiring a standing stance.",
    movementPattern: "Loaded hip extension",
    targetMuscles: ["Gluteus maximus", "Hamstrings"],
    substitutions: ["glute-bridge", "romanian-deadlift"]
  },
  {
    slug: "hamstring-slider-curl",
    name: "Hamstring slider curl",
    description: "Load the hamstrings while sliding the feet on the floor.",
    instructions: ["Lie back with heels on sliders and lift your hips slightly.", "Slide the heels away under control.", "Pull them back without dropping your pelvis."],
    bodyRegions: ["hamstrings", "glutes", "core"],
    difficulty: "intermediate",
    equipment: ["Sliders", "Smooth floor"],
    dosage: "2 to 3 sets of 6 to 10",
    commonMistakes: ["Rushing the outward phase."],
    safety: ["Use a clear level floor and stop if the hamstring cramps."],
    variations: {
      easier: "Lower hips to reset between reps.",
      harder: "Increase the reach of each outward glide."
    },
    bjjRelevance: "Develops posterior-chain capacity when keeping legs active under pressure.",
    movementPattern: "Knee flexion and hip stability",
    targetMuscles: ["Hamstrings", "Gluteus maximus"],
    substitutions: ["glute-bridge", "romanian-deadlift"]
  },
  {
    slug: "calf-raise",
    name: "Standing calf raise",
    description: "Build calf strength and controlled ankle motion.",
    instructions: ["Stand near a wall with both feet flat.", "Rise onto the balls of your feet.", "Lower your heels slowly, keeping pressure even."],
    bodyRegions: ["ankles", "knees"],
    difficulty: "beginner",
    equipment: ["Wall"],
    dosage: "2 to 3 sets of 10 to 15",
    commonMistakes: ["Rocking the ankles outward."],
    safety: ["Use floor level first if the Achilles feels sensitive."],
    variations: {
      easier: "Use both hands for support.",
      harder: "Perform one side at a time."
    },
    bjjRelevance: "Supports foot drive and balance while changing stance.",
    movementPattern: "Ankle plantar flexion",
    targetMuscles: ["Gastrocnemius", "Soleus"],
    substitutions: ["step-up"]
  },
  {
    slug: "tibialis-raise",
    name: "Wall-supported tibialis raise",
    description: "Strengthen the front of the lower legs.",
    instructions: ["Lean lightly on a wall with heels slightly forward.", "Lift both sets of toes without lifting heels.", "Lower gently."],
    bodyRegions: ["ankles"],
    difficulty: "beginner",
    equipment: ["Wall"],
    dosage: "2 to 3 sets of 10 to 15",
    commonMistakes: ["Bending the knees to create movement."],
    safety: ["Start near the wall to control loading."],
    variations: {
      easier: "Move your feet closer to the wall.",
      harder: "Move the heels farther forward."
    },
    bjjRelevance: "Helps control foot position during repeated level changes.",
    movementPattern: "Active ankle dorsiflexion",
    targetMuscles: ["Tibialis anterior"],
    substitutions: ["recovery-ankle-pumps"]
  },
  {
    slug: "dumbbell-floor-press",
    name: "Dumbbell floor press",
    description: "Practise pressing with the floor limiting shoulder extension.",
    instructions: ["Lie on the floor with knees bent and weights above your chest.", "Lower until the upper arms touch down softly.", "Press without bouncing."],
    bodyRegions: ["chest", "shoulders", "arms"],
    difficulty: "beginner",
    equipment: ["Two dumbbells", "Mat"],
    dosage: "3 sets of 8 to 12",
    commonMistakes: ["Dropping elbows hard into the floor."],
    safety: ["Use loads you can safely position alone."],
    variations: {
      easier: "Use lighter dumbbells or incline push-ups.",
      harder: "Pause with the triceps lightly grounded."
    },
    bjjRelevance: "Builds pressing strength relevant to creating space from bottom.",
    movementPattern: "Horizontal push with floor stop",
    targetMuscles: ["Pectoralis major", "Triceps", "Anterior deltoid"],
    substitutions: ["push-up", "bench-press"]
  },
  {
    slug: "standing-dumbbell-press",
    name: "Standing dumbbell press",
    description: "Press over the head while keeping the trunk stable.",
    instructions: ["Set the weights at shoulder height and brace.", "Press upward within a comfortable reach.", "Lower without flaring your ribs."],
    bodyRegions: ["shoulders", "arms", "core"],
    difficulty: "intermediate",
    equipment: ["Two dumbbells"],
    dosage: "3 sets of 6 to 10",
    commonMistakes: ["Leaning backwards to clear the weights."],
    safety: ["Use a landmine or incline variation if overhead range is limited."],
    variations: {
      easier: "Press one very light weight at a time.",
      harder: "Use a slow descent."
    },
    bjjRelevance: "Trains shoulder and trunk coordination for higher frames.",
    movementPattern: "Vertical press",
    targetMuscles: ["Deltoids", "Triceps", "Abdominals"],
    substitutions: ["landmine-press", "dumbbell-floor-press"]
  },
  {
    slug: "inverted-row",
    name: "Inverted row",
    description: "Pull against bodyweight from under a fixed bar.",
    instructions: ["Check the bar is secured and grip it from underneath.", "Hold your body straight as you pull your chest upward.", "Lower without dropping your hips."],
    bodyRegions: ["back", "arms", "forearms", "core"],
    difficulty: "intermediate",
    equipment: ["Fixed bar", "Rack"],
    dosage: "3 sets of 6 to 10",
    commonMistakes: ["Letting the hips bend while pulling."],
    safety: ["Never use unsecured furniture or a loose bar."],
    variations: {
      easier: "Bend your knees and bring feet closer.",
      harder: "Straighten your legs to increase leverage."
    },
    bjjRelevance: "Trains pulling while maintaining body tension.",
    movementPattern: "Bodyweight horizontal pull",
    targetMuscles: ["Latissimus dorsi", "Middle trapezius", "Biceps"],
    substitutions: ["band-row", "dumbbell-row"]
  },
  {
    slug: "band-assisted-pull-up",
    name: "Band-assisted pull-up",
    description: "Reduce bodyweight demand while learning a vertical pull.",
    instructions: ["Secure an intact band to a rated bar and enter it from a stable step.", "Pull upward with even elbows.", "Return slowly and step out safely."],
    bodyRegions: ["back", "arms", "forearms"],
    difficulty: "intermediate",
    equipment: ["Pull-up bar", "Resistance band"],
    dosage: "3 sets of 4 to 8",
    commonMistakes: ["Letting the band launch the repetition."],
    safety: ["Check the band and keep your face out of its recoil line."],
    variations: {
      easier: "Use more assistance or foot support.",
      harder: "Use a lighter band."
    },
    bjjRelevance: "Builds pulling capacity before full bodyweight repetitions.",
    movementPattern: "Assisted vertical pull",
    targetMuscles: ["Latissimus dorsi", "Biceps", "Forearm flexors"],
    substitutions: ["pull-up", "band-row"]
  },
  {
    slug: "scapular-pull-up",
    name: "Scapular pull-up",
    description: "Practise pulling shoulder blades down with arms straight.",
    instructions: ["Hold a secure bar with partial foot support as needed.", "Move the shoulder blades down to lift slightly.", "Return gently while elbows stay straight."],
    bodyRegions: ["back", "shoulders", "forearms"],
    difficulty: "intermediate",
    equipment: ["Pull-up bar"],
    dosage: "2 to 3 sets of 5 to 8",
    commonMistakes: ["Bending the elbows to make the movement larger."],
    safety: ["Use supported footing if hanging irritates the shoulder."],
    variations: {
      easier: "Keep more weight on your feet.",
      harder: "Use less foot assistance."
    },
    bjjRelevance: "Develops shoulder control for pulling and hanging grip tasks.",
    movementPattern: "Scapular depression",
    targetMuscles: ["Lower trapezius", "Latissimus dorsi"],
    substitutions: ["band-row", "scapular-push-up"]
  },
  {
    slug: "plate-pinch",
    name: "Plate pinch hold",
    description: "Train a static pinch with manageable load.",
    instructions: ["Pinch a light plate securely between fingers and thumb.", "Stand tall with the plate at your side over a clear surface.", "Place the plate down before slipping."],
    bodyRegions: ["forearms", "wrists"],
    difficulty: "intermediate",
    equipment: ["Weight plates"],
    dosage: "3 holds of 10 to 20 seconds",
    commonMistakes: ["Holding to failure over your toes."],
    safety: ["Keep feet clear of the drop path."],
    variations: {
      easier: "Use a thinner or lighter plate.",
      harder: "Extend hold duration before weight."
    },
    bjjRelevance: "Builds hand endurance for certain cloth-grip positions.",
    movementPattern: "Isometric pinch grip",
    targetMuscles: ["Thumb adductors", "Finger flexors"],
    substitutions: ["towel-hold", "farmers-carry"]
  },
  {
    slug: "towel-hold",
    name: "Feet-supported towel grip hold",
    description: "Practise fabric gripping while the legs regulate load.",
    instructions: ["Loop an intact towel over a secure bar.", "Grip both sides and keep your feet supported.", "Lean only enough to challenge the hands, then step upright."],
    bodyRegions: ["forearms", "wrists", "back"],
    difficulty: "beginner",
    equipment: ["Pull-up bar", "Towel", "Stable step"],
    dosage: "3 holds of 10 to 25 seconds",
    commonMistakes: ["Letting your feet leave support unexpectedly."],
    safety: ["Check the bar and towel and stop before grip failure."],
    variations: {
      easier: "Stand more upright.",
      harder: "Lean slightly farther without removing both feet."
    },
    bjjRelevance: "Builds grip tolerance relevant to gi training.",
    movementPattern: "Isometric fabric grip",
    targetMuscles: ["Finger flexors", "Forearm flexors"],
    substitutions: ["dead-hang", "plate-pinch"]
  },
  {
    slug: "front-plank",
    name: "Forearm plank",
    description: "Practise sustained trunk tension while breathing calmly.",
    instructions: ["Place elbows under shoulders and extend the legs.", "Lift the hips in line with the shoulders.", "Lower before your lower back sags."],
    bodyRegions: ["core", "shoulders", "glutes"],
    difficulty: "beginner",
    equipment: ["Mat"],
    dosage: "2 to 3 holds of 15 to 30 seconds",
    commonMistakes: ["Holding your breath for the entire set."],
    safety: ["Use knees-down support if alignment is hard to maintain."],
    variations: {
      easier: "Plank from knees.",
      harder: "Move your elbows slightly farther forward."
    },
    bjjRelevance: "Builds trunk endurance for holding frames and stable top position.",
    movementPattern: "Isometric anti-extension",
    targetMuscles: ["Rectus abdominis", "Transversus abdominis", "Gluteus maximus"],
    substitutions: ["dead-bug", "side-plank"]
  },
  {
    slug: "band-anti-rotation-hold",
    name: "Band anti-rotation hold",
    description: "Hold a forward reach against sideways band tension.",
    instructions: ["Anchor a band and stand perpendicular to it.", "Reach the hands forward and hold your chest facing ahead.", "Bring the hands back before turning."],
    bodyRegions: ["core", "hips", "shoulders"],
    difficulty: "beginner",
    equipment: ["Resistance band", "Stable anchor"],
    dosage: "2 to 3 holds of 15 seconds each side",
    commonMistakes: ["Turning toward the anchor as fatigue rises."],
    safety: ["Check the anchor and stay in a secure stance."],
    variations: {
      easier: "Step closer to the anchor.",
      harder: "Use a narrower stance without letting the pelvis turn."
    },
    bjjRelevance: "Helps maintain trunk position against sideways pulling.",
    movementPattern: "Isometric anti-rotation",
    targetMuscles: ["Internal and external obliques", "Transversus abdominis"],
    substitutions: ["pallof-press", "side-plank"]
  },
  {
    slug: "standing-band-chop",
    name: "Controlled band chop",
    description: "Train smooth rotation against diagonal resistance.",
    instructions: ["Attach a band at high chest level and stand side-on.", "Move hands diagonally as the foot and hips turn.", "Return with control."],
    bodyRegions: ["core", "hips", "shoulders"],
    difficulty: "intermediate",
    equipment: ["Resistance band", "Stable anchor"],
    dosage: "2 to 3 sets of 8 each side",
    commonMistakes: ["Forcing the rotation through the knees."],
    safety: ["Allow the heel to pivot and inspect the band."],
    variations: {
      easier: "Use less tension and a shorter arc.",
      harder: "Pause at the end without bending the spine."
    },
    bjjRelevance: "Rehearses force transfer during angled grappling movement.",
    movementPattern: "Diagonal trunk rotation",
    targetMuscles: ["Internal and external obliques", "Gluteus medius"],
    substitutions: ["pallof-press", "band-anti-rotation-hold"]
  },
  {
    slug: "low-box-jump",
    name: "Low box jump",
    description: "Jump with intent and land quietly on a stable platform.",
    instructions: ["Set up close to a low stable box.", "Jump up with both feet and land with soft knees.", "Stand tall and step down between reps."],
    bodyRegions: ["glutes", "knees", "ankles"],
    difficulty: "intermediate",
    equipment: ["Stable low box"],
    dosage: "3 sets of 3 to 5",
    commonMistakes: ["Choosing a box that requires a deep tucked landing."],
    safety: ["Master quiet floor landings and clear the area first."],
    variations: {
      easier: "Practise a fast calf raise or small floor hop.",
      harder: "Use slightly more height only after consistent soft landings."
    },
    bjjRelevance: "Trains fast leg drive with deliberate recovery between efforts.",
    movementPattern: "Explosive lower-body drive",
    targetMuscles: ["Quadriceps", "Gluteus maximus", "Gastrocnemius"],
    substitutions: ["step-up", "bounded-lateral-step"]
  },
  {
    slug: "bounded-lateral-step",
    name: "Lateral bound and stick",
    description: "Practise small lateral jumps with a stable landing.",
    instructions: ["Begin on one leg with a light bend.", "Push sideways and land softly on the other foot.", "Hold a stable stance before returning."],
    bodyRegions: ["hips", "glutes", "ankles", "knees"],
    difficulty: "intermediate",
    equipment: [],
    dosage: "3 sets of 4 each side",
    commonMistakes: ["Chasing distance before controlling the landing."],
    safety: ["Start with lateral steps on a non-slip surface."],
    variations: {
      easier: "Step sideways and pause.",
      harder: "Increase distance slightly with the same landing control."
    },
    bjjRelevance: "Builds lateral drive and balance useful in changing angles.",
    movementPattern: "Explosive lateral drive and deceleration",
    targetMuscles: ["Gluteus medius", "Quadriceps", "Calf muscles"],
    substitutions: ["step-up", "low-box-jump"]
  },
  {
    slug: "wall-sit",
    name: "Wall sit",
    description: "Build low-stance endurance with back support.",
    instructions: ["Stand with your back against a wall.", "Walk feet forward and slide to a manageable depth.", "Stand before the position deteriorates."],
    bodyRegions: ["knees", "hips", "core"],
    difficulty: "beginner",
    equipment: ["Wall"],
    dosage: "2 to 3 holds of 20 to 40 seconds",
    commonMistakes: ["Sliding deeper as you fatigue."],
    safety: ["Use a shallow angle if knees are sensitive."],
    variations: {
      easier: "Hold a higher position.",
      harder: "Extend the hold at the same depth."
    },
    bjjRelevance: "Builds leg endurance for sustained passing stances.",
    movementPattern: "Isometric knee extension",
    targetMuscles: ["Quadriceps", "Gluteus maximus"],
    substitutions: ["bodyweight-squat", "step-up"]
  },
  {
    slug: "gentle-neck-isometric",
    name: "Gentle hand-resisted neck isometric",
    description: "Practise low-effort resistance in a neutral neck position.",
    instructions: ["Sit upright and rest your palm against the forehead or side of the head.", "Press very lightly into your palm without moving the head.", "Release and check how the neck feels before changing sides."],
    bodyRegions: ["neck"],
    difficulty: "beginner",
    equipment: [],
    dosage: "2 rounds of 5 seconds per direction",
    commonMistakes: ["Pressing hard or tilting the head to create leverage."],
    safety: ["Skip with neck symptoms, dizziness or a recent injury and avoid loaded bridging."],
    variations: {
      easier: "Practise neutral head positioning without pressure.",
      harder: "Repeat another short hold at the same low effort."
    },
    bjjRelevance: "Supports controlled head position during non-contact preparation.",
    movementPattern: "Low-force cervical isometric",
    targetMuscles: ["Cervical stabilisers"],
    substitutions: ["seated-chin-nod"]
  },
  {
    slug: "kettlebell-deadlift",
    name: "Kettlebell deadlift",
    description: "Practise a ground-to-standing hinge using one kettlebell.",
    instructions: ["Place the bell between your feet and grasp the handle with both hands.", "Breathe in, brace and drive through both feet to stand.", "Lower with hips back and set the bell down softly."],
    bodyRegions: ["glutes", "hamstrings", "back", "forearms"],
    difficulty: "beginner",
    equipment: ["Kettlebell"],
    dosage: "3 sets of 8 to 12",
    commonMistakes: ["Reaching forward so the bell moves away from the legs."],
    safety: ["Raise the bell on a stable block if you cannot reach it under control."],
    variations: {
      easier: "Use a raised starting point and lighter load.",
      harder: "Use a three-second descent."
    },
    bjjRelevance: "Builds a repeatable hinge for standing strength and kettlebell swings.",
    movementPattern: "Bilateral ground-to-standing hinge",
    targetMuscles: ["Gluteus maximus", "Hamstrings", "Spinal erectors"],
    substitutions: ["romanian-deadlift", "trap-bar-deadlift"]
  },
  {
    slug: "kettlebell-row",
    name: "One-arm kettlebell row",
    description: "Train a one-arm pull with the bell suspended below the hand.",
    instructions: ["Hinge and support the free hand on a stable surface.", "Draw your loaded elbow back toward the hip.", "Lower the bell without turning your torso."],
    bodyRegions: ["back", "arms", "forearms", "core"],
    difficulty: "beginner",
    equipment: ["Kettlebell", "Stable support"],
    dosage: "3 sets of 8 to 12 each side",
    commonMistakes: ["Turning the ribcage to get the bell higher."],
    safety: ["Use a weight you can lower smoothly without losing your base."],
    variations: {
      easier: "Use a lighter bell and bend your knees a little more.",
      harder: "Pause at the top without shrugging."
    },
    bjjRelevance: "Builds pulling strength while maintaining an uneven grappling stance.",
    movementPattern: "Unilateral horizontal pull",
    targetMuscles: ["Latissimus dorsi", "Middle trapezius", "Biceps"],
    substitutions: ["dumbbell-row", "band-row"]
  }
])
