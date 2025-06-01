import { Component, HostListener, OnInit } from '@angular/core';
import { TmdbService } from '../../Services/tmdb.service';
import { ListService } from '../../Services/list.service';

@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.css']
})
export class MoviesComponent implements OnInit {
  movies: any[] = [];
  genres: any[] = [];
  query: string = '';

  selectedGenre: string = '';
  selectedYear: string = '';
  selectedRating: string = '';
  selectedState: string = '';
  selectedSort: string = '';

  currentPage: number = 1;
  isLoading: boolean = false;
  usuario: any = null;
  listaUsuario: any[] = [];

  constructor(private tmdbService: TmdbService, private listService: ListService) {}

  ngOnInit(): void {
    const data = localStorage.getItem('usuario');
    if (data) {
      this.usuario = JSON.parse(data);
      this.listService.getList(this.usuario.id).subscribe((res: any) => {
        this.listaUsuario = res;
        this.loadMovies();
      });
    } else {
      this.loadMovies(); 
    }

    this.tmdbService.getMovieGenres().subscribe(res => {
      this.genres = res.genres;
    });
  }

  searchMovies(): void {
    if (this.query.trim() === '') {
      this.filterMovies();
      return;
    }

    this.tmdbService.searchMovies(this.query).subscribe(res => {
      let mappedResults = res.results.map((movie: any) => {
        const item = this.usuario
          ? this.listaUsuario.find(m => m.tmdb_id === movie.id && m.tipo === 'movie')
          : null;
        return {
          ...movie,
          vista: !!item?.vista
        };
      });

      if (this.selectedState === 'visto') {
        mappedResults = mappedResults.filter((m: { vista: boolean }) => m.vista === true);
      } else if (this.selectedState === 'pendiente') {
        mappedResults = mappedResults.filter((m: { vista: boolean }) => m.vista === false);
      }

      this.movies = mappedResults;
    });
  }

  loadMovies(): void {
    if (this.isLoading) return;
    this.isLoading = true;

    const filters = {
      genre: this.selectedGenre,
      year: this.selectedYear,
      rating: this.selectedRating,
      sort_by: this.selectedSort
    };

    this.tmdbService.discoverMovies(filters, this.currentPage).subscribe(res => {
      let newMovies = res.results.map((movie: any) => {
        const item = this.usuario
          ? this.listaUsuario.find(m => m.tmdb_id === movie.id && m.tipo === 'movie')
          : null;
        return {
          ...movie,
          vista: !!item?.vista
        };
      });

      if (this.selectedState === 'visto') {
        newMovies = newMovies.filter((m: { vista: boolean }) => m.vista === true);
      } else if (this.selectedState === 'pendiente') {
        newMovies = newMovies.filter((m: { vista: boolean }) => m.vista === false);
      }

      const uniqueNewMovies = newMovies.filter((newMovie: { id: any }) =>
        !this.movies.some(existing => existing.id === newMovie.id)
      );

      this.movies.push(...uniqueNewMovies);
      this.isLoading = false;
    });
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    const bottomReached = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 100);
    if (bottomReached) {
      this.currentPage++;
      if (this.usuario) {
        this.listService.getList(this.usuario.id).subscribe((res: any) => {
          this.listaUsuario = res;
          this.loadMovies();
        });
      } else {
        this.loadMovies();
      }
    }
  }

  filterMovies(): void {
    this.movies = [];
    this.currentPage = 1;

    if (this.usuario) {
      this.listService.getList(this.usuario.id).subscribe((res: any) => {
        this.listaUsuario = res;
        this.loadMovies();
      });
    } else {
      this.loadMovies();
    }
  }

  addItem(movie: any): void {
    if (!this.usuario?.id) return;

    this.listService.addItem({
      usuario_id: this.usuario.id,
      tmdb_id: movie.id,
      tipo: 'movie',
      vista: false
    }).subscribe();
  }

  markViewed(movie: any): void {
    if (!this.usuario?.id) return;

    const nuevoEstado = !movie.vista;

    this.listService.markViewed({
      usuario_id: this.usuario.id,
      tmdb_id: movie.id,
      tipo: 'movie',
      vista: nuevoEstado
    }).subscribe(() => {
      movie.vista = nuevoEstado;

      const index = this.listaUsuario.findIndex(m => m.tmdb_id === movie.id && m.tipo === 'movie');

      if (index !== -1) {
        this.listaUsuario[index].vista = nuevoEstado;
      } else {
        this.listaUsuario.push({
          usuario_id: this.usuario.id,
          tmdb_id: movie.id,
          tipo: 'movie',
          vista: nuevoEstado
        });
      }

      this.listService.getList(this.usuario.id).subscribe((res: any) => {
        this.listaUsuario = res;
      });
    });
  }
}
