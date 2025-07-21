// This component displays a grid of learned words with example sentences.
// Each word is shown with its corresponding sentence in a card format.
export default function LearnedWordGrid() {
  const learnedWords = [
    { word: 'work', sentence: 'I work best in the morning with coffee.' },
    {
      word: 'wallet',
      sentence: 'I stake tokens in my wallet to earn rewards.',
    },
    { word: 'earn', sentence: 'I learn English to earn crypto while I speak.' },
    {
      word: 'schedule',
      sentence: 'Let’s schedule a meeting to get the report.',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 pt-8">
      {learnedWords.map(({ word, sentence }) => (
        <div
          key={word}
          className="bg-white rounded-xl shadow-md px-4 py-6 w-full h-40 flex flex-col justify-start items-start"
        >
          <div className="w-full flex justify-center mb-2">
            <span className="text-xs border-2 border-gray-100 text-secondary px-3 py-1 rounded-full">
              {word}
            </span>
          </div>

          <p className="text-secondary font-bold text-lg">{sentence}</p>
        </div>
      ))}
    </div>
  );
}
