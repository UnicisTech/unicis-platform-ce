// import React, { Fragment } from 'react';

// import Button from '@atlaskit/button/standard-button';
// import Select, {
//   components,
//   OptionProps,
//   SingleValueProps,
//   ValueType,
// } from '@atlaskit/select';

// import Modal, {
//   ModalBody,
//   ModalFooter,
//   ModalHeader,
//   ModalTitle,
//   ModalTransition,
// } from '@atlaskit/modal-dialog';

// import Form, { ErrorMessage, Field, FormFooter } from '@atlaskit/form';

// interface Option {
//   label: string;
//   value: string;
// }
// interface Category {
//   colors?: ValueType<Option>;
//   icecream?: ValueType<Option[]>;
//   suit?: ValueType<Option[]>;
// }

// const flavors = [
//   { label: 'Vanilla', value: 'vanilla' },
//   { label: 'Strawberry', value: 'strawberry' },
//   { label: 'Chocolate', value: 'chocolate' },
//   { label: 'Mango', value: 'mango' },
//   { label: 'Passionfruit', value: 'passionfruit' },
//   { label: 'Hazelnut', value: 'hazelnut' },
//   { label: 'Durian', value: 'durian' },
// ];

// const validateOnSubmit = (data: Category) => {
//   let errors;
//   errors = colorsValidation(data, errors);
//   errors = flavorValidation(data, errors);
//   return errors;
// };

// const colorsValidation = (data: Category, errors?: Record<string, string>) => {
//   if (data.colors && !(data.colors instanceof Array)) {
//     return (data.colors as Option).value === 'dog'
//       ? {
//         ...errors,
//         colors: `${(data.colors as Option).value} is not a color`,
//       }
//       : errors;
//   }
//   return errors;
// };

// const flavorValidation = (data: Category, errors?: Record<string, string>) => {
//   if (data.icecream && data.icecream.length >= 3) {
//     return {
//       ...errors,
//       icecream: `${data.icecream.length} is too many flavors, don't be greedy, you get to pick 2.`,
//     };
//   }

//   return errors;
// };

// const CreateTask2 = ({
//   visible,
//   setVisible,
// }: {
//   visible: boolean;
//   setVisible: (visible: boolean) => void;
// }) => {


//   return (
//     <ModalTransition>
//       {visible && (
//         <Modal onClose={() => { }}>
//           <div
//             style={{
//               display: 'flex',
//               width: '400px',
//               margin: '0 auto',
//               flexDirection: 'column',
//             }}
//           >
//             <Form<Category>
//               onSubmit={(data) => {
//                 console.log('form data', data);
//                 return Promise.resolve(validateOnSubmit(data));
//               }}
//             >
//               {({ formProps }) => (
//                 <form {...formProps}>
//                   <ModalHeader>
//                     <ModalTitle>Create a task</ModalTitle>
//                   </ModalHeader>
//                   <ModalBody>
//                   <Field<ValueType<Option, true>>
//                     name="icecream"
//                     label="Select a flavor"
//                     defaultValue={[]}
//                   >
//                     {({ fieldProps: { id, ...rest }, error }) => (
//                       <Fragment>
//                         <Select inputId={id} {...rest} options={flavors} isMulti />
//                         {error && <ErrorMessage>{error}</ErrorMessage>}
//                       </Fragment>
//                     )}
//                   </Field>
//                   </ModalBody>
//                   <ModalFooter>
//                     <Button type="submit" appearance="primary">
//                       Submit
//                     </Button>
//                   </ModalFooter>
//                 </form>
//               )}
//             </Form>
//           </div>
//         </Modal>)}
//     </ModalTransition>
//   );
// };

// export default CreateTask2;

export default {}