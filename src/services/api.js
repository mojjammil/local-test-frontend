import axios from 'axios'

const api = axios.create({
    baseURL: 'https://local-test-api.herokuapp.com'
})

export default api