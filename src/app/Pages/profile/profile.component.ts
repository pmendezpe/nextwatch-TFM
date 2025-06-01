import { Component, OnInit } from '@angular/core';
import { ListService } from '../../Services/list.service';
import { Router } from '@angular/router';
import { TmdbService } from '../../Services/tmdb.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  usuario: any = null;
  lista: any[] = [];

  constructor(
    private listService: ListService,
    private tmdbService: TmdbService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('usuario');
    if (userData) {
      this.usuario = JSON.parse(userData);
      this.loadList();
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadList(): void {
    this.listService.getList(this.usuario.id).subscribe((res: any) => {
      const peticiones = res.map((item: any) => {
        const fuente$ =
          item.tipo === 'movie'
            ? this.tmdbService.getMovieDetail(item.tmdb_id)
            : this.tmdbService.getSeriesDetail(item.tmdb_id);

        return fuente$.toPromise().then((detalle: any) => ({
          ...detalle,
          tmdb_id: item.tmdb_id,
          tipo: item.tipo,
          vista: !!item.vista
        }));
      });

      Promise.all(peticiones).then(detallesCompletos => {
        this.lista = detallesCompletos;
      });
    });
  }

  deleteItem(item: any): void {
    const payload = {
      usuario_id: this.usuario.id,
      tmdb_id: item.tmdb_id,
      tipo: item.tipo,
      vista: item.vista
    };

    this.listService.deleteItem(payload).subscribe(() => {
      this.lista = this.lista.filter(i => i.tmdb_id !== item.tmdb_id || i.tipo !== item.tipo);
    });
  }

  markViewed(item: any): void {
    const nuevoEstado = !item.vista;

    const payload = {
      usuario_id: this.usuario.id,
      tmdb_id: item.tmdb_id,
      tipo: item.tipo,
      vista: nuevoEstado
    };

    this.listService.markViewed(payload).subscribe(() => {
      item.vista = nuevoEstado;
    });
  }

  logOut(): void {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}