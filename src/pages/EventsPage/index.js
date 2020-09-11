import React, { useState, useMemo, useEffect } from 'react'
import { Alert, Container, Button, Form, FormGroup, Input, Label } from 'reactstrap';

import api from '../../services/api'
import thumbnailIcon from '../../assets/thumbnail.png'
import './events.css'

const EventsPage = ({history}) => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [thumbnail, setThumbnail] = useState(null)
    const [category, setCategory] = useState('')
    const [date, setDate] = useState('')
    const [error, setError] = useState(false)
    const [success, setSuccess] = useState(false)
    
    const user = localStorage.getItem('user');
    useEffect(() => {
        if (!user) history.push('/login');
    }, [])

    const preview = useMemo(() => {
        return thumbnail ? URL.createObjectURL(thumbnail) : null;
    }, [thumbnail])


    const submitHandler = async (evt) => {
        evt.preventDefault()

        const eventData = new FormData();

        eventData.append("thumbnail", thumbnail)
        eventData.append("category", category)
        eventData.append("title", title)
        eventData.append("price", price)
        eventData.append("description", description)
        eventData.append("date", date)


        try {
            if (title !== "" &&
                description !== "" &&
                price !== "" &&
                category !== "" &&
                date !== "" &&
                thumbnail !== null
            ) {
                console.log("Event has been sent")
                await api.post("/event", eventData, { headers: { user } })
                console.log(eventData)
                console.log("Event has been saved")
                setSuccess(true)
                setTimeout(() => {
                    setSuccess(false)
                }, 2000);
            } else {
                setError(true)
                setTimeout(() => {
                    setError(false)
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
            <h1>Create your Event</h1>
            <Form onSubmit={ submitHandler }>
                <FormGroup>
                    <Label>Upload Image :</Label>
                    <Label id="thumbnail" style={{ backgroundImage: `url(${preview})` }} className={thumbnail ? 'has-thumbnail' : ''}>
                    <Input type="file" onChange={evt => setThumbnail(evt.target.files[0])} />
                    <img src={ thumbnailIcon } alt='upload icon' />
                    </Label>                 
                </FormGroup>
                <FormGroup>
                    <Label>Category :</Label>
                    <Input type="select" id="category" value={category} onChange={(event) => setCategory(event.target.value)}>
                        <option value="" disabled>Select Category</option>
                        <option>running</option>
                        <option>climbing</option>
                        <option>swimming</option>
                        <option>exercise</option>
                        <option>other</option>
                    </Input>
                </FormGroup>

                <FormGroup>
                    <Label>Title :</Label>
                    <Input id="title" type="text" placeholder={'Set Event Title'} value={title} onChange={(event) => setTitle(event.target.value)} />
                </FormGroup>
                <FormGroup>
                    <Label>Event Description :</Label>
                    <Input id="description" type="text" placeholder={'Provide Event Description'} value={description} onChange={(event) => setDescription(event.target.value)} />
                </FormGroup>
                <FormGroup>
                    <Label>Price :</Label>
                    <Input id="price" type="text" placeholder={'Set Event Price'} value={price} onChange={(event) => setPrice(event.target.value)} />
                </FormGroup>
                <FormGroup>
                    <Label>Date :</Label>
                    <Input id="date" type="date" placeholder={'Set Event Date'} value={date} onChange={(event) => setDate(event.target.value)} />
                </FormGroup>
                <FormGroup>
                    <Button type="submit" className="submit-btn">
                        Create Event
                    </Button>
                </FormGroup>
                <FormGroup>
                    <Button className="secondary-btn" onClick={()=>history.push('/')}>
                        Dashboard
                    </Button>
                </FormGroup>
            </Form>
            {error ? (
                <Alert className="event-validation" color="danger"> Missing required information</Alert>
            ) : ""}
            {success ? (
                <Alert className="event-validation" color="success"> The event was created successfully</Alert>
            ) : ""}
        </Container>
    )
}

export default EventsPage