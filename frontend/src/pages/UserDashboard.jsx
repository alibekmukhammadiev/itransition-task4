import { useEffect, useState } from "react";

// React Icons
import { format, formatDistanceToNow } from "date-fns";
import { TbLock, TbLockOpen2 } from "react-icons/tb";
import { MdDelete } from "react-icons/md";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // For boostrap alert
  const [alert, setAlert] = useState(null); 

  // Fetching users from backend
  const fetchUsers = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setAlert({
            type: "danger",
            message: "Session expired. Please login again.",
          });
          localStorage.removeItem("token");
          setTimeout(() => (window.location.href = "/"), 2000);
        } else {
          setUsers(data);
          setFilteredUsers(data);
          setSelectedUsers([]);
          setSelectAll(false);
        }
      })
      .catch(() =>
        setAlert({ type: "danger", message: "Failed to fetch users" })
      );
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtering by last online
  const handleFilter = () => {
    const sorted = [...users].sort(
      (a, b) => new Date(b.last_online) - new Date(a.last_online)
    );
    setFilteredUsers(sorted);
  };

  // Selecting all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
      setSelectAll(false);
    } else {
      const allIds = filteredUsers.map((u) => u.id);
      setSelectedUsers(allIds);
      setSelectAll(true);
    }
  };

  // Handling individual checkbox
  const handleCheckboxChange = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((userId) => userId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  // Blocking selected users
  const handleBlock = async () => {
    const token = localStorage.getItem("token");
    const toBlock = users.filter(
      (u) => selectedUsers.includes(u.id) && !u.is_blocked
    );
    for (const user of toBlock) {
      await fetch(`http://localhost:5000/users/${user.id}/block`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    setAlert({
      type: "warning",
      message: `${toBlock.length} user(s) blocked successfully.`,
    });
    fetchUsers();
    setTimeout(() => setAlert(null), 3000);
  };

  // Unblocking selected users
  const handleUnblock = async () => {
    const token = localStorage.getItem("token");
    const toUnblock = users.filter(
      (u) => selectedUsers.includes(u.id) && u.is_blocked
    );
    for (const user of toUnblock) {
      await fetch(`http://localhost:5000/users/${user.id}/block`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    setAlert({
      type: "success",
      message: `${toUnblock.length} user(s) unblocked successfully.`,
    });
    fetchUsers();
    setTimeout(() => setAlert(null), 3000);
  };

  // Deleting selected users
  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    for (const userId of selectedUsers) {
      await fetch(`http://localhost:5000/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    setAlert({
      type: "danger",
      message: `${selectedUsers.length} user(s) deleted successfully.`,
    });
    fetchUsers();
    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">User Management</h2>

      {/* Bootstrap alert */}
      {alert && (
        <div className={`alert alert-${alert.type} text-center`} role="alert">
          {alert.message}
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-3 d-flex justify-content-between">
        <div className="d-flex gap-2">
          <button
            onClick={handleBlock}
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            disabled={selectedUsers.length === 0}
          >
            <TbLock /> Block
          </button>
          <button
            onClick={handleUnblock}
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            disabled={selectedUsers.length === 0}
          >
            <TbLockOpen2 />
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-outline-danger d-flex align-items-center"
            disabled={selectedUsers.length === 0}
          >
            <MdDelete />
          </button>
        </div>
        <div>
          <button onClick={handleFilter} className="btn btn-primary">
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
              />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Last Login</th>
            <th>Registration Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleCheckboxChange(user.id)}
                />
              </td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                {formatDistanceToNow(new Date(user.last_online), {
                  addSuffix: true,
                })}
              </td>
              <td>{format(new Date(user.created_at), "PPpp")}</td>
              <td>
                <span
                  className={`badge ${
                    user.is_blocked ? "bg-danger" : "bg-success"
                  }`}
                >
                  {user.is_blocked ? "Blocked" : "Active"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
