import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './Pages/home/home.component';
import { LoginComponent } from './Pages/login/login.component';
import { DetailComponent } from './Pages/detail/detail.component';
import { MoviesComponent } from './Pages/movies/movies.component';
import { ProfileComponent } from './Pages/profile/profile.component';
import { RegisterComponent } from './Pages/register/register.component';
import { SeriesComponent } from './Pages/series/series.component';

const routes: Routes = [
  { path: '', redirectTo: 'index', pathMatch: 'full' }, 
  { path: 'index', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'movies', component: MoviesComponent },
  { path: 'series', component: SeriesComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'detail/:id', component: DetailComponent },
  { path: '**', redirectTo: 'index' } 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
