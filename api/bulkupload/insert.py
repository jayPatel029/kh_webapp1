import os
import mysql.connector
from dotenv import load_dotenv
import pandas as pd

df = pd.read_excel('readings.xlsx', header=1)


# Connect to MySQL database
try:
    connection = mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_DATABASE
    )
    if connection.is_connected():
        print("Connected to MySQL database")
        # Perform database operations here

        cursor = connection.cursor()
        for i, row in df.iterrows():
            try:
                cursor = connection.cursor()
                query = '''
                    INSERT INTO `daily_readings` 
                    (`id`, `title`, `assign_range`, `type`, `low_range`, `high_range`, 
                    `isGraph`, `showUser`, `unit`, `priority_type`, `alertTextDoc`, `createdAt`, `updatedAt`) 
                    VALUES (NULL, %s, %s, %s, %s, %s, %s, "0", %s, NULL, NULL, '2024-04-20 07:40:07.000000', '2024-04-20 07:40:07.000000')
                '''
                values = (row["title"], row["assign_range"], row["type"], row["low_range"], row["high_range"], row["isGraph"], row["unit"])
                cursor.execute(query, values)
                inserted_id = cursor.lastrowid
                print(f"Inserted ID: {inserted_id}")
                for j in range(2, int(df.columns[-1]) + 1):
                    if row[j] != "NULL":
                        query = '''
                            INSERT INTO `daily_readings_translations` 
                            (`id`, `dr_id`, `language_id`, `title`,`createdAt`, `updatedAt`) 
                            VALUES (NULL, %s, %s,%s, '2024-04-20 07:40:07.000000', '2024-04-20 07:40:07.000000')
                        '''
                        values = (inserted_id, j ,row[j])
                        cursor.execute(query, values)
                connection.commit()
                print("Data inserted successfully")
            except mysql.connector.Error as e:
                print(f"Error inserting data: {e}")


except mysql.connector.Error as e:
    print(f"Error connecting to MySQL database: {e}")

finally:
    if 'connection' in locals() and connection.is_connected():
        connection.close()
        print("MySQL connection is closed")
