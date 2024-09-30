import React from 'react'
import ReactDOM from 'react-dom/client'
import Vis from './Vis.jsx'
import './index.css'
import Login from './Login.jsx';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import Oauth2Login from './Oauth2Login.jsx';

export default function MainApp() {
  console.log("here")

  return (
    <BrowserRouter>
      <Routes>
        <Route exact path='/' element={<Login/>}/>
        <Route exact path='/fitbitlogin' element={<Oauth2Login cookieName={'fitbit-code'} />}/>
        <Route exact path='/whithingslogin' element={<Oauth2Login cookieName={'whithings-code'} />}/>
        <Route exact path='/vis' element={<Vis/>}/>
      </Routes>
    </BrowserRouter>
  )

}