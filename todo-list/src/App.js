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
    const [category, setCategory] = useState("Work");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [darkMode, setDarkMode] = useState(false);
    const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
    const [priority, setPriority] = useState("low");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        axios.get(API_URL)
            .then(response => setTasks(response.data))
            .catch(error => console.error("Error fetching tasks:", error));
    }, []);

    const addTask = () => {
        if (newTask.trim() === "") return;
        const taskData = { title: newTask, completed: false, dueDate, priority, category };

        axios.post(API_URL, taskData)
            .then(response => {
                setTasks([...tasks, response.data]); // 🆕 Local update
                axios.get(API_URL) // 🆕 Backend se latest tasks lo
                    .then(response => setTasks(response.data))
                    .catch(error => console.error("Error fetching updated tasks:", error));
            })
            .catch(error => console.error("Error adding task:", error));

        setNewTask("");
        setDueDate(new Date().toISOString().split("T")[0]);
        setPriority("low");
        setCategory("Work");

        document.getElementById("taskInput").focus(); // 🆕 Auto-focus on input
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

    const filteredTasks = tasks.filter(task => {
        if (filter === "completed") return task.completed;
        if (filter === "pending") return !task.completed;
        if (categoryFilter !== "all") return task.category === categoryFilter;
        return true;
    });

    return (
        <div className={`min-vh-100 py-4 ${darkMode ? "bg-dark text-light" : "bg-light text-dark"}`}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card shadow-lg rounded" style={{ background: darkMode ? "#222" : "#f9f9f9", color: darkMode ? "#fff" : "#333" }}>
                            {/* Header */}
                            <div className="card-header d-flex justify-content-between align-items-center p-3">
                                <h2 className="m-0">To-Do List 📋</h2>
                                <button 
                                    className={`btn ${darkMode ? "btn-light" : "btn-dark"}`} 
                                    onClick={() => setDarkMode(!darkMode)}
                                >
                                    {darkMode ? <FaSun /> : <FaMoon />}
                                </button>
                            </div>

                            <div className="card-body">
                                {/* Filters */}
                                <div className="mb-4">
                                    <div className="btn-group w-100 mb-3">
                                        <button 
                                            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => setFilter('all')}
                                        >
                                            All
                                        </button>
                                        <button 
                                            className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => setFilter('pending')}
                                        >
                                            Pending
                                        </button>
                                        <button 
                                            className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => setFilter('completed')}
                                        >
                                            Completed
                                        </button>
                                    </div>
                                    <select 
                                        className="form-select"
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                    >
                                        <option value="all">All Categories</option>
                                        <option value="Work">Work</option>
                                        <option value="Personal">Personal</option>
                                        <option value="Study">Study</option>
                                        <option value="Shopping">Shopping</option>
                                    </select>
                                </div>

                                {/* Input Form */}
                                <div className="mb-4">
                                    <div className="input-group mb-3">
                                        <input
                                            id="taskInput"
                                            type="text"
                                            className="form-control"
                                            placeholder="Add your task"
                                            value={newTask}
                                            onChange={(e) => setNewTask(e.target.value)}
                                            onKeyPress={(e) => e.key === "Enter" && addTask()}
                                            maxLength={50}
                                        />
                                        <button className="btn btn-success" onClick={addTask}>
                                            Add Task
                                        </button>
                                    </div>
                                    <div className="row g-2">
                                        <div className="col">
                                            <input 
                                                type="date" 
                                                className="form-control" 
                                                value={dueDate} 
                                                onChange={(e) => setDueDate(e.target.value)} 
                                            />
                                        </div>
                                        <div className="col">
                                            <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                                                <option value="low">Low Priority</option>
                                                <option value="medium">Medium Priority</option>
                                                <option value="high">High Priority</option>
                                            </select>
                                        </div>
                                        <div className="col">
                                            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                                                <option value="Work">Work</option>
                                                <option value="Personal">Personal</option>
                                                <option value="Study">Study</option>
                                                <option value="Shopping">Shopping</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Task List */}
                                {filteredTasks.length === 0 ? (
                                    <div className="text-center p-4">
                                        <p className="text-muted">No tasks found</p>
                                    </div>
                                ) : (
                                    <div className="list-group">
                                        {filteredTasks.map(task => (
                                            <div 
                                                key={task.id} 
                                                className={`list-group-item ${darkMode ? 'bg-dark text-light' : ''} mb-2 rounded`}
                                                style={{
                                                    borderLeft: `5px solid ${
                                                        task.priority === 'high' ? '#dc3545' :
                                                        task.priority === 'medium' ? '#ffc107' : '#28a745'
                                                    }`
                                                }}
                                            >
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className={task.completed ? 'text-decoration-line-through' : ''}>
                                                        <h6 className="mb-0">{task.title}</h6>
                                                        <small className="text-muted">
                                                            Due: {new Date(task.dueDate).toLocaleDateString()} | 
                                                            {task.category}
                                                        </small>
                                                    </div>
                                                    <div className="btn-group">
                                                        <button 
                                                            className={`btn btn-sm ${task.completed ? 'btn-success' : 'btn-outline-success'}`}
                                                            onClick={() => toggleTask(task.id)}
                                                        >
                                                            <FaCheck />
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => deleteTask(task.id)}
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
