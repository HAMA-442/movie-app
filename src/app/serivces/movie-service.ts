import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Genre, Movie, MovieVideo } from '../interfaces/movie';
import { MovieResopnse } from '../interfaces/movie-resopnse';

const WISH_KEY = 'movie-app-wishlist';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.url_api;
  private readonly apiKey = environment.api_key;
  readonly imageUrl = environment.url_image;

  /** Wish list (kept in localStorage) */
  readonly wishList = signal<Movie[]>(this.loadWishList());

  getMovieList(): Observable<Movie[]> {
    return this.http
      .get<MovieResopnse>(`${this.url}/movie/now_playing?api_key=${this.apiKey}`)
      .pipe(map((response) => response.results));
  }

  getMovieById(id: number | string): Observable<Movie> {
    return this.http.get<Movie>(`${this.url}/movie/${id}?api_key=${this.apiKey}`);
  }

  getMovieByTitle(title: string): Observable<Movie[]> {
    return this.http
      .get<MovieResopnse>(
        `${this.url}/search/movie?query=${encodeURIComponent(title)}&api_key=${this.apiKey}`,
      )
      .pipe(map((response) => response.results));
  }

  /** Récupère la liste des genres officiels de TMDB */
  getGenres(): Observable<Genre[]> {
    return this.http
      .get<{ genres: Genre[] }>(`${this.url}/genre/movie/list?api_key=${this.apiKey}`)
      .pipe(map((res) => res.genres || []));
  }

  /** Récupère les vidéos / bandes-annonces d'un film */
  getMovieVideos(id: number | string): Observable<MovieVideo[]> {
    return this.http
      .get<{ results: MovieVideo[] }>(`${this.url}/movie/${id}/videos?api_key=${this.apiKey}`)
      .pipe(map((res) => res.results || []));
  }

  /**
   * Sélectionne un film aléatoire selon les filtres choisis
   * et récupère ses détails complets (durée runtime, genres, etc.)
   */
  getRandomMovie(filters?: {
    genreId?: number | null;
    minRating?: number | null;
    era?: string | null;
    excludeIds?: number[];
  }): Observable<Movie> {
    let query = `${this.url}/discover/movie?api_key=${this.apiKey}&vote_count.gte=30`;

    if (filters?.genreId) {
      query += `&with_genres=${filters.genreId}`;
    }
    if (filters?.minRating) {
      query += `&vote_average.gte=${filters.minRating}`;
    }
    if (filters?.era) {
      switch (filters.era) {
        case '2020s':
          query += '&primary_release_date.gte=2020-01-01';
          break;
        case '2010s':
          query += '&primary_release_date.gte=2010-01-01&primary_release_date.lte=2019-12-31';
          break;
        case '2000s':
          query += '&primary_release_date.gte=2000-01-01&primary_release_date.lte=2009-12-31';
          break;
        case '1990s':
          query += '&primary_release_date.gte=1990-01-01&primary_release_date.lte=1999-12-31';
          break;
        case 'classic':
          query += '&primary_release_date.lte=1989-12-31';
          break;
      }
    }

    // Varier les pages pour maximiser la surprise (pages 1 à 6)
    const randomPage = Math.floor(Math.random() * 6) + 1;
    query += `&page=${randomPage}`;

    return this.http.get<MovieResopnse>(query).pipe(
      catchError(() =>
        this.http.get<MovieResopnse>(`${this.url}/movie/now_playing?api_key=${this.apiKey}`)
      ),
      map((res) => {
        let list = res.results || [];
        if (filters?.excludeIds && filters.excludeIds.length > 0) {
          const notSeen = list.filter((m) => !filters.excludeIds!.includes(m.id));
          if (notSeen.length > 0) {
            list = notSeen;
          }
        }
        if (list.length === 0) {
          throw new Error('No movies found matching these criteria.');
        }
        const randomIndex = Math.floor(Math.random() * list.length);
        return list[randomIndex];
      }),
      switchMap((chosenMovie) =>
        this.getMovieById(chosenMovie.id).pipe(catchError(() => of(chosenMovie)))
      )
    );
  }

  isInWishList(id: number): boolean {
    return this.wishList().some((m) => m.id === id);
  }

  toggleWishList(movie: Movie): void {
    this.wishList.update((list) =>
      list.some((m) => m.id === movie.id) ? list.filter((m) => m.id !== movie.id) : [...list, movie],
    );
    try {
      localStorage.setItem(WISH_KEY, JSON.stringify(this.wishList()));
    } catch {
      /* stockage indisponible : on garde la liste en mémoire */
    }
  }

  private loadWishList(): Movie[] {
    try {
      return JSON.parse(localStorage.getItem(WISH_KEY) ?? '[]');
    } catch {
      return [];
    }
  }
}
