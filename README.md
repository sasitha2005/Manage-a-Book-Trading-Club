# Book Trading Club

The purpose of the project is to build a book trading club similar to https://manage-a-book-trading-club.freecodecamp.rocks/

The book trading club has something for everyone.  Items include Web Development, Sports, etc.

## UX

**Getting Started**

At the home page, you will see the example search for books relevant to Web Development.  You can get more information on the book.  This information opens in a new tab.  You can search for other books.  In the text field enter book title (e.g. Web Development, BBC Micro) and select Search with the Magnifying Glass Icon.  You will be taken to the Search Results.  If you are not logged in, you can view more information or log in to add the book.

You do not need to sign up to use this application.  However, maximum benefit is obtained by signing up.

When you sign up, the username, email and password fields are compulsory.  So please enter them.

The city, county and country are optional fields.  Select Sign Up to create an account.  Once you have signed up, you will be taken to the login screen.  Once you have logged on, you can add books, view profile, change settings and cancel/add/reject trade requests. 

**User Stories**

As a user, I can view all books posted by every user.

As a user, I can add a new book.

As a user, I can update my settings to store my full name, city and state.

As a user, I can propose a trade and wait for the other user to accept the trade.

**Information Architecture**

Book consists of title, description, author, publisher, link, imageurl, bookid, owner and status.  All are string except owner, which is an Object ID.  Status is `available` or `pending`.  The default for status is `available`.  In addition, author is an array.

The user consists of local - username, email, password, addedbooks, city, county and country.  All are string except addedbooks, which is an Object ID.  username, email and password are required.  In addition, addedbooks 
is an array.  In the signup form and profile update form, all fields are text except email and password.  The email is of type email and password is of type password.  City can also include post town.  County can also include its equivalent (e.g. state).

The trade consists of from, to, book, status and created_at.  The from, to and book fields have type of Object ID.  The status is a string - it has `pending`, `approved` or `rejected`.  The status default is `pending`.  The created_at field is a date.  It is currently at the present date.

Google Books Search

  - field is the title
  - offset is the position in the collection at which to start the list of results (currently 0)
  - limit is the maximum number of results to return.  Maximum is 40.  It is set to 10.
  - type is `books`, `magazines` or `all`.  It is set to `books`.
  - order is order results by relevance or newest.  It is set to relevance.
  - lang is restrict the results to a specified language (default en)

## Features

The ability to search books.  To add, view and remove books from the user's profile.  Allows the user to Create and Modify Profiles.

## Technologies

Uses Bcrypt, Body Parser, Connect Flash, Express, Google Books Search, Bootstrap 5.1.1, Font Awesome 5.15.4, Passport, MongoDB, Pug and Mongoose.

## Testing

Ensure user stories have been met.

## Deployment

This project is on [REPL](https://book-trading-club.ddxps46.repl.co)

## Credits

### Content

Taken from [Jeremy L Shepherd - GitHub Profile](https://github.com/jeremylshepherd).

Also taken from [Tri Vi](https://github.com/triminhvi).

Information Accessed between 17 September 2021 and 12 October 2021.  Did searches on GitHub and FreeCodeCamp Forums.

### Acknowledgements

- [Jeremy L Shepherd - GitHub Repository](https://github.com/jeremylshepherd/fcc-bookclub-app)
- [Tri Vi - GitHub Repository ](https://github.com/triminhvi/Book_Trading_Club)
- [Sam Milledge - GitHub Repository on Google Search Books](https://github.com/smilledge/node-google-books-search)
- [Pug](https://pugjs.org)
- [Bootstrap](https://getbootstrap.com)