// Please dont change logics here if not fully understoold 
// Author: Abdulsamad A | agastronics@gmail.com

import { useState } from "react";
import { Button } from "react-daisyui";

interface TableBuilderProps {
  data: Array<Record<string, any>>;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  loading?: boolean;
}

const TableBuilder: React.FC<TableBuilderProps> = ({ data, onDelete, onEdit, onView, loading }) => {
  const [deleting, setDeleting] = useState<string | null>(null);
  if (data.length === 0) {
    return <p className="rounded bg-gray-200">No data available</p>;
  }

  const headers = Array.from(new Set(data.flatMap((item) => Object.keys(item).filter((key) => key !== 'result_id'))));

  const handleDelete = async (id: string) => {
    setDeleting(id);
    if (onDelete) {
      await onDelete(id);
    }
    setDeleting(null);
  };

  return (
    <div className="overflow-x-auto">
    <table className="table">
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header} style={styles.headerCell}>
              {header.charAt(0).toUpperCase() + header.slice(1)}
            </th> 
          ))}
          {onDelete && <th style={styles.headerCell}>Action</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex} style={styles.row}>
            {headers.map((header) => (
              <td key={header} style={styles.cell}>
                {row[header] !== undefined || null ? row[header] : '-'}
              </td>
            ))}
            {onDelete && (
              <td style={styles.cell}>
                <Button
                  variant="outline"
                  type="button"
                  loading={deleting === row.result_id}
                  size="sm"
                  color="accent"
                  onClick={() => handleDelete(row.result_id || row.id)}
                >
                  Delete
                </Button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  headerCell: { padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' },
  cell: { padding: '8px', border: '1px solid #ddd' },
  row: { backgroundColor: '#f9f9f9' },
};

export default TableBuilder;