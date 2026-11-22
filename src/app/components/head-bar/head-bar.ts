import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFilm, faHeart } from '@fortawesome/free-solid-svg-icons';
import { MovieService } from '../../serivces/movie-service';

@Component({
  imports: [CommonModule, FontAwesomeModule, RouterLink, RouterLinkActive],
  selector: 'app-head-bar',
  styleUrl: './head-bar.css',
  templateUrl: './head-bar.html',
})
export class HeadBar {
  movieService = inject(MovieService);
  faHeart = faHeart;
  faFilm = faFilm;
}
