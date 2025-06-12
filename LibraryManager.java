
import java.util.*;
import java.io.*;
import com.google.gson.reflect.TypeToken;
import com.google.gson.*;

public class LibraryManager {
    private List<Book> books;
    private final String filePath = "books.json";
    private final Gson gson = new GsonBuilder().setPrettyPrinting().create();

    public LibraryManager() {
        books = new ArrayList<>();
    }

    public void addBook(Book book) {
        books.add(book);
        System.out.println("Book added.");
    }

    public void viewBooks() {
        if (books.isEmpty()) {
            System.out.println("No books in library.");
            return;
        }
        for (Book b : books) {
            System.out.println(b);
        }
    }

    public Book searchBook(String id) {
        for (Book b : books) {
            if (b.getId().equalsIgnoreCase(id)) {
                return b;
            }
        }
        return null;
    }

    public void issueBook(String id) {
        Book book = searchBook(id);
        if (book != null && !book.isIssued()) {
            book.issueBook();
            System.out.println("Book issued.");
        } else {
            System.out.println("Book not found or already issued.");
        }
    }

    public void returnBook(String id) {
        Book book = searchBook(id);
        if (book != null && book.isIssued()) {
            book.returnBook();
            System.out.println("Book returned.");
        } else {
            System.out.println("Book not found or not issued.");
        }
    }

    public void removeBook(String id) {
        Book book = searchBook(id);
        if (book != null) {
            books.remove(book);
            System.out.println("Book removed.");
        } else {
            System.out.println("Book not found.");
        }
    }

    public void saveToFile() {
        try (Writer writer = new FileWriter(filePath)) {
            gson.toJson(books, writer);
            System.out.println("Library saved.");
        } catch (IOException e) {
            System.out.println("Error saving file.");
        }
    }

    public void loadFromFile() {
        try (Reader reader = new FileReader(filePath)) {
            books = gson.fromJson(reader, new TypeToken<List<Book>>() {}.getType());
            if (books == null) books = new ArrayList<>();
        } catch (IOException e) {
            System.out.println("No previous data found.");
        }
    }
}
