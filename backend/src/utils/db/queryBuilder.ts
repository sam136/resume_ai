import { FilterQuery, SortOrder } from 'mongoose';

export interface QueryOptions {
  filter?: Record<string, any>;
  sort?: Record<string, SortOrder>;
  page?: number;
  limit?: number;
  populate?: string | string[];
}

export class QueryBuilder<T> {
  private query: FilterQuery<T> = {};
  private sortOptions: Record<string, SortOrder> = {};
  private pageNum = 1;
  private limitNum = 10;
  private populateFields: string[] = [];

  filter(filterObj: Record<string, any>): this {
    this.query = { ...this.query, ...filterObj };
    return this;
  }

  sort(sortObj: Record<string, SortOrder>): this {
    this.sortOptions = sortObj;
    return this;
  }

  paginate(page?: number, limit?: number): this {
    this.pageNum = page || 1;
    this.limitNum = limit || 10;
    return this;
  }

  populate(fields: string | string[]): this {
    this.populateFields = Array.isArray(fields) ? fields : [fields];
    return this;
  }

  build(): QueryOptions {
    return {
      filter: this.query,
      sort: this.sortOptions,
      page: this.pageNum,
      limit: this.limitNum,
      populate: this.populateFields
    };
  }
}
