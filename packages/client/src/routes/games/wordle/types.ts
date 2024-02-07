export type GameState = {
  guesses: string[];
  answers: string[];
  answer: string | null;
  badGuess: boolean;
};
