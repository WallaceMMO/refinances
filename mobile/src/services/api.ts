import axios from 'axios';

const api = axios.create({
  // Seu ip abaixo 👇
  // David: 192.168.0.17
  // Mari: 192.168.15.26'
  // Samuel: 192.168.15.114

  baseURL: 'http://192.168.170.40:3333',
});

export default api;
