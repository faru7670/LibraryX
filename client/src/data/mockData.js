// Mock data for the Library Management System demo
// This data powers the entire application for demonstration purposes

export const mockUsers = [
    { id: 'u1', name: 'Arjun Mehta', email: 'arjun@college.edu', role: 'student', department: 'Computer Science', year: '3rd', avatar: null, joinedAt: '2024-08-15' },
    { id: 'u2', name: 'Priya Sharma', email: 'priya@college.edu', role: 'student', department: 'Electronics', year: '2nd', avatar: null, joinedAt: '2024-09-01' },
    { id: 'u3', name: 'Rahul Verma', email: 'rahul@college.edu', role: 'student', department: 'Mechanical', year: '4th', avatar: null, joinedAt: '2023-07-10' },
    { id: 'u4', name: 'Ms. Kavita Das', email: 'kavita@college.edu', role: 'librarian', department: 'Library', avatar: null, joinedAt: '2020-01-05' },
    { id: 'u5', name: 'Dr. Suresh Iyer', email: 'suresh@college.edu', role: 'admin', department: 'Administration', avatar: null, joinedAt: '2019-06-15' },
    { id: 'u6', name: 'Sneha Patil', email: 'sneha@college.edu', role: 'student', department: 'Civil', year: '1st', avatar: null, joinedAt: '2025-07-20' },
    { id: 'u7', name: 'Vikram Singh', email: 'vikram@college.edu', role: 'student', department: 'Computer Science', year: '2nd', avatar: null, joinedAt: '2024-09-01' },
];

