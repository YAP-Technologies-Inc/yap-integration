const mockLesson1 = {
  lesson_id: 'SPA1_001',
  title: 'Self-Introduction',
  duration_minutes: 10,
  level: 'A1',
  lesson_type: 'integrated',
  theme: 'Meeting new people and introducing yourself',
  prerequisite_lessons: [],
  learning_objectives: [
    'Learn 8 essential greeting and introduction vocabulary words',
    'Understand and use subject pronouns (yo, tú)',
    'Practice introducing yourself in a real conversation',
    'Comprehend basic introduction dialogues',
  ],
  vocabulary_items: [
    { es: 'hola', en: 'hello', example: 'Hola, ¿cómo estás?' },
    {
      es: 'buenos días',
      en: 'good morning',
      example: 'Buenos días, señora García.',
    },
    {
      es: 'buenas tardes',
      en: 'good afternoon',
      example: 'Buenas tardes, profesor.',
    },
    {
      es: 'buenas noches',
      en: 'good evening/night',
      example: 'Buenas noches, hasta mañana.',
    },
    { es: 'me llamo', en: 'my name is', example: 'Me llamo Carlos.' },
    {
      es: '¿cómo te llamas?',
      en: "what's your name?",
      example: '¿Cómo te llamas tú?',
    },
    {
      es: 'mucho gusto',
      en: 'nice to meet you',
      example: 'Mucho gusto, María.',
    },
    {
      es: 'encantado/a',
      en: 'pleased to meet you',
      example: 'Encantada de conocerte.',
    },
  ],
  grammar_point: 'Subject pronouns (yo, tú) and verb llamarse',
  grammar_explanations: [
    {
      rule: "Use 'yo' for 'I' and 'tú' for informal 'you'. The verb 'llamarse' changes: me llamo (I am called), te llamas (you are called).",
      examples: ['Yo me llamo Ana.', 'Tú te llamas Pedro.', '¿Cómo te llamas tú?'],
    },
  ],
  speaking_tasks: [
    {
      type: 'listen_and_repeat',
      content: 'Hola, me llamo [nombre]. ¿Cómo te llamas?',
      variations: 3,
      focus: 'pronunciation and intonation',
    },
    {
      type: 'role_play',
      scenario: 'Meeting someone new at a café',
      prompts: [
        'Person A: Greet appropriately for time of day',
        'Person B: Return greeting and introduce yourself',
        'Person A: Say nice to meet you and ask their name',
        'Person B: Give your name and say pleased to meet you',
      ],
      expected_output: [
        'Buenos días/tardes',
        'Hola, me llamo...',
        'Mucho gusto. ¿Cómo te llamas?',
        'Me llamo... Encantado/a',
      ],
    },
    {
      type: 'pronunciation_practice',
      focus: "ll sound in 'llamo'",
      words: ['llamo', 'llamas', 'lluvia'],
      instructions: "Practice the Spanish 'll' sound, similar to 'y' in 'yes'",
    },
  ],
  comprehension_tasks: [
    {
      type: 'dialogue',
      audio: true,
      text: 'Ana: Buenos días, me llamo Ana García. ¿Cómo te llamas?\nCarlos: Hola Ana, mucho gusto. Me llamo Carlos Pérez.\nAna: Encantada, Carlos.',
      questions: [
        {
          question: '¿Cómo se llama la mujer?',
          answer: 'Se llama Ana García.',
        },
        {
          question: "¿Qué dice Carlos después de 'Hola Ana'?",
          answer: 'Mucho gusto.',
        },
        {
          question: '¿Cuándo ocurre esta conversación?',
          answer: 'Por la mañana (buenos días).',
        },
      ],
    },
  ],
  vocabulary_practice: [
    {
      type: 'greeting_match',
      instructions: 'Match the greeting to the appropriate time of day',
      items: [
        { greeting: 'buenos días', time: '8:00 AM' },
        { greeting: 'buenas tardes', time: '3:00 PM' },
        { greeting: 'buenas noches', time: '9:00 PM' },
      ],
    },
    {
      type: 'fill_in_blanks',
      sentences: ['Hola, ___ llamo María.', '¿Cómo ___ llamas?', '___ gusto conocerte.'],
      word_bank: ['me', 'te', 'mucho'],
    },
  ],
  assessment: {
    type: 'integrated_performance',
    tasks: [
      'Record a self-introduction using all greeting types',
      'Complete a dialogue with appropriate responses',
      'Answer comprehension questions correctly',
      'Use subject pronouns accurately',
    ],
    criteria: [
      "Clear pronunciation of 'll' sound",
      'Appropriate greeting for time of day',
      'Complete sentences with correct verb forms',
      'Natural intonation in questions and statements',
    ],
  },
  skill_distribution: {
    speaking: 40,
    vocabulary: 25,
    grammar: 20,
    comprehension: 15,
  },
};

export default mockLesson1;
