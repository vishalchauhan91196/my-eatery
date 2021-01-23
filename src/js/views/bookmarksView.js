import PreviewView from './previewView.js';

class BookmarksView extends PreviewView {
    _parentElement = document.querySelector('.bookmarks__list');
    _errorMessage = 'No Bookmarks yet!! Find a recipe & bookmark it ;)';
    _successMessage = '';

    addHandlerRender(handler) {
        window.addEventListener('load', handler);
    }
}
export default new BookmarksView();
