import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Types from './pages/Types'
import Categories from './pages/Categories'
import Videos from './pages/Videos'
import Programs from './pages/Programs'
import Users from './pages/Users'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="types" element={<Types />} />
        <Route path="categories" element={<Categories />} />
        <Route path="videos" element={<Videos />} />
        <Route path="programs" element={<Programs />} />
        <Route path="users" element={<Users />} />
      </Route>
    </Routes>
  )
}
