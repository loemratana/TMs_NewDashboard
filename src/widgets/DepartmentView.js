import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, ListGroup, Row, Col, Image } from "react-bootstrap";
import { FaUserCircle, FaPhone, FaEnvelope, FaUserTie } from "react-icons/fa";

const DepartmentView = ({ department, loggedInUser }) => {
    const [departmentUsers, setDepartmentUsers] = useState({
        manager: null,
        supervisors: [],
        users: []
    });

    const normalizeDepartmentName = (name) => {
        return name?.toLowerCase().trim();
    };

    const fetchDepartmentUsers = async () => {
        try {
            const response = await axios.get(`https://tms-backend-server.onrender.com/api/users`);
            const users = response.data;

            // Filter users by department (case-insensitive)
            const deptUsers = users.filter(user =>
                normalizeDepartmentName(user.Department) === normalizeDepartmentName(department)
            );

            // Group users by role
            const supervisors = deptUsers.filter(user => user.Roles.trim() === "Supervisor");

            setDepartmentUsers({
                manager: deptUsers.find(user => user.Roles.trim() === "Manager"),
                supervisors: supervisors, // Use plural to indicate multiple supervisors
                users: deptUsers.filter(user => user.Roles.trim() === "User")
            });
        } catch (err) {
            console.error("Error fetching department users:", err);
        }
    };

    useEffect(() => {
        fetchDepartmentUsers();
    }, [department]);

    const UserCard = ({ user, role }) => (
        <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">{role}</h5>
            </Card.Header>
            <Card.Body>
                <div className="d-flex align-items-center mb-3">
                    <div className="me-3" style={{ width: "100px", height: "100px" }}>
                        {user?.Image ? (
                            <Image
                                src={`https://tms-backend-server.onrender.com/uploads/${user.Image}`}
                                alt={user.UserName}
                                roundedCircle
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = "none";
                                    e.target.parentElement.innerHTML = '<i class="fa fa-user-circle fa-5x"></i>';
                                }}
                            />
                        ) : (
                            <FaUserCircle size={100} className="text-secondary" />
                        )}
                    </div>
                    <div>
                        <h4>{user?.UserName || "Not Assigned"}</h4>
                        <p className="text-muted mb-0">{user?.Position}</p>
                    </div>
                </div>
                {user && (
                    <ListGroup variant="flush">
                        <ListGroup.Item>
                            <FaUserTie className="me-2" />
                            <strong>Gender:</strong> {user.Gender}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <FaPhone className="me-2" />
                            <strong>Phone:</strong> {user.PhoneNumber}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <FaEnvelope className="me-2" />
                            <strong>Date of Birth:</strong> {new Date(user.DateOfBirth).toLocaleDateString()}
                        </ListGroup.Item>
                    </ListGroup>
                )}
            </Card.Body>
        </Card>
    );

    return (
        <div className="container p-4">
            <div className="d-flex flex-column justify-content-center align-items-center">
                <h2 className="mb-2 text-center">Department {department}</h2>
                <div className="line-style"></div>
            </div>
            <br></br>
            <br></br>
            <Row>
                <Col md={6}>
                    <UserCard user={departmentUsers.manager} role="Manager" />
                </Col>
                {departmentUsers.supervisors && departmentUsers.supervisors.map((supervisor, index) => (
                    <Col md={6} key={index}>
                        <UserCard user={supervisor} role={`Supervisor ${index + 1}`} />
                    </Col>
                ))}
            </Row>
            <Row>
                <Col md={12}>
                    <Card>
                        <Card.Header className="bg-secondary text-white">
                            <h5 className="mb-0">Team Members ({departmentUsers.users.length})</h5>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {departmentUsers.users.map(user => (
                                <ListGroup.Item key={user.UserID} className="d-flex align-items-center">
                                    <div className="me-3" style={{ width: "50px", height: "50px" }}>
                                        {user.Image ? (
                                            <Image
                                                src={`https://tms-backend-server.onrender.com/uploads/${user.Image}`}
                                                roundedCircle
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                        ) : (
                                            <FaUserCircle size={50} className="text-secondary" />
                                        )}
                                    </div>
                                    <div>
                                        <h6 className="mb-0">{user.UserName}</h6>
                                        <small className="text-muted">{user.Position}</small>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DepartmentView;

//Correct with 147 line code changes
