export interface PropEntry {
  name: string;
  type: string;
  default?: string;
  description: string;
}

interface PropsTableProps {
  props: PropEntry[];
}

/**
 * Renders a documentation table for component props.
 */
export function PropsTable({ props }: PropsTableProps) {
  if (props.length === 0) {
    return <p className="docs-desc">No props.</p>;
  }

  return (
    <div className="props-table-wrap">
      <table className="props-table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Type</th>
            <th scope="col">Default</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((p) => (
            <tr key={p.name}>
              <td className="props-name">{p.name}</td>
              <td className="props-type">{p.type}</td>
              <td className="props-default">{p.default ?? '—'}</td>
              <td>{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PropsTable;
