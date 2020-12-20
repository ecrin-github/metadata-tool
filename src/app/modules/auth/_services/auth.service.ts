import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import {AuthModel} from '../_models/auth.model';
import {environment} from 'src/environments/environment';
import {Router} from '@angular/router';


@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  // private fields
  private unsubscribe: Subscription[] = [];
  private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;

  // public fields
  userData: AuthModel;
  currentUser$: Observable<AuthModel>;
  isLoading$: Observable<boolean>;
  currentUserSubject: BehaviorSubject<AuthModel>;
  isLoadingSubject: BehaviorSubject<boolean>;


  get currentUserValue(): AuthModel {
    return this.currentUserSubject.value;
  }

  set currentUserValue(user: AuthModel) {
    this.currentUserSubject.next(user);
  }

  constructor(
    private router: Router
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<AuthModel>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoading$ = this.isLoadingSubject.asObservable();
    const subscr = this.getUserByToken().subscribe();
    this.unsubscribe.push(subscr);
  }

  signInWithGoogle(){}

  socialSignOut(): void {}

  socialAuthState(){}

  // public methods
  login(): Observable<AuthModel> {
    this.isLoadingSubject.next(true);
    this.socialAuthState();
    if (this.userData !== null) {
      const result = this.setAuthFromLocalStorage(this.userData);
      if (result){
        return this.getUserByToken();
      } else {
        this.socialSignOut();
        this.router.navigate(['/auth/login'], {
          queryParams: {},
        });
      }
      this.isLoadingSubject.next(false);
    } else {
      this.isLoadingSubject.next(false);
    }
  }

  logout() {
    this.socialSignOut();
    localStorage.removeItem(this.authLocalStorageToken);
    this.router.navigate(['/auth/login'], {
      queryParams: {},
    });
  }

  getUserByToken(): Observable<AuthModel> {
    const auth = this.getAuthFromLocalStorage();
    if (!auth || !auth.accessToken) {
      return of(undefined);
    }
    const user: any = null;
    this.isLoadingSubject.next(true);
    if (user) {
      this.currentUserSubject = new BehaviorSubject<AuthModel>(user);
    } else {
      this.logout();
    }
    this.isLoadingSubject.next(false);
    return user;
  }

  // private methods
  private setAuthFromLocalStorage(userData): boolean {
    if (userData) {
      localStorage.setItem(this.authLocalStorageToken, JSON.stringify(userData));
      return true;
    }
    return false;
  }

  private getAuthFromLocalStorage(): AuthModel {
    try {
      return JSON.parse(
        localStorage.getItem(this.authLocalStorageToken)
      );
    } catch (error) {
      return undefined;
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
