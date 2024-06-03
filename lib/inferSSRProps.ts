type GetSSRResult<TProps> =
  | { props: TProps }
  | { redirect: any }
  | { notFound: boolean };

type GetSSRFn<TProps> = (args: any) => Promise<GetSSRResult<TProps>>;

export type inferSSRProps<TFn extends GetSSRFn<any>> =
  TFn extends GetSSRFn<infer TProps> ? NonNullable<TProps> : never;
