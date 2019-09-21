import { Action } from "@ngrx/store";

export const LOGIN = "[Auth] LOGIN";
export const LOGOUT = "[Auth] LOGOUT";
export const LOGIN_START = "[Auth] LOGIN_START";
export const LOGIN_FAIL = "[Auth] LOGIN_FAIL";
export const SIGNUP_START = "[Auth] SIGNUP_START";
export const CLEAR_ERROR = "[Auth] CLEAR_ERROR";

export class Login implements Action {
  readonly type = LOGIN;
  constructor(
    public payload: {
      email: string;
      userId: string;
      token: string;
      expirationDate: Date;
    }
  ) {}
}

export class Logout implements Action {
  readonly type = LOGOUT;
}

export class LoginStart implements Action {
  readonly type = LOGIN_START;
  constructor(public payload: { email: string; password: string }) {}
}
export class LoginFail implements Action {
  readonly type = LOGIN_FAIL;
  constructor(public payload: string) {}
}
export class SignupStart implements Action {
  readonly type = SIGNUP_START;
  constructor(public payload: { email: string; password: string }) {}
}
export class ClearError implements Action {
  readonly type = CLEAR_ERROR;
}

export type AuthActions =
  | Login
  | Logout
  | LoginFail
  | LoginStart
  | SignupStart
  | ClearError;
