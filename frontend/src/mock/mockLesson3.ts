const mockLesson3 = {
  lesson_id: 'SPA1_003',
  title: 'Age and Birthday',
  duration_minutes: 10,
  level: 'A1',
  lesson_type: 'integrated',
  theme: 'Talking about age and birthdays',
  prerequisite_lessons: ['SPA1_002'],
  learning_objectives: [
    'Learn numbers 1-100 and months of the year',
    "Master the verb 'tener' for age",
    'Practice asking and stating age and birthdays',
    'Understand conversations about personal information',
  ],
  vocabulary_items: [
    { es: 'tengo', en: 'I have', example: 'Tengo veinte años.' },
    { es: 'años', en: 'years', example: '¿Cuántos años tienes?' },
    {
      es: '¿cuántos años tienes?',
      en: 'how old are you?',
      example: '¿Cuántos años tienes tú?',
    },
    { es: 'cumpleaños', en: 'birthday', example: 'Mi cumpleaños es en mayo.' },
    { es: 'enero', en: 'January', example: 'Nací en enero.' },
    { es: 'febrero', en: 'February', example: 'Febrero tiene 28 días.' },
    { es: 'marzo', en: 'March', example: 'La primavera empieza en marzo.' },
    { es: 'abril', en: 'April', example: 'Mi cumpleaños es el 15 de abril.' },
  ],
  grammar_point: "Verb 'tener' for age, numbers 1-100",
  grammar_explanations: [
    {
      rule: "Use 'tener' + number + años to express age. Tener forms: tengo (I have), tienes (you have). Numbers 1-31 for dates.",
      examples: [
        'Tengo veinticinco años.',
        '¿Cuántos años tienes?',
        'Mi cumpleaños es el 10 de marzo.',
        'Ella tiene treinta años.',
      ],
    },
  ],
  speaking_tasks: [
    {
      type: 'number_practice',
      range: '1-100',
      context: 'ages',
      activities: ['Count by tens', 'Random age practice', 'Birthday dates'],
    },
    {
      type: 'personal_information',
      prompts: ['Tengo ___ años', 'Mi cumpleaños es el ___', 'Nací en ___'],
      personalization: true,
    },
    {
      type: 'information_exchange',
      student_a_tasks: ['Ask age', 'Ask birthday', 'Ask birth month'],
      student_b_tasks: ['Answer with age', 'Give birthday date', 'Say birth month'],
      swap_roles: true,
    },
  ],
  comprehension_tasks: [
    {
      type: 'listening_exercise',
      audio: true,
      text: 'Entrevistador: Hola, ¿cómo te llamas y cuántos años tienes?\nLaura: Me llamo Laura y tengo diecinueve años.\nEntrevistador: ¿Cuándo es tu cumpleaños?\nLaura: Mi cumpleaños es el veintidós de julio.',
      questions: [
        {
          question: '¿Cuántos años tiene Laura?',
          answer: 'Tiene diecinueve años.',
        },
        {
          question: '¿Cuándo es su cumpleaños?',
          answer: 'Es el veintidós de julio.',
        },
        { question: '¿En qué mes es su cumpleaños?', answer: 'En julio.' },
      ],
    },
  ],
  vocabulary_practice: [
    {
      type: 'number_bingo',
      instructions: 'Listen to ages and mark your card',
      range: '15-35',
    },
    {
      type: 'calendar_activity',
      instructions: 'Point to months and say birthdays',
      practice: 'Mi cumpleaños es en...',
    },
  ],
  assessment: {
    type: 'speaking_card',
    task: 'Create an ID card introduction',
    include: ['name', 'origin', 'age', 'birthday'],
    time_limit: 60,
    criteria: ['Correct number pronunciation', 'Accurate use of tener', 'Complete date expression'],
  },
  skill_distribution: {
    speaking: 35,
    vocabulary: 30,
    grammar: 20,
    comprehension: 15,
  },
};

export default mockLesson3;
