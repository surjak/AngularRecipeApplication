import { Injectable } from "@angular/core";
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from "@angular/router";
import { Recipe } from "./recipe.model";
import { DataStorageService } from "../shared/data-storage.service";
import { RecipeSercice } from "./recipe.service";
import { Store } from "@ngrx/store";
import * as fromApp from "../store/app.reducer";
import * as RecipeActions from "./store/recipe.actions";
import { Actions, ofType } from "@ngrx/effects";
import { take, map, switchMap } from "rxjs/operators";
import { of } from "rxjs";

@Injectable({ providedIn: "root" })
export class RecipeResolverService implements Resolve<Recipe[]> {
  constructor(
    private dataSS: DataStorageService,
    private recipeService: RecipeSercice,
    private store: Store<fromApp.AppState>,
    private actions$: Actions
  ) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    //const recipes = this.recipeService.getRecipes();
    return this.store.select("recipes").pipe(
      take(1),
      map(state => state.recipes),
      switchMap(recipes => {
        if (recipes.length === 0) {
          this.store.dispatch(new RecipeActions.FetchRecipes());
          return this.actions$.pipe(
            ofType(RecipeActions.SET_RECIPES),
            take(1)
          );
        } else {
          return of(recipes);
        }
      })
    );
    // if (recipes.length === 0) {
    // return this.dataSS.fetchRecipes();

    // } else {
    //   return recipes;
    // }
  }
}
