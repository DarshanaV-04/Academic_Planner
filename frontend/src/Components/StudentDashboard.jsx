import React, { useEffect, useState } from "react";
import axios from "axios";

const StudentDashboard = () => {
  const [user, setUser] = useState({});
  const [assignments, setAssignments] = useState([]);
  const [tests, setTests] = useState([]);
  const [studentDetails, setStudentDetails] = useState({});
  const [classes, setClasses] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // NEW STATES for file upload
  const [file, setFile] = useState(null);
  const [assignmentName, setAssignmentName] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser._id) {
      fetchProfile(storedUser._id);
      fetchAssignments(storedUser._id);
      fetchTests(storedUser._id);
      fetchStudentDetails(storedUser._id);
      fetchClasses(storedUser._id);
    }
  }, []);

  useEffect(() => {
    const assignmentAlerts = assignments
      .filter(
        (a) => a.status !== "Completed" && new Date(a.deadline) < new Date()
      )
      .map((a) => `Assignment "${a.title}" is overdue!`);

    const testAlerts = tests
      .filter(
        (t) => t.status !== "Completed" && new Date(t.date) < new Date()
      )
      .map((t) => `Test "${t.title}" was missed!`);

    setAlerts([...assignmentAlerts, ...testAlerts]);
  }, [assignments, tests]);

  const fetchClasses = async (userId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/classes/student/${userId}`
      );
      setClasses(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchProfile = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/auth/profile/${id}`
      );
      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchAssignments = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/assignments/student/${id}`
      );
      setAssignments(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchTests = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/tests/student/${id}`
      );
      setTests(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchStudentDetails = async (userId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/student-details/user/${userId}`
      );
      setStudentDetails(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const updateAssignmentStatus = async (assignmentId, status) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/assignments/${assignmentId}/status`,
        { status }
      );
      fetchAssignments(user._id);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const updateTestStatus = async (testId, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/tests/${testId}/status`, {
        status,
      });
      fetchTests(user._id);
    } catch (err) {
      alert("Failed to update test status");
    }
  };

  // NEW UPLOAD FUNCTION
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file || !assignmentName) {
      alert("Please select a file and enter assignment name.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("assignmentName", assignmentName);
    formData.append("studentId", user._id);

    try {
      await axios.post(
        "http://localhost:5000/api/assignments/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Assignment uploaded successfully!");
      setFile(null);
      setAssignmentName("");
      fetchAssignments(user._id);
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h2 className="text-3xl font-bold text-center text-green-700 mb-8">
        Student Dashboard
      </h2>

      {alerts.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong className="font-bold">Alert!</strong>
          <ul className="list-disc ml-6">
            {alerts.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white p-6 rounded shadow mb-8">
        <h3 className="text-xl font-bold mb-4">Upload New Assignment</h3>
        <form onSubmit={handleUpload}>
          <input
            type="text"
            placeholder="Assignment Name"
            value={assignmentName}
            onChange={(e) => setAssignmentName(e.target.value)}
            className="border border-gray-300 p-2 w-full mb-4 rounded"
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full mb-4"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Upload
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded shadow mb-8">
        <h3 className="text-xl font-bold mb-4">My Profile</h3>
        <p>
          <strong>Name:</strong> {studentDetails.name}
        </p>
        <p>
          <strong>Roll No:</strong> {studentDetails.rollNo}
        </p>
        <p>
          <strong>Department:</strong> {studentDetails.department}
        </p>
        <p>
          <strong>Year:</strong> {studentDetails.year}
        </p>
        <p>
          <strong>Email:</strong> {studentDetails.email}
        </p>
        <p>
          <strong>Phone:</strong> {studentDetails.phone}
        </p>
      </div>

      <div className="bg-white p-6 rounded shadow mb-8">
        <h3 className="text-xl font-bold mb-4">My Assignments</h3>
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Deadline</th>
              <th className="px-4 py-2">Status/Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  No assignments found.
                </td>
              </tr>
            ) : (
              assignments.map((a) => (
                <tr key={a._id}>
                  <td className="border px-4 py-2">{a.title}</td>
                  <td className="border px-4 py-2">{a.description}</td>
                  <td className="border px-4 py-2">
                    {a.deadline
                      ? new Date(a.deadline).toLocaleDateString()
                      : ""}
                  </td>
                  <td className="border px-4 py-2">
                    <strong>Status:</strong> {a.status}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        disabled={a.status === "Completed"}
                        onClick={() =>
                          updateAssignmentStatus(a._id, "Completed")
                        }
                        className="bg-green-500 text-white px-2 py-1 rounded mx-1"
                      >
                        Mark as Completed
                      </button>
                      <button
                        disabled={a.status === "Pending"}
                        onClick={() =>
                          updateAssignmentStatus(a._id, "Pending")
                        }
                        className="bg-yellow-500 text-white px-2 py-1 rounded mx-1"
                      >
                        Mark as Pending
                      </button>
                      <button
                        disabled={a.status === "Not Started"}
                        onClick={() =>
                          updateAssignmentStatus(a._id, "Not Started")
                        }
                        className="bg-gray-500 text-white px-2 py-1 rounded mx-1"
                      >
                        Mark as Not Started
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-6 rounded shadow mb-8">
        <h3 className="text-xl font-bold mb-4">My Tests</h3>
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Status/Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  No tests found.
                </td>
              </tr>
            ) : (
              tests.map((t) => (
                <tr key={t._id}>
                  <td className="border px-4 py-2">{t.title}</td>
                  <td className="border px-4 py-2">{t.description}</td>
                  <td className="border px-4 py-2">
                    {t.date ? new Date(t.date).toLocaleDateString() : ""}
                  </td>
                  <td className="border px-4 py-2">
                    <strong>Status:</strong> {t.status}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        disabled={t.status === "Completed"}
                        onClick={() => updateTestStatus(t._id, "Completed")}
                        className="bg-green-500 text-white px-2 py-1 rounded mx-1"
                      >
                        Mark as Completed
                      </button>
                      <button
                        disabled={t.status === "Not Started"}
                        onClick={() => updateTestStatus(t._id, "Not Started")}
                        className="bg-gray-500 text-white px-2 py-1 rounded mx-1"
                      >
                        Mark as Not Started
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-6 rounded shadow mb-8">
        <h3 className="text-xl font-bold mb-4">My Classes</h3>
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Timeslot</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-4">
                  No classes assigned.
                </td>
              </tr>
            ) : (
              classes.map((c) => (
                <tr key={c._id}>
                  <td className="border px-4 py-2">{c.title}</td>
                  <td className="border px-4 py-2">{c.description}</td>
                  <td className="border px-4 py-2">
                    {c.timeslot
                      ? new Date(c.timeslot).toLocaleString()
                      : ""}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentDashboard;
