const mockLessonb = {
    "lesson_id": "lesson-spanish-a1.1-c4e5d2b1",
    "language": "Spanish",
    "level": "CEFR A1.1",
    "focus": "Vocabulary: Numbers 0-5 and Asking Age",
    "new_vocabulary": [
      {
        "id": "word-11",
        "term": "cero",
        "translation": "zero",
        "difficulty": 1,
        "examples": [
          "El número es cero.",
          "Tengo cero problemas."
        ]
      },
      {
        "id": "word-12",
        "term": "uno",
        "translation": "one",
        "difficulty": 1,
        "examples": [
          "Tengo uno libro.",
          "Uno, dos, tres."
        ]
      },
      {
        "id": "word-13",
        "term": "dos",
        "translation": "two",
        "difficulty": 1,
        "examples": [
          "Hay dos gatos.",
          "Necesito dos papeles."
        ]
      },
      {
        "id": "word-14",
        "term": "tres",
        "translation": "three",
        "difficulty": 1,
        "examples": [
          "Son las tres.",
          "Quiero tres manzanas."
        ]
      },
      {
        "id": "word-15",
        "term": "cuatro",
        "translation": "four",
        "difficulty": 1,
        "examples": [
          "Tengo cuatro hermanos.",
          "La mesa tiene cuatro patas."
        ]
      },
       {
        "id": "word-16",
        "term": "cinco",
        "translation": "five",
        "difficulty": 1,
        "examples": [
          "Hay cinco sillas.",
          "Son cinco euros."
        ]
      },
      {
        "id": "word-17",
        "term": "¿Cuántos años tienes?",
        "translation": "How old are you? (informal)",
        "difficulty": 2,
        "examples": [
          "Hola, ¿cuántos años tienes?",
          "Pedro, ¿cuántos años tienes?"
        ]
      },
       {
        "id": "word-18",
        "term": "Tengo... años",
        "translation": "I am... years old",
        "difficulty": 2,
        "examples": [
          "Tengo cinco años.",
          "Yo tengo tres años."
        ]
      }
    ],
    "speaking_exercises": [
      {
        "type": "Repetition",
        "prompt": "Repeat the numbers after me:",
        "items": [
          {"question": "cero", "example_answer": "(User repeats 'cero')"},
          {"question": "uno", "example_answer": "(User repeats 'uno')"},
          {"question": "dos", "example_answer": "(User repeats 'dos')"},
          {"question": "tres", "example_answer": "(User repeats 'tres')"},
          {"question": "cuatro", "example_answer": "(User repeats 'cuatro')"},
          {"question": "cinco", "example_answer": "(User repeats 'cinco')"}
        ],
        "leveling_note": "Practice counting from 0 to 5."
      },
      {
        "type": "Simple Q&A",
        "prompt": "Answer the questions:",
        "items": [
          {"question": "¿Cómo estás?", "example_answer": "Estoy bien, gracias. ¿Y tú?"},
          {"question": "¿Cuántos años tienes?", "example_answer": "Tengo [Your Age] años."}
        ],
        "leveling_note": "Use 'Tengo... años' to state your age. Remember the greeting response from last lesson."
      },
       {
        "type": "Scenario",
        "prompt": "Greet someone and ask their name and age.",
        "items": [
          {"question": "Greet someone informally.", "example_answer": "Hola."},
          {"question": "Ask their name.", "example_answer": "¿Cómo te llamas?"},
          {"question": "Ask their age.", "example_answer": "¿Cuántos años tienes?"}
        ],
        "leveling_note": "Combine phrases you've learned."
      }
    ],
    "review_points": [
       "Greeting: Hola",
       "Asking how someone is: ¿Cómo estás?",
       "Responding: Estoy bien, gracias. ¿Y tú?",
       "Saying name: Me llamo..."
    ]
};

export default mockLessonb;      