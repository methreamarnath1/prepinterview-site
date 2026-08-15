# ORACLE SQL INTERVIEW MASTER BOOK
## PART 1 — Database Foundations, Oracle Basics & SQL Fundamentals

---

# CHAPTER 1 — DATABASE FOUNDATIONS

## 1.1 What is Data?

**Definition:** Data is any raw fact or value that has not yet been organized to give meaning — a name, a number, a date, on its own.

**Easy Meaning:** Data is just "raw material." A single number like `50000` means nothing on its own. Once you say "50000 is Ravi's salary," it becomes information.

**Remember It:** *Data = raw facts. Information = data with meaning.*

**Interview Question**
Q: What is the difference between data and information?
**Short Answer:** Data is a raw, unorganized fact — like a number or a word. Information is data that has been processed or organized so it becomes meaningful, like a salary report. Databases store data; reports and queries turn that data into information.

---

## 1.2 What is a Database?

**Definition:** A database is an organized collection of related data, stored electronically, that can be easily accessed, managed, and updated.

**Easy Meaning:** Think of a database as a digital filing cabinet. Instead of loose papers, data is stored in a structured way so a computer program can find exactly what it needs in milliseconds.

**Why Is It Used?**
- To store large volumes of data safely
- To retrieve data quickly
- To keep data consistent and avoid duplication
- To allow multiple users to work with the same data at the same time

**Short Interview Answer (30–60 sec):**
"A database is an organized collection of data that is stored electronically so it can be created, read, updated, and deleted efficiently. Instead of keeping data in separate files, a database keeps everything structured — usually in tables — so applications and users can query it reliably and multiple people can access it at the same time without conflicts."

---

## 1.3 What is DBMS?

**Definition:** A DBMS (Database Management System) is software that allows users to create, read, update, and delete data in a database, while also handling security, consistency, and concurrent access.

**Easy Meaning:** The DBMS is the "manager" that sits between you and the raw data files. You never touch the files directly — you talk to the DBMS, and it handles storage internally.

**Examples:** Oracle Database, MySQL, PostgreSQL, Microsoft SQL Server, MongoDB (NoSQL).

## 1.4 What is RDBMS?

**Definition:** An RDBMS (Relational Database Management System) is a DBMS that stores data in the form of related tables, where each table has rows and columns, and relationships between tables are maintained using keys.

**Oracle Database is an RDBMS.**

### 1.5 DBMS vs RDBMS

| Aspect | DBMS | RDBMS |
|---|---|---|
| Data storage | Files / navigational structures | Tables (rows & columns) |
| Relationships | Not enforced | Enforced via keys |
| Normalization | Not supported | Supported |
| Multiple users | Limited support | Full concurrent support |
| Examples | File systems, XML DB | Oracle, MySQL, PostgreSQL |
| ACID properties | Not guaranteed | Guaranteed |

**Interview Trap:** Many freshers say "DBMS and RDBMS are the same." They are not — the key difference is that RDBMS enforces **relationships** and **integrity constraints** between tables; a plain DBMS does not.

---

## 1.6 Tables, Rows, Columns, Records, Fields

**Definition:** A table is a structured object made up of rows and columns used to store data about one entity type (e.g., all employees).

| Term | Meaning |
|---|---|
| Table | Collection of related rows/columns for one entity |
| Row (Record) | One complete entry — e.g., one employee |
| Column (Field) | One attribute of the entity — e.g., salary |

**Sample Table**

| EMPLOYEE_ID | EMPLOYEE_NAME | SALARY | DEPARTMENT_ID |
|---:|---|---:|---:|
| 101 | Amar | 50000 | 10 |
| 102 | Ravi | 60000 | 20 |

Here, the whole table is `EMPLOYEES`. The row `101, Amar, 50000, 10` is one **record**. `SALARY` is one **column/field**.

---

## 1.7 Relationships

**Definition:** A relationship is a logical connection between two tables, usually created by having a common column (a key) shared between them.

### Diagram

```
DEPARTMENTS                 EMPLOYEES
------------                ------------
department_id  <----------  department_id
department_name             employee_name
                             salary
```

### Types of Relationships

**One-to-One (1:1)**
Each row in Table A relates to exactly one row in Table B.
Example: `EMPLOYEES` and `EMPLOYEE_PASSPORT_DETAILS` — one employee has one passport record.

**One-to-Many (1:N)**
One row in Table A relates to many rows in Table B.
Example: One `DEPARTMENT` has many `EMPLOYEES`.

**Many-to-Many (M:N)**
Many rows in Table A relate to many rows in Table B — normally resolved using a junction/bridge table.
Example: `ORDERS` and `PRODUCTS` — one order can have many products, and one product can appear in many orders. Resolved by `ORDER_ITEMS`.

```
ORDERS  ----<  ORDER_ITEMS  >----  PRODUCTS
```

**Interview Tip:** When asked "how do you implement many-to-many in a relational database?" — the expected answer is: *"By creating a junction/bridge table that holds the foreign keys of both tables."*

