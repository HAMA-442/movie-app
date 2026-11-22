import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { debounceTime, switchMap } from 'rxjs';
import { MovieService } from '../../serivces/movie-service';

@Component({
  imports: [CommonModule, RouterLink],
  selector: 'app-movie-search',
  styleUrl: './movie-search.css',
  templateUrl: './movie-search.html',
})
export class MovieSearch {
  movieService = inject(MovieService);
  title = input.required<string>();
  sortBy = input<string>('default');

  /** Films bruts issus de la recherche TMDB */
  private readonly rawMovies = toSignal(
    toObservable(this.title).pipe(
      debounceTime(300),
      switchMap((title) => this.movieService.getMovieByTitle(title)),
    ),
    { initialValue: [] },
  );

  /** Films triés selon le critère choisi */
  movies = computed(() => {
    const list = [...this.rawMovies()];
    switch (this.sortBy()) {
      case 'vote_desc':
        return list.sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0));
      case 'vote_asc':
        return list.sort((a, b) => (a.vote_average ?? 0) - (b.vote_average ?? 0));
      case 'date_desc':
        return list.sort(
          (a, b) => new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime(),
        );
      case 'date_asc':
        return list.sort(
          (a, b) => new Date(a.release_date || 0).getTime() - new Date(b.release_date || 0).getTime(),
        );
      case 'title_asc':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      case 'title_desc':
        return list.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return list;
    }
  });
}
