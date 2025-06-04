'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import {
  Checkbox,
} from '@/components/shadcn/ui/checkbox';
import {
  Input
} from '@/components/shadcn/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/shadcn/ui/select';
import { Label } from '@/components/shadcn/ui/label';

import { shuffleArray } from '../services/passCourseService';
import type {
  SingleChoiceQuestion,
  MultipleChoiceQuestion,
  OrderQuestion,
  TextQuestion,
  Question,
} from 'types';
import { QuestionType } from 'types';

const SingleChoiceQuestion = ({
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
      <Label className="text-xl font-semibold mb-2">{question.question}</Label>
      {question.answers.map(({ answer }, index) => (
        <div className="flex items-center gap-2 mb-2" key={index}>
          <Checkbox
            id={`single-${index}`}
            checked={selectedAnswer === answer}
            onCheckedChange={(checked) => {
              setSelectedAnswer(checked ? answer : null);
            }}
          />
          <Label htmlFor={`single-${index}`}>{answer}</Label>
        </div>
      ))}
    </>
  );
};

const MultipleChoiceQuestion = ({
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
      <Label className="text-xl font-semibold mb-1">{question.question}</Label>
      <p className="text-xs font-light mb-2">Multiple options</p>
      {question.answers.map(({ answer }, index) => (
        <div className="flex items-center gap-2 mb-2" key={index}>
          <Checkbox
            id={`multi-${index}`}
            checked={selectedAnswer?.includes(answer) ?? false}
            onCheckedChange={(checked) => {
              setSelectedAnswer((prev) => {
                if (checked) {
                  return prev ? [...prev, answer] : [answer];
                } else {
                  return prev ? prev.filter((item) => item !== answer) : null;
                }
              });
            }}
          />
          <Label htmlFor={`multi-${index}`}>{answer}</Label>
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
      <Label className="text-xl font-semibold mb-2">{question.question}</Label>
      {question.answers.map(({ first }, index) => (
        <div key={index} className="grid grid-cols-3 gap-4 items-center mb-2">
          <span className="col-span-1">
            {index + 1}. {first}
          </span>
          <Select
            value={selectedAnswer[index]?.second ?? ''}
            onValueChange={(val) => {
              const updated = [...selectedAnswer];
              updated[index] = { first, second: val === "__clear__" ? null : val };
              setSelectedAnswer(updated);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose" >
                {selectedAnswer[index]?.second ?? ''}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__clear__">— Clear selection —</SelectItem>
              {shuffledOptions
                .filter(
                  (option) =>
                    !selectedAnswer.find((item) => item.second === option.value)
                )
                .map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
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
      <Label className="text-xl font-semibold mb-2">{question.question}</Label>
      <Input
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
        <SingleChoiceQuestion
          question={question}
          onAnswerUpdate={onAnswerUpdate}
        />
      );
    case QuestionType.MULTIPLE_CHOICE:
      return (
        <MultipleChoiceQuestion
          question={question}
          onAnswerUpdate={onAnswerUpdate}
        />
      );
    case QuestionType.ORDER:
      return (
        <OrderQuestion
          question={question}
          onAnswerUpdate={onAnswerUpdate}
        />
      );
    case QuestionType.TEXT:
      return (
        <TextQuestion
          question={question}
          onAnswerUpdate={onAnswerUpdate}
        />
      );
    default:
      return <p>Unknown question type.</p>;
  }
};

export default QuestionRenderer;