---

## 1.8 Keys

### 1.8.1 Primary Key

**Definition:** A primary key is a column (or set of columns) that uniquely identifies each row in a table. It cannot contain NULL and cannot have duplicate values.

**Why Is It Used?** To guarantee that every row can be uniquely identified and referenced — critical for relationships and data integrity.

**Syntax**
```sql
-- Oracle SQL
CREATE TABLE employees (
    employee_id   NUMBER PRIMARY KEY,
    employee_name VARCHAR2(50)
);
```

**Common Mistake:** Thinking a primary key can allow one NULL value "since it's rare." It cannot — NOT NULL is always enforced.

**Short Interview Answer:**
"A primary key uniquely identifies each row in a table. It doesn't allow NULL values and doesn't allow duplicates. Every table should ideally have one primary key, and Oracle automatically creates a unique index on it to enforce uniqueness."

**Follow-up Q:** Can a table have more than one primary key?
**A:** No — only one primary key per table, but it can be composite (made of multiple columns).

---

### 1.8.2 Foreign Key

**Definition:** A foreign key is a column in one table that refers to the primary key (or unique key) of another table, used to enforce a relationship between the two tables.

**Syntax**
```sql
-- Oracle SQL
CREATE TABLE employees (
    employee_id   NUMBER PRIMARY KEY,
    department_id NUMBER,
    CONSTRAINT fk_dept FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
);
```

**Why Is It Used?** To maintain referential integrity — you cannot insert an employee with a `department_id` that does not exist in `DEPARTMENTS`.

**Interview Trap:** A foreign key value **can** be NULL (e.g., an employee not yet assigned to a department), unlike a primary key.

### 1.8.3 Other Key Types — Comparison Table

| Key Type | Definition | Example |
|---|---|---|
| Candidate Key | A column (or set) that *could* be the primary key | EMPLOYEE_ID, EMAIL |
| Primary Key | The candidate key actually chosen | EMPLOYEE_ID |
| Alternate Key | A candidate key not chosen as primary | EMAIL |
| Composite Key | A key made of two or more columns together | (ORDER_ID, PRODUCT_ID) |
| Super Key | Any column set that uniquely identifies a row (may include extra columns) | (EMPLOYEE_ID, NAME) |
| Natural Key | A key based on real-world data | EMAIL, SSN |
| Surrogate Key | An artificial key with no business meaning, often auto-generated | EMPLOYEE_ID via SEQUENCE |

**Detailed Interview Answer — Candidate Key vs Primary Key vs Alternate Key:**
"A table can have multiple columns that qualify to be unique identifiers — these are all candidate keys. We choose one of them as the primary key. The candidate keys we did not choose become alternate keys. For example, in an EMPLOYEES table, both EMPLOYEE_ID and EMAIL could uniquely identify a row. If we pick EMPLOYEE_ID as the primary key, EMAIL becomes an alternate key."

---

## 1.9 Referential Integrity & Data Integrity

**Definition:** Referential integrity is a rule that ensures a foreign key value in one table always matches an existing primary key value in the referenced table (or is NULL).

**Data Integrity** is the broader concept: the accuracy and consistency of data over its lifecycle, enforced through constraints such as PRIMARY KEY, FOREIGN KEY, NOT NULL, CHECK, and UNIQUE.

| Type of Integrity | Enforced By |
|---|---|
| Entity Integrity | PRIMARY KEY (no duplicate/NULL identifiers) |
| Referential Integrity | FOREIGN KEY |
| Domain Integrity | Data types, CHECK constraints |
| User-Defined Integrity | Business-rule CHECK/TRIGGER logic |

---

## 1.10 Normalization (Fresher-Level)

**Definition:** Normalization is the process of organizing tables to reduce data redundancy and avoid update/insert/delete anomalies, by splitting data into related tables.

| Normal Form | Rule (Simplified) |
|---|---|
| 1NF | Each column holds only atomic (indivisible) values; no repeating groups |
| 2NF | 1NF + every non-key column depends on the *whole* primary key (relevant for composite keys) |
| 3NF | 2NF + no non-key column depends on another non-key column (no transitive dependency) |

**Easy Example:**
An unnormalized table storing `employee_name, department_name, department_location` repeats department info for every employee in that department. Splitting into `EMPLOYEES` and `DEPARTMENTS` (linked by `department_id`) removes that redundancy — this is normalization in action.

**Denormalization:** The intentional reverse process — combining tables back together to improve read performance, often used in reporting/data-warehouse systems. Trade-off: faster reads, but more redundancy.

**Interview Tip:** Freshers are rarely asked to normalize a full schema live, but almost always asked to *define* 1NF/2NF/3NF and explain *why* normalization matters (reduces redundancy, avoids anomalies, keeps data consistent).

---

## 1.11 Schema & Database Instance

**Schema:** In Oracle, a schema is a collection of database objects (tables, views, sequences, indexes, etc.) owned by a specific database user. In Oracle, **schema and user are tightly linked** — each user owns exactly one schema.

