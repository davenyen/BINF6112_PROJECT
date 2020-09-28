import React from 'react'
import { Link } from 'react-router-dom'

export default function Nav() {
    return (
        <nav className='nav-bar'>
            <div className='nav-container'>
                <Link to='/'>
                    Microarray Project
                </Link>
                <li className='nav-item'>
                    <Link to='/'>
                        Results
                    </Link>
                </li>
            </div>
        </nav>
    )
}