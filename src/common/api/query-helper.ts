import { FilterQuery, Model, Document, PopulateOptions } from 'mongoose';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function getPaginationParams(page?: number, limit?: number): PaginationParams {
  const p = Math.max(1, page || 1);
  const l = Math.min(100, Math.max(1, limit || 10));
  return { page: p, limit: l, skip: (p - 1) * l };
}

export async function paginateQuery<T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T> = {},
  options: {
    page?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
    populate?: string | string[] | PopulateOptions | PopulateOptions[];
    select?: string;
  } = {},
): Promise<{
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const { page, limit, skip } = getPaginationParams(options.page, options.limit);
  const sort = options.sort || { createdAt: -1 };

  const query = model.find(filter).sort(sort).skip(skip).limit(limit);

  if (options.populate) {
    query.populate(options.populate as any);
  }
  if (options.select) {
    query.select(options.select);
  }

  const [items, total] = await Promise.all([
    query.exec(),
    model.countDocuments(filter).exec(),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}
