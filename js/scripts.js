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

    const editButton = document.createElement('button');
    editButton.innerText = 'Edit Buku';
    editButton.classList.add('edit-button');
    editButton.addEventListener('click', function () {
      editBook(id);
      const unhideEdit = document.getElementById('edit-book');
      unhideEdit.hidden = false;
    });

    container.append(unreadButton, deleteButton, editButton);
  }
  if (isComplete == 'false' || isComplete == false) {
    const readButton = document.createElement('button');
    readButton.innerText = 'Tandai Sudah Dibaca';
    readButton.classList.add('read-button');
    readButton.addEventListener('click', function () {
      readBookCompleted(id);
    });

    const editButton = document.createElement('button');
    editButton.innerText = 'Edit Buku';
    editButton.classList.add('edit-button');
    editButton.addEventListener('click', function () {
      editBook(id);
      const unhideEdit = document.getElementById('edit-book');
      unhideEdit.hidden = false;
    });

    container.append(readButton, editButton);
  }

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
  document.dispatchEvent(new Event(RENDER_EVENT));
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
  const searchInput = document.getElementById('searchInput');
  const searchTerm = searchInput.value.toLowerCase();
  const filteredBooks = books.filter((book) => {
    if (searchTerm) {
      return book.title.toLowerCase().includes(searchTerm);
    } else {
      return books;
    }
  });

  const unreadBook = document.getElementById('books');
  const readBook = document.getElementById('read-books');
  unreadBook.innerHTML = '';
  readBook.innerHTML = '';

  for (const bookItem of filteredBooks) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete == 'true' || bookItem.isComplete == true) {
      readBook.append(bookElement);
    } else {
      unreadBook.append(bookElement);
    }
  }
}

function editBook(bookId) {
  const bookTarget = getBooks(bookId);

  if (bookTarget == null) return;

  const idInput = document.getElementById('id-edit-book');
  const titleInput = document.getElementById('title-edit');
  const authorInput = document.getElementById('writer-edit');
  const yearInput = document.getElementById('year-edit');
  const checkBox = document.getElementById('isChecked-edit');

  idInput.value = bookTarget.id;
  titleInput.value = bookTarget.title;
  authorInput.value = bookTarget.author;
  yearInput.value = bookTarget.year;
  checkBox.checked = bookTarget.isComplete == 'true';

  const submitForm = document.getElementById('form-edit');
  submitForm.action = '#';

  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    updateBook(bookId);
  });
}

function updateBook(bookId) {
  const updatedTitle = document.getElementById('title-edit').value;
  const updatedAuthor = document.getElementById('writer-edit').value;
  const updatedYear = document.getElementById('year-edit').value;
  const updatedIsComplete = document.getElementById('isChecked-edit').checked
    ? 'true'
    : 'false';

  const bookTarget = getBooks(bookId);

  if (bookTarget == null) return;

  bookTarget.title = updatedTitle;
  bookTarget.author = updatedAuthor;
  bookTarget.year = updatedYear;
  bookTarget.isComplete = updatedIsComplete;

  const submitFormEdit = document.getElementById('form-edit');
  submitFormEdit.action = '#';
  submitFormEdit.reset();

  const hideEdit = document.getElementById('edit-book');
  hideEdit.hidden = true;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.addEventListener('DOMContentLoaded', function () {
  const searchButton = document.getElementById('search-button');

  searchButton.addEventListener('click', function () {
    searchBooks();
  });

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
