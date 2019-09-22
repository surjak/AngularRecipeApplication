//Not Used, all is refactored to ngrx

import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { RecipeSercice } from "../recipes/recipe.service";
import { Recipe } from "../recipes/recipe.model";
import { map, tap, take, exhaustMap } from "rxjs/operators";
import { AuthService } from "../auth/auth.service";
import { Store } from "@ngrx/store";
import * as fromApp from "../store/app.reducer";
import * as RecipesActions from "../recipes/store/recipe.actions";
@Injectable({ providedIn: "root" })
export class DataStorageService {
  constructor(
    private http: HttpClient,
    private recipeService: RecipeSercice,
    private authService: AuthService,
    private store: Store<fromApp.AppState>
  ) {}

  storeRecipes() {
    const recipes = this.recipeService.getRecipes();
    this.http
      .put("https://recipeshop-b1623.firebaseio.com/recipes.json", recipes)
      .subscribe(res => {
        console.log(res);
      });
  }

  fetchRecipes() {
    return this.http
      .get<Recipe[]>("https://recipeshop-b1623.firebaseio.com/recipes.json")
      .pipe(
        map(recipes => {
          return recipes.map(recipe => {
            return {
              ...recipe,
              ingredients: recipe.ingredients ? recipe.ingredients : []
            };
          });
        }),
        tap(recipes => {
          // this.recipeService.setRecipes(recipes);
          this.store.dispatch(new RecipesActions.SetRecipes(recipes));
        })
      );
  }
}
