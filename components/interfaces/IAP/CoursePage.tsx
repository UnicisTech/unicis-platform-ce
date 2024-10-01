import { ChangeEvent, useEffect, useState } from "react";
import YouTube from 'react-youtube';
import toast from 'react-hot-toast';
import { defaultHeaders } from '@/lib/common';
import { Loading, Error } from '@/components/shared';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import useIapProgress from "hooks/useIapProgress";
import Textfield from '@atlaskit/textfield';
import Select from '@atlaskit/select';
import { extractYouTubeVideoId, shuffleArray, validateAnswer } from "./services/passCourseService";
import { Artboard, Button } from "react-daisyui";
import { MarkdownPreview } from "@/components/shared/uiw/Markdown";
import { CourseContentType, Team } from "@prisma/client"
import { ApiResponse, IapCourse, MultipleChoiceQuestion, OrderQuestion as OrderQuestionType, Question, QuestionType, SingleChoiceQuestion, TeamCourseWithProgress, TextQuestion } from "types"
import { Checkbox } from "@atlaskit/checkbox";
import UserResultPieChart from "./UserResultPieChart";
import { countCourseAnswers } from "@/lib/iap";
import Certificate from "./Certificate";

const SignleChoiseQuestion = ({ question, onAnswerUpdate }: { question: SingleChoiceQuestion, onAnswerUpdate: (answer: any) => void }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)

    useEffect(() => {
        onAnswerUpdate(selectedAnswer)
    }, [selectedAnswer])

    return (
        <>
            <p className="text-xl font-semibold mb-2">{question.question}</p>
            {question.answers.map(({ answer }, index) => (
                <div className="flex m-2" key={index}>
                    <Checkbox
                        onChange={(e) => {
                            const isChecked = e.target.checked
                            isChecked ? setSelectedAnswer(answer) : setSelectedAnswer(null)
                        }}
                        isChecked={Boolean(selectedAnswer === answer)}
                    />
                    <span>{answer}</span>
                </div>
            ))}
        </>
    )
}

const MultipleChoiseQuestion = ({ question, onAnswerUpdate }: { question: MultipleChoiceQuestion, onAnswerUpdate: (answer: any) => void }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string[] | null>(null)

    useEffect(() => {
        onAnswerUpdate(selectedAnswer)
    }, [selectedAnswer])

    return (
        <>
            <p className="text-xl font-semibold mb-2">{question.question}</p>
            {question.answers.map(({ answer }) => (
                <div className="flex m-2">
                    <Checkbox
                        onChange={(e) => {
                            const isChecked = e.target.checked
                            isChecked
                                ? setSelectedAnswer(prev => prev ? [...prev, answer] : [answer])
                                : setSelectedAnswer(prev => prev ? prev.filter(item => item !== answer) : null)
                        }}
                        isChecked={Boolean(selectedAnswer?.find(item => item === answer))}
                    />
                    <span>{answer}</span>
                </div>
            ))}
        </>
    )
}

const OrderQuestion = ({ question, onAnswerUpdate }: { question: OrderQuestionType, onAnswerUpdate: (answer: any) => void }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<{ first: string; second: string | null }[]>(question.answers.map(answer => ({ ...answer, second: null })))
    const [shuffledOptions, setShuffledOptions] = useState<{ label: string; value: string }[]>([]);

    // Shuffle options only once when component mounts
    useEffect(() => {
        const shuffled = shuffleArray(
            question.answers.map(({ second }) => ({ label: second, value: second }))
        );
        setShuffledOptions(shuffled);
    }, [question.answers]);

    useEffect(() => {
        onAnswerUpdate(selectedAnswer)
    }, [selectedAnswer])

    return (
        <>
            <p className="text-xl font-semibold mb-2">{question.question}</p>
            {question.answers.map(({ first }, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 items-center mb-2">
                    <span className="col-span-1">{index}. {first}</span>
                    <Select
                        className="col-span-1"
                        // Hide selected options
                        options={shuffledOptions.filter(option =>
                            !selectedAnswer.find(item => item.second === option.value)
                        )}
                        onChange={(option) => {
                            if (option) {
                                const updated = [...selectedAnswer]
                                updated[index] = { first, second: option.value }
                                setSelectedAnswer(updated)
                            }
                        }}
                    />
                </div>
            ))}
        </>
    )
}

const TextQuestion = ({ question, onAnswerUpdate }: { question: TextQuestion, onAnswerUpdate: (answer: any) => void }) => {
    const [answerInput, setAnswerInput] = useState<string | null>(null)

    useEffect(() => {
        onAnswerUpdate(answerInput)
    }, [answerInput])

    return (
        <>
            <p className="text-xl font-semibold mb-2">{question.question}</p>
            <Textfield onChange={(e: ChangeEvent<HTMLInputElement>) => setAnswerInput(e.target.value)} />
        </>
    )
}

const Question = ({ question, onAnswerUpdate }: { question: Question, onAnswerUpdate: (answer: any) => void }) => {
    switch (question.type) {
        case QuestionType.SINGLE_CHOICE:
            return <SignleChoiseQuestion question={question} onAnswerUpdate={onAnswerUpdate} />
        case QuestionType.MULTIPLE_CHOICE:
            return <MultipleChoiseQuestion question={question} onAnswerUpdate={onAnswerUpdate} />
        case QuestionType.ORDER:
            return <OrderQuestion question={question} onAnswerUpdate={onAnswerUpdate} />
        case QuestionType.TEXT:
            return <TextQuestion question={question} onAnswerUpdate={onAnswerUpdate} />
        default:
            return <p>unknown</p>
    }
}

