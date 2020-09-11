import React, {useEffect, useState, useMemo} from 'react'
import moment from 'moment'
import socketio from 'socket.io-client'

import api from '../../services/api'
import './dashboard.css'
import { Button, ButtonGroup, Alert, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';

const Dashboard = ({history}) => {
    const user = localStorage.getItem('user');
    const user_id = localStorage.getItem('user_id');

    const [events, setEvents] = useState([]);
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false)
    // Since we are handling so many error messages, let's create messageHandler state variables
    const [messageHandler, setMessageHandler] = useState('')
    const [eventsRequest, setEventsRequest] = useState([]) 
    const [dropdownOpen, setDropDownOpen] = useState(false)
    const [eventRequestMessage, setEventRequestMessage] = useState('')
    const [eventRequestSuccess, setEventRequestSuccess] = useState(false)

    const toggle = () => setDropDownOpen(!dropdownOpen);
    
    useEffect(() => {
        getEvents()
    }, [])
    
    const socket = useMemo(
        () =>
            socketio('https://local-test-api.herokuapp.com/', { query: { user: user_id } }),
        [user_id]
    );

    useEffect(() => {
        socket.on('registration_request', data => setEventsRequest([...eventsRequest, data]));
    }, [eventsRequest, socket])
    

    const getEvents = async (params) => {
        try {
            const url = params ? `/dashboard/${params}` : '/dashboard'
            const response = await api.get(url, { headers: { user: user } })
    
            console.log(response.data.events)
            setEvents(response.data.events)
        } catch(error) {
            history.push('/login')
        }
    };

    const category = (query) => {
        getEvents(query)
    }


    const myEventsHandler = async () => {
        // setRSelected('myevents')
        try {
            const response = await api.get('/user/events', { headers: { user } })
            console.log(response.data.events)
            setEvents(response.data.events)
        } catch(error) {
            history.push('/login')
        }
    }

    const deleteEventHandler = async(eventId) => {
        
        try {
            await api.delete(`/event/${eventId}`, {headers : {user}});
            setSuccess(true)
            setMessageHandler('The event was deleted successfully!')
            setTimeout(() => {
                setSuccess(false)
                category(null)
                setMessageHandler('')
            }, 1500)
            
        } catch (error) {
            setError(true)
            setMessageHandler('Error when deleting event!')
            setTimeout(() => {
                setError(false)
                setMessageHandler('')
            }, 2000)
        }
    }
    
    const registrationRequestHandler = async(event) => {
        console.log('Clicked')
        try {
            // This wil basically be a post request to our even registration endpoint
            await api.post(`/registration/${event.id}`, {}, { headers: { user } })

            setSuccess(true)
            setMessageHandler(`Successfully registered to event ${event.title}`)
            setTimeout(() => {
                setSuccess(false)
                category(null)
                setMessageHandler('')
            }, 1500)

            console.log('Registered')
        } catch(error) {
            setError(true)
            setMessageHandler(`Error when registering to event ${event.title}!`)
            setTimeout(() => {
                setError(false)
                setMessageHandler('')
            }, 2000)
            console.log('Error')
        }

    }

    const acceptEventHandler = async (eventId) => {
        try {
            console.log('Clicked')
            await api.post(`/registration/${eventId}/approvals`, {}, {headers : {user}})
            setEventRequestSuccess(true)
            setEventRequestMessage('Event approved successfully!')
            removeNotificationFromDashboard(eventId)
            setTimeout(() => {
                setEventRequestSuccess(false)
                setEventRequestMessage('')
            }, 2000)

        } catch (err) {
            console.log(err)
        }
    }

    const rejectionEventHandler = async (eventId) => {
        try {
            console.log('Clicked')
            await api.post(`/registration/${eventId}/rejections`, {}, {headers : {user}})
            setEventRequestSuccess(true)
            setEventRequestMessage('Event rejected successfully!')
            removeNotificationFromDashboard(eventId)
            setTimeout(() => {
                setEventRequestSuccess(false)
                setEventRequestMessage('')
            }, 2000)

        } catch (err) {
            console.log(err)
        }
    }

    const removeNotificationFromDashboard = (eventId) => {
        const newEvents = eventsRequest.filter((event) => event._id !== eventId)
        setEventsRequest(newEvents)
    }
    
    return (
        <>
        {eventRequestSuccess ? <Alert color="success"> { eventRequestMessage } </Alert> : ""}
        <ul className="notifications">
            {eventsRequest.map(request => {
                console.log(request)
                return (
                    <li key={request._id} >
                        <div>
                            <strong>{request.user.email} </strong> is requesting to register to your Event <strong>{request.event.title}</strong>
                        </div>
                        <ButtonGroup>
                            <Button color="secondary" onClick={() => { acceptEventHandler(request._id) }}>Accept</Button>
                            <Button color="danger" onClick={() => { rejectionEventHandler(request._id) }}>Reject</Button>
                        </ButtonGroup>
                    </li>
                )
            })}

        </ul>
        <div className="filter-panel">
            <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                <DropdownToggle color="primary" caret>
                    Filter
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem onClick={() => category(null)}>All</DropdownItem>
                    <DropdownItem onClick={myEventsHandler}>My Events</DropdownItem>
                    <DropdownItem onClick={() => category('running')}>Running</DropdownItem>
                    <DropdownItem onClick={() => category('climbing')}>Climbing</DropdownItem>
                    <DropdownItem onClick={() => category('swimming')}>Swimming</DropdownItem>
                    <DropdownItem onClick={() => category('exercise')}>Exercise</DropdownItem>
                    <DropdownItem onClick={() => category('other')}>Other</DropdownItem>
                </DropdownMenu>
            </Dropdown>
            {/* <ButtonGroup>
                <Button color="primary" onClick={() => category(null)}>All</Button>
                <Button color="primary" onClick={() => category('running')}>Running</Button>
                <Button color="primary" onClick={() => category('climbing')}>Climbing</Button>
                <Button color="primary" onClick={() => category('swimming')}>Swimming</Button>
                <Button color="primary" onClick={() => category('exercise')}>Exercise</Button>
                <Button color="primary" onClick={() => category('other')}>Other</Button>
                <Button color="secondary" onClick={myEventsHandler}>My Events</Button>
            </ButtonGroup> */}
            {/* <ButtonGroup>
                <Button color="secondary" onClick={()=> history.push('events')}>Create Event</Button>
                <Button color="danger" onClick={logoutHandler}>Logout</Button>
            </ButtonGroup> */}
        </div>
        <ul className="events-list">
            {events.map(event => (
                <li key={event._id}>
                    <header style={{ backgroundImage: `url(${event.thumbnail_url})` }}>
                    {event.user === user_id ? <div><Button color="danger" size="sm" onClick={() => deleteEventHandler(event._id)}>x</Button></div>  : ""}
                    </header>
                    <strong>{event.title}</strong>
                    <span>Date: {moment(event.date).format('l')}</span> 
                    <span>Price: {parseFloat(event.price).toFixed(2)}</span>
                    <span>Description: {event.description}</span>
                    <Button className="secondary-btn" onClick={() => {registrationRequestHandler(event)}}>Register</Button>
                </li>
            ))}
        </ul>
        {error ? (
                <Alert className="event-validation" color="danger"> {messageHandler} </Alert>
            ) : ""}
        {success ? (
                <Alert className="event-validation" color="success">{messageHandler}</Alert>
            ) : ""}
        </>
    )
}

export default Dashboard