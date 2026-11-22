# MovieApp

Application web de films développée avec Angular et l'API [TMDB](https://www.themoviedb.org/) (TP3).

**Démo en ligne :** https://hama-442.github.io/movie-app/

## Fonctionnalités

- Liste des films récupérés depuis l'API TMDB
- Recherche de films
- Page de détail d'un film
- Liste de souhaits (wish list)
- Suggestion aléatoire de films (« Surprise me »)
- Navigation entre les pages avec le routage Angular

## Contributions

Projet réalisé à partir de la base de code fournie pour le TP3 (appel à l'API TMDB, routage, recherche, page de détail).

**Ajouts et modifications :**

- Nouveau composant `surprise-me`
- Développement de la liste de souhaits (`wish-list`)
- Refonte de l'interface : `head-bar`, `search-bar`, `movie-list`, `movie-detail` et styles globaux
- Extension du service `movie-service` et de l'interface `movie`
- Mise en ligne sur GitHub Pages

## Technologies

- Angular 22 (Angular CLI 22.2.2)
- TypeScript, HTML, CSS
- API TMDB
- GitHub Pages (déploiement avec `angular-cli-ghpages`)

## Installation et lancement

```bash
git clone https://github.com/HAMA-442/movie-app.git
cd movie-app
npm install
ng serve
```

Ouvre ensuite `http://localhost:4200/` dans ton navigateur. L'application se recharge automatiquement à chaque modification.

> À VÉRIFIER : l'API TMDB demande une clé. Indique ici où la renseigner (par exemple dans `src/environments/environment.ts`).

## Build

```bash
ng build
```

Les fichiers compilés sont placés dans le dossier `dist/`.

## Déploiement sur GitHub Pages

```bash
ng deploy --base-href=/movie-app/
```

Cette commande compile le projet et publie le résultat sur la branche `gh-pages`.

## Tests

```bash
ng test
```

## Ressources

- [Documentation Angular CLI](https://angular.dev/tools/cli)
- [Documentation de l'API TMDB](https://developer.themoviedb.org/docs)