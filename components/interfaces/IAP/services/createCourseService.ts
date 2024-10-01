import { CourseContentType } from "@prisma/client";

// 1. Helper functions
export function allPropsUndefined(obj) {
  return Object.values(obj).every(function (value) {
    return value === undefined;
  });
}

export function validateNumberField(value = '') {
  return /^\d+$/.test(value) || value === '';
}

export function range(size) {
  return Array.from({ length: size }, function (_, i) {
    return i;
  });
}

export function hasCorrectAnswer(obj) {
  return Object.keys(obj).some(function (key) {
    return key.startsWith('isCorrect') && obj[key] === true;
  });
}

// 2. Validation functions
export function validateCourse(formData: any, isEditing: boolean) {
  try {
    console.log('validateCourse 1', formData)
    const { name, category, type, description, url, teams } = formData;

    console.log('validateCourse 2', formData)

    const errors = {
      'name': name ? undefined : 'Name is required.',
      'category': category ? undefined : 'Category is required.',
      'type': type ? undefined : 'Type is required.',
      'description': type?.value === CourseContentType.OPEN_TEXT ? (description ? undefined : 'Description is required.') : undefined,
      'url': (type?.value === CourseContentType.EMBEDDED_VIDEO || type?.value === CourseContentType.PRESENTATION_PDF) ? (url ? undefined : 'URL is required.') : undefined,
      // 'presentationUrl': type?.value === 'pdf' ? (presentationUrl ? undefined : 'Presentation URL is required.') : undefined,
      'teams': (teams?.length || isEditing) ? undefined : 'Course should be assigned to at least one team.'
    };

    console.log('validateCourse 3', errors)

    const isValid = allPropsUndefined(errors);
    return isValid ? undefined : errors;
  } catch (e: any) {
    console.log('PZD', e)
  }
}

export function validateQuestion(formData: any, isSaving: boolean) {
  const { questionType, questionTitle } = formData;

  // Question is fully empty and user want save the course
  if (!questionType && !questionTitle && isSaving) {
    return undefined 
  }

  const errors = {
    'questionType': questionType ? undefined : 'Question type is required.',
    'questionTitle': questionTitle ? undefined : 'Question title is required.',
  };

  const questionTypeErrors = validateQuestionByType(formData);
  const combinedErrors = Object.assign(errors, questionTypeErrors);

  console.log('combinedErrors', combinedErrors)

  const isValid = allPropsUndefined(combinedErrors);
  return isValid ? undefined : combinedErrors;
}

export function validateQuestionByType(formData: any) {
  const type = formData?.questionType?.value;

  switch (type) {
    case "checkboxsingle":
    case "checkboxmulti":
      if (!hasCorrectAnswer(formData)) {
        return validateCheckboxQuestion(formData);
      }
      return {};

    case "order":
      return validateOrderQuestion(formData);

    case "text":
      return validateTextQuestion(formData);

    default:
      return {};
  }
}

export function validateOrderQuestion(obj: object) {
  return Object.keys(obj)
    .filter(function (key) {
      return key.endsWith('term1') || key.endsWith('term2');
    })
    .reduce(function (acc, key) {
      acc[key] = obj[key] ? undefined : "You should fill this field.";
      return acc;
    }, {});
}

export function validateCheckboxQuestion(obj: object) {
  return Object.keys(obj)
    .filter(function (key) {
      return key.startsWith('isCorrect');
    })
    .reduce(function (acc, key) {
      acc[key] = "You should choose a correct answer.";
      return acc;
    }, {});
}

export function validateTextQuestion(formData: any) {
  const { questionType, answer } = formData;
  return {
    'answer': questionType?.value === 'text' ? (answer ? undefined : 'Answer is required.') : undefined,
  };
}

// 3. Business logic functions
export function createQuestion(formData: any, answersAmount: number) {
  const type = formData.questionType.value;

  if (type === "text") {
    return {
      type: type,
      question: formData.questionTitle,
      answer: formData.answer,
    };
  }

  if (type === "checkboxsingle" || type === "checkboxmulti") {
    return {
      type: type,
      question: formData.questionTitle,
      answers: range(answersAmount).map(function (index) {
        return {
          answer: formData[`answer${index}`],
          isCorrect: formData[`isCorrect${index}`],
        };
      }),
    };
  }

  if (type === "order") {
    return {
      type: type,
      question: formData.questionTitle,
      answers: [
        ...range(answersAmount).map(function (index) {
          return {
            first: formData[`answer${index}-term1`],
            second: formData[`answer${index}-term2`],
          };
        }),
      ],
    };
  }
}

