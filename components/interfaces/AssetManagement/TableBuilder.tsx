import { useState } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/shadcn/ui/table';
import { Button } from '@/components/shadcn/ui/button';
import { useTranslation } from 'next-i18next';

interface TableBuilderProps {
  data: Array<Record<string, any>>;
  onDelete?: (id: string) => Promise<void> | void;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  loading?: boolean;
}

const TableBuilder: React.FC<TableBuilderProps> = ({
  data,
  onDelete,
  onEdit,
  onView,
  loading,
}) => {
  const [deleting, setDeleting] = useState<string | null>(null);

  const { t } = useTranslation('common');

  if (!data || data.length === 0) {
    return (
      <p className="rounded-md border border-muted-foreground/20 bg-muted/40 p-3 text-sm">
        {t('no-data-available')}
      </p>
    );
  }

  const headers = Array.from(
    new Set(
      data.flatMap((item) =>
        Object.keys(item).filter(
          (key) => key !== 'result_id' && key !== 'deletable'
        )
      )
    )
  );

  const getRowId = (row: Record<string, any>, fallbackIndex: number) => {
    const id = row.result_id ?? row.id ?? fallbackIndex;
    return String(id);
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(id);
      if (onDelete) {
        await onDelete(id);
      }
    } finally {
      setDeleting(null);
    }
  };

  const renderCell = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') {
      try {
        return (
          <pre className="whitespace-pre-wrap break-words text-xs">
            {JSON.stringify(value, null, 2)}
          </pre>
        );
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  const showActions = Boolean(onDelete || onEdit || onView);

  return (
    <div className="w-full max-w-full overflow-x-auto rounded-md border">
      <Table className="min-w-max">
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header} className="whitespace-nowrap">
                {header.charAt(0).toUpperCase() + header.slice(1)}
              </TableHead>
            ))}
            {showActions && (
              <TableHead className="text-right">{t('actions')}</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => {
            const rowId = getRowId(row, rowIndex);
            return (
              <TableRow key={rowId}>
                {headers.map((header) => (
                  <TableCell
                    key={header}
                    className="max-w-xs align-top break-words [overflow-wrap:anywhere]"
                  >
                    {renderCell(row[header])}
                  </TableCell>
                ))}
                {showActions && (
                  <TableCell className="w-0 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      {onView && (
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          onClick={() => onView(rowId)}
                        >
                          {t('view')}
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          onClick={() => onEdit(rowId)}
                        >
                          {t('edit')}
                        </Button>
                      )}
                      {onDelete && row?.deletable !== false && (
                        <Button
                          size="sm"
                          variant="destructive"
                          type="button"
                          disabled={deleting === rowId || loading}
                          onClick={() => handleDelete(rowId)}
                        >
                          {deleting === rowId ? t('deleting') : t('delete')}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableBuilder;
