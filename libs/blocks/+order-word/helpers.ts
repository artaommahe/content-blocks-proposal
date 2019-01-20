import { TOrderWordAnswer } from './interface';

// TODO: (?) store answers items with isCorrect
export function addIsCorrectToItems<T extends { id: string }>(
  items: T[],
  answers: TOrderWordAnswer[],
  correctAnswer: string[]
): (T & { isCorrect: boolean | null })[] {
  const previousAnswerValue = answers[answers.length - 2] ? answers[answers.length - 2].value : null;
  const currentAnswerValue = answers[answers.length - 1] ? answers[answers.length - 1].value : [];

  let orderedItems = items;

  if (currentAnswerValue.length) {
    orderedItems = currentAnswerValue.map(id => items.find(item => item.id === id)!);
  }

  let hasWrongItem = false;
  let newCorrectWasSet = false;
  let lastCorrectIndex = -1;

  return orderedItems.map((item, index) => {
    let isCorrect: boolean | null = null;

    if (
      currentAnswerValue.length
      && !hasWrongItem
      && (index === correctAnswer.indexOf(item.id))
      && (index - lastCorrectIndex === 1)
    ) {
      isCorrect = true;
      lastCorrectIndex = index;

      if (!previousAnswerValue || (index !== previousAnswerValue.indexOf(item.id))) {
        newCorrectWasSet = true;
      }
    }
    else if (
      currentAnswerValue.length
      && !hasWrongItem
      && !newCorrectWasSet
      && (index !== correctAnswer.indexOf(item.id))
    ) {
      isCorrect = false;
      hasWrongItem = true;
    }

    return <T & { isCorrect: boolean | null }> { ...(<Object> item), isCorrect };
  });
}
