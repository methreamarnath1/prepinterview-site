# ORACLE SQL INTERVIEW MASTER BOOK
## PART 3 — Joins, Subqueries, Set Operators, Views, Sequences, Indexes, Transactions & Oracle-Specific SQL

*Continuing with the same sample database. Extra rows added below for join/subquery practice.*

**EMPLOYEES**

| EMPLOYEE_ID | EMPLOYEE_NAME | SALARY | DEPARTMENT_ID | MANAGER_ID |
|---:|---|---:|---:|---:|
| 101 | Amar | 50000 | 10 | NULL |
| 102 | Ravi | 60000 | 20 | 101 |
| 103 | Sita | 55000 | 20 | 101 |
| 104 | Neha | 45000 | 10 | 101 |
| 105 | Karan | 60000 | NULL | 101 |

**DEPARTMENTS**

| DEPARTMENT_ID | DEPARTMENT_NAME |
|---:|---|
| 10 | Finance |
| 20 | Sales |
| 30 | HR |

Note: Department 30 (HR) has **no employees**, and employee Karan has **no department** — these two facts are used deliberately throughout this Part to demonstrate OUTER JOIN and NOT EXISTS behavior.

---

# CHAPTER 13 — JOINS

## 13.1 Why Joins Exist

**Definition:** A join combines rows from two or more tables based on a related column between them, so you can query data that is spread across multiple normalized tables as if it were one table.

## 13.2 INNER JOIN

**Definition:** Returns only the rows that have matching values in **both** tables.

### Diagram
```
EMPLOYEES            DEPARTMENTS
   ○───────match───────○
        INNER JOIN
   → only rows present in BOTH tables
```

**Syntax**
```sql
-- Oracle SQL
SELECT e.employee_name, d.department_name
FROM   employees e
INNER JOIN departments d
        ON e.department_id = d.department_id;
```

**Expected Output**

| EMPLOYEE_NAME | DEPARTMENT_NAME |
|---|---|
| Amar | Finance |
| Ravi | Sales |
| Sita | Sales |
| Neha | Finance |

**Explanation:** Karan is excluded (his `department_id` is NULL, no match). HR (department 30) is excluded (no employee has `department_id = 30`). Only rows where **both sides match** appear.

**Common Mistake:** Forgetting the `ON` condition entirely, which silently produces a CROSS JOIN (every row combined with every row) instead of an error.

**Interview Question:** Q: What happens if you INNER JOIN two tables without a join condition?
**Short Answer:** "It becomes a Cartesian product — every row from the first table is combined with every row from the second table, producing rows-A × rows-B results, which is rarely what you want and can be very expensive on large tables."

---

## 13.3 LEFT OUTER JOIN

**Definition:** Returns all rows from the **left** table, plus matching rows from the right table. Unmatched right-side columns are returned as NULL.

### Diagram
```
EMPLOYEES (LEFT)         DEPARTMENTS (RIGHT)
   ●━━━━━match━━━━━━○
   ALL of LEFT + matches from RIGHT
```

```sql
-- Oracle SQL
SELECT e.employee_name, d.department_name
FROM   employees e
LEFT OUTER JOIN departments d
        ON e.department_id = d.department_id;
```

**Expected Output**

| EMPLOYEE_NAME | DEPARTMENT_NAME |
|---|---|
| Amar | Finance |
| Ravi | Sales |
| Sita | Sales |
| Neha | Finance |
| Karan | NULL |

**Explanation:** Karan is now included because LEFT OUTER JOIN keeps every row from `employees` (the left table) regardless of a match; since Karan has no matching department, `department_name` shows NULL.

**Real-World Example:** "Find all employees, including those not yet assigned to a department" — a classic LEFT JOIN use case.

---

## 13.4 RIGHT OUTER JOIN

**Definition:** Returns all rows from the **right** table, plus matching rows from the left table. Unmatched left-side columns are NULL.

```sql
-- Oracle SQL
SELECT e.employee_name, d.department_name
FROM   employees e
RIGHT OUTER JOIN departments d
        ON e.department_id = d.department_id;
```

**Expected Output**

| EMPLOYEE_NAME | DEPARTMENT_NAME |
|---|---|
| Amar | Finance |
| Neha | Finance |
| Ravi | Sales |
| Sita | Sales |
| NULL | HR |

**Explanation:** HR now appears (with NULL employee_name) because RIGHT OUTER JOIN keeps every row from `departments`, even ones with no matching employee.

**Interview Tip:** A RIGHT JOIN can always be rewritten as a LEFT JOIN by swapping table order — most developers standardize on LEFT JOIN for readability and rarely use RIGHT JOIN in practice, but interviewers still expect you to know it.

---

## 13.5 FULL OUTER JOIN

**Definition:** Returns all rows from **both** tables — matched rows combined, and unmatched rows from either side padded with NULL.

```sql
-- Oracle SQL
SELECT e.employee_name, d.department_name
FROM   employees e
FULL OUTER JOIN departments d
        ON e.department_id = d.department_id;
```

**Expected Output**

| EMPLOYEE_NAME | DEPARTMENT_NAME |
|---|---|
| Amar | Finance |
| Ravi | Sales |
| Sita | Sales |
| Neha | Finance |
| Karan | NULL |
| NULL | HR |

**Explanation:** This combines the LEFT JOIN result and RIGHT JOIN result — nothing is dropped from either table.

---

## 13.6 CROSS JOIN

**Definition:** Returns the Cartesian product — every row from the first table combined with every row from the second table, with no join condition.

