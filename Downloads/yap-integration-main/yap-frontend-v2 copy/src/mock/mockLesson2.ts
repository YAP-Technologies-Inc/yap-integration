const mockLesson2 = {
  lesson_id: 'SPA1_002',
  title: 'Sp. A1 - ¿De dónde eres?',
  duration_minutes: 8,
  prerequisite_lessons: ['SPA1_001'],
  learning_objectives: [
    "Say where you're from",
    "Ask about someone's origin",
    'Name countries and nationalities',
  ],
  vocabulary_items: [
    'soy de',
    '¿de dónde eres?',
    'España',
    'México',
    'Estados Unidos',
    'español/a',
    'mexicano/a',
    'estadounidense',
    'país',
    'ciudad',
  ],
  grammar_point: "Verb 'ser' (soy, eres)",
  speaking_tasks: [
    {
      type: 'substitution_drill',
      base: 'Soy de [país]',
      substitutions: ['España', 'México', 'Argentina', 'Colombia'],
    },
    {
      type: 'q_and_a',
      questions: ['¿De dónde eres?', '¿Eres español?'],
      guide_answers: ['Soy de...', 'Sí, soy.../No, soy...'],
    },
    {
      type: 'conversation_building',
      turns: 4,
      starter: 'Hola, me llamo Ana. Soy de España.',
    },
  ],
  cultural_note: 'Spanish-speaking countries overview',
  assessment: {
    type: 'dialogue_completion',
    gaps: 3,
    context: 'Meeting at international conference',
  },
};

export default mockLesson2;
