import { useState } from 'react'
import './App.css'

function App() {
  const [url, setUrl] = useState('')

  const extract = async () => {
    const data = await fetch('https://hilarious-trench-coat-clam.cyclic.app/api/sitemap?' + new URLSearchParams({
      url
    }))
    console.log(data)
  }

  return (
    <>
      <div>
        <h1 className='pb-9'>Sitemap Extractor</h1>
        <input type="text" placeholder="Enter URL" className="input input-bordered w-full max-w-xs mb-9" onInput={(e) => setUrl(e.currentTarget.value)}/>
        <button className="btn" onClick={extract}>Extract</button>
      </div>
    </>
  )
}

export default App
