create TABLE User_account(
    uid UUID PRIMARY KEY,
    email VARCHAR(100),
    password VARCHAR(100),
    nickname VARCHAR(30)
);

create TABLE Tag(
    id INT PRIMARY KEY,
    creater UUID, 
    name VARCHAR(40),
    sortOrder INT DEFAULT 0,
    FOREIGN KEY (creater) REFERENCES User_account(uid)
);
