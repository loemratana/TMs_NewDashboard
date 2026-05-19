// ManageUser.js
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table, Alert, Col, Row } from "react-bootstrap";
import { FaEdit, FaTrash, FaEye, FaPlus } from "react-icons/fa";
import axios from "axios";
import { Checkbox } from "@mui/material";

const ManageUser = () => {
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    id: "",
    userName: "",
    gender: "",
    dob: "",
    department: "",
    position: "",
    phoneNumber: "",
    password: "",
    role: "User ", // Default role
    createdDate: new Date().toISOString().split("T")[0], // Current date
    image: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  // Fetch users from the backend
  useEffect(() => {
    fetchUsers();
  }, []);

  // Update fetchUsers function
  const fetchUsers = async () => {
    try {
      const response = await axios.get("https://tms-backend-server.onrender.com/api/users");
      const usersWithImages = response.data.map(user => ({
        ...user,
        id: user.UserID,
        // Fix status mapping to use actual database value
        statuses: user.Statuses === 1 ? 'Active' : 'Inactive',
        image: user.Image ? `https://tms-backend-server.onrender.com/images/${user.Image}` : null,
        dob: new Date(user.DateOfBirth).toISOString().split('T')[0]
      }));
      console.log('Mapped users:', usersWithImages); // Debug log
      setUsers(usersWithImages);
    } catch (err) {
      console.error('Fetch error:', err);
      setError("Failed to fetch users: " + (err.response?.data?.message || err.message));
    }
  };

  // Update handleAddUser function
  const handleAddUser = async () => {
    if (!validateForm()) return;

    try {
      const formData = new FormData();

      // Add text fields
      Object.keys(currentUser).forEach(key => {
        if (key !== 'image' && key !== 'currentImage') {
          formData.append(key, currentUser[key]);
        }
      });

      // Handle image upload
      if (currentUser.image instanceof File) {
        formData.append('image', currentUser.image);
        console.log('New image file added to form');
      }

      const url = isEditing
        ? `https://tms-backend-server.onrender.com/api/users/${currentUser.id}`
        : "https://tms-backend-server.onrender.com/api/users";

      console.log('Submitting form:', formData);

      const response = await axios({
        method: isEditing ? 'put' : 'post',
        url,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('Server response:', response.data);
      setSuccess(isEditing ? "✅ User updated successfully!" : "✅ User added successfully!");
      fetchUsers();
      handleClose();
    } catch (err) {
      console.error('Form submission error:', err);
      setError("❌ " + (err.response?.data?.error || "An error occurred"));
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setIsEditing(false);
    setError("");
    setSuccess("");
    resetForm();
  };

  const handleShow = () => {
    setShowModal(true);
    resetForm();
  };

  const resetForm = () => {
    setCurrentUser({
      id: "",
      userName: "",
      gender: "",
      dob: "",
      department: "",
      position: "",
      phoneNumber: "",
      password: "",
      role: "User",
      createdDate: new Date().toISOString().split("T")[0],
      image: ""
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCurrentUser((prevState) => ({
      ...prevState,
      image: file,
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      "userName",
      "gender",
      "dob",
      "department",
      "position",
      "phoneNumber",
      "password",
      "role",
    ];

    const missingFields = requiredFields.filter(
      (field) => !currentUser[field] || currentUser[field].trim() === ""
    );

    if (missingFields.length > 0) {
      setError(
        `Please fill in the following fields: ${missingFields.join(", ")}`
      );
      return false;
    }

    // Additional validations
    if (currentUser.phoneNumber && !/^\d+$/.test(currentUser.phoneNumber)) {
      setError("Phone number should only contain numbers.");
      return false;
    }

    return true;
  };

  // Update handleEdit function
  const handleEdit = (user) => {
    const formUser = {
      id: user.UserID,
      userName: user.UserName,
      gender: user.Gender,
      dob: new Date(user.DateOfBirth).toISOString().split('T')[0],
      department: user.Department,
      position: user.Position,
      phoneNumber: user.PhoneNumber,
      password: user.Passwords,
      role: user.Roles,
      statuses: user.Statuses === 1 ? 'Active' : 'Inactive', // Fix status mapping
      currentImage: user.Image, // Store current image
      image: null // Clear image field for new upload
    };

    console.log('Editing user:', formUser);
    setCurrentUser(formUser);
    setIsEditing(true);
    setPasswordVisible(true); // Set passwordVisible to true when editing a user
    setShowModal(true);
  };
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (confirmDelete) {
      try {
        await axios.delete(`https://tms-backend-server.onrender.com/api/users/${id}`);
        setSuccess("User deleted successfully!");
        fetchUsers(); // Refresh the list
      } catch (err) {
        setError("Failed to delete user: " + (err.response?.data?.message || err.message));
        console.error(err);
      }
    }
  };

  // First, add DatePicker styles
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

  return (
    <main className="manage-user">
      <div className="container-fluid p-4">
        {/* Success and Error Alerts */}
        {success && (
          <Alert variant="success" onClose={() => setSuccess("")} dismissible>
            {success}
          </Alert>
        )}
        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}

        <button
          variant="primary"
          onClick={handleShow}
          className="mb-3 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: '#007bff', // Primary color
            color: '#fff', // White text
            padding: '10px 16px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <FaPlus style={{ marginRight: '8px' }} /> {/* Add the icon */}
          Add New User
        </button>
        <hr></hr>

        {/* User Table */}
        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>UserID*</th>
              <th>UserName</th>
              <th>Gender</th>
              <th>DOB</th>
              <th>Department</th>
              <th>Position</th>
              <th>PhoneNumber</th>
              <th>Password</th>
              <th>Role</th> {/* Admin, User, Manager */}
              <th>Log In</th> {/* Active, Inactive, Suspended */}
              <th>Created Date</th>
              <th>Image</th>
              <th className="d-flex justify-content-center align-items-center">Action</th>{/* View, Edit, Delete */}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.UserID}>
                <td className="text-center">{user.UserID}</td>
                <td>{user.UserName}</td>
                <td>{user.Gender}</td>
                <td>{new Date(user.DateOfBirth).toLocaleDateString()}</td>
                <td>{user.Department}</td>
                <td>{user.Position}</td>
                <td>{user.PhoneNumber}</td>
                <td>
                  <div className="password-field d-flex">
                    <span>*********</span>
                    <FaEye onClick={() => setPasswordVisible(true)}></FaEye>
                    {passwordVisible && (
                      <span className="password-visible">{user.Passwords}</span>
                    )}
                  </div>
                </td>
                <td>{user.Roles}</td>
                <td style={{ color: Number(user.Statuses) === 1 ? 'blue' : 'red' }}>
                  {Number(user.Statuses) === 1 ? 'Active' : 'Inactive'}
                </td>                <td>{new Date(user.Create_At).toLocaleString()}</td>
                <td className="text-center">
                  {user.Image && (
                    <img
                      src={`https://tms-backend-server.onrender.com/uploads/${user.Image}`}
                      alt={`${user.UserName}'s profile`}
                      className="img-thumbnail-pf"
                      onError={(e) => {
                        console.error('Image load error:', e);
                        e.target.src = 'placeholder.png'; // Fallback image
                      }}
                    />
                  )}
                </td>
                <td className="text-center">
                  <Button
                    variant="info"
                    size="sm"
                    className="me-2 text-dark"
                    onClick={() => handleEdit(user)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="me-2"
                    onClick={() => handleDelete(user.UserID)}
                  >
                    <FaTrash />
                  </Button>
                  <Checkbox className="permission-check bg-warning rounded-2 p-1"></Checkbox>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Password Modal */}
        <Modal show={passwordModalVisible} onHide={() => setPasswordModalVisible(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Password</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{currentUser.password}</p>
          </Modal.Body>
        </Modal>

        {/* User Modal */}
        <Modal show={showModal} onHide={handleClose} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{isEditing ? "Edit User" : "Add New User"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && (
              <Alert variant="danger" onClose={() => setError("")} dismissible>
                {error}
              </Alert>
            )}
            <Form>
              <Row className="d-flex">
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>User Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="userName"
                      placeholder="Enter Username"
                      value={currentUser.userName || ''}
                      onChange={handleInputChange}
                    />

                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Gender</Form.Label>
                    <Form.Select
                      name="gender"
                      value={currentUser.gender || ''}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="d-flex">
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Department</Form.Label>
                    <Form.Control
                      type="text"
                      name="department"
                      value={currentUser.department}
                      onChange={handleInputChange}
                      placeholder="Enter department"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Position</Form.Label>
                    <Form.Control
                      type="text"
                      name="position"
                      value={currentUser.position}
                      onChange={handleInputChange}
                      placeholder="Enter position" />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="d-flex">
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>DOB</Form.Label>
                    <div style={datePickerStyles.wrapper}>
                      <Form.Control
                        type="date"
                        name="dob"
                        value={currentUser.dob}
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
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Role</Form.Label>
                    <Form.Select
                      name="role"
                      value={currentUser.role || ''}
                      onChange={handleInputChange}
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                      <option value="Management">Management</option>
                      <option value="Manager">Manager</option>
                      <option value="Supervisor">Supervisor</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="d-flex">
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phoneNumber"
                      value={currentUser.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <div className="password-field d-flex">
                      <Form.Control
                        type={isEditing ? "text" : "password"}
                        name="password"
                        value={currentUser.password}
                        onChange={handleInputChange}
                        placeholder="Enter password"
                      />
                    </div>
                  </Form.Group></Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Image</Form.Label>
                {isEditing && currentUser.currentImage && (
                  <div className="mb-2">
                    <img
                      src={`https://tms-backend-server.onrender.com/uploads/${currentUser.currentImage}`}
                      alt="Current"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <Form.Control
                  type="file"
                  name="image"
                  onChange={handleFileChange}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddUser}>
              {isEditing ? "Update User" : "Add User"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </main>
  );
};

export default ManageUser;

// Correct with 528 line code changes