// 4. Error-handling functions


// export const validateCourse = (formData: any) => {
//   const { courseName, category, type, description, presentationUrl, videoUrl } = formData

//   const errors = {
//     'courseName': courseName
//       ? undefined
//       : 'Name is required.',
//     'category': category
//       ? undefined
//       : 'Category is required.',
//     'type': type
//       ? undefined
//       : 'Type is required.',
//     'description': type.value === 'text'
//       ? description ? undefined : 'Description is required.' : undefined,
//     'videoUrl': type.value === 'video'
//       ? videoUrl ? undefined : 'Video URL is required.' : undefined,
//     'presentationUrl': type.value === 'pdf'
//       ? presentationUrl ? undefined : 'Presentation URL is required.' : undefined,
//   }

//   const isValid = allPropsUndefined(errors)

//   if (isValid) {
//     return undefined
//   }

//   return errors
// }

// export const validateTextQuestion = (formData: any) => {
//   const { questionType, answer } = formData
//   return {
//     'answer': questionType?.value === 'text'
//       ? answer ? undefined : 'Answer is required.' : undefined
//   }
// }

// export const validateQuestion = (formData: any) => {
//   const { questionType, questionTitle } = formData

//   // TODO: validate empty answers
//   const errors = {
//     'questionType': questionType
//       ? undefined
//       : 'Question type is required.',
//     'questionTitle': questionTitle
//       ? undefined
//       : 'Question title in required.',
//   }

//   const questionTypeErrors = validateQuestionByType(formData)
//   const combinedErrors = Object.assign(errors, questionTypeErrors)




//   const isValid = allPropsUndefined(combinedErrors)

//   if (isValid) {
//     return undefined
//   }

//   return combinedErrors
// }

// export function validateQuestionByType(formData: any) {
//   const type = formData.questionType.value;

//   switch (type) {
//     case "checkboxsingle":
//     case "checkboxmulti":
//       if (!hasCorrectAnswer(formData)) {
//         return createHasNoCorrectAnswerErrorObject(formData);
//       }
//       return {}

//     case "order":
//       return validateOrderQuestion(formData);

//     case "text":
//       return validateTextQuestion(formData);

//     default:
//       return {};
//   }
// }

// export const createAnswer = (formData: any, answersAmount: number) => {
//   const type = formData.questionType.value
//   if (type === "text") {
//     return {
//       type: type,
//       question: formData.questionTitle,
//       answer: formData.answer,
//     }
//   }
//   if (type === "checkboxsingle" || type === "checkboxmulti") {
//     return {
//       type: type,
//       question: formData.questionTitle,
//       answers: range(answersAmount).map(index => ({
//         answer: formData[`answer${index}`],
//         isCorrect: formData[`isCorrect${index}`]
//       }))
//     }
//   }
//   if (type === "order") {
//     return {
//       type: type,
//       question: formData.questionTitle,
//       answers: [
//         range(answersAmount).map(index => ({
//           first: formData[`answer${index}-term1`],
//           second: formData[`answer${index}-term2`]
//         }))
//       ]
//     }
//   }
// }

// export const createHasNoCorrectAnswerErrorObject = (obj: object) => {
//   return Object.keys(obj)
//     .filter(key => key.startsWith('isCorrect'))
//     .reduce((acc, key) => {
//       acc[key] = "You should choose a correct answer."
//       return acc;
//     }, {});
// }

// export const validateOrderQuestion = (obj: object) => {
//   return Object.keys(obj)
//     .filter(key => key.endsWith('term1') || key.endsWith('term2'))
//     .reduce((acc, key) => {
//       acc[key] = obj[key] ? undefined : "You should fill this field."
//       return acc;
//     }, {});
// }

// export const allPropsUndefined = (obj) => {
//   return Object.values(obj).every(value => value === undefined);
// }

// export const validateNumberField = (value: string = '') => /^\d+$/.test(value) || value === ''

// export const range = (size: number) => Array.from({ length: size }, (_, i) => i)

// export const hasCorrectAnswer = (obj: object) => Object.keys(obj)
//   .some(key => key.startsWith('isCorrect') && obj[key] === true);