export const mockBooks = [
    { id: 'b1', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '978-0262033848', category: 'Computer Science', publisher: 'MIT Press', year: 2009, totalCopies: 5, availableCopies: 2, coverColor: '#6366f1', description: 'A comprehensive textbook covering a broad range of algorithms in depth.' },
    { id: 'b2', title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', category: 'Software Engineering', publisher: 'Prentice Hall', year: 2008, totalCopies: 4, availableCopies: 1, coverColor: '#14b8a6', description: 'A handbook of agile software craftsmanship.' },
    { id: 'b3', title: 'Design Patterns', author: 'Gang of Four', isbn: '978-0201633610', category: 'Software Engineering', publisher: 'Addison-Wesley', year: 1994, totalCopies: 3, availableCopies: 0, coverColor: '#f59e0b', description: 'Elements of Reusable Object-Oriented Software.' },
    { id: 'b4', title: 'Database System Concepts', author: 'Abraham Silberschatz', isbn: '978-0078022159', category: 'Computer Science', publisher: 'McGraw-Hill', year: 2019, totalCopies: 6, availableCopies: 4, coverColor: '#ef4444', description: 'Comprehensive coverage of database system concepts.' },
    { id: 'b5', title: 'Digital Electronics', author: 'Morris Mano', isbn: '978-0132774208', category: 'Electronics', publisher: 'Pearson', year: 2012, totalCopies: 4, availableCopies: 3, coverColor: '#8b5cf6', description: 'Principles of digital design and computer architecture.' },
    { id: 'b6', title: 'Engineering Mechanics', author: 'R.C. Hibbeler', isbn: '978-0133915426', category: 'Mechanical', publisher: 'Pearson', year: 2016, totalCopies: 5, availableCopies: 5, coverColor: '#ec4899', description: 'Statics and dynamics for engineering students.' },
    { id: 'b7', title: 'Operating System Concepts', author: 'Galvin & Silberschatz', isbn: '978-1119800361', category: 'Computer Science', publisher: 'Wiley', year: 2021, totalCopies: 4, availableCopies: 2, coverColor: '#06b6d4', description: 'The definitive guide to operating system concepts.' },
    { id: 'b8', title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell', isbn: '978-0134610993', category: 'Computer Science', publisher: 'Pearson', year: 2020, totalCopies: 3, availableCopies: 1, coverColor: '#10b981', description: 'The most comprehensive text on AI available.' },
    { id: 'b9', title: 'Structural Analysis', author: 'R.C. Hibbeler', isbn: '978-0134610672', category: 'Civil', publisher: 'Pearson', year: 2017, totalCopies: 3, availableCopies: 3, coverColor: '#f97316', description: 'Structural analysis for civil engineering students.' },
    { id: 'b10', title: 'Computer Networks', author: 'Andrew S. Tanenbaum', isbn: '978-0132126953', category: 'Computer Science', publisher: 'Pearson', year: 2011, totalCopies: 5, availableCopies: 3, coverColor: '#3b82f6', description: 'A comprehensive guide to computer networking.' },
    { id: 'b11', title: 'Discrete Mathematics', author: 'Kenneth H. Rosen', isbn: '978-0073383095', category: 'Mathematics', publisher: 'McGraw-Hill', year: 2019, totalCopies: 4, availableCopies: 2, coverColor: '#a855f7', description: 'The standard textbook for discrete mathematics.' },
    { id: 'b12', title: 'Linear Algebra Done Right', author: 'Sheldon Axler', isbn: '978-3319110790', category: 'Mathematics', publisher: 'Springer', year: 2014, totalCopies: 2, availableCopies: 2, coverColor: '#0ea5e9', description: 'A different approach to linear algebra.' },
];

export const mockIssuedBooks = [
    { id: 'i1', bookId: 'b1', userId: 'u1', issueDate: '2026-02-10', dueDate: '2026-02-24', returnDate: null, fineAmount: 10, status: 'overdue' },
    { id: 'i2', bookId: 'b2', userId: 'u1', issueDate: '2026-02-20', dueDate: '2026-03-06', returnDate: null, fineAmount: 0, status: 'issued' },
    { id: 'i3', bookId: 'b3', userId: 'u2', issueDate: '2026-02-05', dueDate: '2026-02-19', returnDate: '2026-02-18', fineAmount: 0, status: 'returned' },
    { id: 'i4', bookId: 'b7', userId: 'u3', issueDate: '2026-02-15', dueDate: '2026-03-01', returnDate: null, fineAmount: 0, status: 'issued' },
    { id: 'i5', bookId: 'b8', userId: 'u1', issueDate: '2026-01-20', dueDate: '2026-02-03', returnDate: '2026-02-01', fineAmount: 0, status: 'returned' },
    { id: 'i6', bookId: 'b5', userId: 'u2', issueDate: '2026-02-22', dueDate: '2026-03-08', returnDate: null, fineAmount: 0, status: 'issued' },
    { id: 'i7', bookId: 'b10', userId: 'u7', issueDate: '2026-02-01', dueDate: '2026-02-15', returnDate: null, fineAmount: 55, status: 'overdue' },
    { id: 'i8', bookId: 'b1', userId: 'u6', issueDate: '2026-02-18', dueDate: '2026-03-04', returnDate: null, fineAmount: 0, status: 'issued' },
    { id: 'i9', bookId: 'b4', userId: 'u3', issueDate: '2026-01-10', dueDate: '2026-01-24', returnDate: '2026-01-23', fineAmount: 0, status: 'returned' },
    { id: 'i10', bookId: 'b11', userId: 'u7', issueDate: '2026-02-12', dueDate: '2026-02-26', returnDate: null, fineAmount: 0, status: 'issued' },
];

export const mockReservations = [
    { id: 'r1', bookId: 'b3', userId: 'u1', reservedAt: '2026-02-20', position: 1, status: 'waiting' },
    { id: 'r2', bookId: 'b3', userId: 'u7', reservedAt: '2026-02-21', position: 2, status: 'waiting' },
    { id: 'r3', bookId: 'b2', userId: 'u3', reservedAt: '2026-02-22', position: 1, status: 'waiting' },
];

export const mockNotifications = [
    { id: 'n1', userId: 'u1', type: 'overdue', message: '"Introduction to Algorithms" is overdue. Please return it to avoid further fines.', read: false, createdAt: '2026-02-25' },
    { id: 'n2', userId: 'u1', type: 'issued', message: '"Clean Code" has been issued to you. Due date: March 6, 2026.', read: true, createdAt: '2026-02-20' },
    { id: 'n3', userId: 'u7', type: 'overdue', message: '"Computer Networks" is overdue by 11 days. Current fine: ₹55.', read: false, createdAt: '2026-02-25' },
    { id: 'n4', userId: 'u2', type: 'returned', message: '"Design Patterns" has been returned successfully.', read: true, createdAt: '2026-02-18' },
    { id: 'n5', userId: 'u1', type: 'reservation', message: 'You are #1 in queue for "Design Patterns".', read: false, createdAt: '2026-02-20' },
    { id: 'n6', userId: 'u6', type: 'due_soon', message: '"Introduction to Algorithms" is due in 6 days.', read: false, createdAt: '2026-02-26' },
];

export const mockActivityLogs = [
    { id: 'a1', userId: 'u1', action: 'book_issued', details: 'Issued "Clean Code"', timestamp: '2026-02-20T10:30:00' },
    { id: 'a2', userId: 'u2', action: 'book_returned', details: 'Returned "Design Patterns"', timestamp: '2026-02-18T14:15:00' },
    { id: 'a3', userId: 'u1', action: 'reservation_placed', details: 'Reserved "Design Patterns"', timestamp: '2026-02-20T11:00:00' },
    { id: 'a4', userId: 'u7', action: 'book_issued', details: 'Issued "Discrete Mathematics"', timestamp: '2026-02-12T09:45:00' },
    { id: 'a5', userId: 'u4', action: 'fine_collected', details: 'Fine collected from Arjun Mehta: ₹10', timestamp: '2026-02-25T16:00:00' },
    { id: 'a6', userId: 'u5', action: 'book_added', details: 'Added new book: "Linear Algebra Done Right"', timestamp: '2026-02-10T11:30:00' },
    { id: 'a7', userId: 'u6', action: 'book_issued', details: 'Issued "Introduction to Algorithms"', timestamp: '2026-02-18T13:20:00' },
    { id: 'a8', userId: 'u3', action: 'book_returned', details: 'Returned "Database System Concepts"', timestamp: '2026-01-23T10:00:00' },
];

// Monthly analytics data
export const monthlyUsageData = [
    { month: 'Sep', issues: 45, returns: 38, newUsers: 12 },
    { month: 'Oct', issues: 62, returns: 55, newUsers: 8 },
    { month: 'Nov', issues: 78, returns: 70, newUsers: 15 },
    { month: 'Dec', issues: 35, returns: 48, newUsers: 3 },
    { month: 'Jan', issues: 82, returns: 65, newUsers: 18 },
    { month: 'Feb', issues: 70, returns: 58, newUsers: 10 },
];

export const categoryDistribution = [
    { name: 'Computer Science', value: 5, color: '#6366f1' },
    { name: 'Software Engineering', value: 2, color: '#14b8a6' },
    { name: 'Electronics', value: 1, color: '#8b5cf6' },
    { name: 'Mechanical', value: 1, color: '#ec4899' },
    { name: 'Civil', value: 1, color: '#f97316' },
    { name: 'Mathematics', value: 2, color: '#a855f7' },
];

export const mostBorrowedBooks = [
    { title: 'Intro to Algorithms', count: 34 },
    { title: 'Clean Code', count: 28 },
    { title: 'OS Concepts', count: 25 },
    { title: 'Computer Networks', count: 22 },
    { title: 'Design Patterns', count: 20 },
];

export const dailyStats = [
    { day: 'Mon', issues: 12, returns: 8 },
    { day: 'Tue', issues: 15, returns: 11 },
    { day: 'Wed', issues: 9, returns: 14 },
    { day: 'Thu', issues: 18, returns: 10 },
    { day: 'Fri', issues: 14, returns: 16 },
    { day: 'Sat', issues: 6, returns: 5 },
];

export const fineRevenueData = [
    { month: 'Sep', amount: 250 },
    { month: 'Oct', amount: 180 },
    { month: 'Nov', amount: 320 },
    { month: 'Dec', amount: 150 },
    { month: 'Jan', amount: 410 },
    { month: 'Feb', amount: 285 },
];

export const userGrowthData = [
    { month: 'Sep', students: 120, total: 135 },
    { month: 'Oct', students: 128, total: 143 },
    { month: 'Nov', students: 143, total: 160 },
    { month: 'Dec', students: 146, total: 163 },
    { month: 'Jan', students: 164, total: 183 },
    { month: 'Feb', students: 174, total: 195 },
];

// Student reading history (for student dashboard)
export const studentReadingHistory = [
    { month: 'Sep', books: 2 },
    { month: 'Oct', books: 3 },
    { month: 'Nov', books: 4 },
    { month: 'Dec', books: 1 },
    { month: 'Jan', books: 3 },
    { month: 'Feb', books: 2 },
];
