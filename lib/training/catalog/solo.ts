import { defineExercises } from './types'

export const soloExercises = defineExercises('solo', [
  {
    slug: "shrimp",
    name: "Shrimping",
    description: "Move the hips away while the shoulders stay low. Start after learning a comfortable side-lying position, on a clear mat.",
    instructions: ["Lie on your side with one foot planted.", "Push gently through the planted foot and slide the hips back.", "Reset slowly and switch sides."],
    bodyRegions: ["hips", "core", "glutes"],
    difficulty: "beginner",
    equipment: ["Mat"],
    dosage: "6 repetitions each side",
    commonMistakes: ["Trying to drag the shoulders along with the hips."],
    safety: ["Use a padded mat and keep weight off the head and neck."],
    variations: {
      easier: "Practise a short stationary slide.",
      harder: "Chain two short slides with clean resets."
    },
    bjjRelevance: "Rehearses making space before bringing the legs back into guard.",
    movementPattern: "Hip escape movement"
  },
  {
    slug: "reverse-shrimp",
    name: "Reverse shrimping",
    description: "Practise drawing the hips toward a planted foot. Learn the basic shrimp first and check there is clear mat space.",
    instructions: ["Start on one side with a heel planted ahead.", "Draw the hips toward the heel and rotate toward a seated position as comfortable.", "Return to the starting position and change sides."],
    bodyRegions: ["hips", "core", "hamstrings"],
    difficulty: "intermediate",
    equipment: ["Mat"],
    dosage: "6 repetitions each side",
    commonMistakes: ["Pulling the entire body with the arms."],
    safety: ["Use a short range if twisting strains the knee."],
    variations: {
      easier: "Make the move without travelling.",
      harder: "Alternate sides with a stable stop after each move."
    },
    bjjRelevance: "Rehearses repositioning the hips without requiring a partner.",
    movementPattern: "Hip movement toward the foot"
  },
  {
    slug: "solo-bridge",
    name: "Controlled grappling bridge",
    description: "Practise lifting and gently turning over a shoulder. Start with a comfortable ground bridge on a padded mat.",
    instructions: ["Lie back with feet grounded and hands near the chest.", "Drive through the feet, lift the hips and turn slightly toward a shoulder.", "Lower to reset between sides."],
    bodyRegions: ["hips", "glutes", "core"],
    difficulty: "beginner",
    equipment: ["Mat"],
    dosage: "6 repetitions each side",
    commonMistakes: ["Loading the crown of the head or overextending the back."],
    safety: ["Keep weight on upper back and shoulders and leave the neck unloaded."],
    variations: {
      easier: "Use a straight bridge without rotation.",
      harder: "Add a small alternating turn with a stable reset."
    },
    bjjRelevance: "Strengthens the movement used to shift position from bottom.",
    movementPattern: "Hip extension and turning"
  },
  {
    slug: "technical-stand-up",
    name: "Technical stand-up",
    description: "Practise rising from a supported seated base. Learn seated side support first and use clear space.",
    instructions: ["From seated, plant one foot and the opposite hand.", "Lift your hips and draw the free leg under your body.", "Stand from the resulting split stance and reverse slowly."],
    bodyRegions: ["hips", "wrists", "core"],
    difficulty: "beginner",
    equipment: ["Mat", "Clear floor"],
    dosage: "5 repetitions each side",
    commonMistakes: ["Putting the post hand too close to the hips."],
    safety: ["Check that your wrist tolerates posting and clear the floor first."],
    variations: {
      easier: "Practise only the hip lift.",
      harder: "Connect the stand-up to two easy stance steps."
    },
    bjjRelevance: "Builds a repeatable transition from seated guard to standing.",
    movementPattern: "Supported floor-to-stand"
  },
  {
    slug: "hip-heist",
    name: "Hip heist",
    description: "Rotate from a stable seated support into a low kneeling stance. Learn a side post and work on a clear mat.",
    instructions: ["Sit with one hand posted and both feet available for support.", "Raise the hips and rotate the legs under you.", "Settle into a stable base and reset the other way."],
    bodyRegions: ["hips", "core", "wrists"],
    difficulty: "intermediate",
    equipment: ["Mat"],
    dosage: "5 repetitions each side",
    commonMistakes: ["Throwing bodyweight abruptly into the post arm."],
    safety: ["Use a small range or stop if the post wrist is uncomfortable."],
    variations: {
      easier: "Rehearse the supported hip lift.",
      harder: "Flow slowly between sides without dropping the hips."
    },
    bjjRelevance: "Trains transitions from seated guard into an upright base.",
    movementPattern: "Grounded hip rotation and support swap"
  },
  {
    slug: "sit-out",
    name: "Controlled sit-out",
    description: "Move a leg through to a supported seated position. Begin after establishing a stable hands-and-knees base.",
    instructions: ["Start on hands and knees with toes tucked.", "Lift one hand while bringing the opposite leg through.", "Pause in a stable position and return to base."],
    bodyRegions: ["hips", "core", "shoulders", "wrists"],
    difficulty: "intermediate",
    equipment: ["Mat"],
    dosage: "5 repetitions each side",
    commonMistakes: ["Dropping heavily onto the hip."],
    safety: ["Keep the speed low and use a padded mat."],
    variations: {
      easier: "Reach the leg only partway through.",
      harder: "Alternate sides in a smooth controlled sequence."
    },
    bjjRelevance: "Develops limb independence and trunk control when changing bases.",
    movementPattern: "Quadruped rotation"
  },
  {
    slug: "seated-guard-pivots",
    name: "Seated guard pivots",
    description: "Turn in a balanced seated guard position. Use a clear mat with room on either side.",
    instructions: ["Sit tall with knees bent and feet available for light pressure.", "Shift weight to one hip and turn toward it.", "Return to centre before turning the other way."],
    bodyRegions: ["hips", "core", "glutes"],
    difficulty: "beginner",
    equipment: ["Mat"],
    dosage: "8 turns each side",
    commonMistakes: ["Leaning backward as soon as the hips turn."],
    safety: ["Use a hand lightly if you lose balance."],
    variations: {
      easier: "Make small turns with both hands supported.",
      harder: "Keep the hands off the mat through the turn."
    },
    bjjRelevance: "Improves controlled adjustment of the seated guard angle.",
    movementPattern: "Seated hip rotation"
  },
  {
    slug: "supine-leg-pummels",
    name: "Supine leg pummels",
    description: "Guide the legs through controlled circular paths. Start after you can maintain a comfortable supine guard position.",
    instructions: ["Lie back with knees bent and raised.", "Trace a circle with one foot while the other leg maintains position.", "Reverse directions, then change feet."],
    bodyRegions: ["hips", "core", "hamstrings"],
    difficulty: "intermediate",
    equipment: ["Mat"],
    dosage: "6 circles each direction",
    commonMistakes: ["Using momentum and rocking onto the neck."],
    safety: ["Limit hip range if the back leaves the floor forcefully."],
    variations: {
      easier: "Circle one leg with the other foot grounded.",
      harder: "Alternate circles with both feet off the floor."
    },
    bjjRelevance: "Rehearses repositioning the feet in open guard.",
    movementPattern: "Open-guard leg circumduction"
  },
  {
    slug: "sprawl-step-back",
    name: "Step-back sprawl",
    description: "Rehearse a step-back sprawl without impact. Learn a stable plank and use a clear surface.",
    instructions: ["From a low stance place hands on the mat.", "Step both feet back and lower the hips within control.", "Step one foot forward at a time and recover to stance."],
    bodyRegions: ["hips", "core", "shoulders"],
    difficulty: "intermediate",
    equipment: ["Mat", "Clear floor"],
    dosage: "5 repetitions each side",
    commonMistakes: ["Flopping the hips down with an uncontrolled back arch."],
    safety: ["Stay with step-backs and stop if the wrists or back hurt."],
    variations: {
      easier: "Practise hands on an elevated stable surface.",
      harder: "Add a quicker step while keeping the landing quiet."
    },
    bjjRelevance: "Builds a safe movement pattern for changing between standing and low defensive positions.",
    movementPattern: "Controlled hips-back transition"
  },
  {
    slug: "penetration-step",
    name: "Slow wrestling penetration step",
    description: "Rehearse an unloaded level change into a forward step. Learn a stable split stance before using a padded mat.",
    instructions: ["Lower your level by bending knees and hips.", "Take a controlled forward step as the trail leg follows.", "Recover upright without dropping onto a knee."],
    bodyRegions: ["hips", "knees", "ankles"],
    difficulty: "intermediate",
    equipment: ["Padded mat"],
    dosage: "5 repetitions each side",
    commonMistakes: ["Pitching the upper body forward to lower level."],
    safety: ["Avoid hard knee contact and use adequate padding."],
    variations: {
      easier: "Practise the step without lowering far.",
      harder: "Connect a small angle change after the step."
    },
    bjjRelevance: "Develops balance and leg drive when practising takedown entries on the mat.",
    movementPattern: "Level change and forward step"
  },
  {
    slug: "shadow-wrestling",
    name: "Shadow wrestling footwork",
    description: "Practise changes of position without contact. Learn your basic stance and choose open floor space.",
    instructions: ["Set a comfortable stance with a soft knee bend.", "Move in short forward, backward and lateral steps.", "Pause and reset if your feet cross."],
    bodyRegions: ["hips", "knees", "ankles", "full-body"],
    difficulty: "beginner",
    equipment: ["Clear floor"],
    dosage: "3 rounds of 60 seconds",
    commonMistakes: ["Trying to make every step as fast as possible."],
    safety: ["Keep distance from walls and other athletes."],
    variations: {
      easier: "Practise one direction per round.",
      harder: "Add a controlled level change every few steps."
    },
    bjjRelevance: "Builds fluency moving from a standing grappling base.",
    movementPattern: "Stance and directional movement"
  },
  {
    slug: "passing-angle-steps",
    name: "Controlled passing footwork",
    description: "Step around a floor marker with controlled passing footwork. Use a clear mat and a soft marker.",
    instructions: ["Start facing the marker in a wide stance.", "Step to one side, turn your chest toward the marker and stabilise.", "Return to the start and repeat on the other side."],
    bodyRegions: ["hips", "knees", "ankles"],
    difficulty: "beginner",
    equipment: ["Mat", "Floor marker"],
    dosage: "6 passes each direction",
    commonMistakes: ["Crossing your feet during the angle change."],
    safety: ["Use a flat marker with no tripping hazard."],
    variations: {
      easier: "Step around a wider arc.",
      harder: "Add a slight controlled level change at the new angle."
    },
    bjjRelevance: "Rehearses passing angles and stance recovery.",
    movementPattern: "Lateral angle change"
  },
  {
    slug: "seated-butt-scoot",
    name: "Seated hip scoot",
    description: "Move forward or backward from a seated base. Start with short reaches on a clear mat.",
    instructions: ["Sit with knees bent and feet near you.", "Shift onto one hip and draw the other hip forward slightly.", "Repeat on the other side with the chest upright."],
    bodyRegions: ["hips", "core", "glutes"],
    difficulty: "beginner",
    equipment: ["Mat"],
    dosage: "6 repetitions each direction",
    commonMistakes: ["Pulling the body mainly with the hands."],
    safety: ["Use small movement if hip flexion feels strained."],
    variations: {
      easier: "Scoot with one hand supporting balance.",
      harder: "Keep both hands lifted as you travel."
    },
    bjjRelevance: "Practises managing distance while remaining seated.",
    movementPattern: "Seated hip translation"
  },
  {
    slug: "four-point-base",
    name: "Four-point base shifts",
    description: "Move bodyweight between four points of contact. Learn a comfortable hands-and-knees base on a mat.",
    instructions: ["Place hands under shoulders and knees under hips.", "Shift your chest slightly forward, back and side to side.", "Return to centre without locking the elbows."],
    bodyRegions: ["shoulders", "hips", "core"],
    difficulty: "beginner",
    equipment: ["Mat"],
    dosage: "6 shifts each direction",
    commonMistakes: ["Dropping into one shoulder abruptly."],
    safety: ["Keep the range small if wrists or knees feel sensitive."],
    variations: {
      easier: "Use gentle forward and back shifts.",
      harder: "Float one knee briefly during the shift."
    },
    bjjRelevance: "Builds awareness of pressure and balance from a kneeling base.",
    movementPattern: "Quadruped balance"
  },
  {
    slug: "bear-crawl",
    name: "Slow bear crawl",
    description: "Move opposite hand and foot with the knees slightly lifted. Learn stable quadruped shifts first.",
    instructions: ["Tuck your toes and lift the knees slightly.", "Step one hand and the opposite foot together.", "Return backward with the same small steps."],
    bodyRegions: ["core", "shoulders", "hips"],
    difficulty: "intermediate",
    equipment: ["Mat", "Clear floor"],
    dosage: "3 trips of 4 steps forward and back",
    commonMistakes: ["Lifting the hips high or rushing foot placement."],
    safety: ["Keep the space clear and keep knees down if shoulder load is uncomfortable."],
    variations: {
      easier: "Crawl with knees lightly stepping.",
      harder: "Add two steps without increasing speed."
    },
    bjjRelevance: "Develops coordinated movement under a low stance.",
    movementPattern: "Contralateral ground locomotion"
  },
  {
    slug: "turtle-to-kneeling",
    name: "Ground base to half kneel",
    description: "Move from hands and knees to an upright half kneel. Use a padded mat and learn four-point support first.",
    instructions: ["Start low with a stable four-point base.", "Step one foot beside your hand.", "Lift the chest into half kneeling before slowly returning."],
    bodyRegions: ["hips", "core", "knees"],
    difficulty: "beginner",
    equipment: ["Mat"],
    dosage: "5 repetitions each side",
    commonMistakes: ["Rotating the loaded knee as the foot lands."],
    safety: ["Pad the supporting knee and use hands for balance."],
    variations: {
      easier: "Keep a hand supported as the chest lifts.",
      harder: "Connect the half kneel to a controlled stand."
    },
    bjjRelevance: "Builds a smooth route from ground base to standing.",
    movementPattern: "Quadruped-to-kneeling transition"
  },
  {
    slug: "guard-knee-shield-switch",
    name: "Supine knee-shield switches",
    description: "Switch your lower-body angle while keeping the upper back supported. Learn a basic shrimp before adding this drill.",
    instructions: ["Lie with knees bent and roll slightly onto one hip.", "Bring the top knee across toward the opposite side of the trunk.", "Return through centre before changing sides."],
    bodyRegions: ["hips", "core", "glutes"],
    difficulty: "intermediate",
    equipment: ["Mat"],
    dosage: "6 repetitions each side",
    commonMistakes: ["Trying to sweep the knee using only momentum."],
    safety: ["Keep the knee free from forced inward pressure."],
    variations: {
      easier: "Use a shorter knee movement.",
      harder: "Add a small hip escape before each switch."
    },
    bjjRelevance: "Rehearses repositioning the legs from one guard angle to another.",
    movementPattern: "Hip rotation and diagonal frame position"
  },
  {
    slug: "disengage-step",
    name: "Backward angle step",
    description: "Practise opening distance with a controlled backward step. Learn stable stance steps first.",
    instructions: ["Start facing the marker with knees soft.", "Step diagonally backward and let the other foot restore your stance.", "Pause before returning forward."],
    bodyRegions: ["hips", "ankles", "knees"],
    difficulty: "beginner",
    equipment: ["Clear floor", "Floor marker"],
    dosage: "6 repetitions each side",
    commonMistakes: ["Leaning back with the feet together."],
    safety: ["Check there is clear space behind you."],
    variations: {
      easier: "Use a simple straight backward step.",
      harder: "Link the diagonal step to a change of direction."
    },
    bjjRelevance: "Builds footwork for resetting or managing distance.",
    movementPattern: "Backward directional change"
  },
  {
    slug: "knee-cut-line-step",
    name: "Knee-cut footwork without contact",
    description: "Rehearse the ankle, knee and hip alignment of a diagonal line step. Learn a split stance first and work without a partner.",
    instructions: ["Set a split stance next to a soft floor marker.", "Step and lower gently along a diagonal line with the knee following the toes.", "Recover to a stable standing base."],
    bodyRegions: ["hips", "knees", "ankles"],
    difficulty: "intermediate",
    equipment: ["Padded mat", "Floor marker"],
    dosage: "5 repetitions each side",
    commonMistakes: ["Driving the knee inward past the foot under load."],
    safety: ["Use a shallow range and avoid dropping onto the knee."],
    variations: {
      easier: "Step diagonally without lowering.",
      harder: "Add controlled return footwork in the opposite direction."
    },
    bjjRelevance: "Rehearses direction and position for knee-cut passing.",
    movementPattern: "Diagonal passing level change"
  },
  {
    slug: "controlled-base-switch",
    name: "Standing base switch",
    description: "Switch lead feet without the stance narrowing. Practise on a non-slip, open surface.",
    instructions: ["Begin with one foot ahead and hips softly lowered.", "Step back to a neutral base, then advance the other foot.", "Settle into the new stance before repeating."],
    bodyRegions: ["hips", "ankles", "core"],
    difficulty: "beginner",
    equipment: ["Clear floor"],
    dosage: "8 switches",
    commonMistakes: ["Letting both feet land on one line."],
    safety: ["Scale the step length to stay balanced."],
    variations: {
      easier: "Pause at neutral between every step.",
      harder: "Reduce the pause while maintaining stance width."
    },
    bjjRelevance: "Helps athletes switch lead sides during footwork.",
    movementPattern: "Balanced stance change"
  }
])
