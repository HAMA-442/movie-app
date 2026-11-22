import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowDownWideShort, faArrowLeft, faFilm, faHeart, faTrash } from '@fortawesome/free-solid-svg-icons';
import { MovieService } from '../../serivces/movie-service';
import { Movie } from '../../interfaces/movie';

@Component({
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  selector: 'app-wish-list',
  styleUrl: './wish-list.css',
  templateUrl: './wish-list.html',
})
export class WishList {
  movieService = inject(MovieService);
  faTrash = faTrash;
  faHeart = faHeart;
  faArrowLeft = faArrowLeft;
  faFilm = faFilm;
  faSort = faArrowDownWideShort;

  sortBy = signal<string>('default');

  sortedWishList = computed(() => {
    const list = [...this.movieService.wishList()];
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

  removeMovie(movie: Movie, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.movieService.toggleWishList(movie);
  }

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sortBy.set(target.value);
  }
}
