import { useState } from 'react'
import './App.css'

type data = Array<{
  link: string,
  title: string
}>

function App() {
  const [url, setUrl] = useState('')
  const [data, setData] = useState<data>()

  const extract = async () => {
    const resp = await fetch('https://hilarious-trench-coat-clam.cyclic.app/api/sitemap?' + new URLSearchParams({
      url
    }))
    const resp_body = await resp.json()
    if(resp_body.data) {
      setData(resp_body.data)
    } else {
      setData(resp_body)
    }
  }

  return (
    <>
      <div>
        <h1 className='pb-9'>Sitemap Extractor</h1>
        <input type="text" placeholder="Enter URL" className="input input-bordered w-full max-w-xs mb-9" onInput={(e) => setUrl(e.currentTarget.value)}/>
        <button className="btn mb-9" onClick={extract}>Extract</button>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>URL</th>
                <th>title</th>
              </tr>
            </thead>
            <tbody>
              {
                data?.map((d, i) => {
                  return(
                  <tr key={i}>
                    <th>{i+1}</th>
                    <td>{d.link}</td>
                    <td>{d.title}</td>
                  </tr>
                  )    
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default App
