import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TmdbService {
  private apiKey: string = 'cedf03df849ac2c6c598b1e5804b0754';
  private baseUrl: string = 'https://api.themoviedb.org/3';

  constructor(private http: HttpClient) {}

  getMovieGenres(): Observable<any> {
    return this.http.get(`${this.baseUrl}/genre/movie/list`, {
      params: {
        api_key: this.apiKey,
        language: 'es-ES'
      }
    });
  }

  discoverMovies(filters: any, page: number = 1): Observable<any> {
    return this.http.get(`${this.baseUrl}/discover/movie`, {
      params: {
        api_key: this.apiKey,
        language: 'es-ES',
        sort_by: filters.sort_by || 'popularity.desc',
        with_genres: filters.genre || '',
        'primary_release_year': filters.year || '',
        'vote_average.gte': filters.rating || '',
        page: page
      }
    });
  }

  searchMovies(query: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/search/movie`, {
      params: {
        api_key: this.apiKey,
        language: 'es-ES',
        query: query
      }
    });
  }

  getMovieDetail(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/movie/${id}`, {
      params: {
        api_key: this.apiKey,
        language: 'es-ES'
      }
    });
  }
  
  getMovieCredits(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/movie/${id}/credits`, {
      params: {
        api_key: this.apiKey,
        language: 'es-ES'
      }
    });
  }

  getSeriesGenres(): Observable<any> {
    return this.http.get(`${this.baseUrl}/genre/tv/list`, {
      params: {
        api_key: this.apiKey,
        language: 'es-ES'
      }
    });
  }

  discoverSeries(filters: any, page: number = 1): Observable<any> {
    return this.http.get(`${this.baseUrl}/discover/tv`, {
      params: {
        api_key: this.apiKey,
        language: 'es-ES',
        sort_by: filters.sort_by || 'popularity.desc',
        with_genres: filters.genre || '',
        'first_air_date_year': filters.year || '',
        'vote_average.gte': filters.rating || '',
        page: page
      }
    });
  }

  searchSeries(query: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/search/tv`, {
      params: {
        api_key: this.apiKey,
        language: 'es-ES',
        query: query
      }
    });
  }

  getSeriesDetail(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/tv/${id}`, {
      params: {
        api_key: this.apiKey,
        language: 'es-ES'
      }
    });
  }
  
  getSeriesCredits(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/tv/${id}/credits`, {
      params: {
        api_key: this.apiKey,
        language: 'es-ES'
      }
    });
  }

  getVideos(type: 'movie' | 'tv', id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${type}/${id}/videos`, {
      params: {
        api_key: this.apiKey,
        language: 'es-ES'
      }
    });
  }
}