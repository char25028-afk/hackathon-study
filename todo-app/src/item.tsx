import { useState } from "react"

function Item(){
    const [done, setDone] = useState(false);
    return <li>
        <input type="checkbox" checked={done} onChange={e => setDone(e.target.checked)} />
        <label style={{ textDecoration: done ? 'line-through' : 'none' }}>牛乳を買う</label>

        </li>
}

export default Item