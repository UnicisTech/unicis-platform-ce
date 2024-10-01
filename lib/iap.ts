import { prisma } from '@/lib/prisma';
import { TeamProperties, IapCourse, Question, QuestionType, TextQuestion } from 'types';
import { CourseContentType } from '@prisma/client';

export const defaultCategories = ["IT Security", "Data Privacy", "Compliance"]

// export const courseTypes = [
//     { label: "Embedded video", value: "video" },
//     { label: "Presentation/PDF", value: "pdf" },
//     { label: "Open text", value: "text" }
// ]

export const courseTypes = Object.values(CourseContentType).map((type) => {
    switch (type) {
        case CourseContentType.EMBEDDED_VIDEO:
            return { label: 'Embedded video', value: type };
        case CourseContentType.PRESENTATION_PDF:
            return { label: 'Presentation/PDF', value: type };
        case CourseContentType.OPEN_TEXT:
            return { label: 'Open text', value: type };
        default:
            return { label: type, value: type }; // Fallback in case enum is extended
    }
});

export const questionTypes = [
    { label: "Checkbox single answer", value: 'checkboxsingle' },
    { label: "Checkbox multiple answers", value: 'checkboxmulti' },
    { label: "Dropdown order number", value: 'order' },
    { label: "Free text answer", value: 'text' }
]



// export const setCategories = async ({
//     slug,
//     categories,
// }: {
//     slug: string;
//     categories: string[];
// }) => {
//     const team = await prisma.team.findUnique({
//         where: {
//             slug: slug,
//         },
//         select: {
//             properties: true,
//         },
//     });

//     const teamProperties = team ? (team.properties as TeamProperties) : {};

//     const updated = await prisma.team.update({
//         where: { slug: slug },
//         data: {
//             properties: {
//                 ...teamProperties,
//                 iap_categories: categories,
//             },
//         },
//     });

//     return updated;
// };

// export const saveCourse = async ({
//     slug,
//     course
// }: {
//     slug: string;
//     course: IapCourse
// }) => {
//     const team = await prisma.team.findUnique({
//         where: {
//             slug: slug,
//         },
//         select: {
//             properties: true,
//         },
//     });
//     //TODO: key
//     const teamProperties = team ? (team.properties as TeamProperties) : {};
//     const iap_courses = [...(teamProperties.iap_courses) || [], course]
//     teamProperties.iap_courses = iap_courses

//     return await prisma.team.update({
//         where: { slug: slug },
//         data: {
//             properties: {
//                 ...teamProperties,
//             },
//         },
//     });
// }

export const countCourseProgress = (answers: any) => {
    if (!Array.isArray(answers) || answers.length === 0) return 0;

    const definedCount = answers.filter(item => Boolean(item)).length;
    const percentage = (definedCount / answers.length) * 100;

    return Math.round(percentage);  // Keeping it to 1 digit after decimal
}

export const countCourseAnswers = (answers: any[], questions: Question[]) => {
    let right = 0;
    let wrong = 0;

    answers.forEach((answer, index) => {
        const question = questions[index]
        console.log('answers.forEach', { answer, question })
        switch (question.type) {
            case QuestionType.SINGLE_CHOICE:
                const correctAnswer = question.answers.find(item => item.isCorrect)?.answer
                console.log('correctAnswer in single question in countCourseAnswers', correctAnswer)
                correctAnswer === answer
                    ? right++
                    : wrong++
                break;
            case QuestionType.MULTIPLE_CHOICE:
                const correctAnswers = question.answers.filter(item => item.isCorrect)?.map(({answer}) => answer)
                haveSameElements(correctAnswers, answer)
                    ? right++
                    : wrong++
                break;

            case QuestionType.ORDER:
                haveSameElementsInOrder(answers.map(({ second }) => second), answer.map(({ second }) => second))
                    ? right++
                    : wrong++
                break;
            case QuestionType.TEXT:
                (question as TextQuestion).answer === answer
                    ? right++
                    : wrong++
        }
    });

    console.log('countCourseAnswers', { right, wrong })
    return { right, wrong }
}

const haveSameElements = (arr1: any[], arr2: any[]) => {
    return arr1.length === arr2.length && arr1.sort().every((val, index) => val === arr2.sort()[index]);
}

const haveSameElementsInOrder = (arr1: any[], arr2: any[]) => {
    return arr1.length === arr2.length && arr1.every((val, index) => val === arr2[index]);
}

// export const options = {
//     "defaultCategories": [
//       { label: "IT Security", value: "itsecurity" },
//       { label: "Data Privacy", value: "dataprivacy" },
//       { label: "Compliance", value: "compliance" }
//     ],
//     "courseTypes": [
//         { label: "Embedded video", value: "video"},
//         { label: "Presentation/PDF", value: "pdf"},
//         { label: "Open text", value: "text"}
//     ],
//     "questionTypes": [
//         { label: "Checkbox single answer", value: 'checkboxsingle'},
//         { label: "Checkbox multiple answers", value: 'checkboxmulti'},
//         { label: "Dropdown order number", value: 'order'},
//         { label: "Free text answer", value: 'text'}
//     ],
//       "order": [
//           { label: "0", value: '0'},
//           { label: "1", value: '1'},
//           { label: "2", value: '2'},
//           { label: "3", value: '3'},
//           { label: "4", value: '4'},
//           { label: "5", value: '5'},
//           { label: "6", value: '6'}
//     ],
//     "dashboardStatuses": [
//         { label: "To Do", value: 'todo'},
//         { label: "In Progress", value: 'inprogress'},
//         { label: "Completed", value: 'completed'}
//     ]
//   }