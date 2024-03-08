const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APP';

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert('Browser anda tidak mendukung local storage');
    return false;
  }
  return true;
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function getBooks(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function getBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

// function getCompleteValue() {
//   const checkBox = document.getElementById('isChecked');
//   const hiddenInput = document.getElementById('isComplete');

//   checkBox.addEventListener('change', function () {
//     hiddenInput.value = checkBox.checked ? 'true' : 'false';
//   });
// }

function makeBook(listBook) {
  const { id, title, author, year, isComplete } = listBook;

  const bookTitle = document.createElement('h2');
  bookTitle.innerText = title;

  const bookYear = document.createElement('p');
  bookYear.innerText = year;

  const bookWriter = document.createElement('p');
  bookWriter.innerText = author;

  const bookContainer = document.createElement('div');
  bookContainer.classList.add('inner');
  bookContainer.append(bookTitle, bookYear, bookWriter);

  const container = document.createElement('div');
  container.classList.add('item', 'shadow');
  container.append(bookContainer);
  container.setAttribute('id', `book-${id}`);

  if (isComplete == 'true' || isComplete == true) {
    const unreadButton = document.createElement('button');
    unreadButton.innerText = 'Tandai Belum Dibaca';
    unreadButton.classList.add('unread-button');
    unreadButton.addEventListener('click', function () {
      unreadBook(id);
    });

    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Hapus Bacaan';
    deleteButton.classList.add('delete-button');
    deleteButton.addEventListener('click', function () {
      deleteBookCompleted(id);
    });

    container.append(unreadButton, deleteButton);
  }
  if (isComplete == 'false' || isComplete == false) {
    const readButton = document.createElement('button');
    readButton.innerText = 'Tandai Sudah Dibaca';
    readButton.classList.add('read-button');
    readButton.addEventListener('click', function () {
      readBookCompleted(id);
    });

    container.append(readButton);
  }

  const editButton = document.createElement('button');
  editButton.innerText = 'Edit';
  editButton.classList.add('edit-button');
  editButton.addEventListener('click', function () {
    editBook(id);
  });

  container.append(editButton);

  return container;
}

function addBook() {
  const bookTitle = document.getElementById('title').value;
  const bookWriter = document.getElementById('writer').value;
  const bookYear = document.getElementById('year').value;
  const bookComplete = document.getElementById('isComplete').value;

  const generatedId = generateId();
  const listBook = generateBookObject(
    generatedId,
    bookTitle,
    bookWriter,
    bookYear,
    bookComplete
  );
  books.push(listBook);
  document.dispatchEvent(new CustomEvent(RENDER_EVENT, { detail: books }));
  saveData();
}

function readBookCompleted(bookId) {
  const bookTarget = getBooks(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function deleteBookCompleted(bookId) {
  const bookTarget = getBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function unreadBook(bookId) {
  const bookTarget = getBooks(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function searchBooks() {
  const searchInput = document
    .getElementById('searchInput')
    .value.toLowerCase();
  const filteredBooks = books.filter((book) => {
    const titleMatches = book.title.toLowerCase().includes(searchInput);
    return titleMatches;
  });

  renderBooks(filteredBooks);
}

function renderBooks(booksToRender) {
  const unreadBook = document.getElementById('books');
  const readBook = document.getElementById('read-books');

  unreadBook.innerHTML = '';
  readBook.innerHTML = '';

  for (const bookItem of booksToRender) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete == 'true' || bookItem.isComplete == true) {
      readBook.append(bookElement);
    }
    if (bookItem.isComplete == 'false' || bookItem.isComplete == false) {
      unreadBook.append(bookElement);
    }
  }
}

function editBook(bookId) {
  const bookToEdit = getBooks(bookId);

  if (bookToEdit == null) return;

  // Display a form to edit the book details
  const editHeader = document.createElement('h2');
  editHeader.innerText = 'Edit Buku';
  editHeader.classList.add('edit-header');

  const editForm = document.createElement('form');
  editForm.setAttribute('id', 'form-edit-book');
  editForm.innerHTML = `
    <div class="form-group">
    <label for="editTitle">Judul</label>
    <input type="text" name="editTitle" id="editTitle" value="${
      bookToEdit.title
    }" required />
    </div>

    <div class="form-group">
    <label for="editWriter">Penulis</label>
    <input type="text" name="editWriter" id="editWriter" value="${
      bookToEdit.author
    }" required />
    </div>

    <div class="form-group">
    <label for="editYear">Tahun</label>
    <input type="number" name="editYear" id="editYear" value="${
      bookToEdit.year
    }" required />
    </div>

    <div class="form-group">
      <label for="editIsChecked">Selesai dibaca</label>
      <input type="checkbox" id="editIsChecked" ${
        bookToEdit.isComplete ? 'checked' : ''
      } />
      <input type="hidden" id="editIsComplete" name="editIsComplete" value="${
        bookToEdit.isComplete
      }" />
    </div>

    <input type="submit" value="Update" name="Update" class="btn-submit" />
  `;

  const formEditData = document.getElementById('edit-book');
  formEditData.hidden = false;

  editForm.addEventListener('submit', function (event) {
    event.preventDefault();
    updateBook(bookId);
  });

  const editContainer = document.getElementById(`edit-book`);
  editContainer.innerHTML = '';
  editContainer.append(editHeader, editForm);
}

function updateBook(bookId) {
  const editedTitle = document.getElementById('editTitle').value;
  const editedWriter = document.getElementById('editWriter').value;
  const editedYear = document.getElementById('editYear').value;
  const editedIsComplete = document.getElementById('editIsChecked').checked;

  const bookToUpdate = getBooks(bookId);

  if (bookToUpdate == null) return;

  bookToUpdate.title = editedTitle;
  bookToUpdate.author = editedWriter;
  bookToUpdate.year = editedYear;
  bookToUpdate.isComplete = editedIsComplete;

  const formEditData = document.getElementById('edit-book');
  formEditData.hidden = true;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('form');

  const checkBox = document.getElementById('isChecked');
  const hiddenInput = document.getElementById('isComplete');
  checkBox.checked
    ? (hiddenInput.value = 'true')
    : (hiddenInput.value = 'false');

  checkBox.addEventListener('change', function () {
    hiddenInput.value = checkBox.checked ? 'true' : 'false';
  });

  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const unreadBook = document.getElementById('books');
  const readBook = document.getElementById('read-books');

  unreadBook.innerHTML = '';
  readBook.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    console.log('isComplete', bookItem.isComplete);
    if (bookItem.isComplete == 'true' || bookItem.isComplete == true) {
      readBook.append(bookElement);
    }
    if (bookItem.isComplete == 'false' || bookItem.isComplete == false) {
      unreadBook.append(bookElement);
    }
  }
});

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}
