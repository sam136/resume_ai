export interface IUser {
  id?: string;
  email: string;
  password: string;
  username: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserLogin {
  email: string;
  password: string;
}

export interface IUserRegister extends IUserLogin {
  username: string;
}
