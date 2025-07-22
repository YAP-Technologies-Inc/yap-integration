const mockDailyQuiz = {
  quiz: [
    {
      question_id: 'Q1',
      lesson_id: 'SPA1_002',
      type: 'speaking',
      task: 'Role-play',
      prompt:
        'Role-play a conversation with a partner where you ask "¿De dónde eres?" and follow up by asking about their nationality. Then respond with your own origin and nationality using complete sentences.',
      expected_phrases: [
        '¿De dónde eres?',
        '¿Eres mexicano/a?',
        'Soy de [país] y soy [nacionalidad].',
      ],
    },
    {
      question_id: 'Q2',
      lesson_id: 'SPA1_004',
      type: 'speaking',
      task: 'Oral presentation',
      prompt:
        'Describe your immediate family in a 45-second monologue. Include at least three family members, use possessive adjectives (mi, tu, su), and name each person.',
      criteria: [
        'Use at least three possessive adjectives correctly',
        'Name three family members',
        'Speak for at least 45 seconds',
      ],
    },
    {
      question_id: 'Q3',
      lesson_id: 'SPA1_003',
      type: 'writing',
      task: 'Sentence construction',
      prompt:
        'Write five sentences stating your age and birthday. Use the verb "tener" and include the month in each sentence. For example: "Tengo 25 años. Mi cumpleaños es el 14 de julio."',
      requirements: [
        'Five sentences total',
        'Each uses "tener" correctly',
        'Each includes a month',
      ],
    },
    {
      question_id: 'Q4',
      lesson_id: 'SPA1_005',
      type: 'writing',
      task: 'Mini-dialogue',
      prompt:
        'Write a three-exchange dialogue between two friends. One asks "¿Cómo estás?" in each exchange; the other responds with different emotional states and adjective agreement.',
      requirements: [
        'Three exchanges',
        'Use "¿Cómo estás?" each time',
        'Different adjective in each response',
      ],
    },
    {
      question_id: 'Q5',
      lesson_id: 'SPA1_001',
      type: 'vocab_matching',
      terms: [
        'hola',
        'buenas noches',
        'me llamo',
        '¿cómo te llamas?',
        'mucho gusto',
        'encantado/a',
      ],
      definitions: [
        'Nice to meet you',
        'Good evening/night',
        'What is your name?',
        'Hello',
        'My name is',
        'Pleased (to meet you)',
      ],
      correct_matches: {
        hola: 'Hello',
        'buenas noches': 'Good evening/night',
        'me llamo': 'My name is',
        '¿cómo te llamas?': 'What is your name?',
        'mucho gusto': 'Nice to meet you',
        'encantado/a': 'Pleased (to meet you)',
      },
    },
  ],
};
export default mockDailyQuiz;
