export const getResultActionBadgeClass = (action?: string) => {
  if (action === 'failed') {
    return 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200';
  }

  if (action === 'added') {
    return 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200';
  }

  if (action === 'removed') {
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';
  }

  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
};

export const getDistributorStatusBadgeClass = (status?: string) => {
  if (status === 'complete') {
    return 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200';
  }

  if (status === 'failed') {
    return 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200';
  }

  if (status === 'pending') {
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200';
  }

  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';
};

export const getResultQueryLabel = (
  displayQueryName?: string,
  queryName?: string
) => {
  const name = displayQueryName || queryName || '';

  const packMatch = name.match(/^pack\/([^/:]+)(?:\/|:)/);
  if (packMatch?.[1]) {
    return {
      label: packMatch[1],
      type: 'Pack',
    };
  }

  const queryIdMatch = name.match(/(?:^|:)query:([0-9a-fA-F-]{36})(?:$|:)/);
  if (queryIdMatch?.[1]) {
    return {
      label: queryIdMatch[1],
      type: 'Query',
    };
  }

  return {
    label: name || '-',
    type: '',
  };
};
