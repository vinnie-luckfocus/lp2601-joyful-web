import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Deep-link fallback: redirect to homepage with login modal open
    navigate('/?login=true', { replace: true });
  }, [navigate]);

  return null;
};

export default Login;
