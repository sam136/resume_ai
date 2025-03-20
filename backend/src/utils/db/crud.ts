import mongoose, { Document, Model, FilterQuery } from 'mongoose';
import { AnyBulkWriteOperation } from 'mongodb';

export async function findOneOrCreate<T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T>,
  data: Partial<T>
): Promise<T> {
  let doc = await model.findOne(filter);
  if (!doc) {
    doc = await model.create(data);
  }
  return doc;
}

export async function updateOrCreate<T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T>,
  data: Partial<T>
): Promise<T> {
  const result = await model.findOneAndUpdate(
    filter,
    data,
    { new: true, upsert: true, runValidators: true }
  );
  return result as T;
}

export async function bulkUpsert<T extends Document, DocType = T extends Document ? T : any>(
  model: Model<T>,
  documents: Partial<DocType>[],
  key: keyof DocType
): Promise<DocType[]> {
  const operations = documents.map(doc => ({
    updateOne: {
      filter: { [key]: doc[key] },
      update: { $set: doc },
      upsert: true
    }
  }));

  await model.bulkWrite(operations as AnyBulkWriteOperation<T extends Document ? T : any>[]);
  return await model.find({
    [key]: { $in: documents.map(doc => doc[key]) }
  } as FilterQuery<T>).lean() as unknown as DocType[];
}
