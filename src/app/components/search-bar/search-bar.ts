import { CommonModule } from '@angular/common';
import { Component, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  imports: [CommonModule, FontAwesomeModule],
  selector: 'app-search-bar',
  styleUrl: './search-bar.css',
  templateUrl: './search-bar.html',
})
export class SearchBar {
  faSearch = faMagnifyingGlass;
  faClear = faXmark;
  currentValue = signal('');

  /** Émet le titre saisi vers le composant père (movie-list) */
  titleSearched = output<string>();

  searchMovieByTitle(title: string): void {
    this.currentValue.set(title);
    this.titleSearched.emit(title.trim());
  }

  clearSearch(inputEl: HTMLInputElement): void {
    inputEl.value = '';
    this.searchMovieByTitle('');
    inputEl.focus();
  }
}
