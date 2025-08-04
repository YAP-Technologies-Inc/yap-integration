// Wordcard component
// This component displays a word and its example sentence in a card format.
// It is used to showcase learned vocabulary in the lesson section.
interface WordCardProps {
    word: string;
    sentence: string;
  }
  
  export default function WordCard({ word, sentence }: WordCardProps) {
    return (
      <div className="rounded-2xl bg-white shadow-md px-4 py-6 w-full max-w-xs text-center space-y-2">
        <div className="text-xs text-secondary border border-[#5C4B4B] rounded-full px-2 py-1 inline-block">
          {word}
        </div>
        <p className="text-md font-semibold text-secondary">{sentence}</p>
      </div>
    );
  }
  