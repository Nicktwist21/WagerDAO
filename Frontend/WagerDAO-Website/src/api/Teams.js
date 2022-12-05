const axios = require("axios");

export default async function handler(req, res) {
const options = {
  method: 'GET',
  url: 'https://api-football-v1.p.rapidapi.com/v3/teams',
  params: {id: ''},
  headers: {
    'X-RapidAPI-Key': '9936e5f73bmsh8711a5d33e127adp15aebajsn8d7d680d2f17',
    'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
  }
}
};

axios.request(options).then(function (response) {
	console.log(response.data);
}).catch(function (error) {
	console.error(error);
});