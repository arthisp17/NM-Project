// ================= FIREBASE IMPORTS =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import {
getFirestore,
collection,
addDoc,
getDocs,
deleteDoc,
doc
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

import {
getStorage,
ref,
uploadBytes,
getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";


// ================= FIREBASE CONFIG =================
const firebaseConfig = {
    apiKey: "AIzaSyBdE1em19F7O7JuwqTjb2dIPOyCxQLojdU",
    authDomain: "e-book-management-system-72bd1.firebaseapp.com",
    projectId: "e-book-management-system-72bd1",
    storageBucket: "e-book-management-system-72bd1.firebasestorage.app",
    messagingSenderId: "813206138390",
    appId: "1:813206138390:web:a2844020081dedfaa8cf37",
    measurementId: "G-LZS16FLVW2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);


// ================= HELPERS =================
function generateId(){
 return Date.now().toString();
}

function showToast(message){
 alert(message);
}


// ================= FAVORITES =================
function loadFavorites(){
 let fav=localStorage.getItem("favorites");
 return fav ? JSON.parse(fav):[];
}

function saveFavorites(fav){
 localStorage.setItem(
 "favorites",
 JSON.stringify(fav)
 );
}

function toggleFavorite(id){
 let fav=loadFavorites();

 if(fav.includes(id)){
   fav=fav.filter(x=>x!==id);
 }
 else{
   fav.push(id);
 }

 saveFavorites(fav);
 loadBooks();
}

window.toggleFavorite=toggleFavorite;


// ================= ADD BOOK =================
async function addBook(bookData,pdfFile){

let pdfURL="";

if(pdfFile){

 const storageRef=ref(
 storage,
 "pdfs/"+
 Date.now()+"_"+
pdfFile.name
 );

 await uploadBytes(
 storageRef,
 pdfFile
 );

 pdfURL=await getDownloadURL(
 storageRef
 );
}

const newBook={
id:generateId(),
title:bookData.title,
author:bookData.author,
genre:bookData.genre,
year:bookData.year,
description:bookData.description,
pdfURL:pdfURL
};

await addDoc(
collection(db,"books"),
newBook
);

showToast("Book Added Successfully");
}


// ================= LOAD BOOKS =================
async function loadBooks(){

const snapshot=
await getDocs(
collection(db,"books")
);

let books=[];

snapshot.forEach((doc)=>{
 books.push({
 firestoreId:doc.id,
 ...doc.data()
 });
});

displayBooks(books);
displayRecentBooks(books);
}


// ================= DELETE =================
async function deleteBook(id){
await deleteDoc(
doc(db,"books",id)
);

showToast("Book Deleted");
loadBooks();
}

window.deleteBook=deleteBook;


// ================= VIEW PDF =================
function viewPDF(url){
if(url){
 window.open(url,"_blank");
}
else{
 showToast("No PDF attached");
}
}

window.viewPDF=viewPDF;


// ================= VIEW DETAILS =================
function viewBook(
title,
author,
genre,
year,
description
){

alert(
"Title: "+title+
"\nAuthor: "+author+
"\nGenre: "+genre+
"\nYear: "+year+
"\nDescription: "+description
);

}

window.viewBook=viewBook;


// ================= DISPLAY BOOKS =================
function displayBooks(books){

const container=
document.getElementById(
"bookList"
);

if(!container) return;

let favorites=
loadFavorites();

if(books.length===0){
container.innerHTML=`
<h2>No Books Found</h2>
`;
return;
}

container.innerHTML=
books.map(book=>`

<div class="book-card">

<div class="fav-star"
onclick="toggleFavorite('${book.id}')">
${favorites.includes(book.id)?'⭐':'☆'}
</div>

<h3>${book.title}</h3>
<p>${book.author}</p>
<p>${book.genre}</p>
<p>${book.year||''}</p>

<div class="card-buttons">

<button onclick="viewBook(
'${book.title}',
'${book.author}',
'${book.genre}',
'${book.year}',
'${book.description}'
)">
View
</button>

<button onclick="viewPDF('${book.pdfURL}')">
PDF
</button>

<button onclick="deleteBook(
'${book.firestoreId}'
)">
Delete
</button>

</div>

</div>

`).join('');

}


// ================= HOME RECENT BOOKS =================
function displayRecentBooks(books){

const container=
document.getElementById(
"recentBooksList"
);

if(!container) return;

let recent=
[...books]
.reverse()
.slice(0,4);

container.innerHTML=
recent.map(book=>`
<div class="recent-card">
<h4>${book.title}</h4>
<p>${book.author}</p>
<button onclick="viewPDF('${book.pdfURL}')">
Read
</button>
</div>
`).join('');

}


// ================= FORM =================
const form=
document.getElementById(
"bookForm"
);

if(form){

let selectedPdfFile=null;

const pdfInput=
document.getElementById(
"pdfFile"
);

if(pdfInput){
pdfInput.addEventListener(
"change",
function(e){
selectedPdfFile=
e.target.files[0];
}
);
}

form.addEventListener(
"submit",
async function(e){

e.preventDefault();

let title=
document.getElementById(
"title"
).value;

let author=
document.getElementById(
"author"
).value;

let genre=
document.getElementById(
"genre"
).value;

let year=
document.getElementById(
"year"
).value;

let description=
document.getElementById(
"description"
).value;

if(!title || !author){
showToast(
"Enter title and author"
);
return;
}

await addBook(
{
title,
author,
genre,
year,
description
},
selectedPdfFile
);

form.reset();

window.location=
"books.html";

}
);

}


// ================= SEARCH =================
const searchInput=
document.getElementById(
"searchInput"
);

if(searchInput){
searchInput.addEventListener(
"keyup",
async function(){

const text=
this.value.toLowerCase();

const snapshot=
await getDocs(
collection(db,"books")
);

let books=[];

snapshot.forEach(doc=>{
let b=doc.data();

if(
b.title.toLowerCase().includes(text)
||
b.author.toLowerCase().includes(text)
){
books.push({
firestoreId:doc.id,
...b
});
}

});

displayBooks(books);

}
);
}


// ================= INITIAL LOAD =================
if(
document.getElementById(
"bookList"
)
||
document.getElementById(
"recentBooksList"
)
){
loadBooks();
}
