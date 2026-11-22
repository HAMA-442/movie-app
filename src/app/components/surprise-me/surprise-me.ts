import { CommonModule } from '@angular/common';
import { Component, effect, inject, model, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCalendarAlt,
  faClock,
  faDice,
  faFilm,
  faHeart,
  faPlay,
  faRotateRight,
  faSliders,
  faStar,
  faTimes,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { MovieService } from '../../serivces/movie-service';
import { Genre, Movie } from '../../interfaces/movie';

@Component({
  imports: [CommonModule, FontAwesomeModule, RouterLink],
  selector: 'app-surprise-me',
  styleUrl: './surprise-me.css',
  templateUrl: './surprise-me.html',
})
export class SurpriseMe implements OnInit {
  private readonly movieService = inject(MovieService);
  private readonly sanitizer = inject(DomSanitizer);

  /** Contrôle l'ouverture du modal */
  isOpen = model<boolean>(false);

  // Icônes FontAwesome
  faDice = faDice;
  faPlay = faPlay;
  faRotateRight = faRotateRight;
  faHeart = faHeart;
  faSliders = faSliders;
  faXmark = faXmark;
  faStar = faStar;
  faClock = faClock;
  faCalendarAlt = faCalendarAlt;
  faFilm = faFilm;
  faTimes = faTimes;

  // État du film et du chargement
  isLoading = signal(false);
  movie = signal<Movie | null>(null);
  errorMessage = signal<string | null>(null);
  private seenMovieIds: number[] = [];

  // État de la bande-annonce
  trailerUrl = signal<SafeResourceUrl | null>(null);
  showTrailer = signal(false);
  trailerError = signal<string | null>(null);
  trailerKey = signal<string | null>(null);

  // Filtres optionnels
  genres = signal<Genre[]>([]);
  filtersOpen = signal(false);
  selectedGenre = signal<number | null>(null);
  selectedRating = signal<number | null>(null);
  selectedEra = signal<string>('all');

  constructor() {
    // Lorsque le modal s'ouvre pour la première fois sans film, on lance un tirage automatique
    effect(() => {
      if (this.isOpen() && !this.movie() && !this.isLoading()) {
        this.rollMovie();
      }
    });
  }

  ngOnInit(): void {
    this.movieService.getGenres().subscribe({
      next: (genres) => this.genres.set(genres),
      error: () => this.genres.set([]),
    });
  }

  /**
   * Tire un film au sort en respectant les filtres et en évitant les doublons
   */
  rollMovie(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.closeTrailer();

    this.movieService
      .getRandomMovie({
        genreId: this.selectedGenre(),
        minRating: this.selectedRating(),
        era: this.selectedEra(),
        excludeIds: this.seenMovieIds,
      })
      .subscribe({
        next: (selectedMovie) => {
          this.movie.set(selectedMovie);
          this.seenMovieIds.push(selectedMovie.id);
          // On limite l'historique des films vus à 30 pour la session
          if (this.seenMovieIds.length > 30) {
            this.seenMovieIds.shift();
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(
            'Unable to find a movie with these criteria. Try relaxing your filters!'
          );
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Ouvre la bande-annonce officielle YouTube
   */
  watchTrailer(): void {
    const current = this.movie();
    if (!current) return;

    this.trailerError.set(null);

    this.movieService.getMovieVideos(current.id).subscribe({
      next: (videos) => {
        // Chercher une bande-annonce YouTube officielle en priorité
        const trailer =
          videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ||
          videos.find((v) => v.site === 'YouTube' && v.type === 'Teaser') ||
          videos.find((v) => v.site === 'YouTube');

        if (trailer && trailer.key) {
          this.trailerKey.set(trailer.key);
          const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            `https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`
          );
          this.trailerUrl.set(safeUrl);
          this.showTrailer.set(true);
        } else {
          this.trailerError.set('No trailer available for this movie on YouTube.');
        }
      },
      error: () => {
        this.trailerError.set('Unable to load trailer at this moment.');
      },
    });
  }

  closeTrailer(): void {
    this.showTrailer.set(false);
    this.trailerUrl.set(null);
    this.trailerError.set(null);
  }

  toggleWish(): void {
    const current = this.movie();
    if (current) {
      this.movieService.toggleWishList(current);
    }
  }

  isWished(): boolean {
    const current = this.movie();
    return current ? this.movieService.isInWishList(current.id) : false;
  }

  toggleFilters(): void {
    this.filtersOpen.update((v) => !v);
  }

  onGenreChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedGenre.set(val === '' ? null : Number(val));
    this.rollMovie();
  }

  onRatingChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedRating.set(val === '' ? null : Number(val));
    this.rollMovie();
  }

  onEraChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedEra.set(val);
    this.rollMovie();
  }

  formatRuntime(minutes?: number): string {
    if (!minutes || minutes <= 0) return 'Duration N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins > 0 ? mins + 'm' : ''}` : `${mins}m`;
  }

  getReleaseYear(dateStr?: string): string {
    if (!dateStr) return 'Unknown';
    return new Date(dateStr).getFullYear().toString() || 'Unknown';
  }

  closeModal(): void {
    this.closeTrailer();
    this.isOpen.set(false);
  }
}