**Database Instance:** The instance is the running set of memory structures and background processes that allow access to the database; the "database" itself is the actual physical data files on disk. (Fresher-level: you just need to know an *instance* is the live running Oracle process, and the *database* is the stored data.)

---

## 1.12 SQL vs PL/SQL

| Aspect | SQL | PL/SQL |
|---|---|---|
| Full Form | Structured Query Language | Procedural Language/SQL |
| Type | Declarative (what to do) | Procedural (how to do it) |
| Purpose | Query & manipulate data | Write logic: loops, conditions, procedures |
| Execution | Single statement at a time | Block of statements (BEGIN...END) |
| Example | `SELECT * FROM employees;` | `BEGIN ... IF ... LOOP ... END;` |

**Short Interview Answer:**
"SQL is a declarative language used to define and manipulate data — you tell the database *what* result you want. PL/SQL is Oracle's procedural extension to SQL that adds programming constructs like loops, conditions, and exception handling, letting you write *how* to process that data, inside stored procedures and functions."

---

## 1.13 SQL Command Categories

| Category | Full Form | Purpose | Example Commands |
|---|---|---|---|
| DDL | Data Definition Language | Define/modify structure | CREATE, ALTER, DROP, TRUNCATE |
| DML | Data Manipulation Language | Modify data | INSERT, UPDATE, DELETE, MERGE |
| DQL | Data Query Language | Retrieve data | SELECT |
| DCL | Data Control Language | Control access | GRANT, REVOKE |
| TCL | Transaction Control Language | Manage transactions | COMMIT, ROLLBACK, SAVEPOINT |

**Interview Trap:** Many candidates forget that `TRUNCATE` is DDL (not DML) — this matters because TRUNCATE cannot normally be rolled back the way DELETE can.

---

### Diagram: From Database to Relationships

```
   DATABASE
      |
   TABLES
      |
 ROWS + COLUMNS
      |
 RELATIONSHIPS (via Primary/Foreign Keys)
```

---

## Chapter 1 — Coverage Checklist

| Topic | Covered? | Interview Qs? | Practice? |
|---|---|---|---|
| Data vs Information | ✓ | ✓ | — |
| DBMS / RDBMS | ✓ | ✓ | — |
| Tables/Rows/Columns | ✓ | ✓ | ✓ |
| Relationships (1:1, 1:N, M:N) | ✓ | ✓ | — |
| Keys (all types) | ✓ | ✓ | — |
| Referential/Data Integrity | ✓ | ✓ | — |
| Normalization (1NF–3NF) | ✓ | ✓ | — |
| Schema/Instance | ✓ | ✓ | — |
| SQL vs PL/SQL | ✓ | ✓ | — |
| SQL Command Categories | ✓ | ✓ | — |

---

# CHAPTER 2 — ORACLE BASICS AND ENVIRONMENT

## 2.1 What is Oracle Database?

**Definition:** Oracle Database is a commercial, enterprise-grade relational database management system (RDBMS) developed by Oracle Corporation, known for scalability, security, and support for large transactional systems.

**Why companies use it:** High availability, strong transaction handling (ACID), advanced security, mature tooling, and strong support for large-scale enterprise applications (banking, telecom, government).

## 2.2 Oracle Database Architecture (Beginner Level)

**Easy Meaning:** At a beginner level, you only need to know Oracle has two big parts:

```
ORACLE DATABASE
   |
   ├── INSTANCE (memory + background processes) — runs while DB is "up"
   |
   └── DATABASE FILES (data files, control files, redo log files) — physical storage on disk
```

- **Memory structures:** e.g., the System Global Area (SGA) — holds cached data and shared SQL.
- **Background processes:** manage writing, recovery, and logging automatically.
- **Data files:** where your actual table data physically lives.

You don't need deep DBA knowledge for a fresher interview — just be able to say: *"An Oracle instance is the memory and processes that let users connect and run SQL; the database is the physical files where data is stored."*

## 2.3 Oracle SQL Developer & SQL*Plus

| Tool | Description |
|---|---|
| SQL Developer | Free GUI tool from Oracle to write/run SQL, browse tables, and manage schemas visually |
| SQL*Plus | Command-line tool to connect to Oracle and run SQL/PL*SQL |

## 2.4 Connecting to Oracle

A connection typically needs: **username**, **password**, and a **connection string** (host, port, service name), e.g. `hr/password@localhost:1521/orclpdb`.

## 2.5 Schema, Users, and Tablespaces (Conceptual)

- **User:** A database account that can log in and own objects.
- **Schema:** The collection of objects (tables, views, etc.) that a user owns — in Oracle, schema = username, essentially.
- **Tablespace:** A logical storage container where Oracle physically stores the data for schema objects. Freshers just need to know: *tables live inside tablespaces, and tablespaces map to physical files on disk.*

## 2.6 Data Dictionary (Introduction)

**Definition:** The data dictionary is a set of read-only system tables/views maintained by Oracle that stores metadata — information *about* the database itself (table names, column names, constraints, etc.).