```sql
-- Oracle SQL
SELECT e.employee_name, d.department_name
FROM   employees e
CROSS JOIN departments d;
```

If `employees` has 5 rows and `departments` has 3 rows, this returns **15 rows** (5 × 3).

**Real-World Example:** Generating all possible combinations — e.g., every product paired with every size/color variant.

---

## 13.7 SELF JOIN

**Definition:** A join of a table to itself, used when rows in a table relate to other rows in the same table — most commonly, employee-to-manager relationships.

```sql
-- Oracle SQL
SELECT e.employee_name AS employee, m.employee_name AS manager
FROM   employees e
LEFT JOIN employees m
       ON e.manager_id = m.employee_id;
```

**Expected Output**

| EMPLOYEE | MANAGER |
|---|---|
| Amar | NULL |
| Ravi | Amar |
| Sita | Amar |
| Neha | Amar |
| Karan | Amar |

**Explanation:** The same `employees` table is aliased twice — once as `e` (the employee) and once as `m` (the manager) — and joined on `e.manager_id = m.employee_id`.

**Interview Trap:** A SELF JOIN is not a special SQL keyword — it's a regular join where both sides happen to reference the same table via two different aliases. Interviewers sometimes ask "what SQL keyword do you use for a self join?" — the expected answer is: *"There is no special keyword; you just join the table to itself using two aliases."*

---

## 13.8 Equi Join vs Non-Equi Join

| Type | Condition | Example |
|---|---|---|
| Equi Join | Uses `=` | `ON e.department_id = d.department_id` |
| Non-Equi Join | Uses any operator other than `=` | `ON e.salary BETWEEN s.min_sal AND s.max_sal` |

```sql
-- Oracle SQL: Non-equi join example — matching salary to a grade range
SELECT e.employee_name, g.grade
FROM   employees e
JOIN   salary_grades g
     ON e.salary BETWEEN g.min_salary AND g.max_salary;
```

---

## 13.9 NATURAL JOIN & Old Oracle Join Syntax

**NATURAL JOIN** automatically joins tables on all columns with matching names and data types — generally **discouraged** in real projects because it's fragile (a renamed or added column silently changes join behavior).

```sql
-- Oracle SQL
SELECT employee_name, department_name
FROM   employees NATURAL JOIN departments;
```

**Old Oracle Join Syntax (pre-ANSI, using `(+)`)** — still appears in legacy code and is occasionally asked about in interviews:

```sql
-- Oracle SQL (old-style outer join)
SELECT e.employee_name, d.department_name
FROM   employees e, departments d
WHERE  e.department_id = d.department_id(+);   -- LEFT OUTER JOIN equivalent
```

The `(+)` is placed on the side that can have **missing** rows (i.e., on `departments` here, meaning "keep all employees even without a matching department"). This syntax is Oracle-specific and pre-dates the ANSI `JOIN` keyword.

**Interview Trap:** Interviewers sometimes show old `(+)` syntax and ask "what kind of join is this?" — you must recognize it as equivalent to LEFT or RIGHT OUTER JOIN based on which side the `(+)` is on.

---

## 13.10 Join Comparison Table

| Join Type | Returns |
|---|---|
| INNER JOIN | Only matching rows from both tables |
| LEFT OUTER JOIN | All left rows + matches from right (NULL if none) |
| RIGHT OUTER JOIN | All right rows + matches from left (NULL if none) |
| FULL OUTER JOIN | All rows from both, matched where possible |
| CROSS JOIN | Every combination (Cartesian product) |
| SELF JOIN | Table joined to itself |

## 13.11 Tricky Join Interview Question

**Q:** Why might a JOIN return more rows than either original table?

**A:** If the join column has duplicate values on either side, each match creates a separate combined row — this is called a "fan-out." For example, if `department_id = 20` appears twice in `employees` and the join matches correctly, you won't get extra rows from *that* alone; but if `departments` itself had duplicate `department_id = 20` rows (a data-quality issue), each employee in department 20 would be duplicated once per matching department row. This is a very common real-world debugging scenario: **unexpected row duplication almost always traces back to duplicate values in the joined column on one side.**

---

## Chapter 13 — Coverage Checklist

| Topic | Covered? | Interview Qs? | Practice? |
|---|---|---|---|
| INNER JOIN | ✓ | ✓ | ✓ |
| LEFT/RIGHT/FULL OUTER JOIN | ✓ | ✓ | ✓ |
| CROSS JOIN | ✓ | ✓ | ✓ |
| SELF JOIN | ✓ | ✓ | ✓ |
| Equi vs Non-equi join | ✓ | — | ✓ |
| NATURAL JOIN / old (+) syntax | ✓ | ✓ | ✓ |
| Join duplication trap | ✓ | ✓ | — |

---

# CHAPTER 14 — SUBQUERIES

## 14.1 What is a Subquery?

**Definition:** A subquery is a SELECT statement nested inside another SQL statement (SELECT, INSERT, UPDATE, DELETE), used to compute a value or set of values needed by the outer query.

## 14.2 Single-Row Subquery

Returns exactly one row, one column — usable with `=`, `>`, `<`, etc.

```sql
-- Oracle SQL
SELECT employee_name, salary
FROM   employees
WHERE  salary > (SELECT AVG(salary) FROM employees);
```

## 14.3 Multiple-Row Subquery

Returns multiple rows — must use `IN`, `ANY`, `ALL`, or `EXISTS`, **not** `=`.

```sql
-- Oracle SQL
SELECT employee_name
FROM   employees
WHERE  department_id IN (SELECT department_id FROM departments WHERE department_name IN ('Finance','Sales'));
```

