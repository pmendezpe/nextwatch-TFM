import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TmdbService } from '../../Services/tmdb.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { ListService } from '../../Services/list.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent {
  detail: any;
  director: string = '';
  trailerUrl: SafeResourceUrl | null = null;

  comment: string = '';
  comments: any[] = [];
  likedComments: number[] = [];

  usuario: any = null;
  listaUsuario: any[] = [];

  tipo: 'movie' | 'tv' = 'movie';
  id: string = '';
  vista: boolean = false;

  replyInputs: { [key: number]: string } = {}; 
  showReplyBox: { [key: number]: boolean } = {}; 

  constructor(
    private route: ActivatedRoute,
    private tmdbService: TmdbService,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private listService: ListService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    const tipoParam = this.route.snapshot.queryParamMap.get('type');
    this.tipo = tipoParam === 'tv' ? 'tv' : 'movie';

    const data = localStorage.getItem('usuario');
    if (data) {
      this.usuario = JSON.parse(data);
      this.listService.getList(this.usuario.id).subscribe((res: any) => {
        this.listaUsuario = res;
        const item = this.listaUsuario.find(m => m.tmdb_id === Number(this.id) && m.tipo === this.tipo);
        this.vista = !!item?.vista;
      });

      this.http.get<number[]>(`https://nextwatch-backend.onrender.com/routes/get-user-likes.php?usuario_id=${this.usuario.id}`)
        .subscribe(res => {
          this.likedComments = res;
        });
    }

    if (this.tipo === 'movie') {
      this.tmdbService.getMovieDetail(this.id).subscribe(res => this.detail = res);
      this.tmdbService.getMovieCredits(this.id).subscribe(res => {
        const directorObj = res.crew.find((person: any) => person.job === 'Director');
        this.director = directorObj?.name || 'Desconocido';
      });
    } else {
      this.tmdbService.getSeriesDetail(this.id).subscribe(res => {
        this.detail = res;
        this.director = res.created_by?.[0]?.name || 'Desconocido';
      });
    }

    this.tmdbService.getVideos(this.tipo, this.id).subscribe(res => {
      const trailer = res.results.find((video: any) =>
        video.type === 'Trailer' && video.site === 'YouTube'
      );
      if (trailer) {
        this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.youtube.com/embed/${trailer.key}`
        );
      }
    });

    this.loadComments();
  }

  loadComments(): void {
    this.http.get<any[]>(`https://nextwatch-backend.onrender.com/routes/get-comments.php?id=${this.id}&type=${this.tipo}`)
      .subscribe(res => {
        const rootComments = res.filter(c => !c.parent_id);
        const replyMap: { [key: number]: any[] } = {};

        res.forEach(comment => {
          if (comment.parent_id) {
            if (!replyMap[comment.parent_id]) replyMap[comment.parent_id] = [];
            replyMap[comment.parent_id].push(comment);
          }
        });

        rootComments.forEach(root => {
          root.replies = replyMap[root.id] || [];
        });

        this.comments = rootComments;
      });
  }

  addItem(): void {
    if (!this.usuario?.id) return;

    this.listService.addItem({
      usuario_id: this.usuario.id,
      tmdb_id: this.detail.id,
      tipo: this.tipo,
      vista: false
    }).subscribe();
  }

  markViewed(): void {
    if (!this.usuario?.id) return;

    const nuevoEstado = !this.vista;

    this.listService.markViewed({
      usuario_id: this.usuario.id,
      tmdb_id: this.detail.id,
      tipo: this.tipo,
      vista: nuevoEstado
    }).subscribe(() => {
      this.vista = nuevoEstado;

      const index = this.listaUsuario.findIndex(m => m.tmdb_id === this.detail.id && m.tipo === this.tipo);
      if (index !== -1) {
        this.listaUsuario[index].vista = nuevoEstado;
      } else {
        this.listaUsuario.push({
          usuario_id: this.usuario.id,
          tmdb_id: this.detail.id,
          tipo: this.tipo,
          vista: nuevoEstado
        });
      }

      this.listService.getList(this.usuario.id).subscribe((res: any) => {
        this.listaUsuario = res;
      });
    });
  }

  submitComment(): void {
    if (!this.usuario || !this.comment.trim()) return;

    const newComment = {
      user: this.usuario.nombre,
      content: this.comment,
      id_title: this.detail.id,
      type: this.tipo
    };

    this.http.post('https://nextwatch-backend.onrender.com/routes/post-comment.php', newComment)
      .subscribe(() => {
        this.comment = '';
        this.loadComments();
      });
  }

  isProcessingLike: boolean = false;

  toggleLike(comment: any): void {
    if (!this.usuario?.id || !comment.id || this.isProcessingLike) return;

    this.isProcessingLike = true;

    const payload = {
      comentario_id: comment.id,
      usuario_id: this.usuario.id
    };

    this.http.post<{ likes: number }>(
      'https://nextwatch-backend.onrender.com/routes/toggle-like.php',
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ).subscribe({
      next: res => {
        comment.likes = res.likes;

        const likedIndex = this.likedComments.indexOf(comment.id);
        if (likedIndex !== -1) {
          this.likedComments.splice(likedIndex, 1);
        } else {
          this.likedComments.push(comment.id);
        }
      },
      error: err => {
        console.error("Error al hacer toggle-like:", err);
      },
      complete: () => {
        this.isProcessingLike = false;
      }
    });
  }

  hasLiked(commentId: number): boolean {
    return this.likedComments.includes(commentId);
  }

  toggleReplyBox(commentId: number): void {
    this.showReplyBox[commentId] = !this.showReplyBox[commentId];
    if (!this.replyInputs[commentId]) this.replyInputs[commentId] = '';
  }

  submitReply(parentId: number): void {
    const reply = this.replyInputs[parentId]?.trim();
    if (!this.usuario || !reply) return;

    const replyData = {
      user: this.usuario.nombre,
      content: reply,
      id_title: this.detail.id,
      type: this.tipo,
      parent_id: parentId
    };

    this.http.post('https://nextwatch-backend.onrender.com/routes/post-comment.php', replyData)
      .subscribe(() => {
        this.replyInputs[parentId] = '';
        this.showReplyBox[parentId] = false;
        this.loadComments();
      });
  }
}
