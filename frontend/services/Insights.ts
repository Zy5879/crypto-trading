export async function askInsights(message: string): Promise<string> {
  const res = await fetch("http://localhost:8000/insights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      typeof data?.error === "string" ? data.error : "Request failed"
    );
  }

  if (typeof data === "string") return data;
  if (typeof data?.result === "string") return data.result;

  return JSON.stringify(data);
}
