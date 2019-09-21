//Only setLogout and clearLogout is used, the rest is refactored to ngrx, I leave only setLogout

import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError, tap } from "rxjs/operators";
import { throwError, Subject, BehaviorSubject } from "rxjs";
import { User } from "./user.model";
import { environment } from "../../environments/environment";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import * as fromApp from "../store/app.reducer";
import * as AuthActions from "./store/auth.actions";

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  // user = new BehaviorSubject<User>(null);
  tokenExpTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private store: Store<fromApp.AppState>
  ) {}

  ////////////////////////////////

  setLogoutTimer(expirationDuration: number) {
    this.tokenExpTimer = setTimeout(() => {
      this.store.dispatch(new AuthActions.Logout());
    }, expirationDuration);
  }

  clearLogoutTimer() {
    if (this.tokenExpTimer) {
      clearTimeout(this.tokenExpTimer);
      this.tokenExpTimer = null;
    }
  }

  //////////////////////////////

  signup(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" +
          environment.firebaseAPIKey,
        { email: email, password: password, returnSecureToken: true }
      )
      .pipe(
        catchError(this.handleError),
        tap(resData => {
          this.handleAuthentication(
            resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn
          );
        })
      );
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" +
          environment.firebaseAPIKey,
        { email: email, password: password, returnSecureToken: true }
      )
      .pipe(
        catchError(this.handleError),
        tap(resData => {
          this.handleAuthentication(
            resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn
          );
        })
      );
  }

  logout() {
    // this.user.next(null);
    this.store.dispatch(new AuthActions.Logout());
    //this.router.navigate(["/auth"]);
    localStorage.removeItem("userData");
    if (this.tokenExpTimer) {
      clearTimeout(this.tokenExpTimer);
    }
    this.tokenExpTimer = null;
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  autoLogin() {
    const userData: {
      email: string;
      id: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem("userData"));
    if (!userData) {
      return;
    }

    const loadedUser = new User(
      userData.email,
      userData.id,
      userData._token,
      new Date(userData._tokenExpirationDate)
    );
    if (loadedUser.token) {
      // this.user.next(loadedUser);
      this.store.dispatch(
        new AuthActions.Login({
          email: loadedUser.email,
          userId: loadedUser.id,
          token: loadedUser.token,
          expirationDate: new Date(userData._tokenExpirationDate)
        })
      );
      const expDur =
        new Date(userData._tokenExpirationDate).getTime() -
        new Date().getTime();
      this.autoLogout(expDur);
    }
  }

  private handleAuthentication(
    email: string,
    userId: string,
    token: string,
    expiresIn: number
  ) {
    const expDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(email, userId, token, expDate);

    // this.user.next(user);
    this.store.dispatch(
      new AuthActions.Login({
        email: email,
        userId: userId,
        token: token,
        expirationDate: expDate
      })
    );
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem("userData", JSON.stringify(user));
  }

  private handleError(errorRes: HttpErrorResponse) {
    let error = "An unknown error occured!";
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(error);
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
    return throwError(error);
  }
}
