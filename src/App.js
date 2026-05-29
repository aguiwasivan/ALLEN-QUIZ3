import { useEffect, useState } from "react";
import "./App.css";

const API_BASE = "https://meliusatpythonanywhere.pythonanywhere.com/";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_BASE);
      if (!response.ok) {
        throw new Error("Unable to load tasks.");
      }

      const data = await response.json();
      setTasks(data);
    } catch (fetchError) {
      setError(fetchError.message || "Failed to fetch tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const resetForm = () => {
    setTitle("");
    setDetails("");
    setDeadline("");
  };

  const handleAddTask = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          details: details.trim() || null,
          deadline: deadline || null,
          is_completed: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to add task.");
      }

      resetForm();
      await fetchTasks();
    } catch (submitError) {
      setError(submitError.message || "Failed to add task.");
      setLoading(false);
    }
  };

  const handleCompleteTask = async (task) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}${task.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...task,
          is_completed: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to complete task.");
      }

      await fetchTasks();
    } catch (updateError) {
      setError(updateError.message || "Failed to update task.");
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}${taskId}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to delete task.");
      }

      await fetchTasks();
    } catch (deleteError) {
      setError(deleteError.message || "Failed to delete task.");
      setLoading(false);
    }
  };

  const pendingTasks = tasks.filter((task) => !task.is_completed);
  const completedTasks = tasks.filter((task) => task.is_completed);

  const formatDeadline = (deadlineValue) => {
    if (!deadlineValue) return "No deadline";

    return new Date(`${deadlineValue}T00:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <main className="container">
      <header className="page-header">
        <div>
          <p className="eyebrow">Task Tracking</p>
          <h1>Professional Task Dashboard</h1>
          <p className="subtitle">
            Manage priorities, review progress, and keep deadlines under control with a clean, modern interface.
          </p>
        </div>

        <div className="status-pill">
          <span>{loading ? "Refreshing…" : "Ready"}</span>
        </div>
      </header>

      <section className="panel panel-form">
        <div className="panel-heading">
          <h2>New Task</h2>
          <p>Add a task card with deadline and optional details.</p>
        </div>

        <form className="form-grid" onSubmit={handleAddTask}>
          <label className="field-group">
            <span>Task name</span>
            <input
              type="text"
              placeholder="Write a concise task title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </label>

          <label className="field-group">
            <span>Due date</span>
            <input
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
            />
          </label>

          <label className="field-group field-group-full">
            <span>Details</span>
            <textarea
              rows="4"
              placeholder="Describe the task or add notes"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
            />
          </label>

          <button type="submit" className="button-primary" disabled={!title.trim() || loading}>
            Add task
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}
      </section>

      <section className="panel stats-panel">
        <article className="stat-card">
          <span className="stat-label">Open tasks</span>
          <strong>{pendingTasks.length}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Completed</span>
          <strong>{completedTasks.length}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Total tasks</span>
          <strong>{tasks.length}</strong>
        </article>
      </section>

      <section className="task-board">
        <div className="task-column">
          <div className="column-header">
            <h2>Pending</h2>
            <span>{pendingTasks.length}</span>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="empty-state">
              <p>No pending tasks yet. Add a new task to get started.</p>
            </div>
          ) : (
            <div className="task-list">
              {pendingTasks.map((task) => (
                <article className="task-card" key={task.id}>
                  <div className="task-card-header">
                    <h3>{task.title}</h3>
                    <span className="task-chip">Pending</span>
                  </div>
                  {task.details && <p className="task-details">{task.details}</p>}
                  <div className="task-meta">
                    <span>{formatDeadline(task.deadline)}</span>
                  </div>
                  <button className="button-secondary" onClick={() => handleCompleteTask(task)}>
                    Mark completed
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="task-column">
          <div className="column-header">
            <h2>Completed</h2>
            <span>{completedTasks.length}</span>
          </div>

          {completedTasks.length === 0 ? (
            <div className="empty-state">
              <p>Completed tasks appear here after you finish them.</p>
            </div>
          ) : (
            <div className="task-list">
              {completedTasks.map((task) => (
                <article className="task-card task-card-completed" key={task.id}>
                  <div className="task-card-header">
                    <h3>{task.title}</h3>
                    <span className="task-chip task-chip-completed">Completed</span>
                  </div>
                  {task.details && <p className="task-details">{task.details}</p>}
                  <div className="task-meta">
                    <span>{formatDeadline(task.deadline)}</span>
                  </div>
                  <button className="button-delete" onClick={() => handleDeleteTask(task.id)}>
                    Remove
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