Example: `USER_TABLES` lists all tables owned by the current user. (Covered in depth in Part 3.)

## 2.7 Oracle Naming Rules

- Must start with a letter.
- Can contain letters, numbers, `_`, `$`, `#`.
- Maximum 128 bytes (in modern Oracle versions).
- Cannot be a reserved word (e.g., `SELECT`, `FROM`) unless quoted with double quotes (not recommended).
- Not case-sensitive by default (Oracle stores names in uppercase internally unless quoted).

## 2.8 Comments in SQL

```sql
-- Oracle SQL
-- Single-line comment
SELECT employee_name FROM employees; -- inline comment

/* Multi-line
   comment */
SELECT department_name FROM departments;
```

## 2.9 SQL Formatting & Readability

**Best Practice Example:**
```sql
-- Oracle SQL
SELECT employee_name,
       salary,
       department_id
FROM   employees
WHERE  salary > 50000
ORDER  BY salary DESC;
```

**Remember It:** Keywords in UPPERCASE, one clause per line, consistent indentation — this is what interviewers expect to see on a whiteboard or in a live-coding round.

---

## Chapter 2 — Coverage Checklist

| Topic | Covered? | Interview Qs? |
|---|---|---|
| Oracle Database overview | ✓ | ✓ |
| Architecture basics | ✓ | ✓ |
| SQL Developer / SQL*Plus | ✓ | ✓ |
| Schema/Users/Tablespaces | ✓ | ✓ |
| Data Dictionary intro | ✓ | ✓ |
| Naming rules | ✓ | ✓ |
| Comments & formatting | ✓ | — |

---

# CHAPTER 3 — DATA TYPES

## 3.1 Character Data Types

| Type | Description | Max Size |
|---|---|---|
| CHAR(n) | Fixed-length character data; pads with spaces | Up to 2000 bytes |
| VARCHAR2(n) | Variable-length character data (most commonly used) | Up to 4000 bytes (32767 in some configs) |
| NCHAR(n) | Fixed-length Unicode character data | Up to 2000 bytes |
| NVARCHAR2(n) | Variable-length Unicode character data | Up to 4000 bytes |

### CHAR vs VARCHAR2 — Important Difference

| Aspect | CHAR | VARCHAR2 |
|---|---|---|
| Length | Fixed — pads with trailing spaces | Variable — stores exact length |
| Storage | Always uses declared size | Uses only the space needed |
| Comparison | Trailing spaces can cause confusion | No padding-related surprises |
| Recommended for | Rarely used; fixed-code fields (e.g., 'Y'/'N') | Almost always preferred |

**Interview Trap:** `'ABC '` (CHAR(5)) and `'ABC'` (VARCHAR2) can behave differently in comparisons because CHAR pads with spaces. Interviewers love asking: *"Why did my WHERE name = 'ABC' fail to match a CHAR column?"* — Answer: because CHAR stored `'ABC  '` (padded), and depending on comparison semantics this can cause unexpected results.

## 3.2 Numeric Data Type

**NUMBER(precision, scale)** — Oracle's single, flexible numeric type.
- `NUMBER(6,2)` → up to 6 total digits, 2 after the decimal → max `9999.99`.
- `NUMBER` (no precision/scale) → stores any numeric value, up to Oracle's internal limits.

```sql
-- Oracle SQL
CREATE TABLE products (
    price NUMBER(8,2)
);
```

## 3.3 Date/Time Data Types

| Type | Stores |
|---|---|
| DATE | Date + time down to the second (no fractional seconds) |
| TIMESTAMP | Date + time with fractional seconds |
| TIMESTAMP WITH TIME ZONE | Timestamp + time zone offset |
| TIMESTAMP WITH LOCAL TIME ZONE | Timestamp stored in DB time zone, displayed in session/local time zone |
| INTERVAL | A duration/span of time (e.g., INTERVAL '2' DAY) |

**Oracle-specific behavior:** Unlike many other databases, Oracle's `DATE` type **always** includes a time component (hours/minutes/seconds), even if you don't display it. This surprises many freshers who expect `DATE` to be date-only.

### DATE vs TIMESTAMP

| Aspect | DATE | TIMESTAMP |
|---|---|---|
| Precision | Seconds | Fractional seconds (up to 9 digits) |
| Time zone support | No | Yes (with WITH TIME ZONE variant) |
| Common use | General business dates | Precise event logging |

## 3.4 Binary / Large Object Types

| Type | Stores |
|---|---|
| RAW | Small binary data (up to 2000 bytes) |
| BLOB | Large binary data (images, files) |
| CLOB | Large character text data |
| NCLOB | Large Unicode text data |
| BFILE | Reference/pointer to an external OS file |

## 3.5 NULL

**Definition:** NULL represents the *absence* of a value — it is not zero, not an empty string, and not "unknown text." It means "no data recorded."

(NULL is covered in full depth as its own chapter later in the book — Part 16.)

## 3.6 Data Type Selection, Implicit & Explicit Conversion

