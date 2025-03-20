import { Request, Response } from 'express';
import { User } from '../models/User';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import { QueryBuilder } from '../utils/db/queryBuilder';
import { toJSON, parseQueryFilters } from '../utils/db/transform';

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const query = new QueryBuilder()
    .filter(parseQueryFilters(req.query))
    .sort({ createdAt: -1 })
    .paginate(Number(req.query.page), Number(req.query.limit))
    .build();

  const users = await User.find(query.filter || {})
    .sort(query.sort)
    .skip((query.page! - 1) * query.limit!)
    .limit(query.limit!)
    .select('-password');

  res.status(200).json({ users: users.map(user => toJSON(user)) });
});

export const getUser = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) throw new AppError('User not found', 404);
  res.status(200).json({ user: toJSON(user) });
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { password, email, ...updateData } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) throw new AppError('User not found', 404);
  res.status(200).json({ user: toJSON(user) });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  res.status(204).json();
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const { preferences, firstName, lastName, phone, avatar } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { preferences, firstName, lastName, phone, avatar },
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({ user: toJSON(user) });
});