  
import React, { useState, useContext } from 'react';
import api from '../../services/api'
import { Alert, Container, Button, Form, FormGroup, Input } from 'reactstrap';
import { UserContext } from '../../user-context';


const Login = ({ history }) => {
    const { isLoggedIn, setIsloggedIn } = useContext(UserContext) 
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')


    const handleSubmit = async evt => {
        evt.preventDefault();
        console.log('result of the submit', email, password)

        const response = await api.post('/login', { email, password })
        const user_id = response.data.user_id || false
        const user = response.data.user || false

        // Let's move the following inside a try and catch block so that we can catch some other errors if needed
        try {
            if (user && user_id) {
                localStorage.setItem('user', user)
                localStorage.setItem('user_id', user_id)
                setIsloggedIn(true)
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
        } catch (error) {
            setError(true)
            setErrorMessage(`Error, the server returned an error`)
        }

    }

    return (
        <Container>
            <h2>Login:</h2>
            <p>Please <strong>Login</strong> into your account</p>
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Input type="email" name="email" id="email" placeholder="Your email" onChange={evt => setEmail(evt.target.value)} />
                </FormGroup>
                <FormGroup>
                    <Input type="password" name="password" id="password" placeholder="Your password" onChange={evt => setPassword(evt.target.value)} />
                </FormGroup>
                <FormGroup>
                    <Button className="submit-btn">Login</Button>
                </FormGroup>
                <FormGroup>
                    <Button className="secondary-btn" onClick={() => history.push("/register")}>New Account</Button>
                </FormGroup>
            </Form>
            {error ? (
                <Alert className="event-validation" color="danger"> {errorMessage}</Alert>
            ) : ""}
        </Container>
    );
}

export default Login