# Partnership Insights Hub — ER Diagram

## Entity-Relationship Diagram

```mermaid
erDiagram
    User {
        string id PK
        string email UK
        string password
        string name
        Role role
        string partnerId FK
        string branchId FK
        datetime createdAt
        datetime updatedAt
    }

    Partner {
        string id PK
        string name UK
        datetime createdAt
        datetime updatedAt
    }

    Branch {
        string id PK
        string name
        string location
        string partnerId FK
        datetime createdAt
        datetime updatedAt
    }

    SalesRecord {
        string id PK
        datetime date
        string productName
        int quantity
        float salesAmount
        float profit
        string branchId FK
        datetime createdAt
        datetime updatedAt
    }

    AuditLog {
        string id PK
        string action
        string details
        string userId FK
        datetime timestamp
    }

    Feedback {
        ObjectId _id PK
        ObjectId branch_id FK
        ObjectId analyst_id FK
        date date
        number rating
        string category
        string comment
        string[] issues
        string[] suggestions
        string status
        string reply
        ObjectId repliedBy FK
        date repliedAt
        datetime createdAt
        datetime updatedAt
    }

    CustomerFeedback {
        ObjectId _id PK
        ObjectId branchId FK
        ObjectId submittedBy FK
        date date
        string dayFeedback
        number totalCustomers
        number satisfiedCustomers
        number overallRating
        string complaints
        string highlights
        datetime createdAt
        datetime updatedAt
    }

    Report {
        ObjectId _id PK
        string type
        date date
        ObjectId branch_id FK
        number metrics__average_rating
        number metrics__total_feedback
        number metrics__issues_count
        number metrics__resolved_count
        ObjectId generated_by FK
        datetime createdAt
        datetime updatedAt
    }

    Partner ||--o{ Branch : "has many"
    Partner ||--o{ User : "has many"
    Branch ||--o{ SalesRecord : "has many"
    Branch ||--o{ User : "has many"
    Branch ||--o{ Feedback : "receives"
    Branch ||--o{ CustomerFeedback : "receives"
    Branch ||--o{ Report : "has many"
    User ||--o{ AuditLog : "generates"
    User ||--o{ Feedback : "writes as analyst"
    User ||--o{ Feedback : "replies to"
    User ||--o{ CustomerFeedback : "submits"
    User ||--o{ Report : "generates"
```

## Relationships Summary

| Relationship | Type | Description |
|---|---|---|
| Partner → Branch | One-to-Many | A partner owns multiple branches |
| Partner → User | One-to-Many | A partner has multiple associated users |
| Branch → User | One-to-Many | A branch can have multiple users assigned |
| Branch → SalesRecord | One-to-Many | A branch records many sales transactions |
| Branch → Feedback | One-to-Many | A branch receives analyst feedback |
| Branch → CustomerFeedback | One-to-Many | A branch receives daily partner feedback |
| Branch → Report | One-to-Many | Reports are generated per branch |
| User → AuditLog | One-to-Many | User actions are logged |
| User → Feedback | One-to-Many | An analyst writes feedback; a user can reply |
| User → CustomerFeedback | One-to-Many | A partner user submits daily feedback |
| User → Report | One-to-Many | A user generates reports |

## Notes

- **Dual database**: The project uses **Prisma/SQLite** for core entities (`User`, `Partner`, `Branch`, `SalesRecord`, `AuditLog`) and **Mongoose/MongoDB** for feedback & reporting (`Feedback`, `CustomerFeedback`, `Report`).
- **Role** is an enum: `ANALYST` or `PARTNER`.
- **SalesRecord** has a composite unique constraint on `(date, branchId, productName)`.
- **Feedback.category** is an enum: `sales`, `performance`, `communication`, `compliance`.
- **Report.type** is an enum: `daily`, `weekly`, `monthly`.