const CourseContentPreview = ({ course }: { course: IapCourse }) => {
    switch (course.contentType) {
        case CourseContentType.EMBEDDED_VIDEO:
            return <YouTube videoId={extractYouTubeVideoId(course.url as string)} />
        case CourseContentType.PRESENTATION_PDF:
            return <iframe
                src={course.url as string}
                style={{ display: "block", margin: "10px auto" }}
                width="960"
                height="569"
                allowFullScreen={true}
            />
        case CourseContentType.OPEN_TEXT:
            return <div className="container">
                <Artboard className="bg-white dark:bg-gray-800" ><MarkdownPreview source={course.description as string} className="mt-30" /></Artboard>
            </div>
        default:
            return <YouTube videoId="zTxoQKjya6I" />
    }
}

const CoursePage = ({ teamCourse, team }: { teamCourse: TeamCourseWithProgress, team: Team }) => {
    const course = teamCourse.course
    const { t } = useTranslation('common');
    const router = useRouter();
    const { slug, courseId } = router.query as { slug: string; courseId: string; };
    const { data } = useSession();
    const userId = data?.user?.id

    const { userProgress, isError, isLoading, mutateProgress } = useIapProgress(slug, courseId, userId)
    const [answers, setAnswers] = useState<any>(Array(course.questions.length).fill(null));  // Store answers here
    const [started, setStarted] = useState<boolean>(false)
    const [finished, setFinished] = useState<boolean>(false)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
    const isLastQuestion = currentQuestionIndex === course.questions.length - 1

    const handleAnswerUpdate = (answer: any) => {
        const currentQuestion = course.questions[currentQuestionIndex];
        const isValid = validateAnswer(currentQuestion?.type, answer);

        if (isValid) {
            setAnswers(prevAnswers => {
                const updatedAnswers = [...prevAnswers];
                updatedAnswers[currentQuestionIndex] = answer;
                return updatedAnswers;
            });
        }
    };

    const nextHandler = () => {
        for (let i = currentQuestionIndex; i < course.questions.length; i++) {
            // Its last question
            if (i === course.questions.length - 1) {
                return saveHandler()
            }
            if (!answers[i + 1]) {
                return setCurrentQuestionIndex(i + 1)
            }
        }
    }

    const saveHandler = async () => {
        console.log('save handler', answers)
        try {
            const response = await fetch(`/api/teams/${slug}/iap/course/${teamCourse.id}/progress`, {
                method: 'POST',
                headers: defaultHeaders,
                body: JSON.stringify(answers),
            });

            const json = (await response.json()) as ApiResponse<any>;

            console.log('json resp', json)

            if (!response.ok) {
                toast.error(json.error.message);
                return;
            }

            toast.success(t('iap-course-saved'));
            mutateProgress();
        } catch (e) {
            //TODO: catch error
        } finally {
            // setIsSaving(false)

        }
    }

    useEffect(() => {
        if (!userProgress) return;

        const { progress, answers } = userProgress as { progress: number, answers: any };

        setStarted(true);
        setAnswers(answers);
        setFinished(progress === 100);

        const uncompletedQuestionIndex = answers.findIndex(item => !item);
        if (uncompletedQuestionIndex !== -1) setCurrentQuestionIndex(uncompletedQuestionIndex);
    }, [userProgress]);

    if (isLoading) {
        return <Loading />;
    }

    if (isError) {
        return <Error message={isError.message} />;
    }

    if (finished) {
        const { right, wrong } = countCourseAnswers(answers, course.questions)
        return (
            <div className="flex justify-center">
                <div className="flex flex-col w-1/2">
                    <div className="h-[300px] mb-2">
                        <UserResultPieChart right={right} wrong={wrong} />
                    </div>
                    {/* //TODO: results table to discuss */}
                    <div className="flex justify-center">
                        <Certificate course={course} team={team} userName={data?.user?.name || ""}/>
                    </div>
                </div>
            </div>
        )
    }

    console.log('CoursePage course', { course, seSSion: data, userProgress })

    return (
        <div style={{ minHeight: "50%" }}>
            <div className="mb-5 flex justify-center">
                <CourseContentPreview course={course} />
            </div>
            {!started
                ? <div className="flex justify-center">
                    <Button onClick={() => setStarted(true)}>
                        Start
                    </Button>
                </div>

                : <div className="flex justify-center">
                    <div className="flex-col w-1/2">
                        <div>
                            <span>{currentQuestionIndex + 1}/{course.questions.length}</span>
                        </div>
                        <Question
                            question={course.questions[currentQuestionIndex]}
                            onAnswerUpdate={handleAnswerUpdate}
                        />
                        <div className="flex justify-end">
                            {isLastQuestion
                                ? <Button onClick={saveHandler}>{t('save')}</Button>
                                : <Button onClick={nextHandler}>{t('next')}</Button>
                            }
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default CoursePage