**Common Mistake:** Using `=` with a subquery that can return more than one row → Oracle throws `ORA-01427: single-row subquery returns more than one row`.

## 14.4 Multiple-Column Subquery

```sql
-- Oracle SQL
SELECT employee_name
FROM   employees e
WHERE  (department_id, salary) IN
       (SELECT department_id, MAX(salary) FROM employees GROUP BY department_id);
```
Finds the highest-paid employee **in each department** by comparing a pair of columns at once.

## 14.5 Scalar Subquery

A subquery that returns a single value, usable directly inside a SELECT list.

```sql
-- Oracle SQL
SELECT employee_name,
       (SELECT department_name FROM departments d WHERE d.department_id = e.department_id) AS dept_name
FROM   employees e;
```

## 14.6 Nested Subqueries

A subquery inside another subquery.

```sql
-- Oracle SQL
SELECT employee_name
FROM   employees
WHERE  department_id = (
    SELECT department_id FROM departments
    WHERE  department_name = (SELECT 'Finance' FROM dual)
);
```

## 14.7 Correlated Subqueries

**Definition:** A correlated subquery references a column from the **outer** query, so it is re-evaluated once for every row processed by the outer query (unlike a regular subquery, which runs once).

```sql
-- Oracle SQL
SELECT e.employee_name, e.salary
FROM   employees e
WHERE  e.salary > (
    SELECT AVG(e2.salary)
    FROM   employees e2
    WHERE  e2.department_id = e.department_id   -- correlation to outer query
);
```
**Explanation:** This finds employees earning more than their **own department's** average salary — the inner query re-runs per department because it depends on `e.department_id` from the outer row.

### Correlated vs Non-Correlated Subquery

| Aspect | Non-Correlated | Correlated |
|---|---|---|
| Depends on outer query? | No | Yes |
| Execution | Runs once | Runs once per outer row (logically) |
| Performance | Generally faster | Can be slower on large tables |
| Example use | Compare to a fixed value | Compare to a per-row/per-group value |

## 14.8 EXISTS and NOT EXISTS

**Definition:** `EXISTS` returns TRUE if the subquery returns **at least one row**; it doesn't care about the actual values returned, only whether rows exist.

```sql
-- Oracle SQL
-- Departments that HAVE employees
SELECT department_name
FROM   departments d
WHERE  EXISTS (SELECT 1 FROM employees e WHERE e.department_id = d.department_id);

-- Departments with NO employees (HR, in our sample data)
SELECT department_name
FROM   departments d
WHERE  NOT EXISTS (SELECT 1 FROM employees e WHERE e.department_id = d.department_id);
```

**Expected Output (NOT EXISTS query):**

| DEPARTMENT_NAME |
|---|
| HR |

## 14.9 IN vs EXISTS / NOT IN vs NOT EXISTS

| Aspect | IN | EXISTS |
|---|---|---|
| Compares | Actual values | Just existence of rows |
| NULL safety | **Unsafe** with NOT IN if list has NULL | **Safe** — NOT EXISTS handles NULL correctly |
| Performance | Can be slower on large subquery results | Often faster; can short-circuit on first match |
| Best used when | Subquery result is small and NULL-free | Subquery is large or correlated |

**Detailed Interview Answer:**
"IN compares the outer value against a list of values returned by the subquery, and it can misbehave with NOT IN if that list contains a NULL — the whole condition can silently evaluate to UNKNOWN for every row. EXISTS, on the other hand, just checks whether the subquery returns any row at all; it doesn't compare values directly, so NOT EXISTS doesn't have the NULL problem that NOT IN has. In practice, for correlated checks — like 'find departments with no employees' — NOT EXISTS is both safer and usually more efficient than NOT IN."

## 14.10 ANY and ALL

```sql
-- Oracle SQL
SELECT employee_name, salary
FROM   employees
WHERE  salary > ANY (SELECT salary FROM employees WHERE department_id = 10);
-- greater than AT LEAST ONE value from the subquery (i.e., greater than the MIN)

SELECT employee_name, salary
FROM   employees
WHERE  salary > ALL (SELECT salary FROM employees WHERE department_id = 10);
-- greater than EVERY value from the subquery (i.e., greater than the MAX)
```

## 14.11 Subquery vs JOIN

| Aspect | Subquery | JOIN |
|---|---|---|
| Purpose | Often used to filter/check based on another table | Used to combine and display columns from multiple tables |
| Columns from both tables in output? | Not directly (unless scalar subquery in SELECT) | Yes, naturally |
| Performance | Can be similar; optimizer often rewrites internally | Generally efficient, well-optimized |
| Readability | Good for existence/aggregate checks | Good for combining data |

**Interview Tip:** A very common follow-up is: *"Can every subquery be rewritten as a JOIN?"* — Not always cleanly, especially for EXISTS/NOT EXISTS-style existence checks or correlated aggregate comparisons, though many can be. The honest answer: "Often yes, but not always as clearly or efficiently, and EXISTS/NOT EXISTS patterns are usually clearer as subqueries than as joins."

## 14.12 Subquery Locations

Subqueries can appear in:

