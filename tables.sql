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
   imf VARCHAR(25) NOT NULL,
   auth VARCHAR(25) NOT NULL,
   swift VARCHAR(255) NOT NULL,
   iban VARCHAR(255) NOT NULL,
   base_password VARCHAR(25) NOT NULL,
   status VARCHAR(255) NOT NULL,
   account_status VARCHAR(255) NOT NULL
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

CREATE TABLE user_marker (
   index SERIAL PRIMARY KEY,
   mark TEXT NOT NULL,
   user_id BIGINT NOT NULL,
   CONSTRAINT fk_users
      FOREIGN KEY(user_id)
      REFERENCES cathay_users(account_no)
);


UPDATE cathay_users SET balance = '1934000' WHERE account_no = '49949493';