export function buildSearchFilter(
  search?: string,
  fields: string[] = ['title'],
): Record<string, any> {
  if (!search || !search.trim()) return {};
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return {
    $or: fields.map((field) => ({
      [field]: { $regex: escaped, $options: 'i' },
    })),
  };
}
