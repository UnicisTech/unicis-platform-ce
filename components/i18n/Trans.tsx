import React from 'react';
import { Trans as BaseTrans } from 'next-i18next';

type AnyCallable = (props: any) => React.ReactElement;

export const Trans: React.FC<any> = (props) => {
  const CallableTrans = BaseTrans as unknown as AnyCallable;
  return CallableTrans(props);
};
