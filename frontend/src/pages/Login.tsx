import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, token } = useAuth();

  useEffect(() => {
    // Check if JWT is in URL (from OAuth callback)
    const jwtFromUrl = searchParams.get('jwt');
    if (jwtFromUrl) {
      login(jwtFromUrl);
      navigate('/dashboard', { replace: true });
    }
  }, [searchParams, login, navigate]);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);

  const handleLogin = () => {
    // Redirect to backend AuthSCH login
    window.location.href = 'http://localhost:3000/auth/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
        <div className="text-6xl mb-6">📊</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          Sprint Review App
        </h1>
        <p className="text-gray-600 mb-10">
          Jelentkezz be az AuthSCH-val a folytatáshoz
        </p>

        <button
          onClick={handleLogin}
          className="w-full bg-authsch hover:bg-[#e55a2b] text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
        >
          🔐 Bejelentkezés AuthSCH-val
        </button>

        <div className="mt-10 bg-gray-50 rounded-2xl p-6 text-left">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Mi az AuthSCH?
          </h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <span className="text-primary font-bold mr-3">✓</span>
              <span>
                Egységes bejelentkezési rendszer a Schönherz közösségnek
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-primary font-bold mr-3">✓</span>
              <span>Biztonságos és gyors authentikáció</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary font-bold mr-3">✓</span>
              <span>SCH Account adatok használata</span>
            </li>
          </ul>
        </div>

        <a
          href="http://localhost:3000/api"
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-6 text-primary hover:text-primary-dark text-sm font-medium transition-colors"
        >
          📚 API Dokumentáció
        </a>
      </div>
    </div>
  );
};

export default Login;
