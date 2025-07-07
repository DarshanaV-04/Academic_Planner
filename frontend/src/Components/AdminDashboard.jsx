import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tests, setTests] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assignment, setAssignment] = useState({
    title: "",
    description: "",
    studentId: "",
    deadline: "",
  });

  const [test, setTest] = useState({
    title: "",
    description: "",
    studentId: "",
    date: "",
  });

  const [classData, setClassData] = useState({
    title: "",
    description: "",
    studentIds: [],
    timeslot: "",
  });

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [plagiarismResult, setPlagiarismResult] = useState(null);
  const [checkingPlagiarism, setCheckingPlagiarism] = useState(false);
  const [plagiarismError, setPlagiarismError] = useState(null);

  const studentOptions = students.map((student) => ({
    value: student._id,
    label: student.name || student.email,
  }));

  const handleClassChange = (e) => {
    const { name, value } = e.target;
    setClassData({ ...classData, [name]: value });
  };

  const handleStudentsSelect = (selectedOptions) => {
    setClassData({
      ...classData,
      studentIds: selectedOptions
        ? selectedOptions.map((opt) => opt.value)
        : [],
    });
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/classes/create", classData);
      alert("Class assigned successfully!");
      fetchAllClasses();
    } catch (err) {
      alert("Failed to assign class.");
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchAllAssignments();
    fetchAllTests();
    fetchAllClasses();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/students");
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllAssignments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/assignments");
      setAssignments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllTests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tests");
      setTests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllClasses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/classes");
      setClasses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignmentChange = (e) => {
    setAssignment({
      ...assignment,
      [e.target.name]: e.target.value,
    });
  };

  const handleTestChange = (e) => {
    setTest({
      ...test,
      [e.target.name]: e.target.value,
    });
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/assignments/create",
        assignment
      );
      alert("Assignment assigned successfully!");
      fetchAllAssignments();
    } catch (err) {
      alert("Failed to assign assignment.");
    }
  };

  const handleTestSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/tests/create", test);
      alert("Test scheduled successfully!");
      fetchAllTests();
    } catch (err) {
      alert("Failed to schedule test.");
    }
  };

  const handleCheckPlagiarism = async (assignmentId) => {
    setCheckingPlagiarism(true);
    setPlagiarismError(null);
    setPlagiarismResult(null);

    try {
      const res = await axios.post(
        `http://localhost:5000/api/assignments/check-plagiarism/${assignmentId}`
      );

      setPlagiarismResult(res.data);
      setSelectedAssignment(assignmentId);
    } catch (err) {
      console.error("Plagiarism check error:", err);
      let errorMessage = "Failed to check plagiarism";

      if (err.response) {
        // Server responded with error status
        errorMessage = err.response.data.message || err.response.statusText;
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = "No response from server";
      } else {
        // Something else happened
        errorMessage = err.message;
      }

      setPlagiarismError(errorMessage);
      setSelectedAssignment(assignmentId);
    } finally {
      setCheckingPlagiarism(false);
    }
  };

  const renderStudent = (studentObj) => {
    if (!studentObj) return "";
    if (typeof studentObj === "object") {
      return studentObj.name || studentObj.email || studentObj._id || "";
    }
    return studentObj;
  };

  const renderStudentsList = (studentArr) => {
    if (!Array.isArray(studentArr)) return "";
    return studentArr
      .map((s) => (typeof s === "object" ? s.name || s.email || s._id : s))
      .join(", ");
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">
        Admin Dashboard
      </h2>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-xl font-bold mb-4">Assign New Assignment</h3>
          <form onSubmit={handleAssignmentSubmit}>
            <div className="mb-3">
              <label className="block mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={assignment.title}
                onChange={handleAssignmentChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Description</label>
              <textarea
                name="description"
                value={assignment.description}
                onChange={handleAssignmentChange}
                className="w-full border rounded px-3 py-2"
                required
              ></textarea>
            </div>
            <div className="mb-3">
              <label className="block mb-1">Select Student</label>
              <select
                name="studentId"
                value={assignment.studentId}
                onChange={handleAssignmentChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-1">Deadline</label>
              <input
                type="date"
                name="deadline"
                value={assignment.deadline}
                onChange={handleAssignmentChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Assign
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-xl font-bold mb-4">Schedule New Test</h3>
          <form onSubmit={handleTestSubmit}>
            <div className="mb-3">
              <label className="block mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={test.title}
                onChange={handleTestChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Description</label>
              <textarea
                name="description"
                value={test.description}
                onChange={handleTestChange}
                className="w-full border rounded px-3 py-2"
                required
              ></textarea>
            </div>
            <select
              name="studentId"
              value={test.studentId}
              onChange={handleTestChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.email}
                </option>
              ))}
            </select>

            <div className="mb-4">
              <label className="block mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={test.date}
                onChange={handleTestChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Schedule Test
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow mb-8">
        <h3 className="text-xl font-bold mb-4">All Assignments</h3>
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Deadline</th>
              <th className="px-4 py-2">Original File</th>
              <th className="px-4 py-2">Download</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Student</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  No assignments found.
                </td>
              </tr>
            ) : (
              assignments.map((a) => (
                <tr key={a._id}>
                  <td className="border px-4 py-2">
                    {a.title || a.assignmentName || "N/A"}
                  </td>
                  <td className="border px-4 py-2">{a.description || "N/A"}</td>
                  <td className="border px-4 py-2">
                    {a.deadline
                      ? new Date(a.deadline).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                    {a.originalName || "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                    {a.filePath ? (
                      <a
                        href={`http://localhost:5000/${a.filePath}`}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        Download
                      </a>
                    ) : (
                      "No file"
                    )}
                  </td>
                  <td className="border px-4 py-2">{a.status || "N/A"}</td>
                  <td className="border px-4 py-2">
                    {renderStudent(a.studentId)}
                  </td>
                  <td className="border px-4 py-2">
                    {a.filePath && (
                      <button
                        className="bg-red-600 text-white text-sm px-2 py-1 rounded hover:bg-red-700"
                        onClick={() => handleCheckPlagiarism(a._id)}
                        disabled={checkingPlagiarism}
                      >
                        {checkingPlagiarism && selectedAssignment === a._id
                          ? "Checking..."
                          : "Check Plagiarism"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-6 rounded shadow mb-8">
        <h3 className="text-xl font-bold mb-4">All Tests</h3>
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Student</th>
            </tr>
          </thead>
          <tbody>
            {tests.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
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
                  <td className="border px-4 py-2">{t.status}</td>
                  <td className="border px-4 py-2">
                    {renderStudent(t.studentId)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-6 rounded shadow mb-8">
        <h3 className="text-xl font-bold mb-4">All Classes</h3>
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Timeslot</th>
              <th className="px-4 py-2">Students</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  No classes found.
                </td>
              </tr>
            ) : (
              classes.map((c) => (
                <tr key={c._id}>
                  <td className="border px-4 py-2">{c.title}</td>
                  <td className="border px-4 py-2">{c.description}</td>
                  <td className="border px-4 py-2">
                    {c.timeslot ? new Date(c.timeslot).toLocaleString() : ""}
                  </td>
                  <td className="border px-4 py-2">
                    {renderStudentsList(c.studentIds)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-6 rounded shadow mb-8">
        <h3 className="text-xl font-bold mb-4">Assign Class to Students</h3>
        <form onSubmit={handleClassSubmit}>
          <div className="mb-3">
            <label className="block mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={classData.title}
              onChange={handleClassChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block mb-1">Description</label>
            <textarea
              name="description"
              value={classData.description}
              onChange={handleClassChange}
              className="w-full border rounded px-3 py-2"
              required
            ></textarea>
          </div>
          <div className="mb-3">
            <label className="block mb-1">Select Students</label>
            <Select
              isMulti
              name="studentIds"
              options={studentOptions}
              value={studentOptions.filter((opt) =>
                classData.studentIds.includes(opt.value)
              )}
              onChange={handleStudentsSelect}
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder="Select students..."
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Timeslot</label>
            <input
              type="datetime-local"
              name="timeslot"
              value={classData.timeslot}
              onChange={handleClassChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
          >
            Assign Class
          </button>
        </form>
      </div>

      {selectedAssignment && (plagiarismResult || plagiarismError) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded shadow max-w-xl w-full">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Plagiarism Report
            </h3>

            {plagiarismResult && (
              <div className="space-y-4">
                <div className="bg-gray-100 p-4 rounded">
                  <h4 className="font-semibold text-lg mb-2">
                    Plagiarism Check Results
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Similarity Score:</span>
                      <span
                        className={`font-bold text-lg ${
                          plagiarismResult.result?.percentage > 60
                            ? "text-red-600"
                            : plagiarismResult.result?.percentage > 40
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {plagiarismResult.result?.percentage || 0}%
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium">Plagiarism Level:</span>
                      <span
                        className={`font-bold ${
                          plagiarismResult.result?.plagiarismLevel === "High"
                            ? "text-red-600"
                            : plagiarismResult.result?.plagiarismLevel ===
                              "Medium"
                            ? "text-yellow-600"
                            : plagiarismResult.result?.plagiarismLevel === "Low"
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        {plagiarismResult.result?.plagiarismLevel || "None"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium">Comparisons Made:</span>
                      <span className="font-medium">
                        {plagiarismResult.result?.totalComparisons || 0}
                      </span>
                    </div>

                    <div className="mt-3 p-3 bg-white rounded border">
                      <span className="font-medium">Analysis:</span>
                      <p className="mt-1 text-gray-700">
                        {plagiarismResult.result?.message ||
                          "No analysis available"}
                      </p>
                    </div>

                    {/* Show top comparisons */}
                    {plagiarismResult.result?.comparisons &&
                      plagiarismResult.result.comparisons.length > 0 && (
                        <div className="mt-3">
                          <h5 className="font-medium mb-2">
                            Top Similar Assignments:
                          </h5>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {plagiarismResult.result.comparisons
                              .slice(0, 5)
                              .map((comp, index) => (
                                <div
                                  key={index}
                                  className="bg-white p-2 rounded border text-sm"
                                >
                                  <div className="flex justify-between">
                                    <span className="font-medium">
                                      {comp.assignmentTitle}
                                    </span>
                                    <span
                                      className={`font-bold ${
                                        comp.similarity > 60
                                          ? "text-red-600"
                                          : comp.similarity > 40
                                          ? "text-yellow-600"
                                          : "text-green-600"
                                      }`}
                                    >
                                      {comp.similarity}%
                                    </span>
                                  </div>
                                  <div className="text-gray-600 text-xs">
                                    Student: {comp.studentName}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                <details className="bg-gray-50 p-3 rounded">
                  <summary className="cursor-pointer font-medium text-gray-700">
                    View Raw Data
                  </summary>
                  <pre className="mt-2 bg-white p-3 rounded text-xs overflow-x-auto border">
                    {JSON.stringify(plagiarismResult, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {plagiarismError && (
              <div className="bg-red-100 text-red-700 p-4 rounded text-sm">
                {plagiarismError}
              </div>
            )}

            <button
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => {
                setSelectedAssignment(null);
                setPlagiarismResult(null);
                setPlagiarismError(null);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
