import React from 'react'

export default function NotFound() {

  const hstyle = {
    textAlign: 'center',
    fontSize: '20px',
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex'
  }

  return (
    <div>
      <h1>
        <b style={{fontSize: '100px'}}>404</b><br></br>
        <small>error</small>
      </h1>
      <i style={hstyle}>"The Page you are looking for is not available"</i>
    </div>
  )
}
