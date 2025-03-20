import { Document } from 'mongoose';

export function toJSON<T extends Document | object>(doc: T): Partial<T> {
  const obj = doc instanceof Document ? doc.toObject() : { ...doc };
  
  // Handle _id conversion if exists
  if (obj._id) {
    obj.id = obj._id.toString();
    delete obj._id;
  }
  
  // Remove __v
  delete obj.__v;
  
  // Convert timestamps
  if (obj.createdAt) obj.createdAt = new Date(obj.createdAt).toISOString();
  if (obj.updatedAt) obj.updatedAt = new Date(obj.updatedAt).toISOString();
  
  return obj;
}

export function cleanObject<T extends object>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
}

export function parseQueryFilters(query: Record<string, any>): Record<string, any> {
  const filters: Record<string, any> = {};
  
  Object.entries(query).forEach(([key, value]) => {
    if (typeof value === 'string') {
      if (value.startsWith('>=')) filters[key] = { $gte: value.slice(2) };
      else if (value.startsWith('<=')) filters[key] = { $lte: value.slice(2) };
      else if (value.startsWith('!=')) filters[key] = { $ne: value.slice(2) };
      else if (value.includes(',')) filters[key] = { $in: value.split(',') };
      else filters[key] = value;
    } else {
      filters[key] = value;
    }
  });

  return filters;
}
