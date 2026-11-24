const standardSpace = new Set(['none', 'mat', 'exercise mat', 'bodyweight', 'floor', 'clear floor', 'wall'])

const alternatives: Record<string, string[]> = {
  'barbell or dumbbells': ['Barbell', 'Two dumbbells'],
  'dumbbell or kettlebell': ['Dumbbell', 'Kettlebell'],
  'two dumbbells or kettlebells': ['Two dumbbells', 'Two kettlebells'],
  'step or low box': ['Stable low step', 'Stable low box'],
  'mat or chair': ['Mat', 'Chair'],
}

function choices(requirement: string) {
  return alternatives[requirement.toLowerCase()] ?? [requirement]
}

export function equipmentChoices(requirements: string[]) {
  return [...new Set(requirements.flatMap(choices).filter(name => !standardSpace.has(name.toLowerCase())))]
}

export function hasRequiredEquipment(requirement: string, available: Iterable<string>) {
  const inventory = new Set([...available].map(name => name.toLowerCase()))
  return choices(requirement).some(choice => {
    const name = choice.toLowerCase()
    return standardSpace.has(name) || inventory.has(name) ||
      (name === 'dumbbell' && inventory.has('two dumbbells')) ||
      (name === 'kettlebell' && inventory.has('two kettlebells'))
  })
}
