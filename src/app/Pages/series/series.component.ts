import { Component, HostListener, OnInit } from '@angular/core';
import { TmdbService } from '../../Services/tmdb.service';
import { ListService } from '../../Services/list.service';

@Component({
  selector: 'app-series',
  templateUrl: './series.component.html',
  styleUrls: ['./series.component.css']
})
export class SeriesComponent implements OnInit {
  series: any[] = [];
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
        this.loadSeries();
      });
    } else {
      this.loadSeries(); 
    }

    this.tmdbService.getSeriesGenres().subscribe(res => {
      this.genres = res.genres;
    });
  }

  searchSeries(): void {
    if (this.query.trim() === '') {
      this.filterSeries();
      return;
    }

    this.tmdbService.searchSeries(this.query).subscribe(res => {
      let mappedResults = res.results.map((serie: any) => {
        const item = this.usuario
          ? this.listaUsuario.find(m => m.tmdb_id === serie.id && m.tipo === 'tv')
          : null;
        return {
          ...serie,
          vista: !!item?.vista
        };
      });

      if (this.selectedState === 'visto') {
        mappedResults = mappedResults.filter((s: { vista: any }) => s.vista);
      } else if (this.selectedState === 'pendiente') {
        mappedResults = mappedResults.filter((s: { vista: any }) => !s.vista);
      }

      this.series = mappedResults;
    });
  }

  loadSeries(): void {
    if (this.isLoading) return;
    this.isLoading = true;

    const filters = {
      genre: this.selectedGenre,
      year: this.selectedYear,
      rating: this.selectedRating,
      sort_by: this.selectedSort
    };

    this.tmdbService.discoverSeries(filters, this.currentPage).subscribe(res => {
      let newSeries = res.results.map((serie: any) => {
        const item = this.usuario
          ? this.listaUsuario.find(m => m.tmdb_id === serie.id && m.tipo === 'tv')
          : null;
        return {
          ...serie,
          vista: !!item?.vista
        };
      });

      if (this.selectedState === 'visto') {
        newSeries = newSeries.filter((s: { vista: any }) => s.vista);
      } else if (this.selectedState === 'pendiente') {
        newSeries = newSeries.filter((s: { vista: any }) => !s.vista);
      }

      const uniqueNewSeries = newSeries.filter((newSerie: { id: any }) =>
        !this.series.some(existing => existing.id === newSerie.id)
      );

      this.series.push(...uniqueNewSeries);
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
          this.loadSeries();
        });
      } else {
        this.loadSeries();
      }
    }
  }

  filterSeries(): void {
    this.series = [];
    this.currentPage = 1;

    if (this.usuario) {
      this.listService.getList(this.usuario.id).subscribe((res: any) => {
        this.listaUsuario = res;
        this.loadSeries();
      });
    } else {
      this.loadSeries();
    }
  }

  addItem(serie: any): void {
    if (!this.usuario?.id) return;

    this.listService.addItem({
      usuario_id: this.usuario.id,
      tmdb_id: serie.id,
      tipo: 'tv',
      vista: false
    }).subscribe();
  }

  markViewed(serie: any): void {
    if (!this.usuario?.id) return;

    const nuevoEstado = !serie.vista;

    this.listService.markViewed({
      usuario_id: this.usuario.id,
      tmdb_id: serie.id,
      tipo: 'tv',
      vista: nuevoEstado
    }).subscribe(() => {
      serie.vista = nuevoEstado;

      const index = this.listaUsuario.findIndex(m => m.tmdb_id === serie.id && m.tipo === 'tv');

      if (index !== -1) {
        this.listaUsuario[index].vista = nuevoEstado;
      } else {
        this.listaUsuario.push({
          usuario_id: this.usuario.id,
          tmdb_id: serie.id,
          tipo: 'tv',
          vista: nuevoEstado
        });
      }

      this.listService.getList(this.usuario.id).subscribe((res: any) => {
        this.listaUsuario = res;
      });
    });
  }
}