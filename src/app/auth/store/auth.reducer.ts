import { User } from "../user.model";
import * as AuthActions from "./auth.actions";
import { logging } from "protractor";

export interface State {
  user: User;
  authError: string;
  logging: boolean;
}

const initialState: State = { user: null, authError: null, logging: false };

export function authReducer(
  state = initialState,
  action: AuthActions.AuthActions
) {
  switch (action.type) {
    case AuthActions.LOGIN:
      const user = new User(
        action.payload.email,
        action.payload.userId,
        action.payload.token,
        action.payload.expirationDate
      );
      return { ...state, authError: null, user: user, logging: false };
    case AuthActions.LOGOUT:
      return { ...state, user: null };
    case AuthActions.LOGIN_START:
    case AuthActions.SIGNUP_START:
      return { ...state, authError: null, logging: true };
    case AuthActions.LOGIN_FAIL:
      return {
        ...state,
        user: null,
        authError: action.payload,
        logging: false
      };
    case AuthActions.CLEAR_ERROR:
      return { ...state, authError: null };
    default:
      return state;
  }
}
