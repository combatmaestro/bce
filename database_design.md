# Database Design for Bristol Community Events

## Entities and Relationships
The project models several entities in line with the assessment case study. The front-end prototype uses `data.json`, but the design is suitable for a normalized relational database.

### Entities
- `User`
  - id
  - name
  - email
  - password
  - role

- `Venue`
  - id
  - name
  - capacity
  - suitableFor

- `Event`
  - id
  - title
  - category
  - date
  - price
  - venueId
  - capacity
  - booked
  - description
  - conditions
  - lastBookingDate
  - multiDay
  - days
  - status
  - organiserId

- `Booking`
  - id
  - eventId
  - userId
  - quantity
  - daysBooked
  - total
  - status
  - bookedAt
  - receiptNo

- `Waitlist`
  - id
  - eventId
  - userId
  - quantity
  - requestedAt
  - status
  - details

### Relationships
- `User` 1..* `Booking`
- `User` 1..* `Event` (for organisers)
- `Venue` 1..* `Event`
- `Event` 1..* `Booking`
- `Event` 1..* `Waitlist`

## Normalization
The design follows 3NF principles:
- Each entity has a unique primary key.
- Non-key fields depend only on the key.
- There is no redundant storage of event details across bookings.

### Example SQL tables
```sql
CREATE TABLE Users (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role VARCHAR(20)
);

CREATE TABLE Venues (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(150),
  capacity INT,
  suitableFor TEXT
);

CREATE TABLE Events (
  id VARCHAR(20) PRIMARY KEY,
  title VARCHAR(150),
  category VARCHAR(50),
  date DATE,
  price DECIMAL(8,2),
  venueId VARCHAR(20),
  capacity INT,
  booked INT,
  description TEXT,
  conditions TEXT,
  lastBookingDate DATE,
  multiDay BOOLEAN,
  days INT,
  status VARCHAR(20),
  organiserId VARCHAR(20),
  FOREIGN KEY (venueId) REFERENCES Venues(id),
  FOREIGN KEY (organiserId) REFERENCES Users(id)
);

CREATE TABLE Bookings (
  id VARCHAR(20) PRIMARY KEY,
  eventId VARCHAR(20),
  userId VARCHAR(20),
  quantity INT,
  daysBooked INT,
  total DECIMAL(8,2),
  status VARCHAR(20),
  bookedAt DATE,
  receiptNo VARCHAR(50),
  FOREIGN KEY (eventId) REFERENCES Events(id),
  FOREIGN KEY (userId) REFERENCES Users(id)
);

CREATE TABLE Waitlist (
  id VARCHAR(20) PRIMARY KEY,
  eventId VARCHAR(20),
  userId VARCHAR(20),
  quantity INT,
  requestedAt DATE,
  status VARCHAR(20),
  details JSON,
  FOREIGN KEY (eventId) REFERENCES Events(id),
  FOREIGN KEY (userId) REFERENCES Users(id)
);
```

## Security considerations
- Passwords should be hashed before storage in a real system.
- User roles control access to admin and organiser features.
- XSS protection requires sanitizing input in a real back-end.

## Notes
This prototype uses JSON data and browser state only, but the design above can be mapped directly to a relational database for a complete implementation.
