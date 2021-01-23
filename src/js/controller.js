import * as model from './model.js';
import {
    MODAL_CLOSE_SEC
} from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////
if (module.hot) {
    module.hot.accept();
}

const controlRecipes = async function () {
    try {
        const id = window.location.hash.slice(1);
        if (!id) return;

        recipeView.renderSpinner();

        // 0. Update the views to mark the selected search result
        resultsView.update(model.getSearchResultsPage());
        bookmarksView.update(model.state.bookmark);

        // 1. Loading recipe from API
        await model.loadRecipe(id);


        // 2. Render recipe 
        recipeView.render(model.state.recipe);

    } catch (err) {
        recipeView.renderError();
    }
}

const controlSearchResults = async function () {
    try {
        // 1) Get query
        const query = searchView.getQuery();

        if (!query) return;
        resultsView.renderSpinner();

        // 2) Load search results
        await model.loadSearchResults(query);

        // 3) Render Search results
        //  resultsView.render(model.state.search.results);
        resultsView.render(model.getSearchResultsPage());

        // 4) Render initial pagination buttons
        paginationView.render(model.state.search);


    } catch (err) {
        console.error(err);
    }
}

const controlPagination = function (goToPage) {
    // 3) Render NEW Search results
    resultsView.render(model.getSearchResultsPage(goToPage));

    // 4) Render NEW pagination buttons
    paginationView.render(model.state.search);
}

const controlServings = function (newServings) {
    // Update the recipe servings (in state)
    model.updateServings(newServings);

    // Update the recipe view
    // recipeView.render(model.state.recipe);
    recipeView.update(model.state.recipe);
}

const controlAddBookmark = function () {
    // 1) Add or remove bookmark
    if (!model.state.recipe.bookmarked)
        model.addBookmark(model.state.recipe);
    else model.deleteBookmark(model.state.recipe.id);

    // 2) Update recipe view 
    recipeView.update(model.state.recipe);

    // 3) Render bookmarks 
    bookmarksView.render(model.state.bookmark);
}

const controlBookmarks = function () {
    bookmarksView.render(model.state.bookmark);
}

const controlAddRecipe = async function (newRecipe) {
    try {
        // Render Spinner
        addRecipeView.renderSpinner();

        // Upload the new recipe data
        await model.uploadRecipe(newRecipe);

        // Render recipe
        recipeView.render(model.state.recipe);

        // Display success message
        addRecipeView.renderSuccessMessage();

        // Render bookmark view 
        bookmarksView.render(model.state.bookmark);

        // Change ID in url
        window.history.pushState(null, '', `#${model.state.recipe.id}`);

        // Close form window
        setTimeout(function () {
            addRecipeView.toggleWindow();
        }, MODAL_CLOSE_SEC * 1000);

    } catch (err) {
        console.error('******', err);
        addRecipeView.renderError(err.message);
    }
}

const init = function () {
    bookmarksView.addHandlerRender(controlBookmarks);
    recipeView.addHandlerRender(controlRecipes);
    recipeView.addHandlerUpdateServings(controlServings);
    recipeView.addHandlerAddBookmark(controlAddBookmark);
    searchView.addHandlerSearch(controlSearchResults); //SUBSCRIBER
    paginationView.addHandlerClick(controlPagination);
    addRecipeView.addHandlerUpload(controlAddRecipe);
}
init();
