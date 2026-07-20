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
    return <p className="text-sm text-gray-500 dark:text-gray-400">No props.</p>;
  }

  return (
    <div className="overflow-x-auto my-6">
      <table className="w-full text-sm border-collapse border border-gray-200 dark:border-gray-700">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-900/40 text-left">
            <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 font-semibold">
              Name
            </th>
            <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 font-semibold">
              Type
            </th>
            <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 font-semibold">
              Default
            </th>
            <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 font-semibold">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {props.map((p) => (
            <tr key={p.name} className="align-top">
              <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 font-mono text-purple-700 dark:text-purple-300">
                {p.name}
              </td>
              <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 font-mono text-blue-700 dark:text-blue-300">
                {p.type}
              </td>
              <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 font-mono text-gray-600 dark:text-gray-400">
                {p.default ?? '—'}
              </td>
              <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-gray-700 dark:text-gray-300">
                {p.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PropsTable;
