import * as React from 'react';
import { useState, useEffect, useCallback, Fragment } from 'react';
import { useTranslation } from 'next-i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';
import { defaultHeaders } from '@/lib/common';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from '@/components/shadcn/ui/form';
import { Input } from '@/components/shadcn/ui/input';
import { Textarea } from '@/components/shadcn/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/shadcn/ui/select';
import { Checkbox } from '@/components/shadcn/ui/checkbox';
import { Button } from '@/components/shadcn/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/shadcn/ui/dialog';
import { MultiSelect } from '@/components/shadcn/ui/multi-select';
import { MDEditor } from '@/components/shared/uiw/Markdown';
import {
  TeamCourseWithProgress,
  QuestionType,
  SingleChoiceQuestion,
  MultipleChoiceQuestion,
  OrderQuestion,
  TextQuestion,
  //   Team,
  //   Category,
  ApiResponse,
} from 'types';
import type { Team, Category } from '@prisma/client';
import { CourseContentType } from '@prisma/client';
import { courseTypes, questionTypes } from '@/lib/iap';
import {
  validateNumberField,
  range,
  createQuestion,
  validateCourse,
  validateQuestion,
} from '../services/createCourseService';
import { Loader2 } from 'lucide-react';

interface CreateCourseProps {
  teams: Team[];
  categories: Category[];
  selectedTeamCourse?: TeamCourseWithProgress | null;
  teamSlug: string;
  visible: boolean;
  setIsVisible: (v: boolean) => void;
  setCourseToEdit: React.Dispatch<any>;
  mutate: () => Promise<void>;
}

type CourseStageValues = {
  name: string;
  category: string;
  type: string;
  url?: string;
  description?: string;
  programContent?: string;
  teams: string[];
  estimatedTime?: number;
  thumbnailLink?: string;
};

type QuestionStageValues = {
  questionType: QuestionType;
  questionTitle: string;
  // dynamic answer fields depending on questionType
  [key: string]: any;
};

