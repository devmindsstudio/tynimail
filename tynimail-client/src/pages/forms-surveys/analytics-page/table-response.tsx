export interface ResponseItem {
  id: string;
  value: string;
  created_at: string;
}

export interface QuestionResponse {
  question: string;
  responses: ResponseItem[];
}

interface TableResponseProps {
  responses?: QuestionResponse[];
}

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const TableResponse = ({ responses = [] }: TableResponseProps) => {
  const idToRow = new Map<
    string,
    { values: Record<string, string>; submitAt: string }
  >();

  for (const { question, responses: rows } of responses) {
    for (const row of rows) {
      const existing = idToRow.get(row.id);
      const values = existing?.values ?? {};
      values[question] = row.value;
      const submitAt = existing?.submitAt ?? row.created_at;
      idToRow.set(row.id, { values, submitAt });
    }
  }

  const questions = responses.map((r) => r.question);
  const allRows = Array.from(idToRow.entries())
    .map(([id, { values, submitAt }]) => ({ id, values, submitAt }))
    .sort(
      (a, b) => new Date(b.submitAt).getTime() - new Date(a.submitAt).getTime(),
    );

  const hasValue = (v: unknown) => v != null && String(v).trim() !== "";
  const parallelRows = allRows.filter((row) =>
    questions.some((q) => hasValue(row.values[q])),
  );

  if (parallelRows.length === 0) {
    return;
  }

  return (
    <div className="rounded-lg border border-border overflow-y-hidden bg-background">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border group">
            {questions.map((q) => (
              <th
                key={q}
                className="p-4 text-center  text-sm font-normal text-muted-foreground "
              >
                {q}
              </th>
            ))}
            <th className="p-4 text-center  text-sm font-normal text-muted-foreground ">
              Submit at
            </th>
          </tr>
        </thead>
        <tbody>
          {parallelRows.map((row, index) => (
            <tr
              key={index}
              className="group border-b last:border-b-0 border-border transition-colors"
            >
              {questions.map((q) => {
                const val = row.values[q];
                const str =
                  val == null
                    ? ""
                    : typeof val === "string"
                      ? val
                      : String(val);
                return (
                  <td
                    key={q}
                    className="px-4 py-3.5 text-sm text-foreground text-center"
                  >
                    {str.trim() || "—"}
                  </td>
                );
              })}
              <td className="p-4 text-sm font-normal text-foreground text-center">
                {formatDate(row.submitAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableResponse;
