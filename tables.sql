CREATE TABLE cathay_users (
   account_no BIGINT NOT NULL PRIMARY KEY,
   first_name VARCHAR(255) NOT NULL,
   last_name VARCHAR(255) NOT NULL,
   user_name VARCHAR(255) NOT NULL,
   email VARCHAR(255) NOT NULL,
   profile VARCHAR(255) NOT NULL,
   balance BIGINT NOT NULL,
   currency VARCHAR(255) NOT NULL,
   password VARCHAR(25) NOT NULL ,
   cotp VARCHAR(25) NOT NULL,
   swift VARCHAR(255) NOT NULL,
   iban VARCHAR(255) NOT NULL,
   status VARCHAR(255) NOT NULL
);

-- first_name
-- middle_name
-- last_name
-- user_name
-- email
-- currency
-- amount, IBAN, swift, time_stamp

CREATE TABLE cathay_transactions (
   index SERIAL PRIMARY KEY,
   cr_dr VARCHAR(255),
   amount VARCHAR NOT NULL,
   IBAN TEXT NOT NULL,
   swift VARCHAR NOT NULL,
   person  VARCHAR NOT NULL,
   time_stamp TEXT NOT NULL,
   user_id BIGINT NOT NULL,
   CONSTRAINT fk_users
      FOREIGN KEY(user_id)
      REFERENCES cathay_users(account_no)
);

CREATE TABLE profile_images (
   index SERIAL PRIMARY KEY,
   name TEXT NOT NULL,
   user_id BIGINT NOT NULL,
   CONSTRAINT fk_users
      FOREIGN KEY(user_id)
      REFERENCES cathay_users(account_no)
);


INSERT INTO cathay_transactions (amount, cr_dr, iban, swift, person, time_stamp, user_id) VALUES 
('123,000', 'credit', 123454321, 234565432, 'john woo', '01/02/18', 8105966585),
('1,000,000', 'credit', 123454321, 234565432, 'EXL limited', '01/02/18', 8105966585),
('5,080', 'credit', 123454321, 234565432, 'HTFS united reserve ', '01/02/19', 8105966585),
('12,000', 'credit', 123454321, 234565432, 'Gabriella Gomez', '01/02/21', 8105966585);

SELECT * FROM cathay_users JOIN cathay_transactions ON cathay_transactions.user_id = cathay_users.id;