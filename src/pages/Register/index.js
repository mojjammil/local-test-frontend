import React, { useState, useContext } from 'react';
import api from '../../services/api'
import { Alert, Button, Form, FormGroup, Container, Input } from 'reactstrap';
import { UserContext } from '../../user-context';

export default function Register({ history }) {
    const [setIsLoggedIn] = useContext(UserContext)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [error, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')


    const handleSubmit = async evt => {
        evt.preventDefault();
        
        try {
            if (email !== "" &&
            password !== "" &&
            firstName !== "" &&
            lastName !== ""
            ) {
                const response = await api.post('/user/register', { email, password, firstName, lastName })
                const user_id = response.data.user_id || false
                const user = response.data.user || false
                if (user && user_id) {
                    localStorage.setItem('user', user)
                    localStorage.setItem('user_id', user_id)
                    setIsLoggedIn(true)
                    history.push('/')
                } else {
                    const { message } = response.data
                    setError(true)
                    setErrorMessage(message)
                    console.log(message)
                    setTimeout(() => {
                        setError(false)
                        setErrorMessage("")
                    }, 2000)
                }
            } else {
                setError(true)
                setErrorMessage("You need to fill all the Inputs")
                setTimeout(() => {
                    setError(false)
                    setErrorMessage("")
                }, 2000)

                console.log("Missing required data")
            }
        } catch (error) {
            Promise.reject(error);
            console.log(error);
        }
    }

    return (
        <Container>
            <h2>Register:</h2>
            <p>Please <strong>Register</strong> for a new account</p>
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Input type="text" name="firstName" id="firstName" placeholder="Your first name" onChange={evt => setFirstName(evt.target.value)} />
                </FormGroup>
                <FormGroup>
                    <Input type="text" name="lastName" id="lastName" placeholder="Your last name" onChange={evt => setLastName(evt.target.value)} />
                </FormGroup>
                <FormGroup>
                    <Input type="email" name="email" id="email" placeholder="Your email" onChange={evt => setEmail(evt.target.value)} />
                </FormGroup>
                <FormGroup>
                    <Input type="password" name="password" id="password" placeholder="Your password" onChange={evt => setPassword(evt.target.value)} />
                </FormGroup>
                <FormGroup>
                    <Button className="submit-btn">Register</Button>
                </FormGroup>
                <FormGroup>
                    <Button className="secondary-btn" onClick={()=> history.push('/login')}>Already have account?</Button>
                </FormGroup>
            </Form>
            {error ? (
                <Alert className="event-validation" color="danger"> {errorMessage}</Alert>
            ) : ""}
        </Container>
    );
}