```sql
-- Oracle SQL

-- In SELECT (scalar subquery)
SELECT employee_name, (SELECT COUNT(*) FROM employees) AS total_emp FROM employees;

-- In FROM (inline view)
SELECT dept_summary.department_id, dept_summary.total
FROM   (SELECT department_id, COUNT(*) AS total FROM employees GROUP BY department_id) dept_summary;

-- In WHERE
SELECT * FROM employees WHERE department_id = (SELECT department_id FROM departments WHERE department_name = 'Sales');

-- In HAVING
SELECT department_id, SUM(salary)
FROM   employees
GROUP BY department_id
HAVING SUM(salary) > (SELECT AVG(salary) * 2 FROM employees);
```

---

## Chapter 14 — Coverage Checklist

| Topic | Covered? | Interview Qs? | Practice? |
|---|---|---|---|
| Single/multi-row/multi-column subqueries | ✓ | ✓ | ✓ |
| Scalar & nested subqueries | ✓ | — | ✓ |
| Correlated subqueries | ✓ | ✓ | ✓ |
| EXISTS / NOT EXISTS | ✓ | ✓ | ✓ |
| IN vs EXISTS, NOT IN vs NOT EXISTS | ✓ | ✓ | ✓ |
| ANY / ALL | ✓ | — | ✓ |
| Subquery vs JOIN | ✓ | ✓ | — |
| Subquery locations (SELECT/FROM/WHERE/HAVING) | ✓ | — | ✓ |

---

# CHAPTER 15 — SET OPERATORS

## 15.1 Overview

**Definition:** Set operators combine the results of two or more SELECT statements into a single result set.

| Operator | Keeps Duplicates? | Meaning |
|---|---|---|
| UNION | No | Combines rows, removes duplicates |
| UNION ALL | Yes | Combines rows, keeps duplicates |
| INTERSECT | No | Only rows present in **both** queries |
| MINUS | No | Rows in the first query **not** present in the second |

**Rules for all set operators:**
- Both queries must have the **same number of columns**.
- Corresponding columns must have **compatible data types**.
- Only **one** `ORDER BY` is allowed, at the very end of the combined statement.

```sql
-- Oracle SQL
SELECT employee_name FROM employees WHERE department_id = 10
UNION
SELECT employee_name FROM employees WHERE department_id = 20
ORDER BY employee_name;
```

## 15.2 UNION vs UNION ALL

```sql
-- Oracle SQL
SELECT department_id FROM employees
UNION
SELECT department_id FROM departments;
-- removes duplicate department_id values from the combined list

SELECT department_id FROM employees
UNION ALL
SELECT department_id FROM departments;
-- keeps every value, including duplicates
```

**Interview Trap:** `UNION` performs an implicit sort/distinct operation to remove duplicates, which makes it **slower** than `UNION ALL` on large datasets. If you know there are no duplicates, or duplicates don't matter, always prefer `UNION ALL` for performance.

## 15.3 INTERSECT

```sql
-- Oracle SQL
SELECT department_id FROM employees
INTERSECT
SELECT department_id FROM departments;
```
Returns `department_id` values that exist in **both** `employees` and `departments`.

## 15.4 MINUS

```sql
-- Oracle SQL
SELECT department_id FROM departments
MINUS
SELECT department_id FROM employees;
```
**Expected Output:** `30` (HR) — the department that exists in `departments` but has no matching row in `employees`.

**Interview Trap:** Order matters with `MINUS` — `A MINUS B` is not the same as `B MINUS A`. Interviewers often ask you to predict output where operand order is swapped.

## 15.5 Set Operators — Comparison Table

| Aspect | UNION | UNION ALL | INTERSECT | MINUS |
|---|---|---|---|---|
| Removes duplicates | Yes | No | Yes | Yes |
| Performance | Slower (sort/dedupe) | Fastest | Moderate | Moderate |
| Result | Combined unique rows | All rows, combined | Common rows only | Difference (A not in B) |

---

## Chapter 15 — Coverage Checklist

| Topic | Covered? | Interview Qs? | Practice? |
|---|---|---|---|
| UNION / UNION ALL | ✓ | ✓ | ✓ |
| INTERSECT | ✓ | — | ✓ |
| MINUS | ✓ | ✓ | ✓ |
| Column/type/ORDER BY rules | ✓ | ✓ | — |

---

# CHAPTER 16 — VIEWS

## 16.1 What is a View?

**Definition:** A view is a stored SQL query that behaves like a virtual table — it doesn't store data itself (usually) but presents data from underlying tables through a saved query definition.

**Why Use Views?**
- Simplify complex/repeated queries
- Restrict access to specific columns/rows (security)
- Provide a stable interface even if underlying table structure changes

## 16.2 CREATE VIEW / CREATE OR REPLACE VIEW

```sql
-- Oracle SQL
CREATE VIEW emp_finance AS
SELECT employee_id, employee_name, salary
FROM   employees
WHERE  department_id = 10;

CREATE OR REPLACE VIEW emp_finance AS
SELECT employee_id, employee_name, salary, department_id
FROM   employees
WHERE  department_id = 10;
```

## 16.3 Dropping a View

```sql
-- Oracle SQL
DROP VIEW emp_finance;
```

## 16.4 Simple Views vs Complex Views

| Aspect | Simple View | Complex View |
|---|---|---|
| Based on | One table | Multiple tables, joins, or aggregates |
| DML allowed directly? | Usually yes | Often restricted |
| Example | `SELECT * FROM employees WHERE department_id=10` | Join of employees + departments with GROUP BY |

## 16.5 Updatable Views

A view is generally updatable (INSERT/UPDATE/DELETE through it) if it's based on a single table, doesn't use GROUP BY/aggregate functions/DISTINCT/set operators, and includes all NOT NULL columns without defaults.

