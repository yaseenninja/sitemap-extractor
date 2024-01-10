import { useState } from 'react'
import './App.css'

type data = Array<{
  link: string,
  title: string
}>

function App() {
  const [url, setUrl] = useState('')
  const [data, setData] = useState<data>()
  const [loading, setLoading] = useState(false)

  const extract = () => {
    setLoading(true)
    fetch('https://hilarious-trench-coat-clam.cyclic.app/api/sitemap?' + new URLSearchParams({ url }))
      .then((response) => response.json())
      .then((resp_body) => {
        if (resp_body.data) {
          setData(resp_body.data)
        } else {
          setData(resp_body)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })    
  }

  return (
    <>
      <div>
        <h1 className='pb-9 text-3xl'>Sitemap Extractor</h1>
        <input type="text" placeholder="Enter URL" className="input input-bordered max-w-xs" onInput={(e) => setUrl(e.currentTarget.value)} />
        <button className="btn ml-1" disabled={loading} onClick={extract}>Extract</button>
      </div>
      <br />
      {
        loading ? <div className="loading loading-spinner" /> : null
      }
      {
        data ?
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th></th>
                  <th>URL</th>
                  <th>Title</th>
                </tr>
              </thead>
              <tbody>
                {
                  data?.map((d, i) => {
                    return (
                      <tr key={i}>
                        <th>{i + 1}</th>
                        <td>{d.link}</td>
                        <td>{d.title}</td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </div>
          : null
      }
    </>
  )
}

export default App
