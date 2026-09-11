export interface SolutionResultMessages {
  title: string;
  text: string;
}

export const SOLUTION_CORRECT: SolutionResultMessages = {
  title: 'Puzzle solved!',
  text: 'Great job! You solved this puzzle correctly.',
};

export const SOLUTION_INCORRECT: SolutionResultMessages = {
  title: 'Not quite yet',
  text: 'The pieces don\'t form the target shape correctly. Keep trying!',
};