```sql
-- Oracle SQL
UPDATE emp_finance SET salary = salary * 1.05 WHERE employee_id = 101;
-- Works because emp_finance is a simple, single-table view
```

## 16.6 WITH CHECK OPTION

**Definition:** Ensures that any INSERT/UPDATE performed through the view still satisfies the view's WHERE condition — preventing rows from being modified "out of view."

```sql
-- Oracle SQL
CREATE OR REPLACE VIEW emp_finance AS
SELECT employee_id, employee_name, salary, department_id
FROM   employees
WHERE  department_id = 10
WITH CHECK OPTION;

-- This will FAIL because it violates the view's WHERE condition:
UPDATE emp_finance SET department_id = 20 WHERE employee_id = 101;
```

## 16.7 WITH READ ONLY

```sql
-- Oracle SQL
CREATE OR REPLACE VIEW emp_finance_readonly AS
SELECT employee_id, employee_name, salary
FROM   employees
WHERE  department_id = 10
WITH READ ONLY;
```
Prevents **any** DML through the view — pure reporting/security use case.

## 16.8 View vs Table

| Aspect | Table | View |
|---|---|---|
| Stores data physically | Yes | No (usually — just stores the query) |
| Structure | Fixed columns/rows | Derived dynamically from underlying tables |
| Performance | Direct access | Slightly slower (query re-runs each time, unless materialized) |

## 16.9 View vs Materialized View (Conceptual Introduction)

**Materialized View:** Unlike a regular view, a materialized view **physically stores** the query result and must be periodically refreshed to reflect underlying data changes. Used heavily in reporting/data-warehouse scenarios where query performance matters more than up-to-the-second freshness.

```sql
-- Oracle SQL
CREATE MATERIALIZED VIEW dept_salary_summary
REFRESH COMPLETE ON DEMAND
AS
SELECT department_id, SUM(salary) AS total_salary
FROM   employees
GROUP BY department_id;
```

**Short Interview Answer:**
"A regular view is just a saved query — it has no data of its own and runs the underlying query fresh every time it's accessed. A materialized view actually stores the result physically, like a snapshot, so reads are much faster, but the data can become stale until it's refreshed. Materialized views are commonly used for reporting on large datasets where perfect real-time accuracy isn't required."

---

## Chapter 16 — Coverage Checklist

| Topic | Covered? | Interview Qs? | Practice? |
|---|---|---|---|
| CREATE/REPLACE/DROP VIEW | ✓ | ✓ | ✓ |
| Simple vs complex views | ✓ | ✓ | — |
| Updatable views | ✓ | ✓ | ✓ |
| WITH CHECK OPTION / WITH READ ONLY | ✓ | ✓ | ✓ |
| View vs table | ✓ | ✓ | — |
| View vs materialized view | ✓ | ✓ | — |

---

# CHAPTER 17 — SEQUENCES

## 17.1 What is a Sequence?

**Definition:** A sequence is an Oracle database object that automatically generates a series of unique numeric values, commonly used to populate primary key columns.

## 17.2 CREATE SEQUENCE

```sql
-- Oracle SQL
CREATE SEQUENCE emp_seq
    START WITH 100
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 999999
    NOCYCLE
    CACHE 20;
```

| Option | Meaning |
|---|---|
| START WITH | The first value generated |
| INCREMENT BY | Step size between values (can be negative for descending) |
| MINVALUE / MAXVALUE | Boundaries for the sequence |
| CYCLE / NOCYCLE | Whether the sequence restarts after reaching MAXVALUE |
| CACHE / NOCACHE | Whether Oracle pre-allocates a block of values in memory for performance |

## 17.3 NEXTVAL and CURRVAL

```sql
-- Oracle SQL
SELECT emp_seq.NEXTVAL FROM dual;   -- generates and returns the next value
SELECT emp_seq.CURRVAL FROM dual;   -- returns the last value generated in this session

INSERT INTO employees (employee_id, employee_name)
VALUES (emp_seq.NEXTVAL, 'New Employee');
```

**Common Mistake:** Calling `CURRVAL` before calling `NEXTVAL` at least once in the current session → Oracle raises an error (`ORA-08002`), because there's no "current value" yet for that session.

## 17.4 Sequence Gaps

**Interview Question:** Why can sequence values have gaps (missing numbers)?

**Short Answer:** "Sequences are not transactional — if a transaction that used `NEXTVAL` is rolled back, the generated number is not reused; it's simply lost, creating a gap. Also, if `CACHE` is used and the database restarts, cached-but-unused values are discarded. So gaps are normal and expected behavior, not a bug."

## 17.5 Sequence vs "Identity" Concept

Oracle also supports `GENERATED AS IDENTITY` columns (newer syntax, similar to auto-increment in other databases), which internally use a sequence but tie it directly to a column:

```sql
-- Oracle SQL
CREATE TABLE employees (
    employee_id NUMBER GENERATED ALWAYS AS IDENTITY,
    employee_name VARCHAR2(50)
);
```

| Aspect | Sequence (classic) | IDENTITY column |
|---|---|---|
| Independent object | Yes — can be shared across tables | Tied to one column |
| Must call NEXTVAL manually? | Yes | No — automatic on INSERT |
| Flexibility | High (skip values, custom logic) | Simpler, less flexible |

---

## Chapter 17 — Coverage Checklist

| Topic | Covered? | Interview Qs? | Practice? |
|---|---|---|---|
| CREATE SEQUENCE + options | ✓ | ✓ | ✓ |
| NEXTVAL/CURRVAL | ✓ | ✓ | ✓ |
| Sequence gaps | ✓ | ✓ | — |
| Sequence vs IDENTITY | ✓ | ✓ | — |

