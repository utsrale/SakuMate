import { NavLink, useLocation } from 'react-router-dom';
import { IoHome, IoTrophy, IoAdd, IoStatsChart, IoPerson } from 'react-icons/io5';
import './Layout.css';

export default function Layout({ children, onQuickAdd }) {
    const location = useLocation();
    const isTransactions = location.pathname === '/transactions';

    return (
        <div className="app-shell">
            <main className="app-main">
                {children}
            </main>

            {!isTransactions && (
                <nav className="bottom-nav">
                    <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
                        <IoHome className="nav-icon" />
                        <span className="nav-label">Home</span>
                    </NavLink>
                    <NavLink to="/goals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <IoTrophy className="nav-icon" />
                        <span className="nav-label">Goals</span>
                    </NavLink>
                    <button className="nav-item nav-fab" onClick={onQuickAdd}>
                        <div className="fab-btn">
                            <IoAdd />
                        </div>
                    </button>
                    <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <IoStatsChart className="nav-icon" />
                        <span className="nav-label">Analisis</span>
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <IoPerson className="nav-icon" />
                        <span className="nav-label">Profil</span>
                    </NavLink>
                </nav>
            )}
        </div>
    );
}
