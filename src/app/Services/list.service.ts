import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ListService {
  private baseUrl = 'https://nextwatch-backend.onrender.com/routes';

  constructor(private http: HttpClient) {}

  getList(usuarioId: number) {
    return this.http.get(`${this.baseUrl}/get-user-list.php?usuario_id=${usuarioId}`);
  }

  addItem(payload: { usuario_id: number; tmdb_id: number; tipo: string; vista: boolean }) {
    return this.http.post(`${this.baseUrl}/add-to-list.php`, payload);
  }

  deleteItem(payload: { usuario_id: number; tmdb_id: number; tipo: string; vista: boolean }) {
    return this.http.post(`${this.baseUrl}/remove-from-list.php`, payload);
  }

  markViewed(payload: { usuario_id: number; tmdb_id: number; tipo: string; vista: boolean }) {
    return this.http.post(`${this.baseUrl}/mark-as-watched.php`, payload);
  }
}
