import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Stats {
  logsCount: number;
  projectsCount: number;
  hoursCount: number;
  periodName: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [stats, setStats] = useState<Stats>({
    logsCount: 0,
    projectsCount: 0,
    hoursCount: 0,
    periodName: 'Nincs',
  });

  useEffect(() => {
    // Fetch user stats
    const fetchStats = async () => {
      if (!token || !user) return;

      try {
        // Fetch user's logs
        const logsResponse = await fetch(
          `http://localhost:3000/users/${user.id}/logs`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (logsResponse.ok) {
          const logs = await logsResponse.json();
          setStats((prev) => ({ ...prev, logsCount: logs.length }));
        }

        // Fetch user's projects
        const projectsResponse = await fetch(
          `http://localhost:3000/users/${user.id}/projects`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (projectsResponse.ok) {
          const projects = await projectsResponse.json();
          setStats((prev) => ({ ...prev, projectsCount: projects.length }));
        }

        // Fetch current work period
        const periodResponse = await fetch(
          'http://localhost:3000/work-periods/current',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (periodResponse.ok) {
          const period = await periodResponse.json();
          setStats((prev) => ({ ...prev, periodName: period.name || 'Aktív' }));
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [token, user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">📊</span>
              <span className="text-xl font-bold text-gray-800">
                Sprint Review App
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-gray-600">{user.fullName}</span>
              <button
                onClick={handleLogout}
                className="bg-authsch hover:bg-[#e55a2b] text-white font-semibold py-2 px-6 rounded-full transition-all duration-300"
              >
                Kijelentkezés
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Üdvözöllek! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Üdv {user.fullName}! Sikeres bejelentkezés az AuthSCH-val.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-3">📝</div>
            <div className="text-sm text-gray-500 mb-1">Logok</div>
            <div className="text-3xl font-bold text-gray-800">
              {stats.logsCount}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-3">📁</div>
            <div className="text-sm text-gray-500 mb-1">Projektek</div>
            <div className="text-3xl font-bold text-gray-800">
              {stats.projectsCount}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-3">⏱️</div>
            <div className="text-sm text-gray-500 mb-1">Munkaórák</div>
            <div className="text-3xl font-bold text-gray-800">
              {stats.hoursCount} óra
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-3">📅</div>
            <div className="text-sm text-gray-500 mb-1">Aktív Periódus</div>
            <div className="text-2xl font-bold text-gray-800">
              {stats.periodName}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Gyors műveletek
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="http://localhost:3000/api"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-center"
            >
              📚 API Dokumentáció
            </a>

            <button
              onClick={() => alert('Új log funkció hamarosan!')}
              className="bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              ➕ Új Log
            </button>

            <button
              onClick={() => alert('Statisztikák funkció hamarosan!')}
              className="bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              📊 Statisztikák
            </button>

            <button
              onClick={() => alert('Projektek funkció hamarosan!')}
              className="bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              📁 Projektek
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
