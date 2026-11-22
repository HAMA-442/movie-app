import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faHeart, faStar } from '@fortawesome/free-solid-svg-icons';
import { switchMap } from 'rxjs';
import { MovieService } from '../../serivces/movie-service';
import { Movie } from '../../interfaces/movie';

@Component({
  imports: [CommonModule, DatePipe, FontAwesomeModule, RouterLink],
  selector: 'app-movie-detail',
  styleUrl: './movie-detail.css',
  templateUrl: './movie-detail.html',
})
export class MovieDetail {
  movieService = inject(MovieService);
  faHeart = faHeart;
  faArrowLeft = faArrowLeft;
  faStar = faStar;
  /** Paramètre de route :id (withComponentInputBinding) */
  id = input.required<string>();

  movie = toSignal(
    toObservable(this.id).pipe(switchMap((id) => this.movieService.getMovieById(id))),
  );

  toggleWish(movie: Movie): void {
    this.movieService.toggleWishList(movie);
  }

  isWished(movie: Movie): boolean {
    return this.movieService.isInWishList(movie.id);
  }
}
