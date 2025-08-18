// feedbackPhrases.ts

interface FeedbackPhrases {
  [key: string]: string[];
}

export const feedbackPhrases: FeedbackPhrases = {
  '0.25': [
    'Push harder!',
    'No mercy for mediocrity!',
    'Drag out that fluency!',
    'Sounds are conquerable!',
    'Make your mouth work!',
    'Get uncomfortable!',
    'Stop playing small!',
    'Show them strength!',
    'Become relentless!',
    'Get serious now!',
    'Stop negotiating!',
    'Demand miracles!',
    'Breakthrough effort required!',
    'Feed the intensity!',
    'Get uncomfortable!',
    'Stop limiting yourself!',
    'Pass the test!',
    'Unleash your warrior!',
    'Give it everything!',
    'Attack head-on!',
    'Prove it wrong!',
    'Turn up the intensity!',
    'Breakthrough waiting!',
    'Apply more pressure!',
    'Answer the call!',
  ],
  '0.5': [
    'Keep grinding!',
    'Tongue needs training!',
    'More reps needed!',
    'Practice makes permanent!',
    'Keep pushing boundaries!',
    "Rome wasn't built overnight!",
    'Keep drilling!',
    'Mouth needs coaching!',
    'Fluency is earned!',
    "Show them who's boss!",
    'Journey getting interesting!',
    'Keep feeding your brain!',
    'Speech muscles need workouts!',
    'Consistency beats intensity!',
    'Potential still untapped!',
    'Rewiring pathways!',
    'Evolution in progress!',
    'Challenge those habits!',
    'Breakthrough brewing!',
    'Patience and persistence!',
    'Still learning choreography!',
    'Pathways need traffic!',
    'Under construction!',
    'Hammer away!',
    'Trust the process!',
  ],
  '0.75': [
    'Getting closer!',
    'Mouth learning!',
    'Definitely improving!',
    'Right direction!',
    'Tongue adapting!',
    'Building habits!',
    'Slowly developing!',
    'Getting natural!',
    'Starting to click!',
    'Awareness growing!',
    'Skills evolving!',
    'Finding its way!',
    'Confidence building!',
    'Work showing!',
    'Instincts developing!',
    'Adapting well!',
    'Foundation stronger!',
    'Slowly improving!',
    'Accuracy increasing!',
    'Progressing nicely!',
    'Precision developing!',
    'Gradually improving!',
    'Awareness expanding!',
    'Rhythm emerging!',
    'Growing steadily!',
  ],
  '1.0': [
    "Now that's fluency!",
    'Accent level up!',
    'Nailed it!',
    'Sounding native!',
    'Your tongue caught up!',
    'Smooth as silk!',
    'Getting dangerous!',
    'Pronunciation game strong!',
    'Flawless delivery!',
    'Found your groove!',
    'Mastering those sounds!',
    'Confidence unlocked!',
    'Textbook perfect!',
    'Skills showing off!',
    'Serious dividends!',
    'Every word landed!',
    'Quantum leap forward!',
    'Speaking with authority!',
    'Phonemes behaving!',
    'Linguistic excellence!',
    'Seriously sophisticated!',
    'Proficiency on display!',
    'Precision perfected!',
    'Absolutely perfect!',
    'Earned some respect!',
  ],
};
export const getRandomFeedbackPhrase = (score: number): string => {
  let incrementKey: string;

  if (score >= 76) {
    incrementKey = '1.0';
  } else if (score >= 51) {
    incrementKey = '0.75';
  } else if (score >= 26) {
    incrementKey = '0.5';
  } else {
    incrementKey = '0.25';
  }

  const phrases = feedbackPhrases[incrementKey];
  if (phrases && phrases.length > 0) {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex];
  }
  return 'Keep going!';
};
