import { Actions, ofType, Effect } from "@ngrx/effects";
import * as AuthActions from "./auth.actions";
import { switchMap, catchError, map, tap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { of } from "rxjs";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

const handleAuthentication = (
  expiresIn: number,
  email: string,
  userId: string,
  token: string
) => {
  const expDate = new Date(new Date().getTime() + expiresIn * 1000);

  return new AuthActions.Login({
    email: email,
    userId: userId,
    token: token,
    expirationDate: expDate
  });
};
const handleError = (errorRes: any) => {
  let error = "An unknown error occured!";
  if (!errorRes.error || !errorRes.error.error) {
    return of(new AuthActions.LoginFail(error));
  }
  switch (errorRes.error.error.message) {
    case "EMAIL_EXISTS":
      error = "This email already exists";
      break;
    case "EMAIL_NOT_FOUND":
      error = "This email was not found";
      break;
    case "INVALID_PASSWORD":
      error = "Password is incorrect";
      break;
  }
  //...
  return of(new AuthActions.LoginFail(error));
};

@Injectable()
export class AuthEffects {
  @Effect()
  authSignup = this.actions$.pipe(
    ofType(AuthActions.SIGNUP_START),
    switchMap((signupAction: AuthActions.SignupStart) => {
      return this.http
        .post<AuthResponseData>(
          "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" +
            environment.firebaseAPIKey,
          {
            email: signupAction.payload.email,
            password: signupAction.payload.password,
            returnSecureToken: true
          }
        )
        .pipe(
          map(resData => {
            return handleAuthentication(
              +resData.expiresIn,
              resData.email,
              resData.localId,
              resData.idToken
            );
          }),
          catchError(errorRes => {
            return handleError(errorRes);
          })
        );
    })
  );

  @Effect()
  authLogin = this.actions$.pipe(
    ofType(AuthActions.LOGIN_START),
    switchMap((authData: AuthActions.LoginStart) => {
      return this.http
        .post<AuthResponseData>(
          "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" +
            environment.firebaseAPIKey,
          {
            email: authData.payload.email,
            password: authData.payload.password,
            returnSecureToken: true
          }
        )
        .pipe(
          map(resData => {
            return handleAuthentication(
              +resData.expiresIn,
              resData.email,
              resData.localId,
              resData.idToken
            );
          }),
          catchError(errorRes => {
            return handleError(errorRes);
          })
        );
    })
  );

  @Effect({ dispatch: false })
  authSuccess = this.actions$.pipe(
    ofType(AuthActions.LOGIN),
    tap(() => {
      this.router.navigate(["/"]);
    })
  );

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private router: Router
  ) {}
}
