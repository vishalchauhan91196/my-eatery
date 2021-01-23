import {
    async
} from 'regenerator-runtime/';

import {
    API_URL,
    RES_PER_PAGE,
    KEY
} from './config.js';

//import {
//    AJAX,
//    sendJSON
//} from './helpers.js';

import {
    AJAX
} from './helpers.js';

export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        page: 1,
        resultsPerPage: RES_PER_PAGE,
    },
    bookmark: [],
}

const createRecipeObject = function (data) {
    const {
        recipe
    } = data.data;

    return {
        cookingTime: recipe.cooking_time,
        id: recipe.id,
        image: recipe.image_url,
        ingredients: recipe.ingredients,
        publisher: recipe.publisher,
        servings: recipe.servings,
        sourceURL: recipe.source_url,
        title: recipe.title,
        //      key: recipe.key
        ...(recipe.key && {
            key: recipe.key
        }),
    };

}

export const loadRecipe = async function (id) {
    try {
        // 1. Loading recipe from API
        const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
        state.recipe = createRecipeObject(data);

        if (state.bookmark.some(bookmark => bookmark.id === id))
            state.recipe.bookmarked = true;
        else state.recipe.bookmarked = false;
    } catch (err) {
        console.error(`Oops!! ${err.message}`);
        throw err;
    }
}

export const loadSearchResults = async function (query) {
    try {
        state.search.query = query;
        const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

        state.search.results = data.data.recipes.map(rec => {
            return {
                id: rec.id,
                image: rec.image_url,
                publisher: rec.publisher,
                title: rec.title,
                ...(rec.key && {
                    key: rec.key
                }),
            }
        });

        state.search.page = 1;
    } catch (err) {
        console.error(`Oops!! ${err.message}`);
        throw err;
    }
}

export const getSearchResultsPage = function (page = state.search.page) {
    state.search.page = page;
    const start = (page - 1) * state.search.resultsPerPage; //0
    const end = page * state.search.resultsPerPage; //10
    return state.search.results.slice(start, end);
}

export const updateServings = function (newServings) {
    state.recipe.ingredients.forEach(ing => {
        ing.quantity = ing.quantity * newServings / state.recipe.servings;
        // new qt = old qt * new servings / old servings [ 2 * 8 / 4 ]
    });

    state.recipe.servings = newServings;
}

const persistBookmarks = function () {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmark));
}

export const addBookmark = function (recipe) {
    // Add bookmark
    state.bookmark.push(recipe);

    // Mark the receipe as bookmarked
    if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
    persistBookmarks();
}

export const deleteBookmark = function (id) {
    // Deleting the bookmark
    const index = state.bookmark.findIndex(el => el.id === id);
    state.bookmark.splice(index, 1);

    // Mark the receipe as NOT bookmarked
    if (id === state.recipe.id) state.recipe.bookmarked = false;
    persistBookmarks();
}

const init = function () {
    const storage = localStorage.getItem('bookmarks');
    if (storage) state.bookmark = JSON.parse(storage);
}
init();

export const uploadRecipe = async function (newRecipe) {
    try {
        const ingredients = Object.entries(newRecipe)
            .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
            .map(ing => {
                // const ingArr = ing[1].replaceAll(' ', '').split(',');
                const ingArr = ing[1].split(',').map(el => el.trim());

                if (ingArr.length !== 3)
                    throw new Error('Incorrect ingredient format. Please use the correct format!');

                const [quantity, unit, description] = ingArr;
                return {
                    quantity: quantity ? +quantity : '',
                    unit,
                    description
                };
            });

        const recipe = {
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            source_url: newRecipe.sourceUrl,
            title: newRecipe.title,
            ingredients,
        }
        console.log(recipe);

        const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
        state.recipe = createRecipeObject(data);
        addBookmark(state.recipe);

    } catch (err) {
        throw err;
    }
}
