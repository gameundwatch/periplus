const API_ROOT = "https://api.example-warehouse.com/v1";

export interface StockLevel {
  sku: string;
  onHand: number;
  updatedAt: string;
}

// The warehouse returns a cursor instead of a total, so callers cannot know how
// many pages are left until they reach the last one.
export async function fetchStock(sku: string): Promise<StockLevel> {
  const response = await fetch(`${API_ROOT}/stock/${sku}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`stock ${sku}: ${response.status}`);
  }
  return (await response.json()) as StockLevel;
}