export default function CreateCourse2({
  teams,
  categories,
  selectedTeamCourse,
  teamSlug,
  visible,
  setIsVisible,
  setCourseToEdit,
  mutate,
}: CreateCourseProps) {
  const { t } = useTranslation('common');
  const selectedCourse = selectedTeamCourse?.course;

  const [courseState, setCourseState] = useState<any>(() => {
    if (!selectedCourse) return { questions: [] };
    return {
      ...selectedCourse,
      questions: selectedCourse.questions || [],
    };
  });

  const [stage, setStage] = useState<0 | 1>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const currentQuestion = selectedCourse?.questions?.[currentQuestionIndex];
  const [answersAmount, setAnswersAmount] = useState<number>(2);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const categoryOptions = categories.map((c) => ({
    label: c.name,
    value: c.id,
  }));

  // ========== 1) First Stage Form (Course Details) ==========
  const courseForm = useForm<CourseStageValues>({
    defaultValues: {
      name: selectedCourse?.name ?? '',
      category: selectedCourse?.categoryId ?? '',
      type: selectedCourse?.contentType ?? '',
      url: selectedCourse?.url ?? '',
      description: selectedCourse?.description ?? '',
      programContent: selectedCourse?.programContent ?? '',
      teams: [],
      estimatedTime: selectedCourse?.estimatedTime ?? undefined,
      thumbnailLink: selectedCourse?.thumbnail ?? '',
    },
    mode: 'onChange',
  });

  const courseType = courseForm.watch('type');

  // ========== 2) Second Stage Form (Question Builder) ==========
  const questionForm = useForm<QuestionStageValues>({
    mode: 'onChange',
  });

  const questionType = questionForm.watch('questionType');

  // Whenever we switch to stage 1, prefill answer fields if editing
  useEffect(() => {
    if (!currentQuestion) {
      questionForm.reset();
      return;
    }

    const newValues: QuestionStageValues = {
      questionType: currentQuestion.type,
      questionTitle: currentQuestion.question,
      // For TEXT:
      answer:
        currentQuestion.type === QuestionType.TEXT
          ? (currentQuestion as TextQuestion).answer
          : '',

      // For SINGLE/MULTIPLE:
      ...Object.fromEntries(
        (currentQuestion.type === QuestionType.SINGLE_CHOICE ||
        currentQuestion.type === QuestionType.MULTIPLE_CHOICE
          ? (
              currentQuestion as SingleChoiceQuestion | MultipleChoiceQuestion
            ).answers.map((ans, i) => [
              [`answer${i}`, ans.answer],
              [`isCorrect${i}`, ans.isCorrect],
            ])
          : []
        ).flat()
      ),

      // For ORDER:
      ...Object.fromEntries(
        (currentQuestion.type === QuestionType.ORDER
          ? (currentQuestion as OrderQuestion).answers.map((pair, i) => [
              [`answer${i}-term1`, pair.first],
              [`answer${i}-term2`, pair.second],
            ])
          : []
        ).flat()
      ),
    };

    questionForm.reset(newValues);
    if (currentQuestion.type === QuestionType.TEXT) {
      setAnswersAmount(1);
    } else {
      setAnswersAmount(
        (
          currentQuestion as
            | SingleChoiceQuestion
            | MultipleChoiceQuestion
            | OrderQuestion
        ).answers.length
      );
    }
  }, [currentQuestionIndex, stage]);

  const closeHandler = useCallback(() => {
    setIsVisible(false);
    setCourseToEdit(null);
    setStage(0);
  }, []);

  const createCourseStateWithQuestion = (
    courseState: any,
    questionObj: any
  ) => {
    const updated = { ...courseState };
    if (!updated.questions) updated.questions = [];

    if (selectedCourse && currentQuestion) {
      // Replace existing
      updated.questions[currentQuestionIndex] = questionObj;
    } else {
      // Append new
      updated.questions.push(questionObj);
    }

    return updated;
  };

  const saveCurrentQuestion = (data: QuestionStageValues) => {
    const questionObj = createQuestion(data, answersAmount);

    setCourseState((prev: any) => {
      return createCourseStateWithQuestion(prev, questionObj);
    });
  };

  const nextQuestionHandler = (data: QuestionStageValues) => {
    saveCurrentQuestion(data);
    questionForm.reset({
      questionType: questionTypes[0].value as QuestionType,
      questionTitle: '',
    });
    setAnswersAmount(2);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  // ========== Submission Handlers ==========
  const onCourseSubmit: SubmitHandler<CourseStageValues> = (data) => {
    const errors = validateCourse(data, Boolean(selectedCourse));
    if (errors) {
      return;
    }

    // Merge into courseState and move to question stage
    setCourseState((prev: any) => ({ ...prev, ...data }));
    setStage(1);
  };

  const saveCourseHandler = async (data: QuestionStageValues) => {
    // Final save: merge last question (if any) then POST/PUT
    const courseToSave = createCourseStateWithQuestion(
      courseState,
      createQuestion(data, answersAmount)
    );
    const method = selectedCourse ? 'PUT' : 'POST';
    const url = selectedCourse
      ? `/api/teams/${teamSlug}/iap/course/${selectedCourse.id}`
      : `/api/teams/${teamSlug}/iap/course/`;

    try {
      setIsSaving(true);
      const res = await fetch(url, {
        method,
        headers: defaultHeaders,
        body: JSON.stringify(courseToSave),
      });
      const json = (await res.json()) as ApiResponse<any>;

      if (!res.ok) {
        toast.error(json.error.message);
        return;
      }
      toast.success(t('iap-course-saved'));
      mutate();
      closeHandler();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (questionType === QuestionType.SINGLE_CHOICE) {
      // find & reset all the “isCorrect” flags
      const values = questionForm.getValues();
      Object.keys(values)
        .filter((k) => k.startsWith('isCorrect'))
        .forEach((checkbox) => {
          questionForm.resetField(checkbox, { defaultValue: false });
        });
    }
  }, [questionType, questionForm]);

  return (
    <Dialog open={visible} onOpenChange={closeHandler}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>{t('create-course-title')}</DialogTitle>
        </DialogHeader>

        {stage === 0 && (
          <Form {...courseForm}>
            {/* Course Name */}
            <FormField
              control={courseForm.control}
              name="name"
              rules={{ required: t('course-name') + ' is required.' }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t('course-name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('course-name')} {...field} />
                  </FormControl>
                  <FormMessage>
                    {fieldState.error && fieldState.error.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={courseForm.control}
              name="category"
              rules={{ required: t('category') + ' is required.' }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t('category')}</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('category')} />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage>
                    {fieldState.error && fieldState.error.message}
                  </FormMessage>
                  {!fieldState.error && (
                    <p className="text-xs text-muted-foreground">
                      {t('Please select from the list')}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Course Type */}
            <FormField
              control={courseForm.control}
              name="type"
              rules={{ required: t('course-type') + ' is required.' }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t('course-type')}</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                      }}
                      value={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('course-type')} />
                      </SelectTrigger>
                      <SelectContent>
                        {courseTypes.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage>
                    {fieldState.error && fieldState.error.message}
                  </FormMessage>
                  {!fieldState.error && (
                    <p className="text-xs text-muted-foreground">
                      {t('Please select from the list')}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Conditional URL or Description */}
            {courseType === CourseContentType.EMBEDDED_VIDEO && (
              <FormField
                control={courseForm.control}
                name="url"
                rules={{ required: t('video-url') + ' is required.' }}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{t('video-url')}</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage>
                      {fieldState.error && fieldState.error.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
            )}
            {courseType === CourseContentType.PRESENTATION_PDF && (
              <FormField
                control={courseForm.control}
                name="url"
                rules={{ required: t('presentation-url') + ' is required.' }}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{t('presentation-url')}</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage>
                      {fieldState.error && fieldState.error.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
            )}
            {courseType === CourseContentType.OPEN_TEXT && (
              <FormField
                control={courseForm.control}
                name="description"
                rules={{ required: t('description') + ' is required.' }}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{t('description')}</FormLabel>
                    <FormControl>
                      <MDEditor
                        value={field.value}
                        onChange={(val) => field.onChange(val)}
                      />
                    </FormControl>
                    <FormMessage>
                      {fieldState.error && fieldState.error.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
            )}

            {/* Program Content (optional) */}
            <FormField
              control={courseForm.control}
              name="programContent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('program-content')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('program-content')} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Teams (multi‐select) */}
            <FormField
              control={courseForm.control}
              name="teams"
              rules={
                selectedCourse
                  ? undefined
                  : { required: t('teams') + ' is required.' }
              }
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t('teams')}</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={teams.map((tc) => ({
                        label: tc.name,
                        value: tc.id,
                      }))}
                      defaultValue={field.value || []}
                      onValueChange={(vals) => field.onChange(vals)}
                      modalPopover={true}
                      disabled={Boolean(selectedCourse)}
                    />
                  </FormControl>
                  <FormMessage>
                    {fieldState.error && fieldState.error.message}
                  </FormMessage>
                  {!fieldState.error && (
                    <p className="text-xs text-muted-foreground">
                      {t('Please select from the list')}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Estimated Time */}
            <FormField
              control={courseForm.control}
              name="estimatedTime"
              rules={{
                validate: (v) =>
                  !v ||
                  validateNumberField(String(v)) ||
                  t('Only numbers allowed'),
              }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t('iap-estimated-label')}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 45" type="number" {...field} />
                  </FormControl>
                  <FormMessage>
                    {fieldState.error && fieldState.error.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Thumbnail Link */}
            <FormField
              control={courseForm.control}
              name="thumbnailLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('thumbnail-link')}</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Footer Buttons */}
            <DialogFooter className="flex justify-end space-x-2">
              <DialogClose asChild>
                <Button variant="outline">{t('close')}</Button>
              </DialogClose>
              <Button
                type="submit"
                onClick={courseForm.handleSubmit(onCourseSubmit)}
              >
                {t('next')}
              </Button>
            </DialogFooter>
          </Form>
        )}

        {stage === 1 && (
          <Form {...questionForm}>
            {/* Question Type */}
            <FormField
              control={questionForm.control}
              name="questionType"
              rules={{ required: t('question-type') + ' is required.' }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t('question-type')}</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('question-type')} />
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypes.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage>
                    {fieldState.error && fieldState.error.message}
                  </FormMessage>
                  {!fieldState.error && (
                    <p className="text-xs text-muted-foreground">
                      {t('Please select from the list')}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Question Title */}
            <FormField
              control={questionForm.control}
              name="questionTitle"
              rules={{ required: t('question-title') + ' is required.' }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t('question-title')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('question-title')} {...field} />
                  </FormControl>
                  <FormMessage>
                    {fieldState.error && fieldState.error.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            <hr className="border-t border-neutral-200" />

            <div className="w-4/5 mx-auto space-y-4">
              {/* SINGLE_CHOICE or MULTIPLE_CHOICE */}
              {(questionType === QuestionType.SINGLE_CHOICE ||
                questionType === QuestionType.MULTIPLE_CHOICE) &&
                range(answersAmount).map((idx) => {
                  return (
                    <Fragment key={`${currentQuestionIndex}-${idx}`}>
                      <FormField
                        control={questionForm.control}
                        name={`answer${idx}`}
                        rules={{
                          required: `${t('answer')} #${idx + 1} is required.`,
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{`${t('answer')} #${idx + 1}`}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={questionForm.control}
                        name={`isCorrect${idx}`}
                        render={({ field }) => (
                          <FormItem className="flex items-end space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(chk) => {
                                  if (
                                    questionType === QuestionType.SINGLE_CHOICE
                                  ) {
                                    // Uncheck all first
                                    range(answersAmount).forEach((j) => {
                                      questionForm.setValue(
                                        `isCorrect${j}`,
                                        false
                                      );
                                    });
                                  }
                                  field.onChange(chk);
                                }}
                              />
                            </FormControl>
                            <FormLabel htmlFor={`isCorrect${idx}`}>
                              {t('correct-answer')}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </Fragment>
                  );
                })}

              {/* ORDER */}
              {questionType === QuestionType.ORDER &&
                range(answersAmount).map((idx) => (
                  <div key={idx} className="space-y-2">
                    <span className="text-sm text-muted-foreground">
                      {`${t('Pair')} #${idx + 1}`}
                    </span>
                    <FormField
                      control={questionForm.control}
                      name={`answer${idx}-term1`}
                      rules={{ required: 'Required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>1.</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={questionForm.control}
                      name={`answer${idx}-term2`}
                      rules={{ required: 'Required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>2.</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                ))}

              {/* TEXT */}
              {questionType === QuestionType.TEXT && (
                <FormField
                  control={questionForm.control}
                  name="answer"
                  rules={{ required: t('answer') + ' is required.' }}
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>{t('answer')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage>
                        {fieldState.error && fieldState.error.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              )}

              {/* Add/Remove Answers */}
              {questionType && questionType !== QuestionType.TEXT && (
                <div className="flex justify-center space-x-2">
                  <Button
                    onClick={() => setAnswersAmount((a) => a + 1)}
                    size="sm"
                  >
                    {t('add-answer')}
                  </Button>
                  {answersAmount > 2 && (
                    <Button
                      onClick={() => {
                        // clear last answer fields
                        questionForm.unregister(`answer${answersAmount - 1}`);
                        questionForm.unregister(
                          `isCorrect${answersAmount - 1}`
                        );
                        setAnswersAmount((a) => a - 1);
                      }}
                      size="sm"
                    >
                      {t('remove-answer')}
                    </Button>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={closeHandler}>
                {t('close')}
              </Button>
              <Button
                onClick={() => {
                  const errs = validateQuestion(
                    questionForm.getValues(),
                    Boolean(selectedCourse)
                  );
                  if (errs) {
                    questionForm.handleSubmit(() => {})();
                  } else {
                    nextQuestionHandler(questionForm.getValues());
                  }
                }}
                variant="secondary"
              >
                {t('iap-next-question')}
              </Button>
              <Button
                type="submit"
                onClick={questionForm.handleSubmit(saveCourseHandler)}
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="animate-spin" />}
                {t('save')}
              </Button>
            </DialogFooter>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
