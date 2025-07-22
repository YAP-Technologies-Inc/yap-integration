const mockLesson4 = {
  lesson_id: 'SPA1_004',
  title: 'Sp. A1 - Mi familia',
  duration_minutes: 10,
  prerequisite_lessons: ['SPA1_003'],
  learning_objectives: [
    'Name family members',
    'Describe family size',
    'Use possessive adjectives',
  ],
  vocabulary_items: [
    'familia',
    'padre',
    'madre',
    'hermano',
    'hermana',
    'hijo',
    'hija',
    'abuelo',
    'abuela',
    'mi',
    'tu',
    'su',
  ],
  grammar_point: 'Possessive adjectives (mi, tu, su)',
  speaking_tasks: [
    {
      type: 'vocabulary_activation',
      method: 'picture_description',
      topic: 'family tree',
    },
    {
      type: 'sentence_building',
      patterns: ['Mi ___ se llama ___', 'Tengo ___ hermanos'],
    },
    {
      type: 'show_and_tell',
      topic: 'Describe your family',
      time_limit: 60,
      support: 'word bank',
    },
  ],
  assessment: {
    type: 'oral_presentation',
    topic: 'Mi familia',
    duration: 30,
    elements: ['family members', 'names', 'basic descriptions'],
  },
};
export default mockLesson4;
