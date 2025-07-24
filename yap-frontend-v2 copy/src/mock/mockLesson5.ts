const mockLesson5 = {
  lesson_id: 'SPA1_005',
  title: 'Feelings and Emotions',
  duration_minutes: 8,
  level: 'A1',
  lesson_type: 'integrated',
  theme: 'Expressing how you feel',
  prerequisite_lessons: ['SPA1_004'],
  learning_objectives: [
    'Learn 9 emotion and feeling vocabulary words',
    "Master the verb 'estar' for temporary states",
    'Practice expressing and asking about feelings',
    'Understand emotional state conversations',
  ],
  vocabulary_items: [
    {
      es: '¿cómo estás?',
      en: 'how are you?',
      example: 'Hola, ¿cómo estás hoy?',
    },
    { es: 'bien', en: 'well/fine', example: 'Estoy bien, gracias.' },
    { es: 'mal', en: 'bad/poorly', example: 'Estoy mal, tengo gripe.' },
    { es: 'regular', en: 'so-so', example: 'Estoy regular, más o menos.' },
    { es: 'muy bien', en: 'very well', example: '¡Estoy muy bien!' },
    {
      es: 'cansado/a',
      en: 'tired',
      example: 'Estoy cansada después del trabajo.',
    },
    { es: 'contento/a', en: 'happy', example: 'Estoy contento con mi nota.' },
    { es: 'triste', en: 'sad', example: 'Está triste por la noticia.' },
    { es: 'enfermo/a', en: 'sick', example: 'Mi hermano está enfermo.' },
  ],
  grammar_point: "Verb 'estar' for emotions and adjective agreement",
  grammar_explanations: [
    {
      rule: "Use 'estar' for temporary states and emotions. Forms: estoy, estás. Adjectives must agree with gender: -o (masculine), -a (feminine).",
      examples: [
        'Estoy cansado. (male speaker)',
        'Estoy cansada. (female speaker)',
        '¿Cómo estás?',
        'Ella está contenta.',
      ],
    },
  ],
  speaking_tasks: [
    {
      type: 'emotion_expression',
      prompts: ['¿Cómo estás?', '¿Cómo está tu amigo?'],
      responses: ['Estoy ___', 'Estoy muy ___', 'Está ___'],
      emotions_bank: ['bien', 'mal', 'cansado/a', 'contento/a', 'triste'],
    },
    {
      type: 'reaction_practice',
      situations: [
        'Monday morning at 7am',
        'Friday afternoon at 5pm',
        'After a difficult exam',
        'On your birthday',
      ],
      express_feeling: true,
      justify: 'porque...',
    },
    {
      type: 'mini_dialogue',
      exchanges: 3,
      focus: 'greeting and emotional state',
      structure: [
        'A: Greet and ask how they are',
        'B: Respond and ask back',
        'A: Answer with reason',
      ],
    },
  ],
  comprehension_tasks: [
    {
      type: 'emotion_identification',
      audio: true,
      conversations: [
        'Pedro: Estoy muy cansado. Trabajé mucho hoy.',
        'Ana: Estoy contenta. ¡Es viernes!',
        'Luis: Estoy enfermo. Tengo fiebre.',
      ],
      questions: [
        { question: '¿Cómo está Pedro?', answer: 'Está muy cansado.' },
        {
          question: '¿Por qué está contenta Ana?',
          answer: 'Porque es viernes.',
        },
        { question: '¿Qué tiene Luis?', answer: 'Tiene fiebre.' },
      ],
    },
  ],
  vocabulary_practice: [
    {
      type: 'emotion_faces',
      instructions: 'Match emotions to facial expressions',
      emotions: ['contento', 'triste', 'cansado', 'enfermo'],
    },
    {
      type: 'adjective_agreement',
      instructions: 'Choose correct form based on speaker',
      practice: [
        'María: Estoy (cansado/cansada)',
        'Juan: Estoy (contento/contenta)',
        'Ana: Estoy (enfermo/enferma)',
      ],
    },
  ],
  assessment: {
    type: 'spontaneous_response',
    prompts: [
      '¿Cómo estás hoy?',
      '¿Cómo está tu familia?',
      '¿Estás cansado/a?',
      '¿Por qué estás contento/a?',
      '¿Cómo estás los lunes?',
    ],
    response_time: 3,
    criteria: [
      'Correct use of estar',
      'Appropriate adjective agreement',
      'Natural response time',
      'Logical answers',
    ],
  },
  skill_distribution: {
    speaking: 45,
    vocabulary: 25,
    grammar: 20,
    comprehension: 10,
  },
};
export default mockLesson5;
