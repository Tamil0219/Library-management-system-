
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        LibraryManager manager = new LibraryManager();
        manager.loadFromFile();

        Scanner scanner = new Scanner(System.in);
        int choice;

        do {
            System.out.println("\n--- Library Management System ---");
            System.out.println("1. Add Book");
            System.out.println("2. View Books");
            System.out.println("3. Issue Book");
            System.out.println("4. Return Book");
            System.out.println("5. Remove Book");
            System.out.println("6. Save & Exit");
            System.out.print("Enter choice: ");
            choice = scanner.nextInt();
            scanner.nextLine();

            switch (choice) {
                case 1:
                    System.out.print("Enter ID: ");
                    String id = scanner.nextLine();
                    System.out.print("Enter Title: ");
                    String title = scanner.nextLine();
                    System.out.print("Enter Author: ");
                    String author = scanner.nextLine();
                    manager.addBook(new Book(id, title, author));
                    break;
                case 2:
                    manager.viewBooks();
                    break;
                case 3:
                    System.out.print("Enter ID to issue: ");
                    manager.issueBook(scanner.nextLine());
                    break;
                case 4:
                    System.out.print("Enter ID to return: ");
                    manager.returnBook(scanner.nextLine());
                    break;
                case 5:
                    System.out.print("Enter ID to remove: ");
                    manager.removeBook(scanner.nextLine());
                    break;
                case 6:
                    manager.saveToFile();
                    break;
                default:
                    System.out.println("Invalid choice.");
            }
        } while (choice != 6);
    }
}