---

# CHAPTER 18 — INDEXES

## 18.1 What is an Index?

**Definition:** An index is a database object that improves the speed of data retrieval on a table, at the cost of additional storage and slightly slower writes, by maintaining a fast lookup structure (typically a B-tree) on one or more columns.

**Easy Meaning:** Think of an index like the index page at the back of a textbook — instead of scanning every page (every row) to find a topic, you jump directly to the right page using the index.

## 18.2 Creating and Dropping Indexes

```sql
-- Oracle SQL
CREATE INDEX idx_emp_salary ON employees(salary);
DROP INDEX idx_emp_salary;
```

## 18.3 Types of Indexes

| Type | Description |
|---|---|
| Single-column index | Index on one column |
| Composite index | Index on multiple columns together |
| Unique index | Enforces uniqueness (auto-created for PRIMARY KEY/UNIQUE constraints) |
| Function-based index | Index built on the result of an expression/function, not a raw column |

```sql
-- Oracle SQL
-- Composite index
CREATE INDEX idx_emp_dept_sal ON employees(department_id, salary);

-- Unique index
CREATE UNIQUE INDEX idx_emp_email ON employees(email);

-- Function-based index
CREATE INDEX idx_emp_upper_name ON employees(UPPER(employee_name));
```

**Interview Trap:** A function-based index like the one above is required if you frequently query `WHERE UPPER(employee_name) = 'AMAR'` — a normal index on `employee_name` won't be used because the column is wrapped in a function. This is a classic "why isn't my index being used?" interview scenario.

## 18.4 Index vs Primary Key

| Aspect | Primary Key | Index |
|---|---|---|
| Purpose | Enforces uniqueness + identifies rows | Improves query performance |
| Automatically created? | Oracle auto-creates a unique index for PK | Must be created explicitly (for non-PK columns) |
| Can exist without the other? | A PK always has an index | An index doesn't require a PK |

## 18.5 When Indexes Can Hurt Performance

- Slows down `INSERT`/`UPDATE`/`DELETE` because the index must also be maintained.
- Too many indexes on one table increases storage and write overhead.
- Indexing low-selectivity columns (like a `gender` column with only 2-3 distinct values) rarely helps and can even be ignored by the optimizer.
- Using a function on an indexed column in `WHERE` (without a matching function-based index) prevents index usage.

## 18.6 Basic Index Interview Questions

**Q:** Does every column need an index?
**A:** "No — indexes should be created on columns frequently used in WHERE, JOIN, or ORDER BY clauses, especially with high selectivity (many distinct values). Indexing every column adds unnecessary overhead to write operations without meaningful read benefit."

**Q:** Will an index always be used by the optimizer?
**A:** "Not necessarily. Oracle's optimizer decides whether to use an index based on cost estimates — for example, if a table is small, or a WHERE condition matches a large percentage of rows, a full table scan might actually be cheaper than using the index."

---

## Chapter 18 — Coverage Checklist

| Topic | Covered? | Interview Qs? | Practice? |
|---|---|---|---|
| What is an index / why used | ✓ | ✓ | — |
| Create/drop index | ✓ | — | ✓ |
| Single/composite/unique/function-based | ✓ | ✓ | ✓ |
| Index vs primary key | ✓ | ✓ | — |
| When indexes hurt performance | ✓ | ✓ | — |

---

# CHAPTER 19 — TRANSACTIONS

## 19.1 What is a Transaction?

**Definition:** A transaction is a logical unit of work consisting of one or more SQL statements, executed together such that either **all** changes are saved, or **none** are.

## 19.2 COMMIT, ROLLBACK, SAVEPOINT

```sql
-- Oracle SQL
UPDATE employees SET salary = salary * 1.10 WHERE department_id = 10;
COMMIT;   -- makes the change permanent

UPDATE employees SET salary = salary * 1.20 WHERE department_id = 20;
ROLLBACK; -- undoes the change since the last COMMIT

UPDATE employees SET salary = 70000 WHERE employee_id = 101;
SAVEPOINT sp1;
UPDATE employees SET salary = 80000 WHERE employee_id = 102;
ROLLBACK TO sp1;  -- undoes only the second update, keeps the first
COMMIT;
```

## 19.3 ACID Properties

| Property | Meaning |
|---|---|
| Atomicity | All statements in a transaction succeed, or all are undone — no partial changes |
| Consistency | A transaction moves the database from one valid state to another, respecting all constraints |
| Isolation | Concurrent transactions don't interfere with each other's intermediate states |
| Durability | Once committed, changes survive even a system crash |

**Short Interview Answer:**
"ACID stands for Atomicity, Consistency, Isolation, and Durability — the four properties that guarantee reliable transaction processing. Atomicity means a transaction is all-or-nothing. Consistency means the database always moves between valid states according to its rules and constraints. Isolation means transactions running at the same time don't see each other's uncommitted changes. Durability means once you commit, the change is permanent, even if the system crashes right after."

## 19.4 Implicit Commit in Oracle

**Oracle-specific behavior:** Certain statements cause an **implicit COMMIT** automatically — most notably, any DDL statement (`CREATE`, `ALTER`, `DROP`, `TRUNCATE`). This means you cannot roll back a `TRUNCATE` or a `CREATE TABLE` the way you can roll back DML.

```sql
-- Oracle SQL
UPDATE employees SET salary = 99999 WHERE employee_id = 101;
CREATE TABLE dummy_table (id NUMBER);  -- this implicitly commits the UPDATE above too!
ROLLBACK; -- too late — the UPDATE was already committed by the CREATE TABLE statement
```

