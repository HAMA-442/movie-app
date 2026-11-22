import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowDownWideShort, faDice } from '@fortawesome/free-solid-svg-icons';
import { MovieService } from '../../serivces/movie-service';
import { Movie } from '../../interfaces/movie';
import { SearchBar } from '../search-bar/search-bar';
import { MovieSearch } from '../movie-search/movie-search';
import { SurpriseMe } from '../surprise-me/surprise-me';

@Component({
  imports: [CommonModule, FontAwesomeModule, RouterLink, SearchBar, MovieSearch, SurpriseMe],
  selector: 'app-movie-list',
  styleUrl: './movie-list.css',
  templateUrl: './movie-list.html',
})
export class MovieList implements OnInit {
  movieService = inject(MovieService);
  faSort = faArrowDownWideShort;
  faDice = faDice;

  movies = signal<Movie[]>([]);
  searchTitle = signal('');
  sortBy = signal<string>('default');
  isSurpriseOpen = signal(false);

  /** Liste réactive des films triée selon le critère sélectionné */
  sortedMovies = computed(() => {
    const list = [...this.movies()];
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

  ngOnInit(): void {
    this.movieService.getMovieList().subscribe((response) => this.movies.set(response));
  }

  onSearch(title: string): void {
    this.searchTitle.set(title);
  }

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sortBy.set(target.value);
  }

  openSurpriseMe(): void {
    this.isSurpriseOpen.set(true);
  }
}
