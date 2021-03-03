import React, { useEffect } from 'react';

const Popup = (props) => {
  
  useEffect(() => {
    props.show && document.body.classList.add('hidden');
    return () => {
      document.body.classList.remove('hidden');
    }
  })

  if (!props.show) return null;
  
  return (
    <div id="Popup">
      {props.children}
    </div>
  )
}

export default Popup;
