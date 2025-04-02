import { useEffect, useState } from "react"


function App() {

  const [data, setData] = useState("")

  useEffect(() => {
    fetch(import.meta.env.VITE_BACKEND_URL)
      .then((response) => response.text())
      .then((data) => setData(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      <p className="bg-red-400">Hello world</p>
      <p className="bg-blue-400">Hello world</p>
      {data}
    </div>
  )
}

export default App
