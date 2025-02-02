import { useState, useEffect, ChangeEvent } from 'react';
import Textfield from '@atlaskit/textfield';
import Select from '@atlaskit/select';
import { Checkbox } from '@atlaskit/checkbox';
import { shuffleArray } from '../services/passCourseService';
import type {
  SingleChoiceQuestion,
  MultipleChoiceQuestion,
  OrderQuestion,
  TextQuestion,
  Question,
} from 'types';
import { QuestionType } from 'types';

const SingleChoiseQuestion = ({
  question,
  onAnswerUpdate,
}: {
  question: SingleChoiceQuestion;
  onAnswerUpdate: (answer: any) => void;
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    onAnswerUpdate(selectedAnswer);
  }, [selectedAnswer]);

  return (
    <>
      <p className="text-xl font-semibold mb-2">{question.question}</p>
      {question.answers.map(({ answer }, index) => (
        <div className="flex m-2" key={index}>
          <Checkbox
            onChange={(e) => {
              const isChecked = e.target.checked;
              isChecked ? setSelectedAnswer(answer) : setSelectedAnswer(null);
            }}
            isChecked={Boolean(selectedAnswer === answer)}
          />
          <span>{answer}</span>
        </div>
      ))}
    </>
  );
};

const MultipleChoiseQuestion = ({
  question,
  onAnswerUpdate,
}: {
  question: MultipleChoiceQuestion;
  onAnswerUpdate: (answer: any) => void;
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string[] | null>(null);

  useEffect(() => {
    onAnswerUpdate(selectedAnswer);
  }, [selectedAnswer]);

  return (
    <>
      <p className="text-xl font-semibold mb-2">{question.question}</p>
      <p className="text-xs font-light">Multiple options</p>
      {question.answers.map(({ answer }) => (
        <div className="flex m-2">
          <Checkbox
            onChange={(e) => {
              const isChecked = e.target.checked;
              isChecked
                ? setSelectedAnswer((prev) =>
                    prev ? [...prev, answer] : [answer]
                  )
                : setSelectedAnswer((prev) =>
                    prev ? prev.filter((item) => item !== answer) : null
                  );
            }}
            isChecked={Boolean(selectedAnswer?.find((item) => item === answer))}
          />
          <span>{answer}</span>
        </div>
      ))}
    </>
  );
};

const OrderQuestion = ({
  question,
  onAnswerUpdate,
}: {
  question: OrderQuestion;
  onAnswerUpdate: (answer: any) => void;
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<
    { first: string; second: string | null }[]
  >(question.answers.map((answer) => ({ ...answer, second: null })));
  const [shuffledOptions, setShuffledOptions] = useState<
    { label: string; value: string }[]
  >([]);

  // Shuffle options only once when component mounts
  useEffect(() => {
    const shuffled = shuffleArray(
      question.answers.map(({ second }) => ({ label: second, value: second }))
    );
    setShuffledOptions(shuffled);
  }, [question.answers]);

  useEffect(() => {
    onAnswerUpdate(selectedAnswer);
  }, [selectedAnswer]);

  return (
    <>
      <p className="text-xl font-semibold mb-2">{question.question}</p>
      {question.answers.map(({ first }, index) => (
        <div key={index} className="grid grid-cols-3 gap-4 items-center mb-2">
          <span className="col-span-1">
            {index}. {first}
          </span>
          <Select
            className="col-span-1"
            // Hide selected options
            options={shuffledOptions.filter(
              (option) =>
                !selectedAnswer.find((item) => item.second === option.value)
            )}
            onChange={(option) => {
              if (option) {
                const updated = [...selectedAnswer];
                updated[index] = { first, second: option.value };
                setSelectedAnswer(updated);
              }
            }}
          />
        </div>
      ))}
    </>
  );
};

const TextQuestion = ({
  question,
  onAnswerUpdate,
}: {
  question: TextQuestion;
  onAnswerUpdate: (answer: any) => void;
}) => {
  const [answerInput, setAnswerInput] = useState<string | null>(null);

  useEffect(() => {
    onAnswerUpdate(answerInput);
  }, [answerInput]);

  return (
    <>
      <p className="text-xl font-semibold mb-2">{question.question}</p>
      <Textfield
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setAnswerInput(e.target.value)
        }
      />
    </>
  );
};

const QuestionRenderer = ({
  question,
  onAnswerUpdate,
}: {
  question: Question;
  onAnswerUpdate: (answer: any) => void;
}) => {
  switch (question.type) {
    case QuestionType.SINGLE_CHOICE:
      return (
        <SingleChoiseQuestion
          question={question}
          onAnswerUpdate={onAnswerUpdate}
        />
      );
    case QuestionType.MULTIPLE_CHOICE:
      return (
        <MultipleChoiseQuestion
          question={question}
          onAnswerUpdate={onAnswerUpdate}
        />
      );
    case QuestionType.ORDER:
      return (
        <OrderQuestion question={question} onAnswerUpdate={onAnswerUpdate} />
      );
    case QuestionType.TEXT:
      return (
        <TextQuestion question={question} onAnswerUpdate={onAnswerUpdate} />
      );
    default:
      return <p>unknown</p>;
  }
};

export default QuestionRenderer;