**Interview Trap:** This is a genuinely common tricky question: "If I run an UPDATE, then a CREATE TABLE, then ROLLBACK — is the UPDATE undone?" — **No**, because the DDL statement (`CREATE TABLE`) triggers an implicit commit, locking in the earlier UPDATE as well.

## 19.5 Commit/Rollback Scenario Practice

**Given:**
```sql
-- Oracle SQL
INSERT INTO employees (employee_id, employee_name, salary) VALUES (200, 'Test1', 40000);
SAVEPOINT sp_a;
INSERT INTO employees (employee_id, employee_name, salary) VALUES (201, 'Test2', 42000);
SAVEPOINT sp_b;
INSERT INTO employees (employee_id, employee_name, salary) VALUES (202, 'Test3', 44000);
ROLLBACK TO sp_a;
COMMIT;
```

**Question:** Which rows are actually saved to the table?

**Answer:** Only employee 200 (`Test1`). `ROLLBACK TO sp_a` undoes everything **after** `sp_a` was set — meaning both the `Test2` and `Test3` inserts are undone — and then `COMMIT` permanently saves whatever remains, which is just the first insert.

---

## Chapter 19 — Coverage Checklist

| Topic | Covered? | Interview Qs? | Practice? |
|---|---|---|---|
| COMMIT/ROLLBACK/SAVEPOINT | ✓ | ✓ | ✓ |
| ACID properties | ✓ | ✓ | — |
| Implicit commit (DDL) — Oracle-specific | ✓ | ✓ | ✓ |
| Scenario practice | ✓ | ✓ | ✓ |

---

# CHAPTER 20 — DCL (DATA CONTROL LANGUAGE)

## 20.1 GRANT and REVOKE

```sql
-- Oracle SQL
GRANT SELECT, INSERT ON employees TO hr_clerk;
REVOKE INSERT ON employees FROM hr_clerk;
```

## 20.2 System Privileges vs Object Privileges

| Type | Applies To | Example |
|---|---|---|
| System Privilege | Actions at the database level | `CREATE SESSION`, `CREATE TABLE` |
| Object Privilege | Actions on a specific object | `SELECT`, `INSERT`, `UPDATE` on a table |

```sql
-- Oracle SQL
GRANT CREATE SESSION TO new_user;       -- system privilege
GRANT SELECT ON employees TO new_user;  -- object privilege
```

## 20.3 Roles (Conceptual Introduction)

**Definition:** A role is a named group of privileges that can be granted to users as a single unit, simplifying privilege management.

```sql
-- Oracle SQL
CREATE ROLE hr_read_only;
GRANT SELECT ON employees TO hr_read_only;
GRANT SELECT ON departments TO hr_read_only;
GRANT hr_read_only TO new_user;
```

**Short Interview Answer:**
"Instead of granting the same set of privileges individually to many users, we create a role, grant the necessary privileges to that role once, and then grant the role itself to users. This makes privilege management much easier to maintain — if requirements change, we update the role instead of every user individually."

---

## Chapter 20 — Coverage Checklist

| Topic | Covered? | Interview Qs? |
|---|---|---|
| GRANT/REVOKE | ✓ | ✓ |
| System vs object privileges | ✓ | ✓ |
| Roles | ✓ | ✓ |

---

# CHAPTER 21 — DATA DICTIONARY AND METADATA

## 21.1 What is the Data Dictionary?

**Definition:** The data dictionary is a set of read-only tables and views maintained automatically by Oracle that store metadata about the database — table definitions, column details, constraints, indexes, and more.

## 21.2 Common Dictionary Views

```sql
-- Oracle SQL
SELECT table_name FROM user_tables;
SELECT column_name, data_type FROM user_tab_columns WHERE table_name = 'EMPLOYEES';
SELECT constraint_name, constraint_type FROM user_constraints WHERE table_name = 'EMPLOYEES';
SELECT index_name, uniqueness FROM user_indexes WHERE table_name = 'EMPLOYEES';
SELECT view_name FROM user_views;
SELECT sequence_name FROM user_sequences;
```

| View | Shows |
|---|---|
| USER_TABLES | Tables owned by the current user |
| USER_TAB_COLUMNS | Column details of the current user's tables |
| USER_CONSTRAINTS | Constraints defined on the current user's tables |
| USER_INDEXES | Indexes on the current user's tables |
| USER_VIEWS | Views owned by the current user |
| USER_SEQUENCES | Sequences owned by the current user |

## 21.3 USER_* vs ALL_* vs DBA_*

| Prefix | Scope |
|---|---|
| USER_* | Objects owned by the currently logged-in user only |
| ALL_* | Objects the current user owns **or** has been granted access to |
| DBA_* | All objects in the entire database (requires DBA privileges) |

**Interview Trap:** A fresher might assume `USER_TABLES` shows every table in the database — it does not; it only shows tables **owned by** the currently connected schema/user. To see everything you have access to (including other schemas), you'd query `ALL_TABLES`; to see literally everything in the database, you'd need `DBA_TABLES` with sufficient privileges.

---

## Chapter 21 — Coverage Checklist

| Topic | Covered? | Interview Qs? |
|---|---|---|
| Data dictionary purpose | ✓ | ✓ |
| USER_TABLES/TAB_COLUMNS/CONSTRAINTS/INDEXES/VIEWS/SEQUENCES | ✓ | ✓ |
| USER_* vs ALL_* vs DBA_* | ✓ | ✓ |

