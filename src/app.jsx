import { useState } from 'preact/hooks'
import { LocationProvider, Router, Route } from 'preact-iso'
import heroImg from './assets/hero.png'
import preactLogo from './assets/preact.svg'
import viteLogo from './assets/vite.svg'
import './app.css'
const pages = import.meta.glob('./pages/**/*.jsx', {
  eager: true,
})

function filePathToRoute(path){
  let route = path
    .replace('./pages', '')
    .replace(/\.jsx$/, '')
    .replace(/\/index$/i, '')
    .toLowerCase()

  return route === '' ? '/' : route
}

const routes = Object.entries(pages).map(([path, mod]) => ({
  path: filePathToRoute(path),
  component: mod.default,
}))

export function App() {
  return (
    <LocationProvider>
      <Router>
        {routes.map((r) => (
          <Route key={r.path} path={r.path} component={r.component} />
        ))}
      </Router>
    </LocationProvider>
  )
}
