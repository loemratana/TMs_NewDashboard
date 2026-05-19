import React, { useState, useEffect, useCallback } from "react";
import { Button, Table, Modal, Form, Alert, Row, Col } from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus, FaCheck } from "react-icons/fa";
import axios from "axios";
import "../App.css";

const ManageTask = ({ loggedInUser, view }) => {
    const [showModal, setShowModal] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [currentTask, setCurrentTask] = useState({
        taskName: "",
        description: "",
        priority: "Null",
        status: "Pending",
        dueDate: "",
        assignTo: "",
        createdDate: new Date().toISOString().split("T")[0],
    });
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
        setShowImageModal(true);
    };


    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess("");
                setError("");
                setShowSuccessAlert(false);
                setShowErrorAlert(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [success, error]);

    const fetchTasks = useCallback(async () => {
        try {
            const params = {
                role: loggedInUser?.role,
                userId: loggedInUser?.UserID,
                department: loggedInUser?.department
            };

            const response = await axios.get("https://tms-backend-server.onrender.com/api/tasks", { params });
            const sortedTasks = response.data.sort((a, b) => a.TaskID - b.TaskID);
            setTasks(sortedTasks);
        } catch (err) {
            setError("Failed to fetch tasks: " + err.message);
            setShowErrorAlert(true);
        }
    }, [loggedInUser]);

    const fetchUsers = useCallback(async () => {
        try {
            const response = await axios.get("https://tms-backend-server.onrender.com/api/users");
            setUsers(response.data);
        } catch (err) {
            setError("Failed to fetch users: " + err.message);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
        fetchUsers();
    }, [fetchTasks, fetchUsers]);

    const getVisibleTasks = () => {
        if (!loggedInUser) return [];

        // For "yours" view - show only tasks assigned to the user
        if (view === "yours") {
            return tasks.filter(task => task.Assign_To === loggedInUser.UserID);
        }

        // For "assign" view:
        if (view === "assign") {
            if (loggedInUser.role === "Manager") {
                // Show tasks created by manager OR assigned to their department's supervisors
                return tasks.filter(task => {
                    const assignedUser = users.find(u => u.UserID === task.Assign_To);
                    return (
                        task.Created_By === loggedInUser.UserID ||
                        (assignedUser?.Department === loggedInUser.department &&
                            assignedUser?.Roles === "Supervisor")
                    );
                });
            }
            if (loggedInUser.role === "Supervisor") {
                // Show tasks created by supervisor AND tasks assigned to their department's users
                return tasks.filter(task => {
                    const assignedUser = users.find(u => u.UserID === task.Assign_To);
                    return (
                        task.Created_By === loggedInUser.UserID ||
                        (assignedUser?.Department === loggedInUser.department &&
                            assignedUser?.Roles === "User")
                    );
                });
            }
        }

        // Admin sees all tasks
        if (loggedInUser.role === "Admin") return tasks;

        return [];
    };

    const calculateDaysRemaining = (dueDate) => {
        try {
            const today = new Date();
            const due = new Date(dueDate);

            if (isNaN(due.getTime())) {
                console.error('Invalid due date:', dueDate);
                return 0;
            }

            today.setHours(0, 0, 0, 0);
            due.setHours(0, 0, 0, 0);

            const diffTime = due.getTime() - today.getTime();
            const diffDays = Number(diffTime) / (1000 * 60 * 60 * 24);

            return Math.round(diffDays); // Using Math.round instead of ceil for more accurate results
        } catch (err) {
            console.error('Error calculating days remaining:', err);
            return 0;
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setIsEditing(false);
        setError("");
        resetForm();
    };

    const handleShow = () => {
        setShowModal(true);
        resetForm();
    };

    const resetForm = () => {
        setCurrentTask({
            taskName: "",
            description: "",
            priority: "Null",
            status: "Pending",
            dueDate: "",
            assignTo: "",
            createdDate: new Date().toISOString().split("T")[0],
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentTask((prev) => ({
            ...prev,
            [name]: name === 'dueDate' ? new Date(value).toISOString().split('T')[0] : value,
        }));
    };
    const handleSubmit = async () => {
        if (!validateForm()) return;
        try {
            let dueDate = null;
            if (currentTask.dueDate) {
                dueDate = new Date(currentTask.dueDate);
                dueDate.setUTCHours(0, 0, 0, 0); // Ensure due date is set to midnight UTC
            }

            const taskData = {
                Task_Name: currentTask.taskName,
                Descriptions: currentTask.description,
                Prioritys: currentTask.priority,
                Status: "Pending", // Always set initial status to Pending
                Due_Date: dueDate?.toISOString(),
                Assign_To: parseInt(currentTask.assignTo),
                Created_By: loggedInUser.id // Fix: Use loggedInUser.id instead of UserID
            };

            console.log('Submitting task with data:', taskData); // Debug log

            if (isEditing) {
                await axios.put(`https://tms-backend-server.onrender.com/api/tasks/${currentTask.id}`, taskData);
            } else {
                await axios.post("https://tms-backend-server.onrender.com/api/tasks", taskData);
            }
            await fetchTasks();
            setSuccess(isEditing ? "Task updated successfully!" : "Task created successfully!");
            setShowSuccessAlert(true);
            handleClose();
        } catch (err) {
            console.error('Submit error:', err.response?.data || err);
            setError("Error: " + (err.response?.data?.error || err.message));
        }
    };

    const handleEdit = (task) => {
        setCurrentTask({
            id: task.TaskID,
            taskName: task.Task_Name || '',
            description: task.Descriptions || '',
            priority: task.Prioritys || 'Null',
            status: task.Status || 'Pending',
            dueDate: task.Due_Date ? new Date(task.Due_Date).toISOString().split('T')[0] : '',
            assignTo: task.Assign_To?.toString() || '',
        });
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await axios.delete(`https://tms-backend-server.onrender.com/api/tasks/${id}`);
                setSuccess("Task deleted successfully!");
                fetchTasks();
            } catch (err) {
                setError("Error deleting task: " + err.message);
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'black';
            case 'Accepted':
                return 'blue';
            case 'In Progress':
                return 'rgb(255, 85, 0)';
            case 'Completed':
                return 'green';
            default:
                return 'black';
        }
    };

    const validateForm = () => {
        const requiredFields = [
            "taskName",
            "description",
            "priority",
            "dueDate",
            "assignTo",
        ];

        const missingFields = requiredFields.filter(
            (field) => !currentTask[field] || currentTask[field].trim() === ""
        );

        if (missingFields.length > 0) {
            setError(`Please fill in the following fields: ${missingFields.join(", ")}`);
            setShowErrorAlert(true);
            return false;
        }

        if (currentTask.dueDate) {
            const dueDate = new Date(currentTask.dueDate);
            if (isNaN(dueDate.getTime())) {
                setError("Invalid due date");
                setShowErrorAlert(true);
                return false;
            }
        }

        return true;
    };

    const datePickerStyles = {
        wrapper: {
            position: 'relative',
            width: '100%'
        },
        input: {
            cursor: 'pointer',
            width: '100%',
            padding: '0.375rem 0.75rem',
            border: '1px solid #ced4da',
            borderRadius: '0.25rem',
            backgroundColor: '#fff'
        }
    };

    // Update getAssignableUsers function
    const getAssignableUsers = () => {
        if (!loggedInUser) return [];

        // Debug logging
        console.log('GetAssignableUsers - Current User:', {
            role: loggedInUser.role,
            department: loggedInUser.department
        });
        console.log('Available Users:', users);

        const sameDepartment = (user) => {
            // Case-insensitive department comparison
            const userDept = user.Department?.trim().toLowerCase();
            const loggedInDept = loggedInUser.department?.trim().toLowerCase();
            console.log(`Comparing departments: ${userDept} === ${loggedInDept}`);
            return userDept === loggedInDept;
        };

        // For Manager - show only Supervisors in their department
        if (loggedInUser.role === "Manager") {
            const supervisors = users.filter(user =>
                sameDepartment(user) &&
                user.Roles?.trim() === "Supervisor"
            );
            console.log('Filtered Supervisors:', supervisors);
            return supervisors;
        }

        // For Supervisor - show all Users in their department
        if (loggedInUser.role === "Supervisor") {
            const departmentUsers = users.filter(user =>
                sameDepartment(user) &&
                user.Roles?.trim() === "User"
            ).sort((a, b) => a.UserName.localeCompare(b.UserName));

            console.log('Filtered Department Users:', departmentUsers);
            return departmentUsers;
        }

        // For Admin - show all users except Admin
        if (loggedInUser.role === "Admin") {
            return users
                .filter(user => user.Roles !== "Admin")
                .sort((a, b) => {
                    if (a.Department !== b.Department) {
                        return a.Department.localeCompare(b.Department);
                    }
                    return a.UserName.localeCompare(b.UserName);
                });
        }

        return [];
    };

    const handleApproveTask = async (taskId) => {
        try {
            await axios.put(`https://tms-backend-server.onrender.com/api/tasks/${taskId}/status`, {
                status: 'Completed',
                approvedBy: loggedInUser.UserID,
            });
            setSuccess('Task approved successfully!');
            fetchTasks();
        } catch (err) {
            setError('Error approving task: ' + err.message);
        }
    };

    const getQualityColor = (quality) => {
        switch (quality) {
            case 'Low':
                return 'red';
            case 'Medium':
                return 'orange';
            case 'High':
                return 'green';
            default:
                return 'black';
        }
    };

    return (
        <main className="manage-task">
            <div className="container-fluid p-4">
                {success && showSuccessAlert && (
                    <Alert
                        variant="success"
                        onClose={() => {
                            setSuccess("");
                            setShowSuccessAlert(false);
                        }}
                        dismissible
                    >
                        {success}
                    </Alert>
                )}

                {/* Show button only in assign view */}
                {view === "assign" && (
                    <button
                        variant="primary"
                        onClick={handleShow}
                        className="mb-3 d-flex align-items-center justify-content-center"
                        style={{
                            backgroundColor: '#007bff',
                            color: '#fff',
                            padding: '10px 16px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        <FaPlus style={{ marginRight: '8px' }} />
                        Assign New Task
                    </button>
                )}

                <hr></hr>

                <Table striped bordered hover className="mt-4">
                    <thead>
                        <tr>
                            <th>TaskID</th>
                            <th>TaskName</th>
                            <th>Description</th>
                            <th>Quality</th>
                            <th>Status</th>
                            <th>Due Date</th>
                            <th>Days Remain</th>
                            <th>Assign To</th>
                            <th>Create Date</th>
                            <th>Update Date</th>
                            <th>Attachment</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getVisibleTasks().map((task, index) => (
                            <tr key={task.TaskID}>
                                <td className="text-center px-3">{index + 1}</td>
                                <td className="description-cell">{task.Task_Name}</td>
                                <td className="description-cell">{task.Descriptions}</td>
                                <td className="text-center" style={{ color: getQualityColor(task.Prioritys) }}>
                                    {task.Prioritys}
                                </td>
                                <td className="text-center" style={{ color: getStatusColor(task.Status) }}>
                                    {task.Status}
                                </td>
                                <td className="text-center">{new Date(task.Due_Date).toLocaleDateString('en-GB')}</td>
                                <td className="text-center">
                                    {task.Status === 'Completed' ? (
                                        <FaCheck style={{ color: 'green' }} />
                                    ) : (
                                        calculateDaysRemaining(task.Due_Date) + ' days'
                                    )}
                                </td>
                                <td className="text-center">{users.find((u) => u.UserID === task.Assign_To)?.UserName || 'Unknown'}</td>
                                <td className="text-center">{new Date(task.Create_At).toLocaleDateString()}</td>
                                <td className="text-center">{new Date(task.Update_At).toLocaleDateString()}</td>
                                <td className="task-attachment">
                                    {task.Attachment ? (
                                        <img
                                            src={`https://tms-backend-server.onrender.com${task.Attachment}`}
                                            alt="Task attachment"
                                            onClick={() => handleImageClick(task.Attachment)}
                                            className="custom-border-image"
                                        />
                                    ) : (
                                        'No photo'
                                    )}
                                </td>
                                <td className="d-flex justify-content-start align-items-center">
                                    <Button
                                        variant="info"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleEdit(task)}
                                    >
                                        <FaEdit />
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleDelete(task.TaskID)}
                                    >
                                        <FaTrash />
                                    </Button>
                                    {task.Status === 'On Review' || task.Status === 'Completed' ? (
                                        <Button
                                            variant={task.Status === 'Completed' ? 'secondary' : 'success'}
                                            size="sm"
                                            className="me-2 fs-small"
                                            style={task.Status === 'Completed' ? { backgroundColor: 'black', color: 'white' } : {}}
                                            onClick={() => task.Status === 'On Review' && handleApproveTask(task.TaskID)}
                                            disabled={task.Status === 'Completed'}
                                        >
                                            {task.Status === 'On Review' ? 'Approve' : 'Approved'}
                                        </Button>
                                    ) : null}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <Modal show={showModal} onHide={handleClose} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>{isEditing ? "Edit Task" : "Assign New Task"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {error && showErrorAlert && (
                            <Alert
                                variant="danger"
                                onClose={() => {
                                    setError("");
                                    setShowErrorAlert(false);
                                }}
                                dismissible
                            >
                                {error}
                            </Alert>
                        )}
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Task Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="taskName"
                                    value={currentTask.taskName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="description"
                                    value={currentTask.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                />
                            </Form.Group>
                            <Row className="d-flex align-items-center">
                                {isEditing && (
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Priority</Form.Label>
                                            <Form.Select
                                                name="priority"
                                                value={currentTask.priority}
                                                onChange={handleInputChange}
                                            >
                                                <option value="Null">Null</option>
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                )}
                                <Col md={isEditing ? 6 : 12}>
                                    <Form.Group className="mb-4">
                                        <Form.Label>Due Date</Form.Label>
                                        <div style={datePickerStyles.wrapper}>
                                            <Form.Control
                                                type="date"
                                                name="dueDate"
                                                value={currentTask.dueDate}
                                                onChange={handleInputChange}
                                                style={datePickerStyles.input}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.currentTarget.showPicker();
                                                }}
                                                onKeyDown={(e) => {
                                                    const key = e.key;
                                                    if (!/[\d-\b]/.test(key) && key !== 'Tab') {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                        </div>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label>Assign To</Form.Label>
                                <Form.Select
                                    name="assignTo"
                                    value={currentTask.assignTo}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select User</option>
                                    {getAssignableUsers().map((user) => (
                                        <option key={user.UserID} value={user.UserID}>
                                            {`${user.UserName} (${user.Roles}) - ${user.Department}`}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            {currentTask.dueDate && (
                                <Alert variant="info">
                                    Days until due: {calculateDaysRemaining(currentTask.dueDate)} days
                                </Alert>
                            )}
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSubmit}>
                            {isEditing ? "Update Task" : "Create Task"}
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={showImageModal} onHide={() => setShowImageModal(false)} size="lg" >
                    <Modal.Header closeButton>
                        <Modal.Title>Task Attachment</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center px-5 py-4">
                        {selectedImage && (
                            <img
                                src={`https://tms-backend-server.onrender.com${selectedImage}`}
                                alt="Task attachment"
                                className="modal-image rounded-3"
                            />
                        )}
                    </Modal.Body>
                </Modal>
            </div>
        </main>
    );
};

export default ManageTask;

//Correct with 637 line code changes
