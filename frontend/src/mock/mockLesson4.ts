const mockLesson4 = {
  lesson_id: 'SPA1_004',
  title: 'Family Members',
  duration_minutes: 10,
  level: 'A1',
  lesson_type: 'integrated',
  theme: 'Describing your family',
  prerequisite_lessons: ['SPA1_003'],
  learning_objectives: [
    'Learn 10 family member vocabulary words',
    'Master possessive adjectives (mi, tu, su)',
    'Practice describing family relationships',
    'Understand family descriptions',
  ],
  vocabulary_items: [
    { es: 'familia', en: 'family', example: 'Mi familia es grande.' },
    { es: 'padre', en: 'father', example: 'Mi padre se llama Roberto.' },
    { es: 'madre', en: 'mother', example: 'Mi madre es doctora.' },
    { es: 'hermano', en: 'brother', example: 'Tengo dos hermanos.' },
    {
      es: 'hermana',
      en: 'sister',
      example: 'Mi hermana estudia en la universidad.',
    },
    { es: 'hijo', en: 'son', example: 'Su hijo tiene cinco años.' },
    { es: 'hija', en: 'daughter', example: 'Tengo una hija.' },
    { es: 'abuelo', en: 'grandfather', example: 'Mi abuelo vive en el campo.' },
    { es: 'abuela', en: 'grandmother', example: 'Mi abuela cocina muy bien.' },
    {
      es: 'mi/tu/su',
      en: 'my/your/his-her',
      example: 'Mi familia, tu hermano, su madre.',
    },
  ],
  grammar_point: 'Possessive adjectives (mi, tu, su)',
  grammar_explanations: [
    {
      rule: 'Possessive adjectives agree with the noun in number: mi/mis (my), tu/tus (your), su/sus (his/her/their).',
      examples: [
        'Mi hermano y mis hermanas.',
        'Tu padre y tus abuelos.',
        'Su familia es pequeña.',
        'Sus hijos son estudiantes.',
      ],
    },
  ],
  speaking_tasks: [
    {
      type: 'vocabulary_activation',
      method: 'picture_description',
      topic: 'family tree',
      prompts: ['Point and name family members', 'Describe relationships', 'Use possessives'],
    },
    {
      type: 'sentence_building',
      patterns: ['Mi ___ se llama ___', 'Tengo ___ hermanos/as', 'Mi ___ tiene ___ años'],
      personalization: true,
    },
    {
      type: 'show_and_tell',
      topic: 'Describe your family',
      time_limit: 60,
      support: 'word bank',
      structure: ['Family size', 'Member names', 'Basic descriptions'],
    },
  ],
  comprehension_tasks: [
    {
      type: 'family_description',
      audio: true,
      text: 'Me llamo Carmen. Mi familia no es muy grande. Tengo un hermano que se llama Diego. Mi padre se llama José y mi madre se llama Isabel. También tengo dos abuelas, pero no tengo abuelos. Mi abuela María tiene 75 años.',
      questions: [
        {
          question: '¿Cuántos hermanos tiene Carmen?',
          answer: 'Tiene un hermano.',
        },
        {
          question: '¿Cómo se llama la madre de Carmen?',
          answer: 'Se llama Isabel.',
        },
        {
          question: '¿Cuántos años tiene la abuela María?',
          answer: 'Tiene 75 años.',
        },
      ],
    },
  ],
  vocabulary_practice: [
    {
      type: 'family_tree_completion',
      instructions: 'Complete the family tree with correct terms',
      relationships: ['padre', 'madre', 'hermano', 'hermana', 'abuelo', 'abuela'],
    },
    {
      type: 'possessive_practice',
      instructions: "Change from 'mi' to 'tu' and 'su'",
      sentences: ['Mi padre es alto.', 'Mi familia vive aquí.', 'Mis hermanos estudian.'],
    },
  ],
  assessment: {
    type: 'oral_presentation',
    topic: 'Mi familia',
    duration: 30,
    elements: [
      'At least 5 family members',
      'Names of 3 members',
      'Ages of 2 members',
      'Use of possessives',
    ],
    criteria: [
      'Correct vocabulary use',
      'Accurate possessive adjectives',
      'Clear pronunciation',
      'Logical organization',
    ],
  },
  skill_distribution: {
    speaking: 40,
    vocabulary: 30,
    grammar: 15,
    comprehension: 15,
  },
};
export default mockLesson4;