---

# CHAPTER 22 — ORACLE-SPECIFIC CONCEPTS

## 22.1 DUAL

**Definition:** `DUAL` is a special, single-row, single-column dummy table automatically provided by Oracle, used to run queries or evaluate expressions that don't need a real table.

```sql
-- Oracle SQL
SELECT SYSDATE FROM dual;
SELECT 2 + 2 FROM dual;
SELECT emp_seq.NEXTVAL FROM dual;
```

**Oracle-specific behavior:** Most other databases (e.g., MySQL, SQL Server) let you write `SELECT SYSDATE;` without a FROM clause at all — Oracle **requires** a FROM clause on every SELECT, so `DUAL` exists purely to satisfy that syntax rule when no real table is needed.

## 22.2 ROWNUM

**Definition:** `ROWNUM` is a pseudo-column that assigns a sequential number to rows **as they are returned** by a query — starting at 1 — before any `ORDER BY` is applied to the final result.

```sql
-- Oracle SQL
SELECT employee_name, salary
FROM   employees
WHERE  ROWNUM <= 3;
```

**Interview Trap (very important):** `ROWNUM` is assigned **during** row retrieval, **before** sorting. This means:

```sql
-- Oracle SQL
-- WRONG WAY to get "top 3 highest paid" — ROWNUM is applied before ORDER BY takes effect on filtering
SELECT employee_name, salary
FROM   employees
WHERE  ROWNUM <= 3
ORDER BY salary DESC;
-- This filters to SOME 3 rows FIRST (in arbitrary retrieval order), THEN sorts those 3 — NOT the top 3 by salary!

-- CORRECT WAY — sort first in a subquery, THEN apply ROWNUM
SELECT employee_name, salary
FROM   (SELECT employee_name, salary FROM employees ORDER BY salary DESC)
WHERE  ROWNUM <= 3;
```

This is one of the single most-asked Oracle-specific tricky interview questions.

**Oracle-specific behavior:** Also note `ROWNUM = 1` works fine (returns the first row), but `ROWNUM = 2` (or any number greater than 1, used with `=`) **always returns zero rows**, because ROWNUM values are assigned incrementally starting at 1 as rows qualify, and a fresh row can never be born already "numbered 2" — there must first be a row numbered 1 in the same result set for evaluation to proceed, and once past row 1, condition `ROWNUM = 2` can never be satisfied on a subsequent row in the same pass.

## 22.3 ROWID

**Definition:** `ROWID` is a pseudo-column representing the physical address of a row within its database file — a unique internal identifier for every row in every table.

```sql
-- Oracle SQL
SELECT ROWID, employee_name FROM employees;
```

**Real-World Example:** `ROWID` is the fastest possible way to locate a row and is often used internally to delete duplicate rows:

```sql
-- Oracle SQL
DELETE FROM employees e
WHERE  e.ROWID NOT IN (
    SELECT MIN(e2.ROWID)
    FROM   employees e2
    WHERE  e2.employee_name = e.employee_name
    GROUP BY e2.employee_name
);
```

## 22.4 Oracle-Specific Function & Syntax Differences (Summary)

| Oracle-Specific | Standard/Other-DB Equivalent |
|---|---|
| `DUAL` table for expressions | Some DBs allow `SELECT 1+1;` directly |
| `NVL` | `COALESCE` (ANSI standard, also works in Oracle) |
| `DECODE` | `CASE` (ANSI standard) |
| `ROWNUM` | `ROW_NUMBER()` analytic function / `FETCH FIRST n ROWS ONLY` (newer Oracle also supports this ANSI syntax) |
| `(+)` outer join syntax | ANSI `LEFT/RIGHT JOIN` |
| `SYSDATE` | `CURRENT_DATE`/`NOW()` variants elsewhere |

**Interview Tip:** Interviewers like asking "name three things that are Oracle-specific and not standard SQL" — a strong answer: *DUAL, ROWNUM, and DECODE* (or the old `(+)` join syntax).

---

## Chapter 22 — Coverage Checklist

| Topic | Covered? | Interview Qs? | Practice? |
|---|---|---|---|
| DUAL | ✓ | ✓ | ✓ |
| ROWNUM (incl. ORDER BY trap) | ✓ | ✓ | ✓ |
| ROWID | ✓ | ✓ | ✓ |
| Oracle-specific vs standard SQL summary | ✓ | ✓ | — |

---

# PART 3 — FINAL AUDIT AGAINST MASTER SYLLABUS

| Syllabus Item | Status |
|---|---|
| All join types incl. diagrams and traps | ✓ Covered |
| Subqueries — all types + correlated + EXISTS | ✓ Covered |
| Set operators (UNION/UNION ALL/INTERSECT/MINUS) | ✓ Covered |
| Views incl. updatable, WITH CHECK OPTION, materialized | ✓ Covered |
| Sequences incl. gaps, IDENTITY comparison | ✓ Covered |
| Indexes incl. function-based, when they hurt | ✓ Covered |
| Transactions incl. ACID, implicit commit trap | ✓ Covered |
| DCL (GRANT/REVOKE/roles) | ✓ Covered |
| Data dictionary (USER_*/ALL_*/DBA_*) | ✓ Covered |
| Oracle-specific: DUAL, ROWNUM, ROWID | ✓ Covered |
| Interview questions per topic | ✓ Included throughout |
| Diagrams/tables where useful | ✓ Included |
| No major topic omitted | ✓ Confirmed against syllabus |

---

*End of Part 3.*
