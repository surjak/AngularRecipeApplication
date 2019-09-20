import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  OnDestroy
} from "@angular/core";
import { DataStorageService } from "../shared/data-storage.service";
import { AuthService } from "../auth/auth.service";
import { Subscription } from "rxjs";
import { Store } from "@ngrx/store";
import * as fromApp from "../store/app.reducer";
import { map } from "rxjs/operators";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html"
})
export class HeaderComponent implements OnInit, OnDestroy {
  private userSub: Subscription;
  isAuth = false;
  constructor(
    private dataSS: DataStorageService,
    private authService: AuthService,
    private store: Store<fromApp.AppState>
  ) {}

  ngOnInit() {
    this.userSub = this.store
      .select("auth")
      .pipe(map(state => state.user))
      .subscribe(user => {
        this.isAuth = !!user;
      });
  }

  onLogout() {
    this.authService.logout();
  }

  onSaveData() {
    this.dataSS.storeRecipes();
  }
  onFetchData() {
    this.dataSS.fetchRecipes().subscribe();
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }
}
