import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../components/loader';

const getRandomInt = (min, max) => {
   min = Math.ceil(min)
   max = Math.floor(max)
   return Math.floor(Math.random() * (max - min)) + min;
}

const id_user = getRandomInt(1, 10);
const api_url = 'https://jsonplaceholder.typicode.com';

const Home = () => {
   
   const [albums, setAlbums] = useState([])
   const [user, setUser] = useState({})

   useEffect(() => {
      fetch(`${api_url}/users/${id_user}`)
         .then(response => response.json())
         .then(data => {
            if (data) {
               setUser(data);
               return fetch(`${api_url}/users/${id_user}/albums/`);
            }
         })
         .then(response => response.json())
         .then(data => {
            if (data) {
               const allRequests = data.map(item => {
                  let url = `${api_url}/albums/${item.id}/photos`
                  return (
                     fetch(url).then(response => response.json())
                     .then(data => {
                        return {
                           album: item,
                           photo_count: data.length,
                           album_photo: data.shift()
                        }
                     })
                  )
               })
             
               return Promise.all(allRequests)
            }
         })
         .then(result => setAlbums(result))
         .catch(error => console.log('error:', error))
   }, [])

   const renderList = (albums || []).map(item => (
      <Link key={item.album.id} to={`album/${item.album.id}`} className="card-item">
         <div style={{backgroundImage: `url(${item.album_photo.url})`}}>
            <div>
               <div>Album name: {item.album.title}</div>
               <span>Total photo count: {item.photo_count}</span>
            </div>
         </div>
      </Link>
   ))

   return (
      <div className="l-page">
         <div className="person-block">
            {Object.keys(user).length === 0 ? <Loader /> : <h1>Welcome to <span>{user.name}</span> photo gallery</h1>}
         </div>
        <div className="card-list">
            {albums.length ? renderList : <Loader />}
        </div>
      </div>
   )
}

export default Home;