import React, { useState, useEffect } from "react";
import axios from "axios";

const TaskList = () => {
    const [tasks, setTasks] = useState([]);

    // API se tasks fetch karne ka function
    const fetchTasks = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/tasks");
            setTasks(response.data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    // Component load hote hi tasks fetch kare
    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <div>
            <h2>Task List</h2>
            <ul>
                {tasks.map((task) => (
                    <li key={task.id}>
                        {task.title} - {task.description} - {task.completed ? "✅ Done" : "❌ Pending"}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TaskList;