**Implicit conversion:** Oracle automatically converts one data type to another when needed.
```sql
-- Oracle SQL
SELECT * FROM employees WHERE employee_id = '101'; -- '101' (string) implicitly converted to number
```

**Explicit conversion:** You convert manually using functions like `TO_CHAR`, `TO_DATE`, `TO_NUMBER` (covered in Chapter 9's Functions section).

**Interview Trap:** Relying on implicit conversion is a common source of bugs and performance issues (it can prevent Oracle from using an index). Interviewers expect you to say: *"Implicit conversion works, but explicit conversion is safer and more predictable — and better for performance."*

---

## Chapter 3 — Coverage Checklist

| Topic | Covered? | Interview Qs? |
|---|---|---|
| Character types (CHAR/VARCHAR2/NCHAR/NVARCHAR2) | ✓ | ✓ |
| NUMBER | ✓ | ✓ |
| DATE/TIMESTAMP family | ✓ | ✓ |
| Binary/LOB types | ✓ | ✓ |
| NULL (intro) | ✓ | ✓ |
| Implicit/explicit conversion | ✓ | ✓ |

---

# CHAPTER 4 — DDL (DATA DEFINITION LANGUAGE)

## 4.1 CREATE TABLE

**Definition:** `CREATE TABLE` defines a new table structure — its columns, data types, and constraints.

**Syntax**
```sql
-- Oracle SQL
CREATE TABLE departments (
    department_id   NUMBER PRIMARY KEY,
    department_name VARCHAR2(50) NOT NULL,
    location_id     NUMBER
);
```

## 4.2 ALTER TABLE

Used to modify an existing table's structure.

```sql
-- Oracle SQL

-- Add a column
ALTER TABLE employees ADD (email VARCHAR2(100));

-- Modify a column
ALTER TABLE employees MODIFY (salary NUMBER(10,2));

-- Rename a column
ALTER TABLE employees RENAME COLUMN email TO email_address;

-- Drop a column
ALTER TABLE employees DROP COLUMN email_address;
```

## 4.3 DROP TABLE

```sql
-- Oracle SQL
DROP TABLE employees;
```
Removes the table structure **and** all its data permanently (subject to Oracle's Recycle Bin, from which it can sometimes be restored with `FLASHBACK TABLE ... TO BEFORE DROP`).

## 4.4 TRUNCATE TABLE

```sql
-- Oracle SQL
TRUNCATE TABLE employees;
```
Removes **all rows** but keeps the table structure. Much faster than `DELETE` because it doesn't generate row-by-row undo/redo the same way and resets storage.

## 4.5 RENAME & COMMENT

```sql
-- Oracle SQL
RENAME employees TO staff;

COMMENT ON TABLE staff IS 'Stores staff records';
COMMENT ON COLUMN staff.salary IS 'Monthly salary in INR';
```

## 4.6 DROP vs TRUNCATE vs DELETE — The Most Important Comparison

| Aspect | DELETE | TRUNCATE | DROP |
|---|---|---|---|
| Type | DML | DDL | DDL |
| Removes | Selected rows (or all, if no WHERE) | All rows | Entire table structure + data |
| WHERE clause | Allowed | Not allowed | Not applicable |
| Rollback | Yes (before COMMIT) | No (auto-commits in Oracle) | No (auto-commits) |
| Speed | Slower (logs each row) | Fast | Fast |
| Table structure | Remains | Remains | Removed |
| Resets identity/sequence link | No | Yes (storage reset) | N/A — table gone |
| Triggers fired | Yes | No | No |

**Detailed Interview Answer:**
"DELETE is a DML command that removes rows one at a time and can be rolled back before commit — you can also filter which rows to delete using WHERE. TRUNCATE is a DDL command that removes all rows at once, is much faster, but cannot be rolled back because it implicitly commits, and you cannot use a WHERE clause with it. DROP is also DDL, but it removes the entire table — both structure and data — permanently. So the key differences are: what gets removed, whether you can filter rows, and whether the operation can be undone."

**Interview Trap:** "Can TRUNCATE be rolled back?" — In standard Oracle behavior, **no**, because it behaves like an implicit COMMIT. (This is a classic tricky question.)

---

## Chapter 4 — Coverage Checklist

| Topic | Covered? | Interview Qs? | Practice? |
|---|---|---|---|
| CREATE TABLE | ✓ | ✓ | ✓ |
| ALTER TABLE (add/modify/rename/drop column) | ✓ | ✓ | ✓ |
| DROP TABLE | ✓ | ✓ | — |
| TRUNCATE TABLE | ✓ | ✓ | — |
| RENAME / COMMENT | ✓ | — | — |
| DROP vs TRUNCATE vs DELETE | ✓ | ✓ | ✓ |

---

# CHAPTER 5 — CONSTRAINTS

## 5.1 Overview

**Definition:** A constraint is a rule enforced on table columns to maintain data accuracy and integrity — it restricts what values can be stored.

| Constraint | Purpose |
|---|---|
| NOT NULL | Column must always have a value |
| UNIQUE | No duplicate values allowed (NULLs allowed, multiple NULLs permitted) |
| PRIMARY KEY | Uniquely identifies each row; NOT NULL + UNIQUE combined |
| FOREIGN KEY | Enforces a relationship to another table's key |
| CHECK | Restricts values based on a custom logical condition |
| DEFAULT | Supplies an automatic value when none is provided |

## 5.2 Column-Level vs Table-Level Constraints

```sql
-- Oracle SQL

-- Column-level
CREATE TABLE employees (
    employee_id NUMBER PRIMARY KEY,
    salary      NUMBER CHECK (salary > 0)
);

-- Table-level (needed for composite keys or named constraints)
CREATE TABLE order_items (
    order_id   NUMBER,
    product_id NUMBER,
    quantity   NUMBER,
    CONSTRAINT pk_order_items PRIMARY KEY (order_id, product_id)
);
```

## 5.3 UNIQUE vs PRIMARY KEY

| Aspect | UNIQUE | PRIMARY KEY |
|---|---|---|
| NULL allowed | Yes (multiple NULLs allowed) | No |
| Number per table | Multiple UNIQUE constraints allowed | Only one PRIMARY KEY |
| Purpose | Prevent duplicates in a column | Uniquely identify each row |

**Interview Trap:** "Can a UNIQUE column have multiple NULLs?" — **Yes**, because Oracle treats each NULL as "unknown," so two NULLs are not considered duplicates of each other.

## 5.4 CHECK Constraint

```sql
-- Oracle SQL
CREATE TABLE employees (
    salary NUMBER CHECK (salary > 0),
    gender CHAR(1) CHECK (gender IN ('M','F','O'))
);
```

## 5.5 DEFAULT Constraint

```sql
-- Oracle SQL
CREATE TABLE orders (
    order_id   NUMBER PRIMARY KEY,
    order_date DATE DEFAULT SYSDATE,
    status     VARCHAR2(20) DEFAULT 'PENDING'
);
```

## 5.6 Constraint Naming & Enable/Disable

```sql
-- Oracle SQL
ALTER TABLE employees DISABLE CONSTRAINT fk_dept;
ALTER TABLE employees ENABLE CONSTRAINT fk_dept;
```

Naming constraints explicitly (e.g., `CONSTRAINT fk_dept`) is a best practice — otherwise Oracle auto-generates cryptic system names like `SYS_C001234`, making error messages harder to debug.

## 5.7 Referential Integrity & ON DELETE Behavior

```sql
-- Oracle SQL
CREATE TABLE employees (
    employee_id   NUMBER PRIMARY KEY,
    department_id NUMBER,
    CONSTRAINT fk_dept FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
        ON DELETE CASCADE
);
```

| ON DELETE Option | Behavior |
|---|---|
| (none / RESTRICT — default) | Blocks deletion of parent row if child rows exist |
| ON DELETE CASCADE | Deleting parent row automatically deletes matching child rows |
| ON DELETE SET NULL | Deleting parent row sets the child's foreign key to NULL |

**Short Interview Answer:**
"By default, Oracle won't let you delete a parent row if child rows reference it — that's the referential integrity rule protecting against orphaned data. If we want deletions to cascade automatically, we define the foreign key with ON DELETE CASCADE, so removing a department also removes its employees. If we just want to break the link instead of deleting child rows, we use ON DELETE SET NULL."

---

## Chapter 5 — Coverage Checklist

| Topic | Covered? | Interview Qs? | Practice? |
|---|---|---|---|
| NOT NULL/UNIQUE/PK/FK/CHECK/DEFAULT | ✓ | ✓ | ✓ |
| Column vs table-level | ✓ | ✓ | ✓ |
| UNIQUE vs PRIMARY KEY | ✓ | ✓ | — |
| Enable/disable constraints | ✓ | ✓ | — |
| ON DELETE CASCADE/SET NULL | ✓ | ✓ | ✓ |

---

# CHAPTER 6 — DML (DATA MANIPULATION LANGUAGE)

## 6.1 INSERT

```sql
-- Oracle SQL

-- Single row
INSERT INTO employees (employee_id, employee_name, salary, department_id)
VALUES (101, 'Amar', 50000, 10);

-- Multiple rows (Oracle requires separate INSERT statements,
-- or INSERT ALL for multi-table inserts)
INSERT ALL
  INTO employees (employee_id, employee_name, salary) VALUES (102, 'Ravi', 60000)
  INTO employees (employee_id, employee_name, salary) VALUES (103, 'Sita', 55000)
SELECT * FROM dual;

-- Insert using SELECT (copy data from another table)
INSERT INTO employees_backup
SELECT * FROM employees WHERE department_id = 10;
```

**Interview Trap:** Unlike some other databases, plain Oracle SQL does **not** support `INSERT INTO t VALUES (1,'a'),(2,'b');` multi-row syntax the same way — you need `INSERT ALL` or separate statements (this changed in newer Oracle versions with some limitations, but freshers should know the classic Oracle approach: `INSERT ALL`).

## 6.2 UPDATE

```sql
-- Oracle SQL

-- Update selected rows
UPDATE employees
SET    salary = salary * 1.10
WHERE  department_id = 10;

-- Update multiple columns
UPDATE employees
SET    salary = 65000, department_id = 20
WHERE  employee_id = 102;
```

**Common Mistake:** Forgetting the `WHERE` clause — this updates **every row** in the table. Always double-check the WHERE clause before running UPDATE/DELETE.

## 6.3 DELETE

```sql
-- Oracle SQL
DELETE FROM employees WHERE department_id = 10;
```

## 6.4 MERGE (Upsert)

**Definition:** `MERGE` combines INSERT and UPDATE logic in a single statement — commonly called an "upsert." It compares source data to target data and updates matching rows or inserts new ones.

```sql
-- Oracle SQL
MERGE INTO employees e
USING employees_staging s
ON (e.employee_id = s.employee_id)
WHEN MATCHED THEN
    UPDATE SET e.salary = s.salary
WHEN NOT MATCHED THEN
    INSERT (employee_id, employee_name, salary)
    VALUES (s.employee_id, s.employee_name, s.salary);
```

**Real-World Example:** MERGE is heavily used in ETL/data-warehouse loading — syncing a staging table into a production table without writing separate INSERT and UPDATE logic.

**Interview Question:** "Why use MERGE instead of separate INSERT/UPDATE statements?"
**Short Answer:** "MERGE lets us handle both insert and update logic in one atomic statement based on whether a match is found, which is more efficient and cleaner than writing conditional application logic to decide between two separate DML statements."

---

## Chapter 6 — Coverage Checklist

| Topic | Covered? | Interview Qs? | Practice? |
|---|---|---|---|
| INSERT (single/multi/SELECT) | ✓ | ✓ | ✓ |
| UPDATE | ✓ | ✓ | ✓ |
| DELETE | ✓ | ✓ | ✓ |
| MERGE | ✓ | ✓ | ✓ |

---

# CHAPTER 7 — SELECT FUNDAMENTALS

## 7.1 Basic SELECT

```sql
-- Oracle SQL
SELECT employee_name, salary
FROM   employees;

SELECT * FROM employees;   -- all columns
```

## 7.2 DISTINCT

```sql
-- Oracle SQL
SELECT DISTINCT department_id
FROM   employees;
```
Removes duplicate rows from the result set.

## 7.3 Column & Table Aliases

```sql
-- Oracle SQL
SELECT employee_name AS name,
       salary        AS monthly_salary
FROM   employees e
WHERE  e.department_id = 10;
```

## 7.4 Expressions & Operator Precedence

```sql
-- Oracle SQL
SELECT employee_name,
       salary + (salary * 0.10) AS salary_with_bonus
FROM   employees;
```

Standard arithmetic precedence applies: `*` and `/` before `+` and `-`; parentheses override precedence.

## 7.5 WHERE — Filtering

### Comparison Operators
`=`, `!=` / `<>`, `>`, `<`, `>=`, `<=`

### Logical Operators

| Operator | Meaning |
|---|---|
| AND | Both conditions must be true |
| OR | Either condition must be true |
| NOT | Reverses the condition |

```sql
-- Oracle SQL
SELECT * FROM employees
WHERE  salary > 50000 AND department_id = 10;

SELECT * FROM employees
WHERE  NOT department_id = 10;
```

### IN / NOT IN

```sql
-- Oracle SQL
SELECT * FROM employees WHERE department_id IN (10, 20, 30);
SELECT * FROM employees WHERE department_id NOT IN (10, 20);
```

**Interview Trap (very common):** `NOT IN` behaves unexpectedly if the list contains a `NULL`. If **any** value in the `NOT IN` list is NULL, the query returns **zero rows** — because comparing anything to NULL yields UNKNOWN, not TRUE/FALSE. This is one of the most-asked tricky Oracle SQL questions.

### BETWEEN / NOT BETWEEN

```sql
-- Oracle SQL
SELECT * FROM employees WHERE salary BETWEEN 40000 AND 60000; -- inclusive
```

### LIKE / NOT LIKE & Wildcards

| Wildcard | Meaning |
|---|---|
| `%` | Zero or more characters |
| `_` | Exactly one character |

```sql
-- Oracle SQL
SELECT * FROM employees WHERE employee_name LIKE 'A%';   -- starts with A
SELECT * FROM employees WHERE employee_name LIKE '_a%';  -- 2nd letter is 'a'
SELECT * FROM employees WHERE employee_name LIKE '10\%' ESCAPE '\'; -- literal %
```

### IS NULL / IS NOT NULL

```sql
-- Oracle SQL
SELECT * FROM employees WHERE department_id IS NULL;
SELECT * FROM employees WHERE department_id IS NOT NULL;
```

**Critical Rule:** You can **never** use `= NULL` or `<> NULL` — these always return UNKNOWN, not TRUE. You must always use `IS NULL` / `IS NOT NULL`.

## 7.6 NULL Behavior in Filtering — Deep Dive

**Definition:** NULL means "unknown" or "absence of value." Any arithmetic or comparison operation involving NULL produces NULL/UNKNOWN, not TRUE or FALSE.

**Truth Table (Three-Valued Logic Preview)**

| Expression | Result |
|---|---|
| NULL = NULL | UNKNOWN |
| NULL <> NULL | UNKNOWN |
| 5 = NULL | UNKNOWN |
| NULL AND TRUE | UNKNOWN |
| NULL OR TRUE | TRUE |
| NULL AND FALSE | FALSE |

(Full NULL chapter with complete three-valued logic is covered later in Part 16.)

**Interview Trap:** "Will `WHERE column != NULL` return any rows?" — **No, never.** Any comparison to NULL using standard operators returns UNKNOWN, which is treated as not-true, so the row is excluded — even if the column genuinely is NULL. You must use `IS NULL`.

---

## Chapter 7 — Coverage Checklist

| Topic | Covered? | Interview Qs? | Practice? |
|---|---|---|---|
| SELECT/FROM/WHERE/DISTINCT | ✓ | ✓ | ✓ |
| Aliases | ✓ | — | ✓ |
| Expressions/precedence | ✓ | — | ✓ |
| Comparison & logical operators | ✓ | ✓ | ✓ |
| IN/BETWEEN/LIKE/IS NULL | ✓ | ✓ | ✓ |
| NULL filtering behavior | ✓ | ✓ | ✓ |

---

# CHAPTER 8 — SORTING AND RESULT FORMATTING

## 8.1 ORDER BY

```sql
-- Oracle SQL
SELECT employee_name, salary
FROM   employees
ORDER BY salary DESC;
```

- `ASC` = ascending (default)
- `DESC` = descending

## 8.2 Multiple-Column Sorting

```sql
-- Oracle SQL
SELECT employee_name, department_id, salary
FROM   employees
ORDER BY department_id ASC, salary DESC;
```
Sorts primarily by `department_id`; within each department, sorts by `salary` descending.

## 8.3 NULLS FIRST / NULLS LAST

```sql
-- Oracle SQL
SELECT employee_name, commission_pct
FROM   employees
ORDER BY commission_pct DESC NULLS LAST;
```

**Oracle-specific behavior:** By default, Oracle sorts NULLs as the **highest** value in ascending order (they appear last) and as the **highest** value in descending order too (they appear first) — unless you explicitly override with `NULLS FIRST`/`NULLS LAST`. This differs from some other databases and is a common interview trap.

## 8.4 Sorting by Column Position & Alias

```sql
-- Oracle SQL
SELECT employee_name, salary
FROM   employees
ORDER BY 2 DESC;   -- sorts by 2nd selected column (salary)

SELECT employee_name, salary AS pay
FROM   employees
ORDER BY pay DESC;  -- alias usable in ORDER BY
```

**Interview Trap:** Column aliases **can** be used in `ORDER BY` but **cannot** be used in `WHERE` — because `WHERE` executes before `SELECT` in Oracle's logical processing order (covered fully in Part 24).

---

## Chapter 8 — Coverage Checklist

| Topic | Covered? | Interview Qs? | Practice? |
|---|---|---|---|
| ORDER BY ASC/DESC | ✓ | ✓ | ✓ |
| Multi-column sort | ✓ | — | ✓ |
| NULLS FIRST/LAST | ✓ | ✓ | ✓ |
| Position/alias sorting | ✓ | ✓ | ✓ |

---

# PART 1 — FINAL AUDIT AGAINST MASTER SYLLABUS

| Syllabus Item | Status |
|---|---|
| Database foundations (data, DBMS, RDBMS, keys, relationships) | ✓ Covered |
| Normalization (1NF–3NF, denormalization) | ✓ Covered |
| Oracle basics & environment | ✓ Covered |
| Data types (character, numeric, date, binary/LOB) | ✓ Covered |
| DDL (CREATE/ALTER/DROP/TRUNCATE/RENAME/COMMENT) | ✓ Covered |
| DROP vs TRUNCATE vs DELETE | ✓ Covered |
| Constraints (all 6 types + ON DELETE behavior) | ✓ Covered |
| DML (INSERT/UPDATE/DELETE/MERGE) | ✓ Covered |
| SELECT fundamentals & filtering | ✓ Covered |
| NULL filtering behavior (intro) | ✓ Covered |
| Sorting (ORDER BY, NULLS FIRST/LAST) | ✓ Covered |
| Interview questions per topic | ✓ Included throughout |
| Diagrams where useful | ✓ Included |
| Tables for comparisons | ✓ Included |
| No major topic omitted | ✓ Confirmed against syllabus |

**Sample database tables introduced so far:** `EMPLOYEES`, `DEPARTMENTS`, `ORDERS`, `ORDER_ITEMS`, `PRODUCTS` — these will be used consistently for the rest of the book.

---

*End of Part 1.*
