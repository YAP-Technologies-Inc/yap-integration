const mockLesson5 = {
  lesson_id: 'SPA1_005',
  title: 'Sp. A1 - ¿Cómo estás?',
  duration_minutes: 6,
  prerequisite_lessons: ['SPA1_004'],
  learning_objectives: [
    'Ask how someone is feeling',
    'Express basic emotions and states',
    'Respond appropriately to greetings',
  ],
  vocabulary_items: [
    '¿cómo estás?',
    'bien',
    'mal',
    'regular',
    'muy bien',
    'cansado/a',
    'contento/a',
    'triste',
    'enfermo/a',
  ],
  grammar_point: "Verb 'estar' (estoy, estás), adjective agreement",
  speaking_tasks: [
    {
      type: 'emotion_expression',
      prompts: ['¿Cómo estás?'],
      responses: ['Estoy ___', 'Estoy muy ___'],
    },
    {
      type: 'reaction_practice',
      situations: ['Monday morning', 'Friday afternoon', 'After exam'],
      express_feeling: true,
    },
    {
      type: 'mini_dialogue',
      exchanges: 3,
      focus: 'greeting and emotional state',
    },
  ],
  assessment: {
    type: 'spontaneous_response',
    prompts: 5,
    response_time: 3,
  },
};
export default mockLesson5;
