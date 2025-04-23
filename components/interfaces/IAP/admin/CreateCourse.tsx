import React, {
  useState,
  useCallback,
  useEffect,
  Fragment,
  Dispatch,
  SetStateAction,
} from 'react';
import toast from 'react-hot-toast';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import AtlaskitButton, { LoadingButton } from '@atlaskit/button';
import Select, { ValueType } from '@atlaskit/select';
import Form, {
  Field,
  CheckboxField,
  ErrorMessage,
  HelperMessage,
} from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import TextArea from '@atlaskit/textarea';
import { Checkbox } from '@atlaskit/checkbox';
import { defaultHeaders } from '@/lib/common';
import {
  ApiResponse,
  MultipleChoiceQuestion,
  OrderQuestion,
  QuestionType,
  SingleChoiceQuestion,
  TeamCourseWithProgress,
  TextQuestion,
} from 'types';
import { WithoutRing } from 'sharedStyles';
import { courseTypes, questionTypes } from '@/lib/iap';
import {
  validateNumberField,
  range,
  createQuestion,
  validateCourse,
  validateQuestion,
} from '../services/createCourseService';
import { Category, CourseContentType, Team } from '@prisma/client';
import { MDEditor } from '@/components/shared/uiw/Markdown';

const CreateCourse = ({
  teams,
  categories,
  selectedTeamCourse,
  teamSlug,
  visible,
  setIsVisible,
  setCourseToEdit,
  mutate,
}: {
  teams: Team[];
  categories: Category[];
  selectedTeamCourse?: TeamCourseWithProgress | null;
  teamSlug: string;
  visible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  setCourseToEdit: React.Dispatch<any>;
  mutate: () => Promise<void>;
}) => {
  const selectedCourse = selectedTeamCourse?.course;

  const { t } = useTranslation('common');

  const [stage, setStage] = useState<number>(0);
  const [course, setCourse] = useState<any>({});

  const [courseType, setCourseType] = useState<string | null>(null);
  const [questionType, setQuestionType] = useState<QuestionType | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const currentQuestion = selectedCourse?.questions?.[currentQuestionIndex];
  const [answersAmount, setAnswersAmount] = useState<number>(2);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const categoryOptions = categories.map(({ id, name }) => ({
    label: name,
    value: id,
  }));

  const closeHandler = useCallback(() => {
    setIsVisible(false);
    setCourseToEdit(null);
    setCurrentQuestionIndex(0);
  }, []);

  const resetForm = (nativeReset: any, resetCallback: any) => {
    nativeReset();
    resetCallback();
  };

  const saveCurrentQuestion = (formData: any) => {
    if (!formData.questionTitle && !formData.questionType) {
      return course;
    }
    const question = createQuestion(formData, answersAmount);
    const updatedCourse = { ...course };
    if (!updatedCourse.questions) {
      updatedCourse.questions = [];
    }
    updatedCourse.questions.push(question);
    setCourse(updatedCourse);
    return updatedCourse;
  };

  const nextQuestionHandler = (formData: any, reset: any) => {
    // It only executes when form was successfully passed the validation by onSubmit handler
    saveCurrentQuestion(formData);
    resetForm(reset, () => {
      setAnswersAmount(2);
      setQuestionType(null);
      setCurrentQuestionIndex((prev) => prev + 1);
    });
  };

  const saveCourseHandler = async (formData: any) => {
    try {
      setIsSaving(true);
      const courseToSave = saveCurrentQuestion(formData);

      //TODO: use selectedTeamCourse.id in route
      const { method, url } = selectedCourse
        ? {
            method: 'PUT',
            url: `/api/teams/${teamSlug}/iap/course/${selectedCourse.id}`,
          }
        : { method: 'POST', url: `/api/teams/${teamSlug}/iap/course/` };

      const response = await fetch(url, {
        method,
        headers: defaultHeaders,
        body: JSON.stringify(courseToSave),
      });

      const json = (await response.json()) as ApiResponse<any>;

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      toast.success(t('iap-course-saved'));
      mutate();
      closeHandler();
    } catch (e) {
      //TODO: catch error
    } finally {
      setIsSaving(false);
    }
  };

  // onSubmit function uses only for native validation on current step
  const onSubmit = async (formData: any) => {
    if (stage === 0) {
      const courseValidationErrors = validateCourse(
        formData,
        Boolean(selectedCourse)
      );

      if (courseValidationErrors) {
        return courseValidationErrors;
      }

      setCourse((prev) => ({ ...prev, ...formData }));
      return setStage(1);
    }

    if (stage === 1) {
      const errors = validateQuestion(formData, false);
      if (errors) {
        return errors;
      }
    }
  };

  // Prefill question when editing the course
  useEffect(() => {
    if (!selectedCourse) {
      return;
    }

    if (!currentQuestion) {
      // setQuestionType(null)
      // setAnswersAmount(2)
      return;
    }

    const currentQuestionType = currentQuestion.type;

    setQuestionType(currentQuestionType);

    if (currentQuestionType === QuestionType.TEXT) {
      return;
    }

    setAnswersAmount(currentQuestion.answers.length);
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (selectedCourse) {
      setCourseType(selectedCourse.contentType);
    }
  }, [selectedCourse]);

  return (
    <Modal open={visible}>
      <Form onSubmit={onSubmit}>
        {(formData) => {
          const { formProps, getState, setFieldValue, reset } = formData;
          return (
            <form {...formProps}>
              <Modal.Header className="font-bold">
                {t('create-course-title')}
              </Modal.Header>
              <Modal.Body>
                {stage === 0 && (
                  <>
                    <Field
                      aria-required={true}
                      name="name"
                      label={t('course-name')}
                      defaultValue={selectedCourse?.name || ''}
                      isRequired
                    >
                      {({ fieldProps, error }) => (
                        <>
                          <TextField autoComplete="off" {...fieldProps} />
                          {error && <ErrorMessage>{error}</ErrorMessage>}
                        </>
                      )}
                    </Field>
                    <Field<ValueType<{ label: string; value: string }>>
                      aria-required={true}
                      name="category"
                      label={t('category')}
                      defaultValue={
                        categoryOptions.find(
                          ({ value }) => value === selectedCourse?.categoryId
                        ) || null
                      }
                      isRequired
                    >
                      {({ fieldProps: { id, ...rest }, error }) => (
                        <Fragment>
                          <WithoutRing>
                            <Select
                              inputId={id}
                              {...rest}
                              options={categoryOptions}
                              required
                            />
                            {error ? (
                              <ErrorMessage>{error}</ErrorMessage>
                            ) : (
                              <HelperMessage>
                                Please select from the list
                              </HelperMessage>
                            )}
                          </WithoutRing>
                        </Fragment>
                      )}
                    </Field>
                    <Field<ValueType<{ label: string; value: string }>>
                      aria-required={true}
                      name="type"
                      label={t('course-type')}
                      defaultValue={
                        courseTypes.find(
                          ({ value }) => value === selectedCourse?.contentType
                        ) || null
                      }
                      isRequired
                    >
                      {({ fieldProps: { id, onChange, ...rest }, error }) => (
                        <Fragment>
                          <WithoutRing>
                            <Select
                              inputId={id}
                              {...rest}
                              options={courseTypes}
                              onChange={(option) => {
                                setCourseType(option?.value || null);
                                onChange(option);
                              }}
                              required
                            />
                            {error ? (
                              <ErrorMessage>{error}</ErrorMessage>
                            ) : (
                              <HelperMessage>
                                Please select from the list
                              </HelperMessage>
                            )}
                          </WithoutRing>
                        </Fragment>
                      )}
                    </Field>
                    {(() => {
                      switch (courseType) {
                        case CourseContentType.EMBEDDED_VIDEO:
                          return (
                            <Field
                              aria-required={true}
                              name="url"
                              label={t('video-url')}
                              defaultValue={selectedCourse?.url || ''}
                              isRequired
                            >
                              {({ fieldProps, error }) => (
                                <>
                                  <TextField
                                    autoComplete="off"
                                    {...fieldProps}
                                  />
                                  {error && (
                                    <ErrorMessage>{error}</ErrorMessage>
                                  )}
                                </>
                              )}
                            </Field>
                          );
                        case CourseContentType.PRESENTATION_PDF:
                          return (
                            <Field
                              aria-required={true}
                              name="url"
                              label={t('presentation-url')}
                              defaultValue={selectedCourse?.url || ''}
                              isRequired
                            >
                              {({ fieldProps, error }) => (
                                <>
                                  <TextField
                                    autoComplete="off"
                                    {...fieldProps}
                                  />
                                  {error && (
                                    <ErrorMessage>{error}</ErrorMessage>
                                  )}
                                </>
                              )}
                            </Field>
                          );
                        case CourseContentType.OPEN_TEXT:
                          return (
                            <Field
                              aria-required={true}
                              name="description"
                              label={t('description')}
                              defaultValue={selectedCourse?.description || ''}
                              isRequired
                            >
                              {({ fieldProps, error }: any) => (
                                <>
                                  <MDEditor
                                    onChange={(e) => {
                                      setFieldValue('description', e);
                                    }}
                                    value={fieldProps.value}
                                  />
                                  {error && (
                                    <ErrorMessage>{error}</ErrorMessage>
                                  )}
                                </>
                              )}
                            </Field>
                          );
                        default:
                          return null;
                      }
                    })()}
                    <Field
                      name="programContent"
                      label={t('program-content')}
                      defaultValue={selectedCourse?.programContent}
                    >
                      {({ fieldProps }: any) => (
                        <Fragment>
                          <TextArea autoComplete="off" {...fieldProps} />
                        </Fragment>
                      )}
                    </Field>
                    <Field<ValueType<{ label: string; value: string }, true>>
                      aria-required={true}
                      name="teams"
                      label={t('teams')}
                      isDisabled={Boolean(selectedCourse)}
                      aria-disabled={true}
                      isRequired
                    >
                      {({ fieldProps: { id, ...rest }, error }) => (
                        <Fragment>
                          <WithoutRing>
                            <Select
                              inputId={id}
                              {...rest}
                              options={teams.map(({ id, name }) => ({
                                label: name,
                                value: id,
                              }))}
                              isMulti
                              required
                            />
                            {error ? (
                              <ErrorMessage>{error}</ErrorMessage>
                            ) : (
                              <HelperMessage>
                                Please select from the list
                              </HelperMessage>
                            )}
                          </WithoutRing>
                        </Fragment>
                      )}
                    </Field>
                    <Field
                      name="estimatedTime"
                      label={t('iap-estimated-label')}
                      validate={async (value) => {
                        if (!value || validateNumberField(String(value))) {
                          return undefined;
                        }
                        return 'Only numbers allowed';
                      }}
                      defaultValue={selectedCourse?.estimatedTime || undefined}
                    >
                      {({ fieldProps, error }) => (
                        <Fragment>
                          <TextField autoComplete="off" {...fieldProps} />
                          {error && <ErrorMessage>{error}</ErrorMessage>}
                        </Fragment>
                      )}
                    </Field>
                    <Field
                      name="thumbnailLink"
                      label={t('thumbnail-link')}
                      defaultValue={selectedCourse?.thumbnail || undefined}
                    >
                      {({ fieldProps }) => (
                        <TextField autoComplete="off" {...fieldProps} />
                      )}
                    </Field>
                  </>
                )}
                {stage === 1 && (
                  <>
                    <Field<ValueType<{ label: string; value: QuestionType }>>
                      aria-required={true}
                      name="questionType"
                      label={t('question-type')}
                      defaultValue={
                        questionTypes.find(
                          ({ value }) => currentQuestion?.type === value
                        ) || null
                      }
                      isRequired
                    >
                      {({ fieldProps: { id, onChange, ...rest }, error }) => (
                        <Fragment>
                          <WithoutRing>
                            <Select
                              inputId={id}
                              {...rest}
                              options={questionTypes}
                              onChange={(option) => {
                                setQuestionType(option?.value || null);
                                //TODO: uncheck checkboxes
                                onChange(option);
                              }}
                              required
                            />
                            {error ? (
                              <ErrorMessage>{error}</ErrorMessage>
                            ) : (
                              <HelperMessage>
                                Please select from the list
                              </HelperMessage>
                            )}
                          </WithoutRing>
                        </Fragment>
                      )}
                    </Field>
                    <Field
                      aria-required={true}
                      name="questionTitle"
                      label={t('question-title')}
                      defaultValue={currentQuestion?.question || ''}
                      isRequired
                    >
                      {({ fieldProps, error }) => (
                        <>
                          <TextField autoComplete="off" {...fieldProps} />
                          {error && <ErrorMessage>{error}</ErrorMessage>}
                        </>
                      )}
                    </Field>
                    <hr />
                    <div className="w-4/5 mx-auto">
                      {(questionType === QuestionType.SINGLE_CHOICE ||
                        questionType === QuestionType.MULTIPLE_CHOICE) &&
                        range(answersAmount).map((index) => {
                          console.log('aa', {
                            currentQuestionIndex,
                            currentQuestion,
                          });
                          return (
                            <>
                              <Field
                                aria-required={true}
                                name={'answer' + index}
                                label={`${t('answer')} #${index + 1}`}
                                defaultValue={
                                  (
                                    currentQuestion as
                                      | SingleChoiceQuestion
                                      | MultipleChoiceQuestion
                                  )?.answers?.[index]?.answer || ''
                                }
                                isRequired
                              >
                                {({ fieldProps }) => (
                                  <TextField
                                    autoComplete="off"
                                    {...fieldProps}
                                  />
                                )}
                              </Field>
                              <CheckboxField
                                name={`isCorrect${index}`}
                                defaultIsChecked={
                                  (
                                    currentQuestion as
                                      | SingleChoiceQuestion
                                      | MultipleChoiceQuestion
                                  )?.answers?.[index]?.isCorrect || false
                                }
                              >
                                {({ fieldProps, error }) => (
                                  <>
                                    <Checkbox
                                      {...fieldProps}
                                      label="Correct answer"
                                      onChange={(value) => {
                                        if (questionType === 'checkboxsingle') {
                                          // Uncheck all the previous checkboxes
                                          range(answersAmount).forEach(
                                            (index) => {
                                              setFieldValue(
                                                `isCorrect${index}`,
                                                false
                                              );
                                            }
                                          );
                                        }
                                        setFieldValue(
                                          `isCorrect${index}`,
                                          value.target.checked
                                        );
                                      }}
                                    />
                                    {error && (
                                      <ErrorMessage>{error}</ErrorMessage>
                                    )}
                                  </>
                                )}
                              </CheckboxField>
                            </>
                          );
                        })}
                      {questionType === QuestionType.ORDER &&
                        range(answersAmount).map((index) => (
                          <div className="mt-4" key={index}>
                            <span className="label-text-alt">
                              Pair №{index + 1}
                            </span>
                            <Field
                              aria-required={true}
                              name={`answer${index}-term1`}
                              label="1."
                              defaultValue={
                                (currentQuestion as OrderQuestion)?.answers?.[
                                  index
                                ]?.first
                              }
                              isRequired
                            >
                              {({ fieldProps }) => (
                                <TextField autoComplete="off" {...fieldProps} />
                              )}
                            </Field>
                            <Field
                              aria-required={true}
                              name={`answer${index}-term2`}
                              label="2."
                              defaultValue={
                                (currentQuestion as OrderQuestion)?.answers?.[
                                  index
                                ]?.second
                              }
                              isRequired
                            >
                              {({ fieldProps }) => (
                                <TextField autoComplete="off" {...fieldProps} />
                              )}
                            </Field>
                          </div>
                        ))}
                      {questionType === QuestionType.TEXT && (
                        <Field
                          aria-required={true}
                          name={'answer'}
                          label={t('answer')}
                          defaultValue={
                            (currentQuestion as TextQuestion)?.answer || ''
                          }
                          isRequired
                        >
                          {({ fieldProps, error }) => (
                            <>
                              <TextField autoComplete="off" {...fieldProps} />
                              {error && <ErrorMessage>{error}</ErrorMessage>}
                            </>
                          )}
                        </Field>
                      )}
                      {questionType && questionType !== QuestionType.TEXT && (
                        <div className="flex justify-center">
                          <AtlaskitButton
                            onClick={() => {
                              console.log('add state', getState());
                              setAnswersAmount((prev) => prev + 1);
                            }}
                            appearance="primary"
                          >
                            {t('add-answer')}
                          </AtlaskitButton>
                          {answersAmount > 2 && (
                            <AtlaskitButton
                              onClick={() => {
                                const state = getState();
                                const values = state.values;
                                delete values[`answer${answersAmount - 1}`];
                                delete values[`isCorrect${answersAmount - 1}`];
                                setAnswersAmount((prev) => prev - 1);
                              }}
                              appearance="primary"
                            >
                              {t('remove-answer')}
                            </AtlaskitButton>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </Modal.Body>
              <Modal.Actions>
                <AtlaskitButton appearance="default" onClick={closeHandler}>
                  {t('close')}
                </AtlaskitButton>
                {stage === 1 && (
                  <LoadingButton
                    name="action"
                    value="nextQuestion"
                    onClick={() => {
                      const errors = validateQuestion(getState().values, false);
                      if (errors) {
                        // We call onSubmit function to execute validation
                        formData.formProps.onSubmit();
                      } else {
                        nextQuestionHandler(getState().values, reset);
                      }
                    }}
                    appearance="primary"
                  >
                    {t('iap-next-question')}
                  </LoadingButton>
                )}
                <LoadingButton
                  appearance="primary"
                  name="action"
                  value="save"
                  isLoading={isSaving}
                  onClick={() => {
                    if (stage === 0) {
                      return formData.formProps.onSubmit();
                    }

                    if (stage === 1) {
                      const errors = validateQuestion(getState().values, true);
                      if (errors) {
                        return formData.formProps.onSubmit();
                      }
                      saveCourseHandler(getState().values);
                      return;
                    }
                  }}
                >
                  {stage === 0 ? t('next') : t('save')}
                </LoadingButton>
              </Modal.Actions>
            </form>
          );
        }}
      </Form>
    </Modal>
  );
};

export default CreateCourse;
