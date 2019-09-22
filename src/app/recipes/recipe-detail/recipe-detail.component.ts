import { Component, OnInit, Input } from "@angular/core";
import { Recipe } from "../recipe.model";
import { RecipeSercice } from "../recipe.service";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import * as fromApp from "../../store/app.reducer";
import { map, switchMap } from "rxjs/operators";
import { stat } from "fs";

@Component({
  selector: "app-recipe-detail",
  templateUrl: "./recipe-detail.component.html",
  styleUrls: ["./recipe-detail.component.css"]
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe;
  id: number;
  constructor(
    private recipeService: RecipeSercice,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.AppState>
  ) {}

  ngOnInit() {
    this.route.params
      .pipe(
        map(params => +params["id"]),
        switchMap(id => {
          this.id = id;
          return this.store.select("recipes");
        }),
        map(state =>
          state.recipes.find((recipe, index) => {
            return index === this.id;
          })
        )
      )
      .subscribe(recipe => (this.recipe = recipe));

    // this.recipe = this.recipeService.getRecipe(this.id);
  }

  onAddToShoppingList() {
    this.recipeService.addIngredientsToShoppingList(this.recipe.ingredients);
  }

  onEditRecipe() {
    this.router.navigate(["edit"], { relativeTo: this.route });
    //this.router.navigate(["../", this.id, "edit"], { relativeTo: this.route });
  }
  onDeleteRecipe() {
    this.recipeService.deleleRecipe(this.id);
    this.router.navigate(["/recipes"]);
  }
}
