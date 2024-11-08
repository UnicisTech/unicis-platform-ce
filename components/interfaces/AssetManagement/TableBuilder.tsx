interface TableBuilderProps {
  data: Array<Record<string, any>>;
}

const TableBuilder: React.FC<TableBuilderProps> = ({ data }) => {
  if (data.length === 0) {
    return <p className="text-gray-100">No data available</p>;
  }

  const headers = Array.from(new Set(data.flatMap((item) => Object.keys(item))));

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