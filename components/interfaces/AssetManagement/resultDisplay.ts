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

export const getResultQueryLabel = (
  displayQueryName?: string,
  queryName?: string
) => {
  const name = displayQueryName || queryName || '';

  const packName = name.match(/^pack\/([^/]+)\//)?.[1];
  if (packName) {
    return {
      label: packName,
      type: 'Pack',
    };
  }

  return {
    label: name || '-',
    type: '',
  };
};
