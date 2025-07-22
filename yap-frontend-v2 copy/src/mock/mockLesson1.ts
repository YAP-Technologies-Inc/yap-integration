const mockLesson1 = {
  lesson_id: 'SPA1_001',
  title: 'Sp. A1 - ¡Hola! Me llamo...',
  duration_minutes: 7,
  prerequisite_lessons: [],
  learning_objectives: [
    'Introduce yourself with name',
    'Greet others appropriately',
    "Ask someone's name",
  ],
  vocabulary_items: [
    'hola',
    'buenos días',
    'buenas tardes',
    'buenas noches',
    'me llamo',
    '¿cómo te llamas?',
    'mucho gusto',
    'encantado/a',
  ],
  grammar_point: 'Subject pronouns (yo, tú)',
  speaking_tasks: [
    {
      type: 'listen_and_repeat',
      content: 'Hola, me llamo [nombre]. ¿Cómo te llamas?',
      variations: 3,
    },
    {
      type: 'role_play',
      scenario: 'Meeting someone new',
      prompts: ['Greet', 'Introduce yourself', 'Ask their name'],
      expected_output: ['Hola', 'Me llamo...', '¿Cómo te llamas?'],
    },
    {
      type: 'pronunciation_practice',
      focus: "ll sound in 'llamo'",
      words: ['llamo', 'llamas', 'lluvia'],
    },
  ],
  assessment: {
    type: 'speaking_production',
    task: 'Record a self-introduction',
    criteria: [
      'Clear pronunciation',
      'Complete sentences',
      'Appropriate greeting',
    ],
  },
};

export default mockLesson1;
