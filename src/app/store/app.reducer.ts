import * as fromShoppingList from "../shopping-list/store/shopping-list.reducer";
import * as fromAuth from "../auth/store/auth.reducer";
import { ActionReducerMap } from "@ngrx/store";

export interface AppState {
  shoppingList: fromShoppingList.State;
  auth: fromAuth.State;
}

export const AppReducer: ActionReducerMap<AppState> = {
  shoppingList: fromShoppingList.shoppingListReducer,
  auth: fromAuth.authReducer
};
