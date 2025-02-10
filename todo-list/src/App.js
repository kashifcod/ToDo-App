import React, { useState } from "react";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";

function App() {
  const [refresh, setRefresh] = useState(false);

  const handleTaskAdded = () => {
    setRefresh(!refresh);
  };

  return (
      <div>
        <h1>ToDo List</h1>
        <TaskForm onTaskAdded={handleTaskAdded} />
        <TaskList key={refresh} />
      </div>
  );
}

export default App;
