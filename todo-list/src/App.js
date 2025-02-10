import { useState, useEffect } from "react";
import { FaTrash, FaCheck, FaEdit, FaUndo, FaSun, FaMoon, FaFlag } from "react-icons/fa";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = "http://localhost:8080/api/tasks";

export default function App() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [editTaskId, setEditTaskId] = useState(null);
    const [deletedTask, setDeletedTask] = useState(null);
    const [filter, setFilter] = useState("all");
    const [darkMode, setDarkMode] = useState(false);
    const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
    const [priority, setPriority] = useState("low");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        axios.get(API_URL)
            .then(response => setTasks(response.data))
            .catch(error => console.error("Error fetching tasks:", error));
    }, []);

    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    const addTask = () => {
        if (newTask.trim() === "") return;
        if (editTaskId) {
            axios.put(`${API_URL}/${editTaskId}`, { title: newTask, completed: false, dueDate, priority })
                .then(response => {
                    setTasks(tasks.map(task => task.id === editTaskId ? response.data : task));
                    setEditTaskId(null);
                })
                .catch(error => console.error("Error updating task:", error));
        } else {
            axios.post(API_URL, { title: newTask, completed: false, dueDate, priority })
                .then(response => setTasks([...tasks, response.data]))
                .catch(error => console.error("Error adding task:", error));
        }
        setNewTask("");
        setDueDate(new Date().toISOString().split("T")[0]);
        setPriority("low");
        setErrorMessage("");
    };

    const toggleTask = (id) => {
        const task = tasks.find(t => t.id === id);
        const updatedTask = { ...task, completed: !task.completed };
        setTasks(tasks.map(t => (t.id === id ? updatedTask : t)));
        axios.put(`${API_URL}/${id}`, updatedTask)
            .catch(error => console.error("Error updating task:", error));
    };

    const deleteTask = (id) => {
        const taskToDelete = tasks.find(t => t.id === id);
        setDeletedTask(taskToDelete);
        setTasks(tasks.filter(t => t.id !== id));
        axios.delete(`${API_URL}/${id}`)
            .catch(error => console.error("Error deleting task:", error));
    };

    const undoDelete = () => {
        if (deletedTask) {
            setTasks([...tasks, deletedTask]);
            setDeletedTask(null);
        }
    };

    const editTask = (task) => {
        setNewTask(task.title);
        setDueDate(task.dueDate);
        setPriority(task.priority);
        setEditTaskId(task.id);
        document.getElementById("taskInput").focus();
    };

    const clearCompletedTasks = () => {
        axios.delete(`${API_URL}/completed`)
            .then(() => setTasks(tasks.filter(task => !task.completed)))
            .catch(error => console.error("Error deleting completed tasks:", error));
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === "completed") return task.completed;
        if (filter === "pending") return !task.completed;
        return true;
    });

    return (
        <div className={`d-flex justify-content-center align-items-center vh-100 ${darkMode ? "bg-dark text-light" : "bg-light text-dark"}`}>
            <div className="card p-4 shadow-lg" style={{ width: "400px" }}>
                <div className="d-flex justify-content-between align-items-center">
                    <h2 className="text-center">To-Do List 📋</h2>
                    <button className="btn btn-sm btn-warning" onClick={() => setDarkMode(!darkMode)}>
                        {darkMode ? <FaSun /> : <FaMoon />}
                    </button>
                </div>
                <div className="input-group mb-3">
                    <input
                        id="taskInput"
                        type="text"
                        className="form-control"
                        placeholder={editTaskId ? "Update task" : "Add your task"}
                        value={newTask}
                        onChange={(e) => {
                            if (e.target.value.length > 20) {
                                setErrorMessage("Task title cannot exceed 10 characters!");
                            } else {
                                setErrorMessage("");
                            }
                            setNewTask(e.target.value);
                        }}
                        onKeyPress={(e) => e.key === "Enter" && addTask()}
                        maxLength={20}
                    />
                    <input
                        type="date"
                        className="form-control ms-2"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                    <select
                        className="form-control ms-2"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                    <button className="btn btn-success ms-2" onClick={addTask}>
                        {editTaskId ? "Update" : "Add"}
                    </button>
                </div>
                {errorMessage && <p className="text-danger mt-1">{errorMessage}</p>}
                <ul className="list-group">
                    {filteredTasks.map(task => (
                        <li key={task.id} className={`list-group-item d-flex justify-content-between align-items-center ${task.completed ? "text-decoration-line-through text-muted" : ""}`}>
                            <span style={{ maxWidth: "200px", wordWrap: "break-word", whiteSpace: "normal" }}>
                                {task.title}
                            </span>
                            <div className="d-flex gap-2">
                                <span className={`badge bg-${task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "secondary"}`}>
                                    <FaFlag />
                                </span>
                                <button className={`btn btn-sm ${task.completed ? "btn-success" : "btn-outline-success"}`} onClick={() => toggleTask(task.id)}>
                                    <FaCheck />
                                </button>
                                <button className="btn btn-sm btn-outline-primary" onClick={() => editTask(task)}>
                                    <FaEdit />
                                </button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => deleteTask(task.id)}>
                                    <FaTrash />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="text-center mt-3">
                    <button className="btn btn-danger btn-sm" onClick={clearCompletedTasks}>Clear Completed</button>
                </div>
            </div>
        </div>
    );
}
