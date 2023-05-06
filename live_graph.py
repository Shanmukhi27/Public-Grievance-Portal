import mysql.connector
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.animation import FuncAnimation

# MySQL database configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Shannu@18',
    'database': 'epics'
}

# Create a MySQL connection object
conn = mysql.connector.connect(**db_config)

# Create a cursor object to execute SQL queries
cursor = conn.cursor()

# Define the SQL query to get the count of complaints with different statuses
query = "SELECT COUNT(*) FROM pubcomplaint WHERE status=%s"

# Define the labels and colors for the different statuses
labels = ['Solved', 'In Progress', 'Not Started']
colors = ['green', 'orange', 'red']

# Define a function to update the graph with the latest data
def update(frame):
    # Execute the SQL query for each status and get the count of complaints
    cursor.execute(query, ('Solved',))
    solved_count = cursor.fetchone()[0]
    print(solved_count)
    cursor.execute(query, ('In Progress',))
    in_progress_count = cursor.fetchone()[0]
    print(in_progress_count)
    cursor.execute(query, ('Not Started',))
    not_started_count = cursor.fetchone()[0]

    # Update the data for the graph
    data = [solved_count, in_progress_count, not_started_count]
    for bar, value in zip(bars, data): bar.set_height(value)
    return bars,

# Create the figure and axis for the graph
fig, ax = plt.subplots()
bars = ax.bar(labels, np.zeros(len(labels)), color=colors)

# Set the labels and title for the graph
ax.set_xlabel('Complaint Status')
ax.set_ylabel('Number of Complaints')
ax.set_title('Complaints by Status')

# Create the animation for the graph
ani = FuncAnimation(fig, update, cache_frame_data=True)



# Display the graph
plt.show()

# Close the MySQL connection
conn.close()
