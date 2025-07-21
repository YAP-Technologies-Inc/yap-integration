const mockLessonData = {
  lesson_id: 'lesson-spanish-a1.1-f7b3e1a0',
  language: 'Spanish',
  level: 'CEFR A1.1',
  focus: 'Vocabulary: Basic Greetings and Introductions',
  new_vocabulary: [
    {
      id: 'word-1',
      term: 'Hola',
      translation: 'Hello / Hi',
      difficulty: 1,
      examples: ['Hola, ¿cómo estás?', 'Hola, me llamo Ana.'],
    },
    {
      id: 'word-2',
      term: 'Adiós',
      translation: 'Goodbye',
      difficulty: 1,
      examples: ['Adiós, hasta mañana.', 'Adiós, gracias.'],
    },
    {
      id: 'word-3',
      term: 'Buenos días',
      translation: 'Good morning',
      difficulty: 1,
      examples: ['Buenos días, señor.', 'Buenos días a todos.'],
    },
    {
      id: 'word-4',
      term: 'Buenas tardes',
      translation: 'Good afternoon',
      difficulty: 1,
      examples: ['Buenas tardes, María.', 'Buenas tardes, ¿qué tal?'],
    },
    {
      id: 'word-5',
      term: 'Buenas noches',
      translation: 'Good evening / Good night',
      difficulty: 1,
      examples: ['Buenas noches, papá.', 'Buenas noches, que descanses.'],
    },
    {
      id: 'word-6',
      term: '¿Cómo estás?',
      translation: 'How are you? (informal)',
      difficulty: 1,
      examples: ['Hola Juan, ¿cómo estás?', '¿Cómo estás hoy?'],
    },
    {
      id: 'word-7',
      term: 'Estoy bien',
      translation: "I am well / I'm fine",
      difficulty: 1,
      examples: ['Estoy bien, gracias.', 'Sí, estoy bien.'],
    },
    {
      id: 'word-8',
      term: 'Gracias',
      translation: 'Thank you',
      difficulty: 1,
      examples: ['Gracias por la ayuda.', 'Muchas gracias.'],
    },
    {
      id: 'word-9',
      term: 'Me llamo...',
      translation: 'My name is...',
      difficulty: 1,
      examples: ['Hola, me llamo Carlos.', 'Me llamo Sofía.'],
    },
    {
      id: 'word-10',
      term: '¿Y tú?',
      translation: 'And you? (informal)',
      difficulty: 1,
      examples: ['Estoy bien, gracias. ¿Y tú?', 'Me llamo Pedro. ¿Y tú?'],
    },
  ],
  speaking_exercises: [
    {
      type: 'Repetition',
      prompt: 'Repeat the greetings and phrases after me:',
      items: [
        { question: 'Hola', example_answer: "(User repeats 'Hola')" },
        {
          question: 'Buenos días',
          example_answer: "(User repeats 'Buenos días')",
        },
        {
          question: 'Buenas tardes',
          example_answer: "(User repeats 'Buenas tardes')",
        },
        {
          question: 'Buenas noches',
          example_answer: "(User repeats 'Buenas noches')",
        },
        { question: 'Adiós', example_answer: "(User repeats 'Adiós')" },
        { question: 'Gracias', example_answer: "(User repeats 'Gracias')" },
      ],
      leveling_note: 'Focus on imitating the pronunciation.',
    },
    {
      type: 'Simple Q&A',
      prompt: 'Answer the questions using the new phrases:',
      items: [
        {
          question: '¿Cómo te llamas?',
          example_answer: 'Me llamo [Your Name].',
        },
        {
          question: '¿Cómo estás?',
          example_answer: 'Estoy bien, gracias. ¿Y tú?',
        },
      ],
      leveling_note:
        "Use 'Me llamo...' to say your name. Respond to '¿Cómo estás?' with 'Estoy bien, gracias. ¿Y tú?'",
    },
  ],
  review_points: [],
};

export default mockLessonData;
