import React, { useState, useEffect, useReducer, useCallback, useRef } from 'react';
import { useParams, useHistory } from "react-router-dom";
import Loader from '../components/loader';
import Popup from '../components/popup';

// Этот лимит должен возвращаться с сервера
const limit = 50;

// И вместо его увеличения нужно передавать страницу с лимитом
// Но jsonplaceholder не сортирует запросы по страницам
const limit_step = 24;
const api_url = 'https://jsonplaceholder.typicode.com';

const Album = () => {

   const { id } = useParams()
   const [ album, setAlbum ] = useState({})
   const [ showPopup, setShowPopup ] = useState(false)
   const [ selectPhoto, setSelectPhoto ] = useState(0)
   const history = useHistory()

   const imgReducer = (state, action) => {
      switch (action.type) {
        case 'STACK_IMAGES':
          return { ...state, images: action.data }
        case 'FETCHING_IMAGES':
          return { ...state, fetching: action.fetching }
        default:
          return state
      }
   }
   const pageReducer = (state, action) => {
      switch (action.type) {
        case 'ADVANCE_PAGE':
          return { ...state, limit: state.limit + limit_step }
        default:
          return state
      }
    }
   
   const [ pager, pagerDispatch ] = useReducer(pageReducer, { limit: 0 })
   const [ imgData, imgDispatch ] = useReducer(imgReducer, { images:[], fetching: true })


   useEffect(() => {
      if (imgData.images.length >= limit) return null

      imgDispatch({ type: 'FETCHING_IMAGES', fetching: true })

      fetch(`${api_url}/albums/${id}`)
         .then(response => response.json())
         .then(data => {
            setAlbum(data)
            return fetch(`${api_url}/albums/${id}/photos?_limit=${pager.limit}`)
         })
         .then(response => response.json())
         .then(data => {
            if (data) {
               imgDispatch({ type: 'STACK_IMAGES', data })
               imgDispatch({ type: 'FETCHING_IMAGES', fetching: false })
            }
         })
         .catch(error => {
            imgDispatch({ type: 'FETCHING_IMAGES', fetching: false })
            return error
         })
   }, [imgDispatch, pager.limit])

   let bottomBoundaryRef = useRef(null)
   const scrollObserver = useCallback(node => {
      new IntersectionObserver(entries => {
            entries.forEach(en => {
               if (en.intersectionRatio > 0) {
                  pagerDispatch({ type: 'ADVANCE_PAGE' })
               }
            })
         }).observe(node)
      },
      [pagerDispatch]
   )
   
   useEffect(() => {
      if (imgData.images.length >= limit) return null

      if (bottomBoundaryRef.current) {
         scrollObserver(bottomBoundaryRef.current)
      }
   }, [scrollObserver, bottomBoundaryRef])

   const RenderPhotos = () => (imgData.images || []).map((item, index) => (
      <div key={item.id} onClick={() => ShowPopup(index)} className="photo-item">
         Loading...
         <div style={{backgroundImage: `url(${item.thumbnailUrl})`}}></div>
      </div>
   ))

   const ShowPopup = (index) => {
      setSelectPhoto(index)
      setShowPopup(true)
   }

   const nextPhoto = () => {
      if (selectPhoto === imgData.images.length - 1) {
         setSelectPhoto(0)
      } else {
         setSelectPhoto(selectPhoto + 1)
      }
   }

   const prevPhoto = () => {
      if (selectPhoto === 0) {
         setSelectPhoto(imgData.images.length - 1)
      } else {
         setSelectPhoto(selectPhoto - 1)
      }
   }
   
   const RenderPopup = () => {
      let photo_url = imgData.images[selectPhoto] && imgData.images[selectPhoto].url
      let photo_title = imgData.images[selectPhoto] && imgData.images[selectPhoto].title
      
      return (
         <div>
            <div className="popup-header">
               <span>{photo_title}</span>
               <div className="popup-close" onClick={() => setShowPopup(false)}>&#10005;</div>
            </div>
            <div className="popup-content">
               {photo_url ? <img src={photo_url} /> : <Loader />}
               <div className="prev-photo" onClick={prevPhoto}>&#10094;</div>
               <div className="next-photo" onClick={nextPhoto}>&#10095;</div>
            </div>
         </div>
      )
   }

   return (
      <div className="album">
         <div className="l-page">
            {Object.keys(album).length === 0 ? <Loader /> : <h2><span>{album.title}</span></h2>}
         </div>
         <button className="btn-back" onClick={() => history.push('/')}>Back to albums</button>
         <div className="photos-list">
            {imgData.images.length ? RenderPhotos() : <Loader />}
         </div>
         <div id='page-bottom-boundary' ref={bottomBoundaryRef}></div>
         <Popup show={showPopup}>
           <div className="popup" onClick={(e) => e.target === e.currentTarget && setShowPopup(false)}>
             {RenderPopup()}
           </div>
         </Popup>
      </div>
   )
}

export default Album;