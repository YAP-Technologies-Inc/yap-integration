const mockLesson2 = {
  lesson_id: 'SPA1_002',
  title: 'Origins and Nationalities',
  duration_minutes: 10,
  level: 'A1',
  lesson_type: 'integrated',
  theme: "Talking about where you're from",
  prerequisite_lessons: ['SPA1_001'],
  learning_objectives: [
    'Learn 10 vocabulary words for countries and nationalities',
    "Master the verb 'ser' for origins (soy, eres)",
    'Practice asking and answering about origins',
    'Understand conversations about nationalities',
  ],
  vocabulary_items: [
    { es: 'soy de', en: 'I am from', example: 'Soy de México.' },
    {
      es: '¿de dónde eres?',
      en: 'where are you from?',
      example: '¿De dónde eres tú?',
    },
    { es: 'España', en: 'Spain', example: 'Mi amiga es de España.' },
    { es: 'México', en: 'Mexico', example: 'Vivo en México.' },
    {
      es: 'Estados Unidos',
      en: 'United States',
      example: 'Soy de Estados Unidos.',
    },
    { es: 'español/a', en: 'Spanish', example: 'Ella es española.' },
    { es: 'mexicano/a', en: 'Mexican', example: 'Mi profesor es mexicano.' },
    { es: 'estadounidense', en: 'American', example: 'Soy estadounidense.' },
    { es: 'país', en: 'country', example: '¿De qué país eres?' },
    { es: 'ciudad', en: 'city', example: 'Mi ciudad es grande.' },
  ],
  grammar_point: "Verb 'ser' for origins and nationalities",
  grammar_explanations: [
    {
      rule: "Use 'ser' to express origin and nationality. Forms: soy (I am), eres (you are). Nationalities agree with gender: español/española.",
      examples: [
        'Soy de Argentina.',
        '¿Eres mexicano?',
        'Ella es española.',
        'Somos de Colombia.',
      ],
    },
  ],
  speaking_tasks: [
    {
      type: 'substitution_drill',
      base: 'Soy de [país]',
      substitutions: ['España', 'México', 'Argentina', 'Colombia'],
      focus: 'fluency with country names',
    },
    {
      type: 'q_and_a',
      questions: ['¿De dónde eres?', '¿Eres español?', '¿De qué ciudad eres?'],
      guide_answers: ['Soy de...', 'Sí, soy.../No, soy...', 'Soy de...'],
      expected_patterns: ['Soy de + country/city', 'Soy + nationality'],
    },
    {
      type: 'conversation_building',
      turns: 4,
      starter: 'Hola, me llamo Ana. Soy de España.',
      prompts: [
        "Greet and ask where they're from",
        'Answer and ask about their city',
        'Respond and ask if they speak Spanish',
        'Conclude with nice to meet you',
      ],
    },
  ],
  comprehension_tasks: [
    {
      type: 'dialogue',
      audio: true,
      text: 'María: Hola, soy María. Soy de México, de la ciudad de Guadalajara. ¿Y tú?\nJohn: Mucho gusto, María. Me llamo John y soy estadounidense, de Nueva York.\nMaría: ¡Qué bien! ¿Hablas español?\nJohn: Un poco. Estoy aprendiendo.',
      questions: [
        { question: '¿De qué país es María?', answer: 'Es de México.' },
        { question: '¿De qué ciudad es María?', answer: 'Es de Guadalajara.' },
        {
          question: '¿De dónde es John?',
          answer: 'Es estadounidense, de Nueva York.',
        },
      ],
    },
  ],
  vocabulary_practice: [
    {
      type: 'matching',
      instructions: 'Match countries with nationalities',
      pairs: [
        { country: 'España', nationality: 'español/a' },
        { country: 'México', nationality: 'mexicano/a' },
        { country: 'Estados Unidos', nationality: 'estadounidense' },
      ],
    },
    {
      type: 'map_activity',
      instructions: "Click on countries and say 'Soy de...'",
      countries: ['España', 'México', 'Argentina', 'Colombia', 'Chile'],
    },
  ],
  cultural_note: 'Overview of Spanish-speaking countries and their locations',
  assessment: {
    type: 'dialogue_completion',
    context: 'At an international conference',
    gaps: 3,
    criteria: [
      'Correct use of ser',
      'Accurate country/nationality vocabulary',
      'Appropriate question formation',
    ],
  },
  skill_distribution: {
    speaking: 35,
    vocabulary: 30,
    grammar: 20,
    comprehension: 15,
  },
};

export default mockLesson2